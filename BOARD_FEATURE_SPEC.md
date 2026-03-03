# GOWM Board（掲示板）機能仕様書

## 概要

GOWMに新しくBoard（掲示板）機能を追加する。Voice Loungeが電気通信事業届出完了まで一時閉鎖中のため、ユーザー同士のコミュニケーション手段として、またコミュニティの基盤として機能させる。

**重要：この機能は「掲示板（オープンチャット）」であり、電気通信事業届出は不要。すべての投稿はボード内の全メンバーに公開される。DM・クローズドチャット機能は絶対に含めないこと。**

## リリースターゲット

Web版ローンチ（3月中旬）に含める

---

## ナビゲーション

- メニュー名：**Board / 掲示板**（i18n対応：英語 "Board" / 日本語 "掲示板"）
- 既存ナビゲーションに新しいメニュー項目として追加
- Voice Loungeの「Coming Soon」と並列で表示

---

## ボード一覧（初期8ボード）

管理者（Sayaka）が初期作成。ボード名はローマ字を採用（日英バイリンガルプラットフォームのブランディング）。

| # | ボード名 | 日本語 | 説明 | 投稿権限 |
|---|---------|--------|------|---------|
| 1 | **oshirase** | おしらせ | 運営アナウンス | **管理者のみ** |
| 2 | **hajimemashite** | はじめまして | 自己紹介 | 全会員 |
| 3 | **shabero** | しゃべろ | 雑談・会話カードトーク | 全会員 |
| 4 | **homete** | ほめて | 学習報告 | 全会員 |
| 5 | **oshiete** | おしえて | 質問 | 全会員 |
| 6 | **osusume** | おすすめ | 学習リソース・ツール共有 | 全会員 |
| 7 | **naoshite** | なおして | バグ報告 | 全会員 |
| 8 | **dekitaraiina** | できたらいいな | 機能リクエスト | 全会員 |

### 言語ルール
- **全ボード言語自由**（日本語・英語・混在すべてOK）
- 言語指定・言語タグなし

---

## 投稿構造

### スレッド型
- 各ボード内にスレッド（トピック）を立てられる
- スレッド内でリプライ（返信）ができる
- スレッドはフラット表示（ネストなし）でシンプルに

### 権限

| アクション | 権限 |
|-----------|------|
| 投稿の閲覧 | 会員登録済み全ユーザー |
| 投稿（リプライ） | 会員登録済み全ユーザー |
| スレッド作成 | 利用実績のあるユーザー（※条件は下記） |
| ボード作成 | 管理者のみ |
| oshiraseへの投稿 | 管理者のみ |

### スレッド作成の利用実績条件
- 会員登録済みであること（投稿は別途可能）
- 具体的な条件（以下のいずれかを満たす）：
  - 掲示板での投稿数 ≥ 3回
  - または、Level Checkを1回以上完了
  - または、登録から7日以上経過
- ※条件はローンチ後のユーザー行動を見て調整

---

## 投稿者表示

- ユーザーは**表示名を選択**できる（実名 or ニックネーム）
- プロフィール設定で切り替え可能
- 表示名の横にアバター（デフォルトアイコン or ユーザー設定）

---

## 投稿アクション

### 1. いいね 👍
- 各投稿・リプライに対して1回押せる
- いいね数を表示
- 取り消し可能

### 2. リプライ
- スレッド内で返信
- フラット表示（ネストなし）

### 3. 翻訳ボタン（AI翻訳）
- **UIの動作：投稿本文をタップすると、本文の下にスライドで翻訳が展開表示される**
- もう一度タップで翻訳を閉じる
- 翻訳エンジン：Cloudflare Workers AI（Llama）を使用（既存インフラ）
- **キャッシュ方式：**
  - 初回タップ時にAPIを呼び、翻訳結果をDBに保存
  - 2回目以降（同ユーザー・他ユーザー問わず）はキャッシュから即表示
- **回数制限：**
  - 無料ユーザー：1日N回まで（具体的な数はローンチ後に調整）
  - Premiumユーザー：無制限
  - カウント対象は「新規翻訳リクエスト」のみ（キャッシュヒットはカウントしない）

### 4. 添削リクエスト（相互添削）
- 投稿者が自分の投稿に「添削してほしい」フラグを立てられる
- フラグが立っている投稿には添削アイコンが表示される
- 他のユーザーがその投稿に対して「添削リプライ」を書ける
  - 添削リプライは通常リプライと区別できるUI（例：色付き枠、✏️アイコン付き）
- **回数制限：**
  - 添削リクエストを立てる回数：無料ユーザー1日N回 / Premium無制限
  - 添削を書く側は無制限（コミュニティ促進のため）

---

## 他機能との連携（シェア導線）

### Level Check → Board
- Level Check完了画面に「Boardにシェア」ボタンを追加
- タップすると `homete`（ほめて）ボードに自動投稿が作成される
- 投稿テンプレート例：「Level Checkやりました！結果：○○ / I just completed my Level Check! Result: ○○」
- ユーザーがコメントを追加してから投稿できる

### ワークブック → Board
- ワークブック完了時に「Boardにシェア」ボタン
- `homete` ボードに投稿
- 投稿テンプレート例：「○日間ワーク完了！/ Completed my ○-day workbook!」

### 会話カード → Board
- 会話カード画面に「Boardで話そう」ボタンを追加
- タップすると `shabero`（しゃべろ）ボードに会話カードの内容が投稿される
- 他のユーザーがそのトピックについてリプライで語れる

---

## i18n（多言語対応）に関する重要な注意

### i18n対象（UIの言語切り替えで翻訳する）
- ナビゲーションラベル（「Board / 掲示板」）
- ボタンテキスト（「投稿する / Post」「リプライ / Reply」「いいね / Like」）
- ボードカテゴリ名（「oshirase - おしらせ / oshirase - Announcements」）
- プレースホルダーテキスト
- エラーメッセージ
- シェアボタンのテンプレート文

### i18n対象外（翻訳しない）
- **ユーザーの投稿本文**
- **リプライ内容**
- **ユーザー表示名**
- **ボード名のローマ字部分**（oshirase, hajimemashite等は固定）

投稿内容の翻訳は、上記「翻訳ボタン」（タップで個別翻訳）で対応する。サイト全体のi18n切り替えが投稿内容に影響しないよう、明確に分離すること。

---

## データモデル（参考）

### boards テーブル
```
id: UUID
slug: string (例: "oshirase", "hajimemashite")
name_ja: string
name_en: string
description_ja: string
description_en: string
post_permission: enum ("all", "admin_only")
sort_order: integer
created_at: timestamp
```

### threads テーブル
```
id: UUID
board_id: UUID (FK → boards)
author_id: UUID (FK → users)
title: string
body: text
language: string (auto-detect, 表示用メタ情報)
created_at: timestamp
updated_at: timestamp
like_count: integer (default: 0)
reply_count: integer (default: 0)
is_correction_requested: boolean (default: false)
```

### replies テーブル
```
id: UUID
thread_id: UUID (FK → threads)
author_id: UUID (FK → users)
body: text
is_correction: boolean (default: false) -- 添削リプライかどうか
created_at: timestamp
like_count: integer (default: 0)
```

### likes テーブル
```
id: UUID
user_id: UUID (FK → users)
target_type: enum ("thread", "reply")
target_id: UUID
created_at: timestamp
UNIQUE(user_id, target_type, target_id)
```

### translation_cache テーブル
```
id: UUID
source_type: enum ("thread", "reply")
source_id: UUID
source_language: string (auto-detected)
target_language: string
translated_text: text
created_at: timestamp
UNIQUE(source_id, source_type, target_language)
```

---

## スコープ判断（v1 vs v2）

### v1（3月ローンチ必須）
- [x] ボード一覧表示
- [x] スレッド一覧・作成・閲覧
- [x] 投稿・リプライ
- [x] いいね
- [x] 翻訳（タップで展開、キャッシュ付き）
- [x] i18n分離（UI要素のみ翻訳、投稿内容は対象外）
- [x] 表示名（実名/ニックネーム切り替え）

### v2（余裕があればv1、なければ4月以降）
- [ ] 添削リクエスト（フラグ＋添削リプライUI）
- [ ] Level Check結果シェア導線
- [ ] ワークブック完了シェア導線
- [ ] 会話カード→Boardシェア導線
- [ ] 投稿の通知（リプライ通知、いいね通知）

### 将来検討
- ピン留め投稿
- 検索機能
- 投稿の報告/モデレーション
- 画像添付

---

## 技術スタック

既存GOWMのスタックに準拠：
- フロントエンド：Astro + React + TypeScript + Tailwind CSS
- バックエンド：Cloudflare Workers（API）
- DB：既存のD1またはKV（要確認）
- AI翻訳：Cloudflare Workers AI（Llama 3.1 70B）
- ホスティング：Cloudflare Pages

---

## 注意事項

1. **電気通信事業法コンプライアンス：** この機能は「掲示板（不特定多数向け公開投稿）」であり、届出不要。DM機能やクローズドチャット機能は実装しないこと。
2. **Voice Loungeとの関係：** Voice Loungeは引き続き`PUBLIC_VOICE_LOUNGE_ENABLED=false`で閉鎖。Boardは別機能として独立して動作する。
3. **翻訳コスト管理：** キャッシュを必ず実装し、同じ投稿への翻訳APIコールを最小限にする。
