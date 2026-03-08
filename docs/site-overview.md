# Uchiwai サイト全体像

> 最終更新: 2026-03-09

---

## 1. ユーザーパターン一覧

### 1.1 ユーザー種別

| 種別 | 判定方法 | 概要 |
|------|----------|------|
| **未ログイン（Guest）** | `locals.user === null` | サイト閲覧のみ。無料体験予約は可能 |
| **Free会員** | ログイン済み + `tier = 'free'` | 基本機能（リソース、サンプルWB、掲示板の一部） |
| **Premium会員** | Stripe課金 or プロモ期間中 | AI Workbook作成・閲覧、Voice Lounge、Premium掲示板 |
| **Personal会員** | `profiles.tier = 'personal'`（管理者が手動設定） | 専属コーチング生徒。全機能 + カスタムWB + レッスンアーカイブ |
| **Admin** | `ADMIN_EMAILS` 環境変数に含まれるメール | 管理ダッシュボード + 全ユーザーデータ閲覧・操作 |

> **注:** Admin はティアとは独立。Free + Admin も Personal + Admin もありうる。

### 1.2 ティア判定の優先順位（`getUserTier()`）

1. `profiles.tier` が `personal` かつ未期限切れ → **Personal**
2. `profiles.tier` が `premium` かつ未期限切れ → **Premium**
3. `subscriptions` テーブルに `active` / `trialing` レコードあり → **Premium**
4. `isPromoActive()` が true（〜2026-04-30） → **Premium**
5. 上記いずれにも該当しない → **Free**

### 1.3 権限マトリクス

| 機能 | Guest | Free | Premium | Personal | Admin |
|------|:-----:|:----:|:-------:|:--------:|:-----:|
| **公開ページ閲覧**（トップ、リソース、サービス等） | ✅ | ✅ | ✅ | ✅ | ✅ |
| **レベルチェック**（準備中） | ✅ | ✅ | ✅ | ✅ | ✅ |
| **会話カード** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **無料体験予約**（`/booking/free-trial`） | ✅ | ✅ | ✅ | ✅ | ✅ |
| **お問い合わせ** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **プロフィール編集** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **評価履歴** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **掲示板（public）** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **掲示板（premium）** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **掲示板（personal）** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **AI Workbook 閲覧**（サンプル） | ❌ | ✅ | ✅ | ✅ | ✅ |
| **AI Workbook 作成** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **AI Workbook ライブラリ** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Voice Lounge** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **予約（公開セッション 60分）** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **カスタムWorkbook** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **My Portal（`/my`）** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **予約（Personal 90分）** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **レッスンアーカイブ** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **LINE無制限サポート** | ❌ | ❌ | 🛒 | ✅ | ✅ |
| **管理ダッシュボード** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **ユーザー管理・ティア変更** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **WB生成・レビュー・デプロイ** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **予約スロット・クーポン管理** | ❌ | ❌ | ❌ | ❌ | ✅ |

> 🛒 = 別途アドオン購入で利用可能

---

## 2. ユーザージャーニー（導線）

### 2.1 Guest（未ログイン）

```
トップページ（/）
  ├─→ リソース閲覧（/resources）→ CTA: AI Workbook（/workbook）
  ├─→ 会話カード（/conversation-cards）→ CTA: サービス（/services）
  ├─→ レベルチェック（/level-check）→ Coming Soon
  ├─→ 無料体験LP（/free-session）→ 無料体験予約（/booking/free-trial）
  ├─→ サービス・料金（/services）→ Stripe Checkout → サインアップ
  ├─→ コミュニティ（/community）→ Chat'n'Chill情報 + Premium CTA
  ├─→ リンク集（/links）→ 外部SNS
  └─→ サインアップ（/signup）→ ログイン（/login）→ Free会員へ
```

**主要コンバージョンポイント:**
- `/free-session` → `/booking/free-trial`（ライフコーチング無料体験）
- `/services`（料金ページ）→ Stripe Checkout → Premium会員化
- `/signup` → 新規登録

---

### 2.2 Free会員

```
ログイン後 → トップ（/）
  ├─→ AI Workbook（/workbook）→ サンプル閲覧のみ → CTA: /services
  ├─→ 掲示板（/board）→ public掲示板のみ閲覧・投稿
  ├─→ プロフィール（/profile）→ アカウント設定
  ├─→ Voice Lounge（/voice-lounge）→ Premium必要 → CTA
  └─→ 予約（/booking）→ 公開セッション（60分、Stripe決済）
```

**アップグレード導線:**
- `/workbook` でサンプルWB表示 → 「フルバージョンはこちら」→ `/services`
- `/voice-lounge` → Premium必要メッセージ → `/community`
- `/conversation-cards` → 「Premium でもっと」→ `/services`

> **プロモ期間中（〜2026-04-30）:** Free会員も自動的にPremium機能が利用可能

---

### 2.3 Premium会員

```
ログイン後 → トップ（/）
  ├─→ AI Workbook（/workbook）
  │     ├─→ My Workbooks タブ → 自分のWB一覧
  │     ├─→ Public タブ → 公開WBブラウズ
  │     └─→ 新規作成（/workbook/create）→ ChatBot → 生成 → /workbook/[id]
  ├─→ Workbook学習（/workbook/[id]/[day]）→ 8セクション学習
  ├─→ Voice Lounge（/voice-lounge）→ ライブ会話練習
  ├─→ 掲示板（/board）→ public + premium掲示板
  ├─→ 予約（/booking）→ 公開セッション（60分）
  │     └─→ 決済成功（/booking/success）→ 予約一覧（/my-bookings）
  └─→ プロフィール（/profile）→ サブスク管理
```

**Personalへのアップグレード導線:**
- 管理者が手動で `profiles.tier` を `personal` に変更（自動導線なし）

---

### 2.4 Personal会員（専属コーチング生徒）

```
ログイン後 → My Portal（/my）★ メインハブ
  ├─→ カスタムWorkbook一覧
  │     └─→ /my/workbook/custom/[slug] → 進捗グリッド
  │           └─→ /my/workbook/custom/[slug]/day/[num] → 学習コンテンツ
  ├─→ 予約（/booking）→ Personal枠（90分、決済不要）
  ├─→ 予約履歴（/my-bookings）
  ├─→ レッスンアーカイブ（/my-archive）→ ファイル閲覧・管理
  ├─→ 掲示板（/board）→ 全掲示板（personal含む）
  ├─→ AI Workbook（/workbook）→ Premium機能すべて利用可
  └─→ プロフィール（/profile）
```

**特徴:**
- `/my` がメインダッシュボード（Free/Premiumは `/workbook` にリダイレクト）
- カスタムWBは管理者が生成・デプロイ
- LINE無制限サポート込み

---

### 2.5 Admin

```
ログイン後 → 管理ダッシュボード（/admin）★ メインハブ
  ├─→ ユーザー管理タブ → ティア変更、検索
  ├─→ Workbook管理タブ
  │     ├─→ Adaptive WB: 生成 → レビュー → 承認/却下/再生成
  │     └─→ Custom WB: 作成 → ファイルアップロード → デプロイ
  ├─→ 予約管理タブ → スロット設定、予約一覧
  ├─→ クーポン管理タブ → 作成・編集・削除
  ├─→ 掲示板管理 → パスワード設定
  └─→ 通常ユーザー機能もすべて利用可能
```

**管理者専用API:**
- `/api/admin/users` — ユーザー一覧・ティア変更
- `/api/admin/wb-*` — Workbook生成・レビュー・デプロイ
- `/api/admin/custom-workbooks` — カスタムWB CRUD
- `/api/booking/admin-*` — スロット・予約・クーポン管理

---

## 3. ページ遷移図

### 3.1 全ページ一覧（42ページ + API）

#### 公開ページ（21ページ）

| # | パス | 説明 |
|---|------|------|
| 1 | `/` | トップページ |
| 2 | `/login` | ログイン |
| 3 | `/signup` | 新規登録 |
| 4 | `/forgot-password` | パスワードリセット依頼 |
| 5 | `/auth/reset-password` | パスワード再設定 |
| 6 | `/auth/callback` | OAuth コールバック |
| 7 | `/level-check` | レベルチェック（Coming Soon） |
| 8 | `/resources` | リソースライブラリ |
| 9 | `/conversation-cards` | 会話カード |
| 10 | `/community` | コミュニティ |
| 11 | `/services` | サービス・料金 |
| 12 | `/services/workbook/thanks` | WB購入サンクス |
| 13 | `/services/coaching/thanks` | コーチング購入サンクス |
| 14 | `/services/session/thanks` | セッション購入サンクス |
| 15 | `/contact` | お問い合わせ |
| 16 | `/free-session` | 無料体験LP |
| 17 | `/booking/free-trial` | 無料体験予約フォーム |
| 18 | `/links` | リンク集 |
| 19 | `/gowm` | 旧サービスLP |
| 20 | `/privacy` | プライバシーポリシー |
| 21 | `/terms` | 利用規約 |
| 22 | `/legal` | 特定商取引法表示 |

#### 要ログインページ（14ページ）

| # | パス | 必要ティア | 説明 |
|---|------|-----------|------|
| 23 | `/profile` | Free+ | プロフィール編集 |
| 24 | `/history` | Free+ | 評価履歴 |
| 25 | `/booking` | Free+ | 予約カレンダー |
| 26 | `/booking/success` | — | 予約完了 |
| 27 | `/my-bookings` | Free+ | 予約履歴 |
| 28 | `/board` | Free+ | 掲示板一覧 |
| 29 | `/board/[slug]` | ティア別 | 掲示板詳細 |
| 30 | `/board/[slug]/new` | ティア別 | スレッド作成 |
| 31 | `/board/thread/[id]` | ティア別 | スレッド詳細 |
| 32 | `/workbook` | Free+（サンプル） / Premium（フル） | AI Workbook一覧 |
| 33 | `/workbook/create` | Premium | WB新規作成 |
| 34 | `/workbook/[id]` | 所有者 or 公開WB | WB概要・日数グリッド |
| 35 | `/workbook/[id]/[day]` | 所有者 or 公開WB | WB日次コンテンツ |
| 36 | `/voice-lounge` | Premium | Voice Lounge |
| 37 | `/my` | Personal | My Portal ダッシュボード |
| 38 | `/my/workbook/custom/[slug]` | Personal（所有者） | カスタムWB進捗 |
| 39 | `/my/workbook/custom/[slug]/day/[num]` | Personal（所有者） | カスタムWB日次 |
| 40 | `/my-archive` | Personal / Admin | レッスンアーカイブ |

#### 管理者専用ページ（1ページ）

| # | パス | 説明 |
|---|------|------|
| 41 | `/admin` | 管理ダッシュボード |

#### 特殊ページ（1ページ）

| # | パス | 説明 |
|---|------|------|
| 42 | `/book/[name]` | ゲスト予約（ホワイトリスト: `yuzu`のみ） |

---

### 3.2 ページ遷移図

```
┌─────────────────────────────────────────────────────────────────┐
│                    グローバルナビゲーション                         │
│  [Logo→/] [Level Check] [Learn▼] [Practice▼] [More▼] [Auth]    │
│                                                                 │
│  Learn:     /resources, /conversation-cards, /workbook, /my     │
│  Practice:  /community, /board, /voice-lounge                   │
│  More:      /services, /free-session, /booking, /links, /contact│
│  Auth:      /login, /signup (未ログイン) / Profile Menu (ログイン済み)│
│  Footer:    /contact, /terms, /privacy, /legal                  │
└─────────────────────────────────────────────────────────────────┘

=== 公開エリア ===

  /（トップ）
  ├──→ /level-check ──→ Coming Soon
  ├──→ /workbook ──→ サンプル閲覧
  ├──→ /voice-lounge ──→ Premium CTA
  ├──→ /community ──→ Chat'n'Chill + Premium CTA
  ├──→ /free-session ──→ /booking/free-trial ──→ 予約完了
  ├──→ /resources ──→ CTA: /workbook
  └──→ /services ──→ Stripe Checkout ──→ /services/*/thanks

  /login ←──→ /signup
  /login ──→ /forgot-password ──→ メール ──→ /auth/reset-password
  /signup ──→ /auth/callback ──→ /（ログイン後）

  /links ──→ 外部SNS（YouTube, note, Instagram, X 等）
  /gowm ──→ 旧サービス情報

=== 認証エリア（Free+） ===

  /profile ──→ サブスク管理（Stripe Portal）
  /history ──→ レベルチェック結果
  /booking ──→ /booking/success ──→ /my-bookings
  /my-bookings ──→ 予約詳細

=== 掲示板 ===

  /board ──→ /board/[slug] ──→ /board/thread/[id]
                  └──→ /board/[slug]/new ──→ /board/thread/[id]
  ※ 掲示板ごとに access_tier / password でアクセス制御

=== AI Workbook（Premium+） ===

  /workbook
  ├──→ /workbook/create ──→ ChatBot生成 ──→ /workbook/[id]
  └──→ /workbook/[id] ──→ /workbook/[id]/[day]（8セクション学習）

  ※ Free会員: サンプルWBのみ表示、「フルバージョン」CTA → /services

=== Personal エリア ===

  /my（ダッシュボード）
  ├──→ /my/workbook/custom/[slug] ──→ /my/workbook/custom/[slug]/day/[num]
  ├──→ /booking（90分 Personal枠）
  ├──→ /my-bookings
  ├──→ /my-archive ──→ ファイル閲覧・アップロード
  └──→ /profile

=== 管理エリア ===

  /admin
  ├──→ ユーザー管理（API: /api/admin/users）
  ├──→ WB生成・レビュー（API: /api/admin/wb-*）
  ├──→ カスタムWB管理（API: /api/admin/custom-workbooks）
  ├──→ 予約スロット管理（API: /api/booking/admin-slots）
  ├──→ クーポン管理（API: /api/booking/admin-coupons）
  └──→ 掲示板パスワード管理（API: /api/admin/board-password）

=== 特殊導線 ===

  /book/yuzu ──→ ゲスト予約フォーム ──→ Stripe Checkout
  /booking/free-trial ──→ ゲスト予約（Stripe不要、FREE_TRIALクーポン自動適用）

=== サンクスページ（購入後リダイレクト） ===

  Stripe Checkout 完了 →
  ├──→ /services/workbook/thanks（LINE アドオンCTA）
  ├──→ /services/coaching/thanks（LINE連絡先表示）
  └──→ /services/session/thanks
```

### 3.3 リダイレクト一覧

| 条件 | リダイレクト先 |
|------|---------------|
| `/my` にアクセス + Personal以外 | → `/workbook` |
| `/workbook/create` にアクセス + 未ログイン or 非Premium | → `/community` |
| `/admin` にアクセス + 非Admin | → `/` |
| `/my-archive` にアクセス + 非Personal & 非Admin | → `/` |
| `/login` or `/signup` にアクセス + ログイン済み | → `/` |
| `/booking` にアクセス + 未ログイン | → `/login` |
| `/board` にアクセス + 未ログイン | → `/login` |
| 旧ドメイン `geekout-withme.pages.dev` | → `https://uchiwai.app`（301） |

### 3.4 API エンドポイント一覧

| カテゴリ | エンドポイント | メソッド | 認証 |
|----------|--------------|----------|------|
| **認証** | `/api/auth/login` | POST | — |
| | `/api/auth/signup` | POST | — |
| | `/api/auth/callback` | GET | — |
| **Stripe** | `/api/create-checkout` | POST | ログイン |
| | `/api/create-service-checkout` | POST | ログイン |
| | `/api/webhooks/stripe` | POST | Stripe署名 |
| **予約** | `/api/booking/available-slots` | GET | ログイン |
| | `/api/booking/create` | POST | ログイン |
| | `/api/booking/create-guest` | POST | — |
| | `/api/booking/create-with-signup` | POST | — |
| | `/api/booking/cancel` | POST | ログイン |
| | `/api/booking/my-bookings` | GET | ログイン |
| | `/api/booking/validate-coupon` | POST | ログイン |
| | `/api/booking/admin-slots` | GET/POST/DELETE | Admin |
| | `/api/booking/admin-oneoff-slots` | GET/POST/DELETE | Admin |
| | `/api/booking/admin-bookings` | GET/DELETE | Admin |
| | `/api/booking/admin-coupons` | GET/POST/PATCH/DELETE | Admin |
| **Workbook** | `/api/workbook/generate` | POST | Premium |
| | `/api/workbook/status` | GET | ログイン |
| | `/api/workbook/progress` | GET/POST | ログイン |
| | `/api/workbook/chat` | POST | Premium |
| **カスタムWB** | `/api/custom-workbook/progress` | GET/POST | ログイン |
| **掲示板** | `/api/board/boards` | GET | ログイン |
| | `/api/board/threads` | GET/POST | ログイン |
| | `/api/board/replies` | GET/POST | ログイン |
| | `/api/board/likes` | POST | ログイン |
| | `/api/board/translate` | POST | ログイン |
| | `/api/board/unlock` | POST | ログイン |
| **レッスンアーカイブ** | `/api/lesson-archive/files` | GET/POST/DELETE | ログイン（Personal/Admin） |
| | `/api/lesson-archive/pin` | POST | ログイン |
| **管理** | `/api/admin/users` | GET/PATCH | Admin |
| | `/api/admin/stats` | GET | Admin |
| | `/api/admin/custom-workbooks` | GET/POST/DELETE | Admin |
| | `/api/admin/wb-configs` | GET/POST | Admin |
| | `/api/admin/wb-days` | GET | Admin |
| | `/api/admin/wb-generate` | POST | Admin |
| | `/api/admin/wb-generate-status` | GET | Admin |
| | `/api/admin/wb-review` | PUT/POST | Admin |
| | `/api/admin/wb-cron-generate` | POST | Admin/Cron |
| | `/api/admin/board-password` | POST | Admin |
| **その他** | `/api/usage` | GET | ログイン |
| | `/api/contact` | POST | — (Turnstile) |
| | `/api/delete-account` | POST | ログイン |
| | `/api/booking/send-reminders` | POST | Cron |
