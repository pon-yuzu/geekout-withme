# GOWM 商品・ティア構造設計｜2026年3月

**作成日**: 2026年3月3日
**ステータス**: 構造確定、サイト反映待ち

---

## 設計思想

GOWMサイトを全商品の統合ポータルにする。言語交換で来た人も、英語コンサルの生徒も、ワーホリ支援の人も、ライフコーチングの人も、全員がGOWMサイトを使う。使う機能の配分が違うだけで、箱は一つ。

---

## ティア構造

### Free（入口）

誰でも登録できる。コミュニティへの最初の接点。

| 機能 | 内容 |
|------|------|
| Level Check | 英語レベル診断 |
| Resources Library | 学習リソース一覧 |
| Community Board | 一部閲覧可 |
| Chat'n'Chill | 週1 Zoom言語交換に参加可 |
| Life Balance Assessment | ライフバランス診断（Save My 12 Weeks） |

### Premium ¥500/月（コミュニティの住人）

サイトのフル機能にアクセス。学習を本格的に始めたい人向け。

| 機能 | 内容 |
|------|------|
| Free全機能 | — |
| AI Workbook | AI生成のパーソナライズ学習帳 |
| Voice Lounge | 24/7音声チャット（開発中） |
| 翻訳機能 | サイト内翻訳 |
| Community Board | 全機能アクセス |
| Lesson Archive | 閲覧可 |

### Personal（年間契約の生徒さん全員）

英語コーチング、ワーホリ支援、ライフコーチングを統合。外から見たら「Personal契約」一本。中の配分はその人次第。

| 機能 | 内容 |
|------|------|
| Premium全機能 | — |
| 予約機能 | Personal専用予約ページ |
| Lesson Archive | 自分専用の記録 |
| 週1セッション | 60分 1on1 |
| LINE伴走 | 日常サポート |
| カスタム教材 | フルカスタム開発 |

**年間契約 ¥600,000**（月あたり ¥50,000）

---

## 独立商品（ティア外）

サイト上で個別に見せる商品。ティアに含めず単体で提供。

### AI Workbook 単品 ¥3,000

- Premium未加入者向けの単品販売
- Premium会員は月額内で利用可

### YouTube出演コンサル（フレックスパッケージ）

- 独立商品としてサイト上に掲載
- 専用ページ（/gowm）で詳細説明
- 初月 ¥20,000（ヒアリング + 教材 + Premium + 掲示板 + リハ1回）
- 2ヶ月目〜 ¥5,000/月（教材更新 + Premium継続）
- オプション：伴走セッション ¥7,500/回、LINE無制限 ¥5,000/月

### First Coaching Session

- 初回限定クーポンで提供
- Personal契約への入口として機能
- クーポンコードで価格管理

### LINE無制限サポート ¥5,000/月

- 単体でも購入可能（Stripeサブスクリプション）
- ワークブック購入後のアップセル導線あり
- GOWM契約内ではオプションとして追加
- Personal契約には含まれる（追加課金なし）
- サイト上の管理：契約状態をダッシュボードに表示、adminで一覧管理

---

## クーポン管理で一元化する予約

| 対象 | クーポン | 価格 | 備考 |
|------|----------|------|------|
| 初回体験 | 初回限定クーポン | ¥2,000/60min | 1人1回 |
| Mocca Groupリゾバ | Mocca専用クーポン | ¥1,100/60min | 週1回まで |
| Personal生徒 | Personal専用クーポン or 予約枠 | 契約内 | — |
| 単発セッション | なし（通常価格） | ¥10,000/60min | 初回完了者のみ |

全て同じ予約ページ（/booking）から。クーポンで価格を分岐させる。

---

## サイト外で継続するもの（GOWMサイトに載せない）

| 項目 | プラットフォーム | 理由 |
|------|------------------|------|
| note有料記事（BBBA等） | note | ブランドが別、ターゲットも別 |
| note無料記事 | note | コンテンツマーケティングとして継続 |
| 30日メール講座 | メール（Mailgun/Laravel） | リード育成用、サイトとは別導線 |
| ゲスト出演・セミナー | お問い合わせベース | 案件ベース |

---

## ファネル全体像

```
【認知】
  Threads投稿（英→日 / 日→英 フレーズ）
  note記事
  YouTube

      ↓

【入口】Free登録
  Level Check / 言語交換参加
  Life Balance Assessment

      ↓

【定着】Premium ¥500/月
  AI Workbook / Voice Lounge / Board
  コミュニティ内でSayakaとの接点が増える

      ↓

【体験】初回クーポン or 出演コンサル
  First Coaching Session
  YouTube出演コンサル

      ↓

【契約】Personal 年間 ¥600,000
  英語 / ワーホリ / ライフコーチング
  配分はその人次第
```

---

## サイトのServicesページ掲載順（提案）

ユーザーが「安い→高い」で自然にステップアップしていく順番。

1. **Community (Chat'n'Chill)** — Free
2. **Premium Community** — ¥500/月
3. **AI Workbook** — ¥3,000（単品）
4. **LINE無制限サポート** — ¥5,000/月（単体 or ワークブックとセット）
5. **Single Coaching Session** — ¥10,000（初回クーポンあり）
6. **YouTube English Consulting** — ¥40,000〜
7. **Personal Coaching** — 年間契約（詳細はお問い合わせ）
8. **Guest Appearance / Seminar** — お問い合わせ

### 削除候補

- Life Balance Assessment → Servicesページからは外してFree機能として自然に導線に組み込む（現状は外部リンクでsavemy12weeks.comに飛ぶので浮いてる）

---

## 既存生徒のマッピング

| 現在の契約 | 移行先ティア | 変更点 |
|------------|-------------|--------|
| 英語コーチング年間 | Personal | 名称統合のみ、内容変更なし |
| ワーホリ支援年間 | Personal | 名称統合のみ、内容変更なし |
| ライフコーチング年間 | Personal | 名称統合のみ、内容変更なし |
| GOWMモニター生 | 出演コンサル → 正規価格化 | 値上げのタイミングで案内 |
| Mocca Groupリゾバ | クーポン経由で予約 | 予約ページ一元化 |

---

## 次のアクション

- [x] 予約ページ（/booking）をクーポン対応に → **実装済み**
- [x] クーポンシステムの設計・実装（初回/Mocca/その他）→ **実装済み**
- [x] ワークブック進捗管理の強化（完了マーク、進捗バー、ストリーク）→ **実装済み**
- [ ] カスタムワークブックのサイト内統合（下記「カスタム教材統合計画」参照）
- [x] LINE無制限サポートのStripe商品作成 + 契約管理 → **実装済み**
- [ ] Servicesページの掲載順・内容を更新
- [ ] 既存生徒にPersonal統合の案内（必要に応じて）
- [ ] Life Balance Assessmentのサイト内組み込み検討
- [ ] YouTube出演コンサルの新価格決定

---

## カスタム教材統合計画（Personal生徒向け）

**方針:** サイト内直接レンダリング（Supabase Storage + Astro SSR）
**ステータス:** 設計確定、実装待ち

### 概要

Personal生徒ごとに作成されるフルカスタム30日間ワークブック（例: もものちゃん、Yukaテイスティングマップ）を、geekout-withmeサイト内で認証付きで提供する。外部サイトへの遷移なし。

### 既存カスタム教材

| 生徒 | 教材名 | 内容 | 形式 |
|------|--------|------|------|
| もものちゃん | Cooking English | 30日×11セクション（レシピ・リスニング・発音等） | 静的HTML（~70KB×30日） |
| Yuka | Tasting Map | ドリンクテイスティング × IELTS ライティング | React コンポーネント |

### 技術設計

#### 保存先: Supabase Storage
- バケット: `custom-workbooks`
- パス: `{user_id}/{workbook_slug}/day{N}.html`
- 容量: ~2.2MB/生徒（無料枠1GBで~450人分）

#### DB: `custom_workbooks` テーブル
```sql
CREATE TABLE public.custom_workbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  slug text NOT NULL,              -- URL用スラッグ（例: "cooking-english"）
  title text NOT NULL,             -- 表示名（例: "Cooking English 30 Days"）
  description text,
  total_days integer NOT NULL DEFAULT 30,
  theme_color text DEFAULT '#e8a4b8',
  navigator_name text,             -- ナビゲーターキャラ名
  navigator_image_url text,        -- アバター画像URL
  storage_path text NOT NULL,      -- Supabase Storage内のベースパス
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, slug)
);
```

#### ルーティング
```
/my/workbook/custom                    → 自分のカスタム教材一覧
/my/workbook/custom/[slug]             → 教材トップ（30日グリッド）
/my/workbook/custom/[slug]/day/[num]   → 日別ページ（HTML直接レンダリング）
```

#### 認証フロー
1. Supabase Auth でログイン確認
2. `custom_workbooks` テーブルで `user_id` 一致を確認
3. Supabase Storage から HTML を取得
4. Astro の `<Fragment set:html={html} />` で直接レンダリング
5. geekout-withme のナビバー・フッターが自然に付く

#### Admin 管理
- `/admin` に「カスタム教材管理」セクション追加
- 生徒を選択 → 教材メタデータ登録 → HTML一括アップロード
- アップロードスクリプト（CLI）: ローカルの `docs/*.html` を Storage に一括送信

### iframe を使わない理由
- Web Speech API（発音チェック・TTS）がiframe内で制限される場合がある（特にiOS Safari）
- モバイルでスクロール挙動が二重になる
- 既存HTMLはインラインCSS/JSなので親サイトとの衝突が少ない
- ナビバー・認証ヘッダーとの統一感

### 実装ステップ

1. SQL: `custom_workbooks` テーブル + RLS
2. Supabase Storage: `custom-workbooks` バケット作成 + ポリシー
3. アップロードスクリプト: `scripts/upload-custom-workbook.mjs`
4. API: `/api/custom-workbook/[slug]/[day]` — Storage から HTML 取得
5. ページ: `/my/workbook/custom/` 一覧 + `[slug]/` トップ + `[slug]/day/[num]` 表示
6. Admin: 教材登録UI + アップロード機能
7. もものちゃんの教材を初回データとして投入

---

*作成日: 2026年3月3日*
