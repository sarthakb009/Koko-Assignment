#!/bin/bash

# Script to update Gemini API key in .env file

echo "🔑 Google Gemini API Key Updater"
echo "=================================="
echo ""
echo "This script will help you update your Gemini API key in the .env file."
echo ""
echo "📝 To get your API key:"
echo "   1. Visit: https://makersuite.google.com/app/apikey"
echo "   2. Sign in with your Google account"
echo "   3. Click 'Create API Key' or 'Get API Key'"
echo "   4. Copy the API key"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found in the current directory"
    exit 1
fi

# Prompt for API key
read -sp "Enter your Gemini API key: " API_KEY
echo ""

if [ -z "$API_KEY" ]; then
    echo "❌ Error: API key cannot be empty"
    exit 1
fi

# Update the .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|GEMINI_API_KEY=.*|GEMINI_API_KEY=${API_KEY}|g" .env
else
    # Linux
    sed -i "s|GEMINI_API_KEY=.*|GEMINI_API_KEY=${API_KEY}|g" .env
fi

echo "✅ API key updated successfully!"
echo ""
echo "🔄 Please restart your server:"
echo "   npm start"
echo ""

