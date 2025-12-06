# PowerShell script to update ChartGPT API key in .env file
# Usage: .\update-api-key.ps1 -ApiKey "your-api-key-here"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

$envFile = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env file not found at $envFile" -ForegroundColor Red
    Write-Host "Please make sure you're running this script from the server directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "Updating ChartGPT API key in .env file..." -ForegroundColor Cyan

# Read the current .env file
$content = Get-Content $envFile

# Replace the API key
$updated = $content | ForEach-Object {
    if ($_ -match "^CHARTGPT_API_KEY=") {
        "CHARTGPT_API_KEY=$ApiKey"
    } else {
        $_
    }
}

# Write back to file
$updated | Set-Content $envFile -Encoding UTF8

Write-Host "✓ API key updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your server (Ctrl+C, then 'npm run dev')" -ForegroundColor White
Write-Host "2. Check the AI Stock Analysis section in your app" -ForegroundColor White

