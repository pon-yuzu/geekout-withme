# Geek Out With Me — Platform Specification

> Last updated: 2026-03-03
> Purpose: サイトの機能とシステムの全体像。パッケージ設計・ネイティブアプリ化の参照資料。

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| 名前 | Geek Out With Me |
| URL | https://geekout-withme.pages.dev |
| 概要 | 英語・日本語の学習プラットフォーム（レベル診断、AI ワークブック、ボイスラウンジ、コミュニティ、予約、コーチング） |
| 対象ユーザー | 日本語と英語の学習者（日本在住の英語学習者がメインターゲット） |
| 現在のフェーズ | テスト版（プレミアム機能を全ユーザーに3/31まで無料開放中） |

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

---

## 3. ティア（会員ランク）システム

### 3.1 ティア定義

| ティア | レベル | 決定条件 |
|--------|--------|----------|
| **free** | 0 | デフォルト |
| **premium** | 1 | Stripe サブスク (active/trialing) or profiles.tier = 'premium' or プロモ期間中 |
| **personal** | 2 | profiles.tier = 'personal'（admin手動設定） |

判定順序: profiles.tier → subscriptions テーブル → プロモ判定 → free

### 3.2 ティア別機能アクセス

| 機能 | Free | Premium | Personal |
|------|:----:|:-------:|:--------:|
| **レベル診断** (Text/Listening/Voice) | ○ (月1回) | ○ | ○ |
| **学習リソースライブラリ** (98件) | ○ | ○ | ○ |
| **会話カード** (プレビュー3枚) | ○ | ○ | ○ |
| **コミュニティ掲示板** (基本) | ○ | ○ | ○ |
| **AI ワークブック** (月1冊) | × | ○ | ○ |
| **Voice Lounge** (テキスト/音声チャット) | × | ○ | ○ |
| **翻訳機能** (チャット/掲示板) | × | ○ (50回/日) | ○ |
| **会話カード** (75枚フル) | × | ○ | ○ |
| **掲示板 Premium ボード** | × | ○ | ○ |
| **レッスンアーカイブ** (教材保管) | × | × | ○ |
| **掲示板 Personal Members ボード** | × | × | ○ |
| **予約: Personal コーチング** | × | × | ○ |

### 3.3 プロモキャンペーン

- **期間:** 〜2026/3/31 23:59 JST
- **効果:** 全 free ユーザーに premium 相当のアクセスを付与
- **終了後:** 通常の premium ゲート復活

---

## 4. ページ一覧

### 公開ページ（認証不要）

| ルート | 説明 |
|--------|------|
| `/` | ランディングページ（自動スライドショー、プロモバナー） |
| `/level-check` | レベル診断（Text / Listening / Voice / All） |
| `/resources` | 学習リソースライブラリ（98件） |
| `/conversation-cards` | 会話トピックカード（Free: 3枚、Premium: 75枚） |
| `/community` | コミュニティ紹介 |
| `/services` | サービス一覧・料金 |
| `/gowm` | GOWM（YouTube出演パッケージ）LP |
| `/links` | SNS・外部リンク |
| `/contact` | お問い合わせフォーム |
| `/legal`, `/privacy`, `/terms` | 法的ページ |
| `/book/[name]` | ゲスト予約（ホスト名指定、現在 yuzu のみ） |

### 認証ページ

| ルート | 説明 |
|--------|------|
| `/login` | ログイン（メール/パスワード + Google OAuth） |
| `/signup` | 新規登録 |
| `/forgot-password` | パスワードリセット申請 |
| `/auth/callback` | OAuth コールバック |
| `/auth/reset-password` | パスワード再設定 |

### 要ログインページ

| ルート | 必要ティア | 説明 |
|--------|-----------|------|
| `/profile` | free+ | プロフィール編集（名前、アバター、パスワード） |
| `/history` | free+ | レベル診断履歴 |
| `/board` | free+ | コミュニティ掲示板（ボード別アクセス制御） |
| `/board/[slug]` | ボード依存 | 個別ボード（スレッド一覧） |
| `/board/[slug]/new` | ボード依存 | スレッド作成 |
| `/board/thread/[id]` | ボード依存 | スレッド詳細・返信 |
| `/workbook` | premium+ | ワークブック一覧 |
| `/workbook/create` | premium+ | ワークブック作成（AIチャット） |
| `/workbook/[id]` | premium+ | ワークブック詳細 |
| `/workbook/[id]/[day]` | premium+ | 日次レッスン |
| `/booking` | free+ | 予約カレンダー（booking_type は tier 依存） |
| `/my-bookings` | free+ | 予約履歴 |
| `/my-archive` | personal | レッスンアーカイブ（教材保管） |
| `/admin` | admin | 管理者ダッシュボード |

### サービス購入後ページ

| ルート | 説明 |
|--------|------|
| `/services/coaching/thanks` | 初回コーチング購入後（LINE/メールで日程調整） |
| `/services/session/thanks` | 単発セッション購入後（LINE/メールで日程調整） |
| `/services/workbook/thanks` | ワークブック購入後（ヒアリングフォーム） |

---

## 5. 主要機能の仕様

### 5.1 レベル診断 (Level Check)

- **対応言語:** 英語 (CEFR: A1–C1), 日本語 (JLPT: N5–N1)
- **モード:** Text / Listening / Voice / All
- **問題構成:** 各レベル10問プールからランダム5問出題
- **通過条件:** 3/5 正解でレベルクリア
- **選択肢:** 毎回シャッフル
- **AI分析:** Workers AI (Llama 3.1 70B) でフィードバック生成
- **制限:** 月1回（ユーザー別）+ 日次グローバルクォータ5回
- **UI:** 正誤フィードバック(0.8s)、レベルステッパー、レベル通過フラッシュ
- **Allモード:** Text → Listening → Voice → Results

### 5.2 AI ワークブック (Workbook)

- **前提:** Premium 以上限定、月1冊
- **作成フロー:**
  1. チャットで好みを伝える（言語、テーマ、レベル、目標地）
  2. AIが30個のトピックアイテムを生成
  3. バックグラウンドで30日分のコンテンツを順次生成
- **日次コンテンツ:** 本文、語彙リスト、クイズ3問、会話練習、学習ヒント
- **公開機能:** 他の Premium 会員に公開可能
- **単品購入:** ¥3,000（AIではなくコーチが直接ヒアリングして作成）

### 5.3 ボイスラウンジ (Voice Lounge)

- **前提:** Premium 以上限定（現在 feature flag + ホワイトリストで制御）
- **常設ルーム:** Chat Lounge, Focus Room
- **通信方式:** Cloudflare Durable Objects (WebSocket) + WebRTC (simple-peer)
- **機能:**
  - テキストチャット（画像送信対応）
  - WebRTC 音声通話
  - メッセージ翻訳（Workers AI、Premium限定、50回/日）
  - 会話カード共有（リッチカード表示）
  - セッションタイマー（start / language_switch / end）
  - 参加者リスト・プレゼンス管理

### 5.4 コミュニティ掲示板 (Board)

- **ボード:** 9個（おしらせ、はじめまして、しゃべろ、ほめて、おしえて、おすすめ、なおして、できたらいいな、Personal Members）
- **アクセス制御:** ボードごとに access_tier 設定（null=全員、'premium'、'personal'）
- **機能:** スレッド作成、返信、いいね、AI翻訳（キャッシュ付き）
- **i18n:** UIは翻訳済み、ユーザー投稿は原文のまま

### 5.5 予約システム (Booking)

- **現在の仕組み:**
  - 管理者が曜日×時間帯の定期スロット + 単発日スロットを作成
  - スロットに duration / buffer / type (single/personal/both) を設定
  - ユーザーは空きスロットをカレンダーから選んで予約
- **予約タイプ:** single（単発）、personal（パーソナル、personal ティア限定）
- **ゲスト予約:** `/book/yuzu` から名前・メール入力で予約可能
- **予約管理:** admin がステータス変更、Zoom URL・メモ追加

> **リデザイン検討中:** サービスファーストモデルへの移行
> - 管理者は空き時間帯だけ定義（duration なし）
> - ユーザーがサービス（60分 or 90分）を選択 → duration はサービスに紐づく
> - クーポンシステムで価格制御（Mocca Special、GOWM伴走、調整など）

### 5.6 レッスンアーカイブ (My Archive)

- **前提:** Personal ティア限定 + admin
- **機能:** ファイルアップロード（画像/PDF、10MB上限）、ピン留め、セッション日付・メモ
- **ストレージ:** Supabase Storage (lesson-archive バケット、signed URL)

### 5.7 日次AIクォータシステム

| 機能 | 上限/日 | 対象 |
|------|---------|------|
| Level Check | 5回 | グローバル |
| Workbook | 1回 | グローバル |
| Translation | 50回 | Premium ユーザー別 |

- **UI:** 右下フローティングバー（折りたたみ/展開）
- **障害時:** フェイルオープン（リクエストを通す）

---

## 6. 決済 (Stripe)

### サブスクリプション

| プラン | 価格 | タイプ |
|--------|------|--------|
| Premium Community | ¥500/月 | 定期 |

### 単品購入

| 商品 | 価格 | 条件 |
|------|------|------|
| オーダーメイドワークブック | ¥3,000 | ログイン必須 |
| 初回コーチング体験 (60分) | ¥2,000 | 1人1回（3ヶ月クールダウン） |
| 単発セッション (90分) | ¥10,000 | 初回体験完了が必要 |

### Webhook

`checkout.session.completed`, `customer.subscription.*` を処理

### 状態

テストキーで運用中（本番切替未実施）

---

## 7. サービス商品一覧（現行 /services ページ）

| # | サービス | 価格 | 備考 |
|---|----------|------|------|
| 1 | 無料で始める | ¥0 | Level Check + 会話カード3枚、登録不要 |
| 2 | Premium会員 | ¥500/月 | Voice Lounge, 会話カード75枚, 翻訳, AIワークブック |
| 3 | オーダーメイドワークブック | ¥3,000 | コーチがヒアリング→作成→メール納品 |
| 4 | 初回コーチング体験 | ¥2,000 / 60分 | 1人1回、3ヶ月リセット |
| 5 | 単発セッション | ¥10,000 / 90分 | 初回体験完了必須 |
| 6 | GOWM 出演パッケージ | ¥30,000〜 / ¥50,000〜 | ベーシック or しっかり伴走（モニター価格） |
| 7 | セミナー・研修・グループ | 要問合せ | 企業研修、コラボイベント等 |
| 8 | パーソナルコーチング | 要問合せ | 年間契約、LINE無制限 |

---

## 8. 管理者ダッシュボード (/admin)

**アクセス:** ADMIN_EMAILS 環境変数でメールアドレスマッチ

### タブ

| タブ | 機能 |
|------|------|
| **Stats** | ユーザー統計、診断統計、サブスク統計、ワークブック統計、日次登録グラフ |
| **Users** | ユーザー検索、ティア変更（free/premium/personal）、ページネーション |
| **Archives** | 生徒のレッスンファイル管理 |
| **Booking** | 予約管理（ステータス変更、Zoom URL追加）、定期スロット管理、単発スロット管理 |

---

## 9. API エンドポイント一覧

### レベル診断

| Method | エンドポイント | 説明 |
|--------|---------------|------|
| POST | `/api/analyze-text` | テキスト/リスニング AI分析 |
| POST | `/api/analyze-voice` | スピーキング AI分析 |
| POST | `/api/save-assessment` | 診断結果保存 |
| GET | `/api/assessment-history` | 診断履歴取得 |
| POST | `/api/reserve-usage` | クォータ予約 |

### ワークブック

| Method | エンドポイント | 説明 |
|--------|---------------|------|
| POST | `/api/workbook/generate` | 30日間ワークブック生成 |
| POST | `/api/workbook/chat` | 作成前チャット |
| GET | `/api/workbook/status/[id]` | 生成進捗確認 |
| GET | `/api/workbook/latest-level` | 最新レベル取得 |

### ボイスラウンジ

| Method | エンドポイント | 説明 |
|--------|---------------|------|
| GET | `/api/rooms` | ルーム一覧 |
| POST | `/api/rooms` | ルーム作成 |
| GET | `/api/rooms/[id]/ws` | WebSocket接続 |
| POST | `/api/rooms/[id]/cleanup` | ルーム掃除 |
| POST | `/api/translate` | メッセージ翻訳 (Premium) |

### 掲示板

| Method | エンドポイント | 説明 |
|--------|---------------|------|
| GET | `/api/board/boards` | ボード一覧（ティア別フィルタ） |
| GET | `/api/board/threads` | スレッド一覧（ページネーション） |
| GET | `/api/board/threads/[id]` | スレッド詳細 |
| POST | `/api/board/replies` | 返信投稿 |
| POST | `/api/board/likes` | いいねトグル |
| POST | `/api/board/translate` | 投稿翻訳（キャッシュ付き） |

### 予約

| Method | エンドポイント | 説明 |
|--------|---------------|------|
| GET | `/api/booking/available-slots` | 空きスロット取得 |
| POST | `/api/booking/create` | メンバー予約作成 |
| POST | `/api/booking/create-guest` | ゲスト予約作成 |
| DELETE | `/api/booking/cancel` | 予約キャンセル |
| GET | `/api/booking/my-bookings` | 自分の予約一覧 |

### 予約 (Admin)

| Method | エンドポイント | 説明 |
|--------|---------------|------|
| GET/POST/PATCH | `/api/booking/admin-slots` | 定期スロット CRUD |
| GET/POST/DELETE | `/api/booking/admin-oneoff-slots` | 単発スロット CRUD |
| GET/PATCH | `/api/booking/admin-bookings` | 予約管理 |

### レッスンアーカイブ

| Method | エンドポイント | 説明 |
|--------|---------------|------|
| GET | `/api/lesson-archive/files` | ファイル取得 |
| POST | `/api/lesson-archive/files` | ファイルアップロード |
| PATCH | `/api/lesson-archive/pin` | ピン留めトグル |

### 決済

| Method | エンドポイント | 説明 |
|--------|---------------|------|
| POST | `/api/create-checkout` | Premium サブスクチェックアウト |
| POST | `/api/create-service-checkout` | 単品購入チェックアウト |
| GET | `/api/billing-portal` | Stripe管理ポータル |
| POST | `/api/webhooks/stripe` | Stripe Webhook |

### その他

| Method | エンドポイント | 説明 |
|--------|---------------|------|
| GET | `/api/usage` | AI使用量取得 |
| POST | `/api/set-language` | UI言語設定 |
| POST | `/api/contact` | お問い合わせ送信 |
| GET | `/api/admin/stats` | 管理者統計 |
| GET/PATCH | `/api/admin/users` | ユーザー検索・ティア変更 |

---

## 10. データベーススキーマ

### テーブル一覧

| テーブル | 概要 |
|----------|------|
| `profiles` | ユーザー情報（display_name, avatar_url, language_preference, tier） |
| `assessment_results` | レベル診断結果（mode, text/listening/voice_level, feedback） |
| `stripe_customers` | Supabase ↔ Stripe 顧客マッピング |
| `subscriptions` | サブスク状態（status, price_id, period_start/end） |
| `purchases` | 単品購入履歴（product_type, amount） |
| `daily_usage` | グローバル日次AI使用量 |
| `voice_rooms` | ボイスチャットルーム |
| `workbooks` | ワークブック本体（topic, level, status, is_public） |
| `workbook_days` | 日次コンテンツ（day_number, content_json） |
| `boards` | 掲示板ボード（slug, name_en/ja, access_tier） |
| `threads` | スレッド（board_id, title, body, user_id） |
| `replies` | 返信（thread_id, body, user_id） |
| `board_likes` | いいね（thread/reply, user_id） |
| `board_translation_cache` | 翻訳キャッシュ |
| `booking_slots` | 定期予約スロット（曜日, 時間帯, duration, buffer, type） |
| `booking_oneoff_slots` | 単発予約スロット（日付, 時間帯, duration, buffer, type） |
| `booking_slot_overrides` | スロットオーバーライド |
| `bookings` | 予約本体（user_id, slot_start/end, booking_type, status, zoom_url） |
| `lesson_files` | レッスンアーカイブ（student_id, file_type, session_date, memo, is_pinned） |

### RPC 関数

| 関数 | 説明 |
|------|------|
| `increment_usage(p_feature, p_limit)` | アトミックにカウント加算。上限超過時は `-1` |
| `get_daily_usage()` | 今日の使用量を返す |
| `get_available_slots(p_week_start, p_weeks)` | 空きスロット算出（定期+単発、既存予約を除外） |

---

## 11. 認証・認可

| 方式 | 詳細 |
|------|------|
| 認証基盤 | Supabase Auth (JWT) |
| ログイン方法 | メール/パスワード + Google OAuth |
| セッション管理 | Cookie ベース（Supabase SSR） |
| 検証 | Middleware で `getSession()` — DB不要のJWT検証 |
| Premium判定 | `getUserTier()` → subscriptions.status / profiles.tier / promo |
| 管理者判定 | `ADMIN_EMAILS` 環境変数でメールアドレスマッチ |
| RLS | 全テーブルで有効化。ユーザーデータは本人のみアクセス |

---

## 12. i18n（国際化）

- **対応言語:** English (en), Japanese (ja)
- **検出順:** Cookie (`lang=`) → ユーザー設定 → デフォルト (en)
- **翻訳ファイル:** `src/i18n/translations/en.json`, `ja.json`
- **キー数:** 約 630 キー（各言語）

---

## 13. デプロイ

```bash
npm run build && npx wrangler pages deploy dist --project-name geekout-withme --branch main
```

- **Git連携:** 無効（手動デプロイのみ）
- **ビルドプロセス:** `astro build` → `patch-worker.mjs`（WebSocketインターセプタ注入）
- **環境変数:** Cloudflare Pages Dashboard で設定。シークレットは `locals.runtime.env` 経由

---

## 14. Cloudflare 固有の構成

### Workers AI

- **バインディング:** `AI`
- **使用モデル:**
  - `@cf/meta/llama-3.1-70b-instruct` — レベル診断分析、ワークブック生成
  - `@cf/meta/llama-3.1-8b-instruct` — 翻訳（軽量）

### Durable Objects

- **バインディング:** `VOICE_ROOM`
- **クラス:** `VoiceRoom`（外部スクリプト `geekout-voice-room`）
- **用途:** WebSocket管理、プレゼンス、メッセージブロードキャスト

### WebSocket パッチ

- `scripts/patch-worker.mjs` で `dist/_worker.js` を後処理
- Astro SSR パイプラインをバイパスして WebSocket 101 レスポンスを直接返す

---

## 15. 環境変数一覧

| 変数名 | スコープ | 用途 |
|--------|----------|------|
| `PUBLIC_SUPABASE_URL` | Public | Supabase プロジェクト URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase 匿名キー |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Stripe 公開キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Supabase 管理キー |
| `CF_AI_TOKEN` | Secret | Cloudflare AI トークン |
| `CF_ACCOUNT_ID` | Secret | Cloudflare アカウント ID |
| `STRIPE_SECRET_KEY` | Secret | Stripe シークレットキー |
| `STRIPE_WEBHOOK_SECRET` | Secret | Stripe Webhook 署名 |
| `STRIPE_PRICE_ID` | Secret | Premium サブスクの価格 ID |
| `STRIPE_WORKBOOK_PRICE_ID` | Secret | ワークブック単品の価格 ID |
| `STRIPE_COACHING_PRICE_ID` | Secret | 初回コーチングの価格 ID |
| `STRIPE_SESSION_PRICE_ID` | Secret | 単発セッションの価格 ID |
| `ADMIN_EMAILS` | Secret | 管理者メールアドレス（カンマ区切り） |

---

## 16. 現在の制限事項・TODO

| 項目 | 状態 |
|------|------|
| Stripe テスト→本番キー切替 | 未実施 |
| 予約システムのサービスファースト化 | 設計中 |
| クーポンシステム | 未実装 |
| GOWM/Personal パッケージ整理 | 検討中 |
| プッシュ通知 | 未実装 |
| オフラインサポート | 未実装 |
| レート制限（ユーザー別） | グローバルのみ |
| テスト (Unit / E2E) | 未実装 |
| エラートラッキング (Sentry 等) | 未導入 |

---

## 17. SQL マイグレーション一覧

| ファイル | 内容 |
|----------|------|
| 001 | Auth + Profiles |
| 002 | Assessment Results |
| 003 | Stripe Subscriptions |
| 004 | Voice Rooms |
| 005 | Workbooks |
| 006 | Permanent Rooms |
| 007 | Language Preference |
| 008 | Workbook Public |
| 009 | RLS Hardening |
| 010 | Workbook Sample Access |
| 011 | Listening Level |
| 012 | Avatars Storage |
| 013 | Admin Stats Views |
| 014 | Workbook Language |
| 015 | Japanese Sample Workbooks |
| 016 | Purchases |
| 017 | Daily Usage |
| 018 | Boards (Community) |
| 019 | User Tiers |
| 020 | Board Access Tier |
| 020b | Lesson Archive |
| 021 | Booking System |
| 022 | Booking One-off Slots |
