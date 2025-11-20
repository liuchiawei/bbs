# Events Sync Script (PowerShell)
# 賽事同步腳本 (PowerShell)
# This script manually triggers event synchronization

# Configuration
$API_URL = if ($env:API_URL) { $env:API_URL } else { "http://localhost:3000/api/events/sync" }
$SECRET = if ($env:EVENTS_SYNC_SECRET) { $env:EVENTS_SYNC_SECRET } else { "" }

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Events Sync Script" -ForegroundColor Cyan
Write-Host "賽事同步腳本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in production
if ($env:VERCEL) {
    Write-Host "⚠️  Running in Vercel environment" -ForegroundColor Yellow
    Write-Host "⚠️  在 Vercel 環境中運行" -ForegroundColor Yellow
    Write-Host "   Use Vercel Cron Jobs for automatic sync" -ForegroundColor Yellow
    Write-Host "   使用 Vercel Cron Jobs 進行自動同步" -ForegroundColor Yellow
    Write-Host ""
}

# Build request URL
if ($SECRET) {
    $REQUEST_URL = "${API_URL}?secret=${SECRET}"
    Write-Host "Using secret authentication" -ForegroundColor Green
    Write-Host "使用密鑰認證" -ForegroundColor Green
} else {
    $REQUEST_URL = $API_URL
    Write-Host "No secret provided, using public endpoint" -ForegroundColor Yellow
    Write-Host "未提供密鑰，使用公開端點" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Request URL: $REQUEST_URL" -ForegroundColor Gray
Write-Host ""

# Make request
Write-Host "Triggering event sync..." -ForegroundColor Cyan
Write-Host "觸發賽事同步..." -ForegroundColor Cyan
Write-Host ""

try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri $REQUEST_URL -Method Post -Headers $headers -ErrorAction Stop
    
    Write-Host ""
    Write-Host "✅ Sync completed successfully!" -ForegroundColor Green
    Write-Host "✅ 同步成功完成！" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host "結果：" -ForegroundColor Cyan
    Write-Host "  Created: $($response.result.created) events" -ForegroundColor White
    Write-Host "  創建: $($response.result.created) 個賽事" -ForegroundColor White
    Write-Host "  Updated: $($response.result.updated) events" -ForegroundColor White
    Write-Host "  更新: $($response.result.updated) 個賽事" -ForegroundColor White
    Write-Host "  Errors: $($response.result.errors)" -ForegroundColor $(if ($response.result.errors -gt 0) { "Red" } else { "Green" })
    Write-Host "  錯誤: $($response.result.errors)" -ForegroundColor $(if ($response.result.errors -gt 0) { "Red" } else { "Green" })
    Write-Host "  Total: $($response.result.total) events processed" -ForegroundColor White
    Write-Host "  總計: 處理了 $($response.result.total) 個賽事" -ForegroundColor White
    
    Write-Host ""
    Write-Host "Full Response:" -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host ""
    Write-Host "❌ Sync failed!" -ForegroundColor Red
    Write-Host "❌ 同步失敗！" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "錯誤: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

