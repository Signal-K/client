#!/bin/bash

# Import all exported Supabase data into local instance
# Usage (from repo root): ./scripts/data/import_supabase_data.sh

LOCAL_URL="http://127.0.0.1:54321"
# You'll need to get the anon key from your local Supabase instance
# Run `supabase status` after starting local instance to get this key
LOCAL_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsaWVudCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjg3MDA1MTY5LCJleHAiOjIwMDI1ODExNjl9.xxx" # Replace with actual local key

# Check if export directory exists
if [ ! -d "supabase_export" ]; then
    echo "❌ Export directory not found. Please run ./scripts/data/export_supabase_data.sh first."
    exit 1
fi

echo "Starting Supabase data import to local instance..."
echo "⚠️  Make sure your local Supabase instance is running (supabase start)"
echo ""

# Check if local Supabase is running
curl -s "$LOCAL_URL/rest/v1/" > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Local Supabase instance not accessible at $LOCAL_URL"
    echo "Please start it with: supabase start"
    exit 1
fi

echo "✅ Local Supabase instance is running"
echo ""

# Import tables in dependency order (to handle foreign keys)
IMPORT_ORDER=(
    "profiles"      # Base user profiles (no dependencies)
    "anomalies"     # Base anomaly data
    "classifications" # References anomalies and profiles
    "uploads"       # References anomalies and profiles
    "comments"      # References classifications, profiles, uploads
    "inventory"     # References profiles, anomalies, classifications
    "votes"         # References profiles, classifications, anomalies, uploads
    "user_anomalies" # References profiles and anomalies
    "linked_anomalies" # References profiles, anomalies, classifications
    "missions"      # References profiles
    "routes"        # References profiles and anomalies
    "zoo"          # References profiles, inventory, uploads
    "sectors"       # References anomalies
    "mineralDeposits" # References anomalies and profiles
    "researched"    # References profiles
    "unlocked_technologies" # References users
    "events"        # References anomalies and classifications
    "push_subscriptions" # References profiles
    "notification_rejections" # References profiles
    "nps_surveys"   # References profiles
    "referrals"     # References profiles
    "push_anomaly_log" # No dependencies
    "nps_analytics" # No dependencies
)

# Function to import a table
import_table() {
    local table=$1
    local file="supabase_export/tables/${table}.json"
    
    if [ ! -f "$file" ]; then
        echo "⚠️  File not found: $file"
        return 1
    fi
    
    # Check if file contains data (more than just "[]")
    local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    if [ "$size" -le 2 ]; then
        echo "⚠️  Skipping $table (empty)"
        return 0
    fi
    
    echo "Importing table: $table"
    
    # Import data via REST API
    curl -s -X POST "$LOCAL_URL/rest/v1/$table" \
        -H "apikey: $LOCAL_ANON_KEY" \
        -H "Authorization: Bearer $LOCAL_ANON_KEY" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=minimal" \
        --data "@$file" > /dev/null
    
    if [ $? -eq 0 ]; then
        # Count imported records
        local count=$(jq '. | length' "$file" 2>/dev/null || echo "unknown")
        echo "✅ Successfully imported $table ($count records)"
    else
        echo "❌ Failed to import $table"
    fi
}

# Import all tables in order
for table in "${IMPORT_ORDER[@]}"; do
    import_table "$table"
done

echo ""
echo "Import Summary:"
echo "==============="

# Show table counts
echo "Local database record counts:"
for table in "${IMPORT_ORDER[@]}"; do
    count=$(curl -s "$LOCAL_URL/rest/v1/$table?select=count" \
        -H "apikey: $LOCAL_ANON_KEY" \
        -H "Authorization: Bearer $LOCAL_ANON_KEY" \
        -H "Prefer: count=exact" | jq -r '.[0].count // 0' 2>/dev/null || echo "0")
    printf "  %-25s %s records\n" "$table:" "$count"
done

echo ""
echo "📋 Next steps:"
echo "1. Verify data integrity by checking key tables"
echo "2. Update any API keys or configurations as needed"
echo "3. Test your application with the imported data"
echo ""
echo "🔗 Access your local Supabase:"
echo "  Studio: http://127.0.0.1:54323"
echo "  API: $LOCAL_URL"
echo ""
