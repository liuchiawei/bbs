# 工具函數文檔 / Utility Functions Documentation

本目錄包含專案中所有工具函數的文檔，供開發者查找和使用。

## 目錄結構 / Directory Structure

```text
docs/utils/
├── README.md              # 本文檔
├── UTILITY_FUNCTIONS.md   # 工具函數詳細說明
└── USAGE_TRACKING.md      # 工具函數使用位置追蹤
```

## 文檔說明 / Documentation Overview

### UTILITY_FUNCTIONS.md

**內容**:

- `lib/utils.ts` 中定義的所有通用工具函數
- `lib/utils/` 目錄下各模組的工具函數
- 每個函數的功能說明、參數、返回值
- 使用範例和注意事項
- 函數分類和索引

**用途**:

- 了解可用的工具函數
- 查找特定功能的實現
- 學習函數的正確使用方法
- 避免重複實現相同功能

**適用對象**:

- 前端開發者
- 後端開發者
- 全端開發者

---

### USAGE_TRACKING.md

**內容**:

- 每個工具函數的使用位置追蹤
- 按函數分組，列出所有使用該函數的文件
- 使用頻率統計
- 重構建議

**用途**:

- 查找函數的使用位置
- 評估函數的重要性
- 規劃函數重構
- 確保函數變更時更新所有使用位置

**適用對象**:

- 架構設計師
- 代碼審查者
- 重構開發者

---

## 使用指南 / Usage Guide

### 查找工具函數

1. **在 UTILITY_FUNCTIONS.md 中查找函數定義**

   - 按分類查找（通用工具、Slug 生成、ID 生成等）
   - 使用 Ctrl+F 搜尋函數名稱
   - 查看函數說明和使用範例

2. **使用 grep 搜尋**

   ```bash
   # 搜尋函數名稱
   grep -r "functionName" --include="*.ts" --include="*.tsx"

   # 搜尋 import 語句
   grep -r "from.*utils" --include="*.ts" --include="*.tsx"
   ```

3. **檢查使用位置**
   - 在 `USAGE_TRACKING.md` 中查找函數名稱
   - 查看所有使用該函數的文件列表

---

### 添加新工具函數時

1. **在對應的 `lib/utils/` 文件中定義函數**

   ```typescript
   /**
    * Function description
    * 函數說明
    */
   export function newUtilityFunction(param: string): string {
     // Implementation
   }
   ```

2. **更新 `UTILITY_FUNCTIONS.md`**

   - 添加函數定義
   - 記錄參數、返回值、使用範例
   - 添加到對應的分類中

3. **更新 `USAGE_TRACKING.md`**（首次使用時）

   - 記錄函數的使用位置
   - 更新使用統計

4. **更新 `CHANGELOG.md`**
   - 記錄新增的工具函數
   - 說明用途和影響範圍

---

## 工具函數分類 / Function Categories

### 通用工具 (lib/utils.ts)

- `transformUser()` - 用戶資料結構轉換
- `cn()` - CSS 類名合併

### Slug 生成 (lib/utils/slug.ts)

- `normalizeFighterName()` - 標準化選手名字
- `generateSlug()` - 生成 URL 友好的 slug
- `generateUniqueSlug()` - 生成唯一 slug
- `slugToPossibleNames()` - 從 slug 推測名字

### ID 生成 (lib/utils/id-generator.ts)

- `generatePostId()` - 生成 Post ID
- `generateCommentId()` - 生成 Comment ID
- `generateEventId()` - 生成 Event ID

### Fighter 轉換 (lib/utils/fighter.ts)

- `convertJsonValue()` - JsonValue 類型轉換
- `toFighterPublic()` - 轉換為 FighterPublic
- `toFighterWithEvents()` - 轉換為 FighterWithEvents

### 對戰卡解析 (lib/utils/fight-card-parser.ts)

- `parseFightCard()` - 解析對戰卡文字

### 賽事匹配 (lib/utils/event-matcher.ts)

- `normalizeEventName()` - 標準化賽事名稱
- `calculateNameSimilarity()` - 計算名稱相似度
- `isDateWithinRange()` - 檢查日期範圍
- `findMatchingEvent()` - 查找匹配的賽事

### 管理員工具 (lib/utils/admin.ts)

- `transformAdminUserListItem()` - 轉換管理員用戶列表項

---

## 常見問題 / FAQ

### Q: 如何選擇合適的工具函數？

A:

1. 查看 `UTILITY_FUNCTIONS.md` 中的函數分類
2. 閱讀函數說明和範例
3. 檢查 `USAGE_TRACKING.md` 查看類似使用場景
4. 確認函數是否符合需求

### Q: 如何確保工具函數的類型安全？

A:

1. 所有工具函數都使用 TypeScript 定義
2. 函數參數和返回值都有明確的類型定義
3. 使用前檢查函數的類型簽名
4. 參考 `UTILITY_FUNCTIONS.md` 中的類型說明

### Q: 工具函數變更時需要更新哪些文件？

A:

1. 函數定義文件（`lib/utils/` 或 `lib/utils.ts`）
2. `docs/utils/UTILITY_FUNCTIONS.md` - 更新函數說明
3. `docs/utils/USAGE_TRACKING.md` - 更新使用位置（如有變更）
4. 所有使用該函數的文件（使用 TypeScript 編譯器檢查）
5. `docs/CHANGELOG.md` - 記錄變更

### Q: 如何添加新的工具函數分類？

A:

1. 在 `lib/utils/` 目錄下創建新的模組文件
2. 在 `UTILITY_FUNCTIONS.md` 中添加新的分類章節
3. 更新 `README.md` 中的分類列表
4. 記錄在 `CHANGELOG.md` 中

---

## 相關資源 / Related Resources

- [TypeScript 官方文檔](https://www.typescriptlang.org/docs)
- [Next.js 官方文檔](https://nextjs.org/docs)
- [Prisma 官方文檔](https://www.prisma.io/docs)

---

## 維護者 / Maintainers

本文檔由開發團隊維護，如有問題或建議，請聯繫開發團隊。

---

## 更新記錄 / Update Log

- **2025-01-21**: 創建初始文檔，記錄所有工具函數
- **2025-01-21**: 添加工具函數使用位置追蹤

