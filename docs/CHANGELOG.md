# 開發日誌 / Development Log

## 2025-12-08

### fix/deploy-prerender-errors ★★★☆☆

修復 Next.js 16 部署時的 prerender 錯誤

- 修復 `lib/auth.ts` 中的 `getSession()` 函數，添加 try-catch 處理 build 時 prerender 期間 `cookies()` 被拒絕的錯誤
- 修復 `app/layout.tsx` 中的 AppSideBar，將其包裝在 Suspense 中以符合 Next.js 16 Cache Components 模式
- 新建 SidebarLoading 組件作為 AppSideBar 的 loading fallback

## 2025-11-24

### feat/loading-components-and-suspense-fallback ★★☆☆☆

為所有 Suspense 邊界提供適當的 loading 動畫組件

- 新建通用 Loading 組件（spinner、skeleton、inline、fullscreen）
- 新建 NavbarLoading 和 FilterLoading 專用組件
- 更新所有 Suspense fallback 使用新組件

### fix/build-prerender-errors ★★☆☆☆

修復 Vercel build 時的 prerender 錯誤

- API 路由添加 `dynamic = 'force-dynamic'`（管理員 API）
- Navbar 使用 Suspense 包裹，符合 Next.js 16 PPR 最佳實踐

### fix/nextjs-16-cachecomponents-dynamic-conflict ★★☆☆☆

修復 Next.js 16 cacheComponents 配置衝突

- 移除不必要的 `dynamic = 'force-dynamic'` 配置
- 利用 `cookies()` 自動動態化特性

## 2025-01-23

### fix/typescript-type-safety-improvements ★★★☆☆

修復多個 TypeScript 類型錯誤

- 修復 `transformUser` 函數類型不匹配
- 修復 `event-matcher.ts` 和 `fighter.ts` 中的類型錯誤
- 使用類型斷言解決 Prisma 與應用類型差異

## 2025-11-23

### fix/fight-page-typescript-null-safety ★☆☆☆☆

修復 Fight Page 中的 null 安全問題

- 正確處理 `opponent_id` 和 `opponentStats` 可能為 null 的情況

### feat/fight-bidirectional-query-improvement ★★★★☆

統一 Fight 創建邏輯為雙向記錄，改進查詢邏輯

- 創建統一查詢函數，使用 OR 條件查詢 `fighter_id` 和 `opponent_id`
- 正確處理雙向對戰結果（當選手是 opponent 時反轉結果）
- 優化快取標籤策略，確保數據一致性

## 2025-01-22

### feat/fight-page-and-fighter-hover-card ★★★★☆

實作 Fight Page 和 Fighter Profile Hover Card

- 新建 Fight Page 顯示對戰詳情、賠率、選手資料
- 新建 Fighter Profile Hover Card 組件
- 新建 Fights Service 和相關 API 路由
- 更新 FightBettingCard 添加連結和 Avatar

### fix/admin-cache-revalidation-nextjs16 ★★★☆☆

全面修復管理員操作後的快取更新邏輯

- 確保所有 `revalidateTag` 使用 `(tagName, 'max')` 格式
- 修復 settleEvent、結算對戰、創建分類等操作的快取更新

## 2025-11-21

### feat/navbar-sidebar-restructure ★★★☆☆

重構導覽列 UI 架構

- 左側：AppSideBar（從左側滑出的 Sheet）
- 右側：UserMenuSheet（用戶 Avatar 選單）
- 使用 shadcn/ui Sheet 組件，預留擴展框架

### feat/admin-event-list-and-ui-improvements ★★★★☆

改進 Event Tab UI，添加賽事列表顯示

- 新建 EventList 組件（Table 格式，使用 Pagination）
- EventCreateForm 使用 Collapsible 可摺疊
- 新增 `formatAdminDate()` 共用函數，減少代碼重複
- 優化效能：初始載入最近 10 場，使用快取

### feat/admin-page-restructure ★★★☆☆

改造 Admin Page 為三個管理區塊

- 討論區管理（Category、Post）
- 用戶管理（User、Profile）
- 資料管理（Events、Fighters）

### fix/admin-user-charat-error ★★★☆☆

修復 Admin User tabs 的 charAt 錯誤

- 新增 `transformAdminUserListItem()` 轉換函數
- 添加 null safety 檢查
- 優化快取機制和錯誤處理

### docs/utils-documentation ★★★☆☆

建立完整的工具函數文檔

- `docs/utils/UTILITY_FUNCTIONS.md` - 18 個函數詳細說明
- `docs/utils/USAGE_TRACKING.md` - 使用位置追蹤

## 2025-01-21

### fix/event-creation-error-and-type-sync ★★★★☆

修復 Event 創建錯誤與類型不匹配

- 更新類型定義與 Prisma schema 一致
- 批量驗證 Fighter ID，避免 N+1 查詢
- 改進 API 錯誤處理（Prisma 錯誤代碼映射）

### docs/types-documentation ★★★☆☆

建立完整的類型系統文檔

- `docs/types/DATABASE_SCHEMA.md` - 13 個資料表結構
- `docs/types/TYPESCRIPT_TYPES.md` - 50+ 個類型定義
- `docs/types/TYPE_USAGE_TRACKING.md` - 類型使用追蹤

### feat/admin-fighter-create-form ★★★☆☆

實作管理員創建選手功能

- POST /api/fighters API
- FighterCreateForm 組件（自動 slug 生成）
- 支援表單驗證和審計日誌記錄

## 2025-01-20

### feat/betting-system-enhancement ★★★★★

實作完整的投注系統功能

- **投注交易**：最小 50，每次 10 單位，Transaction 保證
- **賠率顯示**：即時更新快取（5 秒 revalidate）
- **管理員賽果輸入**：手動輸入賽果並觸發結算
- **結算邏輯**：驗算機制確保彩金計算正確
- **審計日誌**：記錄所有管理員操作
- **回溯功能**：單筆和批量回溯
- 使用 `decimal.js` 確保金融級精度

## 2025-11-20

### refactor/prisma-7-upgrade ★★★★☆

將 Prisma 從 6.19.0 升級到 7.0.0

- 採用 adapter 模式連接資料庫
- 更新 schema.prisma 移除 `url` 屬性
- 更新所有 PrismaClient 實例化使用 adapter
- 更新 Decimal 導入路徑（`decimal.js`）

### feat/timestamp-based-id-format ★★★☆☆

將 Post、Comment、Event 的 ID 格式改為時間戳格式

- 格式：`YYYYMMDDHHmmss` + 4 位隨機數（共 18 位）
- 保留現有 UUID 記錄，僅新記錄使用新格式
- 新建 ID 生成工具函數，確保唯一性

### refactor/fighter-page-database-only ★★★☆☆

重構 fighter/[slug] 頁面，移除外部 API 調用

- 改為僅從內部資料庫查詢
- 統一類型定義，使用 FighterPublic 和 FighterWithEvents

### feat/fighter-pages ★★★★☆

實作選手頁面功能

- 新增 Fighter 和 FighterEvent 模型
- 新建 API 適配器、服務層、前端組件
- 支援從賽事頁面點擊選手名字連結到選手頁

### feat/fighter-on-demand-sync ★★★☆☆

實作選手資料的 on-demand 同步機制

- 查詢不到時自動從 slug 推測名字並搜尋 API
- 找到匹配後自動建立資料庫記錄
- 最小代碼改動、最高效的解決方案

### feat/api-data-ingest + data-abstraction ★★★★☆

實作賽事數據串接系統與數據抽象化層

- 透過 TheSportsDB API v2 自動同步本週格鬥賽事
- 增量更新策略、快取優化
- 統一數據格式設計，確保未來擴展性
- Vercel Cron Jobs 每天自動同步

## 2025-11-19

### feat/category-system ★★★☆☆

實作 Category 分類系統

- displayOrder 排序功能
- 軟刪除策略
- 管理員 CRUD 功能
- 預設 seed 資料（5 個分類）

### feat/user-profile-separation ★★★★★

實作用戶 Profile 分離系統

- 將登錄資訊與個人資料完全分離
- 簡化註冊流程（僅 userId、email、password）
- Profile 軟刪除機制
- 欄位可見性控制（public/friends/private）
- 新增擴展欄位（height、weight、description、record 等）

### refactor/type-optimization ★★☆☆☆

優化類型定義和用戶資料轉換邏輯

- 統一處理 `undefined` 轉 `null`
- 新增共享的 `transformUser()` 函數
- 減少代碼重複

## 2025-11-18

### refactor/post-soft-delete ★★★☆☆

實作文章軟刪除機制

- 添加 `deletedAt` 欄位
- 查詢時過濾已刪除文章（管理員可查看）
- 直接訪問時顯示佔位符

### refactor/comment-soft-delete ★★★☆☆

實作評論軟刪除機制

- 添加 `deletedAt` 欄位
- 保留評論樹結構完整性
- 顯示「此評論已被刪除」佔位符

### refactor/post-page-server-component ★★★★☆

將 Post 頁面轉換為伺服器組件

- 解決回覆評論後無法獲取最新評論的問題
- 利用 Next.js 16 自動快取更新機制
- 提升性能和 SEO

### fix/home-page-cache-after-comment ★★☆☆☆

修復首頁快取未更新問題

- 評論 API 添加 `revalidateTag("posts")` 和 `revalidatePath("/")`
- 確保首頁顯示最新的評論數據

## 2025-11-16

### refactor/unify-user-data-types ★★★☆☆

統一使用者資料類型系統

- 將 8 種不同格式合併為 3 個核心類型
- 創建統一的 Select 常數
- 確保所有查詢返回完整統計資訊

### feat/top-page-timeline ★☆☆☆☆

在首頁添加垂直滾動進度指示器

- 使用 Motion 的 `useScroll()` 和 `scaleY` 動畫
- GPU 加速，不影響版面

### feat/isr-hot-posts ★★★☆☆

使用 Next.js 16 ISR 優化首頁熱門貼文列表

- 熱度算法：綜合分數 = (likes × 2) + (comments × 1.5) + (views × 0.1) + 時間衰減
- 使用 `unstable_cache` 和 cache tags
- 所有相關操作後自動更新快取
