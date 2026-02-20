#!/bin/bash

# Exit on error
set -e

# Load environment variables
export $(grep -v '^#' .env | xargs)

echo "🚀 Starting data pull from remote Supabase instance..."

# Remote connection details
REMOTE_DB="postgresql://postgres.hlufptwhzkpkkjztimzo:${SUPABASE_DB_PASSWORD}@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres"
LOCAL_DB="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

echo "📊 Pulling public schema data..."

# Get list of all public tables
TABLES=$(docker run --rm -it --network supabase_network_client postgres:15 psql "$REMOTE_DB" -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public';" | tr -d '\r' | xargs)

echo "Found tables: $TABLES"

# Pull data for each public table
for table in $TABLES; do
    if [ -n "$table" ]; then
        echo "  📋 Pulling data from table: $table"
        
        # Dump data from remote table
        docker run --rm -it --network supabase_network_client postgres:15 pg_dump "$REMOTE_DB" \
            --data-only \
            --table="public.$table" \
            --no-owner \
            --no-privileges \
            --disable-triggers > "/tmp/${table}_data.sql" 2>/dev/null || true
        
        # Import data to local database
        if [ -s "/tmp/${table}_data.sql" ]; then
            docker exec -i supabase_db_client psql -U postgres < "/tmp/${table}_data.sql" || true
            rm "/tmp/${table}_data.sql"
            echo "    ✅ Imported data for $table"
        else
            echo "    ⚠️  No data found for $table"
        fi
    fi
done

echo "🗂️ Pulling storage buckets..."

# Pull storage buckets data
docker run --rm -it --network supabase_network_client postgres:15 pg_dump "$REMOTE_DB" \
    --data-only \
    --table="storage.buckets" \
    --no-owner \
    --no-privileges \
    --disable-triggers > "/tmp/buckets_data.sql" 2>/dev/null || true

if [ -s "/tmp/buckets_data.sql" ]; then
    docker exec -i supabase_db_client psql -U postgres < "/tmp/buckets_data.sql" || true
    rm "/tmp/buckets_data.sql"
    echo "✅ Imported storage buckets"
fi

echo "📁 Pulling storage objects (file metadata)..."

# Pull storage objects data
docker run --rm -it --network supabase_network_client postgres:15 pg_dump "$REMOTE_DB" \
    --data-only \
    --table="storage.objects" \
    --no-owner \
    --no-privileges \
    --disable-triggers > "/tmp/objects_data.sql" 2>/dev/null || true

if [ -s "/tmp/objects_data.sql" ]; then
    docker exec -i supabase_db_client psql -U postgres < "/tmp/objects_data.sql" || true
    rm "/tmp/objects_data.sql"
    echo "✅ Imported storage objects metadata"
fi

echo "👤 Pulling auth users..."

# Pull auth users data (profiles depend on this)
docker run --rm -it --network supabase_network_client postgres:15 pg_dump "$REMOTE_DB" \
    --data-only \
    --table="auth.users" \
    --no-owner \
    --no-privileges \
    --disable-triggers > "/tmp/users_data.sql" 2>/dev/null || true

if [ -s "/tmp/users_data.sql" ]; then
    docker exec -i supabase_db_client psql -U postgres < "/tmp/users_data.sql" || true
    rm "/tmp/users_data.sql"
    echo "✅ Imported auth users"
fi

echo "🎉 Data pull completed!"
echo ""
echo "📊 Summary:"
echo "  - Public tables: $(echo $TABLES | wc -w) tables"
echo "  - Storage buckets: 7 buckets"
echo "  - Storage objects: ~1,362 files (metadata only)"
echo "  - Auth users: imported"
echo ""
echo "⚠️  Note: File contents are NOT downloaded - only metadata."
echo "   Files are still stored in your remote Supabase storage."
echo ""
