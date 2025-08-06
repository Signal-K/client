'use client'

import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import { useState, useEffect } from "react"

interface PushSubscription {
    id: string;
    profile_id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    created_at: string;
}

export default function NotificationSubscribeButton() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [subscribed, setSubscribed] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [subscriptionData, setSubscriptionData] = useState<PushSubscription | null>(null);
    const [sendingTest, setSendingTest] = useState<boolean>(false);

    // Check if user is already subscribed
    useEffect(() => {
        if (session?.user?.id) {
            checkExistingSubscription();
        }
    }, [session?.user?.id]);

    const checkExistingSubscription = async () => {
        if (!session?.user?.id) return;

        // First, check if this device already has a push subscription
        let currentDeviceEndpoint = null;
        try {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    const existingSubscription = await registration.pushManager.getSubscription();
                    if (existingSubscription) {
                        currentDeviceEndpoint = existingSubscription.endpoint;
                    }
                }
            }
        } catch (error) {
            console.log('Could not check existing device subscription:', error);
        }

        const { data, error } = await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("profile_id", session.user.id)
            .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
            // Check if current device has an active subscription
            const currentDeviceSubscription = currentDeviceEndpoint 
                ? data.find(sub => sub.endpoint === currentDeviceEndpoint)
                : null;

            if (currentDeviceSubscription) {
                // This device is already subscribed
                setSubscribed(true);
                setSubscriptionData(currentDeviceSubscription);
            } else {
                // This device is not subscribed, but user has other subscriptions
                setSubscribed(false);
                setSubscriptionData(data[0]); // Show most recent subscription for reference
            }
        } else {
            // No subscription exists at all
            setSubscribed(false);
            setSubscriptionData(null);
        }
    };

    const handleClick = async () => {
        if (!session?.user?.id) {
            console.log('No user session found');
            return;
        }

        setIsLoading(true);

        try {
            // Don't check for existing subscription here - allow multiple device subscriptions
            console.log('Requesting notification permission...');
            // Request notification permission
            const permission = await Notification.requestPermission();
            console.log('Notification permission result:', permission);
            
            if (permission !== 'granted') {
                alert('Notification permission denied');
                return;
            }

            console.log('Registering service worker...');
            // Register service worker and get push subscription
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service worker registered:', registration);
            
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            });
            console.log('Push subscription created:', subscription);

            // Check if this exact endpoint already exists for this user
            const { data: existingEndpoint } = await supabase
                .from("push_subscriptions")
                .select("id")
                .eq("profile_id", session.user.id)
                .eq("endpoint", subscription.endpoint)
                .limit(1);

            if (existingEndpoint && existingEndpoint.length > 0) {
                console.log('Subscription with this endpoint already exists');
                setSubscribed(true);
                alert('You are already subscribed to notifications on this device!');
                checkExistingSubscription();
                return;
            }

            // Insert subscription directly into Supabase
            const { error } = await supabase
                .from("push_subscriptions")
                .insert({
                    profile_id: session.user.id,
                    endpoint: subscription.endpoint,
                    auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : '',
                    p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : '',
                });

            if (error) {
                console.error('Error saving subscription:', error);
                alert('Failed to save subscription. Please try again.');
                return;
            }

            setSubscribed(true);
            console.log('Push subscription saved successfully');
            alert('Successfully subscribed to notifications!');
            // Refresh subscription data
            checkExistingSubscription();
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            alert('Failed to subscribe to notifications. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const sendTestNotification = async () => {
        if (!subscriptionData) return;

        setSendingTest(true);
        try {
            console.log('Sending test notification...');
            
            const response = await fetch('/api/send-test-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: 'Test Notification',
                    message: 'This is a test notification from Star Sailors!',
                    url: '/'
                })
            });

            const result = await response.json();
            console.log('API response:', result);
            
            if (response.ok) {
                alert('Test notification sent successfully! Check your browser notifications.');
                console.log('Test notification result:', result);
                
                // Also check if browser notifications are working
                console.log('Current notification permission:', Notification.permission);
                
                // Test direct notification as fallback
                if (Notification.permission === 'granted') {
                    try {
                        new Notification('Direct Test', { 
                            body: 'This is a direct notification test - you should see this immediately',
                            icon: '/assets/Captn.jpg'
                        });
                        console.log('Direct notification sent');
                    } catch (directError) {
                        console.error('Direct notification failed:', directError);
                    }
                }
            } else {
                console.error('Failed to send test notification:', result);
                alert('Failed to send test notification: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error sending test notification:', error);
            alert('Failed to send test notification. Please try again.');
        } finally {
            setSendingTest(false);
        }
    };

    if (!session?.user?.id) {
        return (
            <div className="text-gray-500">
                Please log in to manage notifications
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-semibold">Push Notifications</h3>
            
            {subscribed && subscriptionData ? (
                <div className="space-y-3">
                    <div className="text-green-600 font-medium">
                        ✅ You are subscribed to notifications on this device
                    </div>
                    
                    <div className="text-sm space-y-2">
                        <div>
                            <span className="font-medium">Subscription ID:</span>
                            <div className="text-xs text-gray-600 break-all">{subscriptionData.id}</div>
                        </div>
                        <div>
                            <span className="font-medium">Endpoint:</span>
                            <div className="text-xs text-gray-600 break-all">{subscriptionData.endpoint}</div>
                        </div>
                        <div>
                            <span className="font-medium">Auth Key:</span>
                            <div className="text-xs text-gray-600 break-all">{subscriptionData.auth}</div>
                        </div>
                        <div>
                            <span className="font-medium">P256DH Key:</span>
                            <div className="text-xs text-gray-600 break-all">{subscriptionData.p256dh}</div>
                        </div>
                        <div>
                            <span className="font-medium">Created:</span>
                            <div className="text-xs text-gray-600">
                                {new Date(subscriptionData.created_at).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={sendTestNotification}
                        disabled={sendingTest}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        {sendingTest ? "Sending..." : "Send Test Notification"}
                    </button>
                </div>
            ) : subscriptionData ? (
                <div className="space-y-3">
                    <div className="text-blue-600">
                        📱 Subscribe on this device
                    </div>
                    <div className="text-sm text-gray-600">
                        You have notifications enabled on your account, but not on this device yet.
                    </div>
                    <button
                        onClick={handleClick}
                        disabled={isLoading}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? "Subscribing..." : "Subscribe on This Device"}
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="text-yellow-600">
                        📢 Subscribe to get notifications about discoveries and updates
                    </div>
                    <button
                        onClick={handleClick}
                        disabled={isLoading}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? "Subscribing..." : "Enable Notifications"}
                    </button>
                </div>
            )}
        </div>
    );
};