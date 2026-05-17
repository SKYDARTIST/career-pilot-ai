import { createAdminClient, createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 60;

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const API_KEY = process.env.CAREER_PILOT_API_KEY;
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const MAX_JOBS_PER_RUN = 5;

type PreferencesPayload = {
    filters: {
        minScore: number;
        locations: string[];
        salaryMin?: number;
        salaryMax?: number;
        jobTypes: string[];
    };
    profile: {
        name: string;
        targetRole: string;
        skills: string;
        yearsExperience?: number;
        workHistory: string;
    };
};

type DiscoverRequest = {
    query?: string;
    location?: string;
    maxJobs?: number;
    userId?: string;
    preferences?: Partial<PreferencesPayload>;
};

type ParsedJob = {
    title: string;
    company: string;
    location: string;
    description: string;
    url: string;
    sourceId?: string;
    logoUrl?: string | null;
    postedAt?: string | null;
};

type GeminiResponse = {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>;
        };
    }>;
};

type DbRow = Record<string, unknown>;

type DbResult<T = DbRow> = {
    data: T | null;
    error: Error | null;
};

type DbQuery = {
    select(columns?: string): DbQuery;
    eq(column: string, value: unknown): DbQuery;
    limit(count: number): DbQuery;
    update(values: Record<string, unknown>): DbQuery;
    insert(values: Record<string, unknown>): DbQuery;
    single<T = DbRow>(): Promise<DbResult<T>>;
    maybeSingle<T = DbRow>(): Promise<DbResult<T>>;
};

type DiscoverDbClient = {
    from(table: string): DbQuery;
};

type ProfileRow = {
    full_name?: string | null;
    target_role?: string | null;
    skills?: string | null;
    years_experience?: number | null;
    work_history?: string | null;
};

type PreferencesRow = {
    min_score?: number | null;
    locations?: string[] | null;
    salary_min?: number | null;
    salary_max?: number | null;
    job_types?: string[] | null;
};

type SerpApiJob = {
    title?: string;
    company_name?: string;
    location?: string;
    description?: string;
    apply_link?: string;
    share_link?: string;
    job_id?: string;
    thumbnail?: string | null;
    detected_extensions?: {
        posted_at?: string | null;
    };
};

type ScoreResult = {
    thought_signature: string;
    score: number;
    reasoning_summary: string;
    decision: string;
    skills_overlap_percentage: number;
    matching_skills: string[];
    missing_skills: string[];
};

type CultureResult = {
    vibe_tags: string[];
    visual_findings: string;
    culture_summary: string;
    tailoring_advice: string;
};

type DiscoveryResult = {
    success: boolean;
    title: string;
    company: string;
    action?: 'created' | 'updated';
    score?: number;
    error?: string;
};

function isApiKeyValid(request: Request): boolean {
    const apiKey = request.headers.get('X-API-Key');
    return Boolean(API_KEY && apiKey === API_KEY);
}

function clampJobCount(value?: number) {
    if (!value || Number.isNaN(value)) return MAX_JOBS_PER_RUN;
    return Math.min(Math.max(Math.floor(value), 1), MAX_JOBS_PER_RUN);
}

function fillTemplate(template: string, values: Record<string, string>) {
    return Object.entries(values).reduce(
        (result, [key, value]) => result.replaceAll(`{{${key}}}`, value || ''),
        template
    );
}

function getGeminiText(response: GeminiResponse): string {
    return response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

function parseJsonText<T>(text: string, fallback: T): T {
    try {
        const cleaned = text.replace(/```json|```/g, '').trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        return JSON.parse(match ? match[0] : cleaned) as T;
    } catch {
        return fallback;
    }
}

async function loadPrompt(fileName: string) {
    return readFile(path.join(process.cwd(), 'prompts', fileName), 'utf8');
}

async function loadMasterResume() {
    return readFile(path.join(process.cwd(), 'data', 'master-resume.md'), 'utf8');
}

async function callGemini(prompt: string, options?: { json?: boolean; maxOutputTokens?: number }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: options?.json ? 0.3 : 0.5,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: options?.maxOutputTokens || 2048,
                    ...(options?.json ? { responseMimeType: 'application/json' } : {}),
                },
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API failed: ${response.status} ${errorText}`);
    }

    return getGeminiText(await response.json() as GeminiResponse);
}

async function fetchPreferences(supabase: DiscoverDbClient, userId: string, overrides?: Partial<PreferencesPayload>) {
    const [profileResult, prefsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single<ProfileRow>(),
        supabase.from('preferences').select('*').eq('user_id', userId).single<PreferencesRow>(),
    ]);

    const profile = profileResult.data;
    const prefs = prefsResult.data;

    return {
        filters: {
            minScore: overrides?.filters?.minScore ?? prefs?.min_score ?? 7,
            locations: overrides?.filters?.locations ?? prefs?.locations ?? [],
            salaryMin: overrides?.filters?.salaryMin ?? prefs?.salary_min ?? undefined,
            salaryMax: overrides?.filters?.salaryMax ?? prefs?.salary_max ?? undefined,
            jobTypes: overrides?.filters?.jobTypes ?? prefs?.job_types ?? ['Full-time', 'Remote'],
        },
        profile: {
            name: overrides?.profile?.name ?? profile?.full_name ?? '',
            targetRole: overrides?.profile?.targetRole ?? profile?.target_role ?? 'AI Engineer',
            skills: overrides?.profile?.skills ?? profile?.skills ?? '',
            yearsExperience: overrides?.profile?.yearsExperience ?? profile?.years_experience ?? undefined,
            workHistory: overrides?.profile?.workHistory ?? profile?.work_history ?? '',
        },
    } satisfies PreferencesPayload;
}

async function searchJobs(query: string, location: string, maxJobs: number) {
    const serpApiKey = process.env.SERPAPI_KEY;
    if (!serpApiKey) {
        throw new Error('SERPAPI_KEY is not configured');
    }

    const params = new URLSearchParams({
        engine: 'google_jobs',
        q: query,
        location,
        api_key: serpApiKey,
        num: String(maxJobs),
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
        next: { revalidate: 0 },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SerpAPI failed: ${response.status} ${errorText}`);
    }

    const data = await response.json() as { jobs_results?: SerpApiJob[] };
    return (data.jobs_results || []).slice(0, maxJobs).map((job) => ({
        title: job.title || '',
        company: job.company_name || '',
        location: job.location || '',
        description: job.description || 'Description not available.',
        url: job.apply_link || job.share_link || '',
        sourceId: job.job_id,
        logoUrl: job.thumbnail || null,
        postedAt: job.detected_extensions?.posted_at || null,
    })).filter((job) => job.title && job.company) as ParsedJob[];
}

async function saveJob(supabase: DiscoverDbClient, userId: string, job: ParsedJob, analysis: {
    score: number;
    reasoning: string;
    tags: string[];
    tailoredResume: string;
    coverLetter: string;
}) {
    const normalizedUrl = typeof job.url === 'string' && job.url.includes('?')
        ? job.url.split('?')[0]
        : job.url;

    let existingJob = null;

    if (normalizedUrl) {
        const existingByUrl = await supabase
            .from('jobs')
            .select('id')
            .eq('user_id', userId)
            .eq('url', normalizedUrl)
            .limit(1)
            .maybeSingle<{ id: string | number }>();

        existingJob = existingByUrl.data;
    }

    if (!existingJob) {
        const duplicateByTitle = await supabase
            .from('jobs')
            .select('id')
            .eq('user_id', userId)
            .eq('title', job.title)
            .eq('company', job.company)
            .limit(1)
            .maybeSingle<{ id: string | number }>();

        existingJob = duplicateByTitle.data;
    }

    const payload = {
        user_id: userId,
        title: job.title,
        company: job.company,
        url: normalizedUrl,
        score: Math.round(Number(analysis.score)),
        reasoning: analysis.reasoning,
        status: 'Found',
        tags: analysis.tags,
        tailored_resume: analysis.tailoredResume,
        cover_letter: analysis.coverLetter,
        updated_at: new Date().toISOString(),
    };

    if (existingJob) {
        const { data, error } = await supabase
            .from('jobs')
            .update(payload)
            .eq('id', existingJob.id)
            .select()
            .single();

        if (error) throw error;
        return { job: data, action: 'updated' as const };
    }

    const { data, error } = await supabase
        .from('jobs')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return { job: data, action: 'created' as const };
}

async function analyzeJob(job: ParsedJob, prefs: PreferencesPayload, prompts: {
    scorer: string;
    culture: string;
    tailoring: string;
    masterResume: string;
}) {
    const jobDescription = [
        `Title: ${job.title}`,
        `Company: ${job.company}`,
        `Location: ${job.location}`,
        `Posted: ${job.postedAt || 'Unknown'}`,
        '',
        job.description,
    ].join('\n');

    const scorerPrompt = `${fillTemplate(prompts.scorer, {
        target_role: prefs.profile.targetRole,
        skills: prefs.profile.skills,
    })}

MY PROFILE:
Name: ${prefs.profile.name}
Years Experience: ${prefs.profile.yearsExperience || ''}
Work History: ${prefs.profile.workHistory}

JOB POSTING:
${jobDescription}`;

    const culturePrompt = `${prompts.culture}

No image file is attached in this server-side demo route. Use the company name, logo URL if present, and JD text as the available evidence.

Company: ${job.company}
Logo URL: ${job.logoUrl || 'Not available'}
Job Description:
${jobDescription}`;

    const resumePrompt = `${fillTemplate(prompts.tailoring, {
        resume_content: prompts.masterResume,
        job_description: jobDescription,
    })}

Return only the # TAILORED RESUME section in Markdown. Do not include the cover letter.`;

    const coverLetterPrompt = `${fillTemplate(prompts.tailoring, {
        resume_content: prompts.masterResume,
        job_description: jobDescription,
    })}

Candidate Name: ${prefs.profile.name}
Return only the # COVER LETTER section in Markdown. Do not include the tailored resume.`;

    const [scoreText, cultureText, tailoredResume, coverLetter] = await Promise.all([
        callGemini(scorerPrompt, { json: true, maxOutputTokens: 2048 }),
        callGemini(culturePrompt, { json: true, maxOutputTokens: 1024 }),
        callGemini(resumePrompt, { maxOutputTokens: 3072 }),
        callGemini(coverLetterPrompt, { maxOutputTokens: 2048 }),
    ]);

    const scoreResult = parseJsonText<ScoreResult>(scoreText, {
        thought_signature: 'Gemini response could not be parsed as JSON.',
        score: 5,
        reasoning_summary: scoreText || 'No scoring response returned.',
        decision: 'MAYBE',
        skills_overlap_percentage: 0,
        matching_skills: [],
        missing_skills: [],
    });

    const cultureResult = parseJsonText<CultureResult>(cultureText, {
        vibe_tags: ['#General'],
        visual_findings: 'No parseable culture response returned.',
        culture_summary: cultureText || '',
        tailoring_advice: '',
    });

    const score = Math.min(Math.max(Math.round(Number(scoreResult.score) || 5), 1), 10);
    const tags = Array.isArray(cultureResult.vibe_tags) && cultureResult.vibe_tags.length > 0
        ? cultureResult.vibe_tags.slice(0, 5)
        : ['#General'];

    return {
        score,
        tags,
        tailoredResume: tailoredResume || 'N/A',
        coverLetter: coverLetter || 'N/A',
        reasoning: JSON.stringify({
            ...scoreResult,
            score,
            culture: cultureResult,
            model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
        }),
    };
}

export async function POST(request: Request) {
    if (isDemoMode) {
        return NextResponse.json({
            success: true,
            message: 'Demo mode is enabled. Discovery did not call external APIs or write jobs.',
            discovered: 0,
            saved: 0,
        });
    }

    try {
        const body = (await request.json().catch(() => ({}))) as DiscoverRequest;
        const maxJobs = clampJobCount(body.maxJobs);

        let supabase: DiscoverDbClient;
        let userId: string;

        if (isApiKeyValid(request)) {
            if (!body.userId) {
                return NextResponse.json({ error: 'userId required for API key auth' }, { status: 400 });
            }
            supabase = await createAdminClient() as unknown as DiscoverDbClient;
            userId = body.userId;
        } else {
            const browserClient = await createClient();
            const { data: { user } } = await browserClient.auth.getUser();

            if (!user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            userId = user.id;
            supabase = browserClient as unknown as DiscoverDbClient;
        }

        const prefs = await fetchPreferences(supabase, userId, body.preferences);
        const query = body.query || prefs.profile.targetRole || 'AI Engineer';
        const location = body.location || prefs.filters.locations[0] || 'United States';

        const [scorer, culture, tailoring, masterResume] = await Promise.all([
            loadPrompt('job-scorer.txt'),
            loadPrompt('culture-analyst.txt'),
            loadPrompt('tailoring-engine.txt'),
            loadMasterResume(),
        ]);

        const jobs = await searchJobs(query, location, maxJobs);
        const results: DiscoveryResult[] = await Promise.all(jobs.map(async (job) => {
            try {
                const analysis = await analyzeJob(job, prefs, {
                    scorer,
                    culture,
                    tailoring,
                    masterResume,
                });
                const saved = await saveJob(supabase, userId, job, analysis);

                return {
                    success: true,
                    action: saved.action,
                    title: job.title,
                    company: job.company,
                    score: analysis.score,
                };
            } catch (error) {
                return {
                    success: false,
                    title: job.title,
                    company: job.company,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
            }
        }));

        const saved = results.filter((result) => result.success).length;
        const created = results.filter((result) => result.success && result.action === 'created').length;
        const updated = results.filter((result) => result.success && result.action === 'updated').length;

        return NextResponse.json({
            success: true,
            query,
            location,
            model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
            discovered: jobs.length,
            saved,
            created,
            updated,
            failed: results.length - saved,
            results,
        });
    } catch (error) {
        console.error('Discover API error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Server error',
        }, { status: 500 });
    }
}
