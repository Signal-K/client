import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const SEND_TIMEOUT_MS = 8000;
const SEND_CONCURRENCY = 8;
const MAX_NOTIFICATIONS_PER_REQUEST = 200;

type PushSubscriptionRow = {
    endpoint: string;
    auth: string;
    p256dh: string;
    profile_id: string;
};

function dedupeByEndpoint(subscriptions: PushSubscriptionRow[]) {
    const unique = new Map<string, PushSubscriptionRow>();
    for (const sub of subscriptions) {
        if (!unique.has(sub.endpoint)) unique.set(sub.endpoint, sub);
    }
    return Array.from(unique.values());
}

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
        // Configure web-push with your VAPID keys
        webpush.setVapidDetails(
            'mailto:admin@starsailors.app',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
            process.env.VAPID_PRIVATE_KEY!
        );

        // Check if we're in Docker environment
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('127.0.0.1')
            ? process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('127.0.0.1', 'host.docker.internal')
            : process.env.NEXT_PUBLIC_SUPABASE_URL;
        
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

        // Get all push subscriptions, but deduplicate by endpoint to avoid sending multiple notifications to the same device
        const { data: allSubscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*')
            .order('created_at', { ascending: false });

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

        const deduped = dedupeByEndpoint(allSubscriptions as PushSubscriptionRow[]);
        const subscriptions = deduped.slice(0, MAX_NOTIFICATIONS_PER_REQUEST);
        const skipped = Math.max(0, deduped.length - subscriptions.length);

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

        // Send notifications with bounded concurrency and timeout guards.
        const results = await mapWithConcurrency(subscriptions, SEND_CONCURRENCY, async (subscription) => {
            try {
                const pushSubscription = {
                    endpoint: subscription.endpoint,
                    keys: {
                        auth: subscription.auth,
                        p256dh: subscription.p256dh
                    }
                };

                await withTimeout(webpush.sendNotification(pushSubscription, payload), SEND_TIMEOUT_MS);
                return { success: true, userId: subscription.profile_id };
            } catch (error) {
                return { success: false, userId: subscription.profile_id, error: String(error) };
            }
        });

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        return NextResponse.json({
            message: `Sent ${successful} notifications successfully, ${failed} failed`,
            attempted: subscriptions.length,
            skipped,
            results
        });

    } catch (error) {
        console.error('Error sending test notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
