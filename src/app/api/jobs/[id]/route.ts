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
        tailoredResume: "# JANE DOE\n## Senior AI Engineer & Automation Specialist\n\n**Professional Summary**\nInnovative AI Engineer with over 6 years of experience in developing and deploying large-scale machine learning models and autonomous agents. Expert in LLM orchestration, prompt engineering, and building agentic workflows using Google Gemini and n8n. Proven track record of reducing operational overhead by 40% through intelligent automation.\n\n**Technical Skills**\n- **AI/ML:** Google Gemini 1.5/2.0 Flash, OpenAI GPT-4, Llama 3, LangChain, AutoGen\n- **Automation:** n8n (Advanced custom nodes), Zapier, Make, Python (Boto3, Requests)\n- **Full-Stack:** Next.js 15, React 19, TypeScript, Node.js, Tailwind CSS\n- **Backend/Data:** Supabase, PostgreSQL, Pinecone, Redis, Docker\n- **Cloud:** GCP (Vertex AI), AWS (Bedrock), Vercel\n\n**Professional Experience**\n\n**CareerPilot AI (Project Lead)** | *Oct 2025 – Present*\n- Designed and implemented an autonomous job application agent using Gemini 2.0 Flash.\n- Built a high-concurrency n8n workflow engine to scan 50+ job boards 24/7.\n- Developed a Next.js 15 dashboard for real-time visualization of market signals and AI reasoning.\n- Implemented dynamic resume tailoring and cover letter generation with 95% user satisfaction.\n\n**TechScale Solutions (Lead Engineer)** | *Jan 2022 – Sep 2025*\n- Orchestrated internal LLM pipelines for automated customer support, saving 1,200 human hours monthly.\n- Integrated multi-modal AI capabilities into legacy document processing systems.\n- Led a team of 5 developers in migrating monolithic applications to modern serverless architectures on GCP.\n\n**Education**\n- **M.S. in Computer Science (AI Specialization)** | Stanford University\n- **B.S. in Software Engineering** | MIT\n\n**Certifications**\n- Google Professional Machine Learning Engineer\n- AWS Certified Solutions Architect – Professional",
        coverLetter: "Dear Hiring Manager at Google DeepMind,\n\nI am writing to express my enthusiastic interest in the Senior AI Engineer position. With a deep background in LLM orchestration and a passion for building autonomous systems that solve real-world problems, I have followed DeepMind’s work in AGI and multi-modal intelligence with great admiration. \n\nRecently, I spearheaded the development of CareerPilot AI, an autonomous application agent built on the Gemini 2.0 Flash architecture. This project wasn’t just about making job applications easier; it was about pushing the boundaries of how agents can perceive, reason, and act within complex web environments. By integrating a sophisticated n8n automation layer with the reasoning capabilities of Gemini, I achieved a system that independently identifies high-value opportunities and crafts perfectly tailored responses—matching the nuance of a human recruiter while operating at 100x the speed.\n\nMy experience aligns precisely with DeepMind’s requirements for engineers who can bridge the gap between abstract research and production-grade AI infrastructure. I am particularly excited about the prospect of applying my expertise in low-latency inference and agentic decision-tree logic to the core infrastructure team. \n\nI am eager to bring my unique blend of full-stack engineering and deep AI specialization to Google DeepMind. Thank you for your time and consideration. I look forward to the possibility of discussing how my experience with the Gemini ecosystem can contribute to your team's mission.\n\nBest Regards,\n\nJane Doe",
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
        tailoredResume: "# JANE DOE\n## Product-Focused Full Stack Developer\n\n**Objective**\nVersatile Full Stack Developer with 5+ years of experience building scalable AI-integrated web applications. Expert in TypeScript and Next.js, focused on delivering world-class user experiences for cutting-edge AI products.\n\n**Technical Expertise**\n- **Frontend:** React 19, Next.js 15 (App Router), Tailwind CSS, Framer Motion\n- **Backend:** Node.js, NestJS, Supabase, Prisma\n- **AI Integration:** OpenAI API (Realtime, Whisper, DALL-E), Vector Databases\n- **DevOps:** CI/CD (GitHub Actions), AWS Lambda, Docker\n\n**Selected Experience**\n\n**CareerPilot AI** | *Lead Frontend Developer*\n- Designed a high-performance React dashboard with zero-latency updates for AI reasoning feeds.\n- Optimized data fetching patterns with React Server Components, reducing initial load time by 60%.\n- Integrated complex AI outputs into a clean, intuitive 'Reasoning Explainer' component.\n\n**AppGlow Dynamics** | *Senior Software Engineer*\n- Built a real-time collaborative workspace used by 100k+ active monthly users.\n- Implemented end-to-end encryption for AI-assisted chat features using WebCrypto API.\n- Scaled backend infrastructure to handle 5k+ concurrent WebSocket connections.\n\n**Core Values**\nIterative development, user-centric design, and performance-first architecture.",
        coverLetter: "To the OpenAI Product Team,\n\nOpenAI has redefined the relationship between humans and computing, and I am eager to contribute to that mission as a Full Stack Developer. My background is rooted in the belief that the most powerful AI is useless without an interface that makes it accessible and intuitive.\n\nIn my recent work on CareerPilot AI, I focused on the 'Explainability' problem. While the AI generates incredible results, users need to trust the logic behind those results. I built a dynamic visualization layer that breaks down complex LLM reasoning into actionable insights like 'Skill Overlap' and 'Market Flags.' This approach to AI product design—prioritizing transparency and user delight—is exactly what I plan to bring to OpenAI.\n\nI am a fast-moving, product-minded engineer who thrives in high-stakes environments. I look forward to the chance to help define the next generation of AI-native user interfaces with OpenAI.\n\nSincerely,\n\nJane Doe",
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
        tailoredResume: "# JANE DOE\n## Automation & Workflow Orchestrator\n\n**Professional Profile**\nSpecialist in 'Agentic Automation'—the intersection of LLMs and complex workflow engines. Expertise in creating self-healing API integrations and autonomous data pipelines.\n\n**Automation Toolkit**\n- **Workflow Engines:** n8n (Advanced), Zapier, Make, Airflow\n- **Languages:** JavaScript/TypeScript, Python, Shell Scripting\n- **Integrations:** REST/GraphQL, Webhooks, OAuth2, gRPC\n- **AI:** Gemini Flash, GPT-4o-mini (Cost-optimized automation)\n\n**Key Achievements**\n\n**CareerPilot AI Automation Core**\n- Developed a complex n8n network that simulates human-like job searching, including site navigation and form submission.\n- Implemented a 'Self-Correcting Pipeline' where Gemini identifies failed API calls and triggers repair workflows.\n- Reduced manual data entry for user profiles by 100% through autonomous LinkedIn scraping.\n\n**Enterprise Flow Inc.**\n- Architected an internal automation hub that connected 50+ disparate SaaS tools for a Fortune 500 client.\n- Reduced 'Time to Ticket Resolution' by 70% through automated triage and smart routing.",
        coverLetter: "Hi Zapier Team,\n\nI don't just use automation; I live it. For the past year, I've been building CareerPilot AI, a project aimed at making the job search as 'Zappier' as possible. I’ve reached the limits of standard integrations and started building custom n8n nodes and agentic loops that can handle non-deterministic tasks.\n\nJoining Zapier would be a homecoming for me. I love the challenge of making 'hard things easy' through clever orchestration. I’m particularly interested in how Zapier is integrating AI into the core 'Trigger/Action' model, and I have several ideas from my work with Gemini on how to make these flows even smarter.\n\nI’m a remote-first advocate and a builder at heart. Let’s automate the boring stuff together.\n\nCheers,\n\nJane Doe",
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
        tailoredResume: "# JANE DOE\n## AI Solutions Architect\n\n**Strategy & Architecture**\nForward-thinking Architect with a focus on Enterprise AI Digital Transformation. Expert in designing secure, scalable, and ethical AI systems for global organizations.\n\n**Architectural Competencies**\n- **AI Design:** RAG Architectures, Fine-tuning strategies, AI Governance\n- **Systems:** Distributed Systems, Microservices, Event-Driven Architecture\n- **Security:** AI Privacy, SOC2 Compliance for LLMs, Data Residency\n- **Methodology:** DDD, Agile, TDD\n\n**Strategic Impact**\n\n**CareerPilot AI (Architecture Design)**\n- Designed a secure multi-tenant architecture for handling sensitive user career data.\n- Implemented a cost-aware AI routing system that switches between Gemini 1.5 Pro and Flash based on task complexity.\n- Established a modular prompt-management system that allows for rapid iteration of tailoring logic.\n\n**Global Systems Corp**\n- Led the AI Readiness assessment for a 10,000-employee firm, resulting in a 3-year AI roadmap.\n- Designed a centralized 'AI Gateway' project to manage API costs and security across 15 departments.",
        coverLetter: "Dear Microsoft Talent Team,\n\nAs the world shifts toward an 'AI-first' enterprise model, I am eager to join Microsoft as an AI Solutions Architect. My career has been dedicated to answering the question: 'How do we make AI scale securely?'\n\nIn building CareerPilot AI, I tackled the architectural challenges of agentic systems—specifically around state management and reliability. While my current stack is centered on modern startup tools, my design philosphy is deeply enterprise-aligned. I prioritize modularity, security-by-design, and clear ROI metrics. I am excited to translate these patterns into the Azure and Microsoft 365 ecosystems.\n\nI look forward to discussing how my strategic vision for autonomous agents can help Microsoft's partners transform their businesses.\n\nRespectfully,\n\nJane Doe",
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
