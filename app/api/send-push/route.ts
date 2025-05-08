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
  "mailto:test@domain.com",  // You can change this to a valid email address
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  try {
    // Parse request body
    const { userId, message } = await request.json();

    // Log input to track request
    console.log("Received request to send push notification", { userId, message });

    // Retrieve push subscription from Supabase
    const { data: userProfile, error } = await supabase
      .from("profiles")
      .select("push_subscription")
      .eq("id", userId)
      .single();

    if (error || !userProfile?.push_subscription) {
      console.error("Failed to retrieve push subscription:", error || "No subscription found");
      return NextResponse.json({ error: "User push subscription not found" }, { status: 400 });
    }

    // Log retrieved subscription for debugging
    console.log("Found user push subscription:", JSON.stringify(userProfile.push_subscription, null, 2));

    // Prepare the payload for the push notification
    const payload = JSON.stringify({
      title: message,  // Use the message as the title of the notification
      message,  // You can include the message as well if desired
    });

    // Send the push notification
    try {
      await webpush.sendNotification(userProfile.push_subscription, payload);
      console.log("Push notification sent successfully");
    } catch (pushErr) {
      console.error("Error sending push notification:", pushErr);
      return NextResponse.json({ error: "Error sending push notification" }, { status: 500 });
    }

    // Return success response
    return NextResponse.json({ success: true });

  } catch (err) {
    // Log any other unexpected errors
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
  }
};