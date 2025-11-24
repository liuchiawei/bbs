# TypeScript 類型定義文檔 / TypeScript Types Documentation

本文檔記錄 `lib/types.ts` 中定義的所有 TypeScript 類型，以及它們在各個文件中的使用情況。

## 目錄 / Table of Contents

- [Profile 相關類型](#profile-相關類型)
- [User 相關類型](#user-相關類型)
- [Category 類型](#category-類型)
- [Post 相關類型](#post-相關類型)
- [Comment 相關類型](#comment-相關類型)
- [Event 相關類型](#event-相關類型)
- [Fighter 相關類型](#fighter-相關類型)
- [Betting 相關類型](#betting-相關類型)
- [API 相關類型](#api-相關類型)
- [Admin 相關類型](#admin-相關類型)

---

## Profile 相關類型

### ProfileVisibility

**定義**:

```typescript
export type ProfileVisibility = "public" | "friends" | "private";
```

**用途**: 定義個人資料字段的隱私級別

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/profile/profile-visibility-settings.tsx` - 隱私設定組件
- `lib/services/profiles.ts` - Profile 服務層

---

### ProfileVisibilitySettings

**定義**:

```typescript
export interface ProfileVisibilitySettings {
  name?: ProfileVisibility;
  nickname?: ProfileVisibility;
  gender?: ProfileVisibility;
  birthDate?: ProfileVisibility;
  avatar?: ProfileVisibility;
  height?: ProfileVisibility;
  weight?: ProfileVisibility;
  description?: ProfileVisibility;
  record?: ProfileVisibility;
  train_start?: ProfileVisibility;
  stance?: ProfileVisibility;
  gym?: ProfileVisibility;
}
```

**用途**: 定義所有個人資料字段的隱私設定

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/profile/profile-visibility-settings.tsx` - 隱私設定組件
- `lib/services/profiles.ts` - Profile 服務層
- `app/api/profile/[userId]/visibility/route.ts` - API 路由

---

### Profile

**定義**:

```typescript
export interface Profile {
  id: string;
  userId: string;
  name: string;
  nickname?: string | null;
  gender?: string | null;
  birthDate?: Date | string | null;
  avatar?: string | null;
  height?: number | null;
  weight?: number | null;
  description?: string | null;
  record?: string | null;
  train_start?: number | null;
  stance?: string | null;
  gym?: string | null;
  visibility: ProfileVisibilitySettings;
  deletedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

**用途**: 完整的個人資料類型定義

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/profiles.ts` - Profile 服務層
- `components/profile/*` - 所有 Profile 相關組件
- `app/api/profile/*` - Profile API 路由

**對應資料庫表**: `Profile`

---

### ProfilePublic

**定義**:

```typescript
export interface ProfilePublic {
  id: string;
  userId: string;
  name: string;
  nickname?: string | null;
  avatar?: string | null;
}
```

**用途**: 公開顯示用的簡化個人資料類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/profile/profile-hovercard.tsx` - 懸停卡片組件
- `components/posts/post-profile-hovercard.tsx` - 貼文中的 Profile 懸停卡片

---

### CreateProfileInput

**定義**:

```typescript
export interface CreateProfileInput {
  userId: string;
  name: string;
  nickname?: string;
  gender?: string;
  birthDate?: string;
  avatar?: string;
  height?: number;
  weight?: number;
  description?: string;
  record?: string;
  train_start?: number;
  stance?: string;
  gym?: string;
  visibility?: ProfileVisibilitySettings;
}
```

**用途**: 創建 Profile 時的輸入類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/profiles.ts` - Profile 服務層
- `app/api/profile/route.ts` - 創建 Profile API

---

### UpdateProfileInput

**定義**:

```typescript
export interface UpdateProfileInput {
  name?: string;
  nickname?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  avatar?: string | null;
  height?: number | null;
  weight?: number | null;
  description?: string | null;
  record?: string | null;
  train_start?: number | null;
  stance?: string | null;
  gym?: string | null;
  visibility?: ProfileVisibilitySettings;
}
```

**用途**: 更新 Profile 時的輸入類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/profiles.ts` - Profile 服務層
- `app/api/profile/[userId]/route.ts` - 更新 Profile API
- `components/profile/edit-profile-form.tsx` - 編輯表單組件

---

### UpdateVisibilityInput

**定義**:

```typescript
export interface UpdateVisibilityInput {
  visibility: ProfileVisibilitySettings;
}
```

**用途**: 更新隱私設定時的輸入類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `app/api/profile/[userId]/visibility/route.ts` - 更新隱私設定 API

---

## User 相關類型

### User

**定義**:

```typescript
export interface User {
  id: string;
  userId: string;
  email: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  points?: number;
  virtual_score?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  profile?: Profile | null;
}
```

**用途**: 用戶基本資訊類型（包含可選的 Profile）

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/auth.ts` - 認證服務
- `lib/services/users.ts` - User 服務層
- `components/auth/*` - 認證相關組件

**對應資料庫表**: `User`

---

### UserWithProfile

**定義**:

```typescript
export interface UserWithProfile extends User {
  profile: Profile;
}
```

**用途**: 用戶資訊包含必填 Profile 的類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/users.ts` - User 服務層
- `lib/services/profiles.ts` - Profile 服務層

---

### UserPublic

**定義**:

```typescript
export interface UserPublic {
  id: string;
  userId: string;
  name: string; // 從profile.name讀取
  nickname: string | null; // 從profile.nickname讀取（null 表示未設定）
  avatar: string | null; // 從profile.avatar讀取（null 表示未設定）
}
```

**用途**: 公開顯示用的用戶資訊類型（從 Profile 讀取顯示資料）

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/posts/post-card-header.tsx` - 貼文卡片標題
- `components/posts/post-content.tsx` - 貼文內容
- `components/comments/comment-item.tsx` - 評論項目

**重要**: `nickname` 和 `avatar` 嚴格為 `string | null`（不允許 `undefined`）

---

### UserPublicExtended

**定義**:

```typescript
export type UserPublicExtended = PrismaToApp<
  Prisma.UserGetPayload<{
    select: typeof userSelectPublicExtended;
  }>
>;
```

**實際結構**:

```typescript
{
  id: string;
  userId: string;
  email: string;
  profile: {
    id: string;
    userId: string;
    name: string;
    nickname: string | null;
    avatar: string | null;
  } | null;
}
```

**用途**: 擴展的公開用戶資訊（包含 email 和 profile）

**使用位置**:

- `lib/types.ts` - 類型定義（從 Prisma 生成）
- `lib/utils.ts` - `transformUser` 函數用於轉換嵌套的 profile 結構
- `lib/services/posts.ts` - Post 服務層
- `lib/services/comments.ts` - Comment 服務層
- `components/posts/post-card.tsx` - 貼文卡片

**重要變更** (2025-01-23):

- ✅ 修正: `transformUser` 函數確保 `profile` 屬性始終存在（即使為 `null`），符合類型定義
- ✅ 更新: 函數參數類型包含完整的 `profile` 結構（包括 `id` 和 `userId`）

---

### UserStats

**定義**:

```typescript
export interface UserStats {
  posts: number;
  comments: number;
  likedPosts: number;
  likedComments: number;
  followers: number;
  following: number;
}
```

**用途**: 用戶統計資料類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/users.ts` - User 服務層

---

### UserWithStats

**定義**:

```typescript
export interface UserWithStats extends User {
  _count: UserStats;
}
```

**用途**: 用戶資訊包含統計資料的類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/users.ts` - User 服務層

---

### UserWithCounts

**定義**:

```typescript
export interface UserWithCounts extends User {
  _count?: {
    posts: number;
    comments: number;
    likedPosts?: number;
    likedComments?: number;
    followers?: number;
    following?: number;
  };
}
```

**用途**: 用戶資訊包含基本統計（用於向後兼容）

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/users.ts` - User 服務層（向後兼容）

---

### UserProfilePage

**定義**:

```typescript
export interface UserProfilePage extends UserWithProfile {
  posts: Post[];
  _count: UserStats;
}
```

**用途**: 用戶個人資料頁類型（包含最近貼文和完整統計）

**使用位置**:

- `lib/types.ts` - 類型定義
- `app/profile/[userId]/page.tsx` - 個人資料頁面

---

### UserWithProfileAndStats

**定義**:

```typescript
export interface UserWithProfileAndStats extends UserWithProfile {
  _count: UserStats;
}
```

**用途**: 用戶資訊包含 Profile 和統計資料的類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/users.ts` - User 服務層

---

## Category 類型

### Category

**定義**:

```typescript
export interface Category {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  displayOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}
```

**用途**: 分類類型定義

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/categories.ts` - Category 服務層
- `components/posts/post-form.tsx` - 貼文表單
- `app/api/categories/*` - Category API 路由

**對應資料庫表**: `Category`

---

## Post 相關類型

### Post

**定義**:

```typescript
export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  tags: string[];
  categoryId?: string | null;
  eventId?: string | null;
  views: number;
  likes: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}
```

**用途**: 貼文基本類型定義

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/posts.ts` - Post 服務層
- `components/posts/*` - 所有 Post 相關組件

**對應資料庫表**: `Post`

---

### PostWithUser

**定義**:

```typescript
export interface PostWithUser extends Post {
  user: UserPublicExtended;
  category?: Category | null;
  _count: {
    comments: number;
  };
}
```

**用途**: 貼文包含用戶資訊的類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/posts.ts` - Post 服務層
- `components/posts/post-card.tsx` - 貼文卡片

---

### PostWithDetails

**定義**:

```typescript
export interface PostWithDetails extends PostWithUser {
  comments: CommentWithUser[];
}
```

**用途**: 貼文包含詳細資訊（含評論）的類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `app/posts/[id]/page.tsx` - 貼文詳情頁面

---

### CreatePostInput

**定義**:

```typescript
export interface CreatePostInput {
  title: string;
  content: string;
  tags?: string[];
  categoryId?: string | null;
}
```

**用途**: 創建貼文時的輸入類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/posts/post-form.tsx` - 貼文表單
- `app/api/posts/route.ts` - 創建貼文 API

---

### UpdatePostInput

**定義**:

```typescript
export interface UpdatePostInput {
  title?: string;
  content?: string;
  tags?: string[];
  categoryId?: string | null;
}
```

**用途**: 更新貼文時的輸入類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/posts/post-edit-form.tsx` - 編輯貼文表單
- `app/api/posts/[id]/route.ts` - 更新貼文 API

---

## Comment 相關類型

### Comment

**定義**:

```typescript
export interface Comment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  parentId?: string | null;
  likes: number;
  replies: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}
```

**用途**: 評論基本類型定義

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/comments.ts` - Comment 服務層
- `components/comments/*` - 所有 Comment 相關組件

**對應資料庫表**: `Comment`

---

### CommentWithUser

**定義**:

```typescript
export interface CommentWithUser extends Comment {
  user: UserPublicExtended;
}
```

**用途**: 評論包含用戶資訊的類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/comments.ts` - Comment 服務層
- `components/comments/comment-item.tsx` - 評論項目

---

### CommentWithUserAndPost

**定義**:

```typescript
export interface CommentWithUserAndPost extends CommentWithUser {
  post: {
    id: string;
    title: string;
  };
}
```

**用途**: 評論包含用戶和貼文資訊的類型（用於點讚評論頁面）

**使用位置**:

- `lib/types.ts` - 類型定義
- `app/profile/[userId]/liked-comments/page.tsx` - 點讚評論頁面

---

### CreateCommentInput

**定義**:

```typescript
export interface CreateCommentInput {
  content: string;
  postId: string;
  parentId?: string;
}
```

**用途**: 創建評論時的輸入類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/comments/comment-form.tsx` - 評論表單
- `app/api/comments/route.ts` - 創建評論 API

---

## Event 相關類型

### Event

**定義**:

```typescript
export interface Event {
  id: string;
  name: string;
  fight_date: Date | string;
  status: "PENDING" | "OPEN" | "CLOSED" | "SETTLED" | "CANCELLED";
  sport_type?: SportType | null;
  promoter?: string | null;
  organization?: string | null;
  venue?: string | null;
  location?: string | null;
  description?: string | null;
  poster_url?: string | null;
  external_id?: string | null;
  external_source?: ExternalEventSource | null;
  external_data?: Record<string, unknown> | null;
  last_synced_at?: Date | string | null;
  sync_status?: SyncStatus | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

**用途**: 賽事類型定義

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/events.ts` - Event 服務層
- `app/api/events/*` - Event API 路由
- `components/admin/event-create-form.tsx` - 創建賽事表單
- `app/events/[id]/page.tsx` - 賽事詳情頁面

**對應資料庫表**: `Event`

**重要變更** (2025-01-21):

- ❌ 移除: `winner_id`, `is_manual_override`
- ✅ 新增: `promoter`, `organization`, `venue`, `location`, `description`, `poster_url`

---

### ExternalEventSource

**定義**:

```typescript
export type ExternalEventSource = "thesportsdb" | "espn" | "ufc" | "other";
```

**用途**: 外部事件來源類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/events.ts` - Event 服務層
- `app/api/events/sync/route.ts` - 同步 API
- `app/api/admin/events/sync/route.ts` - 管理員同步 API

---

### SportType

**定義**:

```typescript
export type SportType = "boxing" | "ufc" | "mma" | "other";
```

**用途**: 運動類型定義

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/events.ts` - Event 服務層
- `lib/services/fighters.ts` - Fighter 服務層
- `components/admin/event-create-form.tsx` - 創建賽事表單
- `components/admin/fighter-create-form.tsx` - 創建選手表單

---

### UnifiedEventData

**定義**:

```typescript
export interface UnifiedEventData {
  external_id: string;
  name: string;
  fight_date: Date;
  sport_type: SportType;
  external_data: Record<string, unknown>;
  home_team?: string;
  away_team?: string;
  venue?: string;
  league?: string;
  country?: string;
  city?: string;
  status?: string;
}
```

**用途**: 統一的外部 API 事件資料格式

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/events.ts` - Event 服務層（同步功能）
- `lib/adapters/thesportsdb.ts` - TheSportsDB 適配器

---

### SyncStatus

**定義**:

```typescript
export type SyncStatus = "pending" | "syncing" | "completed" | "failed";
```

**用途**: 同步狀態類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/events.ts` - Event 服務層

---

### EventMatchResult

**定義**:

```typescript
export interface EventMatchResult {
  event: Event;
  similarityScore: number;
  matchType: "exact" | "fuzzy";
}
```

**用途**: 事件匹配結果（用於模糊匹配）

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/utils/event-matcher.ts` - 事件匹配工具
- `lib/services/events.ts` - Event 服務層（智能合併）

---

### MergeEventOptions

**定義**:

```typescript
export interface MergeEventOptions {
  preserveManualFields?: boolean;
  forceUpdateExternalFields?: boolean;
  minSimilarity?: number;
}
```

**用途**: 合併事件選項配置

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/events.ts` - Event 服務層（智能合併）

---

## Fighter 相關類型

### Fighter

**定義**:

```typescript
export interface Fighter {
  id: string;
  slug: string;
  name: string;
  external_id?: string | null;
  external_source?: string | null;
  external_data?: Record<string, unknown> | null;
  sport_type?: SportType | null;
  nationality?: string | null;
  date_born?: Date | string | null;
  height?: string | null;
  weight?: string | null;
  position?: string | null;
  description?: string | null;
  thumb?: string | null;
  cutout?: string | null;
  gender: "MALE" | "FEMALE" | "OTHER"; // 性別 / Gender
  titles: string[]; // 頭銜列表 / Titles list
  last_synced_at?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

**用途**: 選手完整類型定義

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/fighters.ts` - Fighter 服務層
- `app/api/fighters/*` - Fighter API 路由
- `components/admin/fighter-create-form.tsx` - 創建選手表單

**對應資料庫表**: `Fighter`

---

### FighterPublic

**定義**:

```typescript
export interface FighterPublic {
  id: string;
  name: string;
  slug: string;
  nationality?: string | null;
  date_born?: Date | string | null;
  height?: string | null;
  weight?: string | null;
  position?: string | null;
  description?: string | null;
  thumb?: string | null;
  cutout?: string | null;
  sport_type?: SportType | null;
  external_data?: Record<string, unknown> | null;
  gender: "MALE" | "FEMALE" | "OTHER"; // 性別 / Gender
  titles: string[]; // 頭銜列表 / Titles list
}
```

**用途**: 用於公開顯示的選手類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/admin/fighter-select.tsx` - 選手選擇組件
- `app/fighters/[slug]/page.tsx` - 選手詳情頁面

---

### FighterWithEvents

**定義**:

```typescript
export type FighterWithEvents = PrismaToApp<
  Prisma.FighterGetPayload<{
    select: typeof fighterSelectWithEvents;
  }>
>;
```

**實際結構**:

```typescript
{
  // Fighter 基本欄位
  id: string;
  slug: string;
  name: string;
  external_id: string | null;
  external_source: string | null;
  external_data: Record<string, unknown> | null;
  sport_type: string | null;
  nationality: string | null;
  date_born: Date | string | null;
  height: string | null;
  weight: string | null;
  position: string | null;
  description: string | null;
  thumb: string | null;
  cutout: string | null;
  last_synced_at: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  // 對戰歷史
  fightsAsFighter: Array<{
    id: string;
    fighter_id: string;
    event_id: string;
    opponent_id: string | null;
    result: string | null;
    method: string | null;
    round: number | null;
    time: string | null;
    weight_class: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    event: EventPublic;
    fighter: FighterPublic | null; // 當前選手資訊
    opponent: FighterPublic | null; // 對手資訊
  }>;
  fightsAsOpponent: Array<{...}>; // 結構與 fightsAsFighter 相同
}
```

**用途**: 選手包含完整對戰歷史的類型（包含雙向對戰記錄）

**使用位置**:

- `lib/types.ts` - 類型定義（從 Prisma 生成）
- `lib/utils/fighter.ts` - `toFighterWithEvents` 函數用於轉換 Prisma 結果
- `lib/services/fighters.ts` - Fighter 服務層
- `app/fighter/[slug]/page.tsx` - 選手詳情頁面

**重要變更** (2025-01-23):

- ✅ 修正: `toFighterWithEvents` 函數確保 `fightsAsFighter` 中的每個 fight 都包含 `fighter` 和 `opponent` 屬性
- ✅ 修正: 返回對象包含 `fightsAsOpponent` 屬性（即使為空數組）
- ✅ 修正: `external_data` 類型轉換使用類型斷言確保類型匹配

---

### FightWithDetails

**定義**:

```typescript
export type FightWithDetails = PrismaFightWithRelations;
```

**用途**: 對戰包含賽事和對手詳情的類型（對應資料庫中的 `Fight` 表）

**實際結構**:

- 包含 `Fight` 表的所有基本欄位
- `event`: EventPublic - 關聯的賽事
- `fighter`: FighterPublic（基本欄位） - 對戰選手
- `opponent`: FighterPublic（基本欄位） | null - 對手
- `_count`: { bets: number } - 投注數量統計

**使用位置**:

- `lib/types.ts` - 類型定義（使用 Prisma 生成的類型）
- `lib/services/fighters.ts` - `getFights()` 函數返回此類型
- `lib/services/fights.ts` - 對戰服務層
- `app/fighter/[slug]/page.tsx` - 選手詳情頁面

**對應資料庫表**: `Fight`（原 `FighterEvent` 表已更名為 `Fight`）

---

## Betting 相關類型

### BettingLog

**定義**:

```typescript
export interface BettingLog {
  id: string;
  userId: string;
  eventId: string;
  bet_amount: number | string;
  target_winner_id: string;
  odds_snapshot: number | string;
  settlement_status: "PENDING" | "WON" | "LOST" | "VOID";
  createdAt: Date | string;
}
```

**用途**: 投注記錄類型定義

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/betting.ts` - Betting 服務層
- `components/profile/betting-history-list.tsx` - 投注歷史列表
- `components/admin/rollback-panel.tsx` - 回滾面板

**對應資料庫表**: `BettingLog`

**注意**: `bet_amount` 和 `odds_snapshot` 支援 `number | string` 以處理 Decimal 類型

---

### BettingOdds

**定義**:

```typescript
export interface BettingOdds {
  totalPool: number;
  netPool: number;
  odds: Record<string, number>;
  betsByOutcome: Record<string, number>;
}
```

**用途**: 投注賠率介面

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/betting-system.ts` - 投注系統
- `lib/services/betting.ts` - Betting 服務層
- `components/betting/FightBettingCard.tsx` - 對戰投注卡片

---

### SettleEventInput

**定義**:

```typescript
export interface SettleEventInput {
  winnerId: string;
  winMethod?: string;
  winRound?: number;
}
```

**用途**: 結算賽事輸入介面

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/betting-system.ts` - 投注系統
- `app/api/admin/fights/[id]/result/route.ts` - 結算對戰 API

---

### UserBettingStats

**定義**:

```typescript
export interface UserBettingStats {
  totalBets: number;
  wins: number;
  losses: number;
  pending: number;
  voided: number;
  totalWagered: number;
  totalPayout: number;
  netProfit: number;
  roi: number; // Return on Investment %
  winRate: number; // Win %
}
```

**用途**: 用戶投注統計資料

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/betting.ts` - Betting 服務層
- `components/profile/betting-stats-card.tsx` - 投注統計卡片

---

## API 相關類型

### ApiResponse

**定義**:

```typescript
export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
}
```

**用途**: 通用 API 響應類型

**使用位置**:

- `lib/types.ts` - 類型定義
- 多個 API 路由文件（通用響應格式）

---

### ApiErrorResponse

**定義**:

```typescript
export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}
```

**用途**: API 錯誤響應類型

**使用位置**:

- `lib/types.ts` - 類型定義
- 多個 API 路由文件（錯誤處理）

---

### PaginationResponse

**定義**:

```typescript
export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**用途**: 分頁響應類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/services/posts.ts` - Post 服務層（未來擴充）

---

### SessionPayload

**定義**:

```typescript
export interface SessionPayload {
  userId: string;
  email: string;
}
```

**用途**: Session payload 類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `lib/auth.ts` - 認證服務

---

### RegisterInput

**定義**:

```typescript
export interface RegisterInput {
  userId: string;
  email: string;
  password: string;
}
```

**用途**: 註冊輸入類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/auth/register-form.tsx` - 註冊表單
- `app/api/auth/register/route.ts` - 註冊 API

---

### LoginInput

**定義**:

```typescript
export interface LoginInput {
  userId: string;
  password: string;
}
```

**用途**: 登入輸入類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/auth/login-form.tsx` - 登入表單
- `app/api/auth/login/route.ts` - 登入 API

---

### UploadResponse

**定義**:

```typescript
export interface UploadResponse {
  message: string;
  url: string;
}
```

**用途**: 上傳響應類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `app/api/upload/route.ts` - 上傳 API（如果存在）

---

## Admin 相關類型

### AdminUserListItem

**定義**:

```typescript
export interface AdminUserListItem {
  id: string;
  userId: string;
  name: string; // 從profile讀取
  nickname?: string | null; // 從profile讀取
  email: string;
  avatar?: string | null; // 從profile讀取
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: Date | string;
  _count: {
    posts: number;
    comments: number;
  };
}
```

**用途**: 管理員用戶列表項目類型（扁平化的 profile 資料）

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/admin/user-management.tsx` - 用戶管理組件
- `app/api/admin/users/route.ts` - 管理員用戶 API
- `lib/services/users.ts` - User 服務層

---

### AdminPostListItem

**定義**:

```typescript
export interface AdminPostListItem {
  id: string;
  title: string;
  content: string;
  views: number;
  likes: number;
  createdAt: Date | string;
  user: UserPublic;
  _count: {
    comments: number;
  };
}
```

**用途**: 管理員貼文列表項目類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/admin/post-management.tsx` - 貼文管理組件
- `app/api/admin/posts/route.ts` - 管理員貼文 API

---

### AdminEventListItem

**定義**:

```typescript
export interface AdminEventListItem {
  id: string;
  name: string;
  fight_date: Date | string;
  status: "PENDING" | "OPEN" | "CLOSED" | "SETTLED" | "CANCELLED";
  sport_type?: SportType | null;
  promoter?: string | null;
  organization?: string | null;
  venue?: string | null;
  location?: string | null;
  createdAt: Date | string;
  _count: {
    fights: number; // 修正：fighterEvents → fights (2025-01-21)
    bets: number;
    posts: number;
  };
}
```

**用途**: 管理員賽事列表項目類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/admin/event-list.tsx` - 賽事管理組件
- `app/api/admin/events/route.ts` - 管理員賽事 API
- `lib/services/events.ts` - Event 服務層

**重要變更** (2025-01-21):

- ✅ 修正: `_count.fighterEvents` → `_count.fights`（與資料庫 schema 同步）

---

## 類型使用統計 / Type Usage Statistics

**定義**:

```typescript
export interface AdminPostListItem {
  id: string;
  title: string;
  content: string;
  views: number;
  likes: number;
  createdAt: Date | string;
  user: UserPublic;
  _count: {
    comments: number;
  };
}
```

**用途**: 管理員貼文列表項目類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/admin/post-management.tsx` - 貼文管理組件
- `app/api/admin/posts/route.ts` - 管理員貼文 API

---

### AdminEventListItem

**定義**:

```typescript
export interface AdminEventListItem {
  id: string;
  name: string;
  fight_date: Date | string;
  status: "PENDING" | "OPEN" | "CLOSED" | "SETTLED" | "CANCELLED";
  sport_type?: SportType | null;
  promoter?: string | null;
  organization?: string | null;
  venue?: string | null;
  location?: string | null;
  createdAt: Date | string;
  _count: {
    fights: number; // 修正：fighterEvents → fights (2025-01-21)
    bets: number;
    posts: number;
  };
}
```

**用途**: 管理員賽事列表項目類型

**使用位置**:

- `lib/types.ts` - 類型定義
- `components/admin/event-list.tsx` - 賽事管理組件
- `app/api/admin/events/route.ts` - 管理員賽事 API
- `lib/services/events.ts` - Event 服務層

**重要變更** (2025-01-21):

- ✅ 修正: `_count.fighterEvents` → `_count.fights`（與資料庫 schema 同步）

---

## 類型使用統計 / Type Usage Statistics

### 最常用的類型

1. **UserPublic** - 用於所有公開顯示的用戶資訊
2. **PostWithUser** - 用於貼文列表和卡片顯示
3. **Event** - 用於賽事相關功能
4. **Fighter** - 用於選手相關功能
5. **BettingLog** - 用於投注系統

### 類型引用文件統計

- **Profile 相關**: 15+ 文件
- **User 相關**: 20+ 文件
- **Post 相關**: 25+ 文件
- **Event 相關**: 10+ 文件
- **Fighter 相關**: 8+ 文件
- **Betting 相關**: 5+ 文件

---

## 類型變更記錄 / Type Change Log

### 2025-01-21: Event 類型更新

**變更內容**:

- ❌ 移除: `winner_id`, `is_manual_override`
- ✅ 新增: `promoter`, `organization`, `venue`, `location`, `description`, `poster_url`

**影響文件**:

- `lib/types.ts` - 類型定義
- `lib/services/events.ts` - Event 服務層
- `app/api/events/*` - Event API 路由
- `components/admin/event-create-form.tsx` - 創建賽事表單
- `app/event/[id]/page.tsx` - 賽事詳情頁面

---

### 2025-01-21: AdminEventListItem 類型修正

**變更內容**:

- ✅ 修正: `_count.fighterEvents` → `_count.fights`（與資料庫 schema 同步，FighterEvent 已改名為 Fight）

**影響文件**:

- `lib/types.ts` - 類型定義
- `lib/services/events.ts` - Event 服務層
- `components/admin/event-list.tsx` - 賽事管理組件

---

### 2025-01-21: 類型註釋完善

**變更內容**:

- ✅ 為所有類型添加了繁體中文和日文註釋說明
- ✅ 確保類型定義與實際使用一致

**影響文件**:

- `lib/types.ts` - 所有類型定義都已添加註釋

---

### 2025-01-23: TypeScript 類型安全性修復

**變更內容**:

- ✅ 修復 `transformUser` 函數：確保 `profile` 屬性始終存在（即使為 `null`），符合 `UserPublicExtended` 類型定義
- ✅ 修復 `event-matcher.ts`：使用類型斷言訪問 `external_id` 字段（因為 `Event` 類型可能不包含該字段）
- ✅ 修復 `fighter.ts` 中的多個類型錯誤：
  - `toFighterPublic` 和 `toFighterWithEvents` 中的 `external_data` 類型轉換
  - `fightsAsFighter` 中添加 `fighter` 屬性
  - 返回對象添加 `fightsAsOpponent` 屬性

**影響文件**:

- `lib/utils.ts` - `transformUser` 函數類型修復
- `lib/utils/event-matcher.ts` - `external_id` 訪問修復
- `lib/utils/fighter.ts` - 多個類型錯誤修復

**技術說明**:

- 使用類型斷言 `as Type` 解決 Prisma 生成的類型與應用類型之間的差異
- 確保所有可能為 `null` 的屬性都正確處理
- 所有修復不影響運行時行為，僅改善類型安全性

---

### 2025-01-24: Fighter 性別與頭銜欄位新增

**變更內容**:

- ✅ 新增 `FighterGender` enum（MALE, FEMALE, OTHER）
- ✅ 在 Fighter 模型中新增 `gender` 欄位（預設值：MALE）
- ✅ 在 Fighter 模型中新增 `titles` 欄位（String[] 陣列，預設值：空陣列）
- ✅ 更新所有相關的 Prisma selects 包含新欄位
- ✅ 更新 API 路由支援新欄位
- ✅ 更新服務層處理新欄位
- ✅ 更新前端組件顯示新欄位

**影響文件**:

- `prisma/schema.prisma` - Prisma schema 更新
- `lib/types/prisma-selects.ts` - Prisma selects 更新
- `app/api/fighters/route.ts` - API 路由更新
- `lib/services/fighters.ts` - 服務層更新
- `components/admin/fighter-create-form.tsx` - 管理員創建表單更新
- `components/fighters/fighter-profile-card.tsx` - 公開顯示組件更新
- `docs/types/DATABASE_SCHEMA.md` - 資料庫結構文檔更新
- `docs/types/TYPESCRIPT_TYPES.md` - TypeScript 類型文檔更新

**技術說明**:

- 性別使用 Enum 類型確保資料一致性
- 頭銜使用 String[] 陣列支援複數頭銜
- 所有現有 Fighter 記錄會自動獲得預設值（gender: MALE, titles: []）
- 外部 API 同步時使用預設值（因為外部 API 通常不提供這些資訊）

---

## 類型同步檢查清單 / Type Sync Checklist

當更改資料庫結構時，請檢查以下項目：

- [ ] 更新 Prisma schema (`prisma/schema.prisma`)
- [ ] 執行 `pnpm prisma generate` 重新生成 Prisma Client
- [ ] 更新 `lib/types.ts` 中對應的 TypeScript 類型
- [ ] 檢查所有使用該類型的文件並更新
- [ ] 更新相關的 Zod schema（如果存在）
- [ ] 更新 API 路由的輸入/輸出類型
- [ ] 更新前端組件的類型定義
- [ ] 更新服務層的類型定義
- [ ] 更新本文檔

---

## 參考資料 / References

- Prisma Schema: `prisma/schema.prisma`
- TypeScript Types: `lib/types.ts`
- API Routes: `app/api/`
- Service Layer: `lib/services/`
- Components: `components/`
