# ShuPra - 匿名就活練習アプリ

高難度企業を目指す就活生のための匿名面接練習プラットフォーム。
ケース面接・志望動機・最終面接の練習相手を匿名で見つけ、Google Meetで練習できます。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase のセットアップ

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. Authentication > Providers で以下を有効化:
   - Email (Magic Link を有効に)
   - Google OAuth
3. Authentication > URL Configuration で以下を設定:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/api/auth/callback`

### 3. マイグレーション

Supabase ダッシュボードの SQL Editor で `supabase/migrations/0001_init.sql` を実行してください。

または Supabase CLI を使用:

```bash
npx supabase db push
```

### 4. Google Cloud / Calendar API の設定

1. [Google Cloud Console](https://console.cloud.google.com) でプロジェクトを作成
2. Google Calendar API を有効化
3. サービスアカウントを作成し、JSON キーをダウンロード
4. Google Workspace を使用している場合:
   - ドメイン全体の委任を有効化
   - スコープ: `https://www.googleapis.com/auth/calendar`
5. サービスアカウントのメールアドレスに対象カレンダーの編集権限を付与

### 5. 環境変数

`.env.example` をコピーして `.env.local` を作成:

```bash
cp .env.example .env.local
```

各値を設定してください:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `NEXT_PUBLIC_APP_URL`: アプリのURL (`http://localhost:3000`)
- `GOOGLE_CLIENT_EMAIL`: サービスアカウントのメールアドレス
- `GOOGLE_PRIVATE_KEY`: サービスアカウントの秘密鍵
- `GOOGLE_CALENDAR_ID`: カレンダーID (通常 `primary`)
- `GOOGLE_IMPERSONATED_USER_EMAIL`: 委任対象ユーザーのメール

### 6. ローカル起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## Render デプロイ

1. Render で新しい Web Service を作成
2. リポジトリを接続
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Environment Variables に上記の環境変数をすべて設定
6. Supabase の Redirect URLs にデプロイ先URLを追加

## 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, RLS)
- Google Calendar API
- Zod
- date-fns
- lucide-react
