# Test Pulse V2 API - PowerShell Script

Write-Host "Testing Pulse V2 API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:8000/status/health"
Write-Host "   Status: $($health.status)" -ForegroundColor Green
Write-Host ""

# Test 2: Run Forecast
Write-Host "2. Running Forecast Pipeline..." -ForegroundColor Yellow
$body = @{
    city = "Mumbai"
    horizon = 7
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:8000/forecast/run" -Method Post -ContentType "application/json" -Body $body
    Write-Host "   Forecast completed!" -ForegroundColor Green
    Write-Host "   Risk Level: $($result.decision.risk_level)" -ForegroundColor Cyan
    Write-Host "   Peak Day: $($result.forecast_summary.peak_day)" -ForegroundColor Cyan
    Write-Host "   Delta: $($result.forecast_summary.delta_pct)%" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Full response saved to: forecast_result.json" -ForegroundColor Gray
    $result | ConvertTo-Json -Depth 10 | Out-File "forecast_result.json"
}
catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Check the uvicorn terminal to see if Groq API was called!" -ForegroundColor Magenta
