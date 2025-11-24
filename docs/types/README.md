# 類型系統文檔 / Type System Documentation

本目錄包含專案中所有類型定義的文檔，供未來更改資料庫格式時參考。

## 目錄結構 / Directory Structure

```text
docs/types/
├── README.md              # 本文檔
├── DATABASE_SCHEMA.md     # 資料庫結構文檔
└── TYPESCRIPT_TYPES.md    # TypeScript 類型定義文檔
```

## 文檔說明 / Documentation Overview

### DATABASE_SCHEMA.md

**內容**:

- Prisma schema 中定義的所有資料表結構
- 每個表的字段說明、類型、預設值
- 表之間的關聯關係
- 索引優化說明
- 重要變更記錄

**用途**:

- 了解資料庫結構
- 規劃資料庫變更
- 優化查詢效能
- 理解表之間的關係

**適用對象**:

- 後端開發者
- 資料庫管理員
- 架構設計師

---

### TYPESCRIPT_TYPES.md

**內容**:

- [`lib/types.ts`](lib/types.ts) 中定義的所有 TypeScript 類型
- 每個類型的定義和使用位置
- 類型之間的繼承關係
- 類型使用統計
- 類型變更記錄

**用途**:

- 了解 TypeScript 類型系統
- 查找類型的使用位置
- 規劃類型變更
- 確保類型一致性

**適用對象**:

- 前端開發者
- 後端開發者
- TypeScript 開發者

---

## 使用指南 / Usage Guide

### 更改資料庫結構時

1. **更新 Prisma Schema** (`prisma/schema.prisma`)

   - 參考 `DATABASE_SCHEMA.md` 了解現有結構
   - 記錄變更原因和影響範圍

2. **重新生成 Prisma Client**

   ```bash
   pnpm prisma generate
   ```

3. **更新 TypeScript 類型** (`lib/types.ts`)

   - 參考 `TYPESCRIPT_TYPES.md` 了解現有類型
   - 確保類型與 Prisma schema 同步

4. **更新相關文件**

   - 更新 `DATABASE_SCHEMA.md` 記錄變更
   - 更新 `TYPESCRIPT_TYPES.md` 記錄類型變更
   - 更新 `CHANGELOG.md` 記錄變更歷史

5. **檢查影響範圍**
   - 使用 `TYPESCRIPT_TYPES.md` 查找使用該類型的文件
   - 更新所有相關文件
   - 執行測試確保功能正常

---

### 查找類型使用位置

1. **在 TYPESCRIPT_TYPES.md 中查找類型定義**

   - 找到目標類型
   - 查看「使用位置」章節

2. **使用 grep 搜尋**

   ```bash
   # 搜尋類型名稱
   grep -r "TypeName" --include="*.ts" --include="*.tsx"

   # 搜尋 import 語句
   grep -r "from.*types" --include="*.ts" --include="*.tsx"
   ```

3. **檢查相關文件**
   - API 路由: `app/api/`
   - 服務層: `lib/services/`
   - 組件: `components/`

---

### 添加新類型時

1. **在 `lib/types.ts` 中定義類型**

   ```typescript
   export interface NewType {
     id: string;
     name: string;
     // ...
   }
   ```

2. **更新 `TYPESCRIPT_TYPES.md`**

   - 添加類型定義
   - 記錄使用位置
   - 記錄對應的資料庫表（如果有）

3. **更新 `DATABASE_SCHEMA.md`**（如果涉及資料庫變更）

   - 添加新表結構
   - 記錄關聯關係
   - 記錄索引優化

4. **更新 `CHANGELOG.md`**
   - 記錄變更內容
   - 記錄影響範圍

---

## 類型同步檢查清單 / Type Sync Checklist

當更改資料庫結構或類型定義時，請完成以下檢查：

### 資料庫變更

- [ ] 更新 `prisma/schema.prisma`
- [ ] 執行 `pnpm prisma generate`
- [ ] 執行 `pnpm prisma format` 確保格式正確
- [ ] 更新 `docs/types/DATABASE_SCHEMA.md`
- [ ] 記錄變更原因和影響範圍

### TypeScript 類型變更

- [ ] 更新 `lib/types.ts` 中的類型定義
- [ ] 確保類型與 Prisma schema 同步
- [ ] 更新 `docs/types/TYPESCRIPT_TYPES.md`
- [ ] 記錄類型使用位置
- [ ] 檢查所有使用該類型的文件

### 相關文件更新

- [ ] 更新 API 路由的類型定義
- [ ] 更新服務層的類型定義
- [ ] 更新前端組件的類型定義
- [ ] 更新 Zod schema（如果存在）
- [ ] 更新 `docs/CHANGELOG.md`

### 測試和驗證

- [ ] 執行 TypeScript 類型檢查
- [ ] 執行 Prisma 驗證
- [ ] 測試相關功能
- [ ] 檢查是否有 lint 錯誤

---

## 常見問題 / FAQ

### Q: 如何確保類型與資料庫同步？

A:

1. 每次更改 Prisma schema 後執行 `pnpm prisma generate`
2. 檢查 `lib/types.ts` 中的類型是否與 Prisma schema 一致
3. 使用 TypeScript 編譯器檢查類型錯誤
4. 參考 `TYPESCRIPT_TYPES.md` 確認類型使用正確

### Q: 如何查找某個類型的所有使用位置？

A:

1. 在 `TYPESCRIPT_TYPES.md` 中查找類型定義
2. 查看「使用位置」章節
3. 使用 grep 搜尋類型名稱
4. 檢查相關的 API、服務層和組件文件

### Q: 更改資料庫結構後需要更新哪些文件？

A:

1. `prisma/schema.prisma` - Prisma schema
2. `lib/types.ts` - TypeScript 類型定義
3. `docs/types/DATABASE_SCHEMA.md` - 資料庫結構文檔
4. `docs/types/TYPESCRIPT_TYPES.md` - TypeScript 類型文檔
5. `docs/CHANGELOG.md` - 變更日誌
6. 所有使用該類型的文件（API、服務層、組件）

### Q: 如何添加新的資料表？

A:

1. 在 `prisma/schema.prisma` 中定義新表
2. 執行 `pnpm prisma generate` 和 `pnpm prisma migrate dev`
3. 在 `lib/types.ts` 中定義對應的 TypeScript 類型
4. 更新 `docs/types/DATABASE_SCHEMA.md`
5. 更新 `docs/types/TYPESCRIPT_TYPES.md`
6. 更新 `docs/CHANGELOG.md`

---

## 相關資源 / Related Resources

- [Prisma 官方文檔](https://www.prisma.io/docs)
- [TypeScript 官方文檔](https://www.typescriptlang.org/docs)
- [Next.js 官方文檔](https://nextjs.org/docs)

---

## 維護者 / Maintainers

本文檔由開發團隊維護，如有問題或建議，請聯繫開發團隊。

---

## 更新記錄 / Update Log

- **2025-01-21**: 創建初始文檔，記錄 Event 結構重構
- **2025-01-21**: 添加類型使用位置追蹤
- **2025-01-21**: 添加類型同步檢查清單
- **2025-01-23**: 記錄 TypeScript 類型安全性修復，包括 `transformUser`、`event-matcher` 和 `fighter` 相關的類型修復
