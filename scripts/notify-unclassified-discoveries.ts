#!/usr/bin/env tsx

import PocketBase from "pocketbase";
import webpush from "web-push";

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || process.env.PB_URL;
const pbAdminEmail = process.env.POCKETBASE_ADMIN_EMAIL || process.env.PB_ADMIN_EMAIL;
const pbAdminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || process.env.PB_ADMIN_PASSWORD;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!pbUrl || !pbAdminEmail || !pbAdminPassword || !vapidPublicKey || !vapidPrivateKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const pb = new PocketBase(pbUrl);
const adminEmail = pbAdminEmail;
const adminPassword = pbAdminPassword;
webpush.setVapidDetails("mailto:teddy@scroobl.es", vapidPublicKey, vapidPrivateKey);

type Discovery = {
  anomalyId: number;
  anomalyName: string;
  linkedAnomalyId: number;
  automaton: string;
  date: string;
};

type UserDiscoveries = {
  userId: string;
  discoveries: Discovery[];
};

async function findUsersWithUnclassifiedDiscoveries(): Promise<UserDiscoveries[]> {
  try {
    console.log("Finding users with unclassified discoveries...");

    const linkedAnomalies = await pb.collection("linked_anomalies").getFullList({
      sort: "-date",
      fields: "legacyId,author,anomalyId,date,automaton",
    });

    console.log(`Found ${linkedAnomalies.length} linked anomalies`);

    const notifiedAnomalies = await pb.collection("push_anomaly_log").getFullList({ fields: "anomalyId" });

    const notifiedAnomalyIds = new Set(notifiedAnomalies.map((log: any) => log.anomalyId));

    const classifications = await pb.collection("ss_classifications").getFullList({
      fields: "author,anomaly",
    });

    const anomalyIds = [...new Set(linkedAnomalies.map((linked: any) => linked.anomalyId).filter(Boolean))];
    const anomalyNames = new Map<number, string>();
    if (anomalyIds.length > 0) {
      const filter = anomalyIds.map((id) => pb.filter("legacyId = {:id}", { id })).join(" || ");
      const anomalies = await pb.collection("anomalies").getFullList({ filter, fields: "legacyId,content" });
      for (const anomaly of anomalies) {
        anomalyNames.set(anomaly.legacyId, anomaly.content || `Discovery #${anomaly.legacyId}`);
      }
    }

    const userClassifiedAnomalies = new Map<string, Set<number>>();
    classifications.forEach((classification: any) => {
      if (!userClassifiedAnomalies.has(classification.author)) {
        userClassifiedAnomalies.set(classification.author, new Set<number>());
      }
      userClassifiedAnomalies.get(classification.author)!.add(classification.anomaly);
    });

    const usersWithUnclassified = new Map<string, Discovery[]>();

    linkedAnomalies.forEach((linkedAnomaly: any) => {
      const userId = linkedAnomaly.author as string;
      const anomalyId = linkedAnomaly.anomalyId as number;
      const linkedAnomalyId = linkedAnomaly.legacyId as number;

      if (notifiedAnomalyIds.has(linkedAnomalyId)) return;

      const userClassifications = userClassifiedAnomalies.get(userId) || new Set<number>();

      if (!userClassifications.has(anomalyId)) {
        if (!usersWithUnclassified.has(userId)) usersWithUnclassified.set(userId, []);
        usersWithUnclassified.get(userId)!.push({
          anomalyId,
          anomalyName: anomalyNames.get(anomalyId) || `Discovery #${anomalyId}`,
          linkedAnomalyId,
          automaton: linkedAnomaly.automaton,
          date: linkedAnomaly.date,
        });
      }
    });

    return Array.from(usersWithUnclassified.entries()).map(([userId, discoveries]) => ({
      userId,
      discoveries,
    }));
  } catch (error) {
    console.error("Error finding unclassified discoveries:", error);
    return [];
  }
}

async function logNotifiedAnomalies(discoveries: Discovery[]) {
  if (!discoveries.length) return true;

  const logEntries = discoveries.map((discovery) => ({
    anomalyId: discovery.linkedAnomalyId,
    sentAt: new Date().toISOString(),
  }));

  try {
    await Promise.all(logEntries.map((entry) => pb.collection("push_anomaly_log").create(entry)));
  } catch (error) {
    console.error("Error logging notified anomalies:", error);
    return false;
  }

  return true;
}

async function sendNotificationsToUser(userId: string, discoveries: Discovery[]) {
  try {
    const subscriptions = await pb.collection("push_subscriptions").getFullList({
      filter: pb.filter("profileId = {:profileId}", { profileId: userId }),
      sort: "-createdAt",
    });

    if (!subscriptions.length) return { success: true, message: "No subscriptions" };

    const uniqueSubscriptions = new Map<string, any>();
    subscriptions.forEach((sub: any) => {
      if (!uniqueSubscriptions.has(sub.endpoint)) uniqueSubscriptions.set(sub.endpoint, sub);
    });

    const deduplicatedSubscriptions = Array.from(uniqueSubscriptions.values());
    const discoveryCount = discoveries.length;
    const firstDiscovery = discoveries[0];

    let entity = "Telescope";
    let anomalyType = "anomaly";
    if (firstDiscovery?.automaton) {
      const automaton = firstDiscovery.automaton.toLowerCase();
      if (automaton.includes("satellite")) entity = "Satellite";
      else if (automaton.includes("telescope")) entity = "Telescope";

      if (automaton.includes("solar")) anomalyType = "sunspot";
      else if (automaton.includes("planet")) anomalyType = "planet";
      else if (automaton.includes("satellite")) anomalyType = "satellite anomaly";
    }

    const title =
      discoveryCount === 1
        ? "New Discovery Awaits Classification!"
        : `${discoveryCount} New Discoveries Await Classification!`;
    const body =
      discoveryCount === 1
        ? `Classify your ${anomalyType} discovered by your ${entity}`
        : `You have ${discoveryCount} unclassified discoveries waiting for analysis`;

    const payload = JSON.stringify({
      title,
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      image: "/icon-192.png",
      url: "/structures/telescope",
      tag: "unclassified-discoveries",
      requireInteraction: true,
      actions: [
        { action: "classify", title: "🔬 Classify Now" },
        { action: "dismiss", title: "Later" },
      ],
    });

    const results = await Promise.all(
      deduplicatedSubscriptions.map(async (subscription: any) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh,
            },
          };
          await webpush.sendNotification(pushSubscription, payload);
          return { success: true, endpoint: subscription.endpoint };
        } catch (pushError: any) {
          return {
            success: false,
            endpoint: subscription.endpoint,
            error: pushError?.message || String(pushError),
          };
        }
      }),
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    if (successful > 0) {
      await logNotifiedAnomalies(discoveries);
    }

    return { success: true, sent: successful, failed };
  } catch (error: any) {
    console.error(`Error sending notifications to user ${userId}:`, error);
    return { success: false, error: error?.message || String(error) };
  }
}

async function main() {
  console.log("Starting unclassified discoveries notification job...");
  console.log("Timestamp:", new Date().toISOString());

  try {
    await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword);

    const usersWithUnclassified = await findUsersWithUnclassifiedDiscoveries();
    if (!usersWithUnclassified.length) {
      console.log("No users with unclassified discoveries found.");
      return;
    }

    let totalSent = 0;
    let totalFailed = 0;

    for (const { userId, discoveries } of usersWithUnclassified) {
      const result = await sendNotificationsToUser(userId, discoveries);
      if (result.success && (result as any).sent) {
        totalSent += (result as any).sent;
        totalFailed += (result as any).failed || 0;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`Users processed: ${usersWithUnclassified.length}`);
    console.log(`Notifications sent: ${totalSent}`);
    console.log(`Notifications failed: ${totalFailed}`);
  } catch (error) {
    console.error("Fatal error in notification job:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
