'use client'

import { useSupabaseClient, useSession } from "@/src/lib/auth/session-context"
import { useState, useEffect } from "react"

interface PushSubscription {
    id: string;
    profile_id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    created_at: string;
}

interface NotificationRejection {
    id: string;
    profile_id: string;
    created_at: string;
}

export default function NotificationSubscribeButton() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [subscribed, setSubscribed] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [subscriptionData, setSubscriptionData] = useState<PushSubscription | null>(null);
    const [sendingTest, setSendingTest] = useState<boolean>(false);
    const [checkingDiscoveries, setCheckingDiscoveries] = useState<boolean>(false);
    const [hasRejected, setHasRejected] = useState<boolean>(false);
    const [isRejecting, setIsRejecting] = useState<boolean>(false);
    const [hideSection, setHideSection] = useState<boolean>(false);

    // Check if user is already subscribed or has rejected notifications
    useEffect(() => {
        if (session?.user?.id) {
            checkExistingSubscription();
        }
    }, [session?.user?.id]);

    const checkExistingSubscription = async () => {
        if (!session?.user?.id) return;

        // Check if user has rejected notifications
        const { data: rejectionData, error: rejectionError } = await supabase
            .from("notification_rejections")
            .select("*")
            .eq("profile_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        if (!rejectionError && rejectionData && rejectionData.length > 0) {
            setHasRejected(true);
            setHideSection(true);
            return;
        }

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
                // Unable to check existing device subscription
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
                // This device is already subscribed - hide the section
                setSubscribed(true);
                setSubscriptionData(currentDeviceSubscription);
                setHideSection(true);
            } else {
                // This device is not subscribed, but user has other subscriptions
                setSubscribed(false);
                setSubscriptionData(data[0]); // Show most recent subscription for reference
                setHideSection(false);
            }
        } else {
            // No subscription exists at all
            setSubscribed(false);
            setSubscriptionData(null);
            setHideSection(false);
        }
    };

    const handleClick = async () => {
        if (!session?.user?.id) {
            // no user session
            return;
        }

        setIsLoading(true);

        try {
            // Check if we're on iOS Safari
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            
            // device info collected
            
            // Check if push messaging is supported
            if (!('serviceWorker' in navigator)) {
                alert('Service workers are not supported in this browser');
                return;
            }
            
            if (!('PushManager' in window)) {
                alert('Push messaging is not supported in this browser');
                return;
            }

            // For iOS Safari, we need to handle the permission request differently
            // requesting notification permission
            let permission;
            
            if (isIOS && isSafari) {
                // iOS Safari requires user gesture for permission
                permission = await Notification.requestPermission();
            } else {
                permission = await Notification.requestPermission();
            }
            
            // notification permission result
            
            if (permission === 'denied') {
                alert('Notifications are blocked. Please enable them in your browser settings.');
                return;
            }
            
            if (permission !== 'granted') {
                alert('Notification permission was not granted');
                return;
            }

            // registering service worker
            
            // Wait for service worker to be ready
            let registration;
            try {
                registration = await navigator.serviceWorker.register('/sw.js');
                await navigator.serviceWorker.ready;
                // service worker registered and ready
            } catch (swError) {
                console.error('Service worker registration failed:', swError);
                alert('Failed to register service worker. Please try again.');
                return;
            }
            
            // Convert VAPID key properly
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                console.error('VAPID public key is missing');
                alert('Push notifications are not configured properly');
                return;
            }
            
            // creating push subscription
            
            let subscription;
            try {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: vapidPublicKey
                });
                // push subscription created
            } catch (subscribeError) {
                console.error('Push subscription failed:', subscribeError);
                
                // Provide more specific error messages for common iOS issues
                const errorName = subscribeError instanceof Error ? subscribeError.name : 'Unknown';
                const errorMessage = subscribeError instanceof Error ? subscribeError.message : String(subscribeError);
                
                if (errorName === 'NotSupportedError') {
                    alert('Push notifications are not supported on this device/browser combination');
                } else if (errorName === 'NotAllowedError') {
                    alert('Push notifications are blocked. Please enable them in Safari settings');
                } else if (errorName === 'AbortError') {
                    alert('Push subscription was cancelled. Please try again');
                } else {
                    alert(`Failed to create push subscription: ${errorMessage}`);
                }
                return;
            }

            // Check if this exact endpoint already exists for this user
            const { data: existingEndpoint } = await supabase
                .from("push_subscriptions")
                .select("id")
                .eq("profile_id", session.user.id)
                .eq("endpoint", subscription.endpoint)
                .limit(1);

            if (existingEndpoint && existingEndpoint.length > 0) {
                // subscription with this endpoint already exists
                setSubscribed(true);
                alert('You are already subscribed to notifications on this device!');
                checkExistingSubscription();
                return;
            }

            // Extract keys safely
            let authKey = '';
            let p256dhKey = '';
            
            try {
                const authBuffer = subscription.getKey('auth');
                const p256dhBuffer = subscription.getKey('p256dh');
                
                if (authBuffer) {
                    authKey = btoa(String.fromCharCode(...new Uint8Array(authBuffer)));
                }
                
                if (p256dhBuffer) {
                    p256dhKey = btoa(String.fromCharCode(...new Uint8Array(p256dhBuffer)));
                }
                
                // subscription keys extracted successfully
            } catch (keyError) {
                console.error('Failed to extract subscription keys:', keyError);
                alert('Failed to process subscription keys. Please try again.');
                return;
            }

            const response = await fetch("/api/gameplay/notifications/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    auth: authKey,
                    p256dh: p256dhKey,
                }),
            });
            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error('Error saving subscription:', payload?.error);
                alert('Failed to save subscription. Please try again.');
                return;
            }

            setSubscribed(true);
            // push subscription saved successfully
            alert('Successfully subscribed to notifications!');
            
            // Hide the section after successful subscription
            setHideSection(true);
            
            // Refresh subscription data
            checkExistingSubscription();
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`Failed to subscribe to notifications: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectNotifications = async () => {
        if (!session?.user?.id) {
            // no user session
            return;
        }

        setIsRejecting(true);

        try {
            const response = await fetch("/api/gameplay/notifications/reject", {
                method: "POST",
            });
            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error('Error saving notification rejection:', payload?.error);
                alert('Failed to save preference. Please try again.');
                return;
            }

            // notification rejection saved successfully
            setHasRejected(true);
            setHideSection(true);
            
        } catch (error) {
            console.error('Error rejecting notifications:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`Failed to save preference: ${errorMessage}`);
        } finally {
            setIsRejecting(false);
        }
    };

    const sendTestNotification = async () => {
        if (!subscriptionData) return;

        setSendingTest(true);
        try {
            // sending test notification
            
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
            // API response received
            
            if (response.ok) {
                alert('Test notification sent successfully! Check your browser notifications.');
                // test notification result received
                
                // Also check if browser notifications are working
                
                // Test direct notification as fallback
                if (Notification.permission === 'granted') {
                    try {
                        new Notification('Direct Test', { 
                            body: 'This is a direct notification test - you should see this immediately',
                            icon: 'https://github.com/Signal-K/client/blob/main/public/assets/Captn.jpg?raw=true'
                        });
                        // direct notification sent
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

    const checkUnclassifiedDiscoveries = async () => {
        if (!session?.user?.id) return;

        setCheckingDiscoveries(true);
        try {
            // checking for unclassified discoveries
            
            // Fetch linked anomalies using the authenticated client
            const { data: linkedAnomalies, error: linkedError } = await supabase
                .from('linked_anomalies')
                .select('id, author, anomaly_id, date, automaton')
                .eq('author', session.user.id)
                .order('date', { ascending: false });

            if (linkedError) {
                console.error('Error fetching linked anomalies:', linkedError);
                alert('Failed to fetch your discoveries. Please try again.');
                return;
            }

            // found linked anomalies count

            if (!linkedAnomalies || linkedAnomalies.length === 0) {
                alert('🔬 No discoveries found yet. Start exploring to find some!');
                return;
            }

            // Get anomaly details
            const anomalyIds = linkedAnomalies.map(la => la.anomaly_id);
            const { data: anomalies, error: anomalyError } = await supabase
                .from('anomalies')
                .select('id, content')
                .in('id', anomalyIds);

            if (anomalyError) {
                console.warn('Could not fetch anomaly details:', anomalyError);
            }

            // Create a map of anomaly details
            const anomalyDetails = new Map();
            (anomalies || []).forEach(a => {
                anomalyDetails.set(a.id, a);
            });

            // Get user's classifications
            const { data: classifications, error: classError } = await supabase
                .from('classifications')
                .select('anomaly')
                .eq('author', session.user.id);

            if (classError) {
                console.error('Error fetching classifications:', classError);
                alert('Failed to fetch your classifications. Please try again.');
                return;
            }

            // found classifications count

            // Create set of classified anomaly IDs
            const classifiedAnomalies = new Set(
                (classifications || []).map(c => c.anomaly).filter(Boolean)
            );

            // Find unclassified discoveries
            const unclassifiedDiscoveries = linkedAnomalies.filter(
                linked => !classifiedAnomalies.has(linked.anomaly_id)
            );

            // unclassified discoveries count

            if (unclassifiedDiscoveries.length === 0) {
                alert('🎉 All your discoveries have been classified! Great work!');
                return;
            }

            // Prepare discovery data with names for the notification API
            const discoveryData = unclassifiedDiscoveries.map(d => ({
                anomalyId: d.anomaly_id,
                name: anomalyDetails.get(d.anomaly_id)?.content || `Discovery #${d.anomaly_id}`,
                automaton: d.automaton,
                date: d.date
            }));

            // Send notification request to API with the discovery data
            const response = await fetch('/api/notify-my-discoveries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    unclassifiedDiscoveries: discoveryData
                })
            });

            const result = await response.json();
            // notification API response received
            
            if (response.ok) {
                if (result.unclassifiedCount > 0) {
                    alert(`🔬 Found ${result.unclassifiedCount} unclassified discoveries! Notifications sent to ${result.notificationsSent} devices.`);
                } else {
                    alert('🎉 All your discoveries have been classified! Great work!');
                }
            } else {
                console.error('Failed to send notifications:', result);
                alert('Failed to send notifications: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error checking discoveries:', error);
            alert('Failed to check discoveries. Please try again.');
        } finally {
            setCheckingDiscoveries(false);
        }
    };

    if (!session?.user?.id) {
        return (
            <div className="text-gray-500">
                Please log in to manage notifications
            </div>
        );
    }

    // Hide the section if user has subscribed on this device or rejected notifications
    if (hideSection) {
        return null;
    }

    // Check if we're on iOS Safari
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isiOSSafari = isIOS && isSafari;

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-semibold">Push Notifications</h3>
            
            {isiOSSafari && (
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm">
                    <strong>iOS Safari Users:</strong> Push notifications require:
                    <ul className="mt-1 ml-4 list-disc">
                        <li>iOS 16.4 or later</li>
                        <li>Website added to Home Screen</li>
                        <li>Notifications enabled in Safari settings</li>
                    </ul>
                </div>
            )}
            
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

                    <button
                        onClick={checkUnclassifiedDiscoveries}
                        disabled={checkingDiscoveries}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {checkingDiscoveries ? "Checking..." : "🔬 Check My Discoveries"}
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
                    <div className="flex gap-3">
                        <button
                            onClick={handleClick}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? "Subscribing..." : "Enable Notifications"}
                        </button>
                        <button
                            onClick={handleRejectNotifications}
                            disabled={isRejecting}
                            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            {isRejecting ? "Saving..." : "No Thanks"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
