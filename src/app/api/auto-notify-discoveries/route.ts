import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

import { createPocketbaseAdminClient } from '@/lib/pocketbase/adminClient';

const SEND_TIMEOUT_MS = 8000;
const SEND_CONCURRENCY = 6;
const USER_CONCURRENCY = 4;
const MAX_USERS_PER_RUN = 120;
const MAX_ENDPOINTS_PER_USER = 20;

type PushSubscriptionRow = {
    endpoint: string;
    auth: string;
    p256dh: string;
    profileId: string;
};

type LinkedAnomalyRow = {
    author: string;
    anomalyId: number;
    date: string;
    automaton: string;
};

type AnomalyRow = {
    legacyId: number;
    content: string;
};

type ClassificationRow = {
    anomaly: number;
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

        // This endpoint is for automated workflows, so we need admin access
        const pb = await createPocketbaseAdminClient();

        console.log('Auto-checking for unclassified discoveries...');

        // Get all users who have push subscriptions
        let allSubscriptions: PushSubscriptionRow[];
        try {
            allSubscriptions = await pb.collection('push_subscriptions').getFullList({
                sort: '-createdAt',
            });
        } catch (subError) {
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
        const userIds = [...new Set(allSubscriptions.map(sub => sub.profileId))].slice(0, MAX_USERS_PER_RUN);
        console.log(`Found ${userIds.length} unique users with push subscriptions`);

        const perUserResults = await mapWithConcurrency(userIds, USER_CONCURRENCY, async (userId) => {
            try {
                // Get user's linked anomalies
                const linkedAnomalies = await pb.collection('linked_anomalies').getFullList<LinkedAnomalyRow>({
                    filter: pb.filter('author = {:author}', { author: userId }),
                    sort: '-date',
                }).catch(() => []);

                if (linkedAnomalies.length === 0) {
                    return { sent: 0, hasUnclassified: false };
                }

                // Get anomaly details
                const anomalyIds = [...new Set(linkedAnomalies.map(la => la.anomalyId))];
                const anomalyFilter = anomalyIds
                    .map(id => pb.filter('legacyId = {:id}', { id }))
                    .join(' || ');
                const anomalies = anomalyIds.length > 0
                    ? await pb.collection('anomalies').getFullList<AnomalyRow>({ filter: anomalyFilter }).catch(() => [])
                    : [];

                // Create anomaly details map
                const anomalyDetails = new Map<number, AnomalyRow>();
                anomalies.forEach(a => {
                    anomalyDetails.set(a.legacyId, a);
                });

                // Get user's classifications
                const classifications = await pb.collection('ss_classifications').getFullList<ClassificationRow>({
                    filter: pb.filter('author = {:author}', { author: userId }),
                }).catch(() => null);

                if (classifications === null) {
                    return { sent: 0, hasUnclassified: false };
                }

                // Create set of classified anomaly IDs
                const classifiedAnomalies = new Set(
                    classifications.map(c => c.anomaly).filter(Boolean)
                );

                // Find unclassified discoveries
                const unclassifiedDiscoveries = linkedAnomalies.filter(
                    linked => !classifiedAnomalies.has(linked.anomalyId)
                );

                if (unclassifiedDiscoveries.length === 0) {
                    return { sent: 0, hasUnclassified: false };
                }

                // Prepare discovery data
                const discoveryData = unclassifiedDiscoveries.map(d => ({
                    anomalyId: d.anomalyId,
                    name: anomalyDetails.get(d.anomalyId)?.content || `Discovery #${d.anomalyId}`,
                    automaton: d.automaton,
                    date: d.date
                }));

                // Get user's push subscriptions
                const userSubscriptions = await pb.collection('push_subscriptions').getFullList<PushSubscriptionRow>({
                    filter: pb.filter('profileId = {:id}', { id: userId }),
                    sort: '-createdAt',
                }).catch(() => []);

                if (userSubscriptions.length === 0) {
                    return { sent: 0, hasUnclassified: true };
                }

                const deduplicatedSubscriptions = dedupeByEndpoint(userSubscriptions).slice(0, MAX_ENDPOINTS_PER_USER);

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
