# 開發日誌 / Development Log

## 2025-01-21

### feat/admin-fighter-create-form

**難度**: ★★★☆☆

**描述**: 實作管理員創立選手頁面，包含完整的表單組件和後端 API，遵循現有的 Prisma schema、TypeScript 類型和創建賽事頁面的樣式格式，支援自動 slug 生成、表單驗證和審計日誌記錄

**功能概述**:

實作管理員創建選手的完整功能：

1. **POST /api/fighters API**: 創建選手的後端 API 路由
2. **FighterCreateForm 組件**: 完整的前端表單組件
3. **AdminTabs 整合**: 將新表單整合到管理員界面

**API 路由更新** (`app/api/fighters/route.ts`):

- **新增 POST 方法**:
  - 驗證管理員權限（使用 `getCurrentUser()`）
  - 輸入驗證（使用 Zod schema）：
    - `name` (必填)
    - `slug` (可選，未提供時自動生成)
    - `sport_type` (可選，enum: boxing/ufc/mma/muay-thai/kickboxing)
    - `nationality`, `date_born`, `height`, `weight`, `position`, `description`, `thumb`, `cutout` (可選)
  - Slug 生成邏輯：
    - 未提供時使用 `generateUniqueSlug()` 自動生成
    - 提供時檢查唯一性（Prisma unique constraint）
  - 創建 Fighter 記錄（遵循 Prisma schema）
  - 記錄 AuditLog（使用 `createAuditLog()`，包含 adminId、actionType、description、ipAddress）
  - 更新快取（`revalidateTag("fighters")`）
  - 錯誤處理（Zod 驗證錯誤、Prisma unique constraint 錯誤）

**前端組件** (`components/admin/fighter-create-form.tsx`) - 新建:

- **表單結構**:
  - 遵循 `event-create-form.tsx` 的樣式和結構
  - 使用相同的 UI 組件：Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Label, Select, Textarea, Button
  - 響應式佈局：`grid-cols-1 md:grid-cols-2`
- **表單字段分組**:
  - **基本信息**:
    - `name` (必填，Input)
    - `slug` (可選，Input，顯示預覽，可手動編輯)
    - `sport_type` (可選，Select: boxing, ufc, mma, muay-thai, kickboxing)
    - `nationality` (可選，Input)
    - `date_born` (可選，Input type="date")
  - **身體數據**:
    - `height` (可選，Input type="number"，單位：公分/cm，placeholder: "175")
    - `weight` (可選，Input type="number"，單位：磅/lb，placeholder: "155")
    - `position` (可選，Input，placeholder: "Weight class")
  - **描述和圖片**:
    - `description` (可選，Textarea)
    - `thumb` (可選，Input type="url"，Profile thumbnail URL)
    - `cutout` (可選，Input type="url"，Cutout image URL)
- **Slug 自動生成**:
  - 使用 `useEffect` 監聽 `name` 變化
  - 當 `name` 改變且 `slug` 未被手動編輯時，自動生成 slug 預覽
  - 使用 `generateSlug()` 生成（不檢查唯一性，僅預覽）
  - 允許手動編輯 slug，編輯後不再自動更新
  - 顯示 slug 預覽：`/fighter/{slug}`
- **表單驗證**:
  - `name` 必填驗證
  - URL 格式驗證（thumb, cutout）
  - 前端驗證後再提交
- **提交處理**:
  - 顯示 loading 狀態（Loader2 icon）
  - 調用 POST /api/fighters
  - 成功後顯示 toast 通知
  - 重置表單（包括 `slugManuallyEdited` 狀態）
  - 刷新頁面（router.refresh()）
- **雙語標籤**（繁體中文/英文），與 event-create-form.tsx 保持一致

**管理員界面整合** (`components/admin/admin-tabs.tsx`):

- 添加新的 "Fighters Management" tab
- 整合 FighterCreateForm 組件
- 更新 TabsList 為 6 列佈局（grid-cols-6）
- 使用多語言翻譯（`t("FIGHTERS_MANAGEMENT")`）

**技術細節**:

- **Slug 生成邏輯**:
  - 前端預覽使用 `generateSlug()`（不檢查唯一性）
  - 後端創建時使用 `generateUniqueSlug()`（檢查唯一性）
  - 使用 `slugManuallyEdited` 狀態追蹤 slug 是否被手動編輯
- **類型定義**:
  - 使用 `lib/types.ts` 中已定義的 `Fighter` 接口
  - 表單狀態使用對應的字段類型
- **樣式一致性**:
  - 遵循 `event-create-form.tsx` 的佈局：
    - Card 容器
    - grid-cols-1 md:grid-cols-2 響應式佈局
    - 必填字段標記（紅色星號）
    - 統一的 spacing 和 typography
- **單位規範**:
  - 身高：公分(cm)，使用 number input
  - 體重：磅(lb)，使用 number input
- **審計日誌**:
  - 創建選手時自動記錄 AuditLog
  - 包含完整信息：adminId、actionType ("CREATE_FIGHTER")、description、ipAddress

**主要修改文件**:

1. `app/api/fighters/route.ts` - 添加 POST 方法
2. `components/admin/fighter-create-form.tsx` - 新建表單組件
3. `components/admin/admin-tabs.tsx` - 整合新組件

**注意事項**:

- Slug 唯一性：使用 `generateUniqueSlug()` 確保 slug 唯一
- 審計日誌完整性：所有管理員操作都必須記錄 AuditLog，包含 IP 地址
- 表單驗證：前端和後端都進行驗證，確保數據完整性
- 單位規範：身高使用公分(cm)，體重使用磅(lb)
- 快取更新：創建選手後更新 `fighters` cache tag

## 2025-01-20

### feat/betting-system-enhancement

**難度**: ★★★★★

**描述**: 實作完整的投注系統功能，包含投注交易、賠率顯示、管理員賽果輸入、結算邏輯、審計日誌和回溯功能，確保所有操作在 Transaction 中完成，並實作驗算機制確保彩金計算正確

**功能概述**:

實作 6 個核心子功能：

1. **feat/betting-transaction**: 投注交易（最小 50，每次 10 單位，Transaction 保證）
2. **feat/odds-display**: 賠率和彩池即時更新快取
3. **feat/admin-result-input**: 管理員手動輸入賽果
4. **feat/settlement-logic**: 結算邏輯與驗算
5. **feat/audit-log**: 審計日誌記錄
6. **feat/admin-rollback**: 管理員回溯功能

**類型定義更新** (`lib/types.ts`):

- 新增 `BettingOdds` 介面：
  - `totalPool`: 總彩池
  - `netPool`: 淨彩池（扣除手續費後）
  - `odds`: 各選項賠率
  - `betsByOutcome`: 各選項投注總額
- 新增 `SettleEventInput` 介面：
  - `winnerId`: 勝者 ID
  - `winMethod`: 勝利方式（可選）
  - `winRound`: 勝利回合（可選）

**驗證 Schema 更新** (`lib/validations.ts`):

- 新增 `placeBetSchema`:
  - `amount`: 最小 50，必須是 10 的倍數（使用 `z.number().refine()` 驗證）
- 新增 `settleEventSchema`:
  - `winnerId`: 必填
  - `winMethod`: 可選
  - `winRound`: 可選（正整數）

**審計日誌服務層** (`lib/services/audit.ts`) - 新建:

- `getClientIpAddress()`: 統一處理 IP 地址獲取（支援 `x-forwarded-for` 和 `x-real-ip`）
- `createAuditLog()`: 創建審計日誌條目（包含 adminId、actionType、description、ipAddress）
- `getAuditLogs()`: 獲取審計日誌（支援分頁、篩選）

**投注服務層** (`lib/services/betting.ts`) - 新建:

- `placeBet()`: 投注邏輯（Transaction 保證原子性）
  - 檢查餘額、扣除積分、創建 BettingLog、記錄 AuditLog
- `getBettingOdds()`: 獲取賠率（使用 `unstable_cache` 快取，5 秒 revalidate）
- `rollbackBet()`: 回溯單筆投注
- `rollbackEvent()`: 回溯賽事所有投注

**投注 API 更新** (`app/api/betting/route.ts`):

- **POST**: 更新投注邏輯
  - 最小投注額：50（從 10 改為 50）
  - 投注額必須是 10 的倍數
  - Transaction 中同時完成：檢查餘額、扣除積分、創建 BettingLog、記錄 AuditLog
  - 投注後更新快取：`revalidateTag("event-{eventId}")`、`revalidateTag("event-odds-{eventId}")`、`revalidateTag("events")`
  - 獲取 IP 地址並記錄 AuditLog

**賠率查詢 API** (`app/api/betting/[eventId]/odds/route.ts`) - 新建:

- **GET**: 查詢賽事賠率和彩池
  - 使用 `calculatePoolOdds()` 計算
  - 使用 `unstable_cache` 快取（tag: `"event-odds-{eventId}"`, revalidate: 5 秒）

**投注列表 API** (`app/api/betting/[eventId]/bets/route.ts`) - 新建:

- **GET**: 獲取賽事所有投注記錄
  - 用於管理員回溯面板顯示

**結算邏輯更新** (`lib/betting-system.ts`):

- `settleEvent()` 函數增強：
  - 添加 IP 地址參數
  - 添加 `winMethod` 和 `winRound` 參數支援
  - 驗證賽事狀態（必須是 OPEN 或 CLOSED）
  - 驗證 winner_id 存在於 fighter_1_id 或 fighter_2_id
  - **驗算機制**：結算後驗證 `總支出 + 手續費 = 總彩池`
    - 允許小於 0.01 的捨入誤差
    - 驗算失敗時記錄 AuditLog 並拋出錯誤
  - 改進 AuditLog 記錄（包含詳細統計資訊）
  - 使用 `createAuditLog()` 服務層而非直接操作資料庫

**管理員賽果輸入 API** (`app/api/admin/events/[id]/result/route.ts`) - 新建:

- **POST**: 輸入賽果並觸發結算
  - 驗證管理員權限
  - 驗證賽事狀態和 winner_id
  - 調用 `settleEvent()` 進行結算
  - 更新快取：`revalidateTag("event-{eventId}")`、`revalidateTag("events")`

**管理員回溯 API**:

- **單筆回溯** (`app/api/admin/betting/[betId]/rollback/route.ts`) - 新建:
  - **POST**: 回溯單筆投注
    - 驗證管理員權限
    - 驗證投注狀態（必須是 PENDING）
    - Transaction 中完成：恢復用戶積分、更新 BettingLog 狀態為 VOID、記錄 AuditLog
- **批量回溯** (`app/api/admin/events/[id]/rollback/route.ts`) - 新建:
  - **POST**: 回溯賽事所有投注
    - 驗證管理員權限
    - 驗證賽事狀態（必須是 SETTLED）
    - Transaction 中完成：
      - 遍歷所有投注，恢復用戶積分（處理 WON/LOST/PENDING 不同情況）
      - 更新所有 BettingLog 狀態為 VOID
      - 更新 Event 狀態為 OPEN（或 CLOSED，根據事件日期）
      - 記錄 AuditLog

**管理員同步 API** (`app/api/admin/events/sync/route.ts`) - 新建:

- **POST**: 管理員專用事件同步端點
  - 驗證管理員權限（不需要 secret）
  - 調用 `syncEventsFromExternalAPI()` 同步賽事
  - 更新快取

**前端組件更新**:

- **BettingCard** (`components/betting/BettingCard.tsx`):
  - 更新最小投注額顯示：從 10 改為 50
  - 更新輸入驗證：最小 50，必須是 10 的倍數
  - 添加步進按鈕（+10, -10）方便調整投注額
  - 改進錯誤處理和用戶提示
- **EventResultForm** (`components/admin/event-result-form.tsx`) - 新建:
  - 表單組件，用於輸入賽果
  - 包含：event 選擇、winner 選擇、winMethod、winRound（可選）
  - 提交後觸發結算 API
- **RollbackPanel** (`components/admin/rollback-panel.tsx`) - 新建:
  - 顯示賽事投注列表
  - 提供單筆回溯和批量回溯按鈕
  - 顯示回溯確認對話框
- **EventSyncButton** (`components/admin/event-sync-button.tsx`) - 新建:
  - 管理員手動觸發賽事同步的按鈕組件
- **AdminTabs** (`components/admin/admin-tabs.tsx`):
  - 新增 "Events Management" tab
  - 整合 EventSyncButton、EventResultForm 和 RollbackPanel

**快取策略**:

- **投注後快取更新**:
  - `revalidateTag("event-{eventId}", "max")`: 更新單一賽事快取
  - `revalidateTag("event-odds-{eventId}", "max")`: 更新賠率快取
  - `revalidateTag("events", "max")`: 更新賽事列表快取
  - `revalidatePath("/events/[id]")`: 更新賽事頁面
- **結算後快取更新**: 同上
- **回溯後快取更新**: 同上

**資料庫操作優化**:

- **Transaction 使用**:
  - 所有涉及多個資料庫操作的地方都使用 Transaction
  - 投注：檢查餘額 + 扣除積分 + 創建 BettingLog + 記錄 AuditLog
  - 結算：更新所有投注狀態 + 更新用戶積分 + 更新賽事狀態 + 記錄 AuditLog
  - 回溯：恢復積分 + 更新投注狀態 + 記錄 AuditLog

**錯誤處理**:

- **投注錯誤**:
  - 餘額不足：返回 400，錯誤訊息 "Insufficient funds"
  - 投注額不符合規則：返回 400，錯誤訊息 "Amount must be multiple of 10 and minimum 50"
  - 賽事狀態不允許投注：返回 400，錯誤訊息 "Betting is closed for this event"
- **結算錯誤**:
  - 驗算失敗：記錄 AuditLog，拋出錯誤，返回 500
  - 賽事狀態錯誤：返回 400，錯誤訊息 "Event cannot be settled"
- **回溯錯誤**:
  - 投注已結算：返回 400，錯誤訊息 "Bet has already been settled"
  - 賽事狀態錯誤：返回 400，錯誤訊息 "Event cannot be rolled back"

**技術要點**:

1. **Transaction 原子性**: 所有涉及多個資料庫操作的地方都使用 Transaction，確保數據一致性
2. **快取策略**: 所有寫入操作後立即更新相關快取，確保數據一致性
3. **驗算機制**: 結算後驗證 `總支出 + 手續費 = 總彩池`，確保計算正確性
4. **審計日誌**: 所有管理員操作都記錄 AuditLog，包含 IP 地址
5. **Decimal 精度**: 所有金額計算使用 `decimal.js` 的 `Decimal` 類型，避免浮點數誤差
6. **IP 地址獲取**: 統一處理 IP 地址獲取（`x-forwarded-for` 或 `x-real-ip`）

**主要修改文件**:

1. `lib/types.ts` - 新增 BettingOdds 和 SettleEventInput 介面
2. `lib/validations.ts` - 新增 placeBetSchema 和 settleEventSchema
3. `lib/services/audit.ts` - 新建審計日誌服務層
4. `lib/services/betting.ts` - 新建投注服務層
5. `lib/betting-system.ts` - 更新結算邏輯，添加驗算機制
6. `app/api/betting/route.ts` - 更新投注 API
7. `app/api/betting/[eventId]/odds/route.ts` - 新建賠率查詢 API
8. `app/api/betting/[eventId]/bets/route.ts` - 新建投注列表 API
9. `app/api/admin/events/[id]/result/route.ts` - 新建賽果輸入 API
10. `app/api/admin/betting/[betId]/rollback/route.ts` - 新建單筆回溯 API
11. `app/api/admin/events/[id]/rollback/route.ts` - 新建批量回溯 API
12. `app/api/admin/events/sync/route.ts` - 新建管理員同步 API
13. `components/betting/BettingCard.tsx` - 更新前端組件
14. `components/admin/event-result-form.tsx` - 新建管理員表單
15. `components/admin/rollback-panel.tsx` - 新建回溯面板
16. `components/admin/event-sync-button.tsx` - 新建同步按鈕
17. `components/admin/admin-tabs.tsx` - 更新管理員標籤頁

**注意事項**:

- IP 地址獲取：使用 `x-forwarded-for` 或 `x-real-ip` header，如果都沒有則使用 'unknown'
- Decimal 精度：所有金額計算使用 `decimal.js` 的 `Decimal` 類型，避免浮點數誤差
- 快取更新時機：所有寫入操作後立即更新相關快取，確保數據一致性
- Transaction 原子性：確保所有相關操作在同一 Transaction 中完成
- 驗算邏輯：結算後必須驗證 `總支出 + 手續費 = 總彩池`，確保計算正確
- 審計日誌完整性：所有管理員操作都必須記錄 AuditLog，包含 IP 地址
- 錯誤處理：所有錯誤都應該有明確的錯誤訊息和適當的 HTTP 狀態碼
- 向後兼容：現有的投注功能需要保持向後兼容，逐步遷移

## 2025-11-20

### refactor/prisma-7-upgrade

**難度**: ★★★★☆

**描述**: 將 Prisma 從 6.19.0 升級到 7.0.0，採用 adapter 模式連接資料庫，符合 Prisma 7.0 最新規範

**問題背景**:

- Prisma 7.0 移除了 `schema.prisma` 中 `datasource` 的 `url` 屬性
- 需要使用 adapter 模式來連接資料庫
- 需要確保所有 PrismaClient 實例化都使用新的 adapter 配置

**解決方案架構**:

- 安裝 `@prisma/adapter-pg` 和 `pg` 套件
- 更新 `schema.prisma` 移除 `url` 屬性
- 更新所有 PrismaClient 實例化使用 adapter
- 確保向後兼容性和功能正常運作

**套件升級** (`package.json`):

- `@prisma/client`: 6.19.0 → 7.0.0
- `prisma`: 6.19.0 → 7.0.0
- 新增 `@prisma/adapter-pg`: 7.0.0
- 新增 `pg`: 8.16.3
- 新增 `decimal.js`: 10.6.0（Prisma Decimal 的底層實作）
- 新增 `@types/pg`: 8.15.6（PostgreSQL 類型定義）

**Schema 更新** (`prisma/schema.prisma`):

- **datasource db**:
  - 移除 `url = env("DATABASE_URL")` 屬性（Prisma 7.0 不再支援）
  - 保留 `provider = "postgresql"`
- **generator client**:
  - 保持 `provider = "prisma-client-js"` 不變
  - 無需額外的 previewFeatures 配置

**PrismaClient 實例化更新**:

- **`lib/db.ts`**:

  - 導入 `PrismaPg` adapter 和 `Pool` from `pg`
  - 創建 PostgreSQL connection pool
  - 使用 adapter 實例化 PrismaClient
  - 保留現有的 log 配置和 global singleton 模式

- **`prisma/seed.ts`**:
  - 更新為使用 adapter 模式
  - 創建 connection pool 和 adapter
  - 確保 seed 腳本與主應用使用相同的連接方式

**配置標準寫法**:

- **schema.prisma 標準配置**:

  ```prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
    // url 屬性已移除，改為在 PrismaClient 中使用 adapter
  }
  ```

- **PrismaClient 實例化標準寫法**:

  ```typescript
  import { PrismaClient } from "@prisma/client";
  import { PrismaPg } from "@prisma/adapter-pg";
  import { Pool } from "pg";

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({
    adapter,
    log: [...],
  });
  ```

**Decimal 類型變更**:

- **問題**: Prisma 7.0 移除了 `@prisma/client/runtime/library` 路徑，導致 `Decimal` 導入失敗

  - 錯誤訊息: `Module not found: Can't resolve '@prisma/client/runtime/library'`
  - 影響檔案: `lib/betting-system.ts`, `app/api/betting/route.ts`

- **Prisma Decimal 的性質與作用**:

  - **任意精度十進位數值類型**: 用於精確處理金融、貨幣、投注等需要高精度的場景
  - **避免浮點數誤差**: JavaScript `number` 類型使用 IEEE 754 雙精度浮點數，會產生精度誤差（如 `0.1 + 0.2 = 0.30000000000000004`）
  - **資料庫映射**: 對應 PostgreSQL 的 `DECIMAL`/`NUMERIC` 類型
  - **在 Betting System 中的關鍵角色**:
    - 投注金額計算：確保金額比較與運算的精確性
    - 獎金池計算：累加所有投注金額，精確扣除 10% 手續費
    - 賠率計算：`淨獎金池 / 該選項總投注額`
    - 派彩分配：按比例精確分配給獲勝者
    - 餘額更新：精確更新用戶虛擬分數
    - **為什麼必須用 Decimal？**: 避免累積誤差導致金額錯誤，確保派彩計算公平，符合金融級精度要求

- **Prisma 7.0 移除 Decimal 的原因**:

  - **模組化與輕量化**: 將 `Decimal` 從 `@prisma/client/runtime/library` 移除，減少 Prisma Client 的依賴與體積
  - **使用底層實作**: Prisma 的 `Decimal` 實際上是基於 `decimal.js` 的包裝，直接使用 `decimal.js` 更直接、可控
  - **簡化導入路徑**: 舊路徑 `@prisma/client/runtime/library` 過於複雜，統一使用 `decimal.js` 更清晰
  - **與 Adapter 模式一致**: Prisma 7.0 引入 adapter 模式，將部分功能外置，保持核心簡潔

- **解決方案**:

  - 安裝 `decimal.js` 套件（Prisma Decimal 的底層實作，API 完全兼容）
  - 安裝 `@types/pg` 類型定義（Prisma 7.0 使用 adapter 需要 PostgreSQL 類型支援）
  - 更新導入語句：將 `import { Decimal } from "@prisma/client/runtime/library"` 改為 `import { Decimal } from "decimal.js"`

- **decimal.js 說明**:

  - JavaScript 的任意精度十進位算術庫
  - 與 Prisma Decimal API 完全兼容（`.add()`, `.sub()`, `.mul()`, `.div()`, `.gt()`, `.lt()` 等方法）
  - 提供 `.toNumber()`, `.toFixed()` 等轉換方法

- **@types/pg 說明**:
  - PostgreSQL 客戶端 `pg` 的 TypeScript 類型定義
  - Prisma 7.0 使用 `@prisma/adapter-pg` 連接 PostgreSQL，需要 `pg` 套件
  - TypeScript 需要類型定義才能正確編譯 `Pool` 等類型

**驗證與測試**:

- Schema 驗證通過 (`prisma validate`)
- Prisma Client 成功重新生成 (`prisma generate`)
- 所有 PrismaClient 實例化已更新
- Decimal 導入問題已解決，構建成功
- 備份檔案已建立（`package.json.backup`, `prisma/schema.prisma.backup`）

**注意事項**:

- **migrate 命令限制**: `prisma migrate status` 命令需要 `prisma.config.ts` 來配置 datasource URL，但根據要求不使用 `prisma.config.ts`，因此 migrate 相關命令可能需要額外配置
- **環境變數**: `DATABASE_URL` 環境變數仍然需要設定，但現在用於創建 connection pool，而非直接在 schema 中引用
- **連接池管理**: 使用 `pg` 的 `Pool` 來管理資料庫連接，提供更好的連接管理和效能

**技術考量**:

- **向後兼容性**: 所有現有的 Prisma 查詢和操作保持不變，僅改變連接方式
- **效能優化**: 使用 connection pool 可以更好地管理資料庫連接，提升效能
- **類型安全**: Prisma 7.0 保持完整的類型安全特性
- **錯誤處理**: adapter 模式提供更好的錯誤處理和連接管理

**主要修改文件**:

1. `package.json` - 升級 Prisma 版本，新增 adapter、decimal.js、@types/pg 套件
2. `prisma/schema.prisma` - 移除 datasource url 屬性
3. `lib/db.ts` - 更新 PrismaClient 實例化使用 adapter
4. `prisma/seed.ts` - 更新 seed 腳本使用 adapter
5. `lib/betting-system.ts` - 更新 Decimal 導入路徑（`@prisma/client/runtime/library` → `decimal.js`）
6. `app/api/betting/route.ts` - 更新 Decimal 導入路徑（`@prisma/client/runtime/library` → `decimal.js`）

**升級步驟總結**:

1. ✅ 檢查 Node.js 版本（v24.1.0，符合要求）
2. ✅ 備份現有配置檔案
3. ✅ 升級 Prisma 套件到 7.0.0
4. ✅ 安裝 PostgreSQL adapter 套件（`@prisma/adapter-pg`, `pg`, `@types/pg`）
5. ✅ 安裝 `decimal.js` 套件（替代 Prisma Decimal）
6. ✅ 更新 schema.prisma 配置
7. ✅ 更新所有 PrismaClient 實例化使用 adapter
8. ✅ 更新所有 Decimal 導入路徑（`decimal.js`）
9. ✅ 重新生成 Prisma Client
10. ✅ 驗證配置正確性，構建成功

## 2025-11-20

### feat/timestamp-based-id-format

**難度**: ★★★☆☆

**描述**: 將 Post、Comment、Event 的 ID 格式從隨機 UUID 改為時間戳格式（年月日時分秒 + 隨機後綴），保留現有 UUID 記錄，僅新建立的記錄使用新格式

**問題背景**:

- 原本使用 UUID 作為主鍵，無法從 ID 看出建立時間
- 需要更易讀的 ID 格式，方便識別記錄的建立時間
- 要求保留現有資料，僅新記錄使用新格式

**解決方案架構**:

- 採用混合格式策略：現有 UUID 記錄保留，新記錄使用時間戳格式
- 創建 ID 生成工具函數，確保唯一性
- 移除 Schema 中的 `@default(uuid())`，改為手動生成

**ID 格式設計** (`lib/utils/id-generator.ts`):

- **格式**: `YYYYMMDDHHmmss` + 4 位隨機數（共 18 位）
- **範例**: `202511201234561234`
- **唯一性保證**:
  - 檢查資料庫中是否已存在相同 ID
  - 若存在則重新生成（最多重試 10 次）
  - 達到最大重試次數時添加額外隨機數
- **函數**:
  - `generatePostId()`: Post 用 ID 生成
  - `generateCommentId()`: Comment 用 ID 生成
  - `generateEventId()`: Event 用 ID 生成

**資料庫架構變更** (`prisma/schema.prisma`):

- **Post 模型**:
  - 移除 `id String @id @default(uuid())`
  - 改為 `id String @id`（允許手動指定 ID）
- **Comment 模型**:
  - 移除 `id String @id @default(uuid())`
  - 改為 `id String @id`
- **Event 模型**:
  - 移除 `id String @id @default(uuid())`
  - 改為 `id String @id`
- **Migration**: 創建 `20251120192459_change_id_format` migration
  - 僅移除 `@default(uuid())`，不修改現有資料
  - 現有 UUID 記錄完全保留

**服務層更新**:

- **`lib/services/posts.ts`**:
  - `createPost()`: 在創建前調用 `generatePostId()` 生成新 ID
- **`lib/services/comments.ts`**:
  - `createComment()`: 在創建前調用 `generateCommentId()` 生成新 ID
- **`lib/services/events.ts`**:
  - `syncEventsFromExternalAPI()`: 在創建 Event 前調用 `generateEventId()` 生成新 ID

**API 路由更新**:

- **`app/api/comments/route.ts`**:
  - POST handler: 在 transaction 內生成 Comment ID
- **`app/api/events/route.ts`**:
  - POST handler: 在 transaction 內生成 Event ID

**驗證邏輯更新** (`lib/validations.ts`):

- **`createPostSchema`**:
  - 移除 `eventId` 的 `.uuid()` 驗證
  - 改為 `z.string().optional().nullable()`（允許 UUID 和新格式）
- **`updatePostSchema`**:
  - 移除 `eventId` 的 `.uuid()` 驗證
  - 改為 `z.string().optional().nullable()`

**技術考量**:

- **混合格式支援**: 系統中同時存在 UUID（舊）和時間戳格式（新）的 ID
- **向後兼容**: 所有查詢、更新、刪除功能正常運作（都是 String 類型）
- **URL 路由**: 兩種格式都支援，路由參數解析不受影響
- **外鍵關聯**: PostLike、CommentLike、BettingLog 等關聯表不受影響
- **唯一性保證**: ID 生成函數包含重試機制，確保不會產生重複 ID

**效能優化**:

- ID 生成函數使用資料庫查詢檢查唯一性
- 最多重試 10 次，避免無限循環
- 使用索引優化查詢性能（id 欄位為主鍵，自動建立索引）

**主要修改文件**:

1. `lib/utils/id-generator.ts` - 新建 ID 生成工具函數
2. `prisma/schema.prisma` - 移除 Post、Comment、Event 的 `@default(uuid())`
3. `lib/services/posts.ts` - 更新 `createPost()` 函數
4. `lib/services/comments.ts` - 更新 `createComment()` 函數
5. `app/api/comments/route.ts` - 更新 POST handler
6. `lib/services/events.ts` - 更新 `syncEventsFromExternalAPI()` 函數
7. `app/api/events/route.ts` - 更新 POST handler
8. `lib/validations.ts` - 移除 eventId 的 UUID 驗證
9. `prisma/migrations/20251120192459_change_id_format/migration.sql` - 新建 migration

**注意事項**:

- 現有 UUID 記錄完全保留，不受影響
- 新建立的 Post、Comment、Event 記錄將使用新的時間戳格式 ID
- 系統支援混合格式，兩種格式可以並存
- 所有查詢、更新、刪除功能都正常運作（因為都是 String 類型）
- Migration 不會修改現有資料，僅改變 Prisma 的預設行為

## 2025-01-XX

### refactor/fighter-page-database-only

**難度**: ★★★☆☆

**描述**: 重構 fighter/[slug] 頁面，移除外部 API 調用，改為僅從內部資料庫查詢選手資料。同時統一類型定義，使用 lib/types 中的 FighterPublic 和 FighterWithEvents 類型。

**主要變更** (`app/fighter/[slug]/page.tsx`):

- **移除外部 API 同步**:

  - `generateMetadata` 和 `FighterPage` 不再調用外部 API
  - 明確標註只從內部資料庫查詢
  - 外部 API 同步應通過後台任務或 API 端點處理

- **統一類型定義**:

  - 使用 `FighterPublic` 類型（來自 `lib/types`）替代內聯類型定義
  - 直接從 `FighterWithEvents` 提取數據，手動構建 `FighterPublic` 對象
  - 確保類型安全，修復 `undefined` 類型不匹配問題

- **數據轉換優化**:

  - 使用 `?? null` 運算符處理 `undefined` 值，確保類型兼容
  - 明確處理 `eventsAsFighter` 中的可選字段（result, method, round, time, weight_class）
  - 確保 `event.sport_type` 正確處理 `undefined` 情況

- **調試日誌增強**:
  - 添加詳細的日誌輸出，記錄查詢過程
  - 記錄 fighter 查找成功/失敗的狀態
  - 方便排查 404 問題

**服務層變更** (`lib/services/fighters.ts`):

- **`getFighterBySlug` 函數簡化**:

  - 移除 `options` 參數，不再支援 `trySync` 選項
  - 僅查詢資料庫，不進行外部 API 同步
  - 返回類型明確為 `FighterWithEvents | null`

- **類型統一**:
  - 所有函數使用 `lib/types` 中定義的類型
  - `_getFighterFromDB` 返回 `FighterWithEvents | null`
  - 使用 `toFighterWithEvents` 工具函數進行類型轉換

**工具函數** (`lib/utils/fighter.ts`):

- **新增 `toFighterWithEvents` 函數**:
  - 將 Prisma Fighter（含關聯）轉換為 `FighterWithEvents` 類型
  - 處理 `external_data` 的 JsonValue 轉換
  - 正確映射 `eventsAsFighter` 和 `opponent` 關聯

**優勢**:

1. **性能提升**: 僅查詢資料庫，無外部 API 延遲
2. **穩定性**: 不依賴外部 API 可用性
3. **類型安全**: 使用統一的類型定義，減少類型錯誤
4. **可維護性**: 清晰的數據流，易於理解和維護
5. **可預測性**: 行為更可預測，無異步外部調用

**注意事項**:

- 外部 API 同步需要通過其他方式處理（後台任務、API 端點等）
- 確保資料庫中有對應的 fighter 記錄，否則會返回 404
- 快取策略保持不變（5 分鐘快取）

## 2025-11-20

### feat/fighter-pages

**難度**: ★★★★☆

**描述**: 實作選手頁面功能，包括資料庫模型、API 適配器、服務層、前端組件和路由，支援從賽事頁面點擊選手名字連結到選手頁，顯示選手基本資料和歷史賽事成績

**資料庫架構** (`prisma/schema.prisma`):

- **新增 Fighter 模型**：

  - `id`: UUID (主鍵)
  - `slug`: String @unique - URL 友好的 slug（如 "conor-mcgregor"）
  - `name`: String - 選手全名
  - `external_id`: String? - TheSportsDB API 的 idPlayer
  - `external_source`: String? @default("thesportsdb") - 數據來源
  - `external_data`: Json? - 完整 API 回應快取
  - `sport_type`: String? - 運動類型（boxing/ufc/mma）
  - `nationality`: String? - 國籍
  - `date_born`: DateTime? - 生日
  - `height`: String? - 身高
  - `weight`: String? - 體重
  - `position`: String? - 量級
  - `description`: String? - 描述
  - `thumb`: String? - 頭像 URL
  - `cutout`: String? - 去背圖 URL
  - `last_synced_at`: DateTime? - 最後同步時間
  - 索引：
    - `@@unique([slug])` - slug 唯一性
    - `@@index([external_id, external_source])` - 快速查找外部選手
    - `@@index([sport_type])` - 依運動類型篩選

- **新增 FighterEvent 關聯表**：
  - `id`: UUID (主鍵)
  - `fighter_id`: String (FK to Fighter)
  - `event_id`: String (FK to Event)
  - `opponent_id`: String? (FK to Fighter, 對手)
  - `result`: String? - 結果（Win/Loss/Draw/NC）
  - `method`: String? - 方法（KO/TKO/Decision 等）
  - `round`: Int? - 回合數
  - `time`: String? - 時間
  - `weight_class`: String? - 量級
  - 索引：
    - `@@unique([fighter_id, event_id])` - 一個選手在一個賽事中只能出現一次
    - `@@index([fighter_id])` - 快速查找選手的賽事
    - `@@index([event_id])` - 快速查找賽事的選手
    - `@@index([opponent_id])` - 快速查找對手

**API 適配器擴展** (`lib/adapters/thesportsdb.ts`):

- **新增 TheSportsDBPlayerSchema** (Zod schema)：
  - 定義選手數據結構，包含所有 TheSportsDB API 欄位
- **新增方法**：
  - `getPlayerById(idPlayer: string)`: 透過選手 ID 查詢選手詳細資料
  - `searchPlayerByName(name: string)`: 依名字搜尋選手
  - `getPlayerEvents(idPlayer: string)`: 查詢選手歷史賽事（預留接口）
- **使用端點**：
  - `lookupplayer.php?id={idPlayer}` - 選手詳細資料
  - `searchplayers.php?p={name}` - 搜尋選手

**服務層** (`lib/services/fighters.ts`, `lib/services/fighter-events.ts`):

- **選手服務**：
  - `getFighterBySlug(slug: string)`: 依 slug 查詢選手（含快取）
  - `getOrCreateFighterByName(name: string, sportType?)`: 依名字取得或建立選手
    - 先查資料庫
    - 不存在則查詢 API
    - 建立 Fighter 記錄並生成 slug
  - `syncFighterFromAPI(fighterId: string)`: 從 API 同步選手資料
  - `getFighterEvents(fighterId: string)`: 取得選手的歷史賽事
- **選手賽事關聯服務**：
  - `linkFighterToEvent()`: 建立選手-賽事關聯
  - `linkFightToEvent()`: 將兩位選手都連結到賽事
  - `getFighterEventHistory()`: 取得選手完整賽事歷史

**工具函數** (`lib/utils/slug.ts`, `lib/utils/fight-card-parser.ts`):

- **Slug 生成**：
  - `generateSlug(name: string)`: 生成 URL 友好的 slug
  - `generateUniqueSlug(name: string, existingSlugs: string[])`: 生成唯一 slug（衝突時添加數字後綴）
  - `normalizeFighterName(name: string)`: 標準化選手名字
- **對戰卡解析**：
  - `parseFightCard(fightCardText: string)`: 解析對戰卡文字為結構化數據

**前端組件**:

- **FighterLink** (`components/fighters/fighter-link.tsx`):
  - 可重用組件，用於顯示可點擊的選手名字
  - 處理 slug 生成失敗的情況（顯示純文字）
- **FighterProfileCard** (`components/fighters/fighter-profile-card.tsx`):
  - 顯示選手基本資料：頭像、姓名、國籍、生日、身高體重、量級、描述
  - 顯示社交媒體連結（Facebook, Twitter, Instagram, YouTube）
- **FighterEventHistory** (`components/fighters/fighter-event-history.tsx`):
  - 顯示歷史賽事列表
  - 每項顯示：賽事名稱（連結）、日期、對手（連結）、結果、方法、回合、時間、量級
- **更新 EventFightCard** (`components/events/event-fight-card.tsx`):
  - 將選手名字改為可點擊連結（使用 FighterLink 組件）

**頁面路由** (`app/fighter/[slug]/`):

- **page.tsx**: 選手詳細頁面
  - Server Component，使用 `unstable_cache` 快取
  - 顯示 FighterProfileCard 和 FighterEventHistory
  - 動態 metadata 生成
  - 404 處理
- **loading.tsx**: 載入狀態（Skeleton UI）
- **error.tsx**: 錯誤邊界組件

**資料同步整合** (`lib/services/events.ts`):

- 在事件同步時自動解析對戰卡
- 建立 Fighter 記錄（如果不存在）
- 建立 FighterEvent 關聯
- 錯誤處理：對戰卡解析失敗不影響事件同步

**性能優化**:

- 使用 Next.js 16 的 `unstable_cache` 快取選手數據（5 分鐘）
- 使用 `revalidateTag` 清除快取
- 資料庫索引優化查詢性能

**注意事項**:

- Slug 唯一性：使用 `generateUniqueSlug` 確保 slug 唯一
- API 限制：TheSportsDB V1 API 有請求限制，需要適當快取
- 錯誤處理：API 查詢失敗時優雅降級
- 預備方案：如果無法從 EventFightCard 提取，提供從 strResult 解析的備用方案

### feat/fighter-on-demand-sync

**難度**: ★★★☆☆

**描述**: 實作選手資料的 on-demand 同步機制，當透過 slug 查詢不到選手時，自動從 slug 推測名字並從 TheSportsDB API 搜尋，找到匹配的選手後自動建立資料庫記錄。這是最小代碼改動、最高效、最優雅的解決方案。

**問題背景**:

- 資料庫初始狀態沒有 fighter 資料
- 用戶訪問 `/fighter/conor-mcgregor` 時會 404
- 需要一個機制在查詢不到時自動同步

**解決方案**:

採用服務層 fallback 機制，在 `getFighterBySlug` 中加入 on-demand 同步邏輯，對上層透明，無需修改頁面代碼。

**工具函數擴展** (`lib/utils/slug.ts`):

- **新增 `slugToPossibleNames(slug: string)`**:
  - 從 slug 推測可能的名字列表
  - 處理基本格式：`conor-mcgregor` → `Conor McGregor`
  - 處理數字後綴：`conor-mcgregor-2` → `Conor McGregor`
  - 處理 "Mc" 前綴：`conor-mcgregor` → `Conor McGregor` 和 `Conor McGregor`（Mc 大寫變體）
  - 返回多個候選名字以提高匹配率

**服務層增強** (`lib/services/fighters.ts`):

- **修改 `getFighterBySlug(slug: string, options?: { trySync?: boolean })`**:
  - 新增 `options` 參數，支援 `trySync`（預設為 `true`）
  - 實作 on-demand 同步 fallback：
    1. 先查詢資料庫
    2. 找不到且 `trySync` 為 `true` 時，從 slug 推測名字
    3. 搜尋 TheSportsDB API
    4. 檢查 slug 匹配（支援精確匹配和基礎 slug 匹配，忽略數字後綴）
    5. 找到匹配後建立資料庫記錄
    6. 返回完整的選手資料（含關聯的賽事）
  - 錯誤處理：API 搜尋失敗時返回 `null`，不影響頁面運作
  - 詳細日誌記錄同步過程

**快取策略**:

- 使用 `unstable_cache` 快取結果（300 秒）
- 找不到時也會快取，避免重複 API 呼叫
- 錯誤處理：API 失敗時返回 `null`，不影響頁面運作

**功能特點**:

1. **代碼改動最小**：只修改了兩個文件（`lib/utils/slug.ts` 和 `lib/services/fighters.ts`）
2. **對上層透明**：頁面代碼無需改動，`getFighterBySlug` 自動處理同步
3. **高效**：只在真正找不到時才呼叫 API
4. **優雅**：邏輯集中在服務層，易於維護
5. **資料庫操作少**：只在找到匹配選手時才寫入

**使用流程**:

當用戶訪問 `/fighter/conor-mcgregor` 時：

1. 系統先查詢資料庫
2. 如果找不到，自動從 slug 推測名字並搜尋 API
3. 找到匹配後自動建立記錄
4. 返回選手資料並顯示頁面

**錯誤處理**:

- API 搜尋失敗時繼續處理下一個候選名字
- 所有錯誤都被捕獲並記錄，不會中斷流程
- 找不到匹配時返回 `null`，頁面顯示 404

**性能考量**:

- API 請求只在真正需要時才執行
- 使用快取避免重複 API 呼叫
- 支援多個候選名字，提高匹配成功率

## 2025-01-XX

### feat/api-data-ingest + data-abstraction

**難度**: ★★★★☆

**描述**: 實作賽事數據串接系統與數據抽象化層，透過 TheSportsDB API v2 自動同步本週格鬥賽事（拳擊、UFC、MMA），採用增量更新策略、快取優化與統一數據格式設計，確保高效能、低資料庫負擔與未來擴展性

**資料庫架構** (`prisma/schema.prisma`):

- **擴展 Event 模型**：
  - `external_id`: String? - 外部 API 的賽事 ID
  - `external_source`: String? - 數據來源（如 "thesportsdb"）
  - `external_data`: Json? - 原始 API 數據快照（用於除錯與未來擴展）
  - `sport_type`: String? - 賽事類型（"boxing", "ufc", "mma"）
  - `last_synced_at`: DateTime? - 最後同步時間
  - `sync_status`: String @default("pending") - 同步狀態
  - 唯一約束：`@@unique([external_id, external_source])`
  - 索引優化：
    - `@@index([external_id, external_source])` - 快速查找外部賽事
    - `@@index([fight_date, status])` - 優化本週賽事查詢
    - `@@index([last_synced_at])` - 優化增量同步查詢
    - `@@index([sport_type, fight_date])` - 優化賽事分析頁查詢（未來擴展）

**數據抽象化層** (`lib/adapters/thesportsdb.ts`):

- **TheSportsDBClient 類別**：
  - API 客戶端封裝，支援 API Key 認證
  - `getEventsByLeague(leagueId)`: 透過聯賽 ID 查詢賽事
  - `getEventsByDateRange(startDate, endDate)`: 透過日期範圍查詢賽事（支援多聯賽並行查詢）
  - `transformEvent()`: 將 TheSportsDB API 數據轉換為統一格式
  - `determineSportType()`: 自動判定賽事類型（boxing/ufc/mma/other）
- **統一數據格式** (`UnifiedEventData`):
  - `external_id`, `name`, `fight_date`, `sport_type`
  - `external_data`: 完整原始數據保留
  - 可選欄位：`home_team`, `away_team`, `venue`, `league`, `country`, `city`, `status`
- **Zod Schema 驗證**：
  - `TheSportsDBEventSchema`: 驗證 API 回應格式
  - `TheSportsDBResponseSchema`: 驗證 API 回應結構

**類型定義擴展** (`lib/types.ts`):

- 新增 `ExternalEventSource`: `"thesportsdb" | "espn" | "ufc" | "other"`
- 新增 `SportType`: `"boxing" | "ufc" | "mma" | "other"`
- 新增 `SyncStatus`: `"pending" | "syncing" | "completed" | "failed"`
- 新增 `UnifiedEventData` 介面：統一的外部 API 數據格式
- 擴展 `Event` 介面：新增所有外部 API 整合欄位

**事件服務層** (`lib/services/events.ts`):

- **`getWeeklyCombatEvents()`**:
  - 查詢本週格鬥賽事（boxing, ufc, mma）
  - 使用 `unstable_cache` 快取（tag: `"events"`, revalidate: 60 秒）
  - 自動計算週的開始與結束時間
- **`getCombatEvents(options)`**:
  - 支援過濾：`sportType`, `status`
  - 支援分頁：`limit`, `offset`
  - 用於未來賽事分析頁
- **`syncEventsFromExternalAPI(source)`**:
  - 增量更新策略：只更新變更的賽事
  - 使用 `findFirst` + `create`/`update` 避免重複
  - 自動判定賽事狀態（PENDING/OPEN/SETTLED）
  - 返回統計：`created`, `updated`, `errors`
- **`determineEventStatus(fightDate)`**:
  - 根據賽事日期自動判定狀態
  - 過去賽事 → SETTLED
  - 24 小時內 → OPEN
  - 其他 → PENDING
- **`getEventByExternalId(externalId, source)`**:
  - 透過外部 ID 查詢賽事

**同步 API** (`app/api/events/sync/route.ts`):

- **POST `/api/events/sync`**:
  - 觸發外部 API 同步
  - 認證機制：
    - Vercel Cron Jobs：檢查 `x-vercel-cron` header
    - 手動觸發：檢查 `secret` 參數或 request body
  - 支援指定數據來源（預設：thesportsdb）
  - 同步完成後自動 `revalidateTag("events")` 快取失效
  - 返回詳細統計資訊
- **GET `/api/events/sync`**:
  - 提供端點使用說明（監視用）

**定時任務配置** (`vercel.json`):

- 配置 Vercel Cron Jobs：
  - 路徑：`/api/events/sync`
  - 排程：每天 UTC 2:00 AM (`0 2 * * *`)
  - 自動觸發同步，無需手動操作

**前端整合** (`app/events/page.tsx`):

- 更新賽事頁面使用新服務層
- 使用 `getWeeklyCombatEvents()` 查詢本週賽事
- 自動享受快取機制帶來的效能提升
- 同步完成後自動顯示最新數據

**環境變數配置** (`README.md`):

- 新增 `THESPORTSDB_API_KEY`: TheSportsDB API v2 金鑰（需要支持者訂閱）
- 新增 `EVENTS_SYNC_SECRET`: 保護同步端點的 secret token

**效能優化策略**:

1. **資料庫負擔最小化**：

   - 增量更新：只更新變更的賽事
   - 批量操作：逐個處理但使用單一連接
   - 索引優化：關鍵欄位建立索引
   - 查詢優化：使用日期範圍過濾，避免全表掃描

2. **載入速度優化**：

   - 使用 `unstable_cache` 快取查詢結果（60 秒 revalidate）
   - 使用 cache tags 精確控制快取失效
   - 前端使用 Server Components，減少客戶端 JavaScript

3. **API 呼叫優化**：
   - 並行請求多個聯賽數據（Promise.all）
   - 錯誤處理：單一聯賽失敗不影響其他聯賽
   - 設定合理的 timeout（10 秒）

**歷史數據保留策略**:

- 永不刪除賽事數據：所有同步的賽事永久保留
- 透過 `status` 欄位標記賽事狀態
- `external_data` JSON 欄位保留完整原始數據
- 支援未來建立賽事分析頁面

**未來擴展性**:

1. **多 API 來源支援**：

   - 適配器模式設計，可輕鬆新增 ESPN、UFC API 等
   - 統一數據格式確保前端組件無需修改

2. **數據豐富化**：

   - `external_data` JSON 欄位保留原始數據，未來可擴展顯示更多資訊
   - 支援選手資訊、賽事統計等擴展欄位

3. **賽事分析頁準備**：
   - 保留所有歷史賽事數據
   - 透過 `sport_type`、`fight_date`、`status` 等欄位進行數據分析
   - 索引優化支援未來分析查詢

**主要修改文件**:

1. `prisma/schema.prisma` - 擴展 Event 模型，新增外部 API 整合欄位與索引
2. `lib/adapters/thesportsdb.ts` - 新建 TheSportsDB API 適配器
3. `lib/types.ts` - 新增統一數據格式類型與擴展 Event 類型
4. `lib/services/events.ts` - 新建事件服務層
5. `app/api/events/sync/route.ts` - 新建同步 API endpoint
6. `app/events/page.tsx` - 更新使用新服務層
7. `vercel.json` - 新建 Cron Jobs 配置
8. `README.md` - 更新環境變數說明

**注意事項**:

- TheSportsDB 免費方案每天 1000 次請求限制，每天同步一次可有效控制使用量
- API 失敗時優雅降級，不影響現有功能，歷史數據仍可正常顯示
- 使用 Zod schema 嚴格驗證外部 API 數據
- 長期運行後歷史數據會持續增長，需監控資料庫大小

---

## 2025-11-19

### feat/category-system

**難度**: ★★★☆☆

**描述**: 實作 Category 分類系統，包含 displayOrder 排序功能、軟刪除策略、管理員 CRUD 功能與預設 seed 資料

**資料庫架構** (`prisma/schema.prisma`):

- 新增 `Category` 模型：
  - `id`: String @id @default(uuid())
  - `name`: String @unique（分類名稱）
  - `slug`: String @unique（URL 友善識別碼，可選）
  - `description`: String?（分類描述，可選）
  - `displayOrder`: Int @default(1)（顯示順序，必須 > 0）
  - `deletedAt`: DateTime?（軟刪除時間戳）
  - 索引：`@@index([deletedAt])`、`@@index([displayOrder])`
- 更新 `Post` 模型：
  - 新增 `categoryId`: String?（可選外鍵）
  - 新增 `category`: Category? @relation
  - 索引：`@@index([categoryId])`

**類型定義更新** (`lib/types.ts`):

- 新增 `Category` 介面（含 displayOrder、deletedAt）
- 更新 `Post`、`PostWithUser` 介面加入 category 欄位

**驗證 Schema** (`lib/validations.ts`):

- 新增 `categorySchema`：name、slug、description、displayOrder（必須為正整數且 >= 1）
- 更新 `postSchema` 支援 categoryId（可選）

**Category Service** (`lib/services/categories.ts`):

- `getAllCategories()`: 使用 `unstable_cache` 快取（tag: `'categories'`, revalidate: 300 秒），過濾已刪除，按 displayOrder 排序
- `createCategory()`: 建立分類，驗證 name 唯一性與 displayOrder
- `updateCategory()`: 更新分類，驗證 displayOrder 必須 >= 1
- `softDeleteCategory()`: 軟刪除分類，將關聯 Post 的 categoryId 設為 null

**Admin Category API**:

- `GET /api/admin/categories`: 返回所有分類列表（管理員）
- `POST /api/admin/categories`: 建立分類（含 displayOrder 驗證）
- `PATCH /api/admin/categories/[id]`: 更新分類（含 displayOrder 驗證）
- `DELETE /api/admin/categories/[id]`: 軟刪除分類，更新相關 Post

**Post Service/API 更新**:

- `lib/services/posts.ts`: 查詢時包含 category，驗證 category 存在且未刪除
- `app/api/posts/route.ts`: 支援 categoryId 參數（可選）
- `app/api/posts/[id]/route.ts`: 支援更新 categoryId

**前端組件**:

- `components/admin/category-management.tsx`: 分類管理介面（列表、新增、編輯、軟刪除），顯示 displayOrder 欄位並支援編輯
- `components/admin/admin-tabs.tsx`: 加入 Category Management tab
- `components/posts/post-form.tsx`: 新增 Category 選擇欄位（按 displayOrder 排序）
- `components/posts/post-card.tsx`: 顯示分類標籤
- `components/posts/post-content.tsx`: 顯示分類資訊

**多語言支援** (`lib/constants.ts`):

- 新增 Category 相關翻譯（四種語言）：CATEGORY_MANAGEMENT、DISPLAY_ORDER、DISPLAY_ORDER_INVALID、CATEGORY_DELETE_WARNING 等

**Seed 資料** (`prisma/seed.ts`):

- 建立 5 個預設分類：General (1)、Boxing (2)、Kick-Boxing (3)、Muay-Thai (4)、MMA (5)
- 使用 `upsert` 避免重複建立

**效能優化**:

- Category 列表使用 ISR 快取（300 秒）
- 建立索引提升查詢效能（deletedAt、displayOrder、categoryId）
- Post 查詢使用 `include` 避免 N+1 查詢

**向後兼容性**:

- categoryId 為可選（nullable），現有 Post 不受影響
- displayOrder 預設為 1
- 所有 API 的 categoryId 參數為可選

**主要修改文件**:

1. `prisma/schema.prisma` - 新增 Category 模型，更新 Post 模型
2. `lib/types.ts` - 新增 Category 類型，更新 Post 類型
3. `lib/validations.ts` - 新增 categorySchema
4. `lib/services/categories.ts` - 新建 Category Service
5. `lib/services/posts.ts` - 更新 Post Service
6. `app/api/admin/categories/route.ts` - 新建 Admin Category API
7. `app/api/admin/categories/[id]/route.ts` - 新建 Admin Category 單一操作 API
8. `app/api/posts/route.ts` - 更新 Post API
9. `app/api/posts/[id]/route.ts` - 更新 Post API
10. `components/admin/category-management.tsx` - 新建分類管理組件
11. `components/admin/admin-tabs.tsx` - 更新 Admin Tabs
12. `components/posts/post-form.tsx` - 更新 Post Form
13. `components/posts/post-card.tsx` - 更新 PostCard
14. `components/posts/post-content.tsx` - 更新 PostContent
15. `lib/constants.ts` - 新增多語言翻譯
16. `prisma/seed.ts` - 建立 Category seed 資料

---

### feat/user-profile-separation

**難度**: ★★★★★

**描述**: 實作用戶 Profile 分離系統，將登錄資訊（email, userId, password）與個人資料（name, nickname, avatar 等）完全分離，簡化註冊流程，實作 Profile 軟刪除機制，並新增欄位可見性控制功能（public/friends/private）

**資料庫架構** (`prisma/schema.prisma`):

- **簡化 User 模型**：
  - 移除 `name`, `nickname`, `gender`, `birthDate`, `avatar` 欄位
  - 保留登錄相關欄位：`id`, `userId`, `email`, `password`
  - 保留系統欄位：`isAdmin`, `isBanned`, `points`, `createdAt`, `updatedAt`
  - 新增 `profile` 一對一關聯
- **新增 Profile 模型**：
  - 基本資訊：`id`, `userId` (unique), `name`, `nickname`, `gender`, `birthDate`, `avatar`
  - 擴展欄位：`height`, `weight`, `description`, `record`, `train_start`, `stance`, `gym`
  - 可見性設定：`visibility` (JSON) - 每個欄位可設定 public/friends/private
  - 軟刪除：`deletedAt` (DateTime?)
  - 時間戳：`createdAt`, `updatedAt`
  - 索引：`@@index([userId])`, `@@index([deletedAt])`
  - 關聯：`user` (User, onDelete: Cascade)

**類型定義更新** (`lib/types.ts`):

- 新增 `ProfileVisibility` 類型：`"public" | "friends" | "private"`
- 新增 `ProfileVisibilitySettings` 介面：定義每個欄位的可見性設定
- 新增 `Profile` 介面：完整的 Profile 資料結構
- 新增 `ProfilePublic` 介面：公開顯示用 Profile
- 新增 `CreateProfileInput`, `UpdateProfileInput`, `UpdateVisibilityInput` 介面
- 簡化 `User` 介面：移除 profile 相關欄位，新增 `profile?: Profile | null`
- 新增 `UserWithProfile` 介面：User + Profile 組合類型
- 更新 `UserPublic`, `UserPublicExtended`：註明從 profile 讀取資料
- 簡化 `RegisterInput`：僅保留 `userId`, `email`, `password`
- 更新 `UserProfilePage`：使用 `UserWithProfile`
- 新增 `UserWithProfileAndStats` 介面

**驗證 Schema** (`lib/validations.ts`):

- **簡化 `registerSchema`**：移除 `name`, `nickname`, `gender`, `birthDate`
- **新增 Profile Schema**：
  - `profileVisibilitySchema`: enum("public", "friends", "private")
  - `profileVisibilitySettingsSchema`: 定義所有欄位的可見性設定
  - `createProfileSchema`: 包含所有 Profile 欄位和驗證規則
  - `updateProfileSchema`: 部分更新，userId 不可更新
  - `updateVisibilitySchema`: 僅更新可見性設定
- **更新 Select Constants**：
  - 新增 `profileSelectPublic`: 公開顯示用 Profile 欄位
  - 新增 `profileSelectFull`: 完整 Profile 欄位
  - 更新 `userSelectPublic`: 包含 `profile` 關聯
  - 更新 `userSelectPublicExtended`: 包含 `profile` 關聯
  - 更新 `userSelectFull`: 包含 `profile` 關聯
  - 更新 `postIncludeBasic`, `commentIncludeBasic`: 使用新的 profile 結構

**Profile Service** (`lib/services/profiles.ts`):

- `checkFieldVisibility()`: 檢查欄位是否對查看者可見
- `filterProfileByVisibility()`: 根據可見性設定過濾 Profile 欄位
- `getProfileByUserId()`: 取得 Profile（根據可見性過濾，使用 unstable_cache）
- `getProfileByUserIdForOwner()`: 取得完整 Profile（不進行可見性過濾）
- `createProfile()`: 創建 Profile，設定預設可見性（全 public）
- `updateProfile()`: 更新 Profile
- `updateVisibility()`: 更新可見性設定
- `softDeleteProfile()`: 軟刪除 Profile
- `restoreProfile()`: 恢復軟刪除的 Profile
- `getProfileWithUser()`: 取得 User + Profile 組合

**User Service 更新** (`lib/services/users.ts`):

- 所有查詢加入 `profile` include
- `getUserProfile()`: 返回 `UserWithProfile`，確保 profile 存在
- `getUserProfilePage()`: 過濾軟刪除的 profile 和 posts
- `getUserComments()`: 包含 profile 資料
- `getAllUsers()`: 包含 profile 資料（管理員用）
- `banUser()`, `unbanUser()`: 包含 profile 資料

**Post/Comment Service 更新**:

- `lib/services/posts.ts`: 新增 `transformUser()` 函數，將嵌套的 profile 結構轉換為扁平結構
- `lib/services/comments.ts`: 新增 `transformUser()` 函數
- 所有返回 User 資料的函數都使用 `transformUser()` 進行轉換

**API 端點**:

- **註冊 API** (`app/api/auth/register/route.ts`):
  - 簡化註冊流程，僅接收 `userId`, `email`, `password`
  - 使用 transaction 同時創建 User 和 Profile
  - Profile 預設 name 使用 `userId`，設定預設可見性（全 public）
- **登入 API** (`app/api/auth/login/route.ts`):
  - 從 `profile` 關聯查詢顯示資料
  - 扁平化返回資料結構
- **Auth Me API** (`app/api/auth/me/route.ts`):
  - 扁平化返回資料，將 profile 資料合併到頂層
- **Profile API** (`app/api/profile/[userId]/route.ts`):
  - `GET`: 取得 Profile（根據可見性過濾）
  - `PATCH`: 更新 Profile（僅自己可更新）
  - `DELETE`: 軟刪除 Profile（僅自己可刪除）
- **可見性 API** (`app/api/profile/[userId]/visibility/route.ts`):
  - `GET`: 取得可見性設定（僅自己可見）
  - `PATCH`: 更新可見性設定（僅自己可更新）
- **管理員 Profile API** (`app/api/admin/profiles/route.ts`):
  - `GET`: 取得所有 Profile（支援分頁和包含已刪除）
- **管理員 Profile 操作 API** (`app/api/admin/profiles/[userId]/route.ts`):
  - `PATCH`: 更新任何 Profile
- **管理員 Profile 恢復 API** (`app/api/admin/profiles/[userId]/restore/route.ts`):
  - `POST`: 恢復軟刪除的 Profile

**前端組件**:

- **註冊表單** (`components/auth/register-form.tsx`):
  - 移除 `name`, `nickname`, `gender`, `birthDate` 欄位
  - 僅保留 `userId`, `email`, `password`, `confirmPassword`
- **Profile 編輯表單** (`components/profile/edit-profile-form.tsx`):
  - 完全重寫，使用 Tabs 分為「基本資訊」和「可見性設定」
  - 包含所有新欄位：height, weight, description, record, train_start, stance, gym
  - 整合 `ProfileVisibilitySettings` 組件
- **可見性設定組件** (`components/profile/profile-visibility-settings.tsx`):
  - 新建組件，允許用戶為每個欄位設定可見性
  - 使用 Select 組件選擇 public/friends/private
- **管理員 Profile 管理** (`components/admin/profile-management.tsx`):
  - 新建組件，顯示所有 Profile 列表
  - 支援查看、恢復軟刪除的 Profile
  - 顯示 Profile 狀態（Active/Deleted/Banned）
- **Admin Tabs** (`components/admin/admin-tabs.tsx`):
  - 新增 Profile Management tab
- **用戶資料顯示組件**:
  - `components/posts/post-card-author.tsx`: 使用 `UserPublic` 類型
  - `components/posts/post-profile-hovercard.tsx`: 使用 `UserPublic` 類型
  - `components/profile/profile-card.tsx`: 使用 `UserPublic` 類型
  - `components/profile/profile-hovercard.tsx`: 使用 `UserPublic` 類型
- **Navbar** (`components/layout/navbar.tsx`):
  - 安全訪問用戶資料，處理 profile 可能為 null 的情況

**頁面更新**:

- `app/settings/page.tsx`: 使用 `getUserProfile()` 獲取 `UserWithProfile`
- `app/user/[userId]/edit/page.tsx`: 使用 `getUserProfile()` 獲取 `UserWithProfile`
- `app/user/[userId]/page.tsx`: 從 `user.profile` 讀取顯示資料，顯示所有 Profile 欄位

**多語言支援** (`lib/constants.ts`):

- 新增可見性相關翻譯（四種語言）：
  - `PROFILE_MANAGEMENT`, `VISIBILITY_SETTINGS`, `VISIBILITY_SETTINGS_DESCRIPTION`
  - `BASIC_INFO`, `PUBLIC`, `FRIENDS_ONLY`, `PRIVATE`
  - `HEIGHT`, `WEIGHT`, `DESCRIPTION`, `RECORD`, `TRAIN_START_YEAR`, `STANCE`, `GYM`
  - `NO_PROFILES_FOUND`, `DELETED`, `ACTIVE`, `BANNED`, `CREATED_AT`, `SUCCESS_RESTORED`

**修復問題**:

- **登入 API 500 錯誤** (`app/api/auth/login/route.ts`):
  - 修正查詢舊 User 欄位的問題，改為從 `profile` 關聯查詢
- **Navbar 顯示問題** (`components/layout/navbar.tsx`, `app/api/auth/me/route.ts`):
  - 更新 `/api/auth/me` 扁平化返回資料
  - 添加安全訪問，處理 profile 為 null 的情況
- **Category 路由 404** (`app/category/[slug]/page.tsx`):
  - 實作完整的 Category 頁面，支援 slug 查詢
  - 處理 "general" 預設值，顯示無分類的貼文
  - 新增 `getCategoryBySlug()` 函數
- **Post Form Select 錯誤** (`components/posts/post-form.tsx`):
  - 修正 Select.Item 不能使用空字串作為 value 的問題
  - 使用 "none" 作為特殊值，提交時轉換為 null

**效能優化**:

- Profile 查詢使用 `unstable_cache` 和 cache tags
- 建立適當的資料庫索引（userId, deletedAt）
- 使用 transaction 確保 User 和 Profile 創建的一致性
- Post/Comment Service 使用 `transformUser()` 統一轉換邏輯，避免重複代碼

**向後兼容性**:

- 保留 `updateUserSchema` 作為 deprecated（向後兼容）
- 保留 `EditProfileInput` 作為 deprecated
- `AnonymousUser` 更新為扁平結構，符合 `UserPublic` 類型
- Service 層統一轉換邏輯，前端組件無需大幅修改

**主要修改文件**:

1. `prisma/schema.prisma` - 簡化 User 模型，新增 Profile 模型
2. `lib/types.ts` - 新增 Profile 相關類型，簡化 User 類型
3. `lib/validations.ts` - 簡化 registerSchema，新增 Profile schema 和 select constants
4. `lib/services/profiles.ts` - 新建 Profile Service（包含可見性邏輯）
5. `lib/services/users.ts` - 更新所有查詢包含 profile
6. `lib/services/posts.ts` - 新增 transformUser 函數
7. `lib/services/comments.ts` - 新增 transformUser 函數
8. `lib/services/categories.ts` - 新增 getCategoryBySlug 函數
9. `lib/auth.ts` - 更新 getCurrentUser 使用 profile
10. `app/api/auth/register/route.ts` - 簡化註冊流程，自動創建 Profile
11. `app/api/auth/login/route.ts` - 修正查詢 profile 資料
12. `app/api/auth/me/route.ts` - 扁平化返回資料
13. `app/api/profile/[userId]/route.ts` - 新建 Profile CRUD API
14. `app/api/profile/[userId]/visibility/route.ts` - 新建可見性 API
15. `app/api/admin/profiles/route.ts` - 新建管理員 Profile 列表 API
16. `app/api/admin/profiles/[userId]/route.ts` - 新建管理員 Profile 更新 API
17. `app/api/admin/profiles/[userId]/restore/route.ts` - 新建恢復 API
18. `components/auth/register-form.tsx` - 簡化註冊表單
19. `components/profile/edit-profile-form.tsx` - 重寫 Profile 編輯表單
20. `components/profile/profile-visibility-settings.tsx` - 新建可見性設定組件
21. `components/admin/profile-management.tsx` - 新建管理員 Profile 管理組件
22. `components/admin/admin-tabs.tsx` - 新增 Profile Management tab
23. `components/layout/navbar.tsx` - 更新用戶資料顯示
24. `components/posts/post-card-author.tsx` - 更新為使用 UserPublic
25. `components/posts/post-profile-hovercard.tsx` - 更新為使用 UserPublic
26. `components/profile/profile-card.tsx` - 更新為使用 UserPublic
27. `components/profile/profile-hovercard.tsx` - 更新為使用 UserPublic
28. `components/posts/post-form.tsx` - 修正 Select 組件錯誤
29. `app/settings/page.tsx` - 更新為使用 UserWithProfile
30. `app/user/[userId]/edit/page.tsx` - 更新為使用 UserWithProfile
31. `app/user/[userId]/page.tsx` - 從 profile 讀取顯示資料
32. `app/category/[slug]/page.tsx` - 實作完整 Category 頁面
33. `lib/constants.ts` - 新增可見性相關翻譯

---

### refactor/type-optimization

**難度**: ★★☆☆☆

**描述**: 優化類型定義和用戶資料轉換邏輯，統一處理 `undefined` 轉 `null`，提高類型安全性和代碼維護性

**問題分析**:

- `UserPublicExtended` 類型中 `avatar` 和 `nickname` 可能為 `undefined`，但類型定義為 `string | null`
- `transformUser` 函數在多個服務文件中重複定義，造成代碼重複
- 類型不一致導致 TypeScript 編譯錯誤
- 缺乏統一的用戶資料轉換邏輯

**解決方案**:

**類型定義優化** (`lib/types.ts`):

- 修正 `UserPublic` 和 `UserPublicExtended` 介面：
  - `nickname`: 從 `nickname?: string | null` 改為 `nickname: string | null`（嚴格類型，不允許 `undefined`）
  - `avatar`: 從 `avatar?: string | null` 改為 `avatar: string | null`（嚴格類型，不允許 `undefined`）
- 添加註釋說明類型嚴格性

**共享工具函數** (`lib/utils.ts`):

- 新增 `transformUser()` 函數：
  - 統一處理嵌套的 profile 結構轉換為扁平結構
  - 使用 `??` 運算符確保 `undefined` 轉為 `null`
  - 明確的類型定義，確保返回 `UserPublicExtended` 類型
  - 減少代碼重複，提高維護性

**服務層更新**:

- **`lib/services/posts.ts`**:
  - 移除重複的 `transformUser` 函數定義
  - 導入並使用共享的 `transformUser` 函數
  - `getPostById()` 明確返回 `PostWithDetails | null` 類型
- **`lib/services/comments.ts`**:
  - 移除重複的 `transformUser` 函數定義
  - 導入並使用共享的 `transformUser` 函數

**API 路由更新**:

- **`app/api/auth/me/route.ts`**:
  - 使用 `??` 運算符確保 `nickname` 和 `avatar` 的 `undefined` 轉為 `null`
  - 添加註釋說明類型轉換邏輯
- **`app/api/auth/login/route.ts`**:
  - 使用 `??` 運算符確保類型一致性
  - 添加註釋說明類型轉換邏輯

**組件更新**:

- **`components/posts/post-content.tsx`**:
  - 更新 `PostContentProps` 介面中的 `user` 和 `comments[].user` 類型定義
  - `nickname` 從 `nickname?: string | null` 改為 `nickname: string | null`
- **`app/posts/[id]/page.tsx`**:
  - 明確處理類型轉換，確保 `user` 和 `comment.user` 的 `avatar` 和 `nickname` 正確轉換
  - 使用 `??` 運算符確保 `undefined` 轉為 `null`

**效能優化**:

- 統一轉換邏輯減少代碼重複，提高維護性
- 嚴格類型定義減少運行時錯誤
- 統一的轉換函數便於後續優化和擴展

**主要修改文件**:

1. `lib/types.ts` - 修正 `UserPublic` 和 `UserPublicExtended` 類型定義
2. `lib/utils.ts` - 新增共享的 `transformUser` 函數
3. `lib/services/posts.ts` - 使用共享的 `transformUser` 函數，明確返回類型
4. `lib/services/comments.ts` - 使用共享的 `transformUser` 函數
5. `app/api/auth/me/route.ts` - 使用 `??` 運算符確保類型一致性
6. `app/api/auth/login/route.ts` - 使用 `??` 運算符確保類型一致性
7. `components/posts/post-content.tsx` - 更新類型定義
8. `app/posts/[id]/page.tsx` - 明確處理類型轉換

---

## 2025-11-18

### refactor/post-soft-delete

**難度**: ★★★☆☆

**描述**: 實作文章軟刪除機制，解決刪除文章後數據無法恢復的問題，保留數據完整性並改善用戶體驗

**問題分析**:

- 刪除文章時使用硬刪除（Hard Delete），會真正從資料庫中移除記錄
- 文章及其所有評論被永久刪除，無法恢復
- 用戶個人頁面的文章統計不準確
- 管理員無法追蹤已刪除的文章

**解決方案架構**:

- 採用軟刪除（Soft Delete）模式，在 Post 表中添加 `deletedAt` 欄位
- 刪除時標記而非真正刪除記錄，保留數據完整性
- 查詢時過濾已刪除的文章（但管理員可查看）
- 前端顯示「此文章已被刪除」佔位符（僅在直接訪問時）

**與評論軟刪除的差異**:

1. **顯示策略不同**：

   - 評論：已刪除的評論仍顯示佔位符以保持回覆結構
   - 文章：已刪除的文章不顯示在列表中，但直接訪問時顯示佔位符

2. **查詢邏輯不同**：

   - 評論：查詢時包含已刪除的評論（保留結構）
   - 文章：查詢時過濾已刪除的文章（不顯示在列表）

3. **管理員視圖**：
   - 管理員可以查看所有文章（包括已刪除的）
   - 管理員可以恢復已刪除的文章（未來功能）

**資料庫遷移**:

- 在 `prisma/schema.prisma` 的 Post 模型中添加 `deletedAt DateTime?` 欄位
- 在 `deletedAt` 欄位上添加索引以提升查詢性能
- 執行遷移創建 `20251118093339_add_deleted_at_to_post` 遷移文件
- 更新 Prisma Client

**類型定義更新** (`lib/types.ts`):

- 在 `Post`、`PostWithUser` 和 `PostWithDetails` 接口中添加 `deletedAt?: Date | string | null`
- 確保類型定義與資料庫結構一致

**服務層更新** (`lib/services/posts.ts`):

- `getPosts`: 查詢時過濾 `deletedAt: null`，確保列表不顯示已刪除文章
- `getHotPosts`: 查詢時過濾已刪除的文章
- `getPostById`: 不過濾已刪除的文章（允許直接訪問顯示佔位符）
- `getPostsCount`: 只計算未刪除的文章
- `getAllPostsAdmin`: 管理員查詢時可選擇是否包含已刪除文章（預設包含）
- 新增 `softDeletePost`: 軟刪除文章（設置 deletedAt）
- 更新 `deletePost` 和 `deletePostAdmin`: 改為軟刪除實現

**API 更新** (`app/api/posts/[id]/route.ts`):

- 將硬刪除改為軟刪除，使用 `softDeletePost` 函數
- 檢查文章是否已經被刪除
- 確保緩存正確更新

**API 查詢端點更新** (`app/api/posts/route.ts`):

- GET 端點查詢時過濾已刪除的文章

**管理員刪除 API 更新** (`app/api/admin/posts/[id]/route.ts`):

- 使用軟刪除而非硬刪除
- 管理員可以刪除任何文章

**前端組件更新** (`components/posts/post-content.tsx`):

- 檢查 `post.deletedAt` 是否存在
- 如果已刪除，顯示「此文章已被刪除」佔位符（使用 `POST_DELETED_PLACEHOLDER`）
- 隱藏已刪除文章的編輯、刪除按鈕
- 隱藏已刪除文章的統計信息和評論區
- 保留文章標題和用戶信息（用於上下文）

**文章詳情頁面更新** (`app/posts/[id]/page.tsx`):

- 確保傳遞 `deletedAt` 欄位給前端組件

**用戶個人頁面更新** (`app/user/[userId]/posts/page.tsx`):

- 查詢時過濾已刪除的文章，確保統計準確

**多語言支援** (`lib/constants.ts`):

- 添加 `POST_DELETED_PLACEHOLDER` 翻譯：
  - 英文: "This post has been deleted"
  - 日文: "この投稿は削除されました"
  - 簡體中文: "此文章已被删除"
  - 繁體中文: "此文章已被刪除"

**性能優化**:

- **資料庫索引**：在 `deletedAt` 欄位上添加索引（`Post_deletedAt_idx`），提升查詢性能
  - 所有使用 `deletedAt: null` 的查詢都會自動使用此索引
  - 遷移文件：`20251118093339_add_deleted_at_to_post`
- **Next.js 16 Cache Components**：
  - `getPostById` 和 `getPostsCount` 使用 `"use cache"` 指令優化緩存
  - `getPosts` 和 `getHotPosts` 使用 `unstable_cache` 實現 ISR（60 秒重新驗證）
- **查詢優化**：
  - 所有查詢都正確使用 `deletedAt: null` 過濾，確保使用索引欄位
  - 避免不必要的數據傳輸，只查詢未刪除的文章
- **緩存策略優化**：
  - 創建、更新、刪除文章時同時更新 `posts` 和 `hot-posts` 緩存標籤
  - 使用 `revalidatePath` 更新特定路徑的緩存
  - 使用 `revalidateTag` 批量更新相關緩存
  - 管理員刪除 API 也正確更新緩存

**技術考量**:

- 使用 `deletedAt` 而非 `isDeleted` Boolean，可以記錄刪除時間，未來可實現真正的物理刪除
- 查詢時預設過濾已刪除文章，但允許管理員查看
- 已刪除的文章不允許互動操作（點讚、評論等）
- 確保所有統計數據只計算未刪除的文章
- 利用 Next.js 16 的緩存機制，確保刪除後正確更新緩存

**主要修改文件**:

1. `prisma/schema.prisma` - 添加 deletedAt 欄位和索引
2. `lib/types.ts` - 更新類型定義
3. `lib/services/posts.ts` - 更新查詢和刪除邏輯
4. `app/api/posts/[id]/route.ts` - 更新刪除 API
5. `app/api/posts/route.ts` - 更新查詢 API
6. `app/api/admin/posts/[id]/route.ts` - 更新管理員刪除 API
7. `components/posts/post-content.tsx` - 更新 UI 顯示邏輯
8. `app/posts/[id]/page.tsx` - 處理已刪除文章顯示
9. `app/user/[userId]/posts/page.tsx` - 確保過濾已刪除文章
10. `lib/constants.ts` - 添加多語言支援

### refactor/comment-soft-delete

**難度**: ★★★☆☆

**描述**: 實作評論軟刪除機制，解決刪除評論後回覆無法正常顯示的問題，保留評論樹結構完整性

**問題分析**:

- 刪除評論時使用硬刪除（Hard Delete），會真正從資料庫中移除記錄
- 當父評論被刪除時，回覆該評論的其他評論無法正常顯示
- 評論樹結構被破壞，可能導致前端渲染錯誤

**解決方案架構**:

- 採用軟刪除（Soft Delete）模式，在 Comment 表中添加 `deletedAt` 欄位
- 刪除時標記而非真正刪除記錄，保留評論樹結構完整性
- 前端顯示「此評論已被刪除」佔位符，隱藏互動按鈕

**資料庫遷移**:

- 在 `prisma/schema.prisma` 的 Comment 模型中添加 `deletedAt DateTime?` 欄位
- 執行遷移創建 `20251118092158_add_deleted_at_to_comment` 遷移文件
- 更新 Prisma Client

**類型定義更新** (`lib/types.ts`):

- 在 `Comment` 和 `CommentWithUser` 接口中添加 `deletedAt?: Date | string | null`
- 確保類型定義與資料庫結構一致

**服務層更新** (`lib/services/comments.ts`):

- `getCommentsByPostId`: 查詢時包含已刪除的評論（保留回覆結構）
- `getCommentReplies`: 查詢回覆時包含已刪除的評論
- `getCommentById`: 不過濾已刪除的評論
- 新增 `softDeleteComment`: 遞迴軟刪除評論及其所有子評論
- 更新 `updateCommentRepliesCount`: 只計算未刪除的回覆數
- 標記 `incrementCommentReplies` 和 `decrementCommentReplies` 為 deprecated

**API 更新** (`app/api/comments/[id]/route.ts`):

- 將硬刪除改為軟刪除，使用 `softDeleteComment` 函數
- 檢查評論是否已經被刪除
- 更新父評論的 `replies` 計數，只計算未刪除的回覆

**評論創建 API 更新** (`app/api/comments/route.ts`):

- 更新父評論的 `replies` 計數邏輯，只計算未刪除的回覆

**前端組件更新** (`components/comments/comment-item.tsx`):

- 檢查 `comment.deletedAt` 是否存在
- 如果已刪除，顯示「此評論已被刪除」佔位符（使用 `COMMENT_DELETED_PLACEHOLDER`）
- 隱藏已刪除評論的點讚、回覆、刪除按鈕
- 保留評論的用戶信息和時間戳（用於上下文）

**多語言支援** (`lib/constants.ts`):

- 添加 `COMMENT_DELETED_PLACEHOLDER` 翻譯：
  - 英文: "This comment has been deleted"
  - 日文: "このコメントは削除されました"
  - 簡體中文: "此评论已被删除"
  - 繁體中文: "此評論已被刪除"

**技術考量**:

- 使用 `deletedAt` 而非 `isDeleted` Boolean，可以記錄刪除時間，未來可實現真正的物理刪除
- 查詢時保留已刪除的父評論以便顯示回覆結構
- 已刪除的評論不允許互動操作（點讚、回覆）
- 評論計數只計算未刪除的回覆，確保數據準確性
- 利用 Next.js 16 的緩存機制，確保刪除後正確更新緩存

**主要修改文件**:

1. `prisma/schema.prisma` - 添加 deletedAt 欄位
2. `lib/types.ts` - 更新類型定義
3. `lib/services/comments.ts` - 更新查詢和刪除邏輯
4. `app/api/comments/[id]/route.ts` - 更新刪除 API
5. `app/api/comments/route.ts` - 更新創建評論時的計數邏輯
6. `components/comments/comment-item.tsx` - 更新 UI 顯示邏輯
7. `lib/constants.ts` - 添加多語言支援

### refactor/post-page-server-component

**難度**: ★★★★☆

**描述**: 將 Post 頁面從客戶端組件轉換為伺服器組件，解決回覆評論後無法獲取最新評論的問題，並利用 Next.js 16 的自動快取更新機制提升性能和 SEO

**問題分析**:

- Post 頁面原本是客戶端組件，使用 `useEffect` 和 `fetch` 獲取數據
- 回覆評論後，`router.refresh()` 不會觸發 `useEffect` 重新執行
- 導致回覆評論後頁面無法顯示最新的評論數據

**解決方案架構**:

- 將 Post 頁面轉換為伺服器組件，利用 Next.js 16 的 `revalidatePath` 和 `router.refresh()` 自動更新機制
- 將需要互動的功能拆分為獨立的客戶端組件

**組件重構**:

- 創建 `components/posts/post-edit-form.tsx`：
  - 將編輯功能拆分為獨立的客戶端組件
  - 使用 `router.refresh()` 在更新成功後刷新頁面
  - 處理表單狀態和驗證（使用 react-hook-form）
- 創建 `components/posts/post-content.tsx`：
  - 將點讚、編輯按鈕等互動功能拆分為客戶端組件
  - 處理客戶端狀態（如 isLiked）
  - 整合評論列表和表單
  - 使用 `useEffect` 獲取用戶點讚狀態

**伺服器組件轉換** (`app/posts/[id]/page.tsx`):

- 移除 `"use client"` 指令
- 改為 async 函數，在伺服器端獲取數據
- 使用 `getPostById` 和 `getCurrentUser` 獲取數據
- 使用 `incrementPostViews` 非同步增加瀏覽次數
- 處理 404 情況（使用 `notFound()`）
- 將數據傳遞給 `PostContent` 客戶端組件

**評論組件更新**:

- 更新 `components/comments/comment-item.tsx`：

  - 在回覆成功後調用 `router.refresh()` 來刷新整個頁面
  - 移除舊的手動 refetch 邏輯（`setReloadTrigger`）
  - 簡化回覆成功後的處理邏輯

- `components/comments/comment-form.tsx`：
  - 已包含 `router.refresh()` 邏輯（無需修改）
  - 當沒有 `onSuccess` callback 時自動調用 `router.refresh()`

**快取機制驗證**:

- 確認 `app/api/comments/route.ts` 中的 `revalidatePath` 設置正確
- 確認 `app/api/posts/[id]/route.ts` 中的 `revalidatePath` 設置正確
- 當 API 調用 `revalidatePath` 後，`router.refresh()` 會自動觸發伺服器組件重新獲取數據

**性能優勢**:

- ✅ **自動快取更新**：當 `revalidatePath` 被調用後，`router.refresh()` 會自動觸發伺服器組件重新獲取數據
- ✅ **性能更優**：伺服器端渲染，減少客戶端 JavaScript 負載
- ✅ **SEO 更好**：完整的 HTML 在伺服器端生成
- ✅ **資源消耗更少**：利用 Next.js 16 的伺服器端快取機制
- ✅ **最小化網絡請求**：只在回覆成功後觸發一次刷新

**成果**:

- 成功解決回覆評論後無法獲取最新評論的問題
- Post 頁面現在是伺服器組件，利用 Next.js 16 的最佳實踐
- 當用戶回覆評論後，頁面會自動從資料庫獲取最新的評論數據
- 代碼結構更清晰，互動功能與數據獲取邏輯分離
- 更好的性能和 SEO 表現

---

### fix/home-page-cache-after-comment

**難度**: ★★☆☆☆

**描述**: 修復在 post 頁面評論後返回首頁時，首頁快取未更新的問題，確保首頁能顯示最新的評論數據

**問題分析**:

- 當用戶在 post 頁面評論後返回首頁時，首頁不會顯示最新的評論數據
- 首頁使用 `getPosts()` 函數，該函數使用 `unstable_cache` 並設置了 cache tag `["posts"]`
- 評論 API (`app/api/comments/route.ts`) 原本只更新：
  - `revalidatePath(/posts/${postId})` - 只更新該 post 頁面
  - `revalidateTag("hot-posts")` - 只更新熱門貼文快取
- **缺少** `revalidateTag("posts")` 來更新首頁的快取
- **缺少** `revalidatePath("/")` 來更新首頁路徑

**解決方案**:

- 在評論 API 中添加首頁快取的重新驗證，與創建 Post 的處理保持一致

**API Routes 更新**:

- 更新 `app/api/comments/route.ts` (POST)：

  - 添加 `revalidatePath("/")` - 更新首頁路徑快取
  - 添加 `revalidateTag("posts")` - 更新首頁使用的 `["posts"]` tag 快取
  - 保留現有的 `revalidatePath(/posts/${postId})` 和 `revalidateTag("hot-posts")`

- 更新 `app/api/comments/[id]/route.ts` (DELETE)：
  - 導入 `revalidatePath` 和 `revalidateTag`
  - 添加相同的快取重新驗證邏輯：
    - `revalidatePath(/posts/${postId})` - 更新該 post 頁面
    - `revalidatePath("/")` - 更新首頁路徑
    - `revalidateTag("posts")` - 更新首頁快取
    - `revalidateTag("hot-posts")` - 更新熱門貼文快取

**性能考量**:

- ✅ 使用 `revalidateTag("posts")` 只更新相關的快取，不會影響其他頁面
- ✅ 使用 `revalidatePath("/")` 確保首頁路徑也被更新
- ✅ 與現有的 `revalidateTag("hot-posts")` 並存，確保所有相關快取都被更新
- ✅ 最小化快取更新範圍，只更新必要的快取

**成果**:

- 當用戶在 post 頁面評論後返回首頁時，首頁會自動顯示最新的評論數據
- 首頁的評論數量會正確更新
- 刪除評論後，首頁的評論數量也會正確更新
- 與創建 Post 的行為保持一致
- 所有會影響首頁顯示的評論操作都正確更新快取

---

## 2025-11-16

### refactor/unify-user-data-types

**難度**: ★★★☆☆

**描述**: 統一使用者資料類型系統，將原本 8 種不同的使用者資料格式合併為 3 個核心類型，解決類型不一致問題並確保所有查詢返回最詳細的使用者資料（包含完整統計資訊）

**類型系統重構** (`lib/types.ts`):

- 創建 `UserPublic` 類型：公開顯示用（id, userId, name, nickname, avatar）
- 創建 `UserPublicExtended` 類型：擴展版（包含 email）
- 創建 `UserStats` 介面：統一統計資料結構（posts, comments, likedPosts, likedComments）
- 創建 `UserWithStats` 類型：完整使用者資料 + 完整統計
- 更新 `PostWithUser` 使用 `UserPublicExtended`
- 更新 `CommentWithUser` 使用 `UserPublicExtended`
- 更新 `UserWithCounts` 為 `UserWithStats` 的別名（向後兼容）
- 更新 `UserProfilePage` 使用 `UserWithStats`
- 更新 `AdminPostListItem` 使用 `UserPublic`

**Prisma Select 常數統一** (`lib/validations.ts`):

- 創建 `userSelectPublic`：基本公開資料（id, userId, name, nickname, avatar）
- 創建 `userSelectPublicExtended`：公開資料 + email
- 創建 `userSelectFull`：完整使用者資料（所有欄位）
- 創建 `userSelectWithStats`：完整資料 + 統計（posts, comments, likedPosts, likedComments）
- 保留 `userSelectBasic` 作為 `userSelectPublic` 的別名（向後兼容）
- 更新 `postIncludeBasic` 使用 `userSelectPublicExtended`
- 更新 `commentIncludeBasic` 使用 `userSelectPublicExtended`

**服務層更新**:

- 更新 `lib/services/posts.ts`：所有查詢使用 `userSelectPublicExtended`，解決 `getHotPosts` 缺少 `email` 欄位的類型錯誤
- 更新 `lib/services/comments.ts`：所有查詢使用 `userSelectPublicExtended`
- 更新 `lib/services/users.ts`：
  - `getUserById` 使用 `userSelectFull`
  - `getUserWithCounts` 使用 `userSelectWithStats`
  - `getUserProfile` 使用 `userSelectFull`
  - `updateUserProfile` 使用 `userSelectFull`
  - `getUserProfilePage` 使用 `userSelectFull` + 完整統計
  - `getUserLikedPosts`、`getUserLikedComments`、`getUserComments` 內部的 user select 使用 `userSelectPublicExtended`

**API Routes 更新**:

- 更新 `app/api/posts/[id]/route.ts`：使用 `userSelectPublicExtended`
- 更新 `app/api/comments/[id]/replies/route.ts`：使用 `userSelectPublicExtended`
- 更新 `app/api/user/[userId]/route.ts`：
  - GET 使用 `userSelectWithStats`（包含完整統計）
  - PATCH 使用 `userSelectFull`
- 更新 `app/api/auth/me/route.ts`：使用 `userSelectFull`

**驗證與測試**:

- 執行 `pnpm run build` 驗證所有類型錯誤已解決
- 所有 TypeScript 編譯通過
- 原始錯誤（`getHotPosts` 缺少 `email` 欄位）已修復

**成果**:

- 從 8 種不同的使用者資料格式統一為 3 個核心類型
- 所有查詢現在返回最詳細的使用者資料，個人資料頁包含完整統計（posts, comments, likedPosts, likedComments）
- 類型安全：所有查詢都符合類型定義，消除類型錯誤
- 代碼簡潔：使用統一的 select 常數，減少重複代碼
- 向後兼容：保留 `userSelectBasic` 和 `UserWithCounts` 別名，不影響現有代碼

---

### feat/top-page-timeline

**難度**: ★☆☆☆☆

**描述**: 在首頁使用垂直 progress bar indicator，保留現有 timeline 的漸層顏色、寬度與類似的垂直設計。使用 motion 建立新的 progress bar 元件，確保不會導致版面變形且不影響效能和頁面讀取速度。

**組件實作** (`components/ui/scroll-progress-bar.tsx`):

- 創建獨立的 `ScrollProgressBar` 組件
- 使用 Motion 的 `useScroll()` 追蹤整個頁面的滾動進度（無需 target）
- 使用 `useTransform` 將 `scrollYProgress` 映射到 `scaleY`（0 到 1）
- 使用 `useTransform` 實現前 10% 滾動的淡入效果（opacity）
- 使用 `fixed` 定位，位於左側（`left-8`），不影響文檔流
- 使用 `pointer-events-none` 避免阻擋使用者互動
- 使用 `transformOrigin: "top"` 確保從頂部開始縮放
- 應用 `contain: layout style paint` CSS 屬性以隔離渲染
- 使用 `will-change: transform` 提示瀏覽器優化
- 漸層顏色：`from-rose-500 via-orange-500 to-transparent`（與現有 Timeline 一致）
- 寬度：2px（與現有 Timeline 一致）
- 響應式：手機版隱藏（`hidden md:block`）

**首頁整合** (`app/page.tsx`):

- 導入 `ScrollProgressBar` 組件
- 在 `<section>` 開頭放置組件（在 `<HomeHeader />` 之前）

**效能優化重點**:

- 使用 `scaleY` 而非 `height`：GPU 加速，無 layout 重排
- 簡化實現：無需 `useEffect` 和狀態管理
- 直接使用 `scrollYProgress`，程式碼更簡潔
- 使用 `transformOrigin: "top"` 確保正確的縮放方向

**成果**:

- 實現了流暢的垂直滾動進度指示器
- 使用 GPU 加速的 `scaleY` 動畫，確保 60fps 的流暢表現
- 不影響文檔流，避免版面變形
- 與現有 Timeline 組件並存，視覺風格一致
- 響應式設計，手機版自動隱藏

---

### feat/isr-hot-posts

**難度**: ★★★☆☆

**描述**: 使用 Next.js 16 ISR (Incremental Static Regeneration) 功能優化首頁熱門貼文列表，實現超快速載入和更好的效能表現

**前端任務**:

- 在 `app/page.tsx` 添加 `export const revalidate = 60` 設定 ISR 重新驗證間隔

**後端任務**:

- 在 `lib/services/posts.ts` 建立 `getHotPosts()` 函數，實作熱門貼文查詢邏輯
  - 熱度算法：綜合分數 = (likes × 2) + (comments × 1.5) + (views × 0.1) + 時間衰減因子
  - 時間範圍：優先顯示最近 48 小時內的貼文（可調整）
- 使用 `unstable_cache` 配合 cache tags (`'hot-posts'`) 和 `revalidate: 60` 選項
- 在 `app/api/posts/route.ts` (POST) 中，新增貼文時調用 `revalidateTag('hot-posts')`
- 在 `app/api/posts/[id]/like/route.ts` 中，點讚時調用 `revalidateTag('hot-posts')`
- 在 `app/api/comments/route.ts` 中，新增評論時調用 `revalidateTag('hot-posts')`
- 在 `app/api/posts/[id]/route.ts` (PATCH) 中，更新貼文時調用 `revalidateTag('hot-posts')`
- 在 `app/api/posts/[id]/route.ts` (DELETE) 中，刪除貼文時調用 `revalidateTag('hot-posts')`
- 建立 `app/api/revalidate/route.ts` API route，使用 secret token 保護，支援手動觸發 revalidation
  - 支援透過 `tag` 或 `path` 參數進行 revalidation
  - 需要設定 `REVALIDATE_SECRET` 環境變數
