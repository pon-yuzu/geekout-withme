# サービス一覧ページ 仕様書

## ページ: `/services`（または `/pricing`）

## 概要
Geek out with Me! の全サービスを一覧で見せる。
下（無料・低価格）から上（高価格）への導線を自然に作る。

---

## サービス一覧（表示順: 上から下へ）

### 1. 無料で始める
- **内容**: Level Check、会話カード3枚
- **価格**: 無料
- **CTA**: 「無料でレベルチェック →」→ `/level-check`
- **備考**: アカウント登録不要で体験可能

### 2. Premium会員
- **内容**: Voice Lounge、会話カード75枚、翻訳機能、AIワークブック
- **価格**: ¥500/月
- **CTA**: 「Premiumに登録 →」→ Stripe Checkout（定期）
- **バッジ**: 🔥 先着100名は永久 ¥500/月
- **備考**: 既存のStripe定期決済を使用

### 3. オーダーメイドワークブック
- **内容**: あなたの「推し」×レベル×ゴールに合わせた30日間ワークブック。英語コーチが直接ヒアリングして作成。音声・リスニング付き。
- **価格**: ¥3,000（税込・買い切り）
- **CTA**: 「購入する ¥3,000 →」→ Stripe Checkout（単発）
- **購入条件**: ログイン必須
- **決済後フロー**: 
  1. Stripe決済完了
  2. リダイレクト → サンクスページ + ヒアリングフォーム
  3. フォーム項目: 名前、メールアドレス、納品希望日
  4. 後日 Voice Lounge個室 or LINEでヒアリング
  5. ワークブック制作 → メールで納品
- **サンプルリンク**: https://pon-yuzu.github.io/cooking-english-30days/sample/

### 4. 初回コーチング体験
- **内容**: 60分マンツーマンセッション。英語、ライフコーチング、AI活用、ワーホリサポートなど何でもOK。
- **価格**: ¥2,000（税込・60分）
- **CTA**: 「体験セッションを予約 ¥2,000 →」→ Stripe Checkout（単発）
- **購入条件**: ログイン必須、1人1回まで購入可能
- **購入制限**: 3ヶ月でリセット（再購入可能）
- **決済後フロー**:
  1. Stripe決済完了
  2. リダイレクト → サンクスページ（日程調整の案内）
  3. LINEまたはメールで日程調整
  4. Voice Lounge個室 or Zoomでセッション実施
- **説明文**: 「英語でもライフコーチングでもAI活用でもワーホリサポートでも。まずは60分、あなたの「やりたいこと」を一緒に整理しましょう。」

### 5. 単発セッション（2回目以降）
- **内容**: 90分マンツーマン。テーマ自由。英語、タロット、ライフコーチング、AI活用、業務自動化、サイト制作相談、ワーホリサポートなど。
- **価格**: ¥10,000（税込・90分）
- **CTA**: 「セッションを予約 ¥10,000 →」→ Stripe Checkout（単発）
- **購入条件**: ログイン必須。初回コーチング体験の購入履歴があること。
- **決済後フロー**:
  1. Stripe決済完了
  2. リダイレクト → サンクスページ（日程調整の案内）
  3. LINEまたはメールで日程調整
- **説明文**: 「英語、タロット、AI活用、サイト制作、業務自動化…何でもOK。さやかと90分、じっくり話しましょう。」
- **備考**: 「作れるようになりたい」→ コーチング系へ。「作って欲しい」→ 別途お見積もり。

### 6. Geek out with Me! 出演パッケージ
- **内容**: パッション発掘ワーク + 90分ガチセッション + YouTube出演 + 動画納品
- **価格**: ¥50,000〜（モニター価格）
- **パッケージ**:
  - ベーシック: 正規¥50,000 → モニター¥30,000（セッション1回 + LINE + 出演）
  - しっかり伴走: 正規¥100,000 → モニター¥50,000（週1セッション×4回 + 1ヶ月伴走 + 出演）
- **LP**: `/gowm` に独立ページとして配置（savemy12weeks.comから移植）
- **CTA**: 「詳細を見る →」→ `https://savemy12weeks.com/gowm/`（外部LP）
  または「お問い合わせ →」→ LINE / メール
- **備考**: 詳細は既存のLPに誘導。サイト内では概要のみ。

### 7. セミナー・研修・グループセッション
- **内容**: 企業研修、グループセッション、コラボイベントなど。英語研修、AI活用研修、コミュニケーション研修など対応可能。
- **価格**: 表示しない（「お問い合わせください」）
- **CTA**: 「お問い合わせ →」→ LINE / メール
- **実績セクション**: （今後追加予定）
  - 実績が入り次第、ロゴ or イベント名 + 簡単な説明を掲載
  - 例:「○○企業様 AI活用研修」「△△氏との合同セミナー」
- **備考**: 個人BtoB、合同イベント、企業研修すべてここに集約

### 8. パーソナルコーチング
- **内容**: ライフコーチで人生の目標を見出す × AI活用で自走力をつける。英語・コミュニケーションが強み。
- **価格**: 表示しない（「お問い合わせください」）
- **CTA**: 「お問い合わせ →」→ LINE / メール
- **備考**: 年間契約。ペア申込みは応相談。金額は非公開。

---

## ページデザイン

### レイアウト
- カード形式で縦に並べる（モバイルファースト）
- 各カードに: アイコン、タイトル、説明文、価格、CTAボタン
- Premium会員のカードは色を変えて目立たせる（おすすめバッジ付き）
- 上位サービス（出演、パーソナル）はトーンを落として「お問い合わせ」導線

### カラー
- サイトのカラーパレットに合わせる
  - メインオレンジ: #F97316
  - ミントグリーン: #4DD9A0（アクセント）
  - 背景ピーチ: #FFF5EB
  - テキスト: ダークグレー

### コピーのトーン
- カジュアル、フレンドリー
- 「まずは無料で」→「もっと学びたいなら」→「直接話したいなら」→ の自然な流れ

---

## Stripe 実装詳細

### オーダーメイドワークブック（単発 ¥3,000）
- Stripe Product を作成（name: "オーダーメイドワークブック"）
- mode: "payment"（単発決済）
- success_url: `/services/workbook/thanks`（ヒアリングフォーム付き）
- cancel_url: `/services`

### 初回コーチング体験（単発 ¥2,000）
- Stripe Product を作成（name: "初回コーチング体験 60分"）
- mode: "payment"（単発決済）
- success_url: `/services/coaching/thanks`（日程調整案内）
- cancel_url: `/services`
- **購入制限の実装**:
  - DBに購入履歴を記録（user_id, product_type, purchased_at）
  - 購入時にチェック: 直近3ヶ月以内に同商品の購入がないか
  - 購入済みの場合: ボタンをグレーアウト + 「次回購入可能日: YYYY/MM/DD」表示

---

### 単発セッション（単発 ¥10,000）
- Stripe Product を作成（name: "単発セッション 90分"）
- mode: "payment"（単発決済）
- success_url: `/services/session/thanks`（日程調整案内）
- cancel_url: `/services`
- **購入制限の実装**:
  - 初回コーチング体験の購入履歴があるかチェック
  - 未購入の場合: ボタンに「まずは初回体験から →」と表示し、初回体験へ誘導

## サンクスページ

### ワークブック購入後（`/services/workbook/thanks`）
```
✅ ご購入ありがとうございます！

オーダーメイドワークブックのヒアリングに進みましょう。

[名前]
[メールアドレス]  
[納品希望日]

📩 送信後、LINEまたはVoice Loungeで詳しくヒアリングします。
あなたの「推し」×レベル×ゴールに合わせた
世界にひとつだけのワークブックを作ります。
```

### コーチング体験購入後（`/services/coaching/thanks`）
```
✅ ご購入ありがとうございます！

60分の体験セッションの日程を調整しましょう。

以下のいずれかでご連絡ください:
📱 LINE: [LINEリンク]
📧 Email: contact@geekout-withme.com

英語、ライフコーチング、AI活用、ワーホリ…
なんでもOK。まずは話しましょう！
```

---

## i18n キー

```json
// 日本語
"services.title": "サービス一覧",
"services.free.title": "無料で始める",
"services.premium.title": "Premium会員",
"services.premium.badge": "🔥 先着100名は永久 ¥500/月",
"services.workbook.title": "オーダーメイドワークブック",
"services.workbook.price": "¥3,000",
"services.coaching.title": "初回コーチング体験",
"services.coaching.price": "¥2,000 / 60分",
"services.coaching.limit": "1人1回まで（3ヶ月でリセット）",
"services.gowm.title": "Geek out with Me! 出演",
"services.gowm.price": "¥50,000〜",
"services.session.title": "単発セッション",
"services.session.price": "¥10,000 / 90分",
"services.session.requires": "※初回体験を受けた方のみ",
"services.seminar.title": "セミナー・研修・グループセッション",
"services.seminar.price": "お問い合わせください",
"services.seminar.description": "企業研修、グループセッション、コラボイベント等。内容・人数に応じてカスタマイズいたします。",
"services.seminar.achievements": "実績",
"services.personal.title": "パーソナルコーチング",
"services.personal.price": "お問い合わせください",
"services.title": "Services",
"services.free.title": "Start Free",
"services.premium.title": "Premium",
"services.premium.badge": "🔥 First 100 members: ¥500/mo forever",
"services.workbook.title": "Custom Workbook",
"services.workbook.price": "¥3,000",
"services.coaching.title": "Trial Coaching Session",
"services.coaching.price": "¥2,000 / 60min",
"services.coaching.limit": "1 per person (resets every 3 months)",
"services.gowm.title": "Geek out with Me! Appearance",
"services.gowm.price": "From ¥50,000",
"services.session.title": "Single Session",
"services.session.price": "¥10,000 / 90min",
"services.session.requires": "※ Trial session required first",
"services.seminar.title": "Seminars & Corporate Training",
"services.seminar.price": "Contact us",
"services.seminar.description": "Corporate training, group sessions, collaboration events. Customized to your needs.",
"services.seminar.achievements": "Track Record",
"services.personal.title": "Personal Coaching",
"services.personal.price": "Contact us"
```
