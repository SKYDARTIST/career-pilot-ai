import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// This endpoint is called by n8n when a high-fit job is found
export async function POST(request: Request) {
    try {
        const job = await request.json();

        if (isDemoMode) {
            console.log('📧 DEMO MODE - Notification simulated for:', job.title);
            return NextResponse.json({
                success: true,
                message: 'Demo mode - notification simulated'
            });
        }

        const supabase = await createClient();

        // Get user preferences (this will use the service role in production for n8n calls)
        // For now, we'll check if there's a user_id in the job data
        const userId = job.user_id;

        if (!userId) {
            return NextResponse.json({
                success: false,
                reason: 'No user_id provided'
            });
        }

        const { data: prefs } = await supabase
            .from('preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single();

        if (!profile?.email) {
            return NextResponse.json({
                success: false,
                reason: 'No email configured'
            });
        }

        const score = job.score || 0;
        const minScore = prefs?.min_score || 8;

        if (score < minScore) {
            return NextResponse.json({
                success: false,
                reason: `Score ${score} below threshold ${minScore}`
            });
        }

        if (!prefs?.instant_alerts && !prefs?.email_notifications) {
            return NextResponse.json({
                success: false,
                reason: 'Email notifications disabled'
            });
        }

        // Here you would integrate with an email service like Resend
        // Example with Resend (requires RESEND_API_KEY in .env):
        /*
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'CareerPilot AI <notifications@careerpilot.app>',
          to: profile.email,
          subject: `🎯 High-Fit Job Alert: ${job.title} at ${job.company}`,
          html: `
            <h1>New High-Fit Job Found!</h1>
            <h2>${job.title} at ${job.company}</h2>
            <p><strong>Fit Score:</strong> ${job.score}/10</p>
            <p><strong>AI Analysis:</strong> ${job.reasoning}</p>
            <a href="https://careerpilot.app/jobs/${job.id}">View Details</a>
          `
        });
        */

        // For now, log the notification
        console.log(`📧 NOTIFICATION: High-fit job found!`);
        console.log(`   Title: ${job.title}`);
        console.log(`   Company: ${job.company}`);
        console.log(`   Score: ${score}`);
        console.log(`   Would send to: ${profile.email}`);

        return NextResponse.json({
            success: true,
            message: `Notification prepared for ${profile.email}`,
            job: { title: job.title, company: job.company, score }
        });

    } catch (error) {
        console.error('Notification error:', error);
        return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
    }
}

// GET endpoint to check notification settings
export async function GET() {
    if (isDemoMode) {
        return NextResponse.json({
            email: 'dem***',
            instantAlerts: true,
            dailyDigest: true,
            minScoreForAlert: 8
        });
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ configured: false });
        }

        const { data: prefs } = await supabase
            .from('preferences')
            .select('instant_alerts, daily_digest, email_notifications')
            .eq('user_id', user.id)
            .single();

        const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', user.id)
            .single();

        return NextResponse.json({
            email: profile?.email ? `${profile.email.substring(0, 3)}***` : null,
            instantAlerts: prefs?.instant_alerts || false,
            dailyDigest: prefs?.daily_digest || false,
            minScoreForAlert: 8
        });
    } catch (error) {
        return NextResponse.json({ configured: false });
    }
}
