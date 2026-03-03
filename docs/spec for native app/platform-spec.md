# Geek Out With Me — Platform Specification

> Last updated: 2026-02-24
> Purpose: ネイティブアプリ開発ロードマップ策定のための現行Web版仕様書

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| 名前 | Geek Out With Me |
| URL | https://geekout-withme.pages.dev |
| 概要 | 英語・日本語の学習プラットフォーム（レベル診断、AI ワークブック、ボイスラウンジ、コミュニティ） |
| 対象ユーザー | 日本語と英語の学習者（日本在住の英語学習者がメインターゲット） |
| 現在のフェーズ | テスト版（プレミアム機能を全ユーザーに期間限定解放中。Apple アプリ申請準備中） |

---

## 2. テクノロジースタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Astro 5 (SSR) + React 18 + Tailwind CSS 3.4 |
| ホスティング | Cloudflare Pages |
| データベース | Supabase (PostgreSQL + Auth + Storage + RLS) |
| リアルタイム | Cloudflare Durable Objects (WebSocket) |
| AI | Cloudflare Workers AI (Llama 3.1 70B / 8B) |
| 決済 | Stripe（サブスク + 単品購入） |
| メール | Resend |
| 音声 | Web Speech API, Web Audio API |
| i18n | 自前実装（Cookie ベース、EN/JA） |

### 主要依存パッケージ

```
@astrojs/cloudflare, @astrojs/react, @supabase/ssr, @supabase/supabase-js,
stripe, resend, nanoid, marked, simple-peer, heic2any
```

---

## 3. ページ一覧

### 公開ページ

| ルート | 説明 | 認証 |
|--------|------|------|
| `/` | ランディングページ | 不要 |
| `/level-check` | レベル診断（Text / Listening / Voice） | 不要（AI分析はログイン推奨） |
| `/resources` | 学習リソースライブラリ（98件） | 不要 |
| `/conversation-cards` | 会話トピックカード | 不要（プレビュー3枚） |
| `/community` | コミュニティ紹介 | 不要 |
| `/links` | SNS・外部リンク | 不要 |
| `/contact` | お問い合わせフォーム | 不要 |
| `/services` | サービス一覧 | 不要 |
| `/legal`, `/privacy`, `/terms` | 法的ページ | 不要 |

### 認証ページ

| ルート | 説明 |
|--------|------|
| `/login` | ログイン（メール/パスワード + Google OAuth） |
| `/signup` | 新規登録 |
| `/forgot-password` | パスワードリセット申請 |
| `/auth/callback` | OAuth コールバック |
| `/auth/reset-password` | パスワード再設定 |

### 要ログインページ

| ルート | 説明 | Premium |
|--------|------|---------|
| `/profile` | プロフィール編集（名前、アバター、パスワード） | - |
| `/history` | レベル診断履歴 | - |
| `/workbook` | ワークブック一覧 | 要 |
| `/workbook/create` | ワークブック作成（AIチャット） | 要 |
| `/workbook/[id]` | ワークブック詳細 | 要 |
| `/workbook/[id]/[day]` | 日次レッスン | 要 |
| `/voice-lounge` | ボイスラウンジ | 要 |
| `/admin` | 管理者ダッシュボード | 管理者のみ |

---

## 4. API エンドポイント一覧

### レベル診断

| Method | エンドポイント | クォータ | 説明 |
|--------|---------------|---------|------|
| POST | `/api/analyze-text` | level_check | テキスト/リスニング問題のAI分析 |
| POST | `/api/analyze-voice` | level_check | スピーキングのAI分析 |
| POST | `/api/save-assessment` | - | 診断結果をDBに保存 |
| GET | `/api/assessment-history` | - | 診断履歴取得 |

### ワークブック

| Method | エンドポイント | クォータ | 説明 |
|--------|---------------|---------|------|
| POST | `/api/workbook/generate` | workbook | 30日間ワークブック生成開始 |
| POST | `/api/workbook/chat` | - | 作成前チャット（ノーカウント） |
| GET | `/api/workbook/status/[id]` | - | 生成進捗確認（ノーカウント） |
| GET | `/api/workbook/latest-level` | - | 最新レベル自動取得 |

### ボイスラウンジ

| Method | エンドポイント | クォータ | 説明 |
|--------|---------------|---------|------|
| GET | `/api/rooms` | - | ルーム一覧 |
| POST | `/api/rooms` | - | ルーム作成 |
| GET | `/api/rooms/[id]/ws` | - | WebSocket接続（Durable Objects経由） |
| POST | `/api/rooms/[id]/cleanup` | - | ルーム掃除 |
| POST | `/api/translate` | translation | メッセージ翻訳 |

### 決済

| Method | エンドポイント | 説明 |
|--------|---------------|------|
| POST | `/api/create-checkout` | Stripeサブスクチェックアウト作成 |
| POST | `/api/create-service-checkout` | 単品購入チェックアウト作成 |
| GET | `/api/billing-portal` | Stripe管理ポータルへリダイレクト |
| POST | `/api/webhooks/stripe` | Stripe Webhook受信 |

### その他

| Method | エンドポイント | 説明 |
|--------|---------------|------|
| GET | `/api/usage` | 本日のAI使用量取得 |
| POST | `/api/set-language` | UI言語設定 |
| POST | `/api/contact` | お問い合わせ送信 |
| GET | `/api/admin/stats` | 管理者統計 |

---

## 5. データベーススキーマ

### テーブル一覧

| テーブル | 概要 | RLS |
|----------|------|-----|
| `profiles` | ユーザープロフィール（display_name, avatar_url, language_preference） | 全員読み取り、本人のみ更新 |
| `assessment_results` | レベル診断結果（language, mode, text/listening/voice_level, feedback） | 本人のみ |
| `stripe_customers` | Supabase ↔ Stripe顧客マッピング | 本人読み取り |
| `subscriptions` | サブスク状態（status, price_id, period_start/end, cancel_at_period_end） | 本人読み取り |
| `purchases` | 単品購入履歴（product_type, stripe_session_id, amount） | 本人読み取り |
| `voice_rooms` | ボイスチャットルーム（name, language, is_permanent, participant_count） | 全員読み取り、認証ユーザー作成可 |
| `workbooks` | ワークブック本体（topic, level, destination, status, days_completed, is_public） | 本人 + 公開分 |
| `workbook_days` | 日次コンテンツ（day_number, item_en/ja/emoji, content_json） | ワークブック所有者 |
| `daily_usage` | グローバル日次AI使用量（level_check, workbook, translation） | 全員読み取り |

### RPC 関数

| 関数 | 説明 |
|------|------|
| `increment_usage(p_feature, p_limit)` | アトミックにカウント加算。上限超過時は `-1` |
| `get_daily_usage()` | 今日の使用量を返す |

### 管理者用 View (5つ)

`admin_user_stats`, `admin_assessment_stats`, `admin_subscription_stats`, `admin_workbook_stats`, `admin_daily_signups`

---

## 6. 主要機能の仕様

### 6.1 レベル診断 (Level Check)

- **対応言語:** 英語 (CEFR: A1–C1), 日本語 (JLPT: N5–N1)
- **モード:** Text / Listening / Voice / All
- **問題構成:** 各レベル10問プールからランダム5問出題
- **通過条件:** 3/5 正解でレベルクリア
- **選択肢:** 毎回シャッフル
- **AI分析:** Workers AI (Llama 3.1 70B) でフィードバック生成
- **制限:** 月1回（ユーザー別）+ 日次グローバルクォータ5回

### 6.2 AI ワークブック (Workbook)

- **概要:** AIが30日間のパーソナライズ英語/日本語ワークブックを生成
- **前提:** Premium会員限定、月1冊
- **作成フロー:**
  1. チャットで好みを伝える（言語、テーマ、レベル、目標地）
  2. AIが30個のトピックアイテムを生成
  3. バックグラウンドで30日分のコンテンツを順次生成
- **日次コンテンツ:** 本文、語彙リスト、クイズ3問、会話練習、学習ヒント
- **公開機能:** 他のPremium会員に公開可能

### 6.3 ボイスラウンジ (Voice Lounge)

- **概要:** リアルタイムテキスト/音声チャットルーム
- **前提:** Premium会員限定
- **常設ルーム:** Chat Lounge, Focus Room（常時オープン）
- **ユーザー作成ルーム:** 一時的なルーム作成可能
- **通信方式:** Cloudflare Durable Objects (WebSocket)
- **機能:**
  - テキストチャット（画像送信対応）
  - WebRTC 音声通話（simple-peer）
  - メッセージ翻訳（Workers AI、Premium限定）
  - 会話カード共有（リッチ表示）
  - セッションタイマー（start / language_switch / end）
  - 参加者リスト・プレゼンス管理

### 6.4 日次AIクォータシステム

- **方式:** グローバル（サイト全体）の固定枠
- **上限:**

| 機能 | 上限/日 | カウント対象 |
|------|---------|-------------|
| Level Check | 5回 | `analyze-text` + `analyze-voice` で各1 |
| Workbook | 1回 | `generate` のみ |
| Translation | 50回 | `translate` |

- **UI:** 右下フローティングバー（折りたたみ/展開、インラインスタイル）
- **エラー処理:** DB障害時はフェイルオープン（リクエストを通す）

### 6.5 決済

| プラン | 価格 | タイプ |
|--------|------|--------|
| Premium Community | ¥500/月 | サブスクリプション |
| AI ワークブック（単品） | ¥3,000 | 1回購入 |
| 初回コーチング体験 | ¥2,000 | 1回購入（3ヶ月クールダウン） |
| 単発コーチングセッション | ¥10,000 | 1回購入（初回体験完了が必要） |

- **状態:** テストキーで運用中（本番切替未実施）
- **Webhook:** `checkout.session.completed`, `customer.subscription.*` を処理

---

## 7. 認証・認可

| 方式 | 詳細 |
|------|------|
| 認証基盤 | Supabase Auth (JWT) |
| ログイン方法 | メール/パスワード + Google OAuth |
| セッション管理 | Cookie ベース（Supabase SSR） |
| 検証 | Middleware で `getSession()` — DB不要のJWT検証 |
| Premium判定 | `subscriptions` テーブルの `status` = `active` or `trialing` |
| 管理者判定 | `ADMIN_EMAILS` 環境変数でメールアドレスマッチ |
| RLS | 全テーブルで有効化。ユーザーデータは本人のみアクセス |

---

## 8. i18n（国際化）

- **対応言語:** English (en), Japanese (ja)
- **検出順:** Cookie (`lang=`) → ユーザー設定 → デフォルト (en)
- **翻訳ファイル:** `src/i18n/translations/en.json`, `ja.json`
- **キー数:** 約 630 キー（各言語）
- **パターン:** `t(lang, 'key.path')` (Astro) / コンポーネント内で props 経由

---

## 9. デプロイ

```bash
npm run build && npx wrangler pages deploy dist --project-name geekout-withme --branch main
```

- **Git連携:** 無効（手動デプロイのみ）
- **ビルドプロセス:** `astro build` → `patch-worker.mjs`（WebSocketインターセプタ注入）
- **環境変数:** Cloudflare Pages Dashboard で設定。シークレットは `locals.runtime.env` 経由

---

## 10. Cloudflare 固有の構成

### Workers AI

- **バインディング:** `AI`
- **使用モデル:**
  - `@cf/meta/llama-3.1-70b-instruct` — レベル診断分析、ワークブック生成
  - `@cf/meta/llama-3.1-8b-instruct` — 翻訳（軽量）
- **無料枠:** 10,000 ニューロン/日

### Durable Objects

- **バインディング:** `VOICE_ROOM`
- **クラス:** `VoiceRoom`（外部スクリプト `geekout-voice-room`）
- **用途:** ボイスラウンジのWebSocket管理、参加者プレゼンス、メッセージブロードキャスト

### WebSocket パッチ

- `scripts/patch-worker.mjs` で `dist/_worker.js` を後処理
- Astro の SSR パイプラインをバイパスして WebSocket 101 レスポンスを直接返す
- 認証・Premium判定・ルーム容量チェックを含む

---

## 11. コンポーネント構成

### React コンポーネント一覧（主要）

| カテゴリ | コンポーネント | 説明 |
|----------|---------------|------|
| 診断 | `LevelCheckApp`, `TextAssessment`, `ListeningAssessment`, `VoiceAssessment`, `Results` | レベル診断のフルフロー |
| 認証 | `LoginForm`, `SignupForm`, `UserMenu`, `ForgotPasswordForm`, `ResetPasswordForm` | 認証UI |
| ボイス | `VoiceLounge`, `RoomList`, `ChatRoom`, `ChatPanel`, `ParticipantList`, `ConversationCards` | リアルタイムチャット |
| ワークブック | `ChatBot`, `GenerationProgress`, `WorkbookCard`, `SlotPreview`, `Quiz` | AI ワークブック |
| リソース | `ResourceLibrary`, `ConversationCardsStandalone` | 学習教材 |
| ユーザー | `ProfileEditor`, `AssessmentHistory`, `LanguageToggle`, `LanguageSelector` | ユーザー設定 |
| 決済 | `PricingCard`, `ServicesPage` | 課金 |
| 管理 | `AdminDashboard` | 管理画面 |
| UI | `UsageBar` | AI使用量表示 |

---

## 12. 静的アセット

| パス | 説明 |
|------|------|
| `/favicon.ico`, `/favicon-*.png` | ファビコン |
| `/apple-touch-icon.png` | iOS ブックマークアイコン |
| `/icon-192x192.png`, `/icon-512x512.png` | PWA アイコン |
| `/ogp-1200x630.png` | OGP 画像 |
| `/manifest.json` | PWA マニフェスト |
| `/audio/**` | リスニング問題の音声ファイル |

---

## 13. ネイティブアプリ移行に向けた考慮事項

### API再利用性

現在の `/api/*` エンドポイントは REST ベースで、JSON リクエスト/レスポンス。ネイティブアプリからそのまま呼び出し可能。ただし以下に注意:

- **認証:** Cookie ベース → Bearer トークンへの変更が必要
- **WebSocket:** Durable Objects の URL に直接接続可能
- **CORS:** 現在設定なし → ネイティブアプリ用に追加不要（same-origin制約なし）

### データ層

- Supabase はモバイル SDK（`@supabase/supabase-flutter` / Swift / Kotlin）あり
- RLS がそのまま活用可能
- Storage（アバター画像）もモバイル SDK 対応

### 移植が必要な機能

| 機能 | Web実装 | ネイティブでの検討事項 |
|------|---------|----------------------|
| レベル診断 | React + Web Speech API | ネイティブ音声認識 API (iOS: Speech Framework, Android: SpeechRecognizer) |
| ボイスラウンジ | WebRTC (simple-peer) | ネイティブ WebRTC ライブラリ or 専用SDK |
| リスニング音声 | HTML5 Audio | ネイティブオーディオプレーヤー |
| PWA | manifest.json | 不要（ネイティブアプリ自体） |
| プッシュ通知 | 未実装 | APNs / FCM で実装 |
| オフライン | 未対応 | ワークブックコンテンツのローカルキャッシュ |

### 決済

- **iOS:** Apple IAP への移行が必須（App Store ガイドライン）
- **Android:** Google Play Billing or Stripe（Web経由も可能）
- 現在の Stripe 連携は Web でのみ維持、アプリ内は IAP に切り替え

---

## 14. 環境変数一覧

| 変数名 | スコープ | 用途 |
|--------|----------|------|
| `PUBLIC_SUPABASE_URL` | Public | Supabase プロジェクト URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase 匿名キー |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Stripe 公開キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Supabase 管理キー |
| `CF_AI_TOKEN` | Secret | Cloudflare AI トークン |
| `CF_ACCOUNT_ID` | Secret | Cloudflare アカウント ID |
| `STRIPE_SECRET_KEY` | Secret | Stripe シークレットキー |
| `STRIPE_WEBHOOK_SECRET` | Secret | Stripe Webhook 署名シークレット |
| `STRIPE_PRICE_ID` | Secret | Premium サブスクの価格 ID |
| `STRIPE_WORKBOOK_PRICE_ID` | Secret | ワークブック単品の価格 ID |
| `STRIPE_COACHING_PRICE_ID` | Secret | 初回コーチングの価格 ID |
| `STRIPE_SESSION_PRICE_ID` | Secret | 単発セッションの価格 ID |

---

## 15. 現在の制限事項・TODO

| 項目 | 状態 |
|------|------|
| Stripe テスト→本番キー切替 | 未実施 |
| プッシュ通知 | 未実装 |
| オフラインサポート | 未実装 |
| レート制限（ユーザー別） | グローバルのみ実装済み |
| 画像最適化 | Astro image service: noop（Cloudflare未対応） |
| テスト (Unit / E2E) | 未実装 |
| エラートラッキング (Sentry 等) | 未導入 |
| Analytics | Cloudflare Web Analytics のみ |
