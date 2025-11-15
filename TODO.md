# TODO Memos

## UI Components

### feat/ui-nav

導航列 UI 組件開發

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

**後端任務**:

- 更改回覆格式，將回覆視為 post 的一種
- 更新 Prisma Schema
- 更新相關 API

---

### feat/profile-card-components

**難度**: ★☆☆☆☆

**描述**: 開發多種尺寸的個人資料卡片組件

**組件列表**:

- `profile-card-horizontal-sm`: 橫版小尺寸，hover 使用者名稱時顯示
- `profile-card-horizontal-lg`: 橫版大尺寸，放在 mypage 頁頭
- `profile-card-vertical-sm`: 直版小尺寸，功能未定
- `profile-card-vertical-lg`: 直版大尺寸，放在桌機版 Nav sheet 中

---

### feat/infinite-scroll

**難度**: ★★☆☆☆

**描述**: 實作首頁貼文的無限捲動功能

---

### feat/isr-hot-posts

**難度**: ★★★☆☆

**描述**: 使用 Next.js 16 ISR (Incremental Static Regeneration) 功能優化首頁熱門貼文列表，實現超快速載入和更好的效能表現

**已完成項目** ✅:

**前端任務**:

- ✅ 在 `app/page.tsx` 添加 `export const revalidate = 60` 設定 ISR 重新驗證間隔

**後端任務**:

- ✅ 在 `lib/services/posts.ts` 建立 `getHotPosts()` 函數，實作熱門貼文查詢邏輯
  - ✅ 熱度算法：綜合分數 = (likes × 2) + (comments × 1.5) + (views × 0.1) + 時間衰減因子
  - ✅ 時間範圍：優先顯示最近 48 小時內的貼文（可調整）
- ✅ 使用 `unstable_cache` 配合 cache tags (`'hot-posts'`) 和 `revalidate: 60` 選項
- ✅ 在 `app/api/posts/route.ts` (POST) 中，新增貼文時調用 `revalidateTag('hot-posts')`
- ✅ 在 `app/api/posts/[id]/like/route.ts` 中，點讚時調用 `revalidateTag('hot-posts')`
- ✅ 在 `app/api/comments/route.ts` 中，新增評論時調用 `revalidateTag('hot-posts')`
- ✅ 在 `app/api/posts/[id]/route.ts` (PATCH) 中，更新貼文時調用 `revalidateTag('hot-posts')`
- ✅ 在 `app/api/posts/[id]/route.ts` (DELETE) 中，刪除貼文時調用 `revalidateTag('hot-posts')`
- ✅ 建立 `app/api/revalidate/route.ts` API route，使用 secret token 保護，支援手動觸發 revalidation
  - ✅ 支援透過 `tag` 或 `path` 參數進行 revalidation
  - ✅ 需要設定 `REVALIDATE_SECRET` 環境變數

**待實作項目** 📋:

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

**難度**: ★★★☆☆

**描述**: 統一使用者資料類型系統，將原本 8 種不同的使用者資料格式合併為 3 個核心類型，解決類型不一致問題並確保所有查詢返回最詳細的使用者資料（包含完整統計資訊）

**已完成項目** ✅:

**類型系統重構** (`lib/types.ts`):

- ✅ 創建 `UserPublic` 類型：公開顯示用（id, userId, name, nickname, avatar）
- ✅ 創建 `UserPublicExtended` 類型：擴展版（包含 email）
- ✅ 創建 `UserStats` 介面：統一統計資料結構（posts, comments, likedPosts, likedComments）
- ✅ 創建 `UserWithStats` 類型：完整使用者資料 + 完整統計
- ✅ 更新 `PostWithUser` 使用 `UserPublicExtended`
- ✅ 更新 `CommentWithUser` 使用 `UserPublicExtended`
- ✅ 更新 `UserWithCounts` 為 `UserWithStats` 的別名（向後兼容）
- ✅ 更新 `UserProfilePage` 使用 `UserWithStats`
- ✅ 更新 `AdminPostListItem` 使用 `UserPublic`

**Prisma Select 常數統一** (`lib/validations.ts`):

- ✅ 創建 `userSelectPublic`：基本公開資料（id, userId, name, nickname, avatar）
- ✅ 創建 `userSelectPublicExtended`：公開資料 + email
- ✅ 創建 `userSelectFull`：完整使用者資料（所有欄位）
- ✅ 創建 `userSelectWithStats`：完整資料 + 統計（posts, comments, likedPosts, likedComments）
- ✅ 保留 `userSelectBasic` 作為 `userSelectPublic` 的別名（向後兼容）
- ✅ 更新 `postIncludeBasic` 使用 `userSelectPublicExtended`
- ✅ 更新 `commentIncludeBasic` 使用 `userSelectPublicExtended`

**服務層更新**:

- ✅ 更新 `lib/services/posts.ts`：所有查詢使用 `userSelectPublicExtended`，解決 `getHotPosts` 缺少 `email` 欄位的類型錯誤
- ✅ 更新 `lib/services/comments.ts`：所有查詢使用 `userSelectPublicExtended`
- ✅ 更新 `lib/services/users.ts`：
  - ✅ `getUserById` 使用 `userSelectFull`
  - ✅ `getUserWithCounts` 使用 `userSelectWithStats`
  - ✅ `getUserProfile` 使用 `userSelectFull`
  - ✅ `updateUserProfile` 使用 `userSelectFull`
  - ✅ `getUserProfilePage` 使用 `userSelectFull` + 完整統計
  - ✅ `getUserLikedPosts`、`getUserLikedComments`、`getUserComments` 內部的 user select 使用 `userSelectPublicExtended`

**API Routes 更新**:

- ✅ 更新 `app/api/posts/[id]/route.ts`：使用 `userSelectPublicExtended`
- ✅ 更新 `app/api/comments/[id]/replies/route.ts`：使用 `userSelectPublicExtended`
- ✅ 更新 `app/api/user/[userId]/route.ts`：
  - ✅ GET 使用 `userSelectWithStats`（包含完整統計）
  - ✅ PATCH 使用 `userSelectFull`
- ✅ 更新 `app/api/auth/me/route.ts`：使用 `userSelectFull`

**驗證與測試**:

- ✅ 執行 `pnpm run build` 驗證所有類型錯誤已解決
- ✅ 所有 TypeScript 編譯通過
- ✅ 原始錯誤（`getHotPosts` 缺少 `email` 欄位）已修復

**成果**:

- ✅ 從 8 種不同的使用者資料格式統一為 3 個核心類型
- ✅ 所有查詢現在返回最詳細的使用者資料，個人資料頁包含完整統計（posts, comments, likedPosts, likedComments）
- ✅ 類型安全：所有查詢都符合類型定義，消除類型錯誤
- ✅ 代碼簡潔：使用統一的 select 常數，減少重複代碼
- ✅ 向後兼容：保留 `userSelectBasic` 和 `UserWithCounts` 別名，不影響現有代碼

**注意事項**:

- 所有使用者資料查詢現在統一使用標準化的 select 常數
- `PostWithUser` 和 `CommentWithUser` 中的 `user` 現在包含 `email` 欄位（`UserPublicExtended`）
- 個人資料頁（`getUserProfilePage`）返回最詳細的使用者資料，包含完整統計資訊
- 類型系統現在更加嚴格和一致，有助於未來的維護和擴展

---

### feat/recommendation-algorithm

**難度**: ★★★★★

**描述**: 根據使用者的喜好和習慣預測推文內容的推薦演算法

**注意事項**:

- 可能需要更改資料庫結構 (Prisma Schema)
- 盡量減少資料庫操作
- 需配合無限捲動功能

---

### feat/search

**描述**: 搜尋功能開發

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

**描述**: 積分系統開發

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

**描述**: 預測賽事結果功能

**功能**:

- 讓使用者可以投入積分進行預測

**前端任務**:

- 建立賽事頁面
- 首頁新增賽事區塊

**後端任務**:

- 計算積分賠率
- 根據賽事結果分配積分獎勵

---

### feat/rating-system

**描述**: 評分系統開發，參考虎撲設計

**功能範圍**:

- 分成賽事與選手兩種評分對象
- 選手評分系統可考慮與使用者積分連動

**前端任務**:

- 建立評分頁面

**後端任務**:

- 更新資料庫結構
- 建立評分 API 與 Service

---

### feat/subscription

**描述**: 訂閱/追蹤功能開發

**前端任務**:

- 在 Mypage 和 Profile-card 顯示追蹤人數

**後端任務**:

- 更新資料庫結構

---

### feat/notifications

**描述**: 通知系統開發

---

### feat/i18n

**描述**: 多語言支援功能

**支援語言**:

- 英文 (en)
- 日文 (ja)
- 簡體中文 (zh-CN)
- 繁體中文 (zh-TW)

---

### feat/auth-google

**描述**: Google 帳號登入功能開發
