package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/SherClockHolmes/webpush-go"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type LinkedAnomaly struct {
	ID        int64
	AuthorID  string
	Automaton string
	Content   string
}

type NewSubscription struct {
	ProfileID string
	Endpoint  string
	Auth      string
	P256dh    string
}

func sendAnomalyUnlockNotifications(db *sql.DB, vapidPub, vapidPriv string) {
	query := `
	SELECT la.id, la.author, la.automaton, a.content
	FROM linked_anomalies la
	JOIN anomalies a ON a.id = la.anomaly_id
	WHERE la.unlocked = true 
		AND la.unlock_time IS NOT NULL 
		AND la.unlock_time > NOW() - INTERVAL '1 hour';
	`

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Query failed: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var la LinkedAnomaly
		if err := rows.Scan(&la.ID, &la.AuthorID, &la.Automaton, &la.Content); err != nil {
			log.Println("Scan failed:", err)
			continue
		}

		var sub NewSubscription
		err := db.QueryRow(`
			SELECT profile_id, endpoint, auth, p256dh
			FROM push_subscriptions
			WHERE profile_id = $1
			LIMIT 1;
		`, la.AuthorID).Scan(&sub.ProfileID, &sub.Endpoint, &sub.Auth, &sub.P256dh)

		if err != nil {
			log.Printf("No subscription for user %s\n", la.AuthorID)
			continue
		}

		message := map[string]string{
			"title": "Discovery from your " + la.Automaton,
			"body":  "Unlocked: " + la.Content,
			"url":   "https://starsailors.app/posts/" + fmt.Sprint(la.ID),
			"icon":  "https://starsailors.space/assets/Captn.jpg",
		}
		payload, _ := json.Marshal(message)

		resp, err := webpush.SendNotification(payload, &webpush.Subscription{
			Endpoint: sub.Endpoint,
			Keys: webpush.Keys{
				Auth:   sub.Auth,
				P256dh: sub.P256dh,
			},
		}, &webpush.Options{
			Subscriber:      "mailto:admin@starsailors.app",
			VAPIDPublicKey:  vapidPub,
			VAPIDPrivateKey: vapidPriv,
			TTL:             60,
		})

		if err != nil {
			log.Printf("Push send failed for anomaly %d: %v\n", la.ID, err)
			continue
		}
		resp.Body.Close()
		log.Printf("Successfully sent anomaly notification for %d\n", la.ID)
	}
}

func sendWelcomeNotifications(db *sql.DB, vapidPub, vapidPriv string) {
	// Find subscriptions that were created recently (last 2 minutes for testing)
	// Use DISTINCT ON to get only one subscription per unique endpoint
	query := `
		SELECT DISTINCT ON (endpoint) profile_id, endpoint, auth, p256dh
		FROM push_subscriptions
		WHERE created_at > NOW() - INTERVAL '2 minutes'
		ORDER BY endpoint, created_at DESC;
	`

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Failed to query new subscriptions: %v", err)
		return
	}
	defer rows.Close()

	var subs []NewSubscription
	for rows.Next() {
		var s NewSubscription
		if err := rows.Scan(&s.ProfileID, &s.Endpoint, &s.Auth, &s.P256dh); err != nil {
			log.Println("Scan failed: ", err)
			continue
		}
		subs = append(subs, s)
	}

	if len(subs) == 0 {
		return // No output when no new subscriptions
	}

	log.Printf("Found %d recent subscriptions, sending welcome notifications", len(subs))

	for _, sub := range subs {
		message := map[string]string{
			"title": "Welcome to Star Sailors",
			"body":  "You'll now receive notifications about your discoveries",
			"url":   "https://starsailors.space",
			"icon":  "https://starsailors.space/assets/Captn.jpg",
		}
		payload, _ := json.Marshal(message)

		resp, err := webpush.SendNotification(payload, &webpush.Subscription{
			Endpoint: sub.Endpoint,
			Keys: webpush.Keys{
				Auth:   sub.Auth,
				P256dh: sub.P256dh,
			},
		}, &webpush.Options{
			Subscriber:      "mailto:admin@starsailors.app",
			VAPIDPublicKey:  vapidPub,
			VAPIDPrivateKey: vapidPriv,
			TTL:             60,
		})

		if err != nil {
			log.Printf("Welcome push failed for %s: %v\n", sub.ProfileID, err)
			continue
		}
		resp.Body.Close()
		log.Printf("Sent welcome notification to %s\n", sub.ProfileID)
	}
}

func main() {
	_ = godotenv.Load("../.env.local")
	_ = godotenv.Load(".env.local")

	dbURL := os.Getenv("SUPABASE_DB_URL")
	vapidPub := os.Getenv("NEXT_PUBLIC_VAPID_PUBLIC_KEY")
	vapidPriv := os.Getenv("VAPID_PRIVATE_KEY")

	if dbURL == "" || vapidPriv == "" || vapidPub == "" {
		log.Fatal("Missing required environment variables")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("DB connection failed:", err)
	}
	defer db.Close()

	log.Println("Push notification service started. DB connected.")
	log.Println("Checking for new subscriptions and anomaly unlocks every 30 seconds...")

	// Run continuously, checking every 30 seconds
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	// Run once immediately on startup
	log.Println("Running initial check...")
	sendAnomalyUnlockNotifications(db, vapidPub, vapidPriv)
	sendWelcomeNotifications(db, vapidPub, vapidPriv)

	// Then run on ticker
	for range ticker.C {
		log.Println("Running periodic check...")
		sendAnomalyUnlockNotifications(db, vapidPub, vapidPriv)
		sendWelcomeNotifications(db, vapidPub, vapidPriv)
	}
}
