# TODO Memos

## UI Components

### feat/ui-nav

導航列 UI 組件開發

---

## Features

### feat/post-form-redesign

**難度**: ★★★★☆

**描述**: 重新設計發文表單，將新頁面改為置頂顯示，手機版切換為小按鈕

**前端任務**:

- 將 post new 從新頁面改成置頂顯示
- 手機版切換成小按鈕
- 整合 shadcn/ui 組件:
  - `accordion`: 顯示回覆貼文
  - `hover-card`: 取代現有的 ToolTip profile-card-mini 小卡
  - `field`, `input-group`: 用於 post-form, register-form, edit-profile-form 等表單
  - `dialog`: 電腦版的新貼文表單介面

**後端任務**:

- 更改回覆格式，將回覆視為 post 的一種
- 更新 Prisma Schema
- 更新相關 API

---

### feat/profile-card-components

**難度**: ★☆☆☆☆

**描述**: 開發多種尺寸的個人資料卡片組件

**組件列表**:

- `profile-card-horizontal-sm`: 橫版小尺寸，hover 使用者名稱時顯示
- `profile-card-horizontal-lg`: 橫版大尺寸，放在 mypage 頁頭
- `profile-card-vertical-sm`: 直版小尺寸，功能未定
- `profile-card-vertical-lg`: 直版大尺寸，放在桌機版 Nav sheet 中

---

### feat/infinite-scroll

**難度**: ★★☆☆☆

**描述**: 實作首頁貼文的無限捲動功能

---

### feat/recommendation-algorithm

**難度**: ★★★★★

**描述**: 根據使用者的喜好和習慣預測推文內容的推薦演算法

**注意事項**:

- 可能需要更改資料庫結構 (Prisma Schema)
- 盡量減少資料庫操作
- 需配合無限捲動功能

---

### feat/search

**描述**: 搜尋功能開發

---

### feat/user-profile

**難度**: ★★★☆☆

**描述**: 增加使用者基本資料功能，如賽事成績、拳齡等

**資料庫結構變更** (Prisma Schema):

- 新建 `Profile` 表格 (model Profile)，將基本資料與 User 分離
- `User` 只保留登入需要的基本資料:
  - `id`
  - `userId`
  - `email`
  - `password`
- `Profile` 包含使用者詳細資料:
  - `gender`: 性別
  - `birth`: 生日
  - `avatar`: 頭像
  - `height`: 身高
  - `weight`: 體重
  - `description`: 自我介紹
  - `record`: 賽事成績
  - `train_start`: 訓練開始年份 (西元年)
  - `stance`: 站架
  - `gym`: 所屬拳館

---

### feat/points-system

**描述**: 積分系統開發

**獎勵系統**:

- 發文 (post)
- 評論 (comment)
- 評分 (rating)
- 贈與
- 預測賽事成功 (投注)

**管理功能**:

- 管理員回溯積分
- 管理員管理積分

---

### feat/match-prediction

**描述**: 預測賽事結果功能

**功能**:

- 讓使用者可以投入積分進行預測

**前端任務**:

- 建立賽事頁面
- 首頁新增賽事區塊

**後端任務**:

- 計算積分賠率
- 根據賽事結果分配積分獎勵

---

### feat/rating-system

**描述**: 評分系統開發，參考虎撲設計

**功能範圍**:

- 分成賽事與選手兩種評分對象
- 選手評分系統可考慮與使用者積分連動

**前端任務**:

- 建立評分頁面

**後端任務**:

- 更新資料庫結構
- 建立評分 API 與 Service

---

### feat/subscription

**描述**: 訂閱/追蹤功能開發

**前端任務**:

- 在 Mypage 和 Profile-card 顯示追蹤人數

**後端任務**:

- 更新資料庫結構

---

### feat/notifications

**描述**: 通知系統開發

---

### feat/i18n

**描述**: 多語言支援功能

**支援語言**:

- 英文 (en)
- 日文 (ja)
- 簡體中文 (zh-CN)
- 繁體中文 (zh-TW)

---

### feat/auth-google

**描述**: Google 帳號登入功能開發
