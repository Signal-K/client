import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const SEND_TIMEOUT_MS = 8000;
const SEND_CONCURRENCY = 6;
const MAX_ENDPOINTS_PER_USER = 30;

type PushSubscriptionRow = {
    endpoint: string;
    auth: string;
    p256dh: string;
    profile_id: string;
};

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error(`Push send timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timeoutHandle) clearTimeout(timeoutHandle);
    }
}

async function mapWithConcurrency<T, R>(
    items: T[],
    concurrency: number,
    fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
    const results = new Array<R>(items.length);
    let currentIndex = 0;

    async function worker() {
        while (true) {
            const index = currentIndex++;
            if (index >= items.length) return;
            results[index] = await fn(items[index], index);
        }
    }

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
    await Promise.all(workers);
    return results;
}

export async function POST(request: NextRequest) {
    try {
        // Configure web-push with VAPID keys
        webpush.setVapidDetails(
            'mailto:admin@starsailors.app',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
            process.env.VAPID_PRIVATE_KEY!
        );

        // Get the discovery data and user info from the request
        const requestBody = await request.json().catch(() => ({}));
        const { userId, unclassifiedDiscoveries, customMessage } = requestBody;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Check if we're in Docker environment
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('127.0.0.1')
            ? process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('127.0.0.1', 'host.docker.internal')
            : process.env.NEXT_PUBLIC_SUPABASE_URL;
        
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

        // Handle custom messages (like deployment notifications)
        if (customMessage) {
            console.log('Processing custom message notification for user:', userId);
            
            // Get user's push subscriptions
            const { data: subscriptions, error: subError } = await supabase
                .from('push_subscriptions')
                .select('*')
                .eq('profile_id', userId)
                .order('created_at', { ascending: false });

            if (subError) {
                console.error('Error fetching subscriptions:', subError);
                return NextResponse.json({ 
                    error: 'Failed to fetch push subscriptions',
                    details: subError.message
                }, { status: 500 });
            }

            if (!subscriptions || subscriptions.length === 0) {
                return NextResponse.json({ 
                    message: 'User has no push subscriptions'
                });
            }

            // Deduplicate subscriptions by endpoint
            const uniqueSubscriptions = new Map();
            subscriptions.forEach(sub => {
                if (!uniqueSubscriptions.has(sub.endpoint)) {
                    uniqueSubscriptions.set(sub.endpoint, sub);
                }
            });

            const deduplicatedSubscriptions = Array.from(uniqueSubscriptions.values()).slice(0, MAX_ENDPOINTS_PER_USER);
            const skipped = Math.max(0, uniqueSubscriptions.size - deduplicatedSubscriptions.length);

            const payload = JSON.stringify({
                title: customMessage.title,
                body: customMessage.body,
                icon: 'https://github.com/Signal-K/client/blob/main/public/assets/Captn.jpg?raw=true',
                url: customMessage.url || '/structures/telescope'
            });

            // Send notifications to all user's unique endpoints
            const results = await mapWithConcurrency(deduplicatedSubscriptions, SEND_CONCURRENCY, async (subscription) => {
                try {
                    const pushSubscription = {
                        endpoint: subscription.endpoint,
                        keys: {
                            auth: subscription.auth,
                            p256dh: subscription.p256dh
                        }
                    };

                    await withTimeout(webpush.sendNotification(pushSubscription, payload), SEND_TIMEOUT_MS);
                    return { success: true, endpoint: subscription.endpoint };
                } catch (pushError) {
                    return { success: false, endpoint: subscription.endpoint, error: String(pushError) };
                }
            });

            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            return NextResponse.json({
                message: `Sent ${successful} custom notifications, ${failed} failed`,
                notificationsSent: successful,
                notificationsFailed: failed,
                attempted: deduplicatedSubscriptions.length,
                skipped
            });
        }

        if (!unclassifiedDiscoveries || unclassifiedDiscoveries.length === 0) {
            return NextResponse.json({ 
                message: 'No unclassified discoveries to notify about',
                unclassifiedCount: 0
            });
        }

        // Get user's push subscriptions
        const { data: subscriptions, error: subError } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('profile_id', userId)
            .order('created_at', { ascending: false });

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

        const deduplicatedSubscriptions = Array.from(uniqueSubscriptions.values()).slice(0, MAX_ENDPOINTS_PER_USER);
        const skipped = Math.max(0, uniqueSubscriptions.size - deduplicatedSubscriptions.length);

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


        // Send notifications to all user's unique endpoints
        const results = await mapWithConcurrency(deduplicatedSubscriptions, SEND_CONCURRENCY, async (subscription) => {
            try {
                const pushSubscription = {
                    endpoint: subscription.endpoint,
                    keys: {
                        auth: subscription.auth,
                        p256dh: subscription.p256dh
                    }
                };

                await withTimeout(webpush.sendNotification(pushSubscription, payload), SEND_TIMEOUT_MS);
                return { success: true, endpoint: subscription.endpoint };
            } catch (pushError) {
                return { success: false, endpoint: subscription.endpoint, error: String(pushError) };
            }
        });

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        return NextResponse.json({
            message: `Sent ${successful} notifications, ${failed} failed`,
            unclassifiedCount: discoveryCount,
            notificationsSent: successful,
            notificationsFailed: failed,
            attempted: deduplicatedSubscriptions.length,
            skipped,
            discoveries: unclassifiedDiscoveries
        });

    } catch (error) {
        console.error('Error in manual notification API:', error);
        return NextResponse.json({ 
            error: 'Internal server error' 
        }, { status: 500 });
    }
}
