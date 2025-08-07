import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
    try {
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
        
        if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ 
                error: 'Missing required environment variables',
                details: {
                    hasUrl: !!supabaseUrl,
                    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
                }
            }, { status: 500 });
        }
        
        // Create Supabase client with service role for admin access
        const supabase = createClient(
            supabaseUrl,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        console.log('Attempting to fetch subscriptions...');
        
        // Get all push subscriptions, but deduplicate by endpoint to avoid sending multiple notifications to the same device
        const { data: allSubscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*')
            .order('created_at', { ascending: false });

        console.log('Supabase response:', { data: allSubscriptions, error });

        if (error) {
            console.error('Error fetching subscriptions:', error);
            return NextResponse.json({ 
                error: 'Failed to fetch subscriptions', 
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 });
        }

        if (!allSubscriptions || allSubscriptions.length === 0) {
            return NextResponse.json({ message: 'No subscriptions found' }, { status: 200 });
        }

        // Deduplicate by endpoint - keep only the most recent subscription for each unique endpoint
        const uniqueEndpoints = new Map();
        allSubscriptions.forEach(sub => {
            if (!uniqueEndpoints.has(sub.endpoint)) {
                uniqueEndpoints.set(sub.endpoint, sub);
            }
        });
        
        const subscriptions = Array.from(uniqueEndpoints.values());
        console.log(`Deduplicated from ${allSubscriptions.length} to ${subscriptions.length} unique endpoints`);

        // Parse request body for custom message
        const body = await request.json().catch(() => ({}));
        const title = body.title || 'Test Notification';
        const message = body.message || 'This is a test push notification!';
        const url = body.url || '/';

        const payload = JSON.stringify({
            title,
            body: message,
            url,
            icon: 'https://github.com/Signal-K/client/blob/main/public/assets/Captn.jpg?raw=true'
        });

        console.log(`Sending test notification to ${subscriptions.length} subscribers`);

        // Send notifications to all subscribers
        const promises = subscriptions.map(async (subscription) => {
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
                return { success: true, userId: subscription.profile_id };
            } catch (error) {
                console.error(`Failed to send notification to user ${subscription.profile_id}:`, error);
                return { success: false, userId: subscription.profile_id, error: String(error) };
            }
        });

        const results = await Promise.all(promises);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        return NextResponse.json({
            message: `Sent ${successful} notifications successfully, ${failed} failed`,
            results
        });

    } catch (error) {
        console.error('Error sending test notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
