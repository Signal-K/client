package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/supabase-community/supabase-go"
)

func main() {
	url := os.Getenv("SUPABASE_URL")
	key := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	if url == "" || key == "" {
		fmt.Println("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars")
		os.Exit(1)
	}

	client := supabase.CreateClient(url, key)
	ctx := context.Background()

	// Only run if it's Sunday 00:00 AEST
	loc, err := time.LoadLocation("Australia/Sydney")
	if err != nil {
		fmt.Println("Failed to load Australia/Sydney timezone:", err)
		os.Exit(1)
	}
	current := time.Now().In(loc)
	if !(current.Weekday() == time.Sunday && current.Hour() == 0 && current.Minute() == 0) {
		fmt.Println("Not Sunday 00:00 AEST, skipping deletion.")
		return
	}

	// Delete all rows in push_anomaly_log
	res, err := client.From("push_anomaly_log").Delete().Execute(ctx)
	if err != nil {
		fmt.Println("Error deleting push_anomaly_log rows:", err)
		os.Exit(1)
	}
	fmt.Println("Deleted all rows in push_anomaly_log.", res)
}
