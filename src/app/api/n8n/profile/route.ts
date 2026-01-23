import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const API_KEY = process.env.CAREER_PILOT_API_KEY || 'career-pilot-secret-key';

export async function GET(request: Request) {
    try {
        const apiKey = request.headers.get('X-API-Key');
        const isN8n = apiKey === API_KEY;

        // Use Admin Client for n8n to bypass RLS since n8n has no browser session
        const supabase = isN8n ? await createAdminClient() : await createClient();

        let userId: string;

        if (isN8n) {
            // For n8n, we grab the first profile
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(1);

            if (profileError || !profiles?.[0]) {
                return NextResponse.json({ error: 'No profile found. Please sign up in the app first.' }, { status: 404 });
            }
            userId = profiles[0].id;
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            userId = user.id;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        const { data: prefs } = await supabase
            .from('preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        return NextResponse.json({
            targetRole: profile?.target_role || 'AI Automation Engineer',
            skills: typeof profile?.skills === 'string' ? profile.skills.split('\n') : (profile?.skills || []),
            minScore: prefs?.min_score || 7,
            userName: profile?.full_name || 'User',
            workHistory: profile?.work_history || profile?.workHistory || ''
        });
    } catch (error) {
        console.error('N8N Profile API Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
