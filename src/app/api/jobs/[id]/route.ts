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
    'demo-2': {
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
    'demo-3': {
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
    'demo-4': {
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
