# Adaptive Custom Workbook Generation System — 全体設計書

**GEEK OUT WITH ME**
Phase 1: 一括生成 → Phase 2: 週次バッチ → Phase 3: デイリー適応

Version 1.0 | 2026-03-04
Reache Up LLC | Sayaka Mochida

---

## 1. Executive Summary

本ドキュメントは、Geek Out With Meのカスタムワークブック生成システムの全体設計をまとめたものです。生徒一人ひとりの英語レベル・職業・興味関心・推しに合わせた30日間の英語学習教材を、admin画面から生成・管理・デプロイするシステムを段階的に構築します。

> **設計のゴール**
> - Phase 1: ヒアリング → 30日分一括生成 → レビュー → デプロイ
> - Phase 2: 1週間分ずつ生成し、学習ログで次週の難易度を自動調整
> - Phase 3: 毎日の学習結果に基づいてAIが翌日の教材を自動生成
>
> 全Phaseを通じて、テンプレート（HTML構造・CSS・JS機能）は共通、
> コンテンツ（レシピ・会話・クイズ・リスニング等）だけがカスタム。

### 1.1 数字で見る設計

| 項目 | Phase 1 | Phase 3（理想形） |
|------|---------|------------------|
| 生成単位 | 30日一括 | 1日ずつ（毎晩自動） |
| APIコスト/生徒/月 | 約$1.80（1回） | 約$1.50〜3.00/月 |
| Sayakaの関与 | 全Day手動レビュー | 異常値アラート時のみ |
| 生徒側の体験 | 30日分が初日に揃う | 毎朝「今日の教材」が届く |
| 難易度調整 | 初回ヒアリングで固定 | 毎日の学習ログで動的 |

---

## 2. System Architecture

既存のgeekout-withme技術スタック（Astro + React + Cloudflare Pages + Supabase）をベースに、Anthropic APIとCloudflare Workers/Queuesを追加します。

### 2.1 技術スタック

| レイヤー | 技術 | 役割 |
|---------|------|------|
| フロントエンド | Astro + React + Tailwind | admin画面（フォーム・プレビュー・ダッシュボード） |
| バックエンド | Cloudflare Workers | APIルート、生成ジョブ管理 |
| ジョブキュー | Cloudflare Queues | 並列生成の非同期処理 |
| 定期実行 | Cron Triggers | Phase 2: 週次 / Phase 3: 日次の自動生成 |
| AI生成 | Anthropic API（Sonnet 4.5） | コンテンツJSON生成 |
| DB | Supabase（PostgreSQL） | 生徒config、コンテンツ、学習ログ |
| 認証 | Supabase Auth + ADMIN_EMAILS | 管理者アクセス制御 |

### 2.2 データフロー概要

全Phaseに共通するデータの流れは以下の通りです。Phase 2/3で「学習ログ」のフィードバックループが加わります。

```
admin画面 → student-config → Anthropic API → コンテンツJSON → 生徒マイページ
                                    ↑  Phase 2/3で追加  ↑
                              学習ログ ← 生徒のワーク完了データ ← Supabase
```

---

## 3. Database Schema（Supabase）

既存テーブル（users, custom_workbooks等）に加え、以下のテーブルを追加します。

### 3.1 student_configs（生徒設定）

ヒアリング結果を構造化して保存。student-config-schema.jsonの内容がそのままJSONBカラムに入ります。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK | 主キー |
| user_id | UUID | FK → users | 対象生徒 |
| config_json | JSONB | NOT NULL | student-config全体 |
| status | TEXT | NOT NULL | draft / approved / generating / active |
| generation_mode | TEXT | DEFAULT 'batch' | batch / weekly / daily（Phase管理） |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

### 3.2 workbook_days（Day単位コンテンツ）

生成されたDay 1〜30のコンテンツをDay単位で保存。レビューステータスもここで管理します。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK | 主キー |
| config_id | UUID | FK | → student_configs |
| day_number | INTEGER | 1-30 | Day番号 |
| content_json | JSONB | | 11セクションのコンテンツ全体 |
| html_content | TEXT | | ビルド済みHTML（デプロイ用） |
| review_status | TEXT | | pending / approved / rejected |
| review_notes | TEXT | | Sayakaのレビューメモ |
| generated_at | TIMESTAMPTZ | | 生成日時 |
| generation_context | JSONB | | 生成時に使った学習ログ（Phase 2/3用） |

### 3.3 learning_logs（学習ログ）

Phase 2/3の核。生徒がワークを完了するたびに保存されるデータです。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK | 主キー |
| user_id | UUID | FK → users | 生徒 |
| day_id | UUID | FK → workbook_days | 対象Day |
| quiz1_score | INTEGER | 0-100 | クイズ1正答率 |
| quiz2_score | INTEGER | 0-100 | クイズ2正答率 |
| quiz3_score | INTEGER | 0-100 | クイズ3正答率 |
| listening_replays | INTEGER | | リスニング再生回数 |
| pronunciation_score | INTEGER | 0-100 | 発音チェック平均スコア |
| writing_text | TEXT | | ライティングの回答内容 |
| time_spent_sec | INTEGER | | 総学習時間（秒） |
| completed_at | TIMESTAMPTZ | | 完了日時 |
| summary_json | JSONB | | サマリー画面の全データ |

---

## 4. Phase 1: 一括生成

> **Phase 1 — Batch Generation**
> admin画面からヒアリング → 30日分一括生成 → レビュー → デプロイ

### 4.1 admin画面の構成

既存のCustom WBタブ（CustomWorkbookManager.tsx）を拡張して、3つのサブビューを追加します。

#### サブビュー1: ワークブック一覧

既存のCRUD機能をベースに、ステータス管理とプレビューリンクを追加。各ワークブックにステータスバッジ（draft / generating / review / deployed）が表示され、クリックで詳細に遷移します。

#### サブビュー2: ヒアリングフォーム

student-config-schema.jsonに沿った入力フォーム。ヒアリングしながらリアルタイムで埋めていきます。

| セクション | 入力項目 | UI |
|-----------|---------|-----|
| 生徒選択 | 既存ユーザーから選択 | ドロップダウン（Supabaseから自動取得） |
| 基本情報 | 場所・職業・言語環境 | テキスト入力（選択時に自動入力） |
| 英語レベル | CEFR・英検・苦手スキル | セレクト + ドラッグ並び替え |
| 学習目標 | 目標試験・期限・フェーズ | テキスト + 日付ピッカー |
| ナビゲーター | 推し名・性格・台詞サンプル | テキスト + テキストエリア |
| シナリオ | 職場設定・場面リスト | テキスト + タグ入力 |
| 月テーマ（×3） | テーマ名・料理との絡め方 | 3行の入力グループ |
| 技術設定 | 難易度・TTS方式 | セレクト |

#### サブビュー3: レビュー & デプロイ

生成されたDay 1〜30をタイムライン形式で表示。各Dayをクリックすると11セクションのプレビューが開きます。セクションごとに「OK」「再生成」「手動編集」の操作が可能です。

**重要:** 全Dayが「approved」になるまでデプロイボタンは押せない設計にします。品質担保のガードレールです。

### 4.2 APIエンドポイント（Phase 1）

| エンドポイント | メソッド | 役割 |
|--------------|---------|------|
| /api/admin/wb-configs | POST | student-config保存 |
| /api/admin/wb-configs/:id | GET/PUT | config取得・更新 |
| /api/admin/wb-generate | POST | 30日分の生成開始（Queueに投入） |
| /api/admin/wb-generate/:id/status | GET | 生成進捗（Day N/30） |
| /api/admin/wb-days/:configId | GET | 全Dayのコンテンツ一覧 |
| /api/admin/wb-days/:dayId/regenerate | POST | 特定Dayの再生成 |
| /api/admin/wb-days/:dayId/review | PUT | レビューステータス更新 |
| /api/admin/wb-deploy/:configId | POST | HTMLビルド＆デプロイ実行 |

### 4.3 生成パイプライン（並列処理）

「生成開始」ボタンを押すと、以下の流れで並列生成が走ります。

1. admin画面が POST /api/admin/wb-generate を叩く
2. Workerがstudent-configをDBから取得し、Day 1〜30のジョブをCloudflare Queuesに投入（5並列バッチ）
3. Queueコンシューマーが各DayのプロンプトをAnthropic APIに送信
4. 生成されたコンテンツJSONをworkbook_daysテーブルに保存
5. admin画面はポーリングで進捗を監視（GET /status → Day 12/30 生成中...）
6. 全Day完了 → ステータスが「review」に変わり、レビュー画面に遷移

> **並列生成のコスト最適化**
> - Prompt Caching: systemプロンプト + student-configは全Dayで共通。
>   初回のcache write（1.25倍）以降、29回分がcache read（0.1倍）になる。
> - 推定コスト: 初回$1.80 → キャッシュ適用後 約$0.60/ワークブック
> - Batch API（50%オフ）: 即時性が不要な場合は更に半額。
>   → Phase 2/3の自動生成では Batch API を標準採用。

### 4.4 コンテンツ生成プロンプトの構造

Anthropic APIに送るプロンプトは3層構造です。

| 層 | 内容 | トークン量（目安） |
|-----|------|------------------|
| System | 共通の教材設計指示 | 2,000〜3,000（キャッシュ対象） |
| Context | student-config全体 | 1,000〜2,000（キャッシュ対象） |
| User | Day N の具体的指示 | 500〜1,000（Day毎に変わる） |

**System層** には「11セクションそれぞれの出力フォーマット」「レベル別の語彙範囲ガイドライン」「ナビゲーター台詞の口調規則」を焼き込みます。これが全Dayで使い回されるため、キャッシュの効果が最大化します。

---

## 5. Phase 2: 週次バッチ生成

> **Phase 2 — Weekly Adaptive Batch**
> 学習ログを反映して1週間分ずつ生成。コーチングセッションと同期。

### 5.1 Phase 1からの差分

Phase 1の一括生成パイプラインをベースに、以下の3点を追加します。

1. **学習ログの収集:** 生徒がワークを完了するたびにlearning_logsテーブルにデータが保存される
2. **週次Cron Trigger:** 毎週日曜深夜に自動実行。前週の学習ログを集計 → 次週7日分を生成
3. **適応ロジック:** 集計結果をプロンプトのUser層に注入して難易度を動的に調整

### 5.2 適応ロジックの例

1週間分の学習ログを集計し、以下のルールで次週の生成パラメータを調整します。

| 指標 | 閾値 | 調整内容 | 理由 |
|------|------|---------|------|
| クイズ平均 > 90% | 3問とも | 語彙レベルを1段上げ | 簡単すぎて成長が鈍化 |
| クイズ平均 < 50% | 2問以上 | 語彙レベルを1段下げ | 難しすぎてモチベ低下 |
| リスニング再生 > 5回 | 平均 | TTS速度を下げる | 聞き取れず繰り返し聴いてる |
| 発音スコア < 60% | 平均 | 発音Tips強化 | 認識されにくいパターン |
| 学習時間 < 15分 | 3日以上 | コンテンツ量を削減 | 時間がなくて離脱リスク |
| 学習時間 > 60分 | 3日以上 | ボーナスセクション追加 | 意欲が高い→伸ばせる |

### 5.3 Sayakaの関与

Phase 2では、週1回のコーチングセッション前にadminで「今週の学習サマリー」を確認できます。AIが自動調整した内容を承認（or 手動上書き）してから次週分が確定するフローです。

**週のフロー:** 月〜土: 生徒がワーク実施 → 日曜深夜: Cron Triggerで次週7日分を自動生成 → 月曜朝: Sayakaがadminで確認 → 承認 → 生徒に配信

---

## 6. Phase 3: デイリー適応生成

> **Phase 3 — Daily Adaptive Generation**
> 毎日の学習結果に基づいて翌日の教材を自動生成。究極のパーソナライズ。

### 6.1 Phase 2からの差分

1. **Cron Triggerが日次に:** 毎晩23:00（生徒のタイムゾーン）に翌日分を生成
2. **直近のコンテキスト拡張:** 過去3〜7日間の学習ログ + 全期間のトレンドをプロンプトに注入
3. **Sayakaの関与が異常時のみに:** 通常は自動。ルール違反や異常値があった場合にSlack通知

### 6.2 AIへの入力情報（Phase 3）

Phase 3のプロンプトUser層には、student-configに加えて以下の情報が含まれます。

| 情報 | 内容と用途 |
|------|-----------|
| 直近7日の学習ログ | クイズ正答率、発音スコア、学習時間の推移 → 難易度の微調整 |
| 全期間トレンド | スキル別の成長曲線（上向き/停滞/下降）→ 注力分野の判断 |
| 未習得語彙リスト | 過去のクイズで間違えた単語/フレーズ → 復習として再出題 |
| 前日のライティング | 生徒が書いた文章 → 間違いパターンを次日のTipsに反映 |
| コーチメモ | Sayakaが週次セッションで気づいた点（admin入力）→ AI指示に追加 |

### 6.3 生徒側の体験

毎朝マイページを開くと「今日のワーク」が1つ出ている。

昨日のクイズで間違えた単語が、今日のレシピや会話にさりげなく登場する。発音チェックで苦手だった「th」の音を含むフレーズが多めに出る。リスニングの速度が、前日の再生回数に応じて調整されている。

生徒にとっては「なんか今日の教材、私のためにちょうどいいな」と感じるだけ。裏側でAIが毎晩、その人専用の教材を作っていることは意識しなくていい。

### 6.4 異常検知とアラート

Phase 3ではSayakaの手動レビューが不要になる代わりに、自動的な品質チェックが必要です。

| 異常パターン | 検知方法 | アクション |
|-------------|---------|-----------|
| 生徒が3日連続でワーク未完了 | learning_logsの欠損 | Sayakaにアラート |
| クイズ正答率が急落（前週比-30%） | トレンド比較 | 難易度を自動で下げ + 通知 |
| 生成したコンテンツが規定外 | JSONスキーマバリデーション | 再生成 + エラーログ |
| APIエラーで生成失敗 | HTTPステータス | 3回リトライ → 失敗なら通知 |

---

## 7. コスト試算

### 7.1 Anthropic API コスト

Sonnet 4.5 を使用。入力$3 / 出力$15（100万トークンあたり）。Prompt Caching・Batch APIで最適化。

| | Phase 1 | Phase 2 | Phase 3 |
|---|---------|---------|---------|
| **生成頻度** | 1回（30日分） | 4回/月（週次） | 30回/月（日次） |
| **キャッシュ** | あり（90%削減） | あり + Batch 50%off | あり + Batch 50%off |
| **推定コスト/生徒** | 約$0.60〜1.80 | 約$0.80〜2.00/月 | 約$1.50〜3.00/月 |
| **10人の場合/月** | $6〜18（初回のみ） | $8〜20 | $15〜30 |

**受注単価3,000円の場合:** Phase 3でも月額APIコスト＄3（約450円）= 原価率15%。十分にペイします。

### 7.2 Cloudflare コスト

| サービス | 無料枠 | 見込み使用量 |
|---------|--------|------------|
| Workers | 10万リクエスト/日 | 生徒10人で300リクエスト/日程度 |
| Queues | 100万メッセージ/月 | 月900メッセージ程度 |
| Pages | 500ビルド/月 | 余裕あり |

結論: Cloudflare側のコストは当面すべて無料枠内に収まります。

---

## 8. 実装ロードマップ

### 8.1 Phase 1 実装（推定2-3日）✅ 完了

| # | タスク | 依存関係 | 成果物 |
|---|--------|---------|--------|
| 1 | Supabaseテーブル追加（student_configs, workbook_days） | なし | SQL Migration |
| 2 | ヒアリングフォームUI（React） | #1 | .tsx コンポーネント |
| 3 | 生成APIルート + Anthropicプロンプト設計 | #1 | Workers関数 |
| 4 | 並列生成パイプライン（Queues） | #3 | Queue Consumer |
| 5 | レビュー画面 + プレビューUI | #4 | .tsx コンポーネント |
| 6 | HTMLビルド + デプロイ機能 | #5 | ビルドスクリプト |

**Phase 1 実装結果（2026-03-04）:**
- 順次生成 + ポーリング方式を採用（Queuesは Phase 2以降で検討）
- JSONをReactで直接描画（HTMLビルド不要）
- 英語/日本語学習の両言語対応プロンプト分岐を実装

### 8.2 Phase 2 追加実装（推定1-2日）

| # | タスク | 前提 | 成果物 |
|---|--------|------|--------|
| 7 | learning_logsテーブル + フロントエンド送信 | Phase 1完了 | SQL + JS |
| 8 | 週次Cron Trigger + 適応ロジック | #7 | Cron Worker |
| 9 | 週次サマリーダッシュボード（admin） | #7 | .tsx コンポーネント |

**Phase 2 移行基準:**
- パイプライン完走: 3回以上エラーなし（必須）
- 手動修正率: 30%以下 — 21/30日がそのままOK（必須）
- 学習ログ蓄積: 最低7日分、理想14日分（有効化に必要）

### 8.3 Phase 3 追加実装（推定1-2日）

| # | タスク | 前提 | 成果物 |
|---|--------|------|--------|
| 10 | 日次Cron Trigger + トレンド分析ロジック | Phase 2完了 | Cron Worker |
| 11 | 異常検知 + Slack/メール通知 | #10 | Worker + 通知 |
| 12 | コーチメモ入力UI（admin） | #10 | .tsx コンポーネント |

> **設計の鉄則: Phase 1を「拡張可能」に作る**
> - Phase 1のDBスキーマにgeneration_contextカラムを最初から入れておく（Phase 2/3で使う）。
> - Phase 1のプロンプト構造を3層（System / Context / User）に分けておく（User層の差し替えでPhase対応）。
> - Phase 1の生成ジョブをQueue経由にしておく（Phase 2/3のCron Triggerから同じConsumerを再利用）。
>
> こうすれば Phase 1 → 2 → 3 の移行が「追加」だけで済み、「作り直し」にならない。

---

## 9. セキュリティ考慮事項

| 項目 | 対策 |
|------|------|
| Anthropic API Key | Cloudflare Workers のシークレットに保存。フロントエンドには露出させない。 |
| admin認証 | 既存のADMIN_EMAILS + Supabase Authを継続。全APIルートで認証チェック。 |
| 生徒データ | student-configにはフルネーム不要（display_nameのみ）。学習ログはuser_idで紐付け。 |
| 生成コンテンツ | Sonnetの出力をJSONスキーマでバリデーション。不正な出力は棄却して再生成。 |
| コスト管理 | Anthropic APIのUsage Limitを設定。月額上限を超えたらアラート。 |

---

## 10. 用語集

| 用語 | 説明 |
|------|------|
| student-config | 生徒のプロフィール・カスタマイズ設定をまとめたJSONデータ。スキーマはプロジェクトナレッジに格納済み。 |
| Prompt Caching | Anthropic APIの機能。繰り返し送信するプロンプト部分をキャッシュして入力コストを90%削減。 |
| Batch API | Anthropic APIの非同期処理モード。24時間以内に処理完了する代わりに50%オフ。 |
| Cron Trigger | Cloudflare Workersのスケジュール実行機能。Phase 2で週次、Phase 3で日次に使用。 |
| Queues | Cloudflareのメッセージキュー。並列生成のジョブ管理に使用。 |
| learning_logs | 生徒がワークを完了した際の学習データ（クイズ正答率、発音スコア等）。Phase 2以降の適応ロジックの入力。 |
