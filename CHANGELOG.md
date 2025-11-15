# 開發日誌 / Development Log

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
