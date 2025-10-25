#!/bin/bash

# Update and verify Supabase CLI and local dependencies
# This prevents "local client out of date" errors
# Usage: ./scripts/update-tools.sh

set -e

echo "🔄 Updating Development Tools..."
echo "=================================="
echo ""

# Check if Homebrew is available (macOS)
if command -v brew &> /dev/null; then
    echo "📦 Updating Supabase CLI via Homebrew..."
    brew upgrade supabase-cli 2>/dev/null || echo "   ℹ️  Supabase CLI already up to date"
else
    echo "⚠️  Homebrew not found - please update Supabase CLI manually"
    echo "   Visit: https://supabase.com/docs/guides/cli"
fi

echo ""
echo "📦 Updating Node.js dependencies..."
yarn upgrade

echo ""
echo "✅ All tools updated successfully"
echo ""
echo "📋 Versions:"
echo "   Node: $(node --version)"
echo "   Yarn: $(yarn --version)"
if command -v supabase &> /dev/null; then
    echo "   Supabase CLI: $(supabase --version)"
fi

echo ""
echo "💡 Tip: Run 'make clean-build' after dependency updates"
