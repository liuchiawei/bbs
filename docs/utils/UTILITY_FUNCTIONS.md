# 工具函數詳細說明 / Utility Functions Reference

本文檔記錄專案中所有工具函數的詳細說明、參數、返回值和使用範例。

## 目錄 / Table of Contents

- [通用工具 (lib/utils.ts)](#通用工具-libutilsts)
- [Slug 生成 (lib/utils/slug.ts)](#slug-生成-libutilsslugts)
- [ID 生成 (lib/utils/id-generator.ts)](#id-生成-libutilsid-generatorts)
- [Fighter 轉換 (lib/utils/fighter.ts)](#fighter-轉換-libutilsfighterts)
- [對戰卡解析 (lib/utils/fight-card-parser.ts)](#對戰卡解析-libutilsfight-card-parserts)
- [賽事匹配 (lib/utils/event-matcher.ts)](#賽事匹配-libutilsevent-matcherts)
- [管理員工具 (lib/utils/admin.ts)](#管理員工具-libutilsadmints)

---

## 通用工具 (lib/utils.ts)

### `transformUser()`

**功能**: 將嵌套的 profile 結構轉換為扁平結構

**參數**:
- `user`: 包含 `id`, `userId`, `email`, `profile` 的對象

**返回值**: `UserPublicExtended`

**使用範例**:
```typescript
import { transformUser } from "@/lib/utils";

const user = {
  id: "123",
  userId: "john_doe",
  email: "john@example.com",
  profile: {
    name: "John Doe",
    nickname: "Johnny",
    avatar: "https://example.com/avatar.jpg"
  }
};

const transformed = transformUser(user);
// Returns: { id, userId, email, name: "John Doe", nickname: "Johnny", avatar: "https://..." }
```

**注意事項**:
- 如果 `profile` 為 `null`，使用 `userId` 作為 `name` 的預設值
- 確保 `undefined` 轉為 `null`，符合類型定義

**使用位置**: 
- `lib/services/posts.ts`
- `lib/services/comments.ts`
- `lib/services/users.ts`

---

### `cn()`

**功能**: 合併 CSS 類名（使用 `clsx` 和 `tailwind-merge`）

**參數**: 
- `...inputs`: `ClassValue[]` - 可變參數，接受多個類名字串或對象

**返回值**: `string` - 合併後的類名字串

**使用範例**:
```typescript
import { cn } from "@/lib/utils";

const className = cn("base-class", condition && "conditional-class", {
  "object-class": true
});
```

**注意事項**:
- 自動處理 Tailwind CSS 類名衝突
- 支援條件類名和對象格式

**使用位置**: 
- 所有 UI 組件文件

---

## Slug 生成 (lib/utils/slug.ts)

### `normalizeFighterName()`

**功能**: 標準化選手名字，移除特殊字元和前綴

**參數**:
- `name`: `string` - 選手名字

**返回值**: `string` - 標準化後的名字

**使用範例**:
```typescript
import { normalizeFighterName } from "@/lib/utils/slug";

normalizeFighterName("Mr. Conor McGregor"); // "Conor McGregor"
normalizeFighterName("  John  Doe  "); // "John Doe"
```

**使用位置**: 
- `generateSlug()` 內部使用

---

### `generateSlug()`

**功能**: 從選手名字生成 URL 友好的 slug

**參數**:
- `name`: `string` - 選手名字

**返回值**: `string` - slug（例如："conor-mcgregor"）

**使用範例**:
```typescript
import { generateSlug } from "@/lib/utils/slug";

generateSlug("Conor McGregor"); // "conor-mcgregor"
generateSlug("John O'Brien"); // "john-obrien"
```

**使用位置**: 
- `lib/services/fighters.ts`
- `components/admin/fighter-create-form.tsx`
- `components/fighters/fighter-link.tsx`

---

### `generateUniqueSlug()`

**功能**: 生成唯一 slug，必要時添加數字後綴

**參數**:
- `name`: `string` - 選手名字
- `existingSlugs`: `string[]` - 現有 slug 列表

**返回值**: `string` - 唯一的 slug

**使用範例**:
```typescript
import { generateUniqueSlug } from "@/lib/utils/slug";

const existing = ["conor-mcgregor"];
generateUniqueSlug("Conor McGregor", existing); // "conor-mcgregor-1"
```

**使用位置**: 
- `app/api/fighters/route.ts`
- `lib/services/fighters.ts`

---

### `slugToPossibleNames()`

**功能**: 從 slug 推測可能的名字列表（用於 on-demand 同步）

**參數**:
- `slug`: `string` - Fighter slug

**返回值**: `string[]` - 可能的名字列表

**使用範例**:
```typescript
import { slugToPossibleNames } from "@/lib/utils/slug";

slugToPossibleNames("conor-mcgregor"); 
// ["Conor McGregor", "Conor McGregor"] (with Mc variation)
```

**使用位置**: 
- `lib/services/fighters.ts`

---

## ID 生成 (lib/utils/id-generator.ts)

### `generatePostId()`

**功能**: 生成唯一的 Post ID（時間戳格式：YYYYMMDDHHmmss + 4位隨機數）

**參數**: 無

**返回值**: `Promise<string>` - 唯一的 Post ID

**使用範例**:
```typescript
import { generatePostId } from "@/lib/utils/id-generator";

const postId = await generatePostId();
// "202511201234561234"
```

**注意事項**:
- 自動檢查資料庫唯一性
- 最多重試 10 次
- 格式：18 位數字

**使用位置**: 
- `lib/services/posts.ts`

---

### `generateCommentId()`

**功能**: 生成唯一的 Comment ID（時間戳格式）

**參數**: 無

**返回值**: `Promise<string>` - 唯一的 Comment ID

**使用範例**:
```typescript
import { generateCommentId } from "@/lib/utils/id-generator";

const commentId = await generateCommentId();
```

**使用位置**: 
- `lib/services/comments.ts`
- `app/api/comments/route.ts`

---

### `generateEventId()`

**功能**: 生成唯一的 Event ID（時間戳格式）

**參數**: 無

**返回值**: `Promise<string>` - 唯一的 Event ID

**使用範例**:
```typescript
import { generateEventId } from "@/lib/utils/id-generator";

const eventId = await generateEventId();
```

**使用位置**: 
- `lib/services/events.ts`

---

## Fighter 轉換 (lib/utils/fighter.ts)

### `convertJsonValue()`

**功能**: 將 Prisma JsonValue 安全轉換為 `Record<string, unknown> | null`

**參數**:
- `value`: `Prisma.JsonValue | null | undefined`

**返回值**: `Record<string, unknown> | null`

**使用範例**:
```typescript
import { convertJsonValue } from "@/lib/utils/fighter";

const jsonData = { name: "John", age: 30 };
const converted = convertJsonValue(jsonData);
```

**注意事項**:
- 處理對象、數組、字串等多種格式
- 數組時返回第一個元素（如果是對象）

**使用位置**: 
- `toFighterPublic()` 內部
- `toFighterWithEvents()` 內部

---

### `toFighterPublic()`

**功能**: 將 Prisma Fighter 轉換為 `FighterPublic` 類型

**參數**:
- `fighter`: Prisma Fighter 對象

**返回值**: `FighterPublic`

**使用範例**:
```typescript
import { toFighterPublic } from "@/lib/utils/fighter";

const fighter = await prisma.fighter.findUnique({ where: { id } });
const publicFighter = toFighterPublic(fighter);
```

**使用位置**: 
- `lib/services/fighters.ts`

---

### `toFighterWithEvents()`

**功能**: 將帶關聯的 Prisma Fighter 轉換為 `FighterWithEvents` 類型

**參數**:
- `fighter`: Prisma Fighter（含 `eventsAsFighter` 關聯）

**返回值**: `FighterWithEvents`

**使用範例**:
```typescript
import { toFighterWithEvents } from "@/lib/utils/fighter";

const fighter = await prisma.fighter.findUnique({
  where: { slug },
  include: { eventsAsFighter: { include: { event: true, opponent: true } } }
});
const fighterWithEvents = toFighterWithEvents(fighter);
```

**使用位置**: 
- `lib/services/fighters.ts`
- `app/fighter/[slug]/page.tsx`

---

## 對戰卡解析 (lib/utils/fight-card-parser.ts)

### `parseFightCard()`

**功能**: 解析對戰卡文字為結構化數據

**參數**:
- `fightCardText`: `string` - 對戰卡文字

**返回值**: `ParsedFight[]` - 解析後的對戰列表

**使用範例**:
```typescript
import { parseFightCard } from "@/lib/utils/fight-card-parser";

const text = "Lightweight \tArman Tsarukyan \tvs. \tDan Hooker";
const fights = parseFightCard(text);
// [{ weightClass: "Lightweight", fighter1: "Arman Tsarukyan", fighter2: "Dan Hooker" }]
```

**使用位置**: 
- `lib/services/events.ts`
- `components/events/event-fight-card.tsx`

---

### `ParsedFight` Interface

**定義**:
```typescript
interface ParsedFight {
  weightClass: string;
  fighter1: string;
  fighter2: string;
  method?: string;
  round?: string;
  time?: string;
  notes?: string;
}
```

---

## 賽事匹配 (lib/utils/event-matcher.ts)

### `normalizeEventName()`

**功能**: 標準化賽事名稱以便比較

**參數**:
- `name`: `string` - 賽事名稱

**返回值**: `string` - 標準化後的名稱

**使用範例**:
```typescript
import { normalizeEventName } from "@/lib/utils/event-matcher";

normalizeEventName("UFC 300: Main Event"); // "ufc 300 main event"
```

**使用位置**: 
- `calculateNameSimilarity()` 內部
- `findMatchingEvent()` 內部

---

### `calculateNameSimilarity()`

**功能**: 計算兩個名稱的相似度分數（0-1）

**參數**:
- `name1`: `string` - 第一個名稱
- `name2`: `string` - 第二個名稱

**返回值**: `number` - 相似度分數（0-1，1 表示完全相同）

**使用範例**:
```typescript
import { calculateNameSimilarity } from "@/lib/utils/event-matcher";

calculateNameSimilarity("UFC 300", "UFC 300"); // 1.0
calculateNameSimilarity("UFC 300", "UFC 301"); // ~0.85
```

**使用位置**: 
- `findMatchingEvent()` 內部

---

### `isDateWithinRange()`

**功能**: 檢查兩個日期是否在容差範圍內

**參數**:
- `date1`: `Date` - 第一個日期
- `date2`: `Date` - 第二個日期
- `toleranceDays`: `number` - 容差天數（預設：1）

**返回值**: `boolean` - 是否在範圍內

**使用範例**:
```typescript
import { isDateWithinRange } from "@/lib/utils/event-matcher";

const date1 = new Date("2025-01-21");
const date2 = new Date("2025-01-22");
isDateWithinRange(date1, date2, 1); // true
```

**使用位置**: 
- `findMatchingEvent()` 內部

---

### `findMatchingEvent()`

**功能**: 使用模糊匹配查找匹配的賽事

**參數**:
- `unifiedEvent`: `UnifiedEventData` - 外部 API 賽事數據
- `candidateEvents`: `Event[]` - 候選賽事列表
- `minSimilarity`: `number` - 最小相似度閾值（預設：0.8）

**返回值**: `EventMatchResult | null` - 匹配結果或 null

**使用範例**:
```typescript
import { findMatchingEvent } from "@/lib/utils/event-matcher";

const match = findMatchingEvent(externalEvent, candidateEvents, 0.8);
if (match) {
  console.log(`Found match: ${match.event.name}, similarity: ${match.similarityScore}`);
}
```

**使用位置**: 
- `lib/services/events.ts`

---

### `EventMatchResult` Interface

**定義**:
```typescript
interface EventMatchResult {
  event: Event;
  similarityScore: number;
  matchType: "exact" | "fuzzy";
}
```

---

## 管理員工具 (lib/utils/admin.ts)

### `transformAdminUserListItem()`

**功能**: 將 Prisma User（含 Profile）轉換為 `AdminUserListItem` 扁平結構

**參數**:
- `user`: Prisma User with Profile（來自 `getAllUsers` 查詢）

**返回值**: `AdminUserListItem`

**使用範例**:
```typescript
import { transformAdminUserListItem } from "@/lib/utils/admin";

const user = await prisma.user.findUnique({
  where: { id },
  include: { profile: true, _count: { select: { posts: true, comments: true } } }
});
const adminUser = transformAdminUserListItem(user);
```

**注意事項**:
- 處理 `profile` 為 `null` 的情況，使用 `userId` 作為 `name` 預設值
- 確保所有欄位都有預設值，符合類型定義

**使用位置**: 
- `lib/services/users.ts` (`getAllUsers`)

---

## 函數統計 / Function Statistics

- **總函數數**: 18
- **通用工具**: 2
- **Slug 生成**: 4
- **ID 生成**: 3
- **Fighter 轉換**: 3
- **對戰卡解析**: 1
- **賽事匹配**: 4
- **管理員工具**: 1

---

## 更新記錄 / Update Log

- **2025-01-21**: 創建初始文檔，記錄所有工具函數
- **2025-01-21**: 添加 `transformAdminUserListItem` 函數文檔

