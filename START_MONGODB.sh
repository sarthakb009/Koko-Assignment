#!/bin/bash

# MongoDB Startup Script
# This script helps start MongoDB on macOS

echo "🐾 Starting MongoDB for Vet Chatbot..."

# Method 1: Try starting via brew services
echo "Attempting to start MongoDB service..."
if brew services start mongodb-community 2>/dev/null; then
    echo "✅ MongoDB started successfully via brew services"
    exit 0
fi

# Method 2: Try starting mongod directly
echo "Trying to start MongoDB directly..."
if command -v mongod &> /dev/null; then
    # Find the config file
    CONFIG_FILE="/opt/homebrew/etc/mongod.conf"
    if [ -f "$CONFIG_FILE" ]; then
        mongod --config "$CONFIG_FILE" --fork --logpath /opt/homebrew/var/log/mongodb/mongo.log
        echo "✅ MongoDB started directly"
        echo "   Check logs: tail -f /opt/homebrew/var/log/mongodb/mongo.log"
        exit 0
    else
        # Try default paths
        mongod --dbpath /opt/homebrew/var/mongodb --fork --logpath /opt/homebrew/var/log/mongodb/mongo.log
        echo "✅ MongoDB started with default paths"
        exit 0
    fi
fi

# Method 3: Manual instructions
echo "❌ Could not start MongoDB automatically"
echo ""
echo "Please try one of these options:"
echo ""
echo "Option 1 - Start manually:"
echo "  mongod --dbpath /opt/homebrew/var/mongodb"
echo ""
echo "Option 2 - Fix brew service (run these commands):"
echo "  brew services stop mongodb-community"
echo "  rm ~/Library/LaunchAgents/homebrew.mxcl.mongodb-community.plist"
echo "  brew services start mongodb-community"
echo ""
echo "Option 3 - Use MongoDB Atlas (cloud):"
echo "  1. Go to https://www.mongodb.com/cloud/atlas"
echo "  2. Create a free cluster"
echo "  3. Get connection string"
echo "  4. Update backend/.env with MONGODB_URI"

