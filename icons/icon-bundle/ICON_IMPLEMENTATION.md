# アイコン・OGP 実装指示書

## 概要
ファビコン、PWAアイコン、OGP画像をサイトに設定する。
添付ファイル一式を `public/` に配置し、HTMLとmanifestを更新する。

---

## 1. ファイル配置

以下のファイルを `public/` ディレクトリに配置：

```
public/
├── favicon.ico              ← favicon-final.ico をリネーム
├── favicon-16x16.png        ← favicon-final-16.png をリネーム
├── favicon-32x32.png        ← favicon-final-32.png をリネーム
├── apple-touch-icon.png     ← そのまま（180x180, 2カップ全体版）
├── icon-192x192.png         ← そのまま（2カップ全体版）
├── icon-512x512.png         ← そのまま（2カップ全体版）
└── ogp-1200x630.png         ← そのまま
```

※ 既存の favicon や紫グラデーションの「G」アイコンがある場合は上書き

---

## 2. HTMLの `<head>` を更新

`index.html` または レイアウトコンポーネントの `<head>` 内に以下を追加/更新：

```html
<!-- Favicon -->
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

<!-- Apple Touch Icon（ホームに追加） -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json" />

<!-- OGP (Open Graph Protocol) -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Geek out with Me! - 好きなことを英語で話そう" />
<meta property="og:description" content="EN-JP Language Exchange Platform. 好きなことで英語を話そう。Passion Breaks Language Barrier." />
<meta property="og:image" content="https://geekout-withme.pages.dev/ogp-1200x630.png" />
<meta property="og:url" content="https://geekout-withme.pages.dev" />
<meta property="og:site_name" content="Geek out with Me!" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Geek out with Me! - 好きなことを英語で話そう" />
<meta name="twitter:description" content="EN-JP Language Exchange Platform. 好きなことで英語を話そう。Passion Breaks Language Barrier." />
<meta name="twitter:image" content="https://geekout-withme.pages.dev/ogp-1200x630.png" />

<!-- Theme Color（ブラウザのアドレスバー色） -->
<meta name="theme-color" content="#F97316" />
```

---

## 3. PWA manifest.json の更新

`public/manifest.json`（または `site.webmanifest`）を作成/更新：

```json
{
  "name": "Geek out with Me!",
  "short_name": "GOWM",
  "description": "EN-JP Language Exchange Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF5EB",
  "theme_color": "#F97316",
  "icons": [
    {
      "src": "/favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

---

## 4. ページ別OGP（オプション）

各ページで `og:title` と `og:description` を動的に変えたい場合：

| ページ | og:title | og:description |
|---|---|---|
| トップ | Geek out with Me! - 好きなことを英語で話そう | EN-JP Language Exchange Platform |
| Level Check | レベルチェック - Geek out with Me! | あなたの英語・日本語レベルを無料診断 |
| Conversation Cards | 会話カード - Geek out with Me! | 75枚の話題カードで英語・日本語の会話練習 |
| Voice Lounge | Voice Lounge - Geek out with Me! | リアルタイムで言語交換パートナーと会話 |

og:image は全ページ共通で `ogp-1200x630.png` を使用。

---

## 5. 確認方法

### ファビコン
- ブラウザのタブにコーヒー×抹茶の陰陽カップが表示されること

### PWA（ホームに追加）
- スマホで「ホーム画面に追加」→ 2カップのトロピカルアイコンが表示されること

### OGP
- https://ogp.me/ や X の Card Validator で確認
- XやThreadsでURLを貼った時にカード画像が表示されること

---

## アイコンデザイン一覧

| アイコン | デザイン |
|---|---|
| ファビコン（タブ） | コーヒー×抹茶の陰陽カップ（上から見た図） |
| PWA / Apple Touch | トロピカル背景にENコーヒーマグ＋JP抹茶湯呑み |
| OGP | 左に2カップ画像、右にサイト名＋タグライン |
