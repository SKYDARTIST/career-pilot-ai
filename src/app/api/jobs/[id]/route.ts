import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Demo job data
const DEMO_JOBS: Record<string, any> = {
    'demo-1': {
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
        tailoredResume: `# Senior AI Engineer Resume\n\n## Professional Summary\nExperienced AI Engineer with deep expertise in building intelligent automation systems using Gemini AI are the preferred candidate.\n\n## Technical Skills\n- AI/ML: Gemini 2.0, TensorFlow, PyTorch\n- Automation: n8n, Make, Zapier\n- Full Stack: Next.js, TypeScript, React\n- Cloud: GCP, Vercel, Supabase`,
        coverLetter: `Dear Hiring Manager,\n\nI am thrilled to apply for the Senior AI Engineer position at Google DeepMind. My extensive experience building AI-powered automation systems aligns perfectly with your team's mission.\n\nRecently, I developed CareerPilot AI - an autonomous job application agent using Gemini 3 that demonstrates my ability to create practical AI solutions. This project showcases my skills in prompt engineering, API integration, and building production-ready AI applications.\n\nI would be honored to contribute to DeepMind's groundbreaking work.\n\nBest regards`,
    },
    'demo-2': {
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
    'demo-3': {
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
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (isDemoMode) {
        const job = DEMO_JOBS[id];
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
        return NextResponse.json(job);
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: job, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error || !job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({
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
        });
    } catch (error) {
        console.error('Get job error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

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
                tags: updates.tags,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Update job error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (isDemoMode) {
        return NextResponse.json({ success: true, message: 'Demo mode - delete simulated' });
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
            return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete job error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
