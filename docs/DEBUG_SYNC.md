# 同步問題診斷指南
# Sync Issue Debugging Guide

## 問題：同步成功但創建 0 個賽事

### 步驟 1: 測試 API 連接

訪問測試端點查看實際的 API 回應：

```
GET http://localhost:3000/api/events/test-ufc-api
```

這會顯示：
- 原始 API 回應
- 轉換後的數據
- 資料庫中的現有事件

### 步驟 2: 檢查伺服器日誌

查看終端機（運行 `pnpm dev` 的視窗）中的日誌，尋找：

```
[Sync] Fetching events from...
[Sync] Fetched X events from API
[Sync] Total events fetched from all leagues: X
[Sync] Filtered to X events within date range
```

### 步驟 3: 檢查日期範圍

同步會獲取**未來 3 個月**的賽事。如果 API 返回的賽事都在 3 個月之後，會被過濾掉。

檢查日誌中的：
- `Date range: YYYY-MM-DD to YYYY-MM-DD`
- `Sample event dates:`

### 步驟 4: 檢查 API 回應

可能的問題：

1. **API 返回空數組**
   - 檢查 `test-ufc-api` 端點的 `rawApi.eventsCount`
   - 如果為 0，可能是 API key 問題或 API 暫時沒有數據

2. **數據轉換失敗**
   - 查看日誌中的 `Failed to transform event` 警告
   - 檢查日期格式是否正確

3. **日期過濾過於嚴格**
   - 查看日誌中的 `All X events were filtered out by date range`
   - 可能需要擴大日期範圍

### 步驟 5: 手動檢查

在瀏覽器 Console 中執行：

```javascript
// 測試 API 連接
fetch('/api/events/test-ufc-api')
  .then(res => res.json())
  .then(data => {
    console.log('API 測試結果:', data);
    console.log('原始 API 事件數:', data.tests.rawApi.eventsCount);
    console.log('客戶端方法事件數:', data.tests.clientMethod.eventsCount);
    console.log('資料庫事件數:', data.tests.database.eventsCount);
  });
```

## 常見問題解決方案

### 問題 1: API 返回空數據

**解決方案**：
- 確認 API key 正確（默認使用 "123"）
- 檢查 TheSportsDB API 是否正常運作
- 嘗試直接訪問：`https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=4443`

### 問題 2: 日期範圍問題

**解決方案**：
編輯 `lib/services/events.ts`，修改日期範圍：

```typescript
// 從 3 個月改為 6 個月
endDate.setMonth(now.getMonth() + 6);
```

### 問題 3: 數據轉換失敗

**解決方案**：
查看日誌中的具體錯誤訊息，可能是：
- 日期格式不正確
- 缺少必要欄位（如 strEvent）

## 立即診斷

執行以下命令查看詳細日誌：

```javascript
// 在瀏覽器 Console 中
fetch('/api/events/sync', { method: 'POST' })
  .then(res => res.json())
  .then(data => {
    console.log('完整回應:', JSON.stringify(data, null, 2));
    if (data.result.total === 0) {
      console.warn('⚠️ 沒有創建或更新任何賽事！');
      console.warn('請檢查伺服器日誌以獲取詳細資訊。');
    }
  });
```

然後查看終端機中的詳細日誌輸出。

