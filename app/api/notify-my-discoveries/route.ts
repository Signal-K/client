import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
    'mailto:admin@starsailors.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        // Get the discovery data and user info from the request
        const requestBody = await request.json();
        const { userId, unclassifiedDiscoveries } = requestBody;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        if (!unclassifiedDiscoveries || unclassifiedDiscoveries.length === 0) {
            return NextResponse.json({ 
                message: 'No unclassified discoveries to notify about',
                unclassifiedCount: 0
            });
        }

        // Create Supabase client with service role for admin access to push subscriptions
        console.log('Environment check:');
        console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
        console.log('VAPID_PUBLIC_KEY exists:', !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
        console.log('VAPID_PRIVATE_KEY exists:', !!process.env.VAPID_PRIVATE_KEY);
        
        // Check if we're in Docker environment
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('127.0.0.1') 
            ? process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('127.0.0.1', 'host.docker.internal') 
            : process.env.NEXT_PUBLIC_SUPABASE_URL;
            
        console.log('Using Supabase URL:', supabaseUrl);
        
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ 
                error: 'Missing required environment variables',
                details: {
                    hasUrl: !!supabaseUrl,
                    hasServiceKey: !!serviceRoleKey
                }
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        console.log('Fetching push subscriptions for user:', userId);

        // Get user's push subscriptions
        const { data: subscriptions, error: subError } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('profile_id', userId)
            .order('created_at', { ascending: false });

        console.log('Supabase response:', { data: subscriptions, error: subError });

        if (subError) {
            console.error('Error fetching subscriptions:', subError);
            return NextResponse.json({ 
                error: 'Failed to fetch push subscriptions',
                details: subError.message,
                code: subError.code,
                hint: subError.hint
            }, { status: 500 });
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ 
                message: 'User has no push subscriptions',
                unclassifiedCount: unclassifiedDiscoveries.length
            });
        }

        // Deduplicate subscriptions by endpoint
        const uniqueSubscriptions = new Map();
        subscriptions.forEach(sub => {
            if (!uniqueSubscriptions.has(sub.endpoint)) {
                uniqueSubscriptions.set(sub.endpoint, sub);
            }
        });

        const deduplicatedSubscriptions = Array.from(uniqueSubscriptions.values());
        console.log(`Deduplicated from ${subscriptions.length} to ${deduplicatedSubscriptions.length} unique endpoints`);

        // Create notification message
        const discoveryCount = unclassifiedDiscoveries.length;
        const title = discoveryCount === 1 
            ? 'New Discovery Awaits Classification!'
            : `${discoveryCount} New Discoveries Await Classification!`;
        
        const firstDiscovery = unclassifiedDiscoveries[0];
        const messageBody = discoveryCount === 1
            ? `Classify your discovery: ${firstDiscovery.name || `Discovery #${firstDiscovery.anomalyId}`}`
            : `You have ${discoveryCount} unclassified discoveries waiting for analysis`;

        const payload = JSON.stringify({
            title,
            body: messageBody,
            icon: 'https://github.com/Signal-K/client/blob/main/public/assets/Captn.jpg?raw=true',
            url: '/structures/telescope'
        });

        console.log(`Sending discovery notifications to ${deduplicatedSubscriptions.length} subscribers`);

        // Send notifications to all user's unique endpoints
        const results = await Promise.all(
            deduplicatedSubscriptions.map(async (subscription) => {
                try {
                    const pushSubscription = {
                        endpoint: subscription.endpoint,
                        keys: {
                            auth: subscription.auth,
                            p256dh: subscription.p256dh
                        }
                    };

                    await webpush.sendNotification(pushSubscription, payload);
                    console.log(`Sent notification to user ${subscription.profile_id}`);
                    return { success: true, endpoint: subscription.endpoint };
                } catch (pushError) {
                    console.error(`Failed to send notification to user ${subscription.profile_id}:`, pushError);
                    return { success: false, endpoint: subscription.endpoint, error: String(pushError) };
                }
            })
        );

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        return NextResponse.json({
            message: `Sent ${successful} notifications, ${failed} failed`,
            unclassifiedCount: discoveryCount,
            notificationsSent: successful,
            notificationsFailed: failed,
            discoveries: unclassifiedDiscoveries
        });

    } catch (error) {
        console.error('Error in manual notification API:', error);
        return NextResponse.json({ 
            error: 'Internal server error' 
        }, { status: 500 });
    }
}
