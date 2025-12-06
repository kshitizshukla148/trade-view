# ChartGPT API Setup Guide

## Quick Setup Steps

### Step 1: Get Your API Key

1. **Visit ChartGPT Website**
   - Go to: https://gptchart.ai/account/api-keys
   - Or visit: https://gptchart.ai and navigate to API Keys section

2. **Sign Up / Log In**
   - Create a new account if you don't have one
   - Or log in with your existing account

3. **Generate API Key**
   - Click on "Generate API Key" or "Create New Key"
   - Copy the API key (it will look like: `sk-xxxxxxxxxxxxxxxxxxxxx`)
   - **Important:** Save it securely - you won't be able to see it again!

### Step 2: Add API Key to Your Project

**Option A: Manual Edit (Recommended)**
1. Open the file: `server/.env`
2. Find the line: `CHARTGPT_API_KEY=your-chartgpt-api-key-here`
3. Replace `your-chartgpt-api-key-here` with your actual API key
4. Save the file

**Option B: Using PowerShell**
```powershell
cd server
# Replace YOUR_ACTUAL_API_KEY with your real API key
(Get-Content .env) -replace 'CHARTGPT_API_KEY=your-chartgpt-api-key-here', 'CHARTGPT_API_KEY=YOUR_ACTUAL_API_KEY' | Set-Content .env
```

### Step 3: Restart Your Server

After updating the `.env` file:
1. Stop your server (press `Ctrl+C` in the terminal)
2. Restart it:
   ```bash
   cd server
   npm run dev
   ```

### Step 4: Verify It's Working

1. Open your trading platform in the browser
2. Navigate to any stock's trading page
3. Scroll down to see the "AI Stock Analysis" section
4. The message "Using local analysis..." should disappear
5. You should see enhanced AI insights and recommendations

## Troubleshooting

### API Key Not Working?
- ✅ Make sure there are no extra spaces in the `.env` file
- ✅ Make sure the API key starts with `sk-` (if that's the format)
- ✅ Restart the server after updating `.env`
- ✅ Check that the API key is active on ChartGPT website

### Still Seeing "Using local analysis"?
- The app will fall back to local analysis if:
  - API key is missing
  - API key is invalid
  - API service is unavailable
  - This is normal and the app will still work!

## Need Help?

If you encounter any issues:
1. Check the server console for error messages
2. Verify your API key is correct
3. Make sure the server was restarted after updating `.env`

## Alternative: Continue Without API Key

The app works perfectly fine without the ChartGPT API key! It will use local analysis algorithms that provide:
- Technical indicators (RSI, Moving Averages)
- Trend analysis
- Basic recommendations
- Support/Resistance levels

The API key is optional and only needed for enhanced AI-powered insights.

