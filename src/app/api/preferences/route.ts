import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const API_KEY = process.env.CAREER_PILOT_API_KEY || 'career-pilot-secret-key';

// Helper to check if request is from n8n with API key
function isApiKeyValid(request: Request): boolean {
    const apiKey = request.headers.get('X-API-Key');
    return apiKey === API_KEY;
}

// Demo preferences
const DEMO_PREFERENCES = {
    email: 'demo@careerpilot.ai',
    filters: {
        minScore: 7,
        locations: ['Remote', 'San Francisco', 'New York'],
        salaryMin: 100000,
        salaryMax: 200000,
        jobTypes: ['Full-time', 'Remote', 'Contract'],
    },
    notifications: {
        emailEnabled: true,
        dailyDigest: true,
        instantAlerts: true,
        minScoreForAlert: 8,
    },
    profile: {
        name: 'Demo User',
        targetRole: 'AI Engineer',
        skills: 'n8n automation\nGemini 2.0 API\nNext.js, TypeScript',
        yearsExperience: 5,
        workHistory: 'Senior AI Automation Engineer at TechFlow (2020-2024). Lead developer for Gemini-based workflows.',
    },
};


export async function GET(request: Request) {
    if (isDemoMode) {
        return NextResponse.json(DEMO_PREFERENCES);
    }

    try {
        const { searchParams } = new URL(request.url);
        const requestUserId = searchParams.get('userId');

        let userId: string;
        let supabase;

        // Check for API key auth (from n8n)
        if (isApiKeyValid(request)) {
            if (!requestUserId) {
                return NextResponse.json({ error: 'userId parameter required for API key auth' }, { status: 400 });
            }
            supabase = await createAdminClient();
            userId = requestUserId;
        } else {
            // Browser session auth
            supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            userId = user.id;
        }

        // Get profile and preferences
        const [profileResult, prefsResult] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', userId).single(),
            supabase.from('preferences').select('*').eq('user_id', userId).single(),
        ]);

        const profile = profileResult.data;
        const prefs = prefsResult.data;

        return NextResponse.json({
            email: profile?.email || '',
            filters: {
                minScore: prefs?.min_score || 7,
                locations: prefs?.locations || [],
                salaryMin: prefs?.salary_min,
                salaryMax: prefs?.salary_max,
                jobTypes: prefs?.job_types || ['Full-time', 'Remote'],
            },
            notifications: {
                emailEnabled: prefs?.email_notifications ?? true,
                dailyDigest: prefs?.daily_digest ?? true,
                instantAlerts: prefs?.instant_alerts ?? false,
                minScoreForAlert: 8,
            },
            profile: {
                name: profile?.full_name || '',
                targetRole: profile?.target_role || '',
                skills: profile?.skills || '',
                yearsExperience: profile?.years_experience,
                workHistory: profile?.work_history || '',
            },
        });
    } catch (error) {
        console.error('Preferences error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    if (isDemoMode) {
        return NextResponse.json({ success: true, message: 'Demo mode - preferences not saved' });
    }

    try {
        // First get user from regular client for auth
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use admin client to bypass RLS for writes
        const adminClient = await createAdminClient();
        const prefs = await request.json();

        // Upsert profile (using admin to bypass RLS)
        const { error: profileError } = await adminClient
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email,
                full_name: prefs.profile?.name,
                target_role: prefs.profile?.targetRole,
                skills: prefs.profile?.skills,
                years_experience: prefs.profile?.yearsExperience,
                work_history: prefs.profile?.workHistory,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });

        if (profileError) {
            console.error('Profile upsert error:', profileError);
        }

        // Upsert preferences (using admin to bypass RLS)
        const { error: prefsError } = await adminClient
            .from('preferences')
            .upsert({
                user_id: user.id,
                min_score: prefs.filters?.minScore,
                locations: prefs.filters?.locations,
                salary_min: prefs.filters?.salaryMin,
                salary_max: prefs.filters?.salaryMax,
                job_types: prefs.filters?.jobTypes,
                email_notifications: prefs.notifications?.emailEnabled,
                daily_digest: prefs.notifications?.dailyDigest,
                instant_alerts: prefs.notifications?.instantAlerts,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        if (prefsError) {
            console.error('Preferences upsert error:', prefsError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update preferences error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

