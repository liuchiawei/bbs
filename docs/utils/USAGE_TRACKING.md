# 工具函數使用位置追蹤 / Utility Functions Usage Tracking

本文檔追蹤每個工具函數在專案中的使用位置，方便查找和重構。

## 使用說明 / Usage Guide

- **查找函數使用位置**: 在下方找到函數名稱，查看所有使用該函數的文件列表
- **評估函數重要性**: 根據使用頻率判斷函數的重要性
- **規劃重構**: 了解函數的影響範圍，規劃安全的重構

---

## 通用工具 (lib/utils.ts)

### `transformUser()`

**使用位置** (8 個文件):

1. `lib/services/posts.ts` - 轉換 Post 的 user 資料
2. `lib/services/comments.ts` - 轉換 Comment 的 user 資料
3. `lib/services/users.ts` - 轉換用戶資料
4. `app/user/[userId]/posts/page.tsx` - 顯示用戶貼文
5. `app/user/[userId]/likes/page.tsx` - 顯示用戶點讚

**使用頻率**: 高（核心函數）

**備註**: 統一處理嵌套 profile 結構轉換，減少代碼重複

---

### `cn()`

**使用位置** (15+ 個文件):

- 所有 UI 組件文件（`components/ui/*.tsx`）
- 多個頁面組件

**使用頻率**: 極高（幾乎所有組件）

**備註**: Tailwind CSS 類名合併的標準函數

---

## Slug 生成 (lib/utils/slug.ts)

### `normalizeFighterName()`

**使用位置** (1 個文件):

1. `lib/utils/slug.ts` - `generateSlug()` 內部使用

**使用頻率**: 低（內部函數）

---

### `generateSlug()`

**使用位置** (3 個文件):

1. `lib/services/fighters.ts` - 生成 Fighter slug
2. `components/admin/fighter-create-form.tsx` - 前端 slug 預覽
3. `components/fighters/fighter-link.tsx` - 生成連結 slug

**使用頻率**: 中

---

### `generateUniqueSlug()`

**使用位置** (2 個文件):

1. `app/api/fighters/route.ts` - 創建 Fighter 時生成唯一 slug
2. `lib/services/fighters.ts` - 服務層生成唯一 slug

**使用頻率**: 中

**備註**: 確保 slug 唯一性的關鍵函數

---

### `slugToPossibleNames()`

**使用位置** (1 個文件):

1. `lib/services/fighters.ts` - on-demand 同步時推測名字

**使用頻率**: 低

**備註**: 用於自動同步功能

---

## ID 生成 (lib/utils/id-generator.ts)

### `generatePostId()`

**使用位置** (1 個文件):

1. `lib/services/posts.ts` - 創建 Post 時生成 ID

**使用頻率**: 中

**備註**: Post 創建的核心函數

---

### `generateCommentId()`

**使用位置** (2 個文件):

1. `lib/services/comments.ts` - 創建 Comment 時生成 ID
2. `app/api/comments/route.ts` - API 路由中生成 ID

**使用頻率**: 中

**備註**: Comment 創建的核心函數

---

### `generateEventId()`

**使用位置** (1 個文件):

1. `lib/services/events.ts` - 創建 Event 時生成 ID

**使用頻率**: 中

**備註**: Event 創建的核心函數

---

## Fighter 轉換 (lib/utils/fighter.ts)

### `convertJsonValue()`

**使用位置** (2 個文件):

1. `lib/utils/fighter.ts` - `toFighterPublic()` 和 `toFighterWithEvents()` 內部使用

**使用頻率**: 低（內部函數）

**備註**: 類型轉換的輔助函數

---

### `toFighterPublic()`

**使用位置** (1 個文件):

1. `lib/services/fighters.ts` - 轉換 Fighter 為公開格式

**使用頻率**: 中

---

### `toFighterWithEvents()`

**使用位置** (2 個文件):

1. `lib/services/fighters.ts` - 轉換 Fighter 為帶賽事格式
2. `app/fighter/[slug]/page.tsx` - 選手頁面顯示

**使用頻率**: 中

---

## 對戰卡解析 (lib/utils/fight-card-parser.ts)

### `parseFightCard()`

**使用位置** (2 個文件):

1. `lib/services/events.ts` - 同步賽事時解析對戰卡
2. `components/events/event-fight-card.tsx` - 前端顯示對戰卡

**使用頻率**: 中

**備註**: 賽事同步功能的核心函數

---

## 賽事匹配 (lib/utils/event-matcher.ts)

### `normalizeEventName()`

**使用位置** (1 個文件):

1. `lib/utils/event-matcher.ts` - `calculateNameSimilarity()` 內部使用

**使用頻率**: 低（內部函數）

---

### `calculateNameSimilarity()`

**使用位置** (1 個文件):

1. `lib/utils/event-matcher.ts` - `findMatchingEvent()` 內部使用

**使用頻率**: 低（內部函數）

---

### `isDateWithinRange()`

**使用位置** (1 個文件):

1. `lib/utils/event-matcher.ts` - `findMatchingEvent()` 內部使用

**使用頻率**: 低（內部函數）

---

### `findMatchingEvent()`

**使用位置** (1 個文件):

1. `lib/services/events.ts` - 賽事同步時查找匹配

**使用頻率**: 中

**備註**: 賽事去重的核心函數

---

## 管理員工具 (lib/utils/admin.ts)

### `transformAdminUserListItem()`

**使用位置** (1 個文件):

1. `lib/services/users.ts` - `getAllUsers()` 中轉換用戶資料

**使用頻率**: 中

**備註**: 管理員用戶列表的核心轉換函數

---

## 使用頻率統計 / Usage Frequency Statistics

### 高頻使用（5+ 文件）
- `cn()` - 15+ 文件

### 中頻使用（2-4 文件）
- `transformUser()` - 5 文件
- `generateSlug()` - 3 文件
- `generateUniqueSlug()` - 2 文件
- `generatePostId()` - 1 文件（但核心功能）
- `generateCommentId()` - 2 文件
- `generateEventId()` - 1 文件（但核心功能）
- `toFighterPublic()` - 1 文件（但核心功能）
- `toFighterWithEvents()` - 2 文件
- `parseFightCard()` - 2 文件
- `findMatchingEvent()` - 1 文件（但核心功能）
- `transformAdminUserListItem()` - 1 文件（但核心功能）

### 低頻使用（1 文件，內部函數）
- `normalizeFighterName()` - 內部使用
- `slugToPossibleNames()` - 1 文件
- `convertJsonValue()` - 內部使用
- `normalizeEventName()` - 內部使用
- `calculateNameSimilarity()` - 內部使用
- `isDateWithinRange()` - 內部使用

---

## 重構建議 / Refactoring Recommendations

### 高優先級
- **無**: 所有函數都有明確的用途和使用位置

### 中優先級
- 考慮將內部使用的輔助函數標記為 `private` 或使用更明確的命名

### 低優先級
- 考慮為高頻使用的函數添加更多使用範例和文檔

---

## 更新記錄 / Update Log

- **2025-01-21**: 創建初始文檔，追蹤所有工具函數使用位置
- **2025-01-21**: 添加 `transformAdminUserListItem` 使用追蹤

