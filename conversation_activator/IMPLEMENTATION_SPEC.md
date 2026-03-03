# Voice Lounge — Conversation Facilitator Tool
## Implementation Specification / 実装仕様書

**Version:** 1.0  
**Date:** 2026-02-21  
**For:** Geek Out With Me (https://geekout-withme.pages.dev/)  
**Target Page:** `/voice-lounge`

---

## 1. Overview / 概要

Voice Loungeのボイスチャット中に使う、会話促進ツール。言語交換パートナー同士が「何を話せばいいかわからない」問題を解決する。

### What it does / 機能
- **セットアップ画面**: お互いのレベル、興味のあるトピック、セッション時間を設定
- **タイマー**: セッション時間を半分に分け、前半は英語・後半は日本語で自動切り替え通知
- **話題カード**: レベル×趣味に合ったバイリンガル話題カード（75枚）をシャッフル表示
- **会話プロンプト**: 各カードに3段階の質問プロンプト付き
- **語彙ヘルプ**: 各カードにそのトピックで使える語彙リスト
- **アイスブレイカー**: タップで変わるランダムな軽い質問
- **会話スタイル選択**: Free Talk / Interview / Teach Me / Debate

### Why it matters / なぜ必要か
既存の言語交換アプリ（Tandem, HelloTalk, Hilokal）はマッチングはしてくれるが、**リアルタイムの会話中に使える構造化されたサポートツールがない**。ここがブルーオーシャン。

---

## 2. File Structure / ファイル構成

```
voice-lounge-package/
├── IMPLEMENTATION_SPEC.md      ← この仕様書
├── src/
│   ├── components/
│   │   └── VoiceLoungeTool.jsx ← メインコンポーネント（全UI）
│   └── data/
│       └── conversationData.js ← カードデータ（75枚）+ レベル・ロールデータ
└── prototype/
    └── voice-lounge-tool.jsx   ← スタンドアロンのプロトタイプ（参考用）
```

### ファイルの役割

| File | Purpose | Edit frequency |
|------|---------|----------------|
| `VoiceLoungeTool.jsx` | UIコンポーネント全体。サイトのテーマに合わせて要調整 | デザイン変更時 |
| `conversationData.js` | 75枚の話題カード＋メタデータ。コンテンツ追加はここだけ | 定期的にカード追加 |
| `voice-lounge-tool.jsx` | Claude Artifactで動くプロトタイプ。参考用 | 編集不要 |

---

## 3. Integration Guide / 組み込み手順

### Step 1: ファイルを配置
```
your-project/
├── src/
│   ├── components/
│   │   └── VoiceLoungeTool.jsx  ← コピー
│   ├── data/
│   │   └── conversationData.js  ← コピー
│   └── pages/
│       └── voice-lounge.jsx     ← 新規作成（下記参照）
```

### Step 2: ページコンポーネントを作成

```jsx
// pages/voice-lounge.jsx
import VoiceLoungeTool from '../components/VoiceLoungeTool';

export default function VoiceLoungePage() {
  // Optional: Level Checkの結果やユーザープロフィールから取得
  const userLevel = null;       // e.g. 'intermediate'
  const userInterests = null;   // e.g. ['anime', 'cooking']

  return (
    <VoiceLoungeTool
      userLevel={userLevel}
      userInterests={userInterests}
      theme="dark"
    />
  );
}
```

### Step 3: フォントを読み込む
`index.html` または `_app.jsx` に以下を追加（まだ無ければ）:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Step 4: ルーティングに追加
サイトのルーター設定に `/voice-lounge` → `VoiceLoungePage` を追加。

---

## 4. Component API / コンポーネントAPI

```tsx
interface VoiceLoungeToolProps {
  /** Pre-fill user level from Level Check results */
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  
  /** Pre-fill interests from user profile */
  userInterests?: ('anime' | 'cooking' | 'tech' | 'travel' | 'music')[];
  
  /** Color theme — default 'dark' */
  theme?: 'dark' | 'light';
}
```

---

## 5. Theming / テーマ調整

コンポーネントはCSS Custom Propertiesを使用。サイトのデザインに合わせてオーバーライド可能。

### 方法1: CSSでオーバーライド
```css
.vl-root {
  --vl-bg-primary: #your-bg-color;
  --vl-accent-purple: #your-brand-color;
  --vl-font-body: 'Your Site Font', sans-serif;
  /* ... etc */
}
```

### 方法2: コンポーネント内の `defaultThemeVars` を直接編集

### 利用可能なCSS変数一覧

| Variable | Default | Purpose |
|----------|---------|---------|
| `--vl-bg-primary` | `#0D0F14` | ページ背景 |
| `--vl-bg-secondary` | `rgba(255,255,255,0.04)` | カード・セクション背景 |
| `--vl-bg-hover` | `rgba(255,255,255,0.06)` | ホバー・アクティブ背景 |
| `--vl-text-primary` | `#F0F0F0` | メインテキスト |
| `--vl-text-secondary` | `#8B95A5` | サブテキスト・ラベル |
| `--vl-text-muted` | `#555` | 薄いテキスト |
| `--vl-border` | `#2A2D3A` | ボーダー色 |
| `--vl-accent-purple` | `#6C5CE7` | メインアクセント |
| `--vl-accent-purple-light` | `#A29BFE` | メインアクセント（明） |
| `--vl-accent-green` | `#00B894` | セカンドアクセント |
| `--vl-accent-green-light` | `#55EFC4` | セカンドアクセント（明） |
| `--vl-accent-yellow` | `#FDCB6E` | 警告・ハイライト |
| `--vl-accent-red` | `#E17055` | 危険・終了 |
| `--vl-font-body` | `'DM Sans', sans-serif` | 本文フォント |
| `--vl-font-display` | `'Space Grotesk', sans-serif` | 見出しフォント |
| `--vl-radius-sm` | `8px` | 小さい角丸 |
| `--vl-radius-md` | `12px` | 中くらいの角丸 |
| `--vl-radius-lg` | `16px` | 大きい角丸 |
| `--vl-radius-xl` | `20px` | 最大の角丸 |

---

## 6. Card Data Structure / カードデータ構造

### カテゴリ
| Key | Label | Color | Cards |
|-----|-------|-------|-------|
| `anime` | 🎌 Anime & Manga | `#FF6B9D` | 15 |
| `cooking` | 🍳 Cooking & Food | `#FF8C42` | 15 |
| `tech` | 💻 Tech & Gaming | `#6C5CE7` | 15 |
| `travel` | ✈️ Travel & Culture | `#00B894` | 15 |
| `music` | 🎵 Music & Entertainment | `#E84393` | 15 |

### カード1枚の構造
```js
{
  topic: "Anime vs Reality",            // English title
  ja: "アニメと現実の違い",                // Japanese title
  prompts: [                             // 3 bilingual prompts (easy → hard)
    "How does anime portray school life differently? / アニメの学校生活と現実はどう違う？",
    "Which anime world would you want to live in? / どのアニメの世界に住みたい？",
    "Do you think anime influences how people see Japan? / アニメは日本のイメージに影響してると思う？",
  ],
  vocab: [                               // 3 useful words/phrases
    "portrayal (描写)",
    "influence (影響)",
    "stereotype (ステレオタイプ)",
  ],
}
```

### カードを追加する方法
`conversationData.js` の該当カテゴリ・レベルの配列に追加するだけ。

```js
// Example: cooking > intermediate に新しいカードを追加
{
  topic: "Your New Topic",
  ja: "新しいトピック",
  prompts: [
    "Easy prompt / 簡単な質問",
    "Medium prompt / 中くらいの質問",
    "Hard prompt / 難しい質問",
  ],
  vocab: ["word1 (日本語1)", "word2 (日本語2)", "word3 (日本語3)"],
},
```

---

## 7. Key Behaviors / 主要な動作仕様

### レベルマッチング
- 二人のレベルのうち **低い方** をベースレベルとして採用
- ベースレベルのカード + **1つ上のレベル** のカードを混ぜてデッキを構成
- 例: Beginner + Intermediate → Beginner & Intermediate のカードが出る

### タイマー
- セッション時間の **半分** で言語切り替えアラートが表示される
- 前半: English Time 🇺🇸 → 後半: 日本語タイム 🇯🇵
- 残り60秒で色が赤に変わる
- 一時停止・リセット可能

### カードデッキ
- 選択したカテゴリのカードをシャッフルして表示
- 「Next Card」で次のカードへ
- 「Shuffle」でデッキを再シャッフル
- デッキが一周したら最初に戻る（無限ループ）

---

## 8. Future Enhancements / 将来の拡張

### Phase 2（近い将来）
- [ ] Level Checkの結果と連動してレベルを自動設定
- [ ] ユーザープロフィールの興味データと連動
- [ ] セッション後の「今日学んだ表現」レビュー画面
- [ ] カード評価（👍/👎）でフィードバック収集

### Phase 3（中期）
- [ ] WebSocketで二人のカードを同期表示
- [ ] ユーザーが作るカスタムカード（UGC）
- [ ] AIが二人の趣味データからパーソナライズカード生成
- [ ] 会話の録音→AI文字起こし→フィードバック

### Phase 4（長期）
- [ ] カテゴリの追加（Sports, Fashion, Science, etc.）
- [ ] ゲーム要素（ポイント、連続日数、バッジ）
- [ ] グループセッション対応（3人以上）

---

## 9. Dependencies / 依存関係

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18+ | UI framework |
| Google Fonts | - | DM Sans, Space Grotesk |

**外部ライブラリ不要** — React標準のhooksのみ使用（useState, useEffect, useRef）。

---

## 10. Notes for Developer / 開発者向けメモ

1. **プロトタイプ動作確認**: `prototype/voice-lounge-tool.jsx` をClaude.aiのArtifactとして貼り付けると、すぐに動作確認できる

2. **スタイリング**: 現在はインラインスタイル。サイトのCSSフレームワーク（Tailwind等）に移行する場合は、CSS変数のマッピングを参考にしてください

3. **レスポンシブ**: `maxWidth: 440px` でモバイルファーストの設計。デスクトップではセンタリングされる

4. **i18n**: 現在はハードコードのバイリンガル表示。本格的なi18n対応が必要な場合は、ラベル類を別ファイルに切り出すことを推奨

5. **アクセシビリティ**: ボタンには明確なテキストラベルあり。色だけに依存しない設計。キーボードナビゲーションはブラウザデフォルト

6. **パフォーマンス**: カードデータは静的インポート。75枚程度ならバンドルサイズへの影響は軽微（推定 ~15KB gzipped）
