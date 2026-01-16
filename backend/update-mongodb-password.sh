#!/bin/bash

# Script to update MongoDB password in .env file

echo "🔐 MongoDB Atlas Password Updater"
echo "=================================="
echo ""
echo "This script will help you update your MongoDB Atlas password in the .env file."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found in the current directory"
    exit 1
fi

# Prompt for password
read -sp "Enter your MongoDB Atlas password: " PASSWORD
echo ""

if [ -z "$PASSWORD" ]; then
    echo "❌ Error: Password cannot be empty"
    exit 1
fi

# URL encode the password (handle special characters)
ENCODED_PASSWORD=$(printf '%s' "$PASSWORD" | jq -sRr @uri 2>/dev/null || node -e "console.log(encodeURIComponent(process.argv[1]))" "$PASSWORD" 2>/dev/null || echo "$PASSWORD")

# Update the .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|<db_password>|${ENCODED_PASSWORD}|g" .env
else
    # Linux
    sed -i "s|<db_password>|${ENCODED_PASSWORD}|g" .env
fi

echo "✅ Password updated successfully!"
echo ""
echo "📝 Updated MONGODB_URI in .env file"
echo ""
echo "🔄 Please restart your server:"
echo "   npm start"
echo ""

