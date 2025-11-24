# 開發日誌 / Development Log

## 2025-11-24

### feat/loading-components-and-suspense-fallback

**難度**: ★★☆☆☆

**描述**: 檢視整體專案，為所有 Suspense 邊界提供適當的 fallback，使用 shadcn 元件製作合適的 loading 動畫組件，提升用戶載入體驗

**問題分析**:

1. **Suspense fallback 不完善**:
   - `app/layout.tsx` 中 Navbar 的 Suspense fallback 為 `null`，載入時沒有視覺反饋
   - `app/fighter/page.tsx` 中 FighterFilters 的 fallback 為簡單的 `<div className="h-24 mb-8" />`，缺乏視覺設計
   - `app/event/page.tsx` 中 EventFilters 的 fallback 為簡單的 `<div className="h-12 mb-8" />`，缺乏視覺設計

2. **缺少可重用的 loading 組件**:
   - 專案中已有多個 `loading.tsx` 檔案，但缺少可重用的 loading 組件
   - 現有的 loading 組件主要使用 Skeleton 元件，但 Suspense fallback 沒有使用這些組件

**解決方案**:

1. **創建可重用的 Loading 組件** (`components/ui/loading.tsx`):
   - 通用 loading 組件，支援多種變體：`spinner`、`skeleton`、`inline`、`fullscreen`
   - 支援自訂大小（sm、md、lg）和樣式
   - 使用 shadcn/ui 的 `Spinner` 和 `Skeleton` 元件
   - 提供統一的 loading 顯示介面

2. **創建 Navbar Loading 組件** (`components/ui/navbar-loading.tsx`):
   - Navbar 專用 loading 組件
   - 模擬 Navbar 的結構（AppSideBar、Logo、UserMenu）
   - 使用 Skeleton 元件顯示各個部分的佔位符
   - 保持與實際 Navbar 相同的佈局和樣式

3. **創建 Filter Loading 組件** (`components/ui/filter-loading.tsx`):
   - Filter 專用 loading 組件
   - 支援兩種變體：`default` 和 `with-search`
   - 模擬 Filter 組件的結構（filter label、select buttons）
   - 使用 Skeleton 元件顯示 filter 按鈕和選單的佔位符

4. **更新 Suspense Fallback**:
   - **`app/layout.tsx`**: 將 Navbar 的 Suspense fallback 從 `null` 改為 `<NavbarLoading />`
   - **`app/fighter/page.tsx`**: 將 FighterFilters 的 Suspense fallback 改為 `<FilterLoading variant="with-search" />`
   - **`app/event/page.tsx`**: 將 EventFilters 的 Suspense fallback 改為 `<FilterLoading />`

**技術細節**:

- **shadcn/ui 元件**: 使用已安裝的 `Skeleton` 和 `Spinner` 元件
- **設計系統**: 遵循專案的設計系統（new-york style）
- **響應式設計**: 所有 loading 組件保持響應式設計
- **類型安全**: 所有組件使用 TypeScript 介面定義 props
- **組件註解**: 使用日本語註解說明組件用途

**用戶體驗改進**:

- **視覺反饋**: 所有 Suspense 邊界現在都有適當的 loading 動畫，提供清晰的視覺反饋
- **一致性**: 使用統一的 loading 組件，確保整個應用程式的 loading 體驗一致
- **專業感**: 使用 shadcn/ui 元件製作的 loading 動畫，提升整體 UI 的專業感

**主要修改文件**:

1. `components/ui/loading.tsx` - 新建通用 loading 組件
2. `components/ui/navbar-loading.tsx` - 新建 Navbar loading 組件
3. `components/ui/filter-loading.tsx` - 新建 Filter loading 組件
4. `app/layout.tsx` - 更新 Navbar Suspense fallback
5. `app/fighter/page.tsx` - 更新 FighterFilters Suspense fallback
6. `app/event/page.tsx` - 更新 EventFilters Suspense fallback

**注意事項**:

- 所有 loading 組件已通過 linter 檢查，沒有錯誤
- Loading 組件使用 shadcn/ui 元件，符合專案設計系統
- Suspense fallback 現在提供適當的視覺反饋，改善用戶體驗
- 所有組件保持響應式設計，適配不同螢幕尺寸

### fix/build-prerender-errors

**難度**: ★★☆☆☆

**描述**: 修復 Vercel build 時的 prerender 錯誤，解決 API 路由的 `cookies()` 錯誤和 AppSideBar 的 `usePathname()` 未緩存數據錯誤，優化用戶載入體驗

**問題分析**:

1. **API 路由的 `cookies()` prerender 錯誤**: 
   - 三個管理員 API 路由（`/api/admin/events`, `/api/admin/events/settlable`, `/api/admin/posts`）在 build 時被 prerender
   - 這些路由使用 `getCurrentUser()` → `getSession()` → `cookies()`，但 `cookies()` 只能在請求時使用
   - 導致 build 時出現 "During prerendering, `cookies()` rejects when the prerender is complete" 錯誤

2. **AppSideBar 的 `usePathname()` 未緩存數據錯誤**:
   - `AppSideBar` 組件在 `Navbar` 中使用，而 `Navbar` 在 `app/layout.tsx` 中被直接渲染
   - `usePathname()` 在 prerender 階段無法訪問路徑數據
   - 導致 `/category/[slug]` 頁面出現 "Uncached data was accessed outside of <Suspense>" 錯誤

**修復內容**:

1. **修復 API 路由 prerender 問題**:
   - 在三個管理員 API 路由文件中添加 `export const dynamic = 'force-dynamic'`
   - 禁用這些路由的 prerendering，確保它們只在請求時執行
   - 文件：
     - `app/api/admin/events/route.ts`
     - `app/api/admin/events/settlable/route.ts`
     - `app/api/admin/posts/route.ts`

2. **優化 AppSideBar 渲染（使用 Suspense）**:
   - 在 `app/layout.tsx` 中導入 `Suspense` from `react`
   - 用 `<Suspense fallback={null}>` 包裹 `<Navbar />` 組件
   - 符合 Next.js 16 的 Partial Prerendering (PPR) 最佳實踐
   - 允許 PPR 正確處理客戶端組件，避免 prerender 階段錯誤

**技術細節**:

- **API 路由動態渲染**: 使用 `export const dynamic = 'force-dynamic'` 明確標記需要動態渲染的路由
- **Suspense 邊界**: 在 layout 中使用 Suspense 包裹客戶端組件，允許 Next.js 16 的 PPR 正確處理
- **用戶體驗優化**: 
  - API 路由修復不影響公開頁面載入速度（這些是管理員專用 API）
  - Suspense 方案避免初始渲染閃爍，保持最佳載入性能
  - 符合 Next.js 16 最佳實踐，充分利用 PPR 功能

**主要修改文件**:

1. `app/api/admin/events/route.ts` - 添加 `export const dynamic = 'force-dynamic'`
2. `app/api/admin/events/settlable/route.ts` - 添加 `export const dynamic = 'force-dynamic'`
3. `app/api/admin/posts/route.ts` - 添加 `export const dynamic = 'force-dynamic'`
4. `app/layout.tsx` - 用 Suspense 包裹 Navbar 組件

**注意事項**:

- 所有修改通過 linter 檢查，無錯誤
- API 路由修復不影響運行時性能，僅禁用不必要的 prerendering
- Suspense 方案優於使用 `useState` + `useEffect` 延遲訪問，因為：
  - 避免初始渲染時 active 狀態不正確
  - 避免客戶端掛載後的閃爍更新
  - 符合 Next.js 16 最佳實踐，充分利用 PPR 功能
- 這些修復確保 build 過程順利完成，同時保持最佳用戶體驗

### fix/nextjs-16-cachecomponents-dynamic-conflict

**難度**: ★★☆☆☆

**描述**: 修復 Next.js 16 中 `cacheComponents` 配置與 `dynamic = 'force-dynamic'` 的衝突錯誤，移除不必要的動態路由配置，利用 `cookies()` 自動動態化特性

**問題分析**:

1. **Next.js 16 cacheComponents 衝突**:
   - `next.config.ts` 中啟用了 `cacheComponents: true`
   - 三個管理員 API 路由使用了 `export const dynamic = 'force-dynamic'`
   - Next.js 16 中，`cacheComponents: true` 與 `dynamic = 'force-dynamic'` 不兼容
   - 導致 build 時出現 "Route segment config 'dynamic' is not compatible with `nextConfig.cacheComponents`" 錯誤

2. **不必要的配置**:
   - 這些 API 路由都使用 `getCurrentUser()` → `getSession()` → `cookies()`
   - Next.js 15+ 中，使用 `cookies()` 會自動讓路由變成動態的
   - 因此不需要明確設置 `dynamic = 'force-dynamic'`

**解決方案**:

1. **移除衝突的 dynamic 配置**:
   - 從三個管理員 API 路由文件中移除 `export const dynamic = 'force-dynamic'`
   - 保留註釋說明路由會自動變成動態的（因為使用了 `cookies()`）
   - 文件：
     - `app/api/admin/events/route.ts`
     - `app/api/admin/events/settlable/route.ts`
     - `app/api/admin/posts/route.ts`

2. **添加說明註釋**:
   - 在每個文件中添加註釋，說明路由會因為 `getCurrentUser()` 內使用 `cookies()` 而自動變成動態的
   - 使用日本語和英語雙語註釋

**技術細節**:

- **自動動態化**: Next.js 15+ 中，API 路由使用 `cookies()` 會自動標記為動態路由
- **cacheComponents 兼容**: 移除 `dynamic = 'force-dynamic'` 後，路由與 `cacheComponents: true` 配置兼容
- **行為不變**: 移除配置後，路由仍然保持動態行為，因為 `cookies()` 的使用
- **建置驗證**: 建置成功完成，三個路由正確顯示為 `ƒ (Dynamic)`

**主要修改文件**:

1. `app/api/admin/events/route.ts` - 移除 `export const dynamic = 'force-dynamic'`，添加說明註釋
2. `app/api/admin/events/settlable/route.ts` - 移除 `export const dynamic = 'force-dynamic'`，添加說明註釋
3. `app/api/admin/posts/route.ts` - 移除 `export const dynamic = 'force-dynamic'`，添加說明註釋

**注意事項**:

- 所有修改通過 linter 檢查，無錯誤
- 建置成功完成，沒有 cacheComponents 衝突錯誤
- 路由行為保持不變，仍然正確地作為動態路由運行
- 此修復符合 Next.js 16 最佳實踐，充分利用框架的自動動態化特性
- 建置過程中的警告訊息是預期的，因為 Next.js 會嘗試預渲染所有路由，但這些路由會自動變成動態的

## 2025-01-23

### fix/typescript-type-safety-improvements

**難度**: ★★★☆☆

**描述**: 修復多個 TypeScript 類型錯誤，提升類型安全性和代碼健壯性，確保所有類型定義與 Prisma 查詢結果一致

**問題分析**:

1. **`transformUser` 函數類型不匹配**: `UserPublicExtended` 類型期望 `profile` 屬性始終存在（即使為 `null`），但函數在 `user.profile` 為 `null` 時未返回 `profile` 屬性
2. **`event-matcher.ts` 中 `external_id` 訪問錯誤**: `Event` 類型（基於 `EventPublic`）不包含 `external_id` 字段，但代碼嘗試訪問該字段
3. **`fighter.ts` 中多個類型錯誤**:
   - `external_data` 類型轉換問題：`convertJsonValue` 返回 `Record<string, unknown> | null`，但類型系統期望更複雜的類型
   - `fightsAsFighter` 缺少 `fighter` 屬性：根據 `fighterSelectWithEvents`，每個 fight 應該包含 `fighter` 和 `opponent` 兩個關聯對象
   - 返回對象缺少 `fightsAsOpponent` 屬性：`FighterWithEvents` 類型要求同時包含 `fightsAsFighter` 和 `fightsAsOpponent`

**修復內容**:

1. **修復 `transformUser` 函數** (`lib/utils.ts`):
   - 更新函數參數類型，包含完整的 `profile` 結構（包括 `id` 和 `userId`）
   - 確保即使 `user.profile` 為 `null` 時也返回 `profile: null`，符合 `UserPublicExtended` 類型定義
   - 當 `user.profile` 存在時，正確構建包含 `id`、`userId`、`name`、`nickname`、`avatar` 的 `profile` 對象

2. **修復 `event-matcher.ts` 中的 `external_id` 訪問** (`lib/utils/event-matcher.ts`):
   - 使用類型斷言 `(candidate as any).external_id` 訪問 `external_id` 字段
   - 添加註釋說明類型斷言的必要性（因為 `Event` 類型可能不包含 `external_id`）

3. **修復 `fighter.ts` 中的類型錯誤** (`lib/utils/fighter.ts`):
   - **`toFighterPublic`**: 為 `external_data` 添加類型斷言 `as FighterPublic["external_data"]`
   - **`toFighterWithEvents`**:
     - 為所有 `external_data` 轉換添加類型斷言
     - 在 `fightsAsFighter` 映射中添加 `fighter` 屬性（當前選手的資訊）
     - 在 `fightsAsOpponent` 映射中正確處理 `fighter` 和 `opponent` 的角色交換
     - 為返回對象添加 `fightsAsOpponent: []` 屬性（因為已合併到 `fightsAsFighter`）
     - 為 `fightsAsFighter` 添加類型斷言確保類型匹配

**技術細節**:

- **類型斷言使用**: 在必要時使用類型斷言 `as Type` 來解決 Prisma 生成的類型與應用類型之間的差異
- **Null Safety**: 確保所有可能為 `null` 的屬性都正確處理，符合類型定義
- **類型一致性**: 確保所有轉換函數返回的類型與 Prisma 生成的類型定義一致
- **向後兼容**: 所有修復不影響現有功能，僅改善類型安全性

**主要修改文件**:

1. `lib/utils.ts` - 修復 `transformUser` 函數的類型問題
2. `lib/utils/event-matcher.ts` - 修復 `external_id` 訪問問題
3. `lib/utils/fighter.ts` - 修復多個類型錯誤，添加缺失的屬性

**注意事項**:

- 所有 TypeScript 編譯錯誤已修復
- 類型斷言的使用是必要的，因為 Prisma 生成的類型與應用層類型之間存在差異
- 這些修復確保了類型安全性，但不會影響運行時行為
- 建議在未來重構時考慮統一 Prisma 生成的類型與應用層類型，減少類型斷言的使用

## 2025-11-23

### fix/fight-page-typescript-null-safety

**難度**: ★☆☆☆☆

**描述**: 修復 Fight Page 中的 TypeScript 類型錯誤，正確處理 `opponent_id` 和 `opponentStats` 可能為 `null` 的情況

**問題分析**:

1. **TypeScript 類型錯誤**: `getFighterRecentFights(fightData.opponent_id, 5)` 時，`opponent_id` 可能為 `null`，但函數參數類型為 `string`
2. **組件類型不匹配**: `preloadedStats={fightData.opponentStats}` 時，`opponentStats` 可能為 `null`，但組件期望 `undefined`

**修復內容**:

1. **修復 `opponent_id` null 檢查** (`app/fight/[id]/page.tsx`):
   - 在調用 `getFighterRecentFights` 前檢查 `opponent_id` 是否存在
   - 若為 `null`，返回空數組 `Promise.resolve([])` 而非調用函數
   - 確保類型安全，避免運行時錯誤

2. **修復 `opponentStats` null 轉換** (`app/fight/[id]/page.tsx`):
   - 將 `null` 轉換為 `undefined`：`preloadedStats={fightData.opponentStats || undefined}`
   - 符合組件期望的可選類型定義

**技術細節**:

- **Null Safety**: 使用條件檢查和 `|| undefined` 運算符確保類型安全
- **向後兼容**: 修復不影響現有功能，僅改善類型安全性
- **錯誤處理**: 當 `opponent_id` 為 `null` 時優雅降級，返回空數組

**主要修改文件**:

1. `app/fight/[id]/page.tsx` - 修復 TypeScript 類型錯誤

**注意事項**:

- 所有類型錯誤已修復，通過 linter 檢查
- 單人賽事（無 opponent）時正確處理，不會導致錯誤

### feat/fight-bidirectional-query-improvement

**難度**: ★★★★☆

**描述**: 統一Fight創建邏輯為雙向記錄，並改進查詢邏輯以包含fighter_id和opponent_id兩側的對戰，確保Fighter Page和Fight Page能完整顯示所有相關對戰記錄。同時優化型態定義統一性、快取策略和統計計算準確性。

**問題分析**:

1. **創建邏輯不一致**: `app/api/fights/route.ts`創建雙向記錄，但`lib/services/events.ts`和`lib/services/fighter-events.ts`只創建單向記錄
2. **查詢不完整**: 所有查詢只查`fighter_id`，忽略`opponent_id`，導致選手作為對手時的對戰不出現在歷史記錄中
3. **統計不準確**: `calculateFighterStats`只計算`fighter_id`的記錄，遺漏作為`opponent_id`的對戰結果
4. **型態定義需要優化**: 確保型態統一、簡潔、高效

**解決方案**:

1. **創建統一查詢函數** (`lib/services/fights.ts`):
   - 新增`getFighterAllFights()`函數，使用`OR`條件查詢`fighter_id`和`opponent_id`
   - 改進`calculateFighterStats()`使用新的統一查詢邏輯
   - 正確處理雙向對戰結果（當選手是opponent時反轉結果）
   - 更新`getFighterRecentFights()`使用雙向查詢

2. **統一創建邏輯**:
   - **`lib/services/events.ts`**: `createEventWithFights()`改為創建雙向記錄（使用`flatMap`）
   - **`lib/services/fighter-events.ts`**: `linkFighterToEvent()`在有opponent時創建雙向記錄（使用transaction確保原子性）

3. **更新查詢函數** (`lib/services/fighters.ts`):
   - `getFighterEvents()`: 使用雙向查詢（`OR`條件）
   - `getFighterFightsPaginated()`: 使用雙向查詢並正確處理角色轉換
   - `_getFighterFromDB()`: 查詢`fightsAsFighter`和`fightsAsOpponent`並合併

4. **更新工具函數** (`lib/utils/fighter.ts`):
   - `toFighterWithEvents()`: 正確合併雙向對戰，交換fighter和opponent角色，反轉結果
   - 合併時去重（基於fight id），按日期排序

5. **更新API路由**:
   - `app/api/fighters/[slug]/recent-fights/route.ts`: 使用雙向查詢並正確處理角色
   - `app/api/fighters/[slug]/fights/route.ts`: 通過調用`getFighterFightsPaginated`間接更新

6. **更新前端頁面** (`app/fighter/[slug]/page.tsx`):
   - `totalFights`計算使用雙向查詢
   - `generateMetadata`中的統計計算使用雙向查詢並正確反轉結果
   - `initialFights`直接使用`fighter.fightsAsFighter`（已由`toFighterWithEvents`合併）

7. **優化快取標籤策略**:
   - `app/api/fights/route.ts`: 創建Fight時失效相關選手的快取（`fighter-{fighterId}`和`fighter-{opponentId}`）
   - `app/api/fights/[id]/route.ts`: 更新Fight時失效相關選手的快取
   - 所有`revalidateTag`調用使用`revalidateTag(tagName, 'max')`格式（符合Next.js 16規範）

8. **更新其他查詢函數** (`lib/services/fighter-events.ts`):
   - `getFighterEventHistory()`: 使用雙向查詢

**效能優化**:

- **單一查詢**: 使用`OR`條件而非兩次查詢合併，利用現有索引（`fighter_id`和`opponent_id`都有索引）
- **快取策略**: 使用`unstable_cache`減少重複查詢，正確設置cache tags
- **批量操作**: 使用transaction確保原子性
- **型態定義優化**: 使用TypeScript的utility types減少重複定義，確保查詢結果型態統一

**技術細節**:

- **資料庫層**: 無需變更schema，現有設計已支援雙向關係（`fighter_id`和`opponent_id`都有索引）
- **查詢優化**: 使用`OR`條件查詢，利用現有索引提升效能
- **結果處理**: 當選手是opponent時，正確反轉結果（Win ↔ Loss，Draw/NC不變）
- **角色交換**: 在`toFighterWithEvents`中正確交換fighter和opponent的角色
- **快取失效**: 創建/更新Fight時同時失效相關選手的快取，確保數據一致性

**向後兼容性**:

- 資料庫schema無需變更，保持向後兼容
- 現有API響應格式保持不變
- 前端組件接口保持不變
- 僅改進內部查詢邏輯

**主要修改文件**:

1. `lib/services/fights.ts` - 創建統一查詢函數，改進統計計算
2. `lib/services/events.ts` - 統一創建邏輯為雙向記錄
3. `lib/services/fighter-events.ts` - 統一創建邏輯，更新查詢函數
4. `lib/services/fighters.ts` - 更新所有查詢函數使用雙向查詢
5. `lib/utils/fighter.ts` - 更新`toFighterWithEvents`正確處理雙向對戰
6. `app/api/fighters/[slug]/recent-fights/route.ts` - 更新API路由
7. `app/fighter/[slug]/page.tsx` - 更新前端頁面查詢邏輯
8. `app/api/fights/route.ts` - 優化快取標籤策略
9. `app/api/fights/[id]/route.ts` - 優化快取標籤策略

**注意事項**:

- 所有`revalidateTag`調用都使用`revalidateTag(tagName, 'max')`格式，符合Next.js 16規範
- 創建/更新Fight時正確失效相關選手的快取，確保雙向查詢結果正確更新
- 型態定義統一、簡潔、高效，確保所有查詢返回一致的型態結構
- 結果反轉邏輯正確處理Win/Loss轉換，Draw和NC保持不變

## 2025-01-22

### feat/fight-page-and-fighter-hover-card

**難度**: ★★★★☆

**描述**: 實作新的 Fight Page 和 Fighter Profile Hover Card 組件，優化 Event Page 設計，提升用戶體驗和資料展示完整性

**問題分析**:

1. **缺少 Fight 詳細頁面**: 用戶無法查看單一對戰的完整資訊，包括賽事資料、賠率、選手詳細資料和過往戰績
2. **Event Page 資訊不足**: FightBettingCard 中缺少 Fight Page 連結和選手 Avatar，用戶體驗不佳
3. **選手資訊展示不完整**: 在 Event Page 和 Fight Page 中，選手名字和 Avatar 缺少懸停查看詳細資料的功能

**解決方案**:

1. **新建 Fight Page** (`app/fight/[id]/page.tsx`):
   - 顯示該場 Fight 所屬 Event 資料（名稱、日期、地點）
   - 顯示該賽事賠率（兩位選手的賠率和投注池）
   - 顯示兩位對戰選手的詳細資料和過往戰績
   - 使用 shadcn 元件（Card、Badge、Avatar 等）
   - 整合 Fighter Profile Hover Card 組件
   - 支援動態 metadata 生成

2. **新建 Fights Service** (`lib/services/fights.ts`):
   - `getFightWithDetails()`: 獲取對戰完整詳情（包含 Event、Fighter、統計）
   - `getFighterRecentFights()`: 獲取選手最近對戰（支援 limit 參數）
   - `calculateFighterStats()`: 計算選手統計（勝負平總）
   - 使用 `unstable_cache` 快取機制（60秒 revalidate）
   - 優化資料庫查詢，減少 N+1 問題

3. **新建 Fighter Profile Hover Card** (`components/fighters/fighter-profile-hover-card.tsx`):
   - 使用 shadcn HoverCard 元件
   - 顯示選手頭像、名字、國籍、運動類型
   - 顯示戰績統計（勝負平總）
   - 顯示最近對戰記錄（最多3場）
   - 支援預載入資料以減少 API 呼叫
   - 支援 slug 或 ID 查詢（自動判斷 UUID 或 slug）
   - 提供連結到完整選手頁面

4. **新建 API 路由**:
   - `/api/fighters/[slug]/stats` (`app/api/fighters/[slug]/stats/route.ts`):
     - 獲取選手統計（勝負平總）
     - 支援 UUID（ID）和 slug 兩種查詢方式
   - `/api/fighters/[slug]/recent-fights` (`app/api/fighters/[slug]/recent-fights/route.ts`):
     - 獲取選手最近對戰（支援 limit 參數）
     - 支援 UUID（ID）和 slug 兩種查詢方式

5. **更新 FightBettingCard** (`components/betting/FightBettingCard.tsx`):
   - 添加 Fight Page 連結（右上角「查看詳情 / View Details」）
   - 添加參賽選手 Avatar 顯示（使用 FighterAvatar 組件）
   - 整合 Fighter Profile Hover Card（選手名字可懸停查看詳情）
   - 更新 Fighter 介面定義，添加 thumb、cutout、nationality、sport_type 欄位

6. **Event Page 整合** (`app/event/[id]/page.tsx`):
   - 導入 Fighter Profile Hover Card 組件
   - 通過 FightBettingCard 組件自動使用 Hover Card 功能

**設計特點**:

1. **資料庫操作優化**:
   - 使用 `unstable_cache` 進行快取，減少資料庫查詢
   - 預載入資料支援，避免不必要的 API 呼叫
   - 批量查詢選手統計和最近對戰

2. **響應式設計**:
   - 使用 Tailwind CSS 和 shadcn 元件，支援各種螢幕尺寸
   - Hover Card 自動調整位置（side="right", align="start"）

3. **雙語支援**:
   - 所有文字都提供繁體中文和英文
   - 符合專案整體風格

4. **優雅的 UI**:
   - 使用 shadcn 元件，符合專案整體風格
   - Hover Card 提供流暢的懸停體驗
   - Fight Page 使用清晰的卡片佈局

**效能優化**:

- **快取策略**: 使用 `unstable_cache` 快取查詢結果（60秒 revalidate）
- **預載入資料**: Hover Card 支援預載入統計和最近對戰，避免不必要的 API 呼叫
- **批量查詢**: 並行查詢兩位選手的統計和最近對戰
- **資料庫索引**: 利用現有的 fighter_id、event_id 索引優化查詢

**技術細節**:

- **shadcn/ui 組件**: 使用已安裝的 HoverCard、Card、Badge、Avatar 組件
- **類型安全**: 所有組件使用 TypeScript 介面定義 props
- **錯誤處理**: API 路由包含完善的錯誤處理
- **向後兼容**: 支援 UUID（ID）和 slug 兩種查詢方式，確保向後兼容

**主要修改文件**:

1. `app/fight/[id]/page.tsx` - 新建 Fight Page
2. `lib/services/fights.ts` - 新建 Fights Service
3. `components/fighters/fighter-profile-hover-card.tsx` - 新建 Fighter Profile Hover Card 組件
4. `app/api/fighters/[slug]/stats/route.ts` - 新建選手統計 API
5. `app/api/fighters/[slug]/recent-fights/route.ts` - 新建選手最近對戰 API
6. `components/betting/FightBettingCard.tsx` - 更新添加 Fight Page link 和 Avatar
7. `app/event/[id]/page.tsx` - 導入 Hover Card 組件

**注意事項**:

- Hover Card 支援預載入資料，建議在可能的情況下預載入統計和最近對戰以減少 API 呼叫
- API 路由支援 UUID（ID）和 slug 兩種查詢方式，自動判斷查詢類型
- 所有組件已通過 linter 檢查，沒有錯誤
- 快取策略使用 60 秒 revalidate，確保資料及時更新

## 2025-01-22

### fix/admin-cache-revalidation-nextjs16

**難度**: ★★★☆☆

**描述**: 全面檢視並修復所有管理員操作後的快取更新邏輯，確保符合 Next.js 16 規範，使用 `revalidateTag(tagName, 'max')` 語法，建立讀取快速、資料庫操作最少，同時又兼具向後包容性的現代化網頁

**問題分析**:

1. **快取更新遺漏**: 部分管理員操作後缺少完整的快取更新，導致數據不一致
2. **Next.js 16 規範**: 需要確認所有 `revalidateTag` 調用都使用新的 `'max'` 參數格式
3. **管理員操作完整性**: 需要確保所有管理員操作（創建賽事、更新對戰、結算、更改用戶 Profile 等）都有正確的快取更新

**修復內容**:

1. **修復 `app/api/events/[id]/route.ts` 中 settleEvent 調用的快取更新**:
   - 問題：調用 `settleEvent` 時缺少快取更新和 IP 地址參數
   - 修復：
     - 添加 IP 地址獲取邏輯（使用 `getClientIpAddress`）
     - 添加完整的快取更新（包括 `admin-events` 和 `admin-settlable-events`）
     - 使用 `revalidateTag(tagName, "max")` 符合 Next.js 16 規範
   - 同時修復了正常更新邏輯：
     - 修正 `winner_id` 不是 Event 模型欄位的問題，只更新 `status`
     - 添加 IP 地址到 audit log

2. **修復 `app/api/admin/fights/[id]/result/route.ts` 缺少管理員快取更新**:
   - 問題：結算對戰時缺少 `admin-events` 快取更新
   - 修復：添加 `admin-events` 快取更新

3. **修復 `app/api/fights/[id]/route.ts` 管理員更新對戰時的快取更新**:
   - 問題：管理員更新對戰資訊時缺少管理員相關快取更新
   - 修復：添加 `admin-events` 和 `admin-settlable-events` 快取更新

4. **修復 `app/api/fights/route.ts` 創建對戰時的快取更新**:
   - 問題：創建對戰時缺少管理員相關快取更新
   - 修復：添加 `admin-events` 和 `admin-settlable-events` 快取更新

5. **修復 `app/api/admin/categories/route.ts` 創建分類時的快取更新**:
   - 問題：創建分類時只更新了 `categories` 快取
   - 修復：添加 `posts` 快取更新以保持一致性

**驗證結果**:

- ✅ 所有 `revalidateTag` 調用都符合 Next.js 16 規範（使用 `"max"` 參數）
- ✅ 所有管理員操作都有完整的快取更新
- ✅ 沒有發現使用舊的單參數形式的 `revalidateTag`
- ✅ 所有修改的檔案都沒有 linter 錯誤

**快取更新策略**:

所有管理員操作現在都會正確更新以下快取：
- **賽事相關**: `event-{id}`, `event-fights-{id}`, `event-odds-{id}`, `events`
- **管理員專用**: `admin-events`, `admin-settlable-events`
- **用戶相關**: `profile-{userId}`, `user-{userId}`, `admin-users`
- **內容相關**: `posts`, `hot-posts`, `categories`, `fighters`

**技術細節**:

- **Next.js 16 規範**: 所有快取更新都使用 `revalidateTag(tagName, "max")` 語法
- **向後兼容性**: 保持與現有快取標籤的兼容性
- **效能優化**: 精確更新相關快取，減少不必要的資料庫操作
- **數據一致性**: 確保所有寫入操作後立即更新相關快取

**主要修改文件**:

1. `app/api/events/[id]/route.ts` - 修復 settleEvent 快取更新，修正 winner_id 處理邏輯，添加 IP 地址到 audit log
2. `app/api/admin/fights/[id]/result/route.ts` - 添加 admin-events 快取更新
3. `app/api/fights/[id]/route.ts` - 添加管理員相關快取更新
4. `app/api/fights/route.ts` - 添加管理員相關快取更新
5. `app/api/admin/categories/route.ts` - 添加 posts 快取更新

**注意事項**:

- 所有快取更新都使用 `revalidateTag(tagName, "max")`，符合 Next.js 16 規範
- 確保讀取快速、資料庫操作最少，同時又兼具向後包容性
- 管理員操作後立即更新相關快取，確保數據一致性

## 2025-11-21

### feat/navbar-sidebar-restructure

**難度**: ★★★☆☆

**描述**: 重構導覽列 UI 架構，將左側 Search 圖標替換為 AppSideBar（從左側滑出的 Sheet），右側 Menu 圖標替換為用戶 Avatar，點擊後顯示用戶選單 Sheet（管理員會顯示管理頁連結）。使用 shadcn/ui 的 Sheet 組件實作，預留擴展框架。

**問題分析**:

1. **導覽列功能分散**: 左側只有 Search 圖標，右側 Menu Sheet 內容混雜，缺乏清晰的導航結構
2. **用戶體驗不佳**: Menu Sheet 同時包含導航和用戶功能，組織不夠清晰
3. **管理員功能不明顯**: 管理員頁面連結隱藏在 Menu Sheet 中，不夠直觀
4. **缺乏擴展性**: 現有結構難以添加新的導航項目和功能

**解決方案**:

1. **AppSideBar 組件** (`components/layout/app-sidebar.tsx`) - 新建:
   - 使用 Sheet 組件，設定 `side="left"` 從左側滑出
   - Trigger 使用 PanelLeft 圖標（lucide-react）
   - SheetContent 包含：
     - SheetHeader：顯示 APP_NAME
     - 導航連結列表：
       - 首頁 (/)
       - 賽事 (/events)
       - 選手 (/fighter) - 預留連結，未來可改為列表頁
       - 分類 (/category) - 預留連結，未來可改為列表頁
       - 搜尋 (/search) - 保留搜尋功能
     - 使用 Separator 分隔區塊
     - 預留「其他功能」區塊註解，方便未來擴展
   - 使用 `usePathname` 判斷當前頁面並高亮顯示（`isActive`）
   - 響應式設計：手機版寬度調整（w-64 sm:w-80）

2. **UserMenuSheet 組件** (`components/layout/user-menu-sheet.tsx`) - 新建:
   - 使用 Sheet 組件，設定 `side="right"` 從右側滑出
   - Trigger 使用 Avatar 組件（顯示用戶頭像或 fallback）
   - SheetContent 包含：
     - SheetHeader：
       - 用戶頭像（大尺寸 h-20 w-20，居中）
       - 用戶名稱（name 或 userId）
       - 用戶 nickname（如有）
       - 管理員 Badge（僅當 `user.isAdmin === true` 時顯示）
     - 連結列表區塊：
       - 我的頁面 (/user/[userId])
       - 設定 (/settings)
       - Separator
       - 管理員頁面 (/admin) - 僅當 `user.isAdmin === true` 時顯示，使用 Shield 圖標和 primary 顏色
       - Separator
       - 登出按鈕（使用 LogOut 圖標和 destructive 顏色）
     - SheetFooter：預留空間
   - 處理未登入狀態：顯示登入/註冊按鈕（與現有邏輯一致）
   - 接收 `user`、`isLoading`、`onLogout` 作為 props

3. **Navbar 組件更新** (`components/layout/navbar.tsx`):
   - 移除左側的 Search 圖標 Button
   - 導入並使用 AppSideBar 組件（替換左側按鈕）
   - 移除右側的 Menu Sheet（現有的 Sheet 組件）
   - 導入並使用 UserMenuSheet 組件（替換右側按鈕）
   - 保留現有的用戶狀態管理邏輯（fetchUser、handleLogout）
   - 將用戶資料和登出函數作為 props 傳遞給 UserMenuSheet
   - 保留現有的 scroll 隱藏/顯示邏輯
   - 修復缺少的 `toast` 導入

4. **多語言支援** (`lib/constants.ts`):
   - 新增導航相關翻譯（四種語言：en, ja, zh-CN, zh-TW）：
     - `NAV_HOME`: "首頁" / "Home" / "ホーム" / "首页"
     - `NAV_EVENTS`: "賽事" / "Events" / "イベント" / "赛事"
     - `NAV_FIGHTERS`: "選手" / "Fighters" / "ファイター" / "选手"
     - `NAV_CATEGORIES`: "分類" / "Categories" / "カテゴリー" / "分类"
     - `NAV_SEARCH`: "搜尋" / "Search" / "検索" / "搜索"
     - `NAV_MY_PAGE`: "我的頁面" / "My Page" / "マイページ" / "我的页面"
     - `NAV_SETTINGS`: "設定" / "Settings" / "設定" / "设置"
     - `NAV_ADMIN`: "管理員" / "Admin" / "管理者" / "管理员"
     - `NAV_LOGOUT`: "登出" / "Logout" / "ログアウト" / "登出"
     - `NAV_MENU`: "選單" / "Menu" / "メニュー" / "菜单"

**UI/UX 改進**:

- **清晰的導航結構**: 左側 Sidebar 專注於頁面導航，右側 Avatar Menu 專注於用戶功能
- **視覺層次優化**: 使用圖標、Badge、Separator 等元素提升視覺層次
- **當前頁面高亮**: AppSideBar 自動判斷當前頁面並高亮顯示
- **管理員功能突出**: 管理員連結使用不同的視覺樣式（Shield 圖標、primary 顏色）
- **響應式設計**: 適配不同螢幕尺寸，手機版優化

**技術細節**:

- **shadcn/ui 組件**: 使用已安裝的 Sheet、Avatar、Button、Separator、Badge 組件
- **Next.js Hooks**: 使用 `usePathname` 判斷當前頁面
- **圖標庫**: 使用 lucide-react（PanelLeft、Home、Calendar、Users、FolderTree、Search、User、Settings、Shield、LogOut）
- **類型安全**: UserMenuSheet 使用 TypeScript 介面定義 props
- **組件分離**: 將導航和用戶功能分離為獨立組件，提高可維護性
- **預留擴展**: 在組件中添加註解區塊，標註未來可添加的功能

**預留擴展框架**:

- **AppSideBar** 中預留註解區塊：
  - 動態分類列表（從 API 獲取）
  - 收藏/書籤功能
  - 通知中心
  - 最近瀏覽的頁面
- **UserMenuSheet** 中預留註解區塊：
  - 通知中心連結
  - 訊息中心連結
  - 其他用戶功能

**相關文件**:

- `components/layout/app-sidebar.tsx` - 新建 AppSideBar 組件
- `components/layout/user-menu-sheet.tsx` - 新建 UserMenuSheet 組件
- `components/layout/navbar.tsx` - 更新 Navbar，整合新組件
- `lib/constants.ts` - 新增導航相關多語言翻譯

### feat/admin-event-list-and-ui-improvements

**難度**: ★★★★☆

**描述**: 改進 Event Tab UI 架構，添加賽事列表顯示功能，優化效能（初始載入最近10場），使用 shadcn/ui 組件（Collapsible、Pagination），重用現有模式和工具函數，減少代碼重複

**問題分析**:

1. **缺少賽事列表顯示**: Event Tab 目前只有創建、同步、結果輸入、回溯等功能，無法快速查看和管理所有賽事
2. **創建表單占用空間**: 創建表單一直展開，占用大量空間
3. **代碼重複**: PostManagement、UserManagement、ProfileManagement 中有重複的 formatDate 函數
4. **分頁功能簡單**: 現有分頁只使用簡單的 Previous/Next 按鈕

**解決方案**:

1. **類型定義擴展** (`lib/types.ts`):
   - 新增 `AdminEventListItem` 接口
   - 參考 `AdminUserListItem` 和 `AdminPostListItem` 的格式
   - 包含基本賽事資訊和統計（對戰數、投注數、文章數）

2. **管理員工具函數擴展** (`lib/utils/admin.ts`):
   - 新增 `formatAdminDate()` 共用函數
   - 統一日期格式化邏輯，支援 null/undefined 處理
   - 減少代碼重複（移除了 3 個重複的 formatDate 函數）

3. **Events Service 擴展** (`lib/services/events.ts`):
   - 新增 `getAllEvents()` 函數
   - 支援分頁（預設 limit=10，最近10場）
   - 使用 `unstable_cache` 快取（tag: `"admin-events"`, revalidate: 60秒）
   - 按 `fight_date` DESC 排序（最新的在前）

4. **管理員賽事列表 API** (`app/api/admin/events/route.ts`) - 新建:
   - GET 方法：獲取賽事列表（支援分頁）
   - 參考 `app/api/admin/users/route.ts` 的結構
   - 錯誤處理（開發環境詳細錯誤，生產環境通用錯誤）
   - 返回格式：`{ data: AdminEventListItem[], pagination: {...} }`

5. **EventList 組件** (`components/admin/event-list.tsx`) - 新建:
   - 顯示賽事列表（Table 格式，重用 PostManagement 的模式）
   - **使用 Pagination 組件**（已安裝的 shadcn/ui 組件）:
     - 完整的頁碼導航（Previous、頁碼連結、Next）
     - 當前頁高亮顯示（`isActive` prop）
     - 支援多頁時顯示省略號（`PaginationEllipsis`）
     - 響應式設計（手機版隱藏文字，只顯示圖標）
   - 顯示欄位：名稱、日期、狀態、運動類型、對戰數、投注數、操作
   - 狀態使用 Badge 顯示（不同顏色：PENDING/OPEN/CLOSED/SETTLED/CANCELLED）
   - 使用共用的 `formatAdminDate()` 函數
   - Loading 和空狀態處理

6. **EventCreateForm 改進** (`components/admin/event-create-form.tsx`):
   - **使用 Collapsible 組件**（已安裝的 shadcn/ui 組件）:
     - 預設 `open={false}`（摺疊狀態）
     - 使用 `CollapsibleTrigger` 和 `CollapsibleContent`
     - 可程式化控制展開/收起狀態
     - 內建平滑動畫過渡
     - 添加 ChevronDown 圖標指示狀態
   - 創建成功後自動摺疊並重置表單
   - 使用 Card 組件包裝，保持 UI 一致性

7. **Event Tab 結構重組** (`components/admin/admin-tabs.tsx`):
   - 添加 EventList 組件（主要內容，在上方）
   - 重新排列組件順序：列表 → 創建（摺疊）→ 同步 → 結果 → 回溯
   - 確保佈局美觀和響應式

8. **多語言支援** (`lib/constants.ts`):
   - 新增四種語言的翻譯：
     - `NO_EVENTS_FOUND`, `EVENTS`, `FIGHTS`, `BETS`
     - `DATE`, `STATUS`, `SPORT_TYPE`, `NAME`
     - `PENDING`, `OPEN`, `CLOSED`, `SETTLED`, `CANCELLED`

9. **代碼重用優化**:
   - PostManagement、UserManagement、ProfileManagement 改用 `formatAdminDate()`
   - 減少代碼重複（移除了 3 個重複的 formatDate 函數）
   - 重用 PostManagement 的分頁模式

10. **快取清除優化**:
    - 在所有相關 API 路由中添加 `revalidateTag("admin-events", "max")`:
      - `app/api/events/route.ts` (POST)
      - `app/api/admin/events/sync/route.ts`
      - `app/api/admin/events/[id]/result/route.ts`
      - `app/api/admin/events/[id]/rollback/route.ts`

**效能優化成果**:

- **初始載入快速**: 預設只載入10場賽事（limit=10）
- **快取機制**: 使用 `unstable_cache` 快取查詢結果（60秒 revalidate）
- **分頁載入**: 按需載入更多賽事，減少不必要的數據傳輸
- **代碼重用**: 統一日期格式化邏輯，減少重複代碼

**UI/UX 改進**:

- **專業分頁**: 使用 Pagination 組件提供完整的頁碼導航
- **空間優化**: 創建表單可摺疊，節省空間
- **視覺清晰**: 狀態使用 Badge 顯示，不同顏色區分
- **響應式設計**: 適配不同螢幕尺寸

**技術細節**:

- **shadcn/ui 組件**: 使用已安裝的 Collapsible 和 Pagination 組件
- **類型安全**: 新增 `AdminEventListItem` 類型，確保類型一致性
- **快取策略**: 使用 Next.js 16 的 `revalidateTag($tagNames, 'max')` 語法
- **錯誤處理**: 開發環境詳細錯誤，生產環境通用錯誤
- **代碼重用**: 重用現有模式和工具函數

**相關文件**:

- `lib/types.ts` - 新增 AdminEventListItem 類型
- `lib/utils/admin.ts` - 新增 formatAdminDate() 共用函數
- `lib/services/events.ts` - 新增 getAllEvents() 函數
- `app/api/admin/events/route.ts` - 新建管理員賽事列表 API
- `components/admin/event-list.tsx` - 新建 EventList 組件
- `components/admin/event-create-form.tsx` - 改進添加 Collapsible
- `components/admin/admin-tabs.tsx` - 更新 Event Tab 結構
- `components/admin/post-management.tsx` - 改用 formatAdminDate()
- `components/admin/user-management.tsx` - 改用 formatAdminDate()
- `components/admin/profile-management.tsx` - 改用 formatAdminDate()
- `lib/constants.ts` - 新增多語言翻譯
- `app/api/events/route.ts` - 添加 admin-events 快取清除
- `app/api/admin/events/sync/route.ts` - 添加 admin-events 快取清除
- `app/api/admin/events/[id]/result/route.ts` - 添加 admin-events 快取清除
- `app/api/admin/events/[id]/rollback/route.ts` - 添加 admin-events 快取清除

### feat/admin-page-restructure

**難度**: ★★★☆☆

**描述**: 改造 Admin Page 頁面架構與 UI，分成三個管理區塊，提升組織性和用戶體驗

**架構改進**:

1. **三個管理區塊設計**:
   - **第一區：討論區管理** (Forum Management)
     - 圖標：`MessageSquare`
     - 包含：Category、Post Tabs
     - 說明：管理分類與文章內容
   - **第二區：用戶管理** (User Management)
     - 圖標：`Users`
     - 包含：User、Profile Tabs
     - 說明：管理用戶帳號與個人資料
   - **第三區：資料管理** (Data Management)
     - 圖標：`Database`
     - 包含：Events、Fighters Tabs
     - 說明：管理賽事與選手資料

2. **UI 改進** (`components/admin/admin-tabs.tsx`):
   - 使用 Card 組件組織三個區塊，視覺更清晰
   - 每個區塊有圖標與標題
   - 每個區塊內部使用 Tabs 切換子功能
   - 響應式設計，適配不同螢幕尺寸
   - 添加雙語說明（繁體中文/英文）

3. **多語言支援** (`lib/constants.ts`):
   - 新增四種語言的常數：
     - `FORUM_MANAGEMENT`, `USER_MANAGEMENT_SECTION`, `DATA_MANAGEMENT`
     - 英文、日文、簡體中文、繁體中文

**優勢**:

- **結構清晰**: 三個區塊明確分工，易於導航
- **視覺改善**: 使用圖標和 Card 組件，提升視覺層次
- **用戶體驗**: 更直觀的組織方式，減少認知負擔
- **可擴展性**: 每個區塊獨立，易於添加新功能

**相關文件**:

- `components/admin/admin-tabs.tsx` - 重新設計為三個區塊
- `app/admin/page.tsx` - 更新描述文字
- `lib/constants.ts` - 新增三個區塊的多語言翻譯

### fix/admin-user-charat-error

**難度**: ★★★☆☆

**描述**: 修復 Admin Management Page 點擊 User tabs 時的 charAt 錯誤，優化效能並完善錯誤處理

**問題分析**:

1. **charAt 錯誤**: `user.name.charAt(0)` 時 `user.name` 可能為 `undefined` 或 `null`
2. **數據不一致**: Prisma 查詢返回的嵌套 profile 結構與前端期望的扁平結構不匹配
3. **效能問題**: 缺少快取機制，每次查詢都訪問資料庫
4. **錯誤處理**: API 路由錯誤處理不夠完善

**修復內容**:

1. **後端數據轉換** (`lib/utils/admin.ts`):
   - 新增 `transformAdminUserListItem()` 函數
   - 將嵌套的 profile 結構轉換為扁平結構
   - 處理 `profile` 為 `null` 的情況，使用 `userId` 作為 `name` 預設值

2. **Service 層優化** (`lib/services/users.ts`):
   - `getAllUsers()` 應用 `transformAdminUserListItem()` 轉換
   - 使用 `unstable_cache` 快取（tag: `"admin-users"`, revalidate: 60秒）
   - 確保返回的數據符合 `AdminUserListItem` 類型

3. **前端 Null Safety** (`components/admin/user-management.tsx`):
   - 添加 optional chaining (`?.`) 和 nullish coalescing (`??`)
   - `AvatarFallback` 使用 `user.name?.charAt(0) || user.userId?.charAt(0) || 'U'`

4. **API 錯誤處理** (`app/api/admin/users/route.ts`):
   - 添加分頁參數驗證
   - 開發環境返回詳細錯誤訊息
   - 生產環境返回通用錯誤訊息

5. **快取清除** (`app/api/admin/users/[id]/ban/route.ts`, `unban/route.ts`):
   - 添加 `revalidateTag("admin-users", "max")` 清除快取
   - 確保封禁/解封後列表即時更新

**效能優化成果**:

- **快取機制**: 使用 `unstable_cache` 減少資料庫查詢
- **數據一致性**: 統一的轉換函數確保數據格式一致
- **錯誤處理**: 多層錯誤處理機制

**技術細節**:

- **類型安全**: 確保返回數據符合 `AdminEventListItem` 類型
- **快取策略**: 使用 Next.js 16 的 `revalidateTag($tagNames, 'max')` 語法
- **Null Safety**: 前端和後端都進行 null 檢查

**相關文件**:

- `lib/utils/admin.ts` - 新增 transformAdminUserListItem() 函數
- `lib/services/users.ts` - 更新 getAllUsers() 應用轉換並添加快取
- `components/admin/user-management.tsx` - 添加 null safety 檢查
- `app/api/admin/users/route.ts` - 完善錯誤處理
- `app/api/admin/users/[id]/ban/route.ts` - 添加快取清除
- `app/api/admin/users/[id]/unban/route.ts` - 添加快取清除

### docs/utils-documentation

**難度**: ★★★☆☆

**描述**: 建立完整的工具函數文檔，記錄所有工具函數的說明和使用位置，供開發者查找和使用

**文檔結構**:

1. **`docs/utils/README.md`**:
   - 工具函數文檔的使用指南
   - 目錄結構說明
   - 使用場景和常見問題
   - 維護說明

2. **`docs/utils/UTILITY_FUNCTIONS.md`**:
   - 記錄所有工具函數的詳細說明（18 個函數）
   - 每個函數的功能、參數、返回值、使用範例
   - 函數分類和索引
   - 函數統計

3. **`docs/utils/USAGE_TRACKING.md`**:
   - 追蹤每個工具函數的使用位置
   - 按函數分組，列出所有使用該函數的文件
   - 使用頻率統計
   - 重構建議

**文檔內容**:

- **通用工具** (lib/utils.ts): 2 個函數
  - `transformUser()` - 用戶資料結構轉換
  - `cn()` - CSS 類名合併
- **Slug 生成** (lib/utils/slug.ts): 4 個函數
  - `normalizeFighterName()`, `generateSlug()`, `generateUniqueSlug()`, `slugToPossibleNames()`
- **ID 生成** (lib/utils/id-generator.ts): 3 個函數
  - `generatePostId()`, `generateCommentId()`, `generateEventId()`
- **Fighter 轉換** (lib/utils/fighter.ts): 3 個函數
  - `convertJsonValue()`, `toFighterPublic()`, `toFighterWithEvents()`
- **對戰卡解析** (lib/utils/fight-card-parser.ts): 1 個函數
  - `parseFightCard()`
- **賽事匹配** (lib/utils/event-matcher.ts): 4 個函數
  - `normalizeEventName()`, `calculateNameSimilarity()`, `isDateWithinRange()`, `findMatchingEvent()`
- **管理員工具** (lib/utils/admin.ts): 1 個函數
  - `transformAdminUserListItem()` - 轉換管理員用戶列表項

**使用場景**:

1. **查找工具函數**: 在 `UTILITY_FUNCTIONS.md` 中查找函數定義和使用範例
2. **查找使用位置**: 在 `USAGE_TRACKING.md` 中查找函數的使用位置
3. **添加新函數**: 參考文檔格式，更新相關文檔

**技術細節**:

- **文檔格式**: Markdown
- **語言**: 繁體中文（主要）和英文（註釋）
- **維護**: 每次函數變更時更新
- **同步**: 與實際代碼保持同步

**相關文件**:

- `docs/utils/README.md` - 工具函數文檔使用指南
- `docs/utils/UTILITY_FUNCTIONS.md` - 工具函數詳細說明
- `docs/utils/USAGE_TRACKING.md` - 工具函數使用位置追蹤

## 2025-01-21

### fix/event-creation-error-and-type-sync

**難度**: ★★★★☆

**描述**: 修復 Event 創建錯誤與類型不匹配問題，優化效能並完善錯誤處理機制

**問題分析**:

1. **類型定義不匹配**: `lib/types.ts` 中的 `Event` 接口與 Prisma schema 不一致，包含已移除的字段
2. **錯誤處理不完善**: Prisma 錯誤沒有被正確捕獲和處理
3. **效能問題**: Fighter ID 驗證可能導致 N+1 查詢問題
4. **Prisma Client 未同步**: 重新生成 Prisma Client 以同步 schema 變更

**修復內容**:

1. **更新類型定義** (`lib/types.ts`):
   - 移除已不存在的字段：`winner_id`, `is_manual_override`
   - 添加新字段：`promoter`, `organization`, `venue`, `location`, `description`, `poster_url`
   - 確保與 Prisma schema 完全一致

2. **優化 Service 層** (`lib/services/events.ts`):
   - **批量驗證 Fighter ID**: 一次性查詢所有需要的 Fighter，避免 N+1 查詢
   - **預先驗證 `fight_order` 唯一性**: 在 transaction 內驗證，避免資料庫約束錯誤
   - **詳細錯誤處理**: 提供清晰的錯誤信息
   - 更新註釋，移除對已不存在字段的引用

3. **改進 API 錯誤處理** (`app/api/events/route.ts`):
   - **Prisma 錯誤代碼映射**:
     - `P2002`: 唯一約束違反 → "Duplicate fight order in event"
     - `P2003`: 外鍵約束違反 → "Fighter not found"
     - `P2025`: 記錄不存在 → 具體錯誤
   - **安全性**: 開發環境返回詳細錯誤，生產環境返回通用錯誤
   - **結構化錯誤處理**: 區分 Zod、Prisma 和業務邏輯錯誤

4. **改進前端錯誤處理** (`components/admin/event-create-form.tsx`):
   - 顯示詳細錯誤信息：包括驗證錯誤的 `details` 字段
   - 處理驗證錯誤：顯示具體字段錯誤
   - 開發環境日誌：記錄完整錯誤信息到控制台

5. **修復 Prisma 查詢語法** (`app/api/admin/events/settlable/route.ts`):
   - 修復 `fight_order` 查詢語法
   - 在 `select` 中添加必要的字段
   - 重新生成 Prisma Client 以同步 schema

**效能優化成果**:

- **批量查詢**: 一次性查詢所有 Fighter，減少資料庫操作
- **預先驗證**: 在 transaction 開始前驗證所有輸入，避免不必要的資料庫操作
- **並行操作**: 使用 `Promise.all` 並行創建 FighterEvent
- **錯誤處理**: 多層錯誤處理機制，提供清晰的錯誤信息

**技術細節**:

- **Prisma Client 同步**: 執行 `pnpm prisma generate` 確保 Client 與 schema 同步
- **類型安全**: 確保 TypeScript 類型定義與 Prisma schema 完全一致
- **錯誤處理策略**: 多層驗證（前端 → Zod → Service → Prisma）
- **安全性**: 開發環境詳細錯誤，生產環境通用錯誤

**相關文件**:
- `lib/types.ts` - 類型定義更新
- `lib/services/events.ts` - Service 層優化
- `app/api/events/route.ts` - API 錯誤處理改進
- `components/admin/event-create-form.tsx` - 前端錯誤處理改進
- `app/api/admin/events/settlable/route.ts` - 查詢語法修復

### docs/types-documentation

**難度**: ★★★☆☆

**描述**: 建立完整的類型系統文檔，記錄資料庫結構和 TypeScript 類型定義，供未來更改資料庫格式時參考

**文檔結構**:

1. **`docs/types/DATABASE_SCHEMA.md`**:
   - 記錄 Prisma schema 中定義的所有資料表結構
   - 每個表的字段說明、類型、預設值
   - 表之間的關聯關係
   - 索引優化說明
   - 重要變更記錄（包含 Event 結構重構）

2. **`docs/types/TYPESCRIPT_TYPES.md`**:
   - 記錄 `lib/types.ts` 中定義的所有 TypeScript 類型
   - 每個類型的定義和使用位置
   - 類型之間的繼承關係
   - 類型使用統計
   - 類型變更記錄

3. **`docs/types/TYPE_USAGE_TRACKING.md`**:
   - 追蹤各個 TypeScript 類型在各個文件中的使用情況
   - 按類型分組，列出所有使用位置
   - 類型變更影響分析
   - 快速查找指南

4. **`docs/types/README.md`**:
   - 類型系統文檔的使用指南
   - 更改資料庫結構時的檢查清單
   - 常見問題解答
   - 維護說明

**文檔內容**:

- **資料庫表結構**: 13 個主要表的完整文檔
  - User, Profile, Follows, Category, Post, Comment, PostLike, CommentLike
  - Event, FighterEvent, Fighter, BettingLog, AuditLog
- **TypeScript 類型**: 50+ 個類型定義的完整文檔
  - Profile 相關類型（6個）
  - User 相關類型（9個）
  - Post 相關類型（5個）
  - Comment 相關類型（4個）
  - Event 相關類型（7個）
  - Fighter 相關類型（4個）
  - Betting 相關類型（4個）
  - API 相關類型（6個）
  - Admin 相關類型（2個）
- **類型使用追蹤**: 詳細記錄每個類型的使用位置
  - API 路由
  - 服務層
  - 前端組件
  - 工具函數

**使用場景**:

1. **更改資料庫結構時**:
   - 參考 `DATABASE_SCHEMA.md` 了解現有結構
   - 使用 `TYPE_USAGE_TRACKING.md` 查找需要更新的文件
   - 更新 `TYPESCRIPT_TYPES.md` 記錄類型變更

2. **查找類型使用位置時**:
   - 在 `TYPE_USAGE_TRACKING.md` 中查找類型名稱
   - 查看所有使用位置
   - 使用 grep 確認

3. **添加新類型時**:
   - 在 `lib/types.ts` 中定義類型
   - 更新 `TYPESCRIPT_TYPES.md`
   - 更新 `TYPE_USAGE_TRACKING.md`
   - 更新 `DATABASE_SCHEMA.md`（如果涉及資料庫變更）

**技術細節**:

- **文檔格式**: Markdown
- **語言**: 繁體中文（主要）和英文（註釋）
- **維護**: 每次類型變更時更新
- **同步**: 與 Prisma schema 和 TypeScript 類型定義保持同步

**相關文件**:
- `docs/types/DATABASE_SCHEMA.md` - 資料庫結構文檔
- `docs/types/TYPESCRIPT_TYPES.md` - TypeScript 類型定義文檔
- `docs/types/TYPE_USAGE_TRACKING.md` - 類型使用追蹤文檔
- `docs/types/README.md` - 類型系統文檔使用指南

## 2025-01-21

### feat/admin-fighter-create-form

**難度**: ★★★☆☆

**描述**: 實作管理員創立選手頁面，包含完整的表單組件和後端 API，遵循現有的 Prisma schema、TypeScript 類型和創建賽事頁面的樣式格式，支援自動 slug 生成、表單驗證和審計日誌記錄

**功能概述**:

實作管理員創建選手的完整功能：

1. **POST /api/fighters API**: 創建選手的後端 API 路由
2. **FighterCreateForm 組件**: 完整的前端表單組件
3. **AdminTabs 整合**: 將新表單整合到管理員界面

**API 路由更新** (`app/api/fighters/route.ts`):

- **新增 POST 方法**:
  - 驗證管理員權限（使用 `getCurrentUser()`）
  - 輸入驗證（使用 Zod schema）：
    - `name` (必填)
    - `slug` (可選，未提供時自動生成)
    - `sport_type` (可選，enum: boxing/ufc/mma/muay-thai/kickboxing)
    - `nationality`, `date_born`, `height`, `weight`, `position`, `description`, `thumb`, `cutout` (可選)
  - Slug 生成邏輯：
    - 未提供時使用 `generateUniqueSlug()` 自動生成
    - 提供時檢查唯一性（Prisma unique constraint）
  - 創建 Fighter 記錄（遵循 Prisma schema）
  - 記錄 AuditLog（使用 `createAuditLog()`，包含 adminId、actionType、description、ipAddress）
  - 更新快取（`revalidateTag("fighters")`）
  - 錯誤處理（Zod 驗證錯誤、Prisma unique constraint 錯誤）

**前端組件** (`components/admin/fighter-create-form.tsx`) - 新建:

- **表單結構**:
  - 遵循 `event-create-form.tsx` 的樣式和結構
  - 使用相同的 UI 組件：Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Label, Select, Textarea, Button
  - 響應式佈局：`grid-cols-1 md:grid-cols-2`
- **表單字段分組**:
  - **基本信息**:
    - `name` (必填，Input)
    - `slug` (可選，Input，顯示預覽，可手動編輯)
    - `sport_type` (可選，Select: boxing, ufc, mma, muay-thai, kickboxing)
    - `nationality` (可選，Input)
    - `date_born` (可選，Input type="date")
  - **身體數據**:
    - `height` (可選，Input type="number"，單位：公分/cm，placeholder: "175")
    - `weight` (可選，Input type="number"，單位：磅/lb，placeholder: "155")
    - `position` (可選，Input，placeholder: "Weight class")
  - **描述和圖片**:
    - `description` (可選，Textarea)
    - `thumb` (可選，Input type="url"，Profile thumbnail URL)
    - `cutout` (可選，Input type="url"，Cutout image URL)
- **Slug 自動生成**:
  - 使用 `useEffect` 監聽 `name` 變化
  - 當 `name` 改變且 `slug` 未被手動編輯時，自動生成 slug 預覽
  - 使用 `generateSlug()` 生成（不檢查唯一性，僅預覽）
  - 允許手動編輯 slug，編輯後不再自動更新
  - 顯示 slug 預覽：`/fighter/{slug}`
- **表單驗證**:
  - `name` 必填驗證
  - URL 格式驗證（thumb, cutout）
  - 前端驗證後再提交
- **提交處理**:
  - 顯示 loading 狀態（Loader2 icon）
  - 調用 POST /api/fighters
  - 成功後顯示 toast 通知
  - 重置表單（包括 `slugManuallyEdited` 狀態）
  - 刷新頁面（router.refresh()）
- **雙語標籤**（繁體中文/英文），與 event-create-form.tsx 保持一致

**管理員界面整合** (`components/admin/admin-tabs.tsx`):

- 添加新的 "Fighters Management" tab
- 整合 FighterCreateForm 組件
- 更新 TabsList 為 6 列佈局（grid-cols-6）
- 使用多語言翻譯（`t("FIGHTERS_MANAGEMENT")`）

**技術細節**:

- **Slug 生成邏輯**:
  - 前端預覽使用 `generateSlug()`（不檢查唯一性）
  - 後端創建時使用 `generateUniqueSlug()`（檢查唯一性）
  - 使用 `slugManuallyEdited` 狀態追蹤 slug 是否被手動編輯
- **類型定義**:
  - 使用 `lib/types.ts` 中已定義的 `Fighter` 接口
  - 表單狀態使用對應的字段類型
- **樣式一致性**:
  - 遵循 `event-create-form.tsx` 的佈局：
    - Card 容器
    - grid-cols-1 md:grid-cols-2 響應式佈局
    - 必填字段標記（紅色星號）
    - 統一的 spacing 和 typography
- **單位規範**:
  - 身高：公分(cm)，使用 number input
  - 體重：磅(lb)，使用 number input
- **審計日誌**:
  - 創建選手時自動記錄 AuditLog
  - 包含完整信息：adminId、actionType ("CREATE_FIGHTER")、description、ipAddress

**主要修改文件**:

1. `app/api/fighters/route.ts` - 添加 POST 方法
2. `components/admin/fighter-create-form.tsx` - 新建表單組件
3. `components/admin/admin-tabs.tsx` - 整合新組件

**注意事項**:

- Slug 唯一性：使用 `generateUniqueSlug()` 確保 slug 唯一
- 審計日誌完整性：所有管理員操作都必須記錄 AuditLog，包含 IP 地址
- 表單驗證：前端和後端都進行驗證，確保數據完整性
- 單位規範：身高使用公分(cm)，體重使用磅(lb)
- 快取更新：創建選手後更新 `fighters` cache tag

## 2025-01-20

### feat/betting-system-enhancement

**難度**: ★★★★★

**描述**: 實作完整的投注系統功能，包含投注交易、賠率顯示、管理員賽果輸入、結算邏輯、審計日誌和回溯功能，確保所有操作在 Transaction 中完成，並實作驗算機制確保彩金計算正確

**功能概述**:

實作 6 個核心子功能：

1. **feat/betting-transaction**: 投注交易（最小 50，每次 10 單位，Transaction 保證）
2. **feat/odds-display**: 賠率和彩池即時更新快取
3. **feat/admin-result-input**: 管理員手動輸入賽果
4. **feat/settlement-logic**: 結算邏輯與驗算
5. **feat/audit-log**: 審計日誌記錄
6. **feat/admin-rollback**: 管理員回溯功能

**類型定義更新** (`lib/types.ts`):

- 新增 `BettingOdds` 介面：
  - `totalPool`: 總彩池
  - `netPool`: 淨彩池（扣除手續費後）
  - `odds`: 各選項賠率
  - `betsByOutcome`: 各選項投注總額
- 新增 `SettleEventInput` 介面：
  - `winnerId`: 勝者 ID
  - `winMethod`: 勝利方式（可選）
  - `winRound`: 勝利回合（可選）

**驗證 Schema 更新** (`lib/validations.ts`):

- 新增 `placeBetSchema`:
  - `amount`: 最小 50，必須是 10 的倍數（使用 `z.number().refine()` 驗證）
- 新增 `settleEventSchema`:
  - `winnerId`: 必填
  - `winMethod`: 可選
  - `winRound`: 可選（正整數）

**審計日誌服務層** (`lib/services/audit.ts`) - 新建:

- `getClientIpAddress()`: 統一處理 IP 地址獲取（支援 `x-forwarded-for` 和 `x-real-ip`）
- `createAuditLog()`: 創建審計日誌條目（包含 adminId、actionType、description、ipAddress）
- `getAuditLogs()`: 獲取審計日誌（支援分頁、篩選）

**投注服務層** (`lib/services/betting.ts`) - 新建:

- `placeBet()`: 投注邏輯（Transaction 保證原子性）
  - 檢查餘額、扣除積分、創建 BettingLog、記錄 AuditLog
- `getBettingOdds()`: 獲取賠率（使用 `unstable_cache` 快取，5 秒 revalidate）
- `rollbackBet()`: 回溯單筆投注
- `rollbackEvent()`: 回溯賽事所有投注

**投注 API 更新** (`app/api/betting/route.ts`):

- **POST**: 更新投注邏輯
  - 最小投注額：50（從 10 改為 50）
  - 投注額必須是 10 的倍數
  - Transaction 中同時完成：檢查餘額、扣除積分、創建 BettingLog、記錄 AuditLog
  - 投注後更新快取：`revalidateTag("event-{eventId}")`、`revalidateTag("event-odds-{eventId}")`、`revalidateTag("events")`
  - 獲取 IP 地址並記錄 AuditLog

**賠率查詢 API** (`app/api/betting/[eventId]/odds/route.ts`) - 新建:

- **GET**: 查詢賽事賠率和彩池
  - 使用 `calculatePoolOdds()` 計算
  - 使用 `unstable_cache` 快取（tag: `"event-odds-{eventId}"`, revalidate: 5 秒）

**投注列表 API** (`app/api/betting/[eventId]/bets/route.ts`) - 新建:

- **GET**: 獲取賽事所有投注記錄
  - 用於管理員回溯面板顯示

**結算邏輯更新** (`lib/betting-system.ts`):

- `settleEvent()` 函數增強：
  - 添加 IP 地址參數
  - 添加 `winMethod` 和 `winRound` 參數支援
  - 驗證賽事狀態（必須是 OPEN 或 CLOSED）
  - 驗證 winner_id 存在於 fighter_1_id 或 fighter_2_id
  - **驗算機制**：結算後驗證 `總支出 + 手續費 = 總彩池`
    - 允許小於 0.01 的捨入誤差
    - 驗算失敗時記錄 AuditLog 並拋出錯誤
  - 改進 AuditLog 記錄（包含詳細統計資訊）
  - 使用 `createAuditLog()` 服務層而非直接操作資料庫

**管理員賽果輸入 API** (`app/api/admin/events/[id]/result/route.ts`) - 新建:

- **POST**: 輸入賽果並觸發結算
  - 驗證管理員權限
  - 驗證賽事狀態和 winner_id
  - 調用 `settleEvent()` 進行結算
  - 更新快取：`revalidateTag("event-{eventId}")`、`revalidateTag("events")`

**管理員回溯 API**:

- **單筆回溯** (`app/api/admin/betting/[betId]/rollback/route.ts`) - 新建:
  - **POST**: 回溯單筆投注
    - 驗證管理員權限
    - 驗證投注狀態（必須是 PENDING）
    - Transaction 中完成：恢復用戶積分、更新 BettingLog 狀態為 VOID、記錄 AuditLog
- **批量回溯** (`app/api/admin/events/[id]/rollback/route.ts`) - 新建:
  - **POST**: 回溯賽事所有投注
    - 驗證管理員權限
    - 驗證賽事狀態（必須是 SETTLED）
    - Transaction 中完成：
      - 遍歷所有投注，恢復用戶積分（處理 WON/LOST/PENDING 不同情況）
      - 更新所有 BettingLog 狀態為 VOID
      - 更新 Event 狀態為 OPEN（或 CLOSED，根據事件日期）
      - 記錄 AuditLog

**管理員同步 API** (`app/api/admin/events/sync/route.ts`) - 新建:

- **POST**: 管理員專用事件同步端點
  - 驗證管理員權限（不需要 secret）
  - 調用 `syncEventsFromExternalAPI()` 同步賽事
  - 更新快取

**前端組件更新**:

- **BettingCard** (`components/betting/BettingCard.tsx`):
  - 更新最小投注額顯示：從 10 改為 50
  - 更新輸入驗證：最小 50，必須是 10 的倍數
  - 添加步進按鈕（+10, -10）方便調整投注額
  - 改進錯誤處理和用戶提示
- **EventResultForm** (`components/admin/event-result-form.tsx`) - 新建:
  - 表單組件，用於輸入賽果
  - 包含：event 選擇、winner 選擇、winMethod、winRound（可選）
  - 提交後觸發結算 API
- **RollbackPanel** (`components/admin/rollback-panel.tsx`) - 新建:
  - 顯示賽事投注列表
  - 提供單筆回溯和批量回溯按鈕
  - 顯示回溯確認對話框
- **EventSyncButton** (`components/admin/event-sync-button.tsx`) - 新建:
  - 管理員手動觸發賽事同步的按鈕組件
- **AdminTabs** (`components/admin/admin-tabs.tsx`):
  - 新增 "Events Management" tab
  - 整合 EventSyncButton、EventResultForm 和 RollbackPanel

**快取策略**:

- **投注後快取更新**:
  - `revalidateTag("event-{eventId}", "max")`: 更新單一賽事快取
  - `revalidateTag("event-odds-{eventId}", "max")`: 更新賠率快取
  - `revalidateTag("events", "max")`: 更新賽事列表快取
  - `revalidatePath("/events/[id]")`: 更新賽事頁面
- **結算後快取更新**: 同上
- **回溯後快取更新**: 同上

**資料庫操作優化**:

- **Transaction 使用**:
  - 所有涉及多個資料庫操作的地方都使用 Transaction
  - 投注：檢查餘額 + 扣除積分 + 創建 BettingLog + 記錄 AuditLog
  - 結算：更新所有投注狀態 + 更新用戶積分 + 更新賽事狀態 + 記錄 AuditLog
  - 回溯：恢復積分 + 更新投注狀態 + 記錄 AuditLog

**錯誤處理**:

- **投注錯誤**:
  - 餘額不足：返回 400，錯誤訊息 "Insufficient funds"
  - 投注額不符合規則：返回 400，錯誤訊息 "Amount must be multiple of 10 and minimum 50"
  - 賽事狀態不允許投注：返回 400，錯誤訊息 "Betting is closed for this event"
- **結算錯誤**:
  - 驗算失敗：記錄 AuditLog，拋出錯誤，返回 500
  - 賽事狀態錯誤：返回 400，錯誤訊息 "Event cannot be settled"
- **回溯錯誤**:
  - 投注已結算：返回 400，錯誤訊息 "Bet has already been settled"
  - 賽事狀態錯誤：返回 400，錯誤訊息 "Event cannot be rolled back"

**技術要點**:

1. **Transaction 原子性**: 所有涉及多個資料庫操作的地方都使用 Transaction，確保數據一致性
2. **快取策略**: 所有寫入操作後立即更新相關快取，確保數據一致性
3. **驗算機制**: 結算後驗證 `總支出 + 手續費 = 總彩池`，確保計算正確性
4. **審計日誌**: 所有管理員操作都記錄 AuditLog，包含 IP 地址
5. **Decimal 精度**: 所有金額計算使用 `decimal.js` 的 `Decimal` 類型，避免浮點數誤差
6. **IP 地址獲取**: 統一處理 IP 地址獲取（`x-forwarded-for` 或 `x-real-ip`）

**主要修改文件**:

1. `lib/types.ts` - 新增 BettingOdds 和 SettleEventInput 介面
2. `lib/validations.ts` - 新增 placeBetSchema 和 settleEventSchema
3. `lib/services/audit.ts` - 新建審計日誌服務層
4. `lib/services/betting.ts` - 新建投注服務層
5. `lib/betting-system.ts` - 更新結算邏輯，添加驗算機制
6. `app/api/betting/route.ts` - 更新投注 API
7. `app/api/betting/[eventId]/odds/route.ts` - 新建賠率查詢 API
8. `app/api/betting/[eventId]/bets/route.ts` - 新建投注列表 API
9. `app/api/admin/events/[id]/result/route.ts` - 新建賽果輸入 API
10. `app/api/admin/betting/[betId]/rollback/route.ts` - 新建單筆回溯 API
11. `app/api/admin/events/[id]/rollback/route.ts` - 新建批量回溯 API
12. `app/api/admin/events/sync/route.ts` - 新建管理員同步 API
13. `components/betting/BettingCard.tsx` - 更新前端組件
14. `components/admin/event-result-form.tsx` - 新建管理員表單
15. `components/admin/rollback-panel.tsx` - 新建回溯面板
16. `components/admin/event-sync-button.tsx` - 新建同步按鈕
17. `components/admin/admin-tabs.tsx` - 更新管理員標籤頁

**注意事項**:

- IP 地址獲取：使用 `x-forwarded-for` 或 `x-real-ip` header，如果都沒有則使用 'unknown'
- Decimal 精度：所有金額計算使用 `decimal.js` 的 `Decimal` 類型，避免浮點數誤差
- 快取更新時機：所有寫入操作後立即更新相關快取，確保數據一致性
- Transaction 原子性：確保所有相關操作在同一 Transaction 中完成
- 驗算邏輯：結算後必須驗證 `總支出 + 手續費 = 總彩池`，確保計算正確
- 審計日誌完整性：所有管理員操作都必須記錄 AuditLog，包含 IP 地址
- 錯誤處理：所有錯誤都應該有明確的錯誤訊息和適當的 HTTP 狀態碼
- 向後兼容：現有的投注功能需要保持向後兼容，逐步遷移

## 2025-11-20

### refactor/prisma-7-upgrade

**難度**: ★★★★☆

**描述**: 將 Prisma 從 6.19.0 升級到 7.0.0，採用 adapter 模式連接資料庫，符合 Prisma 7.0 最新規範

**問題背景**:

- Prisma 7.0 移除了 `schema.prisma` 中 `datasource` 的 `url` 屬性
- 需要使用 adapter 模式來連接資料庫
- 需要確保所有 PrismaClient 實例化都使用新的 adapter 配置

**解決方案架構**:

- 安裝 `@prisma/adapter-pg` 和 `pg` 套件
- 更新 `schema.prisma` 移除 `url` 屬性
- 更新所有 PrismaClient 實例化使用 adapter
- 確保向後兼容性和功能正常運作

**套件升級** (`package.json`):

- `@prisma/client`: 6.19.0 → 7.0.0
- `prisma`: 6.19.0 → 7.0.0
- 新增 `@prisma/adapter-pg`: 7.0.0
- 新增 `pg`: 8.16.3
- 新增 `decimal.js`: 10.6.0（Prisma Decimal 的底層實作）
- 新增 `@types/pg`: 8.15.6（PostgreSQL 類型定義）

**Schema 更新** (`prisma/schema.prisma`):

- **datasource db**:
  - 移除 `url = env("DATABASE_URL")` 屬性（Prisma 7.0 不再支援）
  - 保留 `provider = "postgresql"`
- **generator client**:
  - 保持 `provider = "prisma-client-js"` 不變
  - 無需額外的 previewFeatures 配置

**PrismaClient 實例化更新**:

- **`lib/db.ts`**:

  - 導入 `PrismaPg` adapter 和 `Pool` from `pg`
  - 創建 PostgreSQL connection pool
  - 使用 adapter 實例化 PrismaClient
  - 保留現有的 log 配置和 global singleton 模式

- **`prisma/seed.ts`**:
  - 更新為使用 adapter 模式
  - 創建 connection pool 和 adapter
  - 確保 seed 腳本與主應用使用相同的連接方式

**配置標準寫法**:

- **schema.prisma 標準配置**:

  ```prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
    // url 屬性已移除，改為在 PrismaClient 中使用 adapter
  }
  ```

- **PrismaClient 實例化標準寫法**:

  ```typescript
  import { PrismaClient } from "@prisma/client";
  import { PrismaPg } from "@prisma/adapter-pg";
  import { Pool } from "pg";

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({
    adapter,
    log: [...],
  });
  ```

**Decimal 類型變更**:

- **問題**: Prisma 7.0 移除了 `@prisma/client/runtime/library` 路徑，導致 `Decimal` 導入失敗

  - 錯誤訊息: `Module not found: Can't resolve '@prisma/client/runtime/library'`
  - 影響檔案: `lib/betting-system.ts`, `app/api/betting/route.ts`

- **Prisma Decimal 的性質與作用**:

  - **任意精度十進位數值類型**: 用於精確處理金融、貨幣、投注等需要高精度的場景
  - **避免浮點數誤差**: JavaScript `number` 類型使用 IEEE 754 雙精度浮點數，會產生精度誤差（如 `0.1 + 0.2 = 0.30000000000000004`）
  - **資料庫映射**: 對應 PostgreSQL 的 `DECIMAL`/`NUMERIC` 類型
  - **在 Betting System 中的關鍵角色**:
    - 投注金額計算：確保金額比較與運算的精確性
    - 獎金池計算：累加所有投注金額，精確扣除 10% 手續費
    - 賠率計算：`淨獎金池 / 該選項總投注額`
    - 派彩分配：按比例精確分配給獲勝者
    - 餘額更新：精確更新用戶虛擬分數
    - **為什麼必須用 Decimal？**: 避免累積誤差導致金額錯誤，確保派彩計算公平，符合金融級精度要求

- **Prisma 7.0 移除 Decimal 的原因**:

  - **模組化與輕量化**: 將 `Decimal` 從 `@prisma/client/runtime/library` 移除，減少 Prisma Client 的依賴與體積
  - **使用底層實作**: Prisma 的 `Decimal` 實際上是基於 `decimal.js` 的包裝，直接使用 `decimal.js` 更直接、可控
  - **簡化導入路徑**: 舊路徑 `@prisma/client/runtime/library` 過於複雜，統一使用 `decimal.js` 更清晰
  - **與 Adapter 模式一致**: Prisma 7.0 引入 adapter 模式，將部分功能外置，保持核心簡潔

- **解決方案**:

  - 安裝 `decimal.js` 套件（Prisma Decimal 的底層實作，API 完全兼容）
  - 安裝 `@types/pg` 類型定義（Prisma 7.0 使用 adapter 需要 PostgreSQL 類型支援）
  - 更新導入語句：將 `import { Decimal } from "@prisma/client/runtime/library"` 改為 `import { Decimal } from "decimal.js"`

- **decimal.js 說明**:

  - JavaScript 的任意精度十進位算術庫
  - 與 Prisma Decimal API 完全兼容（`.add()`, `.sub()`, `.mul()`, `.div()`, `.gt()`, `.lt()` 等方法）
  - 提供 `.toNumber()`, `.toFixed()` 等轉換方法

- **@types/pg 說明**:
  - PostgreSQL 客戶端 `pg` 的 TypeScript 類型定義
  - Prisma 7.0 使用 `@prisma/adapter-pg` 連接 PostgreSQL，需要 `pg` 套件
  - TypeScript 需要類型定義才能正確編譯 `Pool` 等類型

**驗證與測試**:

- Schema 驗證通過 (`prisma validate`)
- Prisma Client 成功重新生成 (`prisma generate`)
- 所有 PrismaClient 實例化已更新
- Decimal 導入問題已解決，構建成功
- 備份檔案已建立（`package.json.backup`, `prisma/schema.prisma.backup`）

**注意事項**:

- **migrate 命令限制**: `prisma migrate status` 命令需要 `prisma.config.ts` 來配置 datasource URL，但根據要求不使用 `prisma.config.ts`，因此 migrate 相關命令可能需要額外配置
- **環境變數**: `DATABASE_URL` 環境變數仍然需要設定，但現在用於創建 connection pool，而非直接在 schema 中引用
- **連接池管理**: 使用 `pg` 的 `Pool` 來管理資料庫連接，提供更好的連接管理和效能

**技術考量**:

- **向後兼容性**: 所有現有的 Prisma 查詢和操作保持不變，僅改變連接方式
- **效能優化**: 使用 connection pool 可以更好地管理資料庫連接，提升效能
- **類型安全**: Prisma 7.0 保持完整的類型安全特性
- **錯誤處理**: adapter 模式提供更好的錯誤處理和連接管理

**主要修改文件**:

1. `package.json` - 升級 Prisma 版本，新增 adapter、decimal.js、@types/pg 套件
2. `prisma/schema.prisma` - 移除 datasource url 屬性
3. `lib/db.ts` - 更新 PrismaClient 實例化使用 adapter
4. `prisma/seed.ts` - 更新 seed 腳本使用 adapter
5. `lib/betting-system.ts` - 更新 Decimal 導入路徑（`@prisma/client/runtime/library` → `decimal.js`）
6. `app/api/betting/route.ts` - 更新 Decimal 導入路徑（`@prisma/client/runtime/library` → `decimal.js`）

**升級步驟總結**:

1. ✅ 檢查 Node.js 版本（v24.1.0，符合要求）
2. ✅ 備份現有配置檔案
3. ✅ 升級 Prisma 套件到 7.0.0
4. ✅ 安裝 PostgreSQL adapter 套件（`@prisma/adapter-pg`, `pg`, `@types/pg`）
5. ✅ 安裝 `decimal.js` 套件（替代 Prisma Decimal）
6. ✅ 更新 schema.prisma 配置
7. ✅ 更新所有 PrismaClient 實例化使用 adapter
8. ✅ 更新所有 Decimal 導入路徑（`decimal.js`）
9. ✅ 重新生成 Prisma Client
10. ✅ 驗證配置正確性，構建成功

## 2025-11-20

### feat/timestamp-based-id-format

**難度**: ★★★☆☆

**描述**: 將 Post、Comment、Event 的 ID 格式從隨機 UUID 改為時間戳格式（年月日時分秒 + 隨機後綴），保留現有 UUID 記錄，僅新建立的記錄使用新格式

**問題背景**:

- 原本使用 UUID 作為主鍵，無法從 ID 看出建立時間
- 需要更易讀的 ID 格式，方便識別記錄的建立時間
- 要求保留現有資料，僅新記錄使用新格式

**解決方案架構**:

- 採用混合格式策略：現有 UUID 記錄保留，新記錄使用時間戳格式
- 創建 ID 生成工具函數，確保唯一性
- 移除 Schema 中的 `@default(uuid())`，改為手動生成

**ID 格式設計** (`lib/utils/id-generator.ts`):

- **格式**: `YYYYMMDDHHmmss` + 4 位隨機數（共 18 位）
- **範例**: `202511201234561234`
- **唯一性保證**:
  - 檢查資料庫中是否已存在相同 ID
  - 若存在則重新生成（最多重試 10 次）
  - 達到最大重試次數時添加額外隨機數
- **函數**:
  - `generatePostId()`: Post 用 ID 生成
  - `generateCommentId()`: Comment 用 ID 生成
  - `generateEventId()`: Event 用 ID 生成

**資料庫架構變更** (`prisma/schema.prisma`):

- **Post 模型**:
  - 移除 `id String @id @default(uuid())`
  - 改為 `id String @id`（允許手動指定 ID）
- **Comment 模型**:
  - 移除 `id String @id @default(uuid())`
  - 改為 `id String @id`
- **Event 模型**:
  - 移除 `id String @id @default(uuid())`
  - 改為 `id String @id`
- **Migration**: 創建 `20251120192459_change_id_format` migration
  - 僅移除 `@default(uuid())`，不修改現有資料
  - 現有 UUID 記錄完全保留

**服務層更新**:

- **`lib/services/posts.ts`**:
  - `createPost()`: 在創建前調用 `generatePostId()` 生成新 ID
- **`lib/services/comments.ts`**:
  - `createComment()`: 在創建前調用 `generateCommentId()` 生成新 ID
- **`lib/services/events.ts`**:
  - `syncEventsFromExternalAPI()`: 在創建 Event 前調用 `generateEventId()` 生成新 ID

**API 路由更新**:

- **`app/api/comments/route.ts`**:
  - POST handler: 在 transaction 內生成 Comment ID
- **`app/api/events/route.ts`**:
  - POST handler: 在 transaction 內生成 Event ID

**驗證邏輯更新** (`lib/validations.ts`):

- **`createPostSchema`**:
  - 移除 `eventId` 的 `.uuid()` 驗證
  - 改為 `z.string().optional().nullable()`（允許 UUID 和新格式）
- **`updatePostSchema`**:
  - 移除 `eventId` 的 `.uuid()` 驗證
  - 改為 `z.string().optional().nullable()`

**技術考量**:

- **混合格式支援**: 系統中同時存在 UUID（舊）和時間戳格式（新）的 ID
- **向後兼容**: 所有查詢、更新、刪除功能正常運作（都是 String 類型）
- **URL 路由**: 兩種格式都支援，路由參數解析不受影響
- **外鍵關聯**: PostLike、CommentLike、BettingLog 等關聯表不受影響
- **唯一性保證**: ID 生成函數包含重試機制，確保不會產生重複 ID

**效能優化**:

- ID 生成函數使用資料庫查詢檢查唯一性
- 最多重試 10 次，避免無限循環
- 使用索引優化查詢性能（id 欄位為主鍵，自動建立索引）

**主要修改文件**:

1. `lib/utils/id-generator.ts` - 新建 ID 生成工具函數
2. `prisma/schema.prisma` - 移除 Post、Comment、Event 的 `@default(uuid())`
3. `lib/services/posts.ts` - 更新 `createPost()` 函數
4. `lib/services/comments.ts` - 更新 `createComment()` 函數
5. `app/api/comments/route.ts` - 更新 POST handler
6. `lib/services/events.ts` - 更新 `syncEventsFromExternalAPI()` 函數
7. `app/api/events/route.ts` - 更新 POST handler
8. `lib/validations.ts` - 移除 eventId 的 UUID 驗證
9. `prisma/migrations/20251120192459_change_id_format/migration.sql` - 新建 migration

**注意事項**:

- 現有 UUID 記錄完全保留，不受影響
- 新建立的 Post、Comment、Event 記錄將使用新的時間戳格式 ID
- 系統支援混合格式，兩種格式可以並存
- 所有查詢、更新、刪除功能都正常運作（因為都是 String 類型）
- Migration 不會修改現有資料，僅改變 Prisma 的預設行為

## 2025-01-XX

### refactor/fighter-page-database-only

**難度**: ★★★☆☆

**描述**: 重構 fighter/[slug] 頁面，移除外部 API 調用，改為僅從內部資料庫查詢選手資料。同時統一類型定義，使用 lib/types 中的 FighterPublic 和 FighterWithEvents 類型。

**主要變更** (`app/fighter/[slug]/page.tsx`):

- **移除外部 API 同步**:

  - `generateMetadata` 和 `FighterPage` 不再調用外部 API
  - 明確標註只從內部資料庫查詢
  - 外部 API 同步應通過後台任務或 API 端點處理

- **統一類型定義**:

  - 使用 `FighterPublic` 類型（來自 `lib/types`）替代內聯類型定義
  - 直接從 `FighterWithEvents` 提取數據，手動構建 `FighterPublic` 對象
  - 確保類型安全，修復 `undefined` 類型不匹配問題

- **數據轉換優化**:

  - 使用 `?? null` 運算符處理 `undefined` 值，確保類型兼容
  - 明確處理 `eventsAsFighter` 中的可選字段（result, method, round, time, weight_class）
  - 確保 `event.sport_type` 正確處理 `undefined` 情況

- **調試日誌增強**:
  - 添加詳細的日誌輸出，記錄查詢過程
  - 記錄 fighter 查找成功/失敗的狀態
  - 方便排查 404 問題

**服務層變更** (`lib/services/fighters.ts`):

- **`getFighterBySlug` 函數簡化**:

  - 移除 `options` 參數，不再支援 `trySync` 選項
  - 僅查詢資料庫，不進行外部 API 同步
  - 返回類型明確為 `FighterWithEvents | null`

- **類型統一**:
  - 所有函數使用 `lib/types` 中定義的類型
  - `_getFighterFromDB` 返回 `FighterWithEvents | null`
  - 使用 `toFighterWithEvents` 工具函數進行類型轉換

**工具函數** (`lib/utils/fighter.ts`):

- **新增 `toFighterWithEvents` 函數**:
  - 將 Prisma Fighter（含關聯）轉換為 `FighterWithEvents` 類型
  - 處理 `external_data` 的 JsonValue 轉換
  - 正確映射 `eventsAsFighter` 和 `opponent` 關聯

**優勢**:

1. **性能提升**: 僅查詢資料庫，無外部 API 延遲
2. **穩定性**: 不依賴外部 API 可用性
3. **類型安全**: 使用統一的類型定義，減少類型錯誤
4. **可維護性**: 清晰的數據流，易於理解和維護
5. **可預測性**: 行為更可預測，無異步外部調用

**注意事項**:

- 外部 API 同步需要通過其他方式處理（後台任務、API 端點等）
- 確保資料庫中有對應的 fighter 記錄，否則會返回 404
- 快取策略保持不變（5 分鐘快取）

## 2025-11-20

### feat/fighter-pages

**難度**: ★★★★☆

**描述**: 實作選手頁面功能，包括資料庫模型、API 適配器、服務層、前端組件和路由，支援從賽事頁面點擊選手名字連結到選手頁，顯示選手基本資料和歷史賽事成績

**資料庫架構** (`prisma/schema.prisma`):

- **新增 Fighter 模型**：

  - `id`: UUID (主鍵)
  - `slug`: String @unique - URL 友好的 slug（如 "conor-mcgregor"）
  - `name`: String - 選手全名
  - `external_id`: String? - TheSportsDB API 的 idPlayer
  - `external_source`: String? @default("thesportsdb") - 數據來源
  - `external_data`: Json? - 完整 API 回應快取
  - `sport_type`: String? - 運動類型（boxing/ufc/mma）
  - `nationality`: String? - 國籍
  - `date_born`: DateTime? - 生日
  - `height`: String? - 身高
  - `weight`: String? - 體重
  - `position`: String? - 量級
  - `description`: String? - 描述
  - `thumb`: String? - 頭像 URL
  - `cutout`: String? - 去背圖 URL
  - `last_synced_at`: DateTime? - 最後同步時間
  - 索引：
    - `@@unique([slug])` - slug 唯一性
    - `@@index([external_id, external_source])` - 快速查找外部選手
    - `@@index([sport_type])` - 依運動類型篩選

- **新增 FighterEvent 關聯表**：
  - `id`: UUID (主鍵)
  - `fighter_id`: String (FK to Fighter)
  - `event_id`: String (FK to Event)
  - `opponent_id`: String? (FK to Fighter, 對手)
  - `result`: String? - 結果（Win/Loss/Draw/NC）
  - `method`: String? - 方法（KO/TKO/Decision 等）
  - `round`: Int? - 回合數
  - `time`: String? - 時間
  - `weight_class`: String? - 量級
  - 索引：
    - `@@unique([fighter_id, event_id])` - 一個選手在一個賽事中只能出現一次
    - `@@index([fighter_id])` - 快速查找選手的賽事
    - `@@index([event_id])` - 快速查找賽事的選手
    - `@@index([opponent_id])` - 快速查找對手

**API 適配器擴展** (`lib/adapters/thesportsdb.ts`):

- **新增 TheSportsDBPlayerSchema** (Zod schema)：
  - 定義選手數據結構，包含所有 TheSportsDB API 欄位
- **新增方法**：
  - `getPlayerById(idPlayer: string)`: 透過選手 ID 查詢選手詳細資料
  - `searchPlayerByName(name: string)`: 依名字搜尋選手
  - `getPlayerEvents(idPlayer: string)`: 查詢選手歷史賽事（預留接口）
- **使用端點**：
  - `lookupplayer.php?id={idPlayer}` - 選手詳細資料
  - `searchplayers.php?p={name}` - 搜尋選手

**服務層** (`lib/services/fighters.ts`, `lib/services/fighter-events.ts`):

- **選手服務**：
  - `getFighterBySlug(slug: string)`: 依 slug 查詢選手（含快取）
  - `getOrCreateFighterByName(name: string, sportType?)`: 依名字取得或建立選手
    - 先查資料庫
    - 不存在則查詢 API
    - 建立 Fighter 記錄並生成 slug
  - `syncFighterFromAPI(fighterId: string)`: 從 API 同步選手資料
  - `getFighterEvents(fighterId: string)`: 取得選手的歷史賽事
- **選手賽事關聯服務**：
  - `linkFighterToEvent()`: 建立選手-賽事關聯
  - `linkFightToEvent()`: 將兩位選手都連結到賽事
  - `getFighterEventHistory()`: 取得選手完整賽事歷史

**工具函數** (`lib/utils/slug.ts`, `lib/utils/fight-card-parser.ts`):

- **Slug 生成**：
  - `generateSlug(name: string)`: 生成 URL 友好的 slug
  - `generateUniqueSlug(name: string, existingSlugs: string[])`: 生成唯一 slug（衝突時添加數字後綴）
  - `normalizeFighterName(name: string)`: 標準化選手名字
- **對戰卡解析**：
  - `parseFightCard(fightCardText: string)`: 解析對戰卡文字為結構化數據

**前端組件**:

- **FighterLink** (`components/fighters/fighter-link.tsx`):
  - 可重用組件，用於顯示可點擊的選手名字
  - 處理 slug 生成失敗的情況（顯示純文字）
- **FighterProfileCard** (`components/fighters/fighter-profile-card.tsx`):
  - 顯示選手基本資料：頭像、姓名、國籍、生日、身高體重、量級、描述
  - 顯示社交媒體連結（Facebook, Twitter, Instagram, YouTube）
- **FighterEventHistory** (`components/fighters/fighter-event-history.tsx`):
  - 顯示歷史賽事列表
  - 每項顯示：賽事名稱（連結）、日期、對手（連結）、結果、方法、回合、時間、量級
- **更新 EventFightCard** (`components/events/event-fight-card.tsx`):
  - 將選手名字改為可點擊連結（使用 FighterLink 組件）

**頁面路由** (`app/fighter/[slug]/`):

- **page.tsx**: 選手詳細頁面
  - Server Component，使用 `unstable_cache` 快取
  - 顯示 FighterProfileCard 和 FighterEventHistory
  - 動態 metadata 生成
  - 404 處理
- **loading.tsx**: 載入狀態（Skeleton UI）
- **error.tsx**: 錯誤邊界組件

**資料同步整合** (`lib/services/events.ts`):

- 在事件同步時自動解析對戰卡
- 建立 Fighter 記錄（如果不存在）
- 建立 FighterEvent 關聯
- 錯誤處理：對戰卡解析失敗不影響事件同步

**性能優化**:

- 使用 Next.js 16 的 `unstable_cache` 快取選手數據（5 分鐘）
- 使用 `revalidateTag` 清除快取
- 資料庫索引優化查詢性能

**注意事項**:

- Slug 唯一性：使用 `generateUniqueSlug` 確保 slug 唯一
- API 限制：TheSportsDB V1 API 有請求限制，需要適當快取
- 錯誤處理：API 查詢失敗時優雅降級
- 預備方案：如果無法從 EventFightCard 提取，提供從 strResult 解析的備用方案

### feat/fighter-on-demand-sync

**難度**: ★★★☆☆

**描述**: 實作選手資料的 on-demand 同步機制，當透過 slug 查詢不到選手時，自動從 slug 推測名字並從 TheSportsDB API 搜尋，找到匹配的選手後自動建立資料庫記錄。這是最小代碼改動、最高效、最優雅的解決方案。

**問題背景**:

- 資料庫初始狀態沒有 fighter 資料
- 用戶訪問 `/fighter/conor-mcgregor` 時會 404
- 需要一個機制在查詢不到時自動同步

**解決方案**:

採用服務層 fallback 機制，在 `getFighterBySlug` 中加入 on-demand 同步邏輯，對上層透明，無需修改頁面代碼。

**工具函數擴展** (`lib/utils/slug.ts`):

- **新增 `slugToPossibleNames(slug: string)`**:
  - 從 slug 推測可能的名字列表
  - 處理基本格式：`conor-mcgregor` → `Conor McGregor`
  - 處理數字後綴：`conor-mcgregor-2` → `Conor McGregor`
  - 處理 "Mc" 前綴：`conor-mcgregor` → `Conor McGregor` 和 `Conor McGregor`（Mc 大寫變體）
  - 返回多個候選名字以提高匹配率

**服務層增強** (`lib/services/fighters.ts`):

- **修改 `getFighterBySlug(slug: string, options?: { trySync?: boolean })`**:
  - 新增 `options` 參數，支援 `trySync`（預設為 `true`）
  - 實作 on-demand 同步 fallback：
    1. 先查詢資料庫
    2. 找不到且 `trySync` 為 `true` 時，從 slug 推測名字
    3. 搜尋 TheSportsDB API
    4. 檢查 slug 匹配（支援精確匹配和基礎 slug 匹配，忽略數字後綴）
    5. 找到匹配後建立資料庫記錄
    6. 返回完整的選手資料（含關聯的賽事）
  - 錯誤處理：API 搜尋失敗時返回 `null`，不影響頁面運作
  - 詳細日誌記錄同步過程

**快取策略**:

- 使用 `unstable_cache` 快取結果（300 秒）
- 找不到時也會快取，避免重複 API 呼叫
- 錯誤處理：API 失敗時返回 `null`，不影響頁面運作

**功能特點**:

1. **代碼改動最小**：只修改了兩個文件（`lib/utils/slug.ts` 和 `lib/services/fighters.ts`）
2. **對上層透明**：頁面代碼無需改動，`getFighterBySlug` 自動處理同步
3. **高效**：只在真正找不到時才呼叫 API
4. **優雅**：邏輯集中在服務層，易於維護
5. **資料庫操作少**：只在找到匹配選手時才寫入

**使用流程**:

當用戶訪問 `/fighter/conor-mcgregor` 時：

1. 系統先查詢資料庫
2. 如果找不到，自動從 slug 推測名字並搜尋 API
3. 找到匹配後自動建立記錄
4. 返回選手資料並顯示頁面

**錯誤處理**:

- API 搜尋失敗時繼續處理下一個候選名字
- 所有錯誤都被捕獲並記錄，不會中斷流程
- 找不到匹配時返回 `null`，頁面顯示 404

**性能考量**:

- API 請求只在真正需要時才執行
- 使用快取避免重複 API 呼叫
- 支援多個候選名字，提高匹配成功率

## 2025-01-XX

### feat/api-data-ingest + data-abstraction

**難度**: ★★★★☆

**描述**: 實作賽事數據串接系統與數據抽象化層，透過 TheSportsDB API v2 自動同步本週格鬥賽事（拳擊、UFC、MMA），採用增量更新策略、快取優化與統一數據格式設計，確保高效能、低資料庫負擔與未來擴展性

**資料庫架構** (`prisma/schema.prisma`):

- **擴展 Event 模型**：
  - `external_id`: String? - 外部 API 的賽事 ID
  - `external_source`: String? - 數據來源（如 "thesportsdb"）
  - `external_data`: Json? - 原始 API 數據快照（用於除錯與未來擴展）
  - `sport_type`: String? - 賽事類型（"boxing", "ufc", "mma"）
  - `last_synced_at`: DateTime? - 最後同步時間
  - `sync_status`: String @default("pending") - 同步狀態
  - 唯一約束：`@@unique([external_id, external_source])`
  - 索引優化：
    - `@@index([external_id, external_source])` - 快速查找外部賽事
    - `@@index([fight_date, status])` - 優化本週賽事查詢
    - `@@index([last_synced_at])` - 優化增量同步查詢
    - `@@index([sport_type, fight_date])` - 優化賽事分析頁查詢（未來擴展）

**數據抽象化層** (`lib/adapters/thesportsdb.ts`):

- **TheSportsDBClient 類別**：
  - API 客戶端封裝，支援 API Key 認證
  - `getEventsByLeague(leagueId)`: 透過聯賽 ID 查詢賽事
  - `getEventsByDateRange(startDate, endDate)`: 透過日期範圍查詢賽事（支援多聯賽並行查詢）
  - `transformEvent()`: 將 TheSportsDB API 數據轉換為統一格式
  - `determineSportType()`: 自動判定賽事類型（boxing/ufc/mma/other）
- **統一數據格式** (`UnifiedEventData`):
  - `external_id`, `name`, `fight_date`, `sport_type`
  - `external_data`: 完整原始數據保留
  - 可選欄位：`home_team`, `away_team`, `venue`, `league`, `country`, `city`, `status`
- **Zod Schema 驗證**：
  - `TheSportsDBEventSchema`: 驗證 API 回應格式
  - `TheSportsDBResponseSchema`: 驗證 API 回應結構

**類型定義擴展** (`lib/types.ts`):

- 新增 `ExternalEventSource`: `"thesportsdb" | "espn" | "ufc" | "other"`
- 新增 `SportType`: `"boxing" | "ufc" | "mma" | "other"`
- 新增 `SyncStatus`: `"pending" | "syncing" | "completed" | "failed"`
- 新增 `UnifiedEventData` 介面：統一的外部 API 數據格式
- 擴展 `Event` 介面：新增所有外部 API 整合欄位

**事件服務層** (`lib/services/events.ts`):

- **`getWeeklyCombatEvents()`**:
  - 查詢本週格鬥賽事（boxing, ufc, mma）
  - 使用 `unstable_cache` 快取（tag: `"events"`, revalidate: 60 秒）
  - 自動計算週的開始與結束時間
- **`getCombatEvents(options)`**:
  - 支援過濾：`sportType`, `status`
  - 支援分頁：`limit`, `offset`
  - 用於未來賽事分析頁
- **`syncEventsFromExternalAPI(source)`**:
  - 增量更新策略：只更新變更的賽事
  - 使用 `findFirst` + `create`/`update` 避免重複
  - 自動判定賽事狀態（PENDING/OPEN/SETTLED）
  - 返回統計：`created`, `updated`, `errors`
- **`determineEventStatus(fightDate)`**:
  - 根據賽事日期自動判定狀態
  - 過去賽事 → SETTLED
  - 24 小時內 → OPEN
  - 其他 → PENDING
- **`getEventByExternalId(externalId, source)`**:
  - 透過外部 ID 查詢賽事

**同步 API** (`app/api/events/sync/route.ts`):

- **POST `/api/events/sync`**:
  - 觸發外部 API 同步
  - 認證機制：
    - Vercel Cron Jobs：檢查 `x-vercel-cron` header
    - 手動觸發：檢查 `secret` 參數或 request body
  - 支援指定數據來源（預設：thesportsdb）
  - 同步完成後自動 `revalidateTag("events")` 快取失效
  - 返回詳細統計資訊
- **GET `/api/events/sync`**:
  - 提供端點使用說明（監視用）

**定時任務配置** (`vercel.json`):

- 配置 Vercel Cron Jobs：
  - 路徑：`/api/events/sync`
  - 排程：每天 UTC 2:00 AM (`0 2 * * *`)
  - 自動觸發同步，無需手動操作

**前端整合** (`app/events/page.tsx`):

- 更新賽事頁面使用新服務層
- 使用 `getWeeklyCombatEvents()` 查詢本週賽事
- 自動享受快取機制帶來的效能提升
- 同步完成後自動顯示最新數據

**環境變數配置** (`README.md`):

- 新增 `THESPORTSDB_API_KEY`: TheSportsDB API v2 金鑰（需要支持者訂閱）
- 新增 `EVENTS_SYNC_SECRET`: 保護同步端點的 secret token

**效能優化策略**:

1. **資料庫負擔最小化**：

   - 增量更新：只更新變更的賽事
   - 批量操作：逐個處理但使用單一連接
   - 索引優化：關鍵欄位建立索引
   - 查詢優化：使用日期範圍過濾，避免全表掃描

2. **載入速度優化**：

   - 使用 `unstable_cache` 快取查詢結果（60 秒 revalidate）
   - 使用 cache tags 精確控制快取失效
   - 前端使用 Server Components，減少客戶端 JavaScript

3. **API 呼叫優化**：
   - 並行請求多個聯賽數據（Promise.all）
   - 錯誤處理：單一聯賽失敗不影響其他聯賽
   - 設定合理的 timeout（10 秒）

**歷史數據保留策略**:

- 永不刪除賽事數據：所有同步的賽事永久保留
- 透過 `status` 欄位標記賽事狀態
- `external_data` JSON 欄位保留完整原始數據
- 支援未來建立賽事分析頁面

**未來擴展性**:

1. **多 API 來源支援**：

   - 適配器模式設計，可輕鬆新增 ESPN、UFC API 等
   - 統一數據格式確保前端組件無需修改

2. **數據豐富化**：

   - `external_data` JSON 欄位保留原始數據，未來可擴展顯示更多資訊
   - 支援選手資訊、賽事統計等擴展欄位

3. **賽事分析頁準備**：
   - 保留所有歷史賽事數據
   - 透過 `sport_type`、`fight_date`、`status` 等欄位進行數據分析
   - 索引優化支援未來分析查詢

**主要修改文件**:

1. `prisma/schema.prisma` - 擴展 Event 模型，新增外部 API 整合欄位與索引
2. `lib/adapters/thesportsdb.ts` - 新建 TheSportsDB API 適配器
3. `lib/types.ts` - 新增統一數據格式類型與擴展 Event 類型
4. `lib/services/events.ts` - 新建事件服務層
5. `app/api/events/sync/route.ts` - 新建同步 API endpoint
6. `app/events/page.tsx` - 更新使用新服務層
7. `vercel.json` - 新建 Cron Jobs 配置
8. `README.md` - 更新環境變數說明

**注意事項**:

- TheSportsDB 免費方案每天 1000 次請求限制，每天同步一次可有效控制使用量
- API 失敗時優雅降級，不影響現有功能，歷史數據仍可正常顯示
- 使用 Zod schema 嚴格驗證外部 API 數據
- 長期運行後歷史數據會持續增長，需監控資料庫大小

---

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

### feat/user-profile-separation

**難度**: ★★★★★

**描述**: 實作用戶 Profile 分離系統，將登錄資訊（email, userId, password）與個人資料（name, nickname, avatar 等）完全分離，簡化註冊流程，實作 Profile 軟刪除機制，並新增欄位可見性控制功能（public/friends/private）

**資料庫架構** (`prisma/schema.prisma`):

- **簡化 User 模型**：
  - 移除 `name`, `nickname`, `gender`, `birthDate`, `avatar` 欄位
  - 保留登錄相關欄位：`id`, `userId`, `email`, `password`
  - 保留系統欄位：`isAdmin`, `isBanned`, `points`, `createdAt`, `updatedAt`
  - 新增 `profile` 一對一關聯
- **新增 Profile 模型**：
  - 基本資訊：`id`, `userId` (unique), `name`, `nickname`, `gender`, `birthDate`, `avatar`
  - 擴展欄位：`height`, `weight`, `description`, `record`, `train_start`, `stance`, `gym`
  - 可見性設定：`visibility` (JSON) - 每個欄位可設定 public/friends/private
  - 軟刪除：`deletedAt` (DateTime?)
  - 時間戳：`createdAt`, `updatedAt`
  - 索引：`@@index([userId])`, `@@index([deletedAt])`
  - 關聯：`user` (User, onDelete: Cascade)

**類型定義更新** (`lib/types.ts`):

- 新增 `ProfileVisibility` 類型：`"public" | "friends" | "private"`
- 新增 `ProfileVisibilitySettings` 介面：定義每個欄位的可見性設定
- 新增 `Profile` 介面：完整的 Profile 資料結構
- 新增 `ProfilePublic` 介面：公開顯示用 Profile
- 新增 `CreateProfileInput`, `UpdateProfileInput`, `UpdateVisibilityInput` 介面
- 簡化 `User` 介面：移除 profile 相關欄位，新增 `profile?: Profile | null`
- 新增 `UserWithProfile` 介面：User + Profile 組合類型
- 更新 `UserPublic`, `UserPublicExtended`：註明從 profile 讀取資料
- 簡化 `RegisterInput`：僅保留 `userId`, `email`, `password`
- 更新 `UserProfilePage`：使用 `UserWithProfile`
- 新增 `UserWithProfileAndStats` 介面

**驗證 Schema** (`lib/validations.ts`):

- **簡化 `registerSchema`**：移除 `name`, `nickname`, `gender`, `birthDate`
- **新增 Profile Schema**：
  - `profileVisibilitySchema`: enum("public", "friends", "private")
  - `profileVisibilitySettingsSchema`: 定義所有欄位的可見性設定
  - `createProfileSchema`: 包含所有 Profile 欄位和驗證規則
  - `updateProfileSchema`: 部分更新，userId 不可更新
  - `updateVisibilitySchema`: 僅更新可見性設定
- **更新 Select Constants**：
  - 新增 `profileSelectPublic`: 公開顯示用 Profile 欄位
  - 新增 `profileSelectFull`: 完整 Profile 欄位
  - 更新 `userSelectPublic`: 包含 `profile` 關聯
  - 更新 `userSelectPublicExtended`: 包含 `profile` 關聯
  - 更新 `userSelectFull`: 包含 `profile` 關聯
  - 更新 `postIncludeBasic`, `commentIncludeBasic`: 使用新的 profile 結構

**Profile Service** (`lib/services/profiles.ts`):

- `checkFieldVisibility()`: 檢查欄位是否對查看者可見
- `filterProfileByVisibility()`: 根據可見性設定過濾 Profile 欄位
- `getProfileByUserId()`: 取得 Profile（根據可見性過濾，使用 unstable_cache）
- `getProfileByUserIdForOwner()`: 取得完整 Profile（不進行可見性過濾）
- `createProfile()`: 創建 Profile，設定預設可見性（全 public）
- `updateProfile()`: 更新 Profile
- `updateVisibility()`: 更新可見性設定
- `softDeleteProfile()`: 軟刪除 Profile
- `restoreProfile()`: 恢復軟刪除的 Profile
- `getProfileWithUser()`: 取得 User + Profile 組合

**User Service 更新** (`lib/services/users.ts`):

- 所有查詢加入 `profile` include
- `getUserProfile()`: 返回 `UserWithProfile`，確保 profile 存在
- `getUserProfilePage()`: 過濾軟刪除的 profile 和 posts
- `getUserComments()`: 包含 profile 資料
- `getAllUsers()`: 包含 profile 資料（管理員用）
- `banUser()`, `unbanUser()`: 包含 profile 資料

**Post/Comment Service 更新**:

- `lib/services/posts.ts`: 新增 `transformUser()` 函數，將嵌套的 profile 結構轉換為扁平結構
- `lib/services/comments.ts`: 新增 `transformUser()` 函數
- 所有返回 User 資料的函數都使用 `transformUser()` 進行轉換

**API 端點**:

- **註冊 API** (`app/api/auth/register/route.ts`):
  - 簡化註冊流程，僅接收 `userId`, `email`, `password`
  - 使用 transaction 同時創建 User 和 Profile
  - Profile 預設 name 使用 `userId`，設定預設可見性（全 public）
- **登入 API** (`app/api/auth/login/route.ts`):
  - 從 `profile` 關聯查詢顯示資料
  - 扁平化返回資料結構
- **Auth Me API** (`app/api/auth/me/route.ts`):
  - 扁平化返回資料，將 profile 資料合併到頂層
- **Profile API** (`app/api/profile/[userId]/route.ts`):
  - `GET`: 取得 Profile（根據可見性過濾）
  - `PATCH`: 更新 Profile（僅自己可更新）
  - `DELETE`: 軟刪除 Profile（僅自己可刪除）
- **可見性 API** (`app/api/profile/[userId]/visibility/route.ts`):
  - `GET`: 取得可見性設定（僅自己可見）
  - `PATCH`: 更新可見性設定（僅自己可更新）
- **管理員 Profile API** (`app/api/admin/profiles/route.ts`):
  - `GET`: 取得所有 Profile（支援分頁和包含已刪除）
- **管理員 Profile 操作 API** (`app/api/admin/profiles/[userId]/route.ts`):
  - `PATCH`: 更新任何 Profile
- **管理員 Profile 恢復 API** (`app/api/admin/profiles/[userId]/restore/route.ts`):
  - `POST`: 恢復軟刪除的 Profile

**前端組件**:

- **註冊表單** (`components/auth/register-form.tsx`):
  - 移除 `name`, `nickname`, `gender`, `birthDate` 欄位
  - 僅保留 `userId`, `email`, `password`, `confirmPassword`
- **Profile 編輯表單** (`components/profile/edit-profile-form.tsx`):
  - 完全重寫，使用 Tabs 分為「基本資訊」和「可見性設定」
  - 包含所有新欄位：height, weight, description, record, train_start, stance, gym
  - 整合 `ProfileVisibilitySettings` 組件
- **可見性設定組件** (`components/profile/profile-visibility-settings.tsx`):
  - 新建組件，允許用戶為每個欄位設定可見性
  - 使用 Select 組件選擇 public/friends/private
- **管理員 Profile 管理** (`components/admin/profile-management.tsx`):
  - 新建組件，顯示所有 Profile 列表
  - 支援查看、恢復軟刪除的 Profile
  - 顯示 Profile 狀態（Active/Deleted/Banned）
- **Admin Tabs** (`components/admin/admin-tabs.tsx`):
  - 新增 Profile Management tab
- **用戶資料顯示組件**:
  - `components/posts/post-card-author.tsx`: 使用 `UserPublic` 類型
  - `components/posts/post-profile-hovercard.tsx`: 使用 `UserPublic` 類型
  - `components/profile/profile-card.tsx`: 使用 `UserPublic` 類型
  - `components/profile/profile-hovercard.tsx`: 使用 `UserPublic` 類型
- **Navbar** (`components/layout/navbar.tsx`):
  - 安全訪問用戶資料，處理 profile 可能為 null 的情況

**頁面更新**:

- `app/settings/page.tsx`: 使用 `getUserProfile()` 獲取 `UserWithProfile`
- `app/user/[userId]/edit/page.tsx`: 使用 `getUserProfile()` 獲取 `UserWithProfile`
- `app/user/[userId]/page.tsx`: 從 `user.profile` 讀取顯示資料，顯示所有 Profile 欄位

**多語言支援** (`lib/constants.ts`):

- 新增可見性相關翻譯（四種語言）：
  - `PROFILE_MANAGEMENT`, `VISIBILITY_SETTINGS`, `VISIBILITY_SETTINGS_DESCRIPTION`
  - `BASIC_INFO`, `PUBLIC`, `FRIENDS_ONLY`, `PRIVATE`
  - `HEIGHT`, `WEIGHT`, `DESCRIPTION`, `RECORD`, `TRAIN_START_YEAR`, `STANCE`, `GYM`
  - `NO_PROFILES_FOUND`, `DELETED`, `ACTIVE`, `BANNED`, `CREATED_AT`, `SUCCESS_RESTORED`

**修復問題**:

- **登入 API 500 錯誤** (`app/api/auth/login/route.ts`):
  - 修正查詢舊 User 欄位的問題，改為從 `profile` 關聯查詢
- **Navbar 顯示問題** (`components/layout/navbar.tsx`, `app/api/auth/me/route.ts`):
  - 更新 `/api/auth/me` 扁平化返回資料
  - 添加安全訪問，處理 profile 為 null 的情況
- **Category 路由 404** (`app/category/[slug]/page.tsx`):
  - 實作完整的 Category 頁面，支援 slug 查詢
  - 處理 "general" 預設值，顯示無分類的貼文
  - 新增 `getCategoryBySlug()` 函數
- **Post Form Select 錯誤** (`components/posts/post-form.tsx`):
  - 修正 Select.Item 不能使用空字串作為 value 的問題
  - 使用 "none" 作為特殊值，提交時轉換為 null

**效能優化**:

- Profile 查詢使用 `unstable_cache` 和 cache tags
- 建立適當的資料庫索引（userId, deletedAt）
- 使用 transaction 確保 User 和 Profile 創建的一致性
- Post/Comment Service 使用 `transformUser()` 統一轉換邏輯，避免重複代碼

**向後兼容性**:

- 保留 `updateUserSchema` 作為 deprecated（向後兼容）
- 保留 `EditProfileInput` 作為 deprecated
- `AnonymousUser` 更新為扁平結構，符合 `UserPublic` 類型
- Service 層統一轉換邏輯，前端組件無需大幅修改

**主要修改文件**:

1. `prisma/schema.prisma` - 簡化 User 模型，新增 Profile 模型
2. `lib/types.ts` - 新增 Profile 相關類型，簡化 User 類型
3. `lib/validations.ts` - 簡化 registerSchema，新增 Profile schema 和 select constants
4. `lib/services/profiles.ts` - 新建 Profile Service（包含可見性邏輯）
5. `lib/services/users.ts` - 更新所有查詢包含 profile
6. `lib/services/posts.ts` - 新增 transformUser 函數
7. `lib/services/comments.ts` - 新增 transformUser 函數
8. `lib/services/categories.ts` - 新增 getCategoryBySlug 函數
9. `lib/auth.ts` - 更新 getCurrentUser 使用 profile
10. `app/api/auth/register/route.ts` - 簡化註冊流程，自動創建 Profile
11. `app/api/auth/login/route.ts` - 修正查詢 profile 資料
12. `app/api/auth/me/route.ts` - 扁平化返回資料
13. `app/api/profile/[userId]/route.ts` - 新建 Profile CRUD API
14. `app/api/profile/[userId]/visibility/route.ts` - 新建可見性 API
15. `app/api/admin/profiles/route.ts` - 新建管理員 Profile 列表 API
16. `app/api/admin/profiles/[userId]/route.ts` - 新建管理員 Profile 更新 API
17. `app/api/admin/profiles/[userId]/restore/route.ts` - 新建恢復 API
18. `components/auth/register-form.tsx` - 簡化註冊表單
19. `components/profile/edit-profile-form.tsx` - 重寫 Profile 編輯表單
20. `components/profile/profile-visibility-settings.tsx` - 新建可見性設定組件
21. `components/admin/profile-management.tsx` - 新建管理員 Profile 管理組件
22. `components/admin/admin-tabs.tsx` - 新增 Profile Management tab
23. `components/layout/navbar.tsx` - 更新用戶資料顯示
24. `components/posts/post-card-author.tsx` - 更新為使用 UserPublic
25. `components/posts/post-profile-hovercard.tsx` - 更新為使用 UserPublic
26. `components/profile/profile-card.tsx` - 更新為使用 UserPublic
27. `components/profile/profile-hovercard.tsx` - 更新為使用 UserPublic
28. `components/posts/post-form.tsx` - 修正 Select 組件錯誤
29. `app/settings/page.tsx` - 更新為使用 UserWithProfile
30. `app/user/[userId]/edit/page.tsx` - 更新為使用 UserWithProfile
31. `app/user/[userId]/page.tsx` - 從 profile 讀取顯示資料
32. `app/category/[slug]/page.tsx` - 實作完整 Category 頁面
33. `lib/constants.ts` - 新增可見性相關翻譯

---

### refactor/type-optimization

**難度**: ★★☆☆☆

**描述**: 優化類型定義和用戶資料轉換邏輯，統一處理 `undefined` 轉 `null`，提高類型安全性和代碼維護性

**問題分析**:

- `UserPublicExtended` 類型中 `avatar` 和 `nickname` 可能為 `undefined`，但類型定義為 `string | null`
- `transformUser` 函數在多個服務文件中重複定義，造成代碼重複
- 類型不一致導致 TypeScript 編譯錯誤
- 缺乏統一的用戶資料轉換邏輯

**解決方案**:

**類型定義優化** (`lib/types.ts`):

- 修正 `UserPublic` 和 `UserPublicExtended` 介面：
  - `nickname`: 從 `nickname?: string | null` 改為 `nickname: string | null`（嚴格類型，不允許 `undefined`）
  - `avatar`: 從 `avatar?: string | null` 改為 `avatar: string | null`（嚴格類型，不允許 `undefined`）
- 添加註釋說明類型嚴格性

**共享工具函數** (`lib/utils.ts`):

- 新增 `transformUser()` 函數：
  - 統一處理嵌套的 profile 結構轉換為扁平結構
  - 使用 `??` 運算符確保 `undefined` 轉為 `null`
  - 明確的類型定義，確保返回 `UserPublicExtended` 類型
  - 減少代碼重複，提高維護性

**服務層更新**:

- **`lib/services/posts.ts`**:
  - 移除重複的 `transformUser` 函數定義
  - 導入並使用共享的 `transformUser` 函數
  - `getPostById()` 明確返回 `PostWithDetails | null` 類型
- **`lib/services/comments.ts`**:
  - 移除重複的 `transformUser` 函數定義
  - 導入並使用共享的 `transformUser` 函數

**API 路由更新**:

- **`app/api/auth/me/route.ts`**:
  - 使用 `??` 運算符確保 `nickname` 和 `avatar` 的 `undefined` 轉為 `null`
  - 添加註釋說明類型轉換邏輯
- **`app/api/auth/login/route.ts`**:
  - 使用 `??` 運算符確保類型一致性
  - 添加註釋說明類型轉換邏輯

**組件更新**:

- **`components/posts/post-content.tsx`**:
  - 更新 `PostContentProps` 介面中的 `user` 和 `comments[].user` 類型定義
  - `nickname` 從 `nickname?: string | null` 改為 `nickname: string | null`
- **`app/posts/[id]/page.tsx`**:
  - 明確處理類型轉換，確保 `user` 和 `comment.user` 的 `avatar` 和 `nickname` 正確轉換
  - 使用 `??` 運算符確保 `undefined` 轉為 `null`

**效能優化**:

- 統一轉換邏輯減少代碼重複，提高維護性
- 嚴格類型定義減少運行時錯誤
- 統一的轉換函數便於後續優化和擴展

**主要修改文件**:

1. `lib/types.ts` - 修正 `UserPublic` 和 `UserPublicExtended` 類型定義
2. `lib/utils.ts` - 新增共享的 `transformUser` 函數
3. `lib/services/posts.ts` - 使用共享的 `transformUser` 函數，明確返回類型
4. `lib/services/comments.ts` - 使用共享的 `transformUser` 函數
5. `app/api/auth/me/route.ts` - 使用 `??` 運算符確保類型一致性
6. `app/api/auth/login/route.ts` - 使用 `??` 運算符確保類型一致性
7. `components/posts/post-content.tsx` - 更新類型定義
8. `app/posts/[id]/page.tsx` - 明確處理類型轉換

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
