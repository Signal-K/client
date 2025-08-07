#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const webpush = require('web-push');

// Configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!supabaseUrl || !supabaseServiceKey || !vapidPublicKey || !vapidPrivateKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configure webpush
webpush.setVapidDetails(
  'mailto:admin@starsailors.app',
  vapidPublicKey,
  vapidPrivateKey
);

async function findUsersWithUnclassifiedDiscoveries() {
  try {
    console.log('Finding users with unclassified discoveries...');

    // Get all linked_anomalies with their anomaly details
    const { data: linkedAnomalies, error: linkedError } = await supabase
      .from('linked_anomalies')
      .select(`
        id,
        author,
        anomaly_id,
        date,
        automaton,
        anomaly:anomaly_id(content)
      `)
      .order('date', { ascending: false });

    if (linkedError) {
      console.error('Error fetching linked anomalies:', linkedError);
      return [];
    }

    console.log(`Found ${linkedAnomalies?.length || 0} linked anomalies`);

    // Get all classifications
    const { data: classifications, error: classError } = await supabase
      .from('classifications')
      .select('author, anomaly');

    if (classError) {
      console.error('Error fetching classifications:', classError);
      return [];
    }

    console.log(`Found ${classifications?.length || 0} classifications`);

    // Create a map of user -> classified anomalies
    const userClassifiedAnomalies = new Map();
    classifications?.forEach(classification => {
      if (!userClassifiedAnomalies.has(classification.author)) {
        userClassifiedAnomalies.set(classification.author, new Set());
      }
      userClassifiedAnomalies.get(classification.author).add(classification.anomaly);
    });

    // Find unclassified discoveries for each user
    const usersWithUnclassified = new Map();

    linkedAnomalies?.forEach(linkedAnomaly => {
      const userId = linkedAnomaly.author;
      const anomalyId = linkedAnomaly.anomaly_id;
      
      // Check if this user has classified this specific anomaly
      const userClassifications = userClassifiedAnomalies.get(userId) || new Set();
      
      if (!userClassifications.has(anomalyId)) {
        // This is an unclassified discovery
        if (!usersWithUnclassified.has(userId)) {
          usersWithUnclassified.set(userId, []);
        }
        usersWithUnclassified.get(userId).push({
          anomalyId,
          anomalyName: linkedAnomaly.anomaly?.content || `Discovery #${anomalyId}`,
          linkedAnomalyId: linkedAnomaly.id,
          automaton: linkedAnomaly.automaton,
          date: linkedAnomaly.date
        });
      }
    });

    console.log(`Found ${usersWithUnclassified.size} users with unclassified discoveries`);

    return Array.from(usersWithUnclassified.entries()).map(([userId, discoveries]) => ({
      userId,
      discoveries
    }));

  } catch (error) {
    console.error('Error finding unclassified discoveries:', error);
    return [];
  }
}

async function sendNotificationsToUser(userId, discoveries) {
  try {
    // Get user's push subscriptions with deduplication by endpoint
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching subscriptions for user ${userId}:`, error);
      return { success: false, error: error.message };
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return { success: true, message: 'No subscriptions' };
    }

    // Deduplicate by endpoint
    const uniqueSubscriptions = new Map();
    subscriptions.forEach(sub => {
      if (!uniqueSubscriptions.has(sub.endpoint)) {
        uniqueSubscriptions.set(sub.endpoint, sub);
      }
    });

    const deduplicatedSubscriptions = Array.from(uniqueSubscriptions.values());
    console.log(`Sending notifications to ${deduplicatedSubscriptions.length} unique endpoints for user ${userId}`);

    // Create notification message
    const discoveryCount = discoveries.length;
    const title = discoveryCount === 1 
      ? 'New Discovery Awaits Classification!'
      : `${discoveryCount} New Discoveries Await Classification!`;
    
    const firstDiscovery = discoveries[0];
    const body = discoveryCount === 1
      ? `Classify your discovery: ${firstDiscovery.anomalyName}`
      : `You have ${discoveryCount} unclassified discoveries waiting for analysis`;

    const payload = JSON.stringify({
      title,
      body,
      icon: '/assets/Captn.jpg',
      url: '/structures/telescope' // Or wherever users go to classify
    });

    // Send notifications to all user's endpoints
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
          return { success: true, endpoint: subscription.endpoint };
        } catch (pushError) {
          console.error(`Failed to send notification to endpoint for user ${userId}:`, pushError);
          return { success: false, endpoint: subscription.endpoint, error: pushError.message };
        }
      })
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`User ${userId}: ${successful} notifications sent, ${failed} failed`);
    return { success: true, sent: successful, failed };

  } catch (error) {
    console.error(`Error sending notifications to user ${userId}:`, error);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('Starting unclassified discoveries notification job...');
  console.log('Timestamp:', new Date().toISOString());

  try {
    const usersWithUnclassified = await findUsersWithUnclassifiedDiscoveries();
    
    if (usersWithUnclassified.length === 0) {
      console.log('No users with unclassified discoveries found.');
      return;
    }

    console.log(`Processing notifications for ${usersWithUnclassified.length} users...`);

    let totalSent = 0;
    let totalFailed = 0;

    for (const { userId, discoveries } of usersWithUnclassified) {
      console.log(`Processing user ${userId} with ${discoveries.length} unclassified discoveries`);
      const result = await sendNotificationsToUser(userId, discoveries);
      
      if (result.success && result.sent) {
        totalSent += result.sent;
        totalFailed += result.failed || 0;
      }

      // Small delay between users to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Users processed: ${usersWithUnclassified.length}`);
    console.log(`Notifications sent: ${totalSent}`);
    console.log(`Notifications failed: ${totalFailed}`);
    console.log(`Completed at: ${new Date().toISOString()}`);

  } catch (error) {
    console.error('Fatal error in notification job:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
