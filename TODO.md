# TODO Memos

## UI Components

### feat/ui-nav

**難度**: ★★☆☆☆

**描述**: 導航列 UI 組件開發

---

## Features

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
