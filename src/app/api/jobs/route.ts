import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const API_KEY = process.env.CAREER_PILOT_API_KEY || 'career-pilot-secret-key';

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

        const { data, error } = await supabase
            .from('jobs')
            .insert({
                user_id: userId,
                title: jobData.title,
                company: jobData.company,
                url: jobData.url,
                score: jobData.score,
                reasoning: jobData.reasoning,
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
            return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
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
