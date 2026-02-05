import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const API_KEY = process.env.CAREER_PILOT_API_KEY;

// Validate API key is configured (skip in demo mode)
if (!isDemoMode && !API_KEY) {
    console.warn('WARNING: CAREER_PILOT_API_KEY is not configured. API key authentication will fail.');
}

// Helper to check if request is from n8n with API key
function isApiKeyValid(request: Request): boolean {
    const apiKey = request.headers.get('X-API-Key');
    return apiKey === API_KEY;
}

// Demo data for hackathon demo mode
const DEMO_JOBS = [
    {
        id: 'demo-1',
        title: 'Senior AI Engineer',
        company: 'Google DeepMind',
        score: 9,
        reasoning: 'Perfect match for your Gemini and n8n automation experience. The role requires AI/ML expertise which aligns perfectly with your background.',
        status: 'Found',
        tags: ['#AI', '#Remote', '#Startup'],
        notes: '',
        url: 'https://careers.google.com',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'demo-2',
        title: 'Full Stack Developer - AI Products',
        company: 'OpenAI',
        score: 8,
        reasoning: 'Strong fit - your Next.js and TypeScript skills are highly relevant. The AI product focus matches your interests.',
        status: 'Applied',
        tags: ['#AI', '#TypeScript', '#Next.js'],
        notes: 'Submitted application on Monday',
        url: 'https://openai.com/careers',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 'demo-3',
        title: 'Automation Engineer',
        company: 'Zapier',
        score: 9,
        reasoning: 'Excellent match! n8n and automation expertise directly applicable. Remote-first culture aligns with preferences.',
        status: 'Interviewing',
        tags: ['#Automation', '#Remote', '#n8n'],
        notes: 'First round scheduled for Thursday',
        url: 'https://zapier.com/jobs',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
        id: 'demo-4',
        title: 'AI Solutions Architect',
        company: 'Microsoft',
        score: 7,
        reasoning: 'Good fit - AI architecture role, though enterprise focus may differ from startup preference.',
        status: 'Found',
        tags: ['#AI', '#Enterprise', '#Cloud'],
        notes: '',
        url: 'https://careers.microsoft.com',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
];

export async function GET() {
    // Demo mode: return sample data
    if (isDemoMode) {
        return NextResponse.json(DEMO_JOBS);
    }

    // Production: fetch from Supabase
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching jobs:', error);
            return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
        }

        // Transform to match frontend expectations
        const transformedJobs = jobs.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company,
            score: job.score,
            reasoning: job.reasoning,
            status: job.status,
            tags: job.tags || [],
            notes: job.notes,
            url: job.url,
            createdAt: job.created_at,
            updatedAt: job.updated_at,
            tailoredResume: job.tailored_resume,
            coverLetter: job.cover_letter,
        }));

        return NextResponse.json(transformedJobs);
    } catch (error) {
        console.error('Jobs API error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (isDemoMode) {
        return NextResponse.json({ success: true, message: 'Demo mode - job not saved' });
    }

    try {
        const jobData = await request.json();
        let userId: string;
        let supabase;

        // Check for API key auth (from n8n)
        if (isApiKeyValid(request)) {
            // Use admin client to bypass RLS
            supabase = await createAdminClient();
            // n8n must provide user_id in the request body
            if (!jobData.user_id) {
                return NextResponse.json({ error: 'user_id required for API key auth' }, { status: 400 });
            }
            userId = jobData.user_id;
        } else {
            // Browser session auth
            supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            userId = user.id;
        }

        // Fetch user's min_score preference
        const { data: prefs } = await supabase
            .from('preferences')
            .select('min_score')
            .eq('user_id', userId)
            .single();

        // Force min score to 0 for hackathon to ensure all jobs are saved
        const minScore = 0;

        if (jobData.score < minScore) {
            return NextResponse.json({
                success: false,
                message: `Job score ${jobData.score} is below your minimum threshold of ${minScore}. Job not saved.`,
                skipped: true
            }, { status: 200 }); // Return 200 so n8n doesn't error out
        }

        // Clean reasoning if it contains markdown markers
        let cleanReasoning = jobData.reasoning || '';
        if (typeof cleanReasoning === 'string') {
            cleanReasoning = cleanReasoning.replace(/```json\n?|```/g, '').trim();
        }

        // URL Normalization: Remove query parameters for cleaner comparison
        let normalizedUrl = jobData.url || '';
        if (typeof normalizedUrl === 'string' && normalizedUrl.includes('?')) {
            normalizedUrl = normalizedUrl.split('?')[0];
        }

        // Check if job already exists (deduplication)
        // Strategy: Check by normalized URL first, then fallback to Title + Company
        let { data: existingJob } = await supabase
            .from('jobs')
            .select('id')
            .eq('user_id', userId)
            .eq('url', normalizedUrl)
            .limit(1)
            .maybeSingle();

        if (!existingJob) {
            // Secondary check: Title + Company (highly likely the same job if both match for the same user)
            const { data: duplicateByTitle } = await supabase
                .from('jobs')
                .select('id')
                .eq('user_id', userId)
                .eq('title', jobData.title)
                .eq('company', jobData.company)
                .limit(1)
                .maybeSingle();

            if (duplicateByTitle) {
                existingJob = duplicateByTitle;
            }
        }

        if (existingJob) {
            // Update existing job instead of creating a new one
            const { data, error } = await supabase
                .from('jobs')
                .update({
                    title: jobData.title,
                    company: jobData.company,
                    score: Math.round(Number(jobData.score)),
                    reasoning: cleanReasoning,
                    status: jobData.status || 'Found',
                    tags: jobData.tags || [],
                    notes: jobData.notes,
                    url: normalizedUrl, // Save the normalized URL
                    tailored_resume: jobData.tailoredResume,
                    cover_letter: jobData.coverLetter,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existingJob.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating existing job:', error);
                return NextResponse.json({ error: 'Failed to update existing job', details: error }, { status: 500 });
            }

            return NextResponse.json({ ...data, message: 'Existing job updated' });
        }

        const { data, error } = await supabase
            .from('jobs')
            .insert({
                user_id: userId,
                title: jobData.title,
                company: jobData.company,
                url: normalizedUrl, // Save the normalized URL
                score: Math.round(Number(jobData.score)),
                reasoning: cleanReasoning,
                status: jobData.status || 'Found',
                tags: jobData.tags || [],
                notes: jobData.notes,
                tailored_resume: jobData.tailoredResume,
                cover_letter: jobData.coverLetter,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating job:', error);
            return NextResponse.json({ error: 'Failed to create job', details: error }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Create job error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    if (isDemoMode) {
        return NextResponse.json({ success: true, message: 'Demo mode - update simulated' });
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updates = await request.json();

        const { data, error } = await supabase
            .from('jobs')
            .update({
                status: updates.status,
                notes: updates.notes,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating job:', error);
            return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Update job error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    if (isDemoMode) {
        return NextResponse.json({ success: true, message: 'Demo mode - deletion simulated' });
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting job:', error);
            return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete job error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
