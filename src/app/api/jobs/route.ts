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
        reasoning: JSON.stringify({
            "thought_process": "Candidate's deep experience with LLM orchestration and Gemini API aligns perfectly with the DeepMind product roadmap. Their background in n8n automation provides a unique edge for internal tool development.",
            "score": 9,
            "reasoning_summary": "Exceptional match for core AI infrastructure team.",
            "matching_skills": ["Gemini API", "LLMs", "n8n", "TypeScript", "Python"],
            "missing_skills": ["C++", "JAX"],
            "green_flags": ["Experience with state-of-the-art models", "Strong automation background"],
            "red_flags": [],
            "skills_overlap_percentage": 85
        }),
        status: 'Found',
        tags: ['#AI', '#DeepMind', '#HighFit'],
        notes: 'Priority target. Gemini integration is the core focus here.',
        url: 'https://careers.google.com',
        tailoredResume: "# Resume: AI Specialist\n\n**Customized for Google DeepMind**\n\n- Highlighted 3+ years of LLM orchestration\n- Emphasized Gemini 1.5/2.0 Flash integration\n- Added n8n workflow automation section.",
        coverLetter: "Dear Hiring Manager,\n\nI am thrilled to apply for the Senior AI Engineer position. My work with CareerPilot AI demonstrates my ability to build autonomous agents using Gemini 2.0 Flash...",
        createdAt: new Date().toISOString(),
    },
    {
        id: 'demo-2',
        title: 'Full Stack Developer - AI Products',
        company: 'OpenAI',
        score: 8,
        reasoning: JSON.stringify({
            "thought_process": "Strong frontend background with Next.js is a plus. The candidate has built functional AI wrappers, but lacks direct experience with RLF (Reinforcement Learning from Feedback).",
            "score": 8,
            "reasoning_summary": "Strong technical fit for product-facing AI roles.",
            "matching_skills": ["Next.js", "React", "TypeScript", "Node.js"],
            "missing_skills": ["PyTorch", "Rust"],
            "green_flags": ["Product-minded developer", "Clean code architecture"],
            "red_flags": ["Lacks low-level ML experience"],
            "skills_overlap_percentage": 75
        }),
        status: 'Applied',
        tags: ['#Product', '#AI', '#NextJS'],
        notes: 'Follow up in 3 days if no response.',
        url: 'https://openai.com/careers',
        tailoredResume: "# Resume: Full Stack AI Engineer\n\n**Customized for OpenAI**\n\n- Focused on React 19 and Next.js 15 features\n- Detailed implementation of real-time streaming APIs\n- Highlighted Supabase backend integration.",
        coverLetter: "To the OpenAI Product Team,\n\nYour focus on iterative deployment of AI tools resonates with my approach to building CareerPilot AI...",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 'demo-3',
        title: 'Automation Engineer',
        company: 'Zapier',
        score: 9,
        reasoning: JSON.stringify({
            "thought_process": "This is a direct skill match. The candidate is essentially building a competitor to Zapier's internal automation logic with n8n. Easy transition.",
            "score": 9,
            "reasoning_summary": "Perfect alignment with Zapier's core mission.",
            "matching_skills": ["n8n", "APIs", "Webhooks", "Node.js"],
            "missing_skills": ["Ruby"],
            "green_flags": ["Automation expert", "Remote-first advocate"],
            "red_flags": [],
            "skills_overlap_percentage": 95
        }),
        status: 'Interviewing',
        tags: ['#Automation', '#Remote', '#n8n'],
        notes: 'First round scheduled for Thursday. Focus on scalability of n8n workflows.',
        url: 'https://zapier.com/jobs',
        tailoredResume: "# Resume: Automation Specialist\n\n**Customized for Zapier**\n\n- Emphasized 'No-Code/Low-Code' expertise\n- Detailed custom node development in n8n\n- Showcased multi-API orchestration projects.",
        coverLetter: "Hi Zapier Team,\n\nI've been a power user of your platform for years, and now I'm building agentic workflows that complement your ecosystem...",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
        id: 'demo-4',
        title: 'AI Solutions Architect',
        company: 'Microsoft',
        score: 7,
        reasoning: JSON.stringify({
            "thought_process": "Candidate has the vision, but this role is heavily skewed towards Azure and Enterprise Cloud components. Transition from startup stack (Supabase/Vercel) will require some ramp-up.",
            "score": 7,
            "reasoning_summary": "Good strategic fit, technical stack adjustment needed.",
            "matching_skills": ["AI Strategy", "System Design", "TypeScript"],
            "missing_skills": ["Azure", "C#", ".NET"],
            "green_flags": ["Strong architecture vision", "Excellent communication"],
            "red_flags": ["No Azure experience"],
            "skills_overlap_percentage": 60
        }),
        status: 'Found',
        tags: ['#Enterprise', '#Azure', '#Architect'],
        notes: 'Informal coffee chat scheduled with recruiter.',
        url: 'https://careers.microsoft.com',
        tailoredResume: "# Resume: AI Solutions Architect\n\n**Customized for Microsoft**\n\n- Shifted focus to Enterprise AI governance\n- Highlighted security and scalability in CareerPilot AI\n- Emphasized high-level system design patterns.",
        coverLetter: "Dear Microsoft Talent Team,\n\nI am eager to bring my experience in building agentic AI systems to the Azure ecosystem...",
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
