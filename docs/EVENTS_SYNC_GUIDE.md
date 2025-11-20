# Events 自動同步操作指南
# Events Auto-Sync Guide

## 概述 / Overview

系統可以透過 TheSportsDB API V1 自動獲取格鬥賽事（Boxing、UFC、MMA）並建立到資料庫中。

The system can automatically fetch combat sports events (Boxing, UFC, MMA) from TheSportsDB API V1 and create them in the database.

## 設置步驟 / Setup Steps

### 1. 環境變數設置 / Environment Variables

在 `.env.local` 文件中設置（可選）：

```bash
# TheSportsDB API Key (可選，默認使用免費 key "123")
# Optional, defaults to free key "123"
THESPORTSDB_API_KEY="123"

# Events Sync Secret (可選，用於保護同步端點)
# Optional, for protecting sync endpoint
EVENTS_SYNC_SECRET="your-secret-token-here"
```

**注意**：
- `THESPORTSDB_API_KEY` 是可選的，如果不設置，系統會使用免費的 API key `"123"`
- `EVENTS_SYNC_SECRET` 是可選的，如果設置了，手動觸發同步時需要提供這個 secret

### 2. 手動觸發同步 / Manual Sync

#### 方法 1: 使用 curl（本地開發）

```bash
# 如果沒有設置 EVENTS_SYNC_SECRET
curl -X POST http://localhost:3000/api/events/sync

# 如果設置了 EVENTS_SYNC_SECRET
curl -X POST "http://localhost:3000/api/events/sync?secret=your-secret-token-here"
```

#### 方法 2: 使用瀏覽器（本地開發）

打開瀏覽器開發者工具（F12），在 Console 中執行：

```javascript
fetch('/api/events/sync', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    secret: 'your-secret-token-here' // 如果設置了 EVENTS_SYNC_SECRET
  })
})
.then(res => res.json())
.then(data => console.log('Sync result:', data))
.catch(err => console.error('Error:', err));
```

#### 方法 3: 使用 Postman 或類似工具

1. URL: `POST http://localhost:3000/api/events/sync`
2. Headers: `Content-Type: application/json`
3. Body (可選):
```json
{
  "secret": "your-secret-token-here"
}
```

### 3. 自動同步設置（Vercel 部署） / Auto-Sync Setup (Vercel)

系統已經配置了 Vercel Cron Jobs，會每天 UTC 2:00 AM 自動執行同步。

The system is already configured with Vercel Cron Jobs to automatically sync daily at UTC 2:00 AM.

#### 檢查 Cron Job 配置

`vercel.json` 文件已包含：

```json
{
  "crons": [
    {
      "path": "/api/events/sync",
      "schedule": "0 2 * * *"
    }
  ]
}
```

#### 在 Vercel 中啟用 Cron Jobs

1. 登入 Vercel Dashboard
2. 選擇你的專案
3. 前往 **Settings** → **Cron Jobs**
4. 確認 Cron Job 已啟用

#### 修改同步時間

編輯 `vercel.json` 中的 `schedule`：

```json
{
  "crons": [
    {
      "path": "/api/events/sync",
      "schedule": "0 2 * * *"  // 每天 UTC 2:00 AM
      // "0 */6 * * *"        // 每 6 小時
      // "0 0 * * *"          // 每天 UTC 0:00
    }
  ]
}
```

Cron 表達式格式：`分 時 日 月 星期`

### 4. 測試同步功能 / Test Sync

#### 測試 API 連接

```bash
# 測試 UFC API
GET http://localhost:3000/api/events/test-ufc-api
```

這個端點會顯示：
- 原始 API 回應
- 轉換後的數據
- 資料庫中的事件

#### 檢查同步結果

同步完成後，訪問：

```bash
# 查看事件列表
GET http://localhost:3000/events
```

## 同步流程 / Sync Process

1. **獲取 API 數據**
   - 從 TheSportsDB API V1 獲取格鬥賽事
   - 日期範圍：今天到未來 3 個月

2. **數據轉換**
   - 將 API 數據轉換為統一格式
   - 識別運動類型（boxing/UFC/MMA）

3. **資料庫操作**
   - 檢查事件是否已存在（根據 `external_id` 和 `external_source`）
   - 如果存在：更新現有事件
   - 如果不存在：創建新事件

4. **緩存更新**
   - 清除事件緩存標籤
   - 確保前端顯示最新數據

## 同步結果 / Sync Results

同步 API 會返回：

```json
{
  "success": true,
  "message": "Events synchronized successfully",
  "result": {
    "created": 5,    // 新創建的事件數
    "updated": 2,   // 更新的事件數
    "errors": 0,    // 錯誤數
    "total": 7      // 總處理數
  },
  "timestamp": "2025-01-XX..."
}
```

## 故障排除 / Troubleshooting

### 問題 1: 同步後沒有事件顯示

**檢查**：
1. 查看同步 API 回應中的 `result.created` 和 `result.updated`
2. 檢查資料庫中是否有事件：
   ```sql
   SELECT * FROM "Event" WHERE "sport_type" IN ('boxing', 'ufc', 'mma') ORDER BY "fight_date" ASC;
   ```
3. 檢查日期範圍是否正確（事件日期是否在查詢範圍內）

### 問題 2: API 請求失敗

**檢查**：
1. 訪問 `/api/events/test-ufc-api` 查看 API 連接狀態
2. 檢查環境變數 `THESPORTSDB_API_KEY` 是否正確
3. 查看伺服器日誌中的錯誤訊息

### 問題 3: Cron Job 沒有執行

**檢查**：
1. Vercel Dashboard → Cron Jobs 查看執行歷史
2. 確認 `vercel.json` 配置正確
3. 檢查 Vercel 專案設置中的 Cron Jobs 是否啟用

### 問題 4: 事件日期不正確

**檢查**：
1. 查看 `/api/events/test-ufc-api` 中的原始 API 數據
2. 檢查日期解析邏輯（`strTimestamp` 或 `dateEvent`）
3. 查看伺服器日誌中的日期轉換警告

## 日誌查看 / View Logs

### 本地開發

查看終端機輸出，會顯示：
- `[Sync] Fetching events from...`
- `[Sync] Fetched X events from API`
- `[Sync] Synchronization completed:`

### Vercel 部署

1. Vercel Dashboard → 你的專案
2. **Deployments** → 選擇最新的部署
3. **Functions** → 查看 `/api/events/sync` 的日誌

## 手動同步腳本 / Manual Sync Script

如果需要，可以創建一個簡單的腳本來手動觸發同步：

```bash
#!/bin/bash
# sync-events.sh

API_URL="http://localhost:3000/api/events/sync"
SECRET="your-secret-token-here"

echo "Triggering event sync..."
curl -X POST "$API_URL?secret=$SECRET" \
  -H "Content-Type: application/json" \
  | jq '.'

echo "Sync completed!"
```

## 注意事項 / Notes

1. **API 限制**：TheSportsDB V1 API 免費版有請求限制，請勿過於頻繁地調用
2. **數據保留**：系統會保留歷史數據，不會刪除已存在的事件
3. **增量更新**：同步是增量的，只會更新或創建新事件，不會刪除現有事件
4. **日期範圍**：目前設置為獲取未來 3 個月的賽事，可以在 `lib/services/events.ts` 中修改

## 相關文件 / Related Files

- `app/api/events/sync/route.ts` - 同步 API 端點
- `lib/services/events.ts` - 事件服務層
- `lib/adapters/thesportsdb.ts` - TheSportsDB API 適配器
- `vercel.json` - Vercel Cron Jobs 配置

