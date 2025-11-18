# 開發日誌 / Development Log

## 2025-11-18

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
