import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const SEND_TIMEOUT_MS = 8000;
const SEND_CONCURRENCY = 6;
const USER_CONCURRENCY = 4;
const MAX_USERS_PER_RUN = 120;
const MAX_ENDPOINTS_PER_USER = 20;

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
        // Configure web-push with VAPID keys
        webpush.setVapidDetails(
            'mailto:admin@starsailors.app',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
            process.env.VAPID_PRIVATE_KEY!
        );

        // This endpoint is for automated workflows, so we need service role access
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ 
                error: 'Missing required environment variables' 
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        console.log('Auto-checking for unclassified discoveries...');

        // Get all users who have push subscriptions
        const { data: allSubscriptions, error: subError } = await supabase
            .from('push_subscriptions')
            .select('profile_id')
            .order('created_at', { ascending: false });

        if (subError) {
            console.error('Error fetching subscriptions:', subError);
            return NextResponse.json({ 
                error: 'Failed to fetch push subscriptions' 
            }, { status: 500 });
        }

        if (!allSubscriptions || allSubscriptions.length === 0) {
            return NextResponse.json({ 
                message: 'No push subscriptions found'
            });
        }

        // Get unique user IDs
        const userIds = [...new Set(allSubscriptions.map(sub => sub.profile_id))].slice(0, MAX_USERS_PER_RUN);
        console.log(`Found ${userIds.length} unique users with push subscriptions`);

        const perUserResults = await mapWithConcurrency(userIds, USER_CONCURRENCY, async (userId) => {
            try {
                // Get user's linked anomalies
                const { data: linkedAnomalies, error: linkedError } = await supabase
                    .from('linked_anomalies')
                    .select('id, author, anomaly_id, date, automaton')
                    .eq('author', userId)
                    .order('date', { ascending: false });

                if (linkedError || !linkedAnomalies || linkedAnomalies.length === 0) {
                    return { sent: 0, hasUnclassified: false };
                }

                // Get anomaly details
                const anomalyIds = linkedAnomalies.map(la => la.anomaly_id);
                const { data: anomalies, error: anomalyError } = await supabase
                    .from('anomalies')
                    .select('id, content')
                    .in('id', anomalyIds);

                // Create anomaly details map
                const anomalyDetails = new Map();
                (anomalies || []).forEach(a => {
                    anomalyDetails.set(a.id, a);
                });

                // Get user's classifications
                const { data: classifications, error: classError } = await supabase
                    .from('classifications')
                    .select('anomaly')
                    .eq('author', userId);

                if (classError) {
                    return { sent: 0, hasUnclassified: false };
                }

                // Create set of classified anomaly IDs
                const classifiedAnomalies = new Set(
                    (classifications || []).map(c => c.anomaly).filter(Boolean)
                );

                // Find unclassified discoveries
                const unclassifiedDiscoveries = linkedAnomalies.filter(
                    linked => !classifiedAnomalies.has(linked.anomaly_id)
                );

                if (unclassifiedDiscoveries.length === 0) {
                    return { sent: 0, hasUnclassified: false };
                }

                // Prepare discovery data
                const discoveryData = unclassifiedDiscoveries.map(d => ({
                    anomalyId: d.anomaly_id,
                    name: anomalyDetails.get(d.anomaly_id)?.content || `Discovery #${d.anomaly_id}`,
                    automaton: d.automaton,
                    date: d.date
                }));

                // Get user's push subscriptions
                const { data: userSubscriptions, error: userSubError } = await supabase
                    .from('push_subscriptions')
                    .select('*')
                    .eq('profile_id', userId)
                    .order('created_at', { ascending: false });

                if (userSubError || !userSubscriptions || userSubscriptions.length === 0) {
                    return { sent: 0, hasUnclassified: true };
                }

                const deduplicatedSubscriptions = dedupeByEndpoint(userSubscriptions as PushSubscriptionRow[]).slice(0, MAX_ENDPOINTS_PER_USER);

                // Create notification message
                const discoveryCount = unclassifiedDiscoveries.length;
                const title = discoveryCount === 1 
                    ? 'Discovery Reminder: Classification Needed!'
                    : `${discoveryCount} Discoveries Need Classification!`;
                
                const firstDiscovery = discoveryData[0];
                const messageBody = discoveryCount === 1
                    ? `Don't forget to classify: ${firstDiscovery.name}`
                    : `You have ${discoveryCount} unclassified discoveries waiting`;

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
                        return { success: true };
                    } catch {
                        return { success: false };
                    }
                });

                const successful = results.filter(r => r.success).length;
                return { sent: successful, hasUnclassified: true };
            } catch {
                return { sent: 0, hasUnclassified: false };
            }
        });

        const totalNotificationsSent = perUserResults.reduce((sum, item) => sum + item.sent, 0);
        const usersWithUnclassified = perUserResults.filter((item) => item.hasUnclassified).length;

        return NextResponse.json({
            message: `Auto-notification complete`,
            usersProcessed: userIds.length,
            usersWithUnclassified,
            totalNotificationsSent
        });

    } catch (error) {
        console.error('Error in auto-notification API:', error);
        return NextResponse.json({ 
            error: 'Internal server error' 
        }, { status: 500 });
    }
}
