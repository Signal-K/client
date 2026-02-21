#!/bin/bash

# Export all Supabase data from cloud project
# Usage (from repo root): ./scripts/data/export_supabase_data.sh

PROJECT_URL="https://hlufptwhzkpkkjztimzo.supabase.co"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsdWZwdHdoemtwa2tqenRpbXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyOTk3NTUsImV4cCI6MjAzMTg3NTc1NX0.v_NDVWjIU_lJQSPbJ_Y6GkW3axrQWKXfXVsBEAbFv_I"

# Create export directory
mkdir -p supabase_export/tables
mkdir -p supabase_export/storage
mkdir -p supabase_export/auth

echo "Starting Supabase data export..."

# List of all tables from the schema
TABLES=(
    "routes"
    "nps_analytics"
    "unlocked_technologies"
    "inventory"
    "anomalies"
    "votes"
    "push_subscriptions"
    "comments"
    "zoo"
    "notification_rejections"
    "nps_surveys"
    "linked_anomalies"
    "sectors"
    "uploads"
    "profiles"
    "user_anomalies"
    "mineralDeposits"
    "missions"
    "classifications"
    "push_anomaly_log"
    "researched"
    "referrals"
    "events"
)

# Export all tables
for table in "${TABLES[@]}"; do
    echo "Exporting table: $table"
    curl -s "${PROJECT_URL}/rest/v1/${table}" \
        -H "apikey: ${API_KEY}" \
        -H "Authorization: Bearer ${API_KEY}" \
        > "supabase_export/tables/${table}.json"
    
    # Check if export was successful
    if [ $? -eq 0 ]; then
        echo "✓ Successfully exported $table"
    else
        echo "✗ Failed to export $table"
    fi
done

echo "Table export completed!"

# Get storage buckets list
echo "Fetching storage buckets..."
curl -s "${PROJECT_URL}/storage/v1/bucket" \
    -H "apikey: ${API_KEY}" \
    -H "Authorization: Bearer ${API_KEY}" \
    > "supabase_export/storage/buckets.json"

# Extract bucket names and export their contents
if [ -f "supabase_export/storage/buckets.json" ]; then
    # Parse bucket names from JSON
    bucket_names=$(cat supabase_export/storage/buckets.json | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    
    for bucket in $bucket_names; do
        echo "Exporting bucket: $bucket"
        mkdir -p "supabase_export/storage/$bucket"
        
        # Get list of objects in bucket
        curl -s "${PROJECT_URL}/storage/v1/object/list/${bucket}" \
            -H "apikey: ${API_KEY}" \
            -H "Authorization: Bearer ${API_KEY}" \
            > "supabase_export/storage/${bucket}/objects.json"
        
        echo "✓ Listed objects for bucket: $bucket"
    done
fi

echo "Storage export completed!"

# Try to export auth users (may need different permissions)
echo "Attempting to export auth users..."
curl -s "${PROJECT_URL}/auth/v1/admin/users" \
    -H "apikey: ${API_KEY}" \
    -H "Authorization: Bearer ${API_KEY}" \
    > "supabase_export/auth/users.json" 2>/dev/null

if [ $? -eq 0 ] && [ -s "supabase_export/auth/users.json" ]; then
    echo "✓ Successfully exported auth users"
else
    echo "⚠ Could not export auth users (may need service role key)"
fi

echo ""
echo "Export Summary:"
echo "==============="
echo "Tables: $(ls supabase_export/tables/ | wc -l) files"
echo "Storage: $(ls supabase_export/storage/ 2>/dev/null | wc -l) buckets"
echo "Auth: $(ls supabase_export/auth/ 2>/dev/null | wc -l) files"
echo ""
echo "Export completed! Files saved in: supabase_export/"
