# GOWM アプリ化 技術調査レポート

## Sayakaの要件
- プッシュ通知（ボイチャ入室通知）
- バックグラウンド動作
- App Storeで配布

---

## 選択肢は3つ

### ① Capacitor（今のWebアプリを箱に入れる）⭐ おすすめ

**たとえ：** 今ある料理（Webアプリ）をお弁当箱（Capacitor）に詰めて持ち出す。箱がネイティブ機能を持ってる。

**仕組み：**
- 今のReact/TypeScript/Tailwindのコードをそのまま使える
- ネイティブの「箱」で包んで、プッシュ通知・バックグラウンド等のネイティブ機能を追加
- iOS/Android両方に対応

**メリット：**
- 今のコードの90%以上をそのまま使える（作り直し不要）
- Web版とアプリ版を1つのコードベースで管理
- WebエンジニアのスキルでOK（Swift/Kotlin不要）
- プッシュ通知は Firebase Cloud Messaging (FCM) + Capacitor Pluginで実装可能
- 変換作業は数時間〜数日レベル

**デメリット：**
- WebViewベースなので、ガチのネイティブアプリよりパフォーマンスは若干劣る（GOWMの用途なら問題なし）
- Apple App Store審査で「Webサイトをラップしただけ」と判定されるとリジェクトされるリスクあり

**Apple審査を通すポイント：**
- プッシュ通知を実装する（これだけで「Webサイト以上」になる）
- オフライン機能を追加する
- ネイティブのナビゲーション（タブバー等）を使う
- Voice Loungeのバックグラウンド動作を実装する

→ GOWMはプッシュ通知＋ボイチャのバックグラウンド動作が必要 = 十分にネイティブ機能を使うので、審査は通る可能性が高い。

**必要なもの：**
- Apple Developer Program（¥12,800/年、個人で登録OK）
- Mac（Xcodeでビルド必要）
- Firebase プロジェクト（プッシュ通知用、無料枠あり）

**作業ステップ：**
1. `npx cap init` でCapacitor初期化
2. `npx cap add ios` でiOSプロジェクト追加
3. プッシュ通知プラグイン追加: `npm install @capacitor/push-notifications`
4. Firebase設定（FCM）
5. Xcodeでビルド＆テスト
6. Apple Developer登録 → App Store Connect で審査提出

**見積もり工数：** 1〜2週間（Claude Code + ITの先生で）

---

### ② React Native（作り直し）

**たとえ：** 今ある和食レストランを一度閉めて、同じメニューをフレンチレストランとして一から作り直す。

**仕組み：**
- JavaScriptで書くけど、UIは完全にネイティブコンポーネントで描画
- Webアプリのコードは基本使えない（UI部分は全部書き直し）
- ビジネスロジック（API呼び出し等）は流用できる部分もある

**メリット：**
- パフォーマンスが良い
- ネイティブの見た目・操作感
- 大きなコミュニティ

**デメリット：**
- UI全部作り直し（数ヶ月かかる）
- Web版とアプリ版が別コードベースになる
- 学習コストが高い

**見積もり工数：** 2〜4ヶ月

→ GOWMの規模・用途を考えると、React Nativeでの作り直しはオーバーキル。

---

### ③ Flutter（Googleの独自フレームワーク）

**たとえ：** 和食からイタリアンから全部一から別の言語（Dart）で作り直す。

**メリット：**
- 最高レベルのパフォーマンスとUI
- iOS/Android/Web/デスクトップ全対応

**デメリット：**
- Dart言語を新しく覚える必要がある
- 今のコードは一切使えない
- 完全作り直し

**見積もり工数：** 3〜6ヶ月

→ GOWMにはオーバースペック。

---

## 結論：Capacitor一択

GOWMの場合、Capacitorが圧倒的に最適：

| 比較項目 | Capacitor | React Native | Flutter |
|---|---|---|---|
| 今のコード流用 | ◎ 90%以上 | △ ロジックのみ | ✕ 全部書き直し |
| 工数 | 1〜2週間 | 2〜4ヶ月 | 3〜6ヶ月 |
| プッシュ通知 | ◎ プラグインで対応 | ◎ | ◎ |
| バックグラウンド | ◎ プラグインで対応 | ◎ | ◎ |
| 学習コスト | ◎ 今のスキルでOK | △ RN独自のUI | ✕ Dart新規学習 |
| Apple審査 | ○ ネイティブ機能追加で通る | ◎ | ◎ |
| Web版との共存 | ◎ 同じコード | ✕ 別管理 | △ Flutter Webあるが未成熟 |

---

## Apple審査の注意点

Appleのガイドライン4.2「Minimum Functionality」：
「Webサイトをラップしただけのアプリ」はリジェクトされる。

**GOWMが審査を通るための必須実装：**
1. ✅ プッシュ通知（ボイチャ入室通知） ← これが最重要
2. ✅ バックグラウンドでのボイチャ継続
3. ✅ オフラインでの会話カード閲覧（キャッシュ）
4. ✅ ネイティブのタブナビゲーション
5. ✅ アプリアイコン＋スプラッシュスクリーン

→ 1と2は元々やりたいことなので、審査対策としてではなく自然に通る。

---

## Apple Developer登録（個人）

- 費用：¥12,800/年（USD $99）
- 登録：https://developer.apple.com/programs/
- 個人でOK（合同会社待たなくていい）
- 必要なもの：Apple ID、本人確認書類
- 審査：申請から数日で承認
- 注意：**Mac必須**（Xcodeでのビルドに必要）

---

## アプリ化のロードマップ案

### Phase 1: 準備（1日）
- Apple Developer Program登録
- Firebaseプロジェクト作成
- Capacitorの初期設定

### Phase 2: 基本変換（2〜3日）
- Capacitorでアプリ化
- ネイティブナビゲーション追加
- スプラッシュスクリーン＋アイコン設定

### Phase 3: プッシュ通知（3〜5日）
- FCM設定（Firebase Cloud Messaging）
- APNs設定（Apple Push Notification service）
- ボイチャ入室時の通知トリガー実装
- バックグラウンド動作の実装

### Phase 4: テスト＆審査（1週間）
- TestFlightでベータテスト
- バグ修正
- App Store Connect で審査提出
- 審査通過まで数日〜1週間

**合計：約2〜3週間**

---

## 補足：Cloudflare Pages + Astro → Capacitorへの移行

### IT先生の「Laravelなら楽」の意味
Laravelはフルスタックフレームワークで、フロントもバックも1つのプロジェクトに入ってる。だからそのままCapacitorで包める。

### Cloudflare + Astroでも問題ない
Capacitorが必要とするのは「ビルド後のHTML/CSS/JSファイル」。AstroもReactもVueも、最終的にはHTML/CSS/JSを吐き出す。だからフレームワークは関係ない。

**具体的な手順：**
1. `astro build` → `dist/` フォルダにHTML/CSS/JSが生成される
2. Capacitorは `dist/` の中身をネイティブアプリの WebView に読み込む
3. 以上。

**たとえ：** お弁当箱（Capacitor）は中身が和食（Astro）でもフレンチ（Laravel）でもイタリアン（Next.js）でも関係ない。ビルド済みのHTMLが入ってればOK。

**ただし注意点：**
- Astroの**SSR機能**（サーバーサイドレンダリング）を使ってる部分はCapacitorでは動かない。アプリ内はWebViewだから、Cloudflare Workersは呼べない
- 解決策：SSR使ってる部分をAPIとして切り出し、アプリからHTTPリクエストで呼ぶ
- 静的に生成されてるページ（prerender = true）はそのまま動く

**GOWMの場合：**
- 会話カード、Level Check等の静的コンテンツ → そのままOK
- Voice Lounge（WebRTC）→ WebViewでも動く（ただしテスト必要）
- Stripe決済 → Stripe Checkoutはブラウザベースなので問題なし
- Cloudflare Workers で動いてるバックエンドAPI → アプリからHTTP経由で呼べるのでOK

結論：**Cloudflare + Astroでも、Capacitorへの移行は問題なくできる。**

---

## 補足：Google Play（Android）

Capacitorなら`npx cap add android`で同時にAndroid版も作れる。
Google Play Developer登録は$25の一回払い。
審査もAppleより緩い。
ただし、ターゲットユーザーがiPhone中心ならiOS優先でOK。
