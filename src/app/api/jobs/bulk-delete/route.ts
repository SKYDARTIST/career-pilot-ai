import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export async function POST(request: Request) {
    if (isDemoMode) {
        return NextResponse.json({ success: true, message: 'Demo mode - bulk deletion simulated' });
    }

    try {
        const { ids } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'IDs array required' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Filter out demo IDs which are not in the database and would cause UUID format errors
        const realIds = ids.filter(id => typeof id === 'string' && !id.startsWith('demo-'));

        if (realIds.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: 'Only demo items detected' });
        }

        const { error } = await supabase
            .from('jobs')
            .delete()
            .in('id', realIds)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error in bulk delete:', error);
            return NextResponse.json({ error: 'Failed to delete jobs' }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error) {
        console.error('Bulk delete API error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
