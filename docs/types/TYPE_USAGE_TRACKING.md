# 類型使用追蹤文檔 / Type Usage Tracking Documentation

本文檔追蹤各個 TypeScript 類型在各個文件中的使用情況，方便未來更改資料庫格式時快速定位需要更新的文件。

## 使用說明 / Usage Instructions

本文檔按類型分組，列出每個類型在所有文件中的使用位置。當需要更改某個類型時，可以快速找到所有需要更新的文件。

---

## Event 相關類型

### Event

**定義位置**: `lib/types.ts`

**使用位置**:

#### API 路由

- `app/api/events/route.ts` - GET/POST 端點
- `app/api/events/[id]/route.ts` - GET/PUT 端點
- `app/api/events/sync/route.ts` - 同步端點
- `app/api/admin/events/sync/route.ts` - 管理員同步端點
- `app/api/admin/events/settlable/route.ts` - 可結算事件列表

#### 服務層

- `lib/services/events.ts` - Event 服務層（多處使用：
  - `createEventWithFights()` - 創建事件
  - `getEventWithFights()` - 獲取事件詳情
  - `syncEventsFromExternalAPI()` - 同步外部 API
  - `mergeEventData()` - 合併事件資料
  - `findMatchingEvent()` - 查找匹配事件

#### 工具函數

- `lib/utils/event-matcher.ts` - 事件匹配工具
  - `findMatchingEvent()` - 返回 `EventMatchResult`（包含 `Event`）

#### 前端組件

- `components/admin/event-create-form.tsx` - 創建賽事表單
- `components/admin/event-result-form.tsx` - 賽事結果表單
- `components/admin/rollback-panel.tsx` - 回滾面板
- `app/events/[id]/page.tsx` - 賽事詳情頁面

#### 類型引用

- `EventMatchResult.event` - 事件匹配結果
- `FightWithDetails.event` - 對戰詳情中的事件

**重要變更** (2025-01-21):

- ❌ 移除: `winner_id`, `is_manual_override`
- ✅ 新增: `promoter`, `organization`, `venue`, `location`, `description`, `poster_url`

**影響文件**: 所有使用 `Event` 類型的文件都需要檢查並更新

---

### ExternalEventSource

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/services/events.ts` - Event 服務層
- `app/api/events/sync/route.ts` - 同步端點
- `app/api/admin/events/sync/route.ts` - 管理員同步端點
- `lib/adapters/thesportsdb.ts` - TheSportsDB 適配器

---

### SportType

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/services/events.ts` - Event 服務層
- `lib/services/fighters.ts` - Fighter 服務層
- `components/admin/event-create-form.tsx` - 創建賽事表單
- `components/admin/fighter-create-form.tsx` - 創建選手表單
- `components/admin/fighter-select.tsx` - 選手選擇組件

---

### UnifiedEventData

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/services/events.ts` - Event 服務層（同步功能）
- `lib/adapters/thesportsdb.ts` - TheSportsDB 適配器

---

### EventMatchResult

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/utils/event-matcher.ts` - 事件匹配工具
- `lib/services/events.ts` - Event 服務層（智能合併）

---

### MergeEventOptions

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/services/events.ts` - Event 服務層（智能合併）

---

## Fighter 相關類型

### Fighter

**定義位置**: `lib/types.ts`

**使用位置**:

#### API 路由

- `app/api/fighters/route.ts` - GET/POST 端點
- `app/api/fighters/[slug]/route.ts` - GET 端點（如果存在）

#### 服務層

- `lib/services/fighters.ts` - Fighter 服務層
  多處使用：
  - `getOrCreateFighterByName()` - 獲取或創建選手
  - `getFighterBySlug()` - 根據 slug 獲取選手
  - `getFights()` - 獲取選手對戰歷史（包含作為 fighter 和 opponent 的所有對戰）

#### 前端組件

- `components/admin/fighter-create-form.tsx` - 創建選手表單
- `components/admin/fighter-select.tsx` - 選手選擇組件
- `app/fighters/[slug]/page.tsx` - 選手詳情頁面

#### 類型引用

- `FightWithDetails.opponent` - 對戰詳情中的對手
- `FighterWithEvents` - 選手包含對戰歷史

**對應資料庫表**: `Fighter`

---

### FighterPublic

**定義位置**: `lib/types.ts`

**使用位置**:

- `components/admin/fighter-select.tsx` - 選手選擇組件
- `app/fighters/[slug]/page.tsx` - 選手詳情頁面

---

### FighterWithEvents

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/services/fighters.ts` - Fighter 服務層
- `app/fighters/[slug]/page.tsx` - 選手詳情頁面

---

### FightWithDetails

**定義位置**: `lib/types.ts`（使用 Prisma 生成的 `FightWithRelations` 類型）

**使用位置**:

- `lib/services/fighters.ts` - `getFights()` 函數返回此類型
- `lib/services/fights.ts` - 對戰服務層
- `app/fighter/[slug]/page.tsx` - 選手詳情頁面

**對應資料庫表**: `Fight`（原 `FighterEvent` 表已更名為 `Fight`）

---

## Betting 相關類型

### BettingLog

**定義位置**: `lib/types.ts`

**使用位置**:

#### 服務層

- `lib/services/betting.ts` - Betting 服務層
  - `placeBet()` - 創建投注記錄
  - `rollbackBet()` - 回滾投注
  - `rollbackEvent()` - 回滾賽事所有投注

#### 前端組件

- `components/profile/betting-history-list.tsx` - 投注歷史列表
- `components/admin/rollback-panel.tsx` - 回滾面板
- `components/comments/comment-item.tsx` - 評論項目（顯示投注）

**對應資料庫表**: `BettingLog`

---

### BettingOdds

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/betting-system.ts` - 投注系統
  - `calculateFightOdds()` - 計算對戰賠率
- `lib/services/betting.ts` - Betting 服務層
  - `getFightOdds()` - 獲取對戰賠率
- `components/betting/FightBettingCard.tsx` - 對戰投注卡片

---

### SettleEventInput

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/betting-system.ts` - 投注系統
  - `settleFight()` - 結算對戰
- `app/api/admin/fights/[id]/result/route.ts` - 結算對戰 API

---

### UserBettingStats

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/services/betting.ts` - Betting 服務層
  - `getUserBettingStats()` - 獲取用戶投注統計
- `components/profile/betting-stats-card.tsx` - 投注統計卡片

---

## User 相關類型

### User

**定義位置**: `lib/types.ts`

**使用位置**:

#### 認證和服務層

- `lib/auth.ts` - 認證服務
  - `getCurrentUser()` - 返回 `User` 類型
- `lib/services/users.ts` - User 服務層

#### API 路由

- `app/api/auth/me/route.ts` - 獲取當前用戶
- `app/api/admin/users/*` - 管理員用戶 API

#### 前端組件

- `components/auth/*` - 認證相關組件

**對應資料庫表**: `User`

---

### UserPublic

**定義位置**: `lib/types.ts`

**使用位置**:

- `components/posts/post-card-header.tsx` - 貼文卡片標題
- `components/posts/post-content.tsx` - 貼文內容
- `components/comments/comment-item.tsx` - 評論項目
- `components/admin/post-management.tsx` - 貼文管理

**重要**: 最常用的公開用戶資訊類型

---

### UserPublicExtended

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/services/posts.ts` - Post 服務層
- `components/posts/post-card.tsx` - 貼文卡片
- `PostWithUser.user` - 貼文包含用戶資訊

---

### UserWithProfile

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/services/users.ts` - User 服務層
- `lib/services/profiles.ts` - Profile 服務層

---

### UserStats

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/services/users.ts` - User 服務層
- `UserWithStats._count` - 用戶統計資料

---

## Profile 相關類型

### Profile

**定義位置**: `lib/types.ts`

**使用位置**:

#### 服務層

- `lib/services/profiles.ts` - Profile 服務層
  多處使用：
  - `getProfileByUserId()` - 獲取用戶資料
  - `createProfile()` - 創建資料
  - `updateProfile()` - 更新資料

#### API 路由

- `app/api/profile/[userId]/route.ts` - GET/PATCH 端點
- `app/api/profile/[userId]/visibility/route.ts` - 更新隱私設定

#### 前端組件

- `components/profile/*` - 所有 Profile 相關組件

**對應資料庫表**: `Profile`

---

### ProfilePublic

**定義位置**: `lib/types.ts`

**使用位置**:

- `components/profile/profile-hovercard.tsx` - 懸停卡片組件
- `components/posts/post-profile-hovercard.tsx` - 貼文中的 Profile 懸停卡片

---

### ProfileVisibilitySettings

**定義位置**: `lib/types.ts`

**使用位置**:

- `components/profile/profile-visibility-settings.tsx` - 隱私設定組件
- `lib/services/profiles.ts` - Profile 服務層
- `app/api/profile/[userId]/visibility/route.ts` - 更新隱私設定 API

---

## Post 相關類型

### Post

**定義位置**: `lib/types.ts`

**使用位置**:

#### 服務層

- `lib/services/posts.ts` - Post 服務層
  多處使用：
  - `getPosts()` - 獲取貼文列表
  - `getPostById()` - 獲取貼文詳情
  - `createPost()` - 創建貼文

#### API 路由

- `app/api/posts/route.ts` - GET/POST 端點
- `app/api/posts/[id]/route.ts` - GET/PATCH/DELETE 端點

#### 前端組件

- `components/posts/*` - 所有 Post 相關組件

**對應資料庫表**: `Post`

---

### PostWithUser

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/services/posts.ts` - Post 服務層
- `components/posts/post-card.tsx` - 貼文卡片

**重要**: 最常用的貼文顯示類型

---

### PostWithDetails

**定義位置**: `lib/types.ts`

**使用位置**:

- `app/posts/[id]/page.tsx` - 貼文詳情頁面

---

## Comment 相關類型

### Comment

**定義位置**: `lib/types.ts`

**使用位置**:

#### 服務層

- `lib/services/comments.ts` - Comment 服務層
  多處使用：
  - `getCommentsByPostId()` - 獲取貼文評論
  - `createComment()` - 創建評論

#### API 路由

- `app/api/comments/route.ts` - GET/POST 端點
- `app/api/comments/[id]/route.ts` - PATCH/DELETE 端點

#### 前端組件

- `components/comments/*` - 所有 Comment 相關組件

**對應資料庫表**: `Comment`

---

### CommentWithUser

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/services/comments.ts` - Comment 服務層
- `components/comments/comment-item.tsx` - 評論項目
- `PostWithDetails.comments` - 貼文詳情中的評論

---

## Category 相關類型

### Category

**定義位置**: `lib/types.ts`

**使用位置**:

#### 服務層

- `lib/services/categories.ts` - Category 服務層

#### API 路由

- `app/api/categories/route.ts` - GET/POST 端點
- `app/api/categories/[id]/route.ts` - GET/PATCH/DELETE 端點

#### 前端組件

- `components/posts/post-form.tsx` - 貼文表單
- `PostWithUser.category` - 貼文包含分類

**對應資料庫表**: `Category`

---

## API 相關類型

### ApiResponse

**定義位置**: `lib/types.ts`

**使用位置**:

- 多個 API 路由文件（通用響應格式）

---

### ApiErrorResponse

**定義位置**: `lib/types.ts`

**使用位置**:

- 多個 API 路由文件（錯誤處理）

---

### PaginationResponse

**定義位置**: `lib/types.ts`

**使用位置**:

- `lib/services/posts.ts` - Post 服務層（未來擴充）

---

## Admin 相關類型

### AdminUserListItem

**定義位置**: `lib/types.ts`

**使用位置**:

- `components/admin/user-management.tsx` - 用戶管理組件
- `app/api/admin/users/route.ts` - 管理員用戶 API

---

### AdminPostListItem

**定義位置**: `lib/types.ts`

**使用位置**:

- `components/admin/post-management.tsx` - 貼文管理組件
- `app/api/admin/posts/route.ts` - 管理員貼文 API

---

## 類型變更影響分析 / Type Change Impact Analysis

### Event 類型變更 (2025-01-21)

**變更內容**:

- ❌ 移除: `winner_id`, `is_manual_override`
- ✅ 新增: `promoter`, `organization`, `venue`, `location`, `description`, `poster_url`

**影響文件清單**:

1. **類型定義**

   - ✅ `lib/types.ts` - 已更新

2. **服務層**

   - ✅ `lib/services/events.ts` - 已更新（批量驗證、錯誤處理）

3. **API 路由**

   - ✅ `app/api/events/route.ts` - 已更新（錯誤處理）
   - ✅ `app/api/admin/events/settlable/route.ts` - 已更新（查詢語法）
   - ⚠️ `app/api/events/[id]/route.ts` - 需要檢查（可能仍使用舊字段）

4. **前端組件**

   - ✅ `components/admin/event-create-form.tsx` - 已更新（錯誤處理）
   - ✅ `components/admin/event-result-form.tsx` - 已更新（使用新結構）
   - ⚠️ `components/admin/rollback-panel.tsx` - 需要檢查

5. **頁面**
   - ⚠️ `app/events/[id]/page.tsx` - 需要檢查

**建議檢查項目**:

- [ ] 檢查所有使用 `Event` 類型的文件
- [ ] 確保沒有引用已移除的字段
- [ ] 確保新字段正確使用
- [ ] 更新相關的 Zod schema

---

## 快速查找指南 / Quick Reference Guide

### 查找類型定義

1. 在 `lib/types.ts` 中查找類型定義
2. 在 `docs/types/TYPESCRIPT_TYPES.md` 中查看詳細說明

### 查找類型使用位置

1. 在本文檔中查找類型名稱
2. 查看「使用位置」章節
3. 使用 grep 搜尋確認

### 更改類型時的檢查清單

1. [ ] 更新 `lib/types.ts`
2. [ ] 更新 `docs/types/TYPESCRIPT_TYPES.md`
3. [ ] 更新本文檔
4. [ ] 檢查所有「使用位置」中的文件
5. [ ] 更新相關的 Zod schema
6. [ ] 執行測試

---

## 維護說明 / Maintenance Notes

本文檔應在以下情況更新：

1. 添加新類型時
2. 更改現有類型時
3. 發現新的使用位置時
4. 移除類型時

**更新頻率**: 每次類型變更時

**維護者**: 開發團隊

---

## 最後更新 / Last Updated

- **2025-01-21**: 創建初始文檔，記錄 Event 類型變更影響分析
