# BBS - Boxing Buddies Society

**Languages / 語言 / 言語**: [English](README.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

Next.js 16 で構築された本番環境対応のモダンな掲示板システム。完全な認証、管理者ダッシュボード、多言語対応（4 言語）、高度な ISR 最適化、美しい UI/UX を備えています。

## ✨ 機能

### コア機能

- ✅ **ユーザー認証とプロフィール**

  - カスタムユーザー名（userId）とアバターアップロードで登録
  - JWT によるログイン/ログアウト（HTTP-only cookies、7 日間有効期限）
  - 統計情報付きの公開ユーザープロフィール（投稿、コメント、いいね）
  - プロフィール編集（名前、性別、生年月日、アバター）
  - ユーザーの投稿、コメント、いいねしたコンテンツを表示
  - ポイントシステム（ユーザーあたり初期 1000 ポイント）

- ✅ **投稿管理**

  - 投稿の作成、読み取り、更新、削除
  - タイトル、コンテンツ、タグ付きの投稿
  - 投稿へのいいね/いいね解除
  - 自動閲覧数追跡
  - 投稿統計（閲覧数、いいね数、コメント数）
  - **人気投稿アルゴリズム**と ISR 最適化

- ✅ **コメントシステム**

  - 投稿へのコメント
  - ネストされた返信（無制限の深度）
  - コメントへのいいね/いいね解除
  - コメント削除（作成者/管理者のみ）
  - コメント統計（いいね数、返信数）

- ✅ **管理者ダッシュボード**

  - 管理者のみアクセス可能、ロールチェック付き
  - 投稿管理（すべての投稿を表示、任意の投稿を削除）
  - ユーザー管理（すべてのユーザーを表示、ユーザーの禁止/解除）
  - ページネーション対応

- ✅ **高度なパフォーマンス**

  - ISR（インクリメンタル静的再生成）、60 秒の再検証
  - 人気投稿アルゴリズム：`(いいね数 × 2) + (コメント数 × 1.5) + (閲覧数 × 0.1) + 時間減衰`
  - 手動キャッシュ無効化 API
  - React Compiler 有効化
  - コンポーネントキャッシュ

- ✅ **国際化（i18n）**

  - 4 言語：英語、日本語（デフォルト）、簡体字中国語、繁体字中国語
  - 100+ の翻訳キー
  - すべての UI テキスト、エラー、検証メッセージが翻訳済み

- ✅ **モダンな UI/UX**
  - 32+ shadcn/ui コンポーネント（New York スタイル）
  - ダークモード対応
  - レスポンシブデザイン（モバイルファースト）
  - スムーズなアニメーション（Motion ライブラリ）
  - Toast 通知
  - 読み込み状態（スケルトン画面）
  - ホバーカード（プロフィールプレビュー）
  - グラスモーフィズム効果

## 🚀 技術スタック

- **フレームワーク**：Next.js 16.0.1（App Router、React 19.2.0、TypeScript 5）
- **データベース**：PostgreSQL（Neon serverless）と Prisma ORM 6.19.0
- **UI ライブラリ**：shadcn/ui（32+ コンポーネント）+ Tailwind CSS 4
- **アニメーション**：Motion 12（Framer Motion の後継）
- **認証**：JWT（jose）+ bcryptjs
- **フォーム**：React Hook Form + Zod バリデーション
- **ファイルストレージ**：Vercel Blob（アバター、最大 4MB）
- **分析**：Vercel Analytics
- **テスト**：Storybook 10 + Vitest 4 + Playwright
- **パッケージマネージャー**：pnpm

## 📋 前提条件

- **Node.js**：20.x 以上
- **パッケージマネージャー**：pnpm（必須）
- **データベース**：PostgreSQL（または serverless 用の Neon アカウント）
- **クラウドストレージ**：Vercel アカウント（Blob ストレージ用）

## 🛠️ インストール

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd bbs
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

ルートディレクトリに `.env.local` ファイルを作成：

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

#### データベース認証情報の取得（Neon）

1. [neon.tech](https://neon.tech) でサインアップ
2. 新しいプロジェクトを作成
3. ダッシュボードからすべての接続文字列をコピー
4. `.env.local` に貼り付け

#### Vercel Blob Token の取得

1. [vercel.com](https://vercel.com) でサインアップ
2. 新しいプロジェクトを作成（または既存のプロジェクトをリンク）
3. Storage → Blob → Create Blob Store に移動
4. `BLOB_READ_WRITE_TOKEN` をコピー

### 4. データベースの設定

```bash
# Generate Prisma client
pnpm dlx prisma generate

# Run migrations
pnpm dlx prisma migrate dev

# (Optional) Open Prisma Studio to view database
pnpm dlx prisma studio
```

### 5. 開発サーバーの起動

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認します。

## 📁 プロジェクト構造

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

## 🗄️ データベーススキーマ

### モデル

- **User**：id、userId（一意のユーザー名）、name、nickname、email、password、gender、birthDate、avatar、isAdmin、isBanned、points（初期 1000）、createdAt、updatedAt
- **Post**：id、title、content、userId、tags[]、views、likes、createdAt、updatedAt
- **Comment**：id、content、userId、postId、parentId、likes、replies、createdAt、updatedAt
- **PostLike**：id、userId、postId、createdAt（userId+postId の一意制約）
- **CommentLike**：id、userId、commentId、createdAt（userId+commentId の一意制約）

## 🔌 API エンドポイント（合計 20）

### 認証（5 エンドポイント）

| Method | Endpoint                 | Description                           |
| ------ | ------------------------ | ------------------------------------- |
| POST   | `/api/auth/register`     | 新規ユーザー登録                      |
| POST   | `/api/auth/login`        | ユーザーログイン（JWT cookie を返す） |
| POST   | `/api/auth/logout`       | ユーザーログアウト（cookie をクリア） |
| GET    | `/api/auth/me`           | 現在のユーザーを取得                  |
| POST   | `/api/auth/check-userid` | userId の可用性を確認                 |

### 投稿（6 エンドポイント）

| Method | Endpoint               | Description                                  |
| ------ | ---------------------- | -------------------------------------------- |
| GET    | `/api/posts`           | 投稿一覧（ページネーション、フィルタリング） |
| POST   | `/api/posts`           | 投稿作成                                     |
| GET    | `/api/posts/[id]`      | 単一投稿とコメントを取得                     |
| PATCH  | `/api/posts/[id]`      | 投稿更新（作成者/管理者のみ）                |
| DELETE | `/api/posts/[id]`      | 投稿削除（作成者/管理者のみ）                |
| POST   | `/api/posts/[id]/like` | いいね切り替え                               |

### コメント（4 エンドポイント）

| Method | Endpoint                     | Description                       |
| ------ | ---------------------------- | --------------------------------- |
| POST   | `/api/comments`              | コメント作成                      |
| DELETE | `/api/comments/[id]`         | コメント削除（作成者/管理者のみ） |
| POST   | `/api/comments/[id]/like`    | いいね切り替え                    |
| GET    | `/api/comments/[id]/replies` | コメント返信を取得                |

### ユーザー（2 エンドポイント）

| Method | Endpoint             | Description                      |
| ------ | -------------------- | -------------------------------- |
| GET    | `/api/user/[userId]` | ユーザープロフィールと統計を取得 |
| PATCH  | `/api/user/[userId]` | ユーザープロフィールを更新       |

### 管理者（5 エンドポイント - 管理者のみ）

| Method | Endpoint                      | Description            |
| ------ | ----------------------------- | ---------------------- |
| GET    | `/api/admin/posts`            | すべての投稿を取得     |
| DELETE | `/api/admin/posts/[id]`       | 任意の投稿を削除       |
| GET    | `/api/admin/users`            | すべてのユーザーを取得 |
| POST   | `/api/admin/users/[id]/ban`   | ユーザーを禁止         |
| POST   | `/api/admin/users/[id]/unban` | ユーザーの禁止を解除   |

### ユーティリティ（2 エンドポイント）

| Method | Endpoint          | Description                                         |
| ------ | ----------------- | --------------------------------------------------- |
| POST   | `/api/upload`     | アバターアップロード（最大 4MB、JPEG/PNG/GIF/WebP） |
| POST   | `/api/revalidate` | 手動 ISR キャッシュ無効化（シークレット保護）       |

## 📝 利用可能なスクリプト

### 開発

```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### テストとドキュメント

```bash
pnpm storybook        # Start Storybook (localhost:6006)
pnpm build-storybook  # Build Storybook
```

### データベース

```bash
pnpm dlx prisma generate        # Generate Prisma client
pnpm dlx prisma migrate dev     # Run migrations (dev)
pnpm dlx prisma migrate deploy  # Deploy migrations (prod)
pnpm dlx prisma studio          # Open Prisma Studio GUI
```

## 🎯 使用ガイド

### 新規ユーザー登録

1. [http://localhost:3000](http://localhost:3000) に移動
2. 「登録」をクリック
3. フォームに入力：
   - **ユーザー ID**：1-12 文字の英数字（一意のユーザー名）
   - **名前**：表示名
   - **メールアドレス**：有効なメールアドレス
   - **パスワード**：最低 8 文字
   - **性別**：男性/女性/その他（オプション）
   - **生年月日**：生年月日（オプション）
   - **アバター**：画像をアップロード（オプション、最大 4MB）
4. 「送信」をクリック

### ログイン

1. ナビゲーションバーで「ログイン」をクリック
2. メールアドレスとパスワードを入力
3. 「ログイン」をクリック
4. 人気投稿のあるホームページにリダイレクトされます

### 投稿を作成

1. 「新規投稿」ボタン（右側のフローティングボタン）をクリック
2. フォームに入力：
   - **タイトル**：投稿タイトル
   - **コンテンツ**：投稿コンテンツ（複数行対応）
   - **タグ**：カンマ区切りのタグ（例：「boxing, training, tips」）
3. 「送信」をクリック
4. 投稿がホームページに表示されます

### 投稿にコメント

1. 任意の投稿カードをクリックして投稿詳細ページを表示
2. コメントフォームまでスクロール
3. コメントを記入
4. 「コメントを投稿」をクリック
5. コメントに返信するには、コメントの「返信」ボタンをクリック

### 投稿とコメントにいいね

- 任意の投稿やコメントのハートアイコン（♡）をクリックしていいね
- 再度クリックしていいねを解除
- いいね数がリアルタイムで更新されます

### プロフィールを表示

1. ナビゲーションバーでアバターをクリック
2. 「プロフィール」を選択
3. 統計を確認：
   - 総投稿数
   - 総コメント数
   - 総いいね数
   - ポイント
4. タブ：概要、投稿、コメント、いいね

### プロフィールを編集

1. ナビゲーションバーでアバターをクリック
2. 「設定」を選択
3. 情報を更新：
   - 名前、ニックネーム、性別、生年月日
   - 新しいアバターをアップロード
4. 「保存」をクリック

### 管理者ダッシュボード（管理者のみ）

1. 管理者ユーザーとしてログイン（データベースで `isAdmin: true` を設定）
2. `/admin` に移動
3. **投稿管理タブ**：
   - すべての投稿と統計を表示
   - 任意の投稿を削除（確認付き）
4. **ユーザー管理タブ**：
   - すべてのユーザーと統計を表示
   - ユーザーの禁止/解除

## 🌐 国際化（i18n）

アプリは 4 言語をサポート：

- **英語（en）**
- **日本語（ja）** - デフォルト
- **簡体字中国語（zh-CN）**
- **繁体字中国語（zh-TW）**

言語を変更するには、アプリは現在ブラウザの言語検出を使用します。`lib/constants.ts` でデフォルト言語を変更できます。

## 🔒 セキュリティ機能

- **パスワードセキュリティ**：Bcrypt ハッシュ（10 ラウンド）、平文保存なし
- **JWT 認証**：HTTP-only cookies、7 日間有効期限、本番環境での secure フラグ、SameSite: Lax
- **入力検証**：すべての入力に Zod スキーマ、サーバーサイド検証
- **ファイルアップロードセキュリティ**：タイプ検証（JPEG/PNG/GIF/WebP のみ）、サイズ制限（4MB）、一意のファイル名生成
- **API セキュリティ**：すべての保護されたルートでの認証チェック、管理者ロールチェック、SameSite cookies による CSRF 保護
- **データベースセキュリティ**：カスケード削除、一意制約、SQL インジェクションなし（Prisma ORM）

## ⚡ パフォーマンス最適化

- **ISR（インクリメンタル静的再生成）**：60 秒の再検証でホームページ
- **人気投稿アルゴリズム**：エンゲージメントと時間に基づくインテリジェントなランキング
- **React Compiler**：自動最適化を有効化
- **コンポーネントキャッシュ**：Next.js 設定で有効化
- **最適化されたクエリ**：過剰な取得を減らすための統一された Prisma selects
- **データベースインデックス**：PostLike と CommentLike が userId と postId にインデックス化

## 🚀 デプロイ

### Vercel（推奨）

1. **リポジトリの準備**：

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Vercel にデプロイ**：

   - [vercel.com](https://vercel.com) でサインアップ
   - 「New Project」をクリック
   - GitHub/GitLab リポジトリをインポート
   - Vercel が Next.js を自動検出
   - 環境変数を追加（`.env.local` セクションを参照）
   - 「Deploy」をクリック

3. **データベースの設定**（Neon を使用する場合）：

   - Neon プロジェクトを作成
   - 接続文字列を Vercel 環境変数にコピー
   - Vercel が `prisma generate` を含む `pnpm build` を自動実行

4. **Blob ストレージの設定**：

   - Vercel Dashboard → Storage → Create Blob Store に移動
   - `BLOB_READ_WRITE_TOKEN` を環境変数にコピー

5. **マイグレーションの実行**：

   ```bash
   # After first deployment, run migrations
   vercel env pull .env.production
   pnpm dlx prisma migrate deploy
   ```

6. **管理者ユーザーの作成**：
   - Prisma Studio を開く：`pnpm dlx prisma studio`
   - または SQL を使用：`UPDATE "User" SET "isAdmin" = true WHERE "email" = 'your@email.com';`

### 手動デプロイ

他のプラットフォーム（AWS、DigitalOcean など）の場合、以下を確認：

- Node.js 20+ がインストールされている
- PostgreSQL データベースにアクセス可能
- 環境変数が設定されている
- `pnpm build` と `pnpm start` を実行

## 🧪 テスト

### Storybook

```bash
# Start Storybook
pnpm storybook

# Visit http://localhost:6006
```

### Vitest（将来）

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## 🗺️ ロードマップ

完全な機能ロードマップについては [TODO.md](TODO.md) を参照してください。

### 高優先度

- [ ] 投稿リストの無限スクロール
- [ ] 検索機能（投稿/ユーザーの全文検索）
- [ ] プロフィールカードコンポーネント（複数サイズ）

### 中優先度

- [ ] 購読システム（ユーザーのフォロー/フォロー解除）
- [ ] 通知（リアルタイム）
- [ ] 投稿フォームの再設計（別ページではなく上部固定）

### 将来の機能

- [ ] 推薦アルゴリズム（ML ベース）
- [ ] ポイントシステム機能（ポイントの獲得/消費）
- [ ] 試合予測機能（ボクシング試合に賭ける）
- [ ] 試合とファイターの評価システム
- [ ] Google OAuth（ソーシャルログイン）
- [ ] 完全な i18n 実装（i18next または next-intl）

## 📖 ドキュメント

- **CLAUDE.md**：AI アシスタント向けの包括的な技術ドキュメント
- **CHANGELOG.md**：詳細な機能説明を含む開発ログ
- **TODO.md**：難易度評価付きの機能ロードマップ

## 🤝 貢献

これは個人プロジェクトです。提案やバグレポートについては、issue を作成してください。

## 📄 ライセンス

プライベートプロジェクト - 全著作権所有。

## 🙏 謝辞

- [Next.js](https://nextjs.org) - React フレームワーク
- [shadcn/ui](https://ui.shadcn.com) - UI コンポーネントライブラリ
- [Tailwind CSS](https://tailwindcss.com) - CSS フレームワーク
- [Prisma](https://prisma.io) - ORM
- [Vercel](https://vercel.com) - ホスティングとインフラストラクチャ
- [Neon](https://neon.tech) - Serverless PostgreSQL

## 📞 サポート

質問や問題がある場合：

1. 既存のドキュメント（CLAUDE.md、CHANGELOG.md）を確認
2. 既存の issue を検索
3. 詳細な説明を含む新しい issue を作成

---

Next.js 16 と React 19 で構築 ❤️
