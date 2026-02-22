#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!supabaseUrl || !supabaseServiceKey || !vapidPublicKey || !vapidPrivateKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

    const { data: linkedAnomalies, error: linkedError } = await supabase
      .from("linked_anomalies")
      .select(
        `
        id,
        author,
        anomaly_id,
        date,
        automaton,
        anomaly:anomaly_id(content)
      `,
      )
      .order("date", { ascending: false });

    if (linkedError) {
      console.error("Error fetching linked anomalies:", linkedError);
      return [];
    }

    console.log(`Found ${linkedAnomalies?.length || 0} linked anomalies`);

    const { data: notifiedAnomalies, error: notifiedError } = await supabase
      .from("push_anomaly_log")
      .select("anomaly_id");

    if (notifiedError) {
      console.error("Error fetching notified anomalies:", notifiedError);
      return [];
    }

    const notifiedAnomalyIds = new Set(notifiedAnomalies?.map((log: any) => log.anomaly_id) || []);

    const { data: classifications, error: classError } = await supabase
      .from("classifications")
      .select("author, anomaly");

    if (classError) {
      console.error("Error fetching classifications:", classError);
      return [];
    }

    const userClassifiedAnomalies = new Map<string, Set<number>>();
    classifications?.forEach((classification: any) => {
      if (!userClassifiedAnomalies.has(classification.author)) {
        userClassifiedAnomalies.set(classification.author, new Set<number>());
      }
      userClassifiedAnomalies.get(classification.author)!.add(classification.anomaly);
    });

    const usersWithUnclassified = new Map<string, Discovery[]>();

    linkedAnomalies?.forEach((linkedAnomaly: any) => {
      const userId = linkedAnomaly.author as string;
      const anomalyId = linkedAnomaly.anomaly_id as number;
      const linkedAnomalyId = linkedAnomaly.id as number;

      if (notifiedAnomalyIds.has(linkedAnomalyId)) return;

      const userClassifications = userClassifiedAnomalies.get(userId) || new Set<number>();

      if (!userClassifications.has(anomalyId)) {
        if (!usersWithUnclassified.has(userId)) usersWithUnclassified.set(userId, []);
        usersWithUnclassified.get(userId)!.push({
          anomalyId,
          anomalyName: linkedAnomaly.anomaly?.content || `Discovery #${anomalyId}`,
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
    anomaly_id: discovery.linkedAnomalyId,
  }));

  const { error } = await supabase.from("push_anomaly_log").insert(logEntries);
  if (error) {
    console.error("Error logging notified anomalies:", error);
    return false;
  }

  return true;
}

async function sendNotificationsToUser(userId: string, discoveries: Discovery[]) {
  try {
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };
    if (!subscriptions?.length) return { success: true, message: "No subscriptions" };

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
