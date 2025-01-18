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
        icon: data?.icon || '/assets/Captn.jpg',
        badge: data?.icon || '/assets/Captn.jpg',
        data: { url: data?.url || "/" },
        requireInteraction: true,
        silent: false
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
    console.log('Notification clicked:', event.notification);
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});