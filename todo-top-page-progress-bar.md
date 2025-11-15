# 首頁垂直 Progress Bar Indicator 實作方案

## 概述

在首頁使用垂直 progress bar indicator，保留現有 timeline 的漸層顏色、寬度與類似的垂直設計。使用 motion 建立新的 progress bar 元件，確保不會導致版面變形且不影響效能和頁面讀取速度。

---

## 設計思路

### 1. 組件定位策略

- **固定定位**：使用 `position: fixed` 或 `position: absolute`，避免影響文檔流
- **與現有 Timeline 並存**：可以與現有 Timeline 並存或替換，位於左側固定位置
- **非互動元素**：使用 `pointer-events: none` 避免阻擋使用者互動

### 2. 視覺設計保留

- **寬度**：2px（與現有 Timeline 一致）
- **漸層顏色**：`from-rose-500 via-orange-500 to-transparent`
- **垂直方向**：從上到下的進度指示
- **漸變效果**：使用 `mask-image` 實現頂部/底部漸變效果

### 3. 效能優化策略

- **Motion 優化**：使用 `useScroll` 的 `layout` 選項減少重繪
- **GPU 加速**：使用 `will-change: transform` 提示瀏覽器優化
- **Transform 動畫**：使用 `transform` 而非 `height` 動畫（GPU 加速）
- **節流處理**：Motion 內建節流/防抖滾動事件優化
- **數值映射**：使用 `useTransform` 進行數值映射，減少重複計算

### 4. 避免版面變形

- **固定定位**：不佔用文檔流空間，避免影響其他元素佈局
- **層級控制**：使用 `z-index` 控制層級，確保不遮擋重要內容
- **響應式設計**：手機版可隱藏或調整位置
- **渲染隔離**：使用 `contain: layout style paint` CSS 屬性隔離渲染

---

## 技術實現方案

### 方案 A：獨立 Progress Bar 組件（推薦）

#### 組件結構

```typescript
// components/ui/scroll-progress-bar.tsx
"use client";
import { useScroll, useTransform, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export const ScrollProgressBar = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(0);

  // コンテナの高さを計算（ページ全体の高さ）
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        // ページ全体の高さを取得
        const documentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        setMaxHeight(documentHeight - viewportHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // スクロール進捗を追跡（ページ全体）
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"],
  });

  // 進捗バーの高さを計算（0% から 100%）
  const progressHeight = useTransform(
    scrollYProgress,
    [0, 1],
    [0, maxHeight]
  );

  // 透明度アニメーション（最初の10%でフェードイン）
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      ref={containerRef}
      className="fixed left-8 top-0 h-screen w-[2px] pointer-events-none z-0"
      style={{ contain: "layout style paint" }}
    >
      {/* 背景トラック（静的な部分） */}
      <div className="absolute inset-0 w-[2px] bg-gradient-to-b from-transparent from-0% via-neutral-200 dark:via-neutral-700 to-transparent to-99% [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]" />
      
      {/* 進捗バー（動的な部分） */}
      <motion.div
        style={{
          height: progressHeight,
          opacity: opacity,
          willChange: "transform",
        }}
        className="absolute top-0 left-0 w-[2px] bg-gradient-to-b from-rose-500 via-orange-500 to-transparent from-0% via-10% rounded-full"
      />
    </div>
  );
};
```

#### 使用方式

在 `app/page.tsx` 中引入並使用：

```typescript
import { ScrollProgressBar } from "@/components/ui/scroll-progress-bar";

export default async function Home() {
  const allPosts = await getPosts();
  return (
    <section>
      <ScrollProgressBar />
      <HomeHeader />
      {/* ... 其他內容 ... */}
    </section>
  );
}
```

---

## 效能優化重點

### 1. CSS 優化

```css
/* レンダリング分離 - 渲染隔離 */
contain: layout style paint;

/* GPU アクセラレーション - GPU 加速 */
will-change: transform;

/* アニメーション最適化 - 動畫優化 */
transform: translateZ(0);
```

### 2. Motion 設定

- **`layoutEffect: false`**：避免觸發 layout 重排
- **`useTransform`**：進行數值映射，減少重複計算
- **內建節流**：Motion 內建節流處理，無需手動優化

### 3. 響應式處理

```typescript
// モバイルでは非表示または位置調整
// 手機版隱藏或調整位置
className="hidden md:block fixed left-8 top-0 ..."
// または
// 或
className="fixed left-2 md:left-8 top-0 ..."
```

---

## 實作步驟

### 步驟 1：建立新組件

1. 創建檔案：`components/ui/scroll-progress-bar.tsx`
2. 複製上述組件代碼
3. 確保導入路徑正確

### 步驟 2：在首頁引入

1. 開啟 `app/page.tsx`
2. 導入 `ScrollProgressBar` 組件
3. 在適當位置放置組件（建議在 `<section>` 開頭）

### 步驟 3：測試效能

1. 使用 Chrome DevTools Performance 面板
2. 檢查 FPS（應維持 60fps）
3. 檢查重繪次數（應最小化）
4. 檢查記憶體使用（應穩定）

### 步驟 4：響應式測試

1. **手機版**：檢查是否正常顯示或隱藏
2. **平板版**：檢查位置是否合適
3. **桌面版**：檢查與其他元素的層級關係

### 步驟 5：可選整合

- 與現有 Timeline 整合或替換
- 根據需求調整位置和樣式

---

## 技術細節說明

### 1. 滾動進度計算

```typescript
// ページ全体のスクロール進捗を追跡
// 追蹤整個頁面的滾動進度
const { scrollYProgress } = useScroll({
  offset: ["start start", "end end"],
});
```

- `offset: ["start start", "end end"]`：從頁面開始到結束的完整範圍
- `scrollYProgress`：0 到 1 之間的進度值

### 2. 高度計算

```typescript
// ページ全体の高さからビューポートの高さを引く
// 從頁面總高度減去視窗高度
const documentHeight = document.documentElement.scrollHeight;
const viewportHeight = window.innerHeight;
setMaxHeight(documentHeight - viewportHeight);
```

### 3. 漸層顏色

```typescript
// 既存の Timeline と同じグラデーション
// 與現有 Timeline 相同的漸層
className="bg-gradient-to-b from-rose-500 via-orange-500 to-transparent from-0% via-10%"
```

- `from-rose-500`：起始顏色（玫瑰紅）
- `via-orange-500`：中間顏色（橙色）
- `to-transparent`：結束顏色（透明）

### 4. 透明度動畫

```typescript
// 最初の10%のスクロールでフェードイン
// 在前 10% 的滾動中淡入
const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
```

---

## 注意事項

### 1. 版面變形預防

- ✅ 使用 `fixed` 定位，不佔用文檔流空間
- ✅ 使用 `pointer-events: none` 避免阻擋點擊
- ✅ 使用 `contain` CSS 屬性隔離渲染

### 2. 效能優化

- ✅ 使用 `will-change` 提示瀏覽器優化
- ✅ 使用 `transform` 而非 `height` 動畫
- ✅ Motion 內建節流處理

### 3. 響應式設計

- ✅ 手機版可隱藏或調整位置
- ✅ 使用 Tailwind 響應式類別
- ✅ 測試不同螢幕尺寸

### 4. 視覺一致性

- ✅ 漸層顏色與現有 Timeline 保持一致
- ✅ 寬度與現有 Timeline 一致（2px）
- ✅ 垂直設計風格一致

---

## 替代方案

### 方案 B：優化現有 Timeline 組件

如果需要與現有 Timeline 整合，可以：

1. 修改現有 `components/ui/timeline.tsx`
2. 添加 progress bar 功能
3. 保持現有視覺設計

詳細實作方式可參考現有 Timeline 組件的結構。

---

## 參考資料

- [Motion 官方文檔](https://motion.dev/)
- [useScroll Hook 文檔](https://motion.dev/docs/use-scroll)
- [useTransform Hook 文檔](https://motion.dev/docs/use-transform)
- [CSS Contain 屬性](https://developer.mozilla.org/en-US/docs/Web/CSS/contain)

---

## 更新記錄

- **2024-XX-XX**：初始版本，記錄方案 A 的實作思路和方式

