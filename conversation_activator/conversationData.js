// Voice Lounge Conversation Data
// Last updated: 2026-02-21
// Total cards: 75 (5 categories × 3 levels × 5 cards)

export const CATEGORIES = {
  anime: {
    label: "🎌 Anime & Manga",
    color: "#FF6B9D",
    cards: {
      beginner: [
        {
          topic: "My Favorite Anime",
          ja: "好きなアニメについて話そう",
          prompts: [
            "What anime are you watching now? / 今どんなアニメを見てる？",
            "Who is your favorite character? Why? / 好きなキャラクターは誰？なんで？",
            "Do you prefer sub or dub? / 字幕派？吹き替え派？",
          ],
          vocab: ["episode (エピソード)", "character (キャラクター)", "storyline (ストーリーライン)"],
        },
        {
          topic: "Anime Recommendations",
          ja: "アニメのおすすめを聞こう",
          prompts: [
            "Can you recommend an anime for beginners? / 初心者向けのアニメある？",
            "What genre do you like? Action? Romance? / どのジャンルが好き？アクション？恋愛？",
            "Have you read the manga too? / 漫画も読んだ？",
          ],
          vocab: ["genre (ジャンル)", "recommend (おすすめする)", "manga (漫画)"],
        },
        {
          topic: "Anime Characters I Relate To",
          ja: "共感するアニメキャラ",
          prompts: [
            "Is there a character that reminds you of yourself? / 自分に似てるキャラクターいる？",
            "Which character would you want as a friend? / 友達にしたいキャラクターは？",
            "Who is the funniest anime character you know? / 一番おもしろいアニメキャラは？",
          ],
          vocab: ["relate to (共感する)", "personality (性格)", "remind (思い出させる)"],
        },
        {
          topic: "Anime & Daily Life",
          ja: "アニメと日常生活",
          prompts: [
            "When do you usually watch anime? / 普段いつアニメを見る？",
            "Do you watch anime alone or with friends? / アニメは一人で見る？友達と？",
            "Have you ever tried food you saw in an anime? / アニメで見た食べ物を試したことある？",
          ],
          vocab: ["binge-watch (一気見する)", "schedule (スケジュール)", "snack (おやつ)"],
        },
        {
          topic: "Manga vs Anime",
          ja: "漫画とアニメ、どっちが好き？",
          prompts: [
            "Do you read manga or watch anime more? / 漫画を読む方が多い？アニメを見る方が多い？",
            "Is there a manga that is better than its anime? / アニメより原作の方がいい漫画はある？",
            "How do you read manga? On paper or digital? / 漫画はどうやって読む？紙？デジタル？",
          ],
          vocab: ["original work (原作)", "adaptation (アニメ化)", "panel (コマ)"],
        },
      ],
      intermediate: [
        {
          topic: "Anime vs Reality",
          ja: "アニメと現実の違い",
          prompts: [
            "How does anime portray school life differently from reality? / アニメの学校生活と現実はどう違う？",
            "Which anime world would you want to live in? / どのアニメの世界に住みたい？",
            "Do you think anime influences how people see Japan? / アニメは日本のイメージに影響してると思う？",
          ],
          vocab: ["portrayal (描写)", "influence (影響)", "stereotype (ステレオタイプ)"],
        },
        {
          topic: "Anime Industry",
          ja: "アニメ業界について",
          prompts: [
            "What do you know about working conditions in the anime industry? / アニメ業界の労働環境について知ってる？",
            "Which studio makes the best animation? / どのスタジオのアニメーションが一番いい？",
            "How has anime changed over the last 10 years? / アニメはこの10年でどう変わった？",
          ],
          vocab: ["studio (スタジオ)", "animation quality (作画)", "industry (業界)"],
        },
        {
          topic: "Cosplay & Fan Culture",
          ja: "コスプレとファン文化",
          prompts: [
            "Have you ever been to an anime convention? / アニメのイベントに行ったことある？",
            "What do you think about cosplay culture? / コスプレ文化についてどう思う？",
            "Do you collect any anime merchandise? / アニメグッズを集めてる？",
          ],
          vocab: ["convention (コンベンション)", "cosplay (コスプレ)", "merchandise (グッズ)"],
        },
        {
          topic: "Anime Opening & Ending Songs",
          ja: "アニメのOP・EDソング",
          prompts: [
            "What's the best anime opening song you've heard? / 今まで聞いた最高のアニメOPは？",
            "Do you skip the opening or always watch it? / OPはスキップする？毎回見る？",
            "Has an anime song ever made you emotional? / アニメの曲で感動したことある？",
          ],
          vocab: ["opening theme (オープニング曲)", "soundtrack (サウンドトラック)", "emotional (感動的な)"],
        },
        {
          topic: "Anime Tropes & Clichés",
          ja: "アニメの「お約束」",
          prompts: [
            "What's an anime trope you love? / 好きなアニメの「お約束」は？",
            "Is there a cliché you're tired of seeing? / もう飽きた決まりパターンはある？",
            "Why do you think certain tropes are so popular? / ある「お約束」がなぜ人気だと思う？",
          ],
          vocab: ["trope (お約束・定番展開)", "cliché (ありきたり)", "plot twist (どんでん返し)"],
        },
      ],
      advanced: [
        {
          topic: "Cultural Impact of Anime",
          ja: "アニメの文化的影響",
          prompts: [
            "How has anime shaped global pop culture? / アニメは世界のポップカルチャーにどう影響した？",
            "Discuss the difference between 'otaku' culture in Japan vs abroad / 日本と海外の「オタク」文化の違いは？",
            "Should anime be considered a legitimate art form? / アニメは正当な芸術と認められるべき？",
          ],
          vocab: ["cultural export (文化輸出)", "soft power (ソフトパワー)", "subculture (サブカルチャー)"],
        },
        {
          topic: "Representation in Anime",
          ja: "アニメにおける表現と多様性",
          prompts: [
            "How well does anime represent different cultures and backgrounds? / アニメは多様な文化や背景をうまく描いてる？",
            "Have you seen anime that changed your perspective on something? / 考え方を変えてくれたアニメはある？",
            "How do gender roles in anime compare to real life? / アニメのジェンダー役割は現実とどう違う？",
          ],
          vocab: ["representation (表現)", "diversity (多様性)", "perspective (視点)"],
        },
        {
          topic: "Anime & Psychology",
          ja: "アニメと心理学",
          prompts: [
            "Some anime explore mental health deeply — which ones stand out to you? / メンタルヘルスを深く描いたアニメで印象的なのは？",
            "Why do people form such strong emotional bonds with fictional characters? / なぜ人はフィクションのキャラに強い感情を持つ？",
            "Can anime be therapeutic? Have you experienced that? / アニメはセラピーになりうる？そういう経験は？",
          ],
          vocab: ["therapeutic (治療的な)", "emotional bond (感情的なつながり)", "mental health (メンタルヘルス)"],
        },
        {
          topic: "The Future of Anime",
          ja: "アニメの未来",
          prompts: [
            "How might AI change anime production? / AIはアニメ制作をどう変える？",
            "Will anime become even more mainstream worldwide? / アニメはさらに世界的にメインストリームになる？",
            "What would you change about the anime industry if you could? / アニメ業界を変えられるとしたら何を変える？",
          ],
          vocab: ["mainstream (主流)", "production (制作)", "innovation (革新)"],
        },
        {
          topic: "Anime Adaptations & Localization",
          ja: "アニメの翻訳・ローカライズ問題",
          prompts: [
            "What gets lost in translation when anime is dubbed or subtitled? / 吹き替えや字幕で失われるものは何？",
            "Should anime be adapted to fit Western audiences, or kept as-is? / アニメは西洋の観客に合わせるべき？そのままがいい？",
            "Have you noticed localization choices that surprised you? / 驚いたローカライズの選択はある？",
          ],
          vocab: ["localization (ローカライズ)", "translation (翻訳)", "nuance (ニュアンス)"],
        },
      ],
    },
  },
  cooking: {
    label: "🍳 Cooking & Food",
    color: "#FF8C42",
    cards: {
      beginner: [
        {
          topic: "What's for Dinner?",
          ja: "今日の晩ごはんは何？",
          prompts: [
            "What did you eat today? / 今日は何食べた？",
            "Can you cook? What's your best dish? / 料理できる？得意料理は？",
            "What food do you miss from home? / 地元の食べ物で恋しいものは？",
          ],
          vocab: ["ingredient (材料)", "recipe (レシピ)", "delicious (おいしい)"],
        },
        {
          topic: "Food Culture Shock",
          ja: "食文化のカルチャーショック",
          prompts: [
            "What surprised you about food in another country? / 他の国の食べ物で驚いたことは？",
            "Is there a food you can't eat? / 食べられない食べ物はある？",
            "Do you eat breakfast? What kind? / 朝ごはんは食べる？どんなの？",
          ],
          vocab: ["culture shock (カルチャーショック)", "texture (食感)", "seasoning (味付け)"],
        },
        {
          topic: "Sweet Tooth or Savory?",
          ja: "甘党？辛党？",
          prompts: [
            "Do you prefer sweet food or savory food? / 甘いもの派？しょっぱいもの派？",
            "What's your favorite dessert? / 好きなデザートは？",
            "What snacks are popular in your country? / あなたの国で人気のおやつは？",
          ],
          vocab: ["sweet (甘い)", "savory (しょっぱい・旨味のある)", "snack (おやつ)"],
        },
        {
          topic: "Eating Out",
          ja: "外食の話",
          prompts: [
            "Do you eat out often or cook at home? / よく外食する？自炊が多い？",
            "What's your favorite restaurant or café? / お気に入りのレストランやカフェは？",
            "What do you usually order? / いつも何を注文する？",
          ],
          vocab: ["menu (メニュー)", "order (注文する)", "takeout (テイクアウト)"],
        },
        {
          topic: "Comfort Food",
          ja: "ほっとする食べ物",
          prompts: [
            "What food makes you feel better when you're sad? / 悲しい時に元気が出る食べ物は？",
            "Does your family have a special recipe? / 家族の特別なレシピはある？",
            "What did you eat a lot as a kid? / 子供の頃よく食べてたものは？",
          ],
          vocab: ["comfort food (ほっとする食べ物)", "homemade (手作りの)", "childhood (子供時代)"],
        },
      ],
      intermediate: [
        {
          topic: "Cooking Challenge",
          ja: "料理チャレンジ",
          prompts: [
            "If you had to cook a dish from each other's country, what would you try? / お互いの国の料理を作るなら何に挑戦する？",
            "What's the hardest dish you've ever made? / 今まで作った一番難しい料理は？",
            "Describe your cooking style — are you a recipe follower or improviser? / 料理スタイルは？レシピ通り派？アレンジ派？",
          ],
          vocab: ["improvise (即興でやる)", "technique (テクニック)", "from scratch (一から)"],
        },
        {
          topic: "Kitchen Disasters",
          ja: "料理の失敗談",
          prompts: [
            "What's the worst cooking fail you've had? / 一番ひどい料理の失敗は？",
            "Have you ever burned something badly? / ひどく焦がしたことある？",
            "Is there a dish you've tried many times but can never get right? / 何度作ってもうまくいかない料理はある？",
          ],
          vocab: ["burn (焦がす)", "fail (失敗)", "overcooked (火を通しすぎた)"],
        },
        {
          topic: "Food & Health",
          ja: "食と健康",
          prompts: [
            "Have you ever tried a special diet? How was it? / 特別な食事法を試したことある？",
            "How do food habits differ between your country and Japan? / 食習慣はあなたの国と日本でどう違う？",
            "What do you think is the key to a healthy relationship with food? / 食との健康的な関係で大事なことは？",
          ],
          vocab: ["diet (食事法)", "nutrition (栄養)", "balanced meal (バランスのいい食事)"],
        },
        {
          topic: "Street Food Around the World",
          ja: "世界のストリートフード",
          prompts: [
            "What's the best street food in your country? / あなたの国の一番おいしいストリートフードは？",
            "Have you tried any Japanese street food like takoyaki or yakitori? / たこ焼きや焼き鳥を食べたことある？",
            "If you could open a food stall, what would you sell? / 屋台を開くなら何を売る？",
          ],
          vocab: ["street food (ストリートフード)", "stall (屋台)", "portion (量)"],
        },
        {
          topic: "Cooking Shows & Food Content",
          ja: "料理番組と食のコンテンツ",
          prompts: [
            "Do you watch any cooking shows or food YouTubers? / 料理番組やフードYouTuberは見る？",
            "Have you ever recreated a recipe you saw online? / ネットで見たレシピを再現したことある？",
            "Why do you think food content is so popular on social media? / なぜ食のコンテンツはSNSで人気だと思う？",
          ],
          vocab: ["recipe video (レシピ動画)", "content creator (コンテンツクリエイター)", "viral (バズる)"],
        },
      ],
      advanced: [
        {
          topic: "Food Politics",
          ja: "食の政治学",
          prompts: [
            "How do food trends reflect social values? / 食のトレンドは社会の価値観をどう反映してる？",
            "What are your thoughts on food sustainability? / 食の持続可能性についてどう思う？",
            "Is 'authentic' food a meaningful concept, or is fusion the future? / 「本格的な」料理に意味はある？それともフュージョンが未来？",
          ],
          vocab: ["sustainability (持続可能性)", "fusion (フュージョン)", "food sovereignty (食料主権)"],
        },
        {
          topic: "Food & Cultural Identity",
          ja: "食と文化的アイデンティティ",
          prompts: [
            "How does food connect you to your cultural roots? / 食べ物はあなたの文化的ルーツとどうつながってる？",
            "When a foreign country adapts your cuisine, is it flattering or offensive? / 外国があなたの国の料理をアレンジしたら嬉しい？嫌？",
            "Can food be a form of cultural diplomacy? / 食は文化外交の一形態になりうる？",
          ],
          vocab: ["cultural roots (文化的ルーツ)", "diplomacy (外交)", "appropriation (文化の盗用)"],
        },
        {
          topic: "The Future of Food",
          ja: "食の未来",
          prompts: [
            "Would you eat lab-grown meat? Why or why not? / 培養肉を食べる？なぜ？",
            "How might climate change affect what we eat in 20 years? / 気候変動は20年後の食生活にどう影響する？",
            "Should we rethink our relationship with food waste? / フードロスとの関係を見直すべき？",
          ],
          vocab: ["lab-grown (培養の)", "climate change (気候変動)", "food waste (フードロス)"],
        },
        {
          topic: "Eating Habits & Society",
          ja: "食習慣と社会",
          prompts: [
            "Why do some cultures eat together and others eat alone? / なぜ一緒に食べる文化と一人で食べる文化がある？",
            "How has convenience culture changed the way we eat? / コンビニ文化は食のあり方をどう変えた？",
            "Is there too much pressure to eat 'perfectly' in modern society? / 現代社会は「完璧な食事」にプレッシャーをかけすぎ？",
          ],
          vocab: ["convenience (コンビニエンス)", "social pressure (社会的プレッシャー)", "mindful eating (マインドフルイーティング)"],
        },
        {
          topic: "Regional Food Rivalries",
          ja: "地域の食バトル",
          prompts: [
            "Does your country have regional food rivalries like Japan's okonomiyaki debate? / あなたの国にも日本のお好み焼き論争みたいな地域の食バトルはある？",
            "How does geography shape a region's cuisine? / 地形は地域の料理にどう影響する？",
            "Should traditional recipes be preserved or evolved? / 伝統的なレシピは守るべき？進化させるべき？",
          ],
          vocab: ["rivalry (ライバル関係)", "geography (地形)", "tradition (伝統)"],
        },
      ],
    },
  },
  tech: {
    label: "💻 Tech & Gaming",
    color: "#6C5CE7",
    cards: {
      beginner: [
        {
          topic: "My Phone & Apps",
          ja: "スマホとアプリの話",
          prompts: [
            "What apps do you use every day? / 毎日使うアプリは？",
            "iPhone or Android? Why? / iPhoneとAndroidどっち派？なんで？",
            "What's the last game you played? / 最近やったゲームは何？",
          ],
          vocab: ["app (アプリ)", "download (ダウンロード)", "notification (通知)"],
        },
        {
          topic: "Social Media Life",
          ja: "SNSの話",
          prompts: [
            "Which social media do you use most? / 一番使うSNSは？",
            "Do you post a lot or just look at other people's posts? / よく投稿する？見る専？",
            "What kind of content do you like to see? / どんなコンテンツを見るのが好き？",
          ],
          vocab: ["post (投稿する)", "follow (フォロー)", "feed (フィード)"],
        },
        {
          topic: "Video Games I Love",
          ja: "好きなゲームの話",
          prompts: [
            "What's your favorite video game of all time? / 史上最高のゲームは？",
            "Do you play on console, PC, or mobile? / ゲーム機、PC、スマホ、どれでやる？",
            "Have you ever played a Japanese game? / 日本のゲームをやったことある？",
          ],
          vocab: ["console (ゲーム機)", "controller (コントローラー)", "level (レベル)"],
        },
        {
          topic: "Internet Habits",
          ja: "ネットの習慣",
          prompts: [
            "What's the first thing you do when you go online? / ネットを開いて最初にすることは？",
            "How many hours do you spend on the internet daily? / 1日何時間ネットを使う？",
            "Have you learned anything useful from YouTube? / YouTubeで役に立つことを学んだことある？",
          ],
          vocab: ["browse (ネットサーフィンする)", "search (検索する)", "bookmark (ブックマーク)"],
        },
        {
          topic: "Tech in Daily Life",
          ja: "日常のテクノロジー",
          prompts: [
            "What technology could you not live without? / なくては生きていけないテクノロジーは？",
            "Do you use any smart home devices? / スマートホームデバイスは使ってる？",
            "What was the last thing you bought online? / 最後にネットで買ったものは何？",
          ],
          vocab: ["smart device (スマートデバイス)", "online shopping (ネット通販)", "gadget (ガジェット)"],
        },
      ],
      intermediate: [
        {
          topic: "AI & Our Future",
          ja: "AIと未来",
          prompts: [
            "How do you use AI in your daily life? / AIを日常でどう使ってる？",
            "Are you worried AI will replace some jobs? / AIが仕事を奪うと心配してる？",
            "What's the coolest tech you've seen recently? / 最近見た一番クールなテクノロジーは？",
          ],
          vocab: ["artificial intelligence (人工知能)", "automation (自動化)", "innovation (イノベーション)"],
        },
        {
          topic: "Gaming Culture",
          ja: "ゲーム文化",
          prompts: [
            "How is gaming culture different in your country? / あなたの国のゲーム文化はどう違う？",
            "What's your take on esports? / eスポーツについてどう思う？",
            "Solo games vs multiplayer — which do you prefer? / ソロゲームとマルチプレイ、どっちが好き？",
          ],
          vocab: ["esports (eスポーツ)", "multiplayer (マルチプレイ)", "streaming (配信)"],
        },
        {
          topic: "Digital Detox",
          ja: "デジタルデトックス",
          prompts: [
            "Have you ever tried a digital detox? How was it? / デジタルデトックスしたことある？どうだった？",
            "Do you think we're too dependent on our phones? / スマホに依存しすぎだと思う？",
            "What would you do with a whole day offline? / 一日中オフラインだったら何する？",
          ],
          vocab: ["detox (デトックス)", "screen time (スクリーンタイム)", "dependent (依存している)"],
        },
        {
          topic: "Tech Differences: Japan vs The World",
          ja: "テクノロジーの違い：日本と世界",
          prompts: [
            "What's a tech thing that's common in Japan but rare elsewhere? / 日本では当たり前だけど海外では珍しいテクノロジーは？",
            "Why does Japan still use fax machines so much? / なぜ日本はまだFAXをこんなに使う？",
            "What tech from another country do you wish existed in yours? / 他の国のテクノロジーで自分の国にもあればいいのにと思うものは？",
          ],
          vocab: ["cashless (キャッシュレス)", "fax machine (FAX)", "infrastructure (インフラ)"],
        },
        {
          topic: "Learning with Technology",
          ja: "テクノロジーで学ぶ",
          prompts: [
            "What apps or tools do you use to study languages? / 言語学習にどんなアプリやツールを使ってる？",
            "Do you think online learning is as good as in-person? / オンライン学習は対面と同じくらいいいと思う？",
            "How has technology changed the way you learn new things? / テクノロジーは新しいことの学び方をどう変えた？",
          ],
          vocab: ["e-learning (eラーニング)", "tutorial (チュートリアル)", "productivity (生産性)"],
        },
      ],
      advanced: [
        {
          topic: "Digital Ethics",
          ja: "デジタル倫理",
          prompts: [
            "Where should we draw the line with AI-generated content? / AI生成コンテンツの線引きはどこ？",
            "How do privacy expectations differ between Japan and your country? / プライバシーの期待値は日本とあなたの国でどう違う？",
            "Should tech companies be regulated more strictly? / テック企業はもっと厳しく規制されるべき？",
          ],
          vocab: ["regulation (規制)", "privacy (プライバシー)", "ethics (倫理)"],
        },
        {
          topic: "The Attention Economy",
          ja: "アテンションエコノミー",
          prompts: [
            "How do apps keep us hooked, and should that be regulated? / アプリはどうやって私たちをハマらせてる？規制すべき？",
            "Is doomscrolling a personal problem or a design problem? / ドゥームスクローリングは個人の問題？設計の問題？",
            "How do you manage your own attention in a world designed to distract you? / 気が散るように設計された世界で、どうやって自分の注意力を管理してる？",
          ],
          vocab: ["attention economy (アテンションエコノミー)", "doomscrolling (ドゥームスクローリング)", "algorithm (アルゴリズム)"],
        },
        {
          topic: "Tech & Work Culture",
          ja: "テクノロジーと働き方",
          prompts: [
            "How has remote work changed your relationship with technology? / リモートワークはテクノロジーとの関係をどう変えた？",
            "Should employees have the right to disconnect after work hours? / 社員には勤務時間外に「つながらない権利」があるべき？",
            "How might AI change the concept of a 'career'? / AIは「キャリア」の概念をどう変える？",
          ],
          vocab: ["remote work (リモートワーク)", "right to disconnect (つながらない権利)", "freelance (フリーランス)"],
        },
        {
          topic: "Open Source & Digital Commons",
          ja: "オープンソースとデジタルコモンズ",
          prompts: [
            "Do you think software should be free for everyone? / ソフトウェアは全員に無料であるべきだと思う？",
            "How does the open source movement compare to Japanese business culture? / オープンソース運動は日本のビジネス文化とどう比較できる？",
            "Who really owns digital content — the creator, the platform, or the user? / デジタルコンテンツの本当の所有者は誰？クリエイター？プラットフォーム？ユーザー？",
          ],
          vocab: ["open source (オープンソース)", "digital commons (デジタルコモンズ)", "intellectual property (知的財産)"],
        },
        {
          topic: "Sci-Fi vs Reality",
          ja: "SFと現実",
          prompts: [
            "Which sci-fi prediction do you think will come true next? / 次に実現するSFの予言は何だと思う？",
            "Are we living in a cyberpunk world already? / もうサイバーパンクの世界に住んでる？",
            "If you could have one piece of future technology right now, what would it be? / 未来のテクノロジーを一つ今すぐ手に入れるなら何がいい？",
          ],
          vocab: ["cyberpunk (サイバーパンク)", "prediction (予測)", "dystopia (ディストピア)"],
        },
      ],
    },
  },
  travel: {
    label: "✈️ Travel & Culture",
    color: "#00B894",
    cards: {
      beginner: [
        {
          topic: "Dream Destination",
          ja: "行きたい場所",
          prompts: [
            "Where do you want to travel next? / 次はどこに旅行したい？",
            "Have you been to Japan / your country? / 日本/あなたの国に行ったことある？",
            "Beach or mountains? / 海派？山派？",
          ],
          vocab: ["destination (目的地)", "souvenir (お土産)", "sightseeing (観光)"],
        },
        {
          topic: "Travel Memories",
          ja: "旅の思い出",
          prompts: [
            "What's the best trip you've ever taken? / 今までで最高の旅は？",
            "Did anything funny happen while traveling? / 旅行中に面白いことあった？",
            "Do you like to plan everything or be spontaneous? / 全部計画する派？その場のノリ派？",
          ],
          vocab: ["trip (旅行)", "spontaneous (spontaneous/思いつきの)", "memorable (記憶に残る)"],
        },
        {
          topic: "How Do You Travel?",
          ja: "旅のスタイル",
          prompts: [
            "Do you prefer hotels, hostels, or Airbnb? / ホテル、ホステル、Airbnb、どれが好き？",
            "Have you ever traveled alone? / 一人旅したことある？",
            "What do you always pack when you travel? / 旅行の時に必ず持っていくものは？",
          ],
          vocab: ["pack (荷造りする)", "hostel (ホステル)", "luggage (荷物)"],
        },
        {
          topic: "Your Hometown",
          ja: "あなたの地元",
          prompts: [
            "Tell me about your hometown! / 地元について教えて！",
            "What's the best thing about where you live? / 今住んでいるところの一番いいところは？",
            "If I visited, what should I definitely see or do? / もし行ったら、絶対見るべき・やるべきことは？",
          ],
          vocab: ["hometown (地元)", "local (地元の)", "famous for (〜で有名)"],
        },
        {
          topic: "Transportation",
          ja: "乗り物の話",
          prompts: [
            "Do you prefer trains, buses, or driving? / 電車、バス、車、どれが好き？",
            "Have you ever taken a long train ride? / 長距離の電車に乗ったことある？",
            "What's transportation like in your city? / あなたの街の交通はどんな感じ？",
          ],
          vocab: ["train (電車)", "bus stop (バス停)", "commute (通勤する)"],
        },
      ],
      intermediate: [
        {
          topic: "Living Abroad",
          ja: "海外生活",
          prompts: [
            "What's the biggest adjustment when living in another country? / 海外生活で一番大きな調整は何？",
            "Have you experienced homesickness? How did you deal with it? / ホームシックになったことある？どう対処した？",
            "What's something your country does better than anywhere else? / あなたの国がどこよりも優れてることは？",
          ],
          vocab: ["adjustment (適応)", "homesickness (ホームシック)", "expat (海外在住者)"],
        },
        {
          topic: "Culture Shock Moments",
          ja: "カルチャーショックの瞬間",
          prompts: [
            "What's the biggest culture shock you've experienced? / 一番大きなカルチャーショックは何だった？",
            "Are there customs in your country that surprise foreigners? / あなたの国の習慣で外国人が驚くことは？",
            "How did you handle a misunderstanding caused by cultural differences? / 文化の違いによる誤解をどう乗り越えた？",
          ],
          vocab: ["custom (習慣)", "misunderstanding (誤解)", "adapt (適応する)"],
        },
        {
          topic: "Working Holiday Life",
          ja: "ワーキングホリデー生活",
          prompts: [
            "Have you ever done or considered a working holiday? / ワーホリをしたことある？考えたことは？",
            "What kind of jobs can you get on a working holiday? / ワーホリではどんな仕事ができる？",
            "What's the hardest part about building a life in a new country? / 新しい国で生活を築く一番大変なことは？",
          ],
          vocab: ["working holiday (ワーキングホリデー)", "visa (ビザ)", "temporary (一時的な)"],
        },
        {
          topic: "Hidden Gems",
          ja: "穴場スポット",
          prompts: [
            "What's a place in your country that tourists don't know about? / あなたの国で観光客が知らない場所は？",
            "Do you prefer tourist spots or off-the-beaten-path places? / 観光地と穴場、どっちが好き？",
            "What's the most underrated city or town you've visited? / 今まで訪れた中で最も過小評価されてる街は？",
          ],
          vocab: ["hidden gem (穴場)", "off the beaten path (人が行かない場所)", "underrated (過小評価された)"],
        },
        {
          topic: "Language & Travel",
          ja: "言語と旅",
          prompts: [
            "Have you ever been somewhere where you couldn't speak the language at all? / 全く言語が話せない場所に行ったことある？",
            "What's a phrase every traveler should learn in your language? / あなたの言語で旅行者が覚えるべきフレーズは？",
            "How does knowing a local language change the travel experience? / 現地語を知ってると旅の経験はどう変わる？",
          ],
          vocab: ["phrase (フレーズ)", "gesture (ジェスチャー)", "communicate (コミュニケーションする)"],
        },
      ],
      advanced: [
        {
          topic: "Tourism & Identity",
          ja: "観光とアイデンティティ",
          prompts: [
            "How does mass tourism change local culture? / マスツーリズムは地元の文化をどう変える？",
            "Is there a difference between a 'tourist' and a 'traveler'? / 「観光客」と「旅人」に違いはある？",
            "How do you maintain your cultural identity while living abroad? / 海外に住みながら文化的アイデンティティをどう保つ？",
          ],
          vocab: ["overtourism (オーバーツーリズム)", "cultural identity (文化的アイデンティティ)", "gentrification (ジェントリフィケーション)"],
        },
        {
          topic: "Immigration & Belonging",
          ja: "移住と帰属意識",
          prompts: [
            "What makes you feel like you 'belong' in a place? / ある場所に「属している」と感じるのは何？",
            "How does immigration policy shape a country's culture? / 移民政策は国の文化をどう形作る？",
            "Can you be fully 'from' two places at once? / 同時に2つの場所の「出身」であることは可能？",
          ],
          vocab: ["belonging (帰属意識)", "immigration (移民)", "bicultural (バイカルチュラル)"],
        },
        {
          topic: "Sustainable Travel",
          ja: "サステナブルな旅",
          prompts: [
            "Is it possible to travel sustainably, or is all tourism inherently harmful? / サステナブルに旅することは可能？それとも観光は本質的に有害？",
            "Should there be limits on visitors to fragile destinations? / 脆弱な観光地への訪問者数を制限すべき？",
            "How do you balance wanting to see the world with environmental responsibility? / 世界を見たい気持ちと環境への責任、どうバランスを取る？",
          ],
          vocab: ["sustainable (持続可能な)", "carbon footprint (カーボンフットプリント)", "ecotourism (エコツーリズム)"],
        },
        {
          topic: "The Meaning of Home",
          ja: "「ホーム」の意味",
          prompts: [
            "Where is 'home' for you — is it a place, people, or a feeling? / あなたにとって「ホーム」はどこ？場所？人？感覚？",
            "How does living abroad change your relationship with your home country? / 海外生活は母国との関係をどう変える？",
            "Do you think the concept of 'home' is becoming more fluid in a globalized world? / グローバル化した世界で「ホーム」の概念はより流動的になってると思う？",
          ],
          vocab: ["fluid (流動的な)", "globalization (グローバル化)", "roots (ルーツ)"],
        },
        {
          topic: "Cross-Cultural Communication",
          ja: "異文化コミュニケーション",
          prompts: [
            "What's a communication style difference that causes the most misunderstanding? / 最も誤解を生むコミュニケーションスタイルの違いは？",
            "How do concepts like 'politeness' differ across cultures? / 「礼儀正しさ」の概念は文化によってどう違う？",
            "Is it possible to fully understand a culture without living in it? / その文化の中で生活せずに完全に理解することは可能？",
          ],
          vocab: ["indirect communication (間接的コミュニケーション)", "context (文脈)", "empathy (共感)"],
        },
      ],
    },
  },
  music: {
    label: "🎵 Music & Entertainment",
    color: "#E84393",
    cards: {
      beginner: [
        {
          topic: "What Are You Listening To?",
          ja: "最近何聴いてる？",
          prompts: [
            "What kind of music do you like? / どんな音楽が好き？",
            "Who is your favorite artist? / 好きなアーティストは？",
            "Do you play any instruments? / 楽器は弾ける？",
          ],
          vocab: ["lyrics (歌詞)", "melody (メロディー)", "concert (コンサート)"],
        },
        {
          topic: "Movies & TV Shows",
          ja: "映画とドラマの話",
          prompts: [
            "What's the last movie you watched? / 最後に見た映画は何？",
            "Do you prefer movies or TV series? / 映画派？ドラマ派？",
            "What movie can you watch over and over? / 何度でも見れる映画は？",
          ],
          vocab: ["movie (映画)", "series (シリーズ)", "plot (あらすじ)"],
        },
        {
          topic: "Karaoke!",
          ja: "カラオケの話！",
          prompts: [
            "Do you like karaoke? / カラオケは好き？",
            "What's your go-to karaoke song? / カラオケの十八番は？",
            "Is karaoke popular in your country? / あなたの国でカラオケは人気？",
          ],
          vocab: ["karaoke (カラオケ)", "sing (歌う)", "microphone (マイク)"],
        },
        {
          topic: "Celebrity & Fan Life",
          ja: "推し活",
          prompts: [
            "Do you have a favorite celebrity or idol? / 推しはいる？",
            "Have you ever been to a concert or fan event? / コンサートやファンイベントに行ったことある？",
            "What do you like most about your favorite artist? / 推しの一番好きなところは？",
          ],
          vocab: ["fan (ファン)", "idol (アイドル)", "support (応援する)"],
        },
        {
          topic: "Weekend Entertainment",
          ja: "週末の楽しみ方",
          prompts: [
            "What do you do for fun on weekends? / 週末は何して楽しんでる？",
            "Do you go to the movies or watch at home? / 映画館に行く？家で見る？",
            "Have you discovered anything new lately — a show, podcast, or song? / 最近新しく見つけたもの（番組、ポッドキャスト、曲）はある？",
          ],
          vocab: ["weekend (週末)", "podcast (ポッドキャスト)", "binge-watch (一気見する)"],
        },
      ],
      intermediate: [
        {
          topic: "Music & Memories",
          ja: "音楽と思い出",
          prompts: [
            "Is there a song that brings back a strong memory? / 強い思い出を呼び起こす曲はある？",
            "How has your music taste changed over the years? / 音楽の好みは年々どう変わった？",
            "J-pop vs K-pop — what do you think makes each unique? / J-popとK-pop、それぞれの個性は何だと思う？",
          ],
          vocab: ["nostalgia (ノスタルジア)", "genre (ジャンル)", "mainstream (メインストリーム)"],
        },
        {
          topic: "Comedy & Humor Across Cultures",
          ja: "笑いの文化の違い",
          prompts: [
            "What kind of comedy is popular in your country? / あなたの国ではどんなコメディが人気？",
            "Is humor hard to translate between languages? / ユーモアは言語間で翻訳しにくい？",
            "What Japanese comedy (like manzai) have you seen? What did you think? / 漫才などの日本のお笑いを見たことある？どう思った？",
          ],
          vocab: ["comedy (コメディ)", "humor (ユーモア)", "punchline (オチ)"],
        },
        {
          topic: "Live Events & Festivals",
          ja: "ライブイベントとフェス",
          prompts: [
            "What's the best live event you've been to? / 今まで行った最高のライブイベントは？",
            "Are music festivals popular in your country? / あなたの国で音楽フェスは人気？",
            "Would you rather go to a huge festival or a small intimate gig? / 大きなフェスと小さなライブ、どっちがいい？",
          ],
          vocab: ["festival (フェスティバル)", "gig (ライブ)", "atmosphere (雰囲気)"],
        },
        {
          topic: "Guilty Pleasures",
          ja: "こっそり好きなもの",
          prompts: [
            "What's a show or song you secretly enjoy but are embarrassed to admit? / こっそり好きだけど言うのが恥ずかしい番組や曲は？",
            "Why do we feel guilty about liking certain entertainment? / なぜ特定のエンタメが好きなことに罪悪感を感じる？",
            "Is 'guilty pleasure' even a valid concept? / 「ギルティプレジャー」って有効な概念？",
          ],
          vocab: ["guilty pleasure (ギルティプレジャー)", "embarrassed (恥ずかしい)", "judge (判断する)"],
        },
        {
          topic: "Podcasts & Audio Content",
          ja: "ポッドキャストと音声コンテンツ",
          prompts: [
            "Do you listen to any podcasts? Which ones? / ポッドキャスト聴いてる？どんなの？",
            "Why do you think podcasts have become so popular? / なぜポッドキャストがこんなに人気になったと思う？",
            "Would you ever start your own podcast? About what? / 自分のポッドキャストを始めるとしたら、何がテーマ？",
          ],
          vocab: ["podcast (ポッドキャスト)", "host (ホスト)", "episode (エピソード)"],
        },
      ],
      advanced: [
        {
          topic: "Music Industry & Streaming",
          ja: "音楽業界とストリーミング",
          prompts: [
            "How has streaming changed the way we discover and value music? / ストリーミングは音楽の発見と価値観をどう変えた？",
            "Should AI-generated music be treated the same as human-made music? / AI生成音楽は人間の音楽と同じに扱うべき？",
            "Why do certain songs become global hits while others don't? / なぜある曲は世界的ヒットになり、他はならない？",
          ],
          vocab: ["algorithm (アルゴリズム)", "royalties (ロイヤルティ)", "viral (バイラル)"],
        },
        {
          topic: "Entertainment & Social Influence",
          ja: "エンタメと社会的影響力",
          prompts: [
            "Should celebrities use their platform to speak on political issues? / セレブは政治問題について発言すべき？",
            "How does entertainment shape public opinion, especially among young people? / エンタメは世論、特に若者にどう影響する？",
            "Is 'cancel culture' a form of accountability or mob justice? / 「キャンセルカルチャー」は説明責任？それとも私刑？",
          ],
          vocab: ["cancel culture (キャンセルカルチャー)", "accountability (説明責任)", "influence (影響力)"],
        },
        {
          topic: "Art vs Commerce",
          ja: "アートとビジネス",
          prompts: [
            "Can art be truly 'independent' in a commercial world? / 商業的な世界でアートは本当に「独立」でいられる？",
            "Does the pressure to go viral hurt creativity? / バズるプレッシャーは創造性を損なう？",
            "How do you define 'selling out' vs 'making a living'? / 「魂を売る」と「生計を立てる」の違いをどう定義する？",
          ],
          vocab: ["commercial (商業的な)", "creativity (創造性)", "sell out (魂を売る)"],
        },
        {
          topic: "Representation in Media",
          ja: "メディアにおける表現",
          prompts: [
            "How well does mainstream media represent your culture? / メインストリームメディアはあなたの文化をうまく表現してる？",
            "What's a movie or show that got your culture right — or completely wrong? / あなたの文化を正確に描いた、または全く間違って描いた作品は？",
            "How important is 'seeing yourself' in the media you consume? / 消費するメディアに「自分を見る」ことはどれくらい重要？",
          ],
          vocab: ["representation (表現)", "stereotyping (ステレオタイプ化)", "visibility (可視性)"],
        },
        {
          topic: "The Future of Entertainment",
          ja: "エンタメの未来",
          prompts: [
            "Will VR/AR change how we experience concerts and movies? / VR/ARはコンサートや映画の体験をどう変える？",
            "Are we losing the 'shared experience' of entertainment in a fragmented media world? / メディアが細分化した世界で「共有体験」は失われてる？",
            "What form of entertainment do you think will dominate in 10 years? / 10年後に支配的なエンタメの形は何だと思う？",
          ],
          vocab: ["virtual reality (バーチャルリアリティ)", "fragmented (細分化された)", "immersive (没入型の)"],
        },
      ],
    },
  },
};

export const LEVELS = [
  { id: "beginner", label: "Beginner", ja: "初級", emoji: "🌱" },
  { id: "intermediate", label: "Intermediate", ja: "中級", emoji: "🌿" },
  { id: "advanced", label: "Advanced", ja: "上級", emoji: "🌳" },
];

export const ICEBREAKERS = [
  { en: "Two truths and a lie — can you guess which is the lie?", ja: "2つの本当と1つの嘘 — 嘘はどれ？" },
  { en: "If you could have dinner with anyone, who would it be?", ja: "誰とでも晩ご飯を食べられるとしたら、誰と食べたい？" },
  { en: "What's a skill you wish you had?", ja: "持っていたいスキルは何？" },
  { en: "Show me the last photo on your phone and tell the story!", ja: "スマホの最後の写真を見せて、ストーリーを教えて！" },
  { en: "What's a word in your language that can't be translated?", ja: "あなたの言語で翻訳できない言葉は何？" },
  { en: "Describe your perfect weekend in 3 sentences.", ja: "理想の週末を3文で説明して。" },
  { en: "What smell reminds you of home?", ja: "故郷を思い出させる匂いは？" },
  { en: "If you had a theme song, what would it be?", ja: "テーマソングがあるとしたら何？" },
];

export const ROLES = [
  { id: "free", label: "Free Talk", ja: "フリートーク", icon: "💬", desc: "No rules, just chat!" },
  { id: "interview", label: "Interview Mode", ja: "インタビュー", icon: "🎤", desc: "One asks, one answers, then switch" },
  { id: "teach", label: "Teach Me", ja: "教えて", icon: "📚", desc: "Take turns teaching something from your culture" },
  { id: "debate", label: "Friendly Debate", ja: "ディベート", icon: "⚡", desc: "Pick opposite sides and discuss" },
];

