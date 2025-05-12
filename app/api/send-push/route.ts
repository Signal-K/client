import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase client (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Set up VAPID details
webpush.setVapidDetails(
  "mailto:test@domain.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const userIds = body.userIds || (body.userId ? [body.userId] : null);
    const message = body.message;

    if (!Array.isArray(userIds) || !message) {
      return NextResponse.json(
        { error: "Invalid input: userIds must be an array and message must be a string." },
        { status: 400 }
      );
    }

    // Fetch user push subscriptions
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, push_subscription")
      .in("id", userIds);

    if (error) {
      console.error("Error fetching user subscriptions:", error);
      return NextResponse.json({ error: "Database query failed" }, { status: 500 });
    }

    const results = [];

    for (const profile of profiles) {
      const { id, push_subscription } = profile;

      if (!push_subscription) {
        results.push({ id, success: false, error: "No subscription" });
        continue;
      }

      let subscription;
      try {
        subscription =
          typeof push_subscription === "string"
            ? JSON.parse(push_subscription)
            : push_subscription;
      } catch (parseErr) {
        console.error(`Failed to parse push_subscription for user ${id}`, parseErr);
        results.push({ id, success: false, error: "Invalid subscription format" });
        continue;
      }

      const payload = JSON.stringify({
        title: message,
        message,
      });

      try {
        await webpush.sendNotification(subscription, payload);
        results.push({ id, success: true });
      } catch (pushErr) {
        console.error(`Push error for user ${id}:`, pushErr);
        results.push({ id, success: false, error: (pushErr as Error).message });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
};