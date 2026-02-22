-- Japanese sample workbooks (3 workbooks x 5 days each)
-- Idempotent: deletes existing sample data before inserting

DELETE FROM workbook_days WHERE workbook_id IN ('sample_ja_01','sample_ja_02','sample_ja_03');
DELETE FROM workbooks WHERE id IN ('sample_ja_01','sample_ja_02','sample_ja_03');

-- =============================================================================
-- Workbook 1: 料理 (Cooking) - JLPT N5
-- =============================================================================

INSERT INTO workbooks (id, user_id, language, topic, topic_label, level, level_label, destination, dest_label, profile_json, theme_color, title, subtitle, is_public, status, days_completed, completed_at)
VALUES (
  'sample_ja_01',
  '48094704-91da-41ab-b57e-99fdab996cfa',
  'japanese',
  'cooking', '料理',
  'jlpt_n5', 'JLPT N5（入門）',
  'travel_japan', '日本旅行',
  '{}',
  'blue',
  '30日間料理日本語',
  'JLPT N5（入門） → 日本旅行',
  true,
  'completed',
  5,
  NOW()
);

-- Day 1: おにぎり 🍙
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_01', 1, 'Onigiri', 'おにぎり', '🍙', '{
  "main": {
    "title": "おにぎりを つくろう",
    "intro": "おにぎりは にほんの たべものです。",
    "body": "おにぎりは ごはんと のりで つくります。なかに ぐ（=filling）を いれます。うめぼし、さけ、ツナマヨが にんきです。コンビニの おにぎりは やすくて おいしいです。にほんじんは おべんとうに おにぎりを いれます。",
    "details": [
      "おにぎりの かたちは さんかく、まる、たわらの 3つです。",
      "のりは パリパリが すきな ひとと しっとりが すきな ひとが います。",
      "コンビニの おにぎりは だいたい 100えん〜200えんです。"
    ]
  },
  "main_vocab": [
    {"word": "ごはん", "meaning": "cooked rice"},
    {"word": "のり", "meaning": "seaweed"},
    {"word": "つくります", "meaning": "to make"},
    {"word": "なか", "meaning": "inside"},
    {"word": "にんき", "meaning": "popular"},
    {"word": "おべんとう", "meaning": "lunch box"}
  ],
  "quiz1": {
    "question": "What is a popular filling for onigiri?",
    "options": ["Chocolate", "Umeboshi (pickled plum)", "Cheese"],
    "correct": 1
  },
  "review": {
    "place": "おにぎり まるや",
    "location": "とうきょう えきの なか",
    "stars": 5,
    "content": "できたての おにぎりは とても おいしいです。さけの おにぎりが いちばん すきです。やすくて はやいです。"
  },
  "review_vocab": [
    {"word": "できたて", "meaning": "freshly made"},
    {"word": "いちばん", "meaning": "the most / number one"},
    {"word": "すき", "meaning": "like / favorite"},
    {"word": "やすい", "meaning": "cheap"},
    {"word": "はやい", "meaning": "fast"}
  ],
  "quiz2": {
    "question": "How much does a convenience store onigiri typically cost?",
    "options": ["500-1000 yen", "100-200 yen", "50-80 yen"],
    "correct": 1
  },
  "tips": {
    "title": "How to Eat a Convenience Store Onigiri",
    "content": "Convenience store onigiri have a special wrapper that keeps the nori crispy. Pull the tab at the top (marked 1), then pull the sides apart (2 and 3). The nori wraps around the rice perfectly. It takes a little practice, but once you get it, it''s easy!"
  },
  "conversation": {
    "scene": "コンビニで おにぎりを かいます",
    "lines": [
      {"speaker": "A", "text": "すみません、おにぎりは どこですか。"},
      {"speaker": "B", "text": "あちらの たなに あります。"},
      {"speaker": "A", "text": "ツナマヨは ありますか。"},
      {"speaker": "B", "text": "はい、ありますよ。こちらです。"},
      {"speaker": "A", "text": "じゃあ、これを ひとつ ください。"},
      {"speaker": "B", "text": "120えんです。ふくろは いりますか。"}
    ]
  },
  "conversation_vocab": [
    {"word": "どこ", "meaning": "where"},
    {"word": "あちら", "meaning": "over there (polite)"},
    {"word": "たな", "meaning": "shelf"},
    {"word": "ください", "meaning": "please give me"},
    {"word": "ふくろ", "meaning": "bag"}
  ],
  "quiz3": {
    "question": "What does the clerk ask at the end of the conversation?",
    "options": ["Do you want chopsticks?", "Is that all?", "Do you need a bag?"],
    "correct": 2
  },
  "try_it_hint": "Try writing about your favorite rice dish! Use です and ます forms.",
  "meta": {"day": 1, "en": "Onigiri", "ja": "おにぎり", "emoji": "🍙"}
}');

-- Day 2: ラーメン 🍜
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_01', 2, 'Ramen', 'ラーメン', '🍜', '{
  "main": {
    "title": "ラーメンを たべよう",
    "intro": "ラーメンは にほんで とても にんきの たべものです。",
    "body": "ラーメンには いろいろな あじが あります。しょうゆ、みそ、しお、とんこつが ゆうめいです。めんは ほそめんと ふとめんが あります。トッピングは たまご、チャーシュー、ねぎ、のりなどです。ラーメンは あつい うちに たべましょう。",
    "details": [
      "ふくおかの とんこつラーメンは せかいで ゆうめいです。",
      "ラーメンやさんでは 「いらっしゃいませ！」と いいます。",
      "めんの かたさは 「かため」「ふつう」「やわらかめ」から えらべます。"
    ]
  },
  "main_vocab": [
    {"word": "あじ", "meaning": "flavor / taste"},
    {"word": "ゆうめい", "meaning": "famous"},
    {"word": "めん", "meaning": "noodles"},
    {"word": "たまご", "meaning": "egg"},
    {"word": "あつい", "meaning": "hot"},
    {"word": "えらべます", "meaning": "can choose"}
  ],
  "quiz1": {
    "question": "Which is NOT a common ramen flavor?",
    "options": ["Miso", "Curry", "Tonkotsu (pork bone)"],
    "correct": 1
  },
  "review": {
    "place": "いっぷうどう",
    "location": "しんじゅく えきの ちかく",
    "stars": 4,
    "content": "とんこつラーメンが おいしかったです。たまごの トッピングも よかったです。おみせは すこし せまいですが、きれいです。"
  },
  "review_vocab": [
    {"word": "おいしかった", "meaning": "was delicious"},
    {"word": "よかった", "meaning": "was good"},
    {"word": "おみせ", "meaning": "shop / restaurant"},
    {"word": "せまい", "meaning": "narrow / small (space)"},
    {"word": "きれい", "meaning": "clean / beautiful"}
  ],
  "quiz2": {
    "question": "In a ramen shop, what does ''kaedama'' (かえだま) mean?",
    "options": ["Extra toppings", "Extra noodles refill", "Extra soup"],
    "correct": 1
  },
  "tips": {
    "title": "Ramen Shop Etiquette",
    "content": "In Japan, slurping noodles is not rude - it actually shows you''re enjoying the food! Many ramen shops use a ticket machine (食券機/しょっけんき) at the entrance. Put your money in, press the button for your order, and give the ticket to the staff. It''s normal to eat quickly and leave - ramen shops are fast-paced!"
  },
  "conversation": {
    "scene": "ラーメンやさんで ちゅうもんします",
    "lines": [
      {"speaker": "A", "text": "すみません、おすすめは なんですか。"},
      {"speaker": "B", "text": "みそラーメンが にんきですよ。"},
      {"speaker": "A", "text": "じゃあ、みそラーメンを おねがいします。"},
      {"speaker": "B", "text": "めんの かたさは どう しますか。"},
      {"speaker": "A", "text": "ふつうで おねがいします。"},
      {"speaker": "B", "text": "はい、すこし おまち ください。"}
    ]
  },
  "conversation_vocab": [
    {"word": "おすすめ", "meaning": "recommendation"},
    {"word": "おねがいします", "meaning": "please (polite request)"},
    {"word": "かたさ", "meaning": "firmness / hardness"},
    {"word": "ふつう", "meaning": "normal / regular"},
    {"word": "おまちください", "meaning": "please wait"}
  ],
  "quiz3": {
    "question": "What did the customer order?",
    "options": ["Tonkotsu ramen", "Miso ramen", "Shoyu ramen"],
    "correct": 1
  },
  "try_it_hint": "Describe your favorite noodle dish. What flavor is it? What toppings does it have?",
  "meta": {"day": 2, "en": "Ramen", "ja": "ラーメン", "emoji": "🍜"}
}');

-- Day 3: お寿司 🍣
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_01', 3, 'Sushi', 'おすし', '🍣', '{
  "main": {
    "title": "おすしを たべよう",
    "intro": "おすしは にほんの でんとうてきな たべものです。",
    "body": "おすしは すめし（すを まぜた ごはん）と さかなで つくります。にぎりずし、まきずし、ちらしずしなどが あります。かいてんずしは やすくて たのしいです。おすしには しょうゆと わさびを つけます。がりも いっしょに たべます。",
    "details": [
      "かいてんずしでは おさらの いろで ねだんが きまります。",
      "まぐろ、サーモン、えびが にんきの ネタです。",
      "おすしやさんでは 「へい、らっしゃい！」と いいます。"
    ]
  },
  "main_vocab": [
    {"word": "でんとうてき", "meaning": "traditional"},
    {"word": "さかな", "meaning": "fish"},
    {"word": "しょうゆ", "meaning": "soy sauce"},
    {"word": "わさび", "meaning": "wasabi"},
    {"word": "ねだん", "meaning": "price"},
    {"word": "おさら", "meaning": "plate"}
  ],
  "quiz1": {
    "question": "What determines the price at a conveyor belt sushi restaurant?",
    "options": ["The size of the sushi", "The color of the plate", "The type of fish"],
    "correct": 1
  },
  "review": {
    "place": "すしろー",
    "location": "おおさか しないの おみせ",
    "stars": 4,
    "content": "かいてんずしで たのしかったです。サーモンが とても おいしかったです。いちさら 100えんからで やすいです。"
  },
  "review_vocab": [
    {"word": "たのしかった", "meaning": "was fun"},
    {"word": "いちさら", "meaning": "one plate"},
    {"word": "しない", "meaning": "in the city"},
    {"word": "〜から", "meaning": "from ~ (starting at)"},
    {"word": "サーモン", "meaning": "salmon"}
  ],
  "quiz2": {
    "question": "What is ''gari'' (がり) at a sushi restaurant?",
    "options": ["Pickled ginger", "Soy sauce", "Green tea"],
    "correct": 0
  },
  "tips": {
    "title": "Sushi Eating Tips",
    "content": "You can eat sushi with your hands or with chopsticks - both are correct! When dipping in soy sauce, dip the fish side down, not the rice side (the rice will absorb too much soy sauce and fall apart). At conveyor belt sushi, you can also order directly from a tablet. Don''t forget to try the free green tea (あがり/agari)!"
  },
  "conversation": {
    "scene": "かいてんずしの おみせで たべます",
    "lines": [
      {"speaker": "A", "text": "なにが おいしいですか。"},
      {"speaker": "B", "text": "サーモンが おすすめですよ。"},
      {"speaker": "A", "text": "わさびは ちょっと にがてです…。"},
      {"speaker": "B", "text": "だいじょうぶ、さびぬきも ありますよ。"},
      {"speaker": "A", "text": "よかった！じゃあ、サーモンを たべます。"},
      {"speaker": "B", "text": "おちゃも のみましょう。むりょうですよ。"}
    ]
  },
  "conversation_vocab": [
    {"word": "にがて", "meaning": "not good at / don''t like"},
    {"word": "さびぬき", "meaning": "without wasabi"},
    {"word": "だいじょうぶ", "meaning": "it''s okay / no problem"},
    {"word": "おちゃ", "meaning": "tea"},
    {"word": "むりょう", "meaning": "free (no charge)"}
  ],
  "quiz3": {
    "question": "What does ''sabinuki'' (さびぬき) mean?",
    "options": ["Extra wasabi", "Without wasabi", "With ginger"],
    "correct": 1
  },
  "try_it_hint": "Write about a time you ate sushi, or describe what sushi toppings you want to try!",
  "meta": {"day": 3, "en": "Sushi", "ja": "おすし", "emoji": "🍣"}
}');

-- Day 4: たこ焼き 🐙
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_01', 4, 'Takoyaki', 'たこやき', '🐙', '{
  "main": {
    "title": "たこやきを たべよう",
    "intro": "たこやきは おおさかの ゆうめいな たべものです。",
    "body": "たこやきは まるい かたちの たべものです。なかに たこ（=octopus）が はいっています。こむぎこの きじで つくります。うえに ソース、マヨネーズ、かつおぶし、あおのりを かけます。あつあつの たこやきは とても おいしいです。",
    "details": [
      "おおさかの ひとは いえに たこやき きを もっています。",
      "たこやきは 1たこやき 8こ いりが おおいです。",
      "どうとんぼりに ゆうめいな たこやき やさんが あります。"
    ]
  },
  "main_vocab": [
    {"word": "まるい", "meaning": "round"},
    {"word": "かたち", "meaning": "shape"},
    {"word": "たこ", "meaning": "octopus"},
    {"word": "こむぎこ", "meaning": "wheat flour"},
    {"word": "かつおぶし", "meaning": "bonito flakes"},
    {"word": "あつあつ", "meaning": "piping hot"}
  ],
  "quiz1": {
    "question": "Which city is takoyaki most famous in?",
    "options": ["Tokyo", "Osaka", "Kyoto"],
    "correct": 1
  },
  "review": {
    "place": "わなか",
    "location": "おおさか どうとんぼり",
    "stars": 5,
    "content": "たこが おおきくて おいしいです！そとは カリカリ、なかは トロトロです。まちじかんは 10ぷんくらいです。"
  },
  "review_vocab": [
    {"word": "おおきい", "meaning": "big"},
    {"word": "カリカリ", "meaning": "crispy"},
    {"word": "トロトロ", "meaning": "soft and gooey"},
    {"word": "まちじかん", "meaning": "waiting time"},
    {"word": "〜くらい", "meaning": "about / approximately"}
  ],
  "quiz2": {
    "question": "What are the typical toppings on takoyaki?",
    "options": ["Ketchup and mustard", "Sauce, mayo, bonito flakes, aonori", "Soy sauce and wasabi"],
    "correct": 1
  },
  "tips": {
    "title": "Be Careful - Takoyaki Is HOT!",
    "content": "Freshly made takoyaki is extremely hot inside, even if the outside feels okay. Japanese people often warn ''中は熱いよ'' (naka wa atsui yo - the inside is hot). Take small bites or cut it in half first. In Osaka, you can find takoyaki stands everywhere, especially in Dotonbori. A serving of 8 pieces usually costs around 500-600 yen."
  },
  "conversation": {
    "scene": "たこやきの おみせで かいます",
    "lines": [
      {"speaker": "A", "text": "たこやきを ください。"},
      {"speaker": "B", "text": "8こ いりと 12こ いり、どちらに しますか。"},
      {"speaker": "A", "text": "8こ いりを おねがいします。"},
      {"speaker": "B", "text": "ソースと しおと ポンず、どれが いいですか。"},
      {"speaker": "A", "text": "ソースで おねがいします。マヨネーズも。"},
      {"speaker": "B", "text": "はい、500えんです。あつい ですから きを つけて くださいね。"}
    ]
  },
  "conversation_vocab": [
    {"word": "どちら", "meaning": "which one (of two, polite)"},
    {"word": "どれ", "meaning": "which one (of three+)"},
    {"word": "しお", "meaning": "salt"},
    {"word": "きをつけて", "meaning": "be careful"},
    {"word": "〜から", "meaning": "because ~"}
  ],
  "quiz3": {
    "question": "How much did the 8-piece takoyaki cost?",
    "options": ["300 yen", "500 yen", "800 yen"],
    "correct": 1
  },
  "try_it_hint": "Write about a street food you love! Where can you buy it? How much does it cost?",
  "meta": {"day": 4, "en": "Takoyaki", "ja": "たこやき", "emoji": "🐙"}
}');

-- Day 5: カレーライス 🍛
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_01', 5, 'Curry Rice', 'カレーライス', '🍛', '{
  "main": {
    "title": "カレーライスを たべよう",
    "intro": "カレーライスは にほんの こくみんしょく（=national dish）です。",
    "body": "にほんの カレーは とろみが あって あまくちです。にく、にんじん、じゃがいも、たまねぎを いれます。からさは あまくち、ちゅうから、からくちから えらべます。がっこうの きゅうしょくでも カレーは にんきです。",
    "details": [
      "にほんの カレーは イギリスから つたわりました。",
      "CoCo いちばんやは にほんで いちばん おおきい カレーの チェーンてんです。",
      "カレーの るーは スーパーで かえます。かんたんに つくれます。"
    ]
  },
  "main_vocab": [
    {"word": "にく", "meaning": "meat"},
    {"word": "にんじん", "meaning": "carrot"},
    {"word": "じゃがいも", "meaning": "potato"},
    {"word": "たまねぎ", "meaning": "onion"},
    {"word": "からさ", "meaning": "spiciness level"},
    {"word": "きゅうしょく", "meaning": "school lunch"}
  ],
  "quiz1": {
    "question": "What is a characteristic of Japanese curry compared to Indian curry?",
    "options": ["It is very spicy", "It is thick and mild", "It has no meat"],
    "correct": 1
  },
  "review": {
    "place": "CoCo いちばんや",
    "location": "にほん ぜんこくの おみせ",
    "stars": 4,
    "content": "トッピングが たくさん あって たのしいです。からさも えらべます。チーズと カツの トッピングが おすすめです。"
  },
  "review_vocab": [
    {"word": "たくさん", "meaning": "many / a lot"},
    {"word": "たのしい", "meaning": "fun / enjoyable"},
    {"word": "えらべる", "meaning": "can choose"},
    {"word": "ぜんこく", "meaning": "nationwide"},
    {"word": "カツ", "meaning": "cutlet (deep fried)"}
  ],
  "quiz2": {
    "question": "What does ''amakuchi'' (あまくち) mean for curry?",
    "options": ["Very spicy", "Medium spicy", "Mild (sweet)"],
    "correct": 2
  },
  "tips": {
    "title": "Making Curry at Home - Japanese Style",
    "content": "Japanese curry is one of the easiest dishes to make at home! Buy a box of curry roux (カレーのルー) at any Japanese supermarket. Cut vegetables and meat, boil them, then add the roux cubes. The most popular brands are ''Vermont Curry'' (バーモントカレー) and ''Java Curry'' (ジャワカレー). Many Japanese people add a secret ingredient like chocolate, coffee, or apple for extra depth!"
  },
  "conversation": {
    "scene": "カレーやさんで ちゅうもんします",
    "lines": [
      {"speaker": "A", "text": "チキンカレーを おねがいします。"},
      {"speaker": "B", "text": "からさは どう しますか。"},
      {"speaker": "A", "text": "ちゅうからで おねがいします。"},
      {"speaker": "B", "text": "ごはんの りょうは ふつうで いいですか。"},
      {"speaker": "A", "text": "すこし おおめで おねがいします。"},
      {"speaker": "B", "text": "はい、かしこまりました。トッピングは いかがですか。"}
    ]
  },
  "conversation_vocab": [
    {"word": "ちゅうから", "meaning": "medium spicy"},
    {"word": "ごはんのりょう", "meaning": "rice amount"},
    {"word": "おおめ", "meaning": "a larger portion"},
    {"word": "かしこまりました", "meaning": "certainly (very polite)"},
    {"word": "いかが", "meaning": "how about (polite)"}
  ],
  "quiz3": {
    "question": "What spiciness level did the customer choose?",
    "options": ["Mild", "Medium", "Hot"],
    "correct": 1
  },
  "try_it_hint": "Write about how to cook your favorite dish. Use simple steps: まず (first), つぎに (next), さいごに (finally).",
  "meta": {"day": 5, "en": "Curry Rice", "ja": "カレーライス", "emoji": "🍛"}
}');

-- =============================================================================
-- Workbook 2: 旅行 (Travel) - JLPT N4
-- =============================================================================

INSERT INTO workbooks (id, user_id, language, topic, topic_label, level, level_label, destination, dest_label, profile_json, theme_color, title, subtitle, is_public, status, days_completed, completed_at)
VALUES (
  'sample_ja_02',
  '48094704-91da-41ab-b57e-99fdab996cfa',
  'japanese',
  'travel', '旅行',
  'jlpt_n4', 'JLPT N4（初級）',
  'live_japan', '日本で生活',
  '{}',
  'green',
  '30日間旅行日本語',
  'JLPT N4（初級） → 日本で生活',
  true,
  'completed',
  5,
  NOW()
);

-- Day 1: 駅 🚉
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_02', 1, 'Train Station', '駅', '🚉', '{
  "main": {
    "title": "日本の駅（えき）を使（つか）おう",
    "intro": "日本の電車（でんしゃ）は時間（じかん）に正確（せいかく）で有名（ゆうめい）です。",
    "body": "日本の駅はとても便利（べんり）です。切符（きっぷ）は券売機（けんばいき）で買（か）えますが、ICカード（SuicaやPASMO）を使（つか）った方（ほう）が簡単（かんたん）です。ホームには番号（ばんごう）があるので、案内板（あんないばん）を見（み）て確認（かくにん）してください。電車の中（なか）では静（しず）かにするのがマナーです。",
    "details": [
      "Suicaは駅の券売機でチャージすることができます。",
      "ラッシュアワーは朝7時から9時ごろまでです。とても混（こ）みます。",
      "乗（の）りかえの時は、色（いろ）のついた線（せん）を追（お）っていくと便利です。"
    ]
  },
  "main_vocab": [
    {"word": "電車（でんしゃ）", "meaning": "train"},
    {"word": "切符（きっぷ）", "meaning": "ticket"},
    {"word": "券売機（けんばいき）", "meaning": "ticket machine"},
    {"word": "便利（べんり）", "meaning": "convenient"},
    {"word": "案内板（あんないばん）", "meaning": "information board"},
    {"word": "乗りかえ", "meaning": "transfer (trains)"}
  ],
  "quiz1": {
    "question": "What is the easiest way to pay for trains in Japan?",
    "options": ["Buying paper tickets each time", "Using an IC card like Suica", "Paying cash on the train"],
    "correct": 1
  },
  "review": {
    "place": "新宿駅（しんじゅくえき）",
    "location": "東京都（とうきょうと）新宿区（しんじゅくく）",
    "stars": 3,
    "content": "世界（せかい）で一番（いちばん）利用者（りようしゃ）が多（おお）い駅です。最初（さいしょ）は迷（まよ）いましたが、案内が多いので慣（な）れれば大丈夫（だいじょうぶ）です。駅ナカのお店も充実（じゅうじつ）しています。"
  },
  "review_vocab": [
    {"word": "世界（せかい）", "meaning": "world"},
    {"word": "利用者（りようしゃ）", "meaning": "users / passengers"},
    {"word": "迷（まよ）う", "meaning": "to get lost"},
    {"word": "慣（な）れる", "meaning": "to get used to"},
    {"word": "充実（じゅうじつ）", "meaning": "well-equipped / fulfilling"}
  ],
  "quiz2": {
    "question": "When is rush hour in Japan?",
    "options": ["6:00 - 7:00 AM", "7:00 - 9:00 AM", "5:00 - 7:00 PM"],
    "correct": 1
  },
  "tips": {
    "title": "Navigating Japanese Train Stations",
    "content": "Download the app ''Navitime'' or ''Google Maps'' for real-time train info. Trains in Japan are almost never late - if you''re 1 minute late, you''ve missed it! When transferring, follow the colored lines on the floor or ceiling. IC cards can also be used at convenience stores and vending machines. One more tip: always stand on one side of the escalator (left in Tokyo, right in Osaka) to let people pass."
  },
  "conversation": {
    "scene": "駅で道（みち）を聞（き）きます",
    "lines": [
      {"speaker": "A", "text": "すみません、渋谷（しぶや）に行（い）きたいんですが。"},
      {"speaker": "B", "text": "山手線（やまのてせん）に乗（の）ってください。3番（ばん）ホームです。"},
      {"speaker": "A", "text": "何分（なんぷん）くらいかかりますか。"},
      {"speaker": "B", "text": "だいたい15分くらいですよ。"},
      {"speaker": "A", "text": "ICカードで乗（の）れますか。"},
      {"speaker": "B", "text": "はい、改札（かいさつ）でタッチすれば大丈夫（だいじょうぶ）です。"}
    ]
  },
  "conversation_vocab": [
    {"word": "〜たいんですが", "meaning": "I want to ~ (polite request form)"},
    {"word": "乗（の）って", "meaning": "ride / get on (te-form)"},
    {"word": "かかる", "meaning": "to take (time)"},
    {"word": "改札（かいさつ）", "meaning": "ticket gate"},
    {"word": "タッチする", "meaning": "to tap / touch"}
  ],
  "quiz3": {
    "question": "How long does it take to get to Shibuya?",
    "options": ["About 5 minutes", "About 15 minutes", "About 30 minutes"],
    "correct": 1
  },
  "try_it_hint": "Write about how you get to school or work. What transportation do you use? How long does it take?",
  "meta": {"day": 1, "en": "Train Station", "ja": "駅", "emoji": "🚉"}
}');

-- Day 2: ホテル 🏨
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_02', 2, 'Hotel', 'ホテル', '🏨', '{
  "main": {
    "title": "日本のホテルに泊（と）まろう",
    "intro": "日本にはいろいろな種類（しゅるい）の宿泊施設（しゅくはくしせつ）があります。",
    "body": "ビジネスホテルは安（やす）くてきれいで、一人旅（ひとりたび）に人気（にんき）です。旅館（りょかん）は日本の伝統的（でんとうてき）な宿（やど）で、畳（たたみ）の部屋（へや）と布団（ふとん）で寝（ね）ます。カプセルホテルはとても小（ちい）さいですが、安くて便利です。チェックインの時にパスポートが必要（ひつよう）です。",
    "details": [
      "旅館では夕食（ゆうしょく）と朝食（ちょうしょく）がつくことが多いです。",
      "ビジネスホテルには大浴場（だいよくじょう）があるところもあります。",
      "チェックインは普通（ふつう）15時から、チェックアウトは10時か11時です。"
    ]
  },
  "main_vocab": [
    {"word": "泊（と）まる", "meaning": "to stay (overnight)"},
    {"word": "旅館（りょかん）", "meaning": "traditional Japanese inn"},
    {"word": "畳（たたみ）", "meaning": "tatami mat"},
    {"word": "布団（ふとん）", "meaning": "futon / Japanese bedding"},
    {"word": "必要（ひつよう）", "meaning": "necessary / required"},
    {"word": "予約（よやく）", "meaning": "reservation"}
  ],
  "quiz1": {
    "question": "What do you sleep on in a ryokan?",
    "options": ["A Western bed", "A futon on tatami", "A hammock"],
    "correct": 1
  },
  "review": {
    "place": "箱根（はこね）の旅館「花月（かげつ）」",
    "location": "神奈川県（かながわけん）箱根町（はこねまち）",
    "stars": 5,
    "content": "部屋から富士山（ふじさん）が見（み）えました。温泉（おんせん）も料理（りょうり）も最高（さいこう）でした。スタッフの方（かた）がとても親切（しんせつ）で、英語（えいご）のメニューもありました。"
  },
  "review_vocab": [
    {"word": "見（み）える", "meaning": "can see / is visible"},
    {"word": "最高（さいこう）", "meaning": "the best / amazing"},
    {"word": "親切（しんせつ）", "meaning": "kind / friendly"},
    {"word": "スタッフ", "meaning": "staff"},
    {"word": "方（かた）", "meaning": "person (polite)"}
  ],
  "quiz2": {
    "question": "What is typically included with a ryokan stay?",
    "options": ["Free WiFi only", "Dinner and breakfast", "A guided tour"],
    "correct": 1
  },
  "tips": {
    "title": "Japanese Hotel Customs",
    "content": "In ryokan and many hotels, you''ll find a yukata (浴衣) - a casual robe you can wear inside the building and sometimes to dinner. Take off your shoes at the entrance and use the slippers provided. There are separate toilet slippers in the bathroom - don''t forget to switch! Most hotels provide toothbrushes, razors, and other amenities for free."
  },
  "conversation": {
    "scene": "ホテルでチェックインします",
    "lines": [
      {"speaker": "A", "text": "チェックインをお願（ねが）いします。予約（よやく）した田中（たなか）です。"},
      {"speaker": "B", "text": "田中様（さま）ですね。パスポートを見（み）せていただけますか。"},
      {"speaker": "A", "text": "はい、どうぞ。Wi-Fiはありますか。"},
      {"speaker": "B", "text": "はい、パスワードはお部屋（へや）のカードに書（か）いてあります。"},
      {"speaker": "A", "text": "朝食（ちょうしょく）は何時（なんじ）からですか。"},
      {"speaker": "B", "text": "7時から9時半（はん）までです。1階（かい）のレストランでお召（め）し上（あ）がりください。"}
    ]
  },
  "conversation_vocab": [
    {"word": "〜様（さま）", "meaning": "Mr./Ms. ~ (honorific)"},
    {"word": "見せていただけますか", "meaning": "could you show me (polite)"},
    {"word": "書いてある", "meaning": "is written"},
    {"word": "〜階（かい）", "meaning": "~ floor (counter)"},
    {"word": "お召し上がりください", "meaning": "please eat/drink (honorific)"}
  ],
  "quiz3": {
    "question": "Where is breakfast served?",
    "options": ["In the room", "On the 1st floor restaurant", "On the rooftop"],
    "correct": 1
  },
  "try_it_hint": "Describe your ideal hotel stay in Japan. What type of accommodation would you choose and why?",
  "meta": {"day": 2, "en": "Hotel", "ja": "ホテル", "emoji": "🏨"}
}');

-- Day 3: コンビニ 🏪
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_02', 3, 'Convenience Store', 'コンビニ', '🏪', '{
  "main": {
    "title": "コンビニを活用（かつよう）しよう",
    "intro": "日本のコンビニは世界で一番便利だと言（い）われています。",
    "body": "セブンイレブン、ローソン、ファミリーマートが大手（おおて）3社（しゃ）です。24時間（じかん）営業（えいぎょう）で、食べ物（たべもの）だけでなく、ATM、コピー機（き）、荷物（にもつ）の発送（はっそう）もできます。お弁当（べんとう）やおにぎりの種類（しゅるい）がとても豊富（ほうふ）で、毎週（まいしゅう）新商品（しんしょうひん）が出（で）ます。",
    "details": [
      "コンビニのATMは海外（かいがい）のカードでもお金（かね）が引（ひ）き出（だ）せます。",
      "公共料金（こうきょうりょうきん）の支払（しはら）いもコンビニでできます。",
      "コンビニのコーヒーは100円からで、味（あじ）もいいと評判（ひょうばん）です。"
    ]
  },
  "main_vocab": [
    {"word": "営業（えいぎょう）", "meaning": "business / open (hours)"},
    {"word": "種類（しゅるい）", "meaning": "types / varieties"},
    {"word": "豊富（ほうふ）", "meaning": "abundant / rich variety"},
    {"word": "新商品（しんしょうひん）", "meaning": "new product"},
    {"word": "発送（はっそう）", "meaning": "shipping / sending"},
    {"word": "引き出す（ひきだす）", "meaning": "to withdraw (money)"}
  ],
  "quiz1": {
    "question": "Which of these can you NOT do at a Japanese convenience store?",
    "options": ["Withdraw money from ATM", "Get a haircut", "Send packages"],
    "correct": 1
  },
  "review": {
    "place": "セブンイレブン",
    "location": "日本全国（ぜんこく）どこでも",
    "stars": 5,
    "content": "お弁当の質（しつ）が高（たか）くて驚（おどろ）きました。特（とく）にセブンプレミアムのスイーツは本当（ほんとう）においしいです。レジの対応（たいおう）も早（はや）くて丁寧（ていねい）です。"
  },
  "review_vocab": [
    {"word": "質（しつ）", "meaning": "quality"},
    {"word": "驚（おどろ）く", "meaning": "to be surprised"},
    {"word": "特（とく）に", "meaning": "especially"},
    {"word": "対応（たいおう）", "meaning": "service / handling"},
    {"word": "丁寧（ていねい）", "meaning": "polite / careful"}
  ],
  "quiz2": {
    "question": "How often do convenience stores release new products?",
    "options": ["Every month", "Every week", "Every day"],
    "correct": 1
  },
  "tips": {
    "title": "Convenience Store Life Hacks in Japan",
    "content": "Japanese convenience stores are a lifesaver for travelers. You can print documents and photos from your phone using the multifunction printer. If you''re on a budget, look for items with a discount sticker (値引きシール) in the evening - they''re close to expiration but perfectly fine. The phrase ''温めますか？'' (atatamemasu ka?) means ''Shall I heat it up?'' - say ''はい、お願いします'' (hai, onegai shimasu) for yes!"
  },
  "conversation": {
    "scene": "コンビニで買い物（かいもの）をします",
    "lines": [
      {"speaker": "A", "text": "このお弁当（べんとう）を温（あたた）めてもらえますか。"},
      {"speaker": "B", "text": "はい、少々（しょうしょう）お待（ま）ちください。お箸（はし）はおつけしますか。"},
      {"speaker": "A", "text": "はい、お願（ねが）いします。あと、このコーヒーも。"},
      {"speaker": "B", "text": "ホットとアイス、どちらになさいますか。"},
      {"speaker": "A", "text": "ホットでお願いします。ポイントカードはありません。"},
      {"speaker": "B", "text": "かしこまりました。合計（ごうけい）780円になります。"}
    ]
  },
  "conversation_vocab": [
    {"word": "温（あたた）める", "meaning": "to heat up / warm"},
    {"word": "少々（しょうしょう）", "meaning": "a moment (formal)"},
    {"word": "お箸（はし）", "meaning": "chopsticks (polite)"},
    {"word": "なさいますか", "meaning": "would you like (honorific)"},
    {"word": "合計（ごうけい）", "meaning": "total"}
  ],
  "quiz3": {
    "question": "What did the customer ask the clerk to do with the bento?",
    "options": ["Wrap it up", "Heat it up", "Add extra sauce"],
    "correct": 1
  },
  "try_it_hint": "Write about what you would buy at a Japanese convenience store. Use ～たいです (want to) and ～てもらえますか (could you do ~ for me).",
  "meta": {"day": 3, "en": "Convenience Store", "ja": "コンビニ", "emoji": "🏪"}
}');

-- Day 4: 神社 ⛩️
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_02', 4, 'Shrine', '神社', '⛩️', '{
  "main": {
    "title": "神社（じんじゃ）を参拝（さんぱい）しよう",
    "intro": "神社は日本の伝統的な信仰（しんこう）の場所（ばしょ）です。",
    "body": "神社には鳥居（とりい）があり、神様（かみさま）の世界と人間（にんげん）の世界の境（さかい）になっています。参拝する前（まえ）に、手水舎（てみずや）で手と口を清（きよ）めます。お賽銭（さいせん）を入（い）れて、二礼二拍手一礼（にれいにはくしゅいちれい）でお祈（いの）りをします。おみくじやお守（まも）りも人気です。",
    "details": [
      "お正月（しょうがつ）には初詣（はつもうで）に行く人がとても多いです。",
      "神社では結婚式（けっこんしき）をすることもできます。",
      "有名（ゆうめい）な神社には、伏見稲荷（ふしみいなり）や明治神宮（めいじじんぐう）があります。"
    ]
  },
  "main_vocab": [
    {"word": "鳥居（とりい）", "meaning": "torii gate"},
    {"word": "参拝（さんぱい）", "meaning": "worship / visit (shrine)"},
    {"word": "手水舎（てみずや）", "meaning": "water purification fountain"},
    {"word": "お賽銭（さいせん）", "meaning": "offering money"},
    {"word": "おみくじ", "meaning": "fortune slip"},
    {"word": "お守り（まもり）", "meaning": "charm / amulet"}
  ],
  "quiz1": {
    "question": "What is the correct prayer ritual at a shrine?",
    "options": ["Clap three times and bow", "Two bows, two claps, one bow", "One bow and one clap"],
    "correct": 1
  },
  "review": {
    "place": "伏見稲荷大社（ふしみいなりたいしゃ）",
    "location": "京都府（きょうとふ）京都市（きょうとし）",
    "stars": 5,
    "content": "千本鳥居（せんぼんとりい）は本当にすごかったです。山（やま）の上まで歩（ある）くと2時間くらいかかりますが、景色（けしき）がきれいなので頑張（がんば）って登（のぼ）ることをおすすめします。"
  },
  "review_vocab": [
    {"word": "千本鳥居（せんぼんとりい）", "meaning": "thousand torii gates"},
    {"word": "景色（けしき）", "meaning": "scenery / view"},
    {"word": "頑張（がんば）る", "meaning": "to do one''s best"},
    {"word": "登（のぼ）る", "meaning": "to climb"},
    {"word": "おすすめする", "meaning": "to recommend"}
  ],
  "quiz2": {
    "question": "What is ''hatsumode'' (初詣)?",
    "options": ["A summer festival", "The first shrine visit of the new year", "A wedding ceremony at a shrine"],
    "correct": 1
  },
  "tips": {
    "title": "Shrine vs Temple: What''s the Difference?",
    "content": "Shrines (神社/jinja) are Shinto and have torii gates. Temples (お寺/otera) are Buddhist and have a gate called ''sanmon.'' At shrines you clap your hands when praying; at temples you don''t clap. You can visit both as a tourist regardless of your religion. When buying an omamori (charm), each one has a different purpose: 学業 (gakugyou) for studies, 恋愛 (ren''ai) for love, 健康 (kenkou) for health, and 交通安全 (koutsu anzen) for traffic safety."
  },
  "conversation": {
    "scene": "神社でおみくじを引（ひ）きます",
    "lines": [
      {"speaker": "A", "text": "おみくじを引いてみたいんですが、いくらですか。"},
      {"speaker": "B", "text": "200円です。この箱（はこ）から一つ引いてください。"},
      {"speaker": "A", "text": "あ、「小吉（しょうきち）」でした。これはいい結果（けっか）ですか。"},
      {"speaker": "B", "text": "まあまあですね。大吉（だいきち）が一番いいですよ。"},
      {"speaker": "A", "text": "悪（わる）い結果（けっか）だったら、どうすればいいですか。"},
      {"speaker": "B", "text": "あそこの木（き）に結（むす）んでください。悪い運（うん）を置（お）いていけますよ。"}
    ]
  },
  "conversation_vocab": [
    {"word": "引（ひ）く", "meaning": "to draw / pull"},
    {"word": "結果（けっか）", "meaning": "result"},
    {"word": "大吉（だいきち）", "meaning": "great fortune"},
    {"word": "結（むす）ぶ", "meaning": "to tie"},
    {"word": "運（うん）", "meaning": "luck / fortune"}
  ],
  "quiz3": {
    "question": "What should you do with a bad fortune slip?",
    "options": ["Throw it away", "Tie it to a tree at the shrine", "Keep it in your wallet"],
    "correct": 1
  },
  "try_it_hint": "Write about a traditional or religious place in your country. What do people do there? Use ～ことができます (can do).",
  "meta": {"day": 4, "en": "Shrine", "ja": "神社", "emoji": "⛩️"}
}');

-- Day 5: 温泉 ♨️
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_02', 5, 'Hot Spring', '温泉', '♨️', '{
  "main": {
    "title": "温泉（おんせん）に入（はい）ろう",
    "intro": "日本は火山（かざん）が多いので、全国に温泉があります。",
    "body": "温泉に入る前（まえ）に、体（からだ）を洗（あら）ってからお湯（ゆ）に入ります。タオルはお湯に入れないでください。温泉は裸（はだか）で入るのが基本（きほん）です。露天風呂（ろてんぶろ）では外（そと）の景色を楽（たの）しみながらお湯に入ることができます。温泉の後（あと）は、牛乳（ぎゅうにゅう）を飲（の）むのが定番（ていばん）です。",
    "details": [
      "タトゥーがあると入れない温泉もありますが、最近（さいきん）は変（か）わってきています。",
      "男女（だんじょ）別（べつ）の温泉が一般的（いっぱんてき）ですが、家族風呂（かぞくぶろ）もあります。",
      "有名な温泉地（おんせんち）には、箱根、別府（べっぷ）、草津（くさつ）などがあります。"
    ]
  },
  "main_vocab": [
    {"word": "温泉（おんせん）", "meaning": "hot spring"},
    {"word": "体（からだ）を洗（あら）う", "meaning": "to wash one''s body"},
    {"word": "お湯（ゆ）", "meaning": "hot water"},
    {"word": "裸（はだか）", "meaning": "naked"},
    {"word": "露天風呂（ろてんぶろ）", "meaning": "open-air bath"},
    {"word": "定番（ていばん）", "meaning": "classic / standard"}
  ],
  "quiz1": {
    "question": "What must you do before entering the onsen water?",
    "options": ["Put on a swimsuit", "Wash your body first", "Drink green tea"],
    "correct": 1
  },
  "review": {
    "place": "草津温泉（くさつおんせん）",
    "location": "群馬県（ぐんまけん）草津町（くさつまち）",
    "stars": 5,
    "content": "日本で一番有名な温泉の一つです。湯畑（ゆばたけ）の景色がとてもきれいでした。お湯は少し熱（あつ）かったですが、慣（な）れたらとても気持（きも）ちよかったです。温泉まんじゅうもおいしかったです。"
  },
  "review_vocab": [
    {"word": "湯畑（ゆばたけ）", "meaning": "hot water field (Kusatsu landmark)"},
    {"word": "熱（あつ）い", "meaning": "hot (temperature)"},
    {"word": "気持（きも）ちいい", "meaning": "feels good / comfortable"},
    {"word": "慣（な）れる", "meaning": "to get used to"},
    {"word": "まんじゅう", "meaning": "steamed bun (sweet)"}
  ],
  "quiz2": {
    "question": "What is a classic thing to drink after an onsen?",
    "options": ["Beer", "Milk", "Coffee"],
    "correct": 1
  },
  "tips": {
    "title": "Onsen Etiquette Guide",
    "content": "The most important rules: 1) Wash thoroughly before entering the bath. 2) Don''t put your towel in the water (put it on your head or on the side). 3) Don''t swim or splash. 4) Don''t use your phone. 5) Be quiet and relaxed. If you''re shy about bathing naked, look for ''kashikiri'' (貸切/private) onsen or hotels with in-room baths. Many onsen towns also have free foot baths (足湯/ashiyu) you can enjoy with clothes on!"
  },
  "conversation": {
    "scene": "旅館（りょかん）で温泉について聞きます",
    "lines": [
      {"speaker": "A", "text": "温泉は何時まで入れますか。"},
      {"speaker": "B", "text": "夜（よる）11時までと、朝（あさ）は6時から9時までです。"},
      {"speaker": "A", "text": "タオルは部屋（へや）のを持（も）っていけばいいですか。"},
      {"speaker": "B", "text": "はい、大きいタオルと小さいタオルをお持ちください。"},
      {"speaker": "A", "text": "露天風呂もありますか。"},
      {"speaker": "B", "text": "はい、ございます。山の景色が見えてとても人気ですよ。"}
    ]
  },
  "conversation_vocab": [
    {"word": "何時（なんじ）まで", "meaning": "until what time"},
    {"word": "持（も）っていく", "meaning": "to bring / take along"},
    {"word": "〜ばいいですか", "meaning": "should I ~ ? / is it okay if I ~ ?"},
    {"word": "お持ちください", "meaning": "please bring (polite)"},
    {"word": "ございます", "meaning": "there is / exists (very polite)"}
  ],
  "quiz3": {
    "question": "What time can guests use the onsen in the morning?",
    "options": ["5:00 - 8:00", "6:00 - 9:00", "7:00 - 10:00"],
    "correct": 1
  },
  "try_it_hint": "Write about a relaxing experience you''ve had. Use ～ながら (while doing ~) and ～ことができます (can do).",
  "meta": {"day": 5, "en": "Hot Spring", "ja": "温泉", "emoji": "♨️"}
}');

-- =============================================================================
-- Workbook 3: 音楽 (Music) - JLPT N3
-- =============================================================================

INSERT INTO workbooks (id, user_id, language, topic, topic_label, level, level_label, destination, dest_label, profile_json, theme_color, title, subtitle, is_public, status, days_completed, completed_at)
VALUES (
  'sample_ja_03',
  '48094704-91da-41ab-b57e-99fdab996cfa',
  'japanese',
  'music', '音楽',
  'jlpt_n3', 'JLPT N3（中級）',
  'anime_nosub', 'アニメを字幕なしで見る',
  '{}',
  'purple',
  '30日間音楽日本語',
  'JLPT N3（中級） → アニメを字幕なしで見る',
  true,
  'completed',
  5,
  NOW()
);

-- Day 1: J-POP 🎤
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_03', 1, 'J-POP', 'J-POP', '🎤', '{
  "main": {
    "title": "J-POPの世界を知ろう",
    "intro": "J-POPは日本のポピュラー音楽の総称で、世界中にファンがいます。",
    "body": "J-POPは1990年代に確立されたジャンルで、ロック、ポップ、R&B、エレクトロニカなど様々な要素を取り入れています。代表的なアーティストには、米津玄師、YOASOBI、Adoなどがおり、それぞれ独自の音楽スタイルを持っています。最近ではストリーミングサービスの普及により、海外でもJ-POPを気軽に聴けるようになりました。歌詞には日本語特有の表現が多く、語学学習の教材としても優れています。",
    "details": [
      "YOASOBIの「夜に駆ける」は海外で1億回以上再生されました。",
      "J-POPの歌詞には、日常会話では使わない詩的な表現がよく使われます。",
      "オリコンチャートは日本の音楽ランキングで、毎週更新されます。"
    ]
  },
  "main_vocab": [
    {"word": "総称（そうしょう）", "meaning": "general term / collective name"},
    {"word": "確立（かくりつ）する", "meaning": "to establish"},
    {"word": "取り入れる（とりいれる）", "meaning": "to incorporate / adopt"},
    {"word": "独自（どくじ）", "meaning": "unique / original"},
    {"word": "普及（ふきゅう）", "meaning": "spread / popularization"},
    {"word": "歌詞（かし）", "meaning": "lyrics"}
  ],
  "quiz1": {
    "question": "When was J-POP established as a genre?",
    "options": ["1970s", "1990s", "2000s"],
    "correct": 1
  },
  "review": {
    "place": "YOASOBI ライブ＠東京ドーム",
    "location": "東京都文京区",
    "stars": 5,
    "content": "初めてJ-POPのライブに行きましたが、演出が素晴らしかったです。観客の一体感もすごくて、日本語がわからなくても楽しめました。ただ、チケットを取るのがとても大変でした。ファンクラブに入っていないと抽選にすら参加できないことが多いです。"
  },
  "review_vocab": [
    {"word": "演出（えんしゅつ）", "meaning": "production / staging"},
    {"word": "素晴らしい（すばらしい）", "meaning": "wonderful / magnificent"},
    {"word": "一体感（いったいかん）", "meaning": "sense of unity"},
    {"word": "大変（たいへん）", "meaning": "difficult / tough"},
    {"word": "抽選（ちゅうせん）", "meaning": "lottery / raffle"}
  ],
  "quiz2": {
    "question": "What is the Oricon Chart?",
    "options": ["A music streaming service", "Japan''s music ranking chart", "A record label"],
    "correct": 1
  },
  "tips": {
    "title": "Learning Japanese Through J-POP",
    "content": "J-POP lyrics are a fantastic way to learn natural Japanese expressions. Start with slower ballads where you can catch the words more easily. Websites like ''Uta-Net'' (歌ネット) provide free lyrics. Try listening while reading the lyrics, then look up words you don''t know. Many songs use casual speech forms (like dropping particles or using contracted forms), which helps you understand real spoken Japanese. Just be careful - some poetic expressions aren''t used in daily conversation!"
  },
  "conversation": {
    "scene": "友達とJ-POPについて話しています",
    "lines": [
      {"speaker": "A", "text": "最近、何かおすすめのJ-POPある？"},
      {"speaker": "B", "text": "Adoの新曲がめちゃくちゃいいよ。聴いた？"},
      {"speaker": "A", "text": "まだ聴いてない。どんな感じの曲？"},
      {"speaker": "B", "text": "パワフルな歌声で、歌詞もけっこう深いんだよね。"},
      {"speaker": "A", "text": "へえ、歌詞の意味も理解できる？結構難しくない？"},
      {"speaker": "B", "text": "最初は難しかったけど、何回も聴いてるうちにだんだんわかるようになったよ。"}
    ]
  },
  "conversation_vocab": [
    {"word": "めちゃくちゃ", "meaning": "extremely / incredibly (casual)"},
    {"word": "感じ（かんじ）", "meaning": "feeling / vibe"},
    {"word": "歌声（うたごえ）", "meaning": "singing voice"},
    {"word": "深い（ふかい）", "meaning": "deep / profound"},
    {"word": "〜うちに", "meaning": "while ~ / in the process of ~"}
  ],
  "quiz3": {
    "question": "How did speaker B come to understand the lyrics?",
    "options": ["By reading translations", "By listening many times", "By taking a class"],
    "correct": 1
  },
  "try_it_hint": "Write about your favorite musician or song. Why do you like them? Use ～ようになった (came to be able to) and ～ている (ongoing state).",
  "meta": {"day": 1, "en": "J-POP", "ja": "J-POP", "emoji": "🎤"}
}');

-- Day 2: カラオケ 🎵
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_03', 2, 'Karaoke', 'カラオケ', '🎵', '{
  "main": {
    "title": "カラオケ文化を楽しもう",
    "intro": "カラオケは日本が発祥の地であり、今では世界中で楽しまれています。",
    "body": "日本のカラオケは個室制で、仲間だけのプライベートな空間で歌えるのが特徴です。料金はフリータイムが一般的で、ドリンクバー付きのプランが人気です。DAMやJOYSOUNDといった機種があり、採点機能を使って盛り上がることもできます。最近では一人カラオケ（ヒトカラ）も流行しており、専門の店舗もあります。飲み会の二次会でカラオケに行くのは日本の定番です。",
    "details": [
      "日本のカラオケボックスには食事メニューも充実していて、パスタやピザも注文できます。",
      "「十八番（おはこ）」とは、その人が得意な持ち歌のことです。",
      "深夜料金は通常の1.5倍から2倍になることが多いので注意してください。"
    ]
  },
  "main_vocab": [
    {"word": "発祥（はっしょう）の地（ち）", "meaning": "place of origin / birthplace"},
    {"word": "個室（こしつ）", "meaning": "private room"},
    {"word": "採点（さいてん）", "meaning": "scoring"},
    {"word": "盛り上がる（もりあがる）", "meaning": "to get excited / liven up"},
    {"word": "流行（りゅうこう）する", "meaning": "to become popular / trendy"},
    {"word": "二次会（にじかい）", "meaning": "after-party"}
  ],
  "quiz1": {
    "question": "What does ''hitokara'' (ヒトカラ) mean?",
    "options": ["Group karaoke", "Solo karaoke", "Outdoor karaoke"],
    "correct": 1
  },
  "review": {
    "place": "まねきねこ 渋谷店",
    "location": "東京都渋谷区",
    "stars": 4,
    "content": "フリータイムが安くて学生に人気の店です。部屋はそこまで広くないですが、音響設備はしっかりしています。持ち込み自由なのが最大の魅力で、コンビニで飲み物やお菓子を買ってから行く人が多いです。採点機能で友達と競い合うのが楽しいです。"
  },
  "review_vocab": [
    {"word": "音響設備（おんきょうせつび）", "meaning": "audio equipment"},
    {"word": "持ち込み（もちこみ）", "meaning": "bringing in (your own items)"},
    {"word": "魅力（みりょく）", "meaning": "appeal / charm"},
    {"word": "競い合う（きそいあう）", "meaning": "to compete with each other"},
    {"word": "しっかりしている", "meaning": "solid / well-made"}
  ],
  "quiz2": {
    "question": "What does ''ohako'' (十八番) refer to?",
    "options": ["The newest song", "Your go-to karaoke song", "The most difficult song"],
    "correct": 1
  },
  "tips": {
    "title": "Karaoke Tips for Japanese Learners",
    "content": "Karaoke is one of the best ways to practice Japanese pronunciation and reading speed. The lyrics appear on screen with timing guides, which helps with reading. Start with slower songs and work your way up. Popular beginner-friendly songs include ''Lemon'' by Kenshi Yonezu and ''Pretender'' by Official HIGE DANdism. Don''t worry about being perfect - in Japan, karaoke is about having fun, not being a great singer! Use the remote to search by song title, artist, or even by entering lyrics you remember."
  },
  "conversation": {
    "scene": "友達とカラオケの計画を立てています",
    "lines": [
      {"speaker": "A", "text": "今週の金曜日、カラオケ行かない？"},
      {"speaker": "B", "text": "いいね！何時からにする？"},
      {"speaker": "A", "text": "仕事終わってからだから、8時くらいかな。"},
      {"speaker": "B", "text": "フリータイムにする？それとも2時間パック？"},
      {"speaker": "A", "text": "フリータイムの方がお得だし、そっちにしよう。"},
      {"speaker": "B", "text": "了解。じゃあ、渋谷のまねきねこに集合ね。予約しておくよ。"}
    ]
  },
  "conversation_vocab": [
    {"word": "〜ない？", "meaning": "won''t you ~ ? / shall we ~ ? (casual invitation)"},
    {"word": "〜かな", "meaning": "I think ~ / maybe ~ (casual)"},
    {"word": "お得（とく）", "meaning": "good deal / good value"},
    {"word": "了解（りょうかい）", "meaning": "understood / roger that"},
    {"word": "集合（しゅうごう）", "meaning": "meeting up / gathering"}
  ],
  "quiz3": {
    "question": "Why did they choose the free-time plan?",
    "options": ["It was the only option", "It was better value", "Their friend recommended it"],
    "correct": 1
  },
  "try_it_hint": "Write about the last time you went to karaoke or a fun outing with friends. Use casual speech and ～ことにした (decided to).",
  "meta": {"day": 2, "en": "Karaoke", "ja": "カラオケ", "emoji": "🎵"}
}');

-- Day 3: 和楽器 🎸
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_03', 3, 'Traditional Instruments', '和楽器', '🎸', '{
  "main": {
    "title": "和楽器の魅力を探ろう",
    "intro": "和楽器とは日本の伝統的な楽器のことで、独特の音色が特徴です。",
    "body": "代表的な和楽器には、三味線、琴（箏）、尺八、太鼓などがあります。三味線はロックのようなかっこいい演奏もでき、吉田兄弟が有名です。琴は優雅な音色で、お正月によく流れる「春の海」という曲が有名です。最近では和楽器バンドのように、伝統楽器とロックを融合させたグループも人気を集めており、若い世代にも和楽器の魅力が伝わるようになってきました。",
    "details": [
      "三味線には太棹、中棹、細棹の3種類があり、ジャンルによって使い分けます。",
      "尺八は竹で作られた縦笛で、禅の修行にも使われていました。",
      "太鼓の演奏は全身を使うため、体力的にもかなりハードです。"
    ]
  },
  "main_vocab": [
    {"word": "和楽器（わがっき）", "meaning": "traditional Japanese instruments"},
    {"word": "音色（ねいろ）", "meaning": "tone / timbre"},
    {"word": "演奏（えんそう）", "meaning": "performance / playing music"},
    {"word": "融合（ゆうごう）", "meaning": "fusion / blend"},
    {"word": "世代（せだい）", "meaning": "generation"},
    {"word": "魅力（みりょく）", "meaning": "charm / appeal"}
  ],
  "quiz1": {
    "question": "Which group is famous for modern shamisen performance?",
    "options": ["YOASOBI", "Yoshida Brothers (吉田兄弟)", "Wagakki Band"],
    "correct": 1
  },
  "review": {
    "place": "和楽器バンド ライブ＠日本武道館",
    "location": "東京都千代田区",
    "stars": 5,
    "content": "伝統楽器とロックの融合が想像以上にかっこよかったです。特に詩吟とギターの掛け合いは鳥肌が立ちました。MCでは和楽器の解説もしてくれて、楽器に詳しくない人でも楽しめる構成になっていました。海外からのファンも多く、会場の国際色が豊かでした。"
  },
  "review_vocab": [
    {"word": "想像以上（そうぞういじょう）", "meaning": "beyond imagination"},
    {"word": "掛け合い（かけあい）", "meaning": "back-and-forth exchange"},
    {"word": "鳥肌が立つ（とりはだがたつ）", "meaning": "to get goosebumps"},
    {"word": "解説（かいせつ）", "meaning": "explanation / commentary"},
    {"word": "国際色（こくさいしょく）", "meaning": "international flavor"}
  ],
  "quiz2": {
    "question": "What is the shakuhachi (尺八) made of?",
    "options": ["Wood", "Bamboo", "Metal"],
    "correct": 1
  },
  "tips": {
    "title": "Where to Experience Traditional Japanese Music",
    "content": "You can experience live wagakki performances at various places in Japan. In Tokyo, the National Theatre (国立劇場) regularly hosts traditional music concerts. In Kyoto, some teahouses offer koto and shamisen performances with tea. Many festivals (matsuri) feature taiko drumming - the Nebuta Festival in Aomori is especially famous for this. If you want to try playing yourself, there are tourist-friendly workshops in Asakusa and Kyoto where you can take a one-hour lesson on shamisen or koto."
  },
  "conversation": {
    "scene": "和楽器の体験教室に申し込みます",
    "lines": [
      {"speaker": "A", "text": "三味線の体験レッスンを受けてみたいんですが。"},
      {"speaker": "B", "text": "初めてですか？初心者向けのクラスがありますよ。"},
      {"speaker": "A", "text": "楽器の経験がまったくないんですが、大丈夫でしょうか。"},
      {"speaker": "B", "text": "もちろんです。基本的な持ち方から教えますので、ご安心ください。"},
      {"speaker": "A", "text": "1回のレッスンでどのくらい弾けるようになりますか。"},
      {"speaker": "B", "text": "簡単な曲なら1曲弾けるようになる方がほとんどですよ。"}
    ]
  },
  "conversation_vocab": [
    {"word": "体験（たいけん）", "meaning": "experience / trial"},
    {"word": "初心者（しょしんしゃ）", "meaning": "beginner"},
    {"word": "経験（けいけん）", "meaning": "experience"},
    {"word": "ご安心ください", "meaning": "please don''t worry (polite)"},
    {"word": "〜方（かた）", "meaning": "person who ~ (polite counter)"}
  ],
  "quiz3": {
    "question": "What can most beginners achieve in one shamisen lesson?",
    "options": ["Master advanced techniques", "Play one simple song", "Build their own shamisen"],
    "correct": 1
  },
  "try_it_hint": "Write about a musical instrument you play or want to learn. Use ～てみたい (want to try) and ～ようになる (come to be able to).",
  "meta": {"day": 3, "en": "Traditional Instruments", "ja": "和楽器", "emoji": "🎸"}
}');

-- Day 4: アニソン 🎶
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_03', 4, 'Anime Songs', 'アニソン', '🎶', '{
  "main": {
    "title": "アニソンの世界に飛び込もう",
    "intro": "アニソンとはアニメソングの略で、日本のポップカルチャーを代表する音楽ジャンルです。",
    "body": "アニソンにはオープニング（OP）、エンディング（ED）、挿入歌、キャラクターソングなどの種類があります。「残酷な天使のテーゼ」（エヴァンゲリオン）や「紅蓮華」（鬼滅の刃）のように、アニメの枠を超えて国民的なヒット曲になることもあります。アニソン歌手にはLiSA、Aimer、TRUEなどがおり、声優が歌うキャラソンも独自の人気を持っています。アニソンは歌詞が作品のテーマと深く結びついているため、アニメを理解するとより歌詞の意味が深く感じられます。",
    "details": [
      "Animelo Summer Live（アニサマ）は日本最大のアニソンフェスで、3日間で9万人が来場します。",
      "声優アーティストは声優業と歌手活動を両立させており、ライブでは声優としてのMCも人気です。",
      "アニソンのカラオケランキングでは「残酷な天使のテーゼ」が何年も1位を維持しています。"
    ]
  },
  "main_vocab": [
    {"word": "略（りゃく）", "meaning": "abbreviation"},
    {"word": "挿入歌（そうにゅうか）", "meaning": "insert song"},
    {"word": "枠（わく）を超える", "meaning": "to go beyond the boundaries"},
    {"word": "結びつく（むすびつく）", "meaning": "to be connected / linked"},
    {"word": "両立（りょうりつ）させる", "meaning": "to balance / manage both"},
    {"word": "維持（いじ）する", "meaning": "to maintain"}
  ],
  "quiz1": {
    "question": "What is ''Zankoku na Tenshi no Thesis'' the theme song for?",
    "options": ["Demon Slayer", "Evangelion", "Attack on Titan"],
    "correct": 1
  },
  "review": {
    "place": "Animelo Summer Live 2025",
    "location": "さいたまスーパーアリーナ",
    "stars": 5,
    "content": "人生で最高のライブ体験でした。30組以上のアーティストが出演して、朝から晩まで8時間以上歌い続けるのは圧巻でした。知らない曲でもコールやペンライトの振り方を周りの人が教えてくれて、ファンのコミュニティの温かさを感じました。来年も絶対に参加したいです。"
  },
  "review_vocab": [
    {"word": "圧巻（あっかん）", "meaning": "overwhelming / spectacular"},
    {"word": "コール", "meaning": "call (audience chanting)"},
    {"word": "ペンライト", "meaning": "light stick / glow stick"},
    {"word": "振り方（ふりかた）", "meaning": "way of waving"},
    {"word": "絶対（ぜったい）", "meaning": "absolutely / definitely"}
  ],
  "quiz2": {
    "question": "How long does the Animelo Summer Live typically last per day?",
    "options": ["About 3 hours", "About 5 hours", "Over 8 hours"],
    "correct": 2
  },
  "tips": {
    "title": "Using Anime Songs to Learn Japanese",
    "content": "Anime songs are perfect for language learning because they often repeat key phrases and use emotional vocabulary. Here''s a study method: 1) Watch the anime scene with subtitles first. 2) Listen to the song while reading the Japanese lyrics. 3) Look up unknown words and grammar patterns. 4) Try to sing along. Opening themes are usually 1.5 minutes (TV size) but the full version is 4-5 minutes with more vocabulary. Many anime fans say they learned their first Japanese words from anime songs!"
  },
  "conversation": {
    "scene": "アニメ好きの友達と音楽の話をしています",
    "lines": [
      {"speaker": "A", "text": "今期のアニメで、OPが一番いいのって何だと思う？"},
      {"speaker": "B", "text": "個人的には呪術廻戦のOPかな。映像との合い方が完璧だと思う。"},
      {"speaker": "A", "text": "わかる！サビの部分で戦闘シーンが入るところ、めっちゃ鳥肌立つよね。"},
      {"speaker": "B", "text": "あのアーティスト、前のクールでも別のアニメのED歌ってたよね。"},
      {"speaker": "A", "text": "そうそう。最近アニソンのタイアップが増えて、一般のアーティストも参入してきてるよね。"},
      {"speaker": "B", "text": "それでアニソンの質がどんどん上がってる気がする。いい時代になったよ。"}
    ]
  },
  "conversation_vocab": [
    {"word": "今期（こんき）", "meaning": "this season (anime)"},
    {"word": "個人的（こじんてき）には", "meaning": "personally"},
    {"word": "サビ", "meaning": "chorus (of a song)"},
    {"word": "タイアップ", "meaning": "tie-up / commercial collaboration"},
    {"word": "参入（さんにゅう）する", "meaning": "to enter (a market/field)"}
  ],
  "quiz3": {
    "question": "According to the conversation, what is raising the quality of anime songs?",
    "options": ["Better animation technology", "More mainstream artists doing anime tie-ups", "Longer anime seasons"],
    "correct": 1
  },
  "try_it_hint": "Write about your favorite anime opening or ending song. What makes it special? Use ～と思う (I think) and ～気がする (I feel like).",
  "meta": {"day": 4, "en": "Anime Songs", "ja": "アニソン", "emoji": "🎶"}
}');

-- Day 5: 音楽フェス 🎪
INSERT INTO workbook_days (workbook_id, day_number, item_en, item_ja, item_emoji, content_json)
VALUES ('sample_ja_03', 5, 'Music Festival', '音楽フェス', '🎪', '{
  "main": {
    "title": "日本の音楽フェスを体験しよう",
    "intro": "日本には個性豊かな音楽フェスティバルが数多く開催されています。",
    "body": "フジロックフェスティバル、サマーソニック、ロック・イン・ジャパンは日本の三大夏フェスと呼ばれています。フジロックは新潟県の苗場スキー場で行われ、大自然の中で音楽を楽しめるのが魅力です。サマソニは東京と大阪で同時開催され、海外アーティストの出演が多いのが特徴です。フェスでは音楽だけでなく、フードエリアやワークショップなども充実しており、一日中飽きることがありません。日本のフェスはマナーの良さでも知られ、ゴミの少なさに驚く海外アーティストも多いそうです。",
    "details": [
      "フジロックは1997年から続く日本最大級の野外フェスで、3日間の通し券は約5万円です。",
      "フェス飯（めし）と呼ばれるフードコートの食事は、フェスの楽しみの一つです。",
      "雨対策として長靴とレインコートは必須アイテムとされています。"
    ]
  },
  "main_vocab": [
    {"word": "個性豊か（こせいゆたか）", "meaning": "rich in character / unique"},
    {"word": "開催（かいさい）する", "meaning": "to hold / organize (event)"},
    {"word": "同時（どうじ）", "meaning": "simultaneous"},
    {"word": "飽きる（あきる）", "meaning": "to get bored / tired of"},
    {"word": "マナー", "meaning": "manners / etiquette"},
    {"word": "必須（ひっす）", "meaning": "essential / must-have"}
  ],
  "quiz1": {
    "question": "Where is the Fuji Rock Festival held?",
    "options": ["At the foot of Mt. Fuji", "At Naeba Ski Resort in Niigata", "In downtown Tokyo"],
    "correct": 1
  },
  "review": {
    "place": "サマーソニック 2025",
    "location": "千葉県千葉市（幕張メッセ・ZOZOマリン）",
    "stars": 4,
    "content": "海外アーティストと日本のアーティストが同じステージに立つのを見られるのが最高でした。ただ、8月の幕張は本当に暑くて、熱中症対策は必須です。屋内ステージもあるので、うまく使い分ければ体力を温存できます。フェス飯のレベルが年々上がっていて、音楽以外の楽しみも増えています。"
  },
  "review_vocab": [
    {"word": "ステージに立つ", "meaning": "to stand on stage / perform"},
    {"word": "熱中症（ねっちゅうしょう）", "meaning": "heatstroke"},
    {"word": "使い分ける（つかいわける）", "meaning": "to use properly / alternate"},
    {"word": "温存（おんぞん）する", "meaning": "to conserve / save"},
    {"word": "年々（ねんねん）", "meaning": "year by year"}
  ],
  "quiz2": {
    "question": "What are international artists often surprised by at Japanese festivals?",
    "options": ["The loud audiences", "How little trash there is", "The small venues"],
    "correct": 1
  },
  "tips": {
    "title": "Surviving a Japanese Music Festival",
    "content": "Japanese music festivals are well-organized but physically demanding. Here are essential tips: Bring rain gear (especially for Fuji Rock - it rains almost every year), wear comfortable shoes, and carry a refillable water bottle. Many festivals have cashless payment systems now, so charge your IC card in advance. The Japanese concept of ''場所取り'' (bashotori - saving a spot) applies at festivals too - arrive early for popular acts. And remember the golden rule: take your trash with you. There are usually few trash cans, and fans carry their own garbage bags."
  },
  "conversation": {
    "scene": "フェスの準備について友達と相談しています",
    "lines": [
      {"speaker": "A", "text": "来月のフジロック、持ち物リスト作った方がいいかな。"},
      {"speaker": "B", "text": "絶対作った方がいいよ。去年、テントのポールを忘れて大変だったから。"},
      {"speaker": "A", "text": "それは辛いね…。天気予報はチェックした？"},
      {"speaker": "B", "text": "見たけど、山の天気は変わりやすいから、晴れでも雨具は持っていった方がいいよ。"},
      {"speaker": "A", "text": "了解。タイムテーブル見た？見たいアーティストが被ってるんだけど。"},
      {"speaker": "B", "text": "あるあるだよね。優先順位を決めて、途中で移動するしかないと思う。"}
    ]
  },
  "conversation_vocab": [
    {"word": "持ち物（もちもの）リスト", "meaning": "packing list"},
    {"word": "辛い（つらい）", "meaning": "tough / painful"},
    {"word": "変わりやすい（かわりやすい）", "meaning": "changeable / unpredictable"},
    {"word": "被る（かぶる）", "meaning": "to overlap / conflict"},
    {"word": "優先順位（ゆうせんじゅんい）", "meaning": "priority order"}
  ],
  "quiz3": {
    "question": "What advice does speaker B give about weather preparation?",
    "options": ["Only bring rain gear if forecast says rain", "Bring rain gear even if it''s sunny", "Don''t worry about the weather"],
    "correct": 1
  },
  "try_it_hint": "Write about a concert or event you attended. How was it? Use ～た方がいい (should / had better) and ～しかない (have no choice but to).",
  "meta": {"day": 5, "en": "Music Festival", "ja": "音楽フェス", "emoji": "🎪"}
}');
