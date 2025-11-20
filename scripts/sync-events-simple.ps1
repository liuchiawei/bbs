# Simple Events Sync Script (PowerShell)
# 簡單的賽事同步腳本 (PowerShell)
# This script manually triggers event synchronization

$API_URL = "http://localhost:3000/api/events/sync"

Write-Host "Triggering event sync..." -ForegroundColor Cyan
Write-Host "觸發賽事同步..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $API_URL -Method Post -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "✅ Sync completed successfully!" -ForegroundColor Green
    Write-Host "✅ 同步成功完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host "  Created: $($response.result.created) events" -ForegroundColor White
    Write-Host "  Updated: $($response.result.updated) events" -ForegroundColor White
    Write-Host "  Errors: $($response.result.errors)" -ForegroundColor $(if ($response.result.errors -gt 0) { "Red" } else { "Green" })
    Write-Host "  Total: $($response.result.total) events processed" -ForegroundColor White
    
} catch {
    Write-Host "❌ Sync failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"

