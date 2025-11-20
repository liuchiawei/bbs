@echo off
REM Events Sync Script (Batch)
REM 賽事同步腳本 (批處理)
REM This script manually triggers event synchronization

echo ==========================================
echo Events Sync Script
echo 賽事同步腳本
echo ==========================================
echo.

REM Configuration
set API_URL=http://localhost:3000/api/events/sync
set SECRET=%EVENTS_SYNC_SECRET%

if defined SECRET (
    set REQUEST_URL=%API_URL%?secret=%SECRET%
    echo Using secret authentication
    echo 使用密鑰認證
) else (
    set REQUEST_URL=%API_URL%
    echo No secret provided, using public endpoint
    echo 未提供密鑰，使用公開端點
)

echo.
echo Request URL: %REQUEST_URL%
echo.

echo Triggering event sync...
echo 觸發賽事同步...
echo.

REM Check if curl is available
where curl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: curl is not installed or not in PATH
    echo 錯誤: curl 未安裝或不在 PATH 中
    echo.
    echo Please install curl or use PowerShell instead:
    echo 請安裝 curl 或使用 PowerShell：
    echo   powershell -ExecutionPolicy Bypass -File scripts\sync-events.ps1
    echo.
    pause
    exit /b 1
)

REM Make request
curl -X POST "%REQUEST_URL%" -H "Content-Type: application/json"

echo.
echo.
echo ==========================================
echo Sync completed!
echo 同步完成！
echo ==========================================
echo.
echo Check the response above for results.
echo 請查看上方的回應以獲取結果。
echo.
pause

