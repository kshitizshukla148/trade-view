#!/bin/bash
# Bash script to update ChartGPT API key in .env file
# Usage: ./update-api-key.sh "your-api-key-here"

if [ -z "$1" ]; then
    echo "Error: API key is required"
    echo "Usage: ./update-api-key.sh \"your-api-key-here\""
    exit 1
fi

API_KEY="$1"
ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found"
    echo "Please make sure you're running this script from the server directory."
    exit 1
fi

echo "Updating ChartGPT API key in .env file..."

# Update the API key using sed (works on Linux/Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/^CHARTGPT_API_KEY=.*/CHARTGPT_API_KEY=$API_KEY/" "$ENV_FILE"
else
    # Linux
    sed -i "s/^CHARTGPT_API_KEY=.*/CHARTGPT_API_KEY=$API_KEY/" "$ENV_FILE"
fi

echo "✓ API key updated successfully!"
echo ""
echo "Next steps:"
echo "1. Restart your server (Ctrl+C, then 'npm run dev')"
echo "2. Check the AI Stock Analysis section in your app"

