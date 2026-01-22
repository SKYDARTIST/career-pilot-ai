import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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
        yearsExperience: 5,
    },
};

export async function GET() {
    if (isDemoMode) {
        return NextResponse.json(DEMO_PREFERENCES);
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get profile and preferences
        const [profileResult, prefsResult] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('preferences').select('*').eq('user_id', user.id).single(),
        ]);

        const profile = profileResult.data;
        const prefs = prefsResult.data;

        return NextResponse.json({
            email: profile?.email || user.email,
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
                yearsExperience: profile?.years_experience,
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
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const prefs = await request.json();

        // Update profile
        await supabase
            .from('profiles')
            .update({
                full_name: prefs.profile?.name,
                target_role: prefs.profile?.targetRole,
                years_experience: prefs.profile?.yearsExperience,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        // Update preferences
        await supabase
            .from('preferences')
            .update({
                min_score: prefs.filters?.minScore,
                locations: prefs.filters?.locations,
                salary_min: prefs.filters?.salaryMin,
                salary_max: prefs.filters?.salaryMax,
                job_types: prefs.filters?.jobTypes,
                email_notifications: prefs.notifications?.emailEnabled,
                daily_digest: prefs.notifications?.dailyDigest,
                instant_alerts: prefs.notifications?.instantAlerts,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update preferences error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
