self.addEventListener("push", function (event) {
    console.log('Push event received:', event);
    
    let data;
    try {
        data = event.data?.json();
        console.log('Push data:', data);
    } catch (error) {
        console.error('Error parsing push data:', error);
        data = {};
    }
    
    const title = data?.title || "New Discovery!";
    const options = {
        body: data?.body || "A new anomaly has been unlocked",
        icon: data?.icon || '/assets/Captn.jpg', // Use Captn.jpg as fallback
        badge: data?.badge || '/assets/Captn.jpg', // Badge for Android
        image: data?.image || '/assets/Captn.jpg', // Large image for rich notifications
        data: { 
            url: data?.url || "/",
            action: 'default'
        },
        tag: data?.tag || 'discovery-notification', // Prevent notification stacking
        requireInteraction: data?.requireInteraction || true,
        silent: false,
        vibrate: [200, 100, 200], // Vibration pattern for Android
        actions: data?.actions || [
            {
                action: 'classify',
                title: '🔬 Classify Now'
            },
            {
                action: 'dismiss', 
                title: 'Later'
            }
        ]
    };
    
    console.log('Showing notification:', title, options);

    event.waitUntil(
        self.registration.showNotification(title, options)
            .then(() => {
                console.log('Notification shown successfully');
            })
            .catch(error => {
                console.error('Error showing notification:', error);
            })
    );
});

self.addEventListener("notificationclick", function (event) {
    console.log('Notification clicked:', event.notification, 'Action:', event.action);
    
    event.notification.close();
    
    let targetUrl = event.notification.data.url || '/';
    
    // Handle different actions
    if (event.action === 'classify') {
        targetUrl = '/structures/telescope'; // Direct to classification page
    } else if (event.action === 'dismiss') {
        // Just close the notification, don't open anything
        return;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Check if there's already a window open
                for (let client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        // Focus existing window and navigate
                        client.focus();
                        return client.navigate(targetUrl);
                    }
                }
                // No existing window, open a new one
                return clients.openWindow(targetUrl);
            })
    );
});