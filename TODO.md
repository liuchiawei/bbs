# TODO Memos

## UI Components

### feat/ui-nav

**難度**: ★★☆☆☆

**描述**: 導航列 UI 組件開發

---

## Features

### feat/top-page-timeline

**狀態**: 已完成（詳細記錄見 CHANGELOG.md）

**難度**: ★☆☆☆☆

**描述**: 在首頁使用垂直 progress bar indicator，保留現有 timeline 的漸層顏色、寬度與類似的垂直設計。使用 motion 建立新的 progress bar 元件，思考不會導致版面變形又不影響效能和頁面讀取速度的方式

### feat/post-form-redesign

**難度**: ★★★★☆

**描述**: 重新設計發文表單，將新頁面改為置頂顯示，手機版切換為小按鈕

**前端任務**:

- 將 post new 從新頁面改成置頂顯示
- 手機版切換成小按鈕
- 整合 shadcn/ui 組件:
  - `accordion`: 顯示回覆貼文
  - `hover-card`: 取代現有的 ToolTip profile-card-mini 小卡
  - `field`, `input-group`: 用於 post-form, register-form, edit-profile-form 等表單
  - `dialog`: 電腦版的新貼文表單介面
  - `sheet`: 手機板的貼文表單使用`Sheet`(side:down)

**後端任務**:

- 更新 Prisma Schema
- 更新相關 API

---

### feat/profile-card-components

**難度**: ★☆☆☆☆

**描述**: 開發多種尺寸的個人資料卡片組件

**前端任務**:

- `profile-card-horizontal-sm`: 橫版小尺寸，hover 使用者名稱時顯示
- `profile-card-horizontal-lg`: 橫版大尺寸，放在 mypage 頁頭
- `profile-card-vertical-sm`: 直版小尺寸，功能未定
- `profile-card-vertical-lg`: 直版大尺寸，放在桌機版 Nav sheet 中

---

### feat/infinite-scroll

**難度**: ★★☆☆☆

**描述**: 使用`react-window`實作首頁貼文的無限捲動功能。留意快速載入和效能優化表現。

---

### feat/isr-hot-posts

**狀態**: 已完成（詳細記錄見 CHANGELOG.md）

**難度**: ★★★☆☆

**描述**: 使用 Next.js 16 ISR (Incremental Static Regeneration) 功能優化首頁熱門貼文列表，實現超快速載入和更好的效能表現

**待實作項目**:

**前端任務** (中優先度):

- 優化組件結構以支援 Partial Prerendering (PPR)
- 將 `PostCard` 拆分為靜態和動態部分，使用 Suspense 邊界包裹動態互動元素
- 添加載入狀態和效能監控指標
- 考慮在首頁使用 `getHotPosts()` 取代 `getPosts()` 顯示熱門貼文

**後端任務** (中優先度):

- 優化資料庫查詢效能，考慮為 `views`、`likes`、`createdAt` 建立複合索引
- 優化現有的 `getPosts()` 函數，添加適當的 cache tags（如 `'posts'`）
- 實作更精細的 cache invalidation 策略（例如：只更新受影響的貼文）

**進階優化** (低優先度):

- 實作多層快取策略（記憶體快取 + Redis 快取層）
- 添加效能監控指標（cache hit/miss 率、載入時間等）
- 考慮使用 Edge Function 快取
- 實作個人化熱門貼文（基於使用者興趣的推薦）
- 使用 Server-Sent Events (SSE) 或 WebSocket 實現即時更新
- 實作 optimistic updates 提升使用者體驗

**注意事項**:

- 不進行資料庫結構變更（跳過 Prisma Schema 修改）
- 使用現有的 `views`、`likes`、`comments` 欄位計算熱度
- 根據實際流量調整 `revalidate` 間隔時間（目前設定為 60 秒）
- 確保 cache invalidation 邏輯正確運作
- 環境變數設定：需要在 `.env.local` 或 `.env` 中設定 `REVALIDATE_SECRET`

---

### refactor/unify-user-data-types

**狀態**: 已完成（詳細記錄見 CHANGELOG.md）

**難度**: ★★★☆☆

**描述**: 統一使用者資料類型系統，將原本 8 種不同的使用者資料格式合併為 3 個核心類型，解決類型不一致問題並確保所有查詢返回最詳細的使用者資料（包含完整統計資訊）

---

### feat/recommendation-algorithm

**難度**: ★★★★★

**描述**: 根據使用者的喜好和習慣預測推文內容的推薦演算法

**前端任務**:

- 實作推薦貼文顯示介面
- 整合無限捲動功能

**後端任務**:

- 設計推薦演算法邏輯
- 實作使用者行為追蹤
- 建立推薦 API

**注意事項**:

- 可能需要更改資料庫結構 (Prisma Schema)
- 盡量減少資料庫操作
- 需配合無限捲動功能

---

### feat/search

**難度**: ★★★☆☆

**描述**: 搜尋功能開發

**前端任務**:

- 建立搜尋頁面
- 實作搜尋結果顯示

**後端任務**:

- 建立搜尋 API
- 實作搜尋邏輯

---

### feat/user-profile

**難度**: ★★★☆☆

**描述**: 增加使用者基本資料功能，如賽事成績、拳齡等

**資料庫結構變更** (Prisma Schema):

- 新建 `Profile` 表格 (model Profile)，將基本資料與 User 分離
- `User` 只保留登入需要的基本資料:
  - `id`
  - `userId`
  - `email`
  - `password`
- `Profile` 包含使用者詳細資料:
  - `gender`: 性別
  - `birth`: 生日
  - `avatar`: 頭像
  - `height`: 身高
  - `weight`: 體重
  - `description`: 自我介紹
  - `record`: 賽事成績
  - `train_start`: 訓練開始年份 (西元年)
  - `stance`: 站架
  - `gym`: 所屬拳館

---

### feat/points-system

**難度**: ★★★☆☆

**描述**: 積分系統開發

**前端任務**:

- 顯示使用者積分
- 積分歷史記錄頁面

**後端任務**:

- 建立積分資料表
- 實作積分計算邏輯
- 建立積分 API

**獎勵系統**:

- 發文 (post)
- 評論 (comment)
- 評分 (rating)
- 贈與
- 預測賽事成功 (投注)

**管理功能**:

- 管理員回溯積分
- 管理員管理積分

---

### feat/match-prediction

**難度**: ★★★★☆

**描述**: 預測賽事結果功能，讓使用者可以投入積分進行預測

**前端任務**:

- 建立賽事頁面
- 首頁新增賽事區塊
- 實作預測介面

**後端任務**:

- 建立賽事資料表
- 計算積分賠率
- 根據賽事結果分配積分獎勵
- 建立預測 API

---

### feat/rating-system

**難度**: ★★★☆☆

**描述**: 評分系統開發，參考虎撲設計

**前端任務**:

- 建立評分頁面
- 顯示評分結果

**後端任務**:

- 更新資料庫結構
- 建立評分 API 與 Service

**功能範圍**:

- 分成賽事與選手兩種評分對象
- 選手評分系統可考慮與使用者積分連動

---

### feat/subscription

**難度**: ★★☆☆☆

**描述**: 訂閱/追蹤功能開發

**前端任務**:

- 在 Mypage 和 Profile-card 顯示追蹤人數
- 實作追蹤/取消追蹤按鈕

**後端任務**:

- 更新資料庫結構
- 建立追蹤 API

---

### feat/notifications

**難度**: ★★★☆☆

**描述**: 通知系統開發

**前端任務**:

- 建立通知頁面
- 實作通知顯示

**後端任務**:

- 建立通知資料表
- 建立通知 API
- 實作通知推送邏輯

---

### feat/i18n

**難度**: ★★★☆☆

**描述**: 多語言支援功能

**前端任務**:

- 整合 i18n 套件
- 建立語言切換介面
- 翻譯所有文字內容

**後端任務**:

- 建立多語言資料結構
- 更新 API 支援多語言

**支援語言**:

- 英文 (en)
- 日文 (ja)
- 簡體中文 (zh-CN)
- 繁體中文 (zh-TW)

---

### feat/auth-google

**難度**: ★★★☆☆

**描述**: Google 帳號登入功能開發

**前端任務**:

- 整合 Google OAuth 登入按鈕
- 處理登入流程

**後端任務**:

- 整合 Google OAuth API
- 建立 Google 帳號綁定邏輯
- 更新使用者認證流程

---

### feat/ai

**難度**: ★★★★☆

**描述**: 整合 Vercel AI SDK，當使用者發文時若未提供標題，自動使用 OpenAI LLM 生成合適的標題

**前端任務**:

- 在 `PostCard` 和貼文詳情頁面中，當 `isAIGenerated` 為 `true` 時顯示標籤 "(自動生成)"，使用 `text-muted-foreground` 樣式
- 更新發文表單 UI，標題欄位改為可選（optional）
- 在發文表單中顯示載入狀態，當 AI 正在生成標題時提供視覺回饋
- 考慮添加使用者手動觸發 AI 生成標題的按鈕（可選功能）

**後端任務**:

- 安裝相關套件:
  - `ai` (Vercel AI SDK)
  - `openai` (OpenAI SDK)
- 建立 AI API 端點 (`/api/ai/generate-title`):
  - 接收貼文內容作為輸入
  - 使用 OpenAI API 生成合適的標題
  - 實作錯誤處理和重試邏輯
  - 設定適當的 prompt 和模型參數（temperature, max_tokens 等）
- 修改發文 API (`/api/posts`):
  - 更新 validation schema，將標題欄位改為可選
  - 當標題為空或未提供時，自動呼叫 AI API 生成標題
  - 設定 `isAIGenerated` 欄位值（使用者提供標題時設為 `false`，AI 生成時設為 `true`）
  - 處理 AI API 失敗的情況（fallback 機制或錯誤處理）
- 實作 AI 服務層 (`lib/ai` 或 `services/ai`):
  - 封裝 OpenAI 呼叫邏輯
  - 實作標題生成函數
  - 添加快取機制（可選，避免重複生成相同內容的標題）
  - 實作 rate limiting 和成本控制

**資料庫結構變更** (Prisma Schema):

- 在 `Post` model 中新增欄位:
  - `isAIGenerated`: `Boolean` (預設值: `false`)
  - 執行 migration 更新資料庫結構

**注意事項**:

- 環境變數設定：需要在 `.env.local` 或 `.env` 中設定 `OPENAI_API_KEY`
- 考慮 API 成本和 rate limiting，實作適當的限流機制
- 確保 AI 生成的標題符合內容規範和長度限制
- 處理 AI API 延遲問題，考慮使用非同步處理或背景任務
- 實作適當的錯誤處理，當 AI 服務不可用時應有 fallback 機制
- 使用者偏好設定功能請參考: [`feat/setting-page`](#featsetting-page)
- 相關功能擴展請參考: [`feat/ai-generated-post`](#featai-generated-post)
- 監控 AI API 使用量和成本

---

### feat/setting-page

**難度**: ★★★☆☆

**描述**: 建立使用者偏好設定頁面，提供個人化設定選項，包含 AI 相關功能的開關控制

**前端任務**:

- 建立設定頁面路由 (`/settings` 或 `/mypage/settings`)
- 設計設定頁面 UI 結構:
  - 使用 `tabs` 或 `accordion` 組件組織不同設定分類
  - 整合 shadcn/ui 的 `switch`、`checkbox`、`select` 等表單組件
  - 實作響應式設計，確保手機版體驗良好
- 實作 AI 功能設定區塊:
  - 自動生成標題開關 (`autoGenerateTitle`)
  - AI 修飾文章內容開關 (`enableAIContentEnhancement`)
  - 顯示設定說明和提示文字
  - 實作即時儲存功能（debounce 優化）
- 實作其他設定區塊（可擴展）:
  - 通知設定
  - 隱私設定
  - 顯示偏好設定
- 添加設定變更的視覺回饋（toast 通知）
- 實作設定載入狀態和錯誤處理

**後端任務**:

- 更新 Prisma Schema，在 `User` 或 `Profile` model 中新增設定欄位:
  - `autoGenerateTitle`: `Boolean` (預設值: `true`)
  - `enableAIContentEnhancement`: `Boolean` (預設值: `false`)
  - 或建立獨立的 `UserSettings` model 以支援未來擴展
- 建立設定 API (`/api/user/settings`):
  - `GET /api/user/settings`: 取得使用者設定
  - `PATCH /api/user/settings`: 更新使用者設定
  - 實作權限驗證，確保使用者只能修改自己的設定
- 修改發文 API (`/api/posts`):
  - 在自動生成標題邏輯中，檢查使用者的 `autoGenerateTitle` 設定
  - 僅在使用者啟用該功能時才自動生成標題
- 實作設定驗證邏輯:
  - 確保設定值的有效性
  - 處理預設值邏輯

**資料庫結構變更** (Prisma Schema):

- 方案一：在 `User` model 中新增欄位:
  - `autoGenerateTitle`: `Boolean @default(true)`
  - `enableAIContentEnhancement`: `Boolean @default(false)`
- 方案二：建立 `UserSettings` model (推薦，便於未來擴展):
  - `id`: `String @id @default(uuid())`
  - `userId`: `String @unique`
  - `user`: `User @relation(fields: [userId], references: [id])`
  - `autoGenerateTitle`: `Boolean @default(true)`
  - `enableAIContentEnhancement`: `Boolean @default(false)`
  - `createdAt`: `DateTime @default(now())`
  - `updatedAt`: `DateTime @updatedAt`
- 執行 migration 更新資料庫結構

**注意事項**:

- 設定頁面應與 [`feat/ai`](#featai) 和 [`feat/ai-generated-post`](#featai-generated-post) 功能整合
- 考慮使用 localStorage 作為前端快取，減少 API 呼叫
- 實作設定變更的歷史記錄（可選，用於除錯和審計）
- 確保設定變更的即時性，避免使用者體驗不一致
- 考慮添加設定匯入/匯出功能（可選）

---

### feat/ai-generated-post

**難度**: ★★★★☆

**描述**: 擴展 AI 功能，讓使用者能夠使用 AI 修飾和優化文章內容，提供更完善的寫作輔助功能

**前端任務**:

- 在發文表單中新增 AI 修飾功能:
  - 添加 "AI 修飾內容" 按鈕，位於內容編輯器工具列
  - 實作載入狀態顯示（progress indicator 或 skeleton）
  - 顯示修飾前後的對比預覽（可選，使用 diff view）
  - 允許使用者接受或拒絕 AI 修飾結果
- 實作 AI 修飾選項 UI:
  - 提供多種修飾模式選擇（如：潤色、簡化、擴充、專業化等）
  - 使用 `select` 或 `radio-group` 組件
  - 添加修飾強度調整（可選）
- 在設定頁面整合 AI 修飾偏好設定:
  - 參考 [`feat/setting-page`](#featsetting-page) 的實作
  - 添加 "自動啟用 AI 修飾" 開關
  - 預設修飾模式選擇
- 實作修飾歷史記錄（可選）:
  - 儲存使用者使用過的修飾記錄
  - 允許快速套用之前的修飾結果
- 添加 AI 修飾的視覺標記:
  - 在貼文詳情頁面顯示 "AI 修飾" 標籤（類似 `isAIGenerated` 標籤）
  - 使用 `text-muted-foreground` 樣式

**後端任務**:

- 擴展 AI 服務層 (`lib/ai` 或 `services/ai`):
  - 實作 `enhanceContent()` 函數，用於修飾文章內容
  - 支援多種修飾模式（潤色、簡化、擴充、專業化等）
  - 實作內容長度控制，避免修飾後內容過長
  - 添加快取機制（可選，避免重複修飾相同內容）
- 建立 AI 修飾 API 端點 (`/api/ai/enhance-content`):
  - 接收原始內容和修飾模式作為輸入
  - 使用 OpenAI API 進行內容修飾
  - 實作錯誤處理和重試邏輯
  - 設定適當的 prompt 和模型參數
  - 實作 rate limiting 和成本控制
- 更新 Prisma Schema，在 `Post` model 中新增欄位:
  - `isAIEnhanced`: `Boolean` (預設值: `false`)
  - `aiEnhancementMode`: `String?` (可選，記錄使用的修飾模式)
  - 執行 migration 更新資料庫結構
- 修改發文 API (`/api/posts`):
  - 當使用者提交修飾後的內容時，設定 `isAIEnhanced` 為 `true`
  - 記錄 `aiEnhancementMode`（如果提供）
  - 檢查使用者的 `enableAIContentEnhancement` 設定（如果實作自動修飾功能）
- 實作內容驗證:
  - 確保修飾後的內容符合平台規範
  - 檢查內容長度限制
  - 驗證內容品質（避免無意義的修飾）

**資料庫結構變更** (Prisma Schema):

- 在 `Post` model 中新增欄位:
  - `isAIEnhanced`: `Boolean @default(false)`
  - `aiEnhancementMode`: `String?` (可選，如: "polish", "simplify", "expand", "professionalize")
  - 執行 migration 更新資料庫結構

**注意事項**:

- 與 [`feat/ai`](#featai) 共用相同的 AI 服務層和基礎設施
- 與 [`feat/setting-page`](#featsetting-page) 整合，提供使用者偏好設定
- 考慮 API 成本和效能，實作適當的快取和限流機制
- 確保 AI 修飾不會改變使用者的原意和語氣
- 提供使用者明確的控制權，避免過度自動化
- 實作內容版本控制（可選），允許使用者查看修飾前後的差異
- 監控 AI API 使用量和成本，特別是內容修飾可能消耗更多 tokens
- 考慮實作批量修飾功能（可選），允許使用者一次修飾多段內容
