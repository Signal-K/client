#!/bin/bash

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Function to run supabase commands with password
run_supabase_db() {
    SUPABASE_DB_PASSWORD="$SUPABASE_DB_PASSWORD" supabase "$@"
}

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create it with SUPABASE_DB_PASSWORD."
    exit 1
fi

# Usage information
if [ $# -eq 0 ]; then
    echo "Usage: $0 <supabase-command> [args...]"
    echo ""
    echo "Examples:"
    echo "  $0 db pull --schema public,auth,storage"
    echo "  $0 db push"
    echo "  $0 migration list"
    echo "  $0 db reset"
    echo ""
    echo "This script automatically loads the SUPABASE_DB_PASSWORD from .env (now set to fMr7jFLl97lzdx8u)"
    exit 1
fi

# Run the command with the password loaded
run_supabase_db "$@"
