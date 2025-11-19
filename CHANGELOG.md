# 開發日誌 / Development Log

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
