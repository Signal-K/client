import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

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
        const userIds = [...new Set(allSubscriptions.map(sub => sub.profile_id))];
        console.log(`Found ${userIds.length} unique users with push subscriptions`);

        let totalNotificationsSent = 0;
        let usersWithUnclassified = 0;

        // Process each user
        for (const userId of userIds) {
            try {
                // Get user's linked anomalies
                const { data: linkedAnomalies, error: linkedError } = await supabase
                    .from('linked_anomalies')
                    .select('id, author, anomaly_id, date, automaton')
                    .eq('author', userId)
                    .order('date', { ascending: false });

                if (linkedError) {
                    console.error(`Error fetching linked anomalies for user ${userId}:`, linkedError);
                    continue;
                }

                if (!linkedAnomalies || linkedAnomalies.length === 0) {
                    continue; // No discoveries for this user
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
                    console.error(`Error fetching classifications for user ${userId}:`, classError);
                    continue;
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
                    continue; // No unclassified discoveries for this user
                }

                usersWithUnclassified++;

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
                    continue; // Skip if user has no subscriptions
                }

                // Deduplicate subscriptions by endpoint
                const uniqueSubscriptions = new Map();
                userSubscriptions.forEach(sub => {
                    if (!uniqueSubscriptions.has(sub.endpoint)) {
                        uniqueSubscriptions.set(sub.endpoint, sub);
                    }
                });

                const deduplicatedSubscriptions = Array.from(uniqueSubscriptions.values());

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
                            return { success: true };
                        } catch (pushError) {
                            console.error(`Failed to send notification:`, pushError);
                            return { success: false };
                        }
                    })
                );

                const successful = results.filter(r => r.success).length;
                totalNotificationsSent += successful;

                console.log(`Sent ${successful} notifications to user ${userId} for ${discoveryCount} unclassified discoveries`);

            } catch (userError) {
                console.error(`Error processing user ${userId}:`, userError);
            }
        }

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
