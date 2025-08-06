import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        // Create Supabase client
        const supabase = createRouteHandlerClient({ cookies });

        // Get all push subscriptions with creation date
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('id, profile_id, endpoint, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching subscriptions:', error);
            return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
        }

        return NextResponse.json({
            message: `Found ${subscriptions?.length || 0} subscriptions`,
            subscriptions: subscriptions || []
        });

    } catch (error) {
        console.error('Error fetching subscription data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
