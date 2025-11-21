# 資料庫結構文檔 / Database Schema Documentation

本文檔記錄 Prisma schema 中定義的所有資料表結構，供未來更改資料庫格式時參考。

## 目錄 / Table of Contents

- [User](#user)
- [Profile](#profile)
- [Follows](#follows)
- [Category](#category)
- [Post](#post)
- [Comment](#comment)
- [PostLike](#postlike)
- [CommentLike](#commentlike)
- [Event](#event)
- [FighterEvent](#fighterevent)
- [Fighter](#fighter)
- [BettingLog](#bettinglog)
- [AuditLog](#auditlog)
- [Enums](#enums)

---

## User

**用途**: 用戶基本資訊（僅登錄相關）

**字段**:

| 字段名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `id` | String (UUID) | ✅ | `uuid()` | 主鍵 |
| `userId` | String | ✅ | - | 用戶ID（唯一） |
| `email` | String | ✅ | - | 電子郵件（唯一） |
| `password` | String | ✅ | - | 密碼（已加密） |
| `isAdmin` | Boolean | ✅ | `false` | 是否為管理員 |
| `isBanned` | Boolean | ✅ | `false` | 是否被封禁 |
| `points` | Int | ✅ | `1000` | 積分 |
| `virtual_score` | Decimal | ✅ | `1000` | 虛擬分數（用於投注系統） |
| `createdAt` | DateTime | ✅ | `now()` | 創建時間 |
| `updatedAt` | DateTime | ✅ | `updatedAt` | 更新時間 |

**關聯**:
- `profile`: Profile (1:1)
- `posts`: Post[] (1:N)
- `comments`: Comment[] (1:N)
- `likedPosts`: PostLike[] (1:N)
- `likedComments`: CommentLike[] (1:N)
- `bets`: BettingLog[] (1:N)
- `followedBy`: Follows[] (被關注)
- `following`: Follows[] (關注中)

**索引**: 無

**備註**: 
- `userId` 用於業務邏輯識別，`id` 用於資料庫關聯
- `virtual_score` 用於投注系統的虛擬貨幣

---

## Profile

**用途**: 用戶個人資料

**字段**:

| 字段名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `id` | String (UUID) | ✅ | `uuid()` | 主鍵 |
| `userId` | String | ✅ | - | 用戶ID（唯一，FK → User.userId） |
| `name` | String | ✅ | - | 姓名 |
| `nickname` | String? | ❌ | - | 暱稱 |
| `gender` | String? | ❌ | - | 性別 |
| `birthDate` | DateTime? | ❌ | - | 出生日期 |
| `avatar` | String? | ❌ | - | 頭像URL |
| `height` | Int? | ❌ | - | 身高（公分） |
| `weight` | Int? | ❌ | - | 體重（公斤） |
| `description` | String? | ❌ | - | 個人簡介 |
| `record` | String? | ❌ | - | 戰績記錄 |
| `train_start` | Int? | ❌ | - | 訓練開始年份 |
| `stance` | String? | ❌ | - | 站姿 |
| `gym` | String? | ❌ | - | 訓練館 |
| `visibility` | Json | ✅ | `{}` | 隱私設定（JSON格式） |
| `deletedAt` | DateTime? | ❌ | - | 軟刪除時間戳 |
| `createdAt` | DateTime | ✅ | `now()` | 創建時間 |
| `updatedAt` | DateTime | ✅ | `updatedAt` | 更新時間 |

**關聯**:
- `user`: User (N:1, onDelete: Cascade)

**索引**:
- `userId`
- `deletedAt`

**備註**:
- `visibility` 為 JSON 格式，包含各字段的隱私設定（public/friends/private）
- 支援軟刪除（`deletedAt`）

---

## Follows

**用途**: 用戶關注關係

**字段**:

| 字段名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `followerId` | String | ✅ | - | 關注者ID（FK → User.userId） |
| `followingId` | String | ✅ | - | 被關注者ID（FK → User.userId） |
| `createdAt` | DateTime | ✅ | `now()` | 關注時間 |

**關聯**:
- `follower`: User (N:1, relation: "follower")
- `following`: User (N:1, relation: "following")

**索引**:
- 複合主鍵: `[followerId, followingId]`
- `followerId`
- `followingId`

**備註**:
- 使用複合主鍵確保唯一性

---

## Category

**用途**: 貼文分類

**字段**:

| 字段名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `id` | String (UUID) | ✅ | `uuid()` | 主鍵 |
| `name` | String | ✅ | - | 分類名稱（唯一） |
| `slug` | String? | ❌ | - | URL友好slug（唯一） |
| `description` | String? | ❌ | - | 分類描述 |
| `displayOrder` | Int | ✅ | `1` | 顯示順序 |
| `createdAt` | DateTime | ✅ | `now()` | 創建時間 |
| `updatedAt` | DateTime | ✅ | `updatedAt` | 更新時間 |
| `deletedAt` | DateTime? | ❌ | - | 軟刪除時間戳 |

**關聯**:
- `posts`: Post[] (1:N)

**索引**:
- `deletedAt`
- `displayOrder`

**備註**:
- 支援軟刪除
- `displayOrder` 用於排序

---

## Post

**用途**: 貼文

**字段**:

| 字段名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `id` | String | ✅ | - | 主鍵（自定義ID） |
| `title` | String | ✅ | - | 標題 |
| `content` | String | ✅ | - | 內容 |
| `userId` | String | ✅ | - | 作者ID（FK → User.userId） |
| `tags` | String[] | ✅ | - | 標籤陣列 |
| `categoryId` | String? | ❌ | - | 分類ID（FK → Category.id） |
| `eventId` | String? | ❌ | - | 關聯賽事ID（FK → Event.id） |
| `views` | Int | ✅ | `0` | 瀏覽次數 |
| `likes` | Int | ✅ | `0` | 點讚數 |
| `createdAt` | DateTime | ✅ | `now()` | 創建時間 |
| `updatedAt` | DateTime | ✅ | `updatedAt` | 更新時間 |
| `deletedAt` | DateTime? | ❌ | - | 軟刪除時間戳 |

**關聯**:
- `user`: User (N:1)
- `category`: Category? (N:1)
- `event`: Event? (N:1)
- `comments`: Comment[] (1:N)
- `likedBy`: PostLike[] (1:N)

**索引**:
- `deletedAt`
- `categoryId`

**備註**:
- 支援軟刪除
- `tags` 為陣列類型

---

## Comment

**用途**: 評論

**字段**:

| 字段名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `id` | String | ✅ | - | 主鍵（自定義ID） |
| `content` | String | ✅ | - | 評論內容 |
| `userId` | String | ✅ | - | 作者ID（FK → User.userId） |
| `postId` | String | ✅ | - | 貼文ID（FK → Post.id） |
| `parentId` | String? | ❌ | - | 父評論ID（用於回覆） |
| `likes` | Int | ✅ | `0` | 點讚數 |
| `replies` | Int | ✅ | `0` | 回覆數 |
| `createdAt` | DateTime | ✅ | `now()` | 創建時間 |
| `updatedAt` | DateTime | ✅ | `updatedAt` | 更新時間 |
| `deletedAt` | DateTime? | ❌ | - | 軟刪除時間戳 |

**關聯**:
- `user`: User (N:1, onDelete: Cascade)
- `post`: Post (N:1, onDelete: Cascade)
- `likedBy`: CommentLike[] (1:N)

**索引**: 無

**備註**:
- 支援軟刪除
- 支援階層式評論（`parentId`）

---

## PostLike

**用途**: 貼文點讚記錄

**字段**:

| 字段名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `id` | String (UUID) | ✅ | `uuid()` | 主鍵 |
| `userId` | String | ✅ | - | 用戶ID（FK → User.userId） |
| `postId` | String | ✅ | - | 貼文ID（FK → Post.id） |
| `createdAt` | DateTime | ✅ | `now()` | 點讚時間 |

**關聯**:
- `user`: User (N:1, onDelete: Cascade)
- `post`: Post (N:1, onDelete: Cascade)

**索引**:
- 唯一約束: `[userId, postId]`
- `userId`
- `postId`

**備註**:
- 使用唯一約束確保用戶不能重複點讚同一貼文

---

## CommentLike

**用途**: 評論點讚記錄

**字段**:

| 字段名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `id` | String (UUID) | ✅ | `uuid()` | 主鍵 |
| `userId` | String | ✅ | - | 用戶ID（FK → User.userId） |
| `commentId` | String | ✅ | - | 評論ID（FK → Comment.id） |
| `createdAt` | DateTime | ✅ | `now()` | 點讚時間 |

**關聯**:
- `user`: User (N:1, onDelete: Cascade)
- `comment`: Comment (N:1, onDelete: Cascade)

**索引**:
- 唯一約束: `[userId, commentId]`
- `userId`
- `commentId`

**備註**:
- 使用唯一約束確保用戶不能重複點讚同一評論

---

## Event

**用途**: 格鬥賽事

**字段**:

| 字段名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `id` | String | ✅ | - | 主鍵（自定義ID，格式：YYYYMMDDHHMMSS + 隨機數） |
| `name` | String | ✅ | - | 賽事名稱 |
| `fight_date` | DateTime | ✅ | - | 賽事日期時間 |
| `status` | EventStatus | ✅ | `PENDING` | 賽事狀態 |
| `sport_type` | String? | ❌ | - | 運動類型（boxing, ufc, mma等） |
| `promoter` | String? | ❌ | - | 推廣單位 |
| `organization` | String? | ❌ | - | 聯盟品牌 |
| `venue` | String? | ❌ | - | 場地名稱 |
| `location` | String? | ❌ | - | 地點（城市、國家） |
| `description` | String? | ❌ | - | 賽事簡介（TEXT類型） |
| `poster_url` | String? | ❌ | - | 海報圖片URL |
| `external_id` | String? | ❌ | - | 外部API事件ID |
| `external_source` | String? | ❌ | - | 資料來源 |
| `external_data` | Json? | ❌ | - | 外部API資料快照 |
| `last_synced_at` | DateTime? | ❌ | - | 最後同步時間 |
| `sync_status` | String | ✅ | `"pending"` | 同步狀態 |
| `createdAt` | DateTime | ✅ | `now()` | 創建時間 |
| `updatedAt` | DateTime | ✅ | `updatedAt` | 更新時間 |

**關聯**:
- `posts`: Post[] (1:N)
- `bets`: BettingLog[] (1:N，保留用於查詢)
- `fighterEvents`: FighterEvent[] (1:N，實際對戰列表)

**索引**:
- 唯一約束: `[external_id, external_source]`
- `[external_id, external_source]`
- `[fight_date, status]`
- `last_synced_at`
- `[sport_type, fight_date]`
- `promoter`

**備註**:
- `id` 使用自定義格式，便於識別和排序
- 支援外部API同步（`external_id`, `external_source`, `external_data`）
- `bets` 關聯保留用於快速查詢和統計，實際投注關聯到 `FighterEvent`

---

## FighterEvent

**用途**: 對戰組合（賽事中的單場對戰）

**字段**:

| 字段名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `id` | String (UUID) | ✅ | `uuid()` | 主鍵 |
| `event_id` | String | ✅ | - | 賽事ID（FK → Event.id） |
| `fighter_id` | String | ✅ | - | 選手1 ID（FK → Fighter.id） |
| `opponent_id` | String? | ❌ | - | 選手2 ID（FK → Fighter.id，可選） |
| `fight_type` | FightType | ✅ | `MAIN` | 對戰類型 |
| `fight_order` | Int | ✅ | - | 對戰順序（1=第一場） |
| `weight_class` | String? | ❌ | - | 量級 |
| `result` | String? | ❌ | - | 結果（從fighter角度：Win/Loss/Draw/NC） |
| `method` | String? | ❌ | - | 獲勝方式（KO/TKO/Decision等） |
| `round` | Int? | ❌ | - | 回合數 |
| `time` | String? | ❌ | - | 時間（如 "2:34"） |
| `is_bettable` | Boolean | ✅ | `true` | 是否開放投注 |
| `status` | FightStatus | ✅ | `PENDING` | 對戰狀態 |
| `createdAt` | DateTime | ✅ | `now()` | 創建時間 |
| `updatedAt` | DateTime | ✅ | `updatedAt` | 更新時間 |

**關聯**:
- `event`: Event (N:1, onDelete: Cascade)
- `fighter`: Fighter (N:1, relation: "Fighter")
- `opponent`: Fighter? (N:1, relation: "Opponent", onDelete: SetNull)
- `bets`: BettingLog[] (1:N)

**索引**:
- 唯一約束: `: `[event_id, fight_order]`
- `event_id`
- `fighter_id`
- `opponent_id`
- `[fight_type, fight_order]`
- `[is_bettable, status]`

**備註**:
- 同一賽事中 `fight_order` 必須唯一
- `fight_order` 數字越小越重要（1=主賽）
- 支援單人賽事（`opponent_id` 可為 null）

---

## Fighter

**用途**: 格鬥選手

**字段**:

| 字段名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `id` | String (UUID) | ✅ | `uuid()` | 主鍵 |
| `slug` | String | ✅ | - | URL友好slug（唯一） |
| `name` | String | ✅ | - | 全名 |
| `external_id` | String? | ❌ | - | 外部API選手ID |
| `external_source` | String? | ❌ | `"thesportsdb"` | 資料來源 |
| `external_data` | Json? | ❌ | - | 外部API資料快照 |
| `sport_type` | String? | ❌ | - | 運動類型（boxing/ufc/mma） |
| `nationality` | String? | ❌ | - | 國籍 |
| `date_born` | DateTime? | ❌ | - | 出生日期 |
| `height` | String? | ❌ | - | 身高（如 "5 ft 9 in"） |
| `weight` | String? | ❌ | - | 體重（如 "155 lbs"） |
| `position` | String? | ❌ | - | 量級/位置 |
| `description` | String? | ❌ | - | 簡介 |
| `thumb` | String? | ❌ | - | 頭像縮圖URL |
| `cutout` | String? | ❌ | - | 剪影圖片URL |
| `last_synced_at` | DateTime? | ❌ | - | 最後同步時間 |
| `createdAt` | DateTime | ✅ | `now()` | 創建時間 |
| `updatedAt` | DateTime | ✅ | `updatedAt` | 更新時間 |

**關聯**:
- `eventsAsFighter`: FighterEvent[] (1:N, relation: "Fighter")
- `eventsAsOpponent`: FighterEvent[] (1:N, relation: "Opponent")

**索引**:
- `[external_id, external_source]`
- `sport_type`
- `slug`

**備註**:
- `slug` 用於URL友好路徑（如 `/fighter/conor-mcgregor`）
- 支援外部API同步

---

## BettingLog

**用途**: 投注記錄

**字段**:

| 字段名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `id` | String (UUID) | ✅ | `uuid()` | 主鍵 |
| `userId` | String | ✅ | - | 用戶ID（FK → User.userId） |
| `eventId` | String | ✅ | - | 賽事ID（FK → Event.id，保留用於查詢） |
| `fighterEventId` | String | ✅ | - | 對戰ID（FK → FighterEvent.id，實際關聯） |
| `bet_amount` | Decimal | ✅ | - | 投注總金額 |
| `target_winner_id` | String | ✅ | - | 投注目標勝者ID（fighter_id或opponent_id） |
| `odds_snapshot` | Decimal | ✅ | - | 投注時的即時賠率快照 |
| `is_winning_bet` | Boolean | ✅ | `false` | 是否中獎投注 |
| `final_payout` | Decimal? | ❌ | - | 最終支付金額 |
| `settlement_status` | BetStatus | ✅ | `PENDING` | 結算狀態 |
| `createdAt` | DateTime | ✅ | `now()` | 創建時間 |

**關聯**:
- `user`: User (N:1)
- `event`: Event (N:1)
- `fighterEvent`: FighterEvent (N:1)

**索引**:
- `userId`
- `eventId`
- `fighterEventId`
- `settlement_status`

**備註**:
- `eventId` 保留用於快速查詢和統計
- `fighterEventId` 為實際投注關聯
- `odds_snapshot` 用於未來爭議或審計

---

## AuditLog

**用途**: 管理員操作審計日誌

**字段**:

| 字段名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `id` | String (UUID) | ✅ | `uuid()` | 主鍵 |
| `adminId` | String | ✅ | - | 管理員ID |
| `action_type` | String | ✅ | - | 操作類型 |
| `description` | String | ✅ | - | 描述 |
| `ip_address` | String | ✅ | - | IP位址 |
| `createdAt` | DateTime | ✅ | `now()` | 操作時間` |

**關聯**: 無

**索引**: 無

**備註**:
- 記錄所有管理員操作
- 包含IP位址用於安全審計

---

## Enums

### EventStatus

賽事狀態枚舉

- `PENDING` - 待定
- `OPEN` - 開放投注
- `CLOSED` - 關閉投注
- `SETTLED` - 已結算
- `CANCELLED` - 已取消

### BetStatus

投注結算狀態枚舉

- `PENDING` - 待結算
- `WON` - 中獎
- `LOST` - 未中獎
- `VOID` - 無效

### FightType

對戰類型枚舉

- `MAIN` - 主賽
- `CO_MAIN` - 副賽
- `PRELIMS` - 預賽
- `EARLY_PRELIMS` - 早期預賽

### FightStatus

對戰狀態枚舉

- `PENDING` - 待定
- `CONFIRMED` - 確認
- `CANCELLED` - 取消
- `COMPLETED` - 完成

---

## 重要變更記錄 / Important Changes

### 2025-01-21: Event 結構重構

**變更內容**:
- 移除 `Event.winner_id`（現在在 `FighterEvent` 中）
- 移除 `Event.is_manual_override`
- 新增 `Event.promoter`, `organization`, `venue`, `location`, `description`, `poster_url`
- 引入 `FighterEvent` 模型，將對戰資訊從 `Event` 分離

**影響範圍**:
- 所有使用 `Event` 類型的文件
- 投注系統現在基於 `FighterEvent` 而非 `Event`
- API 端點需要更新以支援新的結構

**遷移注意事項**:
- 現有資料需要遷移到新結構
- `BettingLog` 現在需要 `fighterEventId` 字段

---

## 資料庫關係圖 / Database Relationships

```
User (1) ──< (N) Profile
User (1) ──< (N) Post
User (1) ──< (N) Comment
User (1) ──< (N) BettingLog
User (1) ──< (N) PostLike
User (1) ──< (N) CommentLike
User (N) ──< (N) User (Follows)

Category (1) ──< (N) Post
Event (1) ──< (N) Post
Event (1) ──< (N) FighterEvent
Event (1) ──< (N) BettingLog

Fighter (1) ──< (N) FighterEvent (as fighter)
Fighter (1) ──< (N) FighterEvent (as opponent)
FighterEvent (1) ──< (N) BettingLog
```

---

## 索引優化說明 / Index Optimization

### Event 表索引

- `[external_id, external_source]`: 快速查找外部API同步的事件
- `[fight_date, status]`: 優化本週事件查詢
- `[sport_type, fight_date]`: 優化事件分析頁面查詢
- `promoter`: 優化推廣單位查詢

### FighterEvent 表索引

- `[event_id, fight_order]`: 唯一約束，確保同一賽事中對戰順序唯一
- `[fight_type, fight_order]`: 優化對戰類型與順序查詢
- `[is_bettable, status]`: 優化投注相關查詢

### 其他優化索引

- `User.userId`: 業務邏輯識別
- `Fighter.slug`: URL友好路徑查找
- `Profile.deletedAt`: 軟刪除查詢優化
- `Post.deletedAt`, `Comment.deletedAt`, `Category.deletedAt`: 軟刪除查詢優化

---

## 未來擴充建議 / Future Expansion Suggestions

1. **Event 表**:
   - 考慮添加 `timezone` 字段用於時區處理
   - 考慮添加 `broadcast_info` JSON字段用於轉播資訊

2. **FighterEvent 表**:
   - 考慮添加 `broadcast_time` 用於轉播時間
   - 考慮添加 `preliminary` Boolean字段用於區分預賽

3. **BettingLog 表**:
   - 考慮添加 `odds_type` 用於不同賠率類型
   - 考慮添加 `bet_type` 用於不同投注類型（單注/組合等）

4. **Fighter 表**:
   - 考慮添加 `social_media` JSON字段用於社交媒體連結
   - 考慮添加 `career_stats` JSON字段用於職業統計

---

## 參考資料 / References

- Prisma Schema: `prisma/schema.prisma`
- TypeScript Types: `lib/types.ts`
- API Routes: `app/api/`
- Service Layer: `lib/services/`

