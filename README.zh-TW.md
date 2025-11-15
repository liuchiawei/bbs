# BBS - Boxing Buddies Society

[English](README.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

一個生產就緒的現代化佈告欄系統，使用 Next.js 16 構建，具備完整的身份驗證、管理員儀表板、多語言支援（4 種語言）、進階 ISR 優化以及精美的 UI/UX。

## ✨ 功能特色

### 核心功能

- ✅ **使用者身份驗證與個人資料**

  - 使用自訂使用者名稱（userId）註冊並上傳頭像
  - 使用 JWT 登入/登出（HTTP-only cookies，7 天過期）
  - 公開使用者個人資料與統計（貼文、留言、按讚）
  - 編輯個人資料（姓名、性別、生日、頭像）
  - 查看使用者的貼文、留言和按讚內容
  - 積分系統（每位使用者初始 1000 積分）

- ✅ **貼文管理**

  - 建立、讀取、更新、刪除貼文
  - 貼文包含標題、內容和標籤
  - 對貼文按讚/取消按讚
  - 自動瀏覽次數追蹤
  - 貼文統計（瀏覽次數、按讚數、留言數）
  - **熱門貼文演算法**與 ISR 優化

- ✅ **留言系統**

  - 在貼文下方留言
  - 巢狀回覆（無限深度）
  - 對留言按讚/取消按讚
  - 刪除留言（僅作者/管理員）
  - 留言統計（按讚數、回覆數）

- ✅ **管理員儀表板**

  - 僅管理員可存取，具備角色檢查
  - 貼文管理（查看所有、刪除任何貼文）
  - 使用者管理（查看所有、封鎖/解封使用者）
  - 分頁支援

- ✅ **進階效能優化**

  - ISR（增量靜態重新生成），60 秒重新驗證
  - 熱門貼文演算法：`(按讚數 × 2) + (留言數 × 1.5) + (瀏覽次數 × 0.1) + 時間衰減`
  - 手動快取失效 API
  - 啟用 React Compiler
  - 元件快取

- ✅ **國際化（i18n）**

  - 4 種語言：英語、日語（預設）、簡體中文、繁體中文
  - 100+ 翻譯鍵值
  - 所有 UI 文字、錯誤訊息、驗證訊息均已翻譯

- ✅ **現代化 UI/UX**
  - 32+ shadcn/ui 元件（New York 風格）
  - 深色模式支援
  - 響應式設計（行動優先）
  - 流暢動畫（Motion 函式庫）
  - Toast 通知
  - 載入狀態（骨架螢幕）
  - 懸停卡片（個人資料預覽）
  - 玻璃態效果

## 🚀 技術堆疊

- **框架**：Next.js 16.0.1（App Router、React 19.2.0、TypeScript 5）
- **資料庫**：PostgreSQL（Neon serverless）與 Prisma ORM 6.19.0
- **UI 函式庫**：shadcn/ui（32+ 元件）+ Tailwind CSS 4
- **動畫**：Motion 12（Framer Motion 後繼者）
- **身份驗證**：JWT（jose）+ bcryptjs
- **表單**：React Hook Form + Zod 驗證
- **檔案儲存**：Vercel Blob（頭像，最大 4MB）
- **分析**：Vercel Analytics
- **測試**：Storybook 10 + Vitest 4 + Playwright
- **套件管理器**：pnpm

## 📋 前置需求

- **Node.js**：20.x 或更高版本
- **套件管理器**：pnpm（必需）
- **資料庫**：PostgreSQL（或 Neon 帳號用於 serverless）
- **雲端儲存**：Vercel 帳號（用於 Blob 儲存）

## 🛠️ 安裝

### 1. 複製儲存庫

```bash
git clone <repository-url>
cd bbs
```

### 2. 安裝相依套件

```bash
pnpm install
```

### 3. 設定環境變數

在根目錄建立 `.env.local` 檔案：

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."              # Pooled connection
DATABASE_URL_UNPOOLED="postgresql://..."     # Direct connection
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# ISR Revalidation (Optional - for manual cache invalidation)
REVALIDATE_SECRET="your-revalidation-secret"
```

#### 取得資料庫憑證（Neon）

1. 在 [neon.tech](https://neon.tech) 註冊
2. 建立新專案
3. 從儀表板複製所有連線字串
4. 貼上到 `.env.local`

#### 取得 Vercel Blob Token

1. 在 [vercel.com](https://vercel.com) 註冊
2. 建立新專案（或連結現有專案）
3. 前往 Storage → Blob → Create Blob Store
4. 複製 `BLOB_READ_WRITE_TOKEN`

### 4. 設定資料庫

```bash
# Generate Prisma client
pnpm dlx prisma generate

# Run migrations
pnpm dlx prisma migrate dev

# (Optional) Open Prisma Studio to view database
pnpm dlx prisma studio
```

### 5. 執行開發伺服器

```bash
pnpm dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看應用程式。

## 📁 專案結構

```text
bbs/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (20 endpoints)
│   │   ├── admin/                # Admin endpoints
│   │   ├── auth/                 # Authentication
│   │   ├── comments/             # Comment CRUD
│   │   ├── posts/                # Post CRUD
│   │   ├── user/                 # User profiles
│   │   ├── upload/               # Avatar upload
│   │   └── revalidate/           # ISR revalidation
│   ├── admin/                    # Admin dashboard
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── posts/                    # Post pages
│   ├── user/                     # User profile pages
│   ├── settings/                 # Settings page
│   └── page.tsx                  # Home page (hot posts)
├── components/
│   ├── admin/                    # Admin components (3)
│   ├── auth/                     # Auth forms (2)
│   ├── comments/                 # Comment components (3)
│   ├── posts/                    # Post components (9)
│   ├── profile/                  # Profile components (3)
│   ├── layout/                   # Navbar, Footer (2)
│   └── ui/                       # shadcn/ui components (32+)
├── lib/
│   ├── services/                 # Business logic (posts, users, comments)
│   ├── validations.ts            # Zod schemas + Prisma selects
│   ├── types.ts                  # TypeScript types
│   ├── auth.ts                   # JWT utilities
│   ├── constants.ts              # i18n translations
│   ├── db.ts                     # Prisma client
│   └── utils.ts                  # Utilities
├── prisma/
│   ├── schema.prisma             # Database schema (5 models)
│   └── migrations/               # 10 migration files
├── CLAUDE.md                     # Project documentation (for AI)
├── CHANGELOG.md                  # Development log
├── TODO.md                       # Feature roadmap
└── README.md                     # This file (for users)
```

## 🗄️ 資料庫架構

### 模型

- **User**：id、userId（唯一使用者名稱）、name、nickname、email、password、gender、birthDate、avatar、isAdmin、isBanned、points（初始 1000）、createdAt、updatedAt
- **Post**：id、title、content、userId、tags[]、views、likes、createdAt、updatedAt
- **Comment**：id、content、userId、postId、parentId、likes、replies、createdAt、updatedAt
- **PostLike**：id、userId、postId、createdAt（userId+postId 唯一約束）
- **CommentLike**：id、userId、commentId、createdAt（userId+commentId 唯一約束）

## 🔌 API 端點（共 20 個）

### 身份驗證（5 個端點）

| Method | Endpoint                 | Description                   |
| ------ | ------------------------ | ----------------------------- |
| POST   | `/api/auth/register`     | 註冊新使用者                  |
| POST   | `/api/auth/login`        | 使用者登入（回傳 JWT cookie） |
| POST   | `/api/auth/logout`       | 使用者登出（清除 cookie）     |
| GET    | `/api/auth/me`           | 取得目前使用者                |
| POST   | `/api/auth/check-userid` | 檢查 userId 可用性            |

### 貼文（6 個端點）

| Method | Endpoint               | Description               |
| ------ | ---------------------- | ------------------------- |
| GET    | `/api/posts`           | 列出貼文（分頁、篩選）    |
| POST   | `/api/posts`           | 建立貼文                  |
| GET    | `/api/posts/[id]`      | 取得單一貼文與留言        |
| PATCH  | `/api/posts/[id]`      | 更新貼文（僅作者/管理員） |
| DELETE | `/api/posts/[id]`      | 刪除貼文（僅作者/管理員） |
| POST   | `/api/posts/[id]/like` | 切換按讚                  |

### 留言（4 個端點）

| Method | Endpoint                     | Description               |
| ------ | ---------------------------- | ------------------------- |
| POST   | `/api/comments`              | 建立留言                  |
| DELETE | `/api/comments/[id]`         | 刪除留言（僅作者/管理員） |
| POST   | `/api/comments/[id]/like`    | 切換按讚                  |
| GET    | `/api/comments/[id]/replies` | 取得留言回覆              |

### 使用者（2 個端點）

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| GET    | `/api/user/[userId]` | 取得使用者個人資料與統計 |
| PATCH  | `/api/user/[userId]` | 更新使用者個人資料       |

### 管理員（5 個端點 - 僅管理員）

| Method | Endpoint                      | Description    |
| ------ | ----------------------------- | -------------- |
| GET    | `/api/admin/posts`            | 取得所有貼文   |
| DELETE | `/api/admin/posts/[id]`       | 刪除任何貼文   |
| GET    | `/api/admin/users`            | 取得所有使用者 |
| POST   | `/api/admin/users/[id]/ban`   | 封鎖使用者     |
| POST   | `/api/admin/users/[id]/unban` | 解封使用者     |

### 工具（2 個端點）

| Method | Endpoint          | Description                             |
| ------ | ----------------- | --------------------------------------- |
| POST   | `/api/upload`     | 上傳頭像（最大 4MB，JPEG/PNG/GIF/WebP） |
| POST   | `/api/revalidate` | 手動 ISR 快取失效（密鑰保護）           |

## 📝 可用指令

### 開發

```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### 測試與文件

```bash
pnpm storybook        # Start Storybook (localhost:6006)
pnpm build-storybook  # Build Storybook
```

### 資料庫

```bash
pnpm dlx prisma generate        # Generate Prisma client
pnpm dlx prisma migrate dev     # Run migrations (dev)
pnpm dlx prisma migrate deploy  # Deploy migrations (prod)
pnpm dlx prisma studio          # Open Prisma Studio GUI
```

## 🎯 使用指南

### 註冊新使用者

1. 前往 [http://localhost:3000](http://localhost:3000)
2. 點擊「註冊」
3. 填寫表單：
   - **使用者 ID**：1-12 個英數字元（唯一使用者名稱）
   - **姓名**：顯示名稱
   - **電子郵件**：有效的電子郵件地址
   - **密碼**：至少 8 個字元
   - **性別**：男性/女性/其他（選填）
   - **生日**：您的生日（選填）
   - **頭像**：上傳圖片（選填，最大 4MB）
4. 點擊「提交」

### 登入

1. 在導覽列點擊「登入」
2. 輸入您的電子郵件和密碼
3. 點擊「登入」
4. 您將被重新導向到首頁，顯示熱門貼文

### 建立貼文

1. 點擊「新貼文」按鈕（右側浮動按鈕）
2. 填寫表單：
   - **標題**：貼文標題
   - **內容**：貼文內容（支援多行）
   - **標籤**：逗號分隔的標籤（例如：「boxing, training, tips」）
3. 點擊「提交」
4. 您的貼文將出現在首頁

### 在貼文下方留言

1. 點擊任何貼文卡片以查看貼文詳細頁面
2. 向下滾動到留言表單
3. 撰寫您的留言
4. 點擊「發布留言」
5. 要回覆留言，請點擊留言上的「回覆」按鈕

### 對貼文和留言按讚

- 點擊任何貼文或留言上的愛心圖示（♡）來按讚
- 再次點擊以取消按讚
- 按讚數會即時更新

### 查看您的個人資料

1. 在導覽列點擊您的頭像
2. 選擇「個人資料」
3. 查看您的統計：
   - 總貼文數
   - 總留言數
   - 總按讚數
   - 積分
4. 標籤頁：總覽、貼文、留言、按讚

### 編輯您的個人資料

1. 在導覽列點擊您的頭像
2. 選擇「設定」
3. 更新您的資訊：
   - 姓名、暱稱、性別、生日
   - 上傳新頭像
4. 點擊「儲存」

### 管理員儀表板（僅管理員）

1. 以管理員使用者登入（在資料庫中設定 `isAdmin: true`）
2. 前往 `/admin`
3. **貼文管理標籤頁**：
   - 查看所有貼文與統計
   - 刪除任何貼文（需確認）
4. **使用者管理標籤頁**：
   - 查看所有使用者與統計
   - 封鎖/解封使用者

## 🌐 國際化（i18n）

應用程式支援 4 種語言：

- **英語（en）**
- **日語（ja）** - 預設
- **簡體中文（zh-CN）**
- **繁體中文（zh-TW）**

要變更語言，應用程式目前使用瀏覽器語言偵測。您可以在 `lib/constants.ts` 中修改預設語言。

## 🔒 安全功能

- **密碼安全**：Bcrypt 雜湊（10 輪），不儲存明文
- **JWT 身份驗證**：HTTP-only cookies、7 天過期、生產環境安全標誌、SameSite: Lax
- **輸入驗證**：所有輸入使用 Zod 架構，伺服器端驗證
- **檔案上傳安全**：類型驗證（僅 JPEG/PNG/GIF/WebP）、大小限制（4MB）、唯一檔名生成
- **API 安全**：所有受保護路由的身份驗證檢查、管理員角色檢查、透過 SameSite cookies 的 CSRF 保護
- **資料庫安全**：級聯刪除、唯一約束、無 SQL 注入（Prisma ORM）

## ⚡ 效能優化

- **ISR（增量靜態重新生成）**：首頁 60 秒重新驗證
- **熱門貼文演算法**：基於參與度和時間的智慧排名
- **React Compiler**：啟用自動優化
- **元件快取**：在 Next.js 設定中啟用
- **優化查詢**：統一的 Prisma selects 以減少過度擷取
- **資料庫索引**：PostLike 和 CommentLike 在 userId 和 postId 上建立索引

## 🚀 部署

### Vercel（推薦）

1. **準備儲存庫**：

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **部署到 Vercel**：

   - 在 [vercel.com](https://vercel.com) 註冊
   - 點擊「New Project」
   - 匯入您的 GitHub/GitLab 儲存庫
   - Vercel 會自動偵測 Next.js
   - 新增環境變數（參見 `.env.local` 章節）
   - 點擊「Deploy」

3. **設定資料庫**（如果使用 Neon）：

   - 建立 Neon 專案
   - 將連線字串複製到 Vercel 環境變數
   - Vercel 會自動執行 `pnpm build`，其中包含 `prisma generate`

4. **設定 Blob 儲存**：

   - 前往 Vercel Dashboard → Storage → Create Blob Store
   - 將 `BLOB_READ_WRITE_TOKEN` 複製到環境變數

5. **執行遷移**：

   ```bash
   # After first deployment, run migrations
   vercel env pull .env.production
   pnpm dlx prisma migrate deploy
   ```

6. **建立管理員使用者**：
   - 開啟 Prisma Studio：`pnpm dlx prisma studio`
   - 或使用 SQL：`UPDATE "User" SET "isAdmin" = true WHERE "email" = 'your@email.com';`

### 手動部署

對於其他平台（AWS、DigitalOcean 等），請確保：

- 安裝 Node.js 20+
- 可存取 PostgreSQL 資料庫
- 設定環境變數
- 執行 `pnpm build` 和 `pnpm start`

## 🧪 測試

### Storybook

```bash
# Start Storybook
pnpm storybook

# Visit http://localhost:6006
```

### Vitest（未來）

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## 🗺️ 路線圖

請參閱 [TODO.md](TODO.md) 以查看完整功能路線圖。

### 高優先級

- [ ] 貼文列表無限滾動
- [ ] 搜尋功能（貼文/使用者的全文搜尋）
- [ ] 個人資料卡片元件（多種尺寸）

### 中優先級

- [ ] 訂閱系統（追蹤/取消追蹤使用者）
- [ ] 通知（即時）
- [ ] 貼文表單重新設計（置頂而非獨立頁面）

### 未來功能

- [ ] 推薦演算法（基於機器學習）
- [ ] 積分系統功能（賺取/花費積分）
- [ ] 比賽預測功能（對拳擊比賽下注）
- [ ] 比賽和選手的評分系統
- [ ] Google OAuth（社交登入）
- [ ] 完整 i18n 實作（i18next 或 next-intl）

## 📖 文件

- **CLAUDE.md**：AI 助理的綜合技術文件
- **CHANGELOG.md**：包含詳細功能描述的開發日誌
- **TODO.md**：包含難度評級的功能路線圖

## 🤝 貢獻

這是個人專案。如有建議或錯誤回報，請建立 issue。

## 📄 授權

私人專案 - 保留所有權利。

## 🙏 致謝

- [Next.js](https://nextjs.org) - React 框架
- [shadcn/ui](https://ui.shadcn.com) - UI 元件函式庫
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架
- [Prisma](https://prisma.io) - ORM
- [Vercel](https://vercel.com) - 託管和基礎設施
- [Neon](https://neon.tech) - Serverless PostgreSQL

## 📞 支援

如有問題或問題，請：

1. 查看現有文件（CLAUDE.md、CHANGELOG.md）
2. 搜尋現有 issues
3. 建立包含詳細描述的新 issue
