#!/bin/bash

# Events Sync Script
# 賽事同步腳本
# This script manually triggers event synchronization

# Configuration
API_URL="${API_URL:-http://localhost:3000/api/events/sync}"
SECRET="${EVENTS_SYNC_SECRET:-}"

echo "=========================================="
echo "Events Sync Script"
echo "賽事同步腳本"
echo "=========================================="
echo ""

# Check if running in production
if [ -n "$VERCEL" ]; then
  echo "⚠️  Running in Vercel environment"
  echo "⚠️  在 Vercel 環境中運行"
  echo "   Use Vercel Cron Jobs for automatic sync"
  echo "   使用 Vercel Cron Jobs 進行自動同步"
  echo ""
fi

# Build request URL
if [ -n "$SECRET" ]; then
  REQUEST_URL="${API_URL}?secret=${SECRET}"
  echo "Using secret authentication"
  echo "使用密鑰認證"
else
  REQUEST_URL="${API_URL}"
  echo "No secret provided, using public endpoint"
  echo "未提供密鑰，使用公開端點"
fi

echo ""
echo "Request URL: ${REQUEST_URL}"
echo ""

# Make request
echo "Triggering event sync..."
echo "觸發賽事同步..."
echo ""

RESPONSE=$(curl -s -X POST "$REQUEST_URL" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}")

# Extract HTTP status
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo ""

# Parse and display response
if command -v jq &> /dev/null; then
  echo "Response:"
  echo "$BODY" | jq '.'
else
  echo "Response:"
  echo "$BODY"
fi

echo ""

# Check result
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Sync completed successfully!"
  echo "✅ 同步成功完成！"
  
  # Extract result if jq is available
  if command -v jq &> /dev/null; then
    CREATED=$(echo "$BODY" | jq -r '.result.created // 0')
    UPDATED=$(echo "$BODY" | jq -r '.result.updated // 0')
    ERRORS=$(echo "$BODY" | jq -r '.result.errors // 0')
    TOTAL=$(echo "$BODY" | jq -r '.result.total // 0')
    
    echo ""
    echo "Results:"
    echo "結果："
    echo "  Created: $CREATED events"
    echo "  創建: $CREATED 個賽事"
    echo "  Updated: $UPDATED events"
    echo "  更新: $UPDATED 個賽事"
    echo "  Errors: $ERRORS"
    echo "  錯誤: $ERRORS"
    echo "  Total: $TOTAL events processed"
    echo "  總計: 處理了 $TOTAL 個賽事"
  fi
else
  echo "❌ Sync failed!"
  echo "❌ 同步失敗！"
  echo ""
  echo "Please check the error message above."
  echo "請檢查上方的錯誤訊息。"
fi

echo ""
echo "=========================================="

