/**
 * Generate 3 sample workbooks (Day 1-5 only) and insert them as public workbooks.
 * Usage: node scripts/generate-samples.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(resolve(__dirname, '../.env'), 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
  const eq = line.indexOf('=');
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
}

const CLAUDE_API_KEY = env.CLAUDE_API_KEY;
const SUPABASE_URL = env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// ── Claude API helper ──
async function claudeGenerate(prompt, maxTokens = 4096) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content.find(b => b.type === 'text')?.text ?? '';
}

function extractJSON(text) {
  let s = text;
  if (s.includes('```json')) s = s.split('```json')[1].split('```')[0];
  else if (s.includes('```')) s = s.split('```')[1].split('```')[0];
  return JSON.parse(s.trim());
}

// ── Supabase helper ──
async function supabasePost(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Supabase POST ${table}: ${res.status} ${await res.text()}`);
}

async function supabasePatch(table, filter, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Supabase PATCH ${table}: ${res.status} ${await res.text()}`);
}

async function supabaseGet(table, filter) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase GET ${table}: ${res.status}`);
  return res.json();
}

// ── Sample workbook configs ──
const SAMPLES = [
  {
    id: 'sample-travel',
    topic: 'travel',
    topicLabel: '旅行',
    level: 'eiken3',
    levelLabel: '英検3級（中3程度）',
    destination: 'australia_wh',
    destLabel: 'オーストラリア ワーキングホリデー',
    title: '7日間旅行英語',
    subtitle: '英検3級 → オーストラリア ワーキングホリデー',
    themeColor: 'orange',
  },
  {
    id: 'sample-music',
    topic: 'music',
    topicLabel: '音楽',
    level: 'eiken4',
    levelLabel: '英検4級（中2程度）',
    destination: 'us_study',
    destLabel: 'アメリカ留学',
    title: '7日間音楽英語',
    subtitle: '英検4級 → アメリカ留学',
    themeColor: 'orange',
  },
  {
    id: 'sample-fitness',
    topic: 'fitness',
    topicLabel: 'フィットネス',
    level: 'eiken5',
    levelLabel: '英検5級（中1程度）',
    destination: 'canada_move',
    destLabel: 'カナダ移住',
    title: '7日間フィットネス英語',
    subtitle: '英検5級 → カナダ移住',
    themeColor: 'orange',
  },
];

// Topic item prompts (5 items only)
const ITEM_PROMPTS = {
  travel: '人気の旅行先・観光スポット5箇所（オーストラリア中心）',
  music: '有名な英語の曲5曲（初心者でも歌詞が分かりやすく、英語学習に適した曲）',
  fitness: '人気のエクササイズ・ワークアウト5種（ヨガ、ランニング、筋トレなど）',
};

// Level prompt rules
const LEVEL_RULES = {
  eiken5: `1. 英文は全て英検5級レベル（中学1年生が読める程度）
2. 使う単語は基本的な日常語彙（600語レベル）
3. 文は短く、シンプルに（1文10語以内が理想）
4. 過去形、現在形、現在進行形を適切に使い分ける
5. 複雑な構文（関係代名詞、仮定法等）は使わない`,
  eiken4: `1. 英文は英検4級レベル（中学2年生が読める程度）
2. 使う単語は日常語彙（1200語レベル）
3. 文はやや長くてもOK（1文15語以内が理想）
4. 現在完了形、比較級、不定詞、動名詞を使ってよい
5. 仮定法や分詞構文は避ける`,
  eiken3: `1. 英文は英検3級レベル（中学3年生が読める程度）
2. 使う単語は中級日常語彙（2100語レベル）
3. 受動態、関係代名詞、現在完了進行形を使ってよい
4. 仮定法は避ける
5. 自然な英語表現を心がける`,
};

// Section labels per topic
const SECTION_LABELS = {
  travel: { main: 'Destination Guide', bodyLabel: 'Overview', detailsLabel: 'Highlights' },
  music: { main: 'Song Introduction', bodyLabel: 'Details', detailsLabel: 'Key Points' },
  fitness: { main: 'Workout Guide', bodyLabel: 'Overview', detailsLabel: 'Steps' },
};

// Destination configs
const DEST_CONFIGS = {
  australia_wh: {
    country: 'Australia',
    regions: ['Sydney', 'Melbourne', 'Brisbane', 'Gold Coast', 'Perth', 'Cairns'],
    supermarkets: ['Coles', 'Woolworths', 'Aldi'],
    cultureTips: 'シェアハウス文化、カフェ文化、ビーチライフ、BBQ文化',
    reviewLocationHint: 'オーストラリアの都市（ビーチ沿い、カフェ街など）',
  },
  us_study: {
    country: 'USA',
    regions: ['New York', 'Los Angeles', 'San Francisco', 'Boston', 'Seattle', 'Chicago'],
    supermarkets: ['Walmart', "Trader Joe's", 'Whole Foods', 'Target'],
    cultureTips: 'キャンパスライフ、ルームメイト文化、チップ文化、フードトラック',
    reviewLocationHint: 'アメリカの都市（キャンパス近く、ダウンタウンなど）',
  },
  canada_move: {
    country: 'Canada',
    regions: ['Vancouver', 'Toronto', 'Montreal', 'Calgary', 'Ottawa', 'Victoria'],
    supermarkets: ['Loblaws', 'Metro', 'Sobeys', 'Costco'],
    cultureTips: '多文化主義、アウトドア文化、ティム・ホートンズ、メープルシロップ',
    reviewLocationHint: 'カナダの都市（ウォーターフロント、ダウンタウンなど）',
  },
};

function buildContentPrompt(sample, item) {
  const labels = SECTION_LABELS[sample.topic];
  const rules = LEVEL_RULES[sample.level];
  const dest = DEST_CONFIGS[sample.destination];

  return `あなたは英語教材を作成する専門家です。${sample.levelLabel}の英語で、${sample.topicLabel}に関するコンテンツを作成してください。

# 作成するアイテム
${item.en}（${item.ja}）

# 学習者のプロフィール
- 目標：${sample.destLabel}

# レベル制約
${rules}

# 出力形式
以下のJSON形式で出力してください。

\`\`\`json
{
  "main": {
    "title": "${labels.main}: ${item.en}",
    "intro": "（${item.en}の1-2文の説明。${sample.levelLabel}レベルの英語で）",
    "body": "（${labels.bodyLabel}を英語で）",
    "details": [
      "（${labels.detailsLabel}のポイント。重要な動詞や単語を太字にする）",
      "（ポイント2）",
      "（ポイント3）",
      "（ポイント4）",
      "（ポイント5）",
      "（ポイント6）"
    ]
  },
  "main_vocab": [
    {"word": "単語", "meaning": "日本語の意味"},
    ...（8-12個程度）
  ],
  "quiz1": {
    "question": "（メインコンテンツに関する日本語の質問）",
    "options": ["選択肢1", "選択肢2", "選択肢3"],
    "correct": 0
  },
  "review": {
    "place": "（架空の${dest.country}のお店・施設名（${dest.reviewLocationHint}））",
    "location": "（${dest.regions.join('、')}のいずれかの地名）",
    "stars": 5,
    "content": "（レビュー本文。5-7文程度。過去形を使う。${sample.levelLabel}レベルの英語で）"
  },
  "review_vocab": [
    {"word": "単語", "meaning": "日本語の意味"},
    ...（8-12個程度）
  ],
  "quiz2": {
    "question": "（レビューの内容に関する日本語の質問）",
    "options": ["選択肢1", "選択肢2", "選択肢3"],
    "correct": 0
  },
  "tips": {
    "title": "（日本語のタイトル。例：${dest.country}で${item.ja}を楽しむなら）",
    "content": "（日本語で3-4段落。${dest.country}での実用情報。スーパー（${dest.supermarkets.join('、')}）での買い物、現地での楽しみ方、${dest.cultureTips}に関する情報など）"
  },
  "conversation": {
    "scene": "（日本語でシーン説明。${dest.country}での日常的なシーン）",
    "lines": [
      {"speaker": "A", "text": "（${sample.levelLabel}レベルの英語のセリフ）"},
      {"speaker": "B", "text": "（英語のセリフ）"},
      ...（10-14行程度。${item.en}に関連した自然な会話）
    ]
  },
  "conversation_vocab": [
    {"word": "単語", "meaning": "日本語の意味"},
    ...（8-12個程度）
  ],
  "quiz3": {
    "question": "（会話の内容に関する日本語の質問）",
    "options": ["選択肢1", "選択肢2", "選択肢3"],
    "correct": 0
  },
  "try_it_hint": "（日本語で、今日の会話をマネして書ける例文のヒント）"
}
\`\`\`

${rules}
6. 会話は自然で、「${sample.destLabel}」に向けた英語学習中にありそうなシチュエーション
7. vocabリストには必ずその文章で使われている重要単語を含める
8. クイズの正解は "correct" フィールドで0, 1, 2のいずれかで指定
9. 5日間でバリエーションを出す

JSONのみを出力してください。`;
}

// ── Main ──
async function main() {
  console.log('Fetching a user to own sample workbooks...');

  // Use the first premium user we find
  const users = await supabaseGet('subscriptions', 'status=eq.active&limit=1&select=user_id');
  if (!users.length) { console.error('No premium users found'); process.exit(1); }
  const userId = users[0].user_id;
  console.log(`Using user: ${userId}`);

  for (const sample of SAMPLES) {
    console.log(`\n=== ${sample.title} ===`);

    // Check if already exists
    const existing = await supabaseGet('workbooks', `id=eq.${sample.id}&select=id`);
    if (existing.length > 0) {
      console.log(`  Already exists, skipping.`);
      continue;
    }

    // 1. Generate 5 topic items
    console.log('  Generating topic items...');
    const itemsPrompt = `あなたは英語教材の専門家です。以下のテーマで5日間の英語学習ワークブック用のアイテムリストを作成してください。

# テーマ
${sample.topicLabel}

# 求めるアイテム
${ITEM_PROMPTS[sample.topic]}

# 出力形式
\`\`\`json
[
  {"day": 1, "en": "English Name", "ja": "日本語名", "emoji": "🎯"},
  ...
]
\`\`\`

JSONのみを出力してください。`;

    const itemsText = await claudeGenerate(itemsPrompt, 1024);
    const items = extractJSON(itemsText);
    console.log(`  Got ${items.length} items: ${items.map(i => i.en).join(', ')}`);

    // 2. Create workbook record
    console.log('  Creating workbook record...');
    await supabasePost('workbooks', {
      id: sample.id,
      user_id: userId,
      topic: sample.topic,
      topic_label: sample.topicLabel,
      level: sample.level,
      level_label: sample.levelLabel,
      destination: sample.destination,
      dest_label: sample.destLabel,
      profile_json: { ...sample, items, profile: {} },
      theme_color: sample.themeColor,
      title: sample.title,
      subtitle: sample.subtitle,
      status: 'generating',
      is_public: true,
    });

    // 3. Generate day content (sequentially to avoid rate limits)
    for (const item of items) {
      console.log(`  Generating Day ${item.day}: ${item.en}...`);
      const prompt = buildContentPrompt(sample, item);
      const contentText = await claudeGenerate(prompt, 4096);
      const content = extractJSON(contentText);
      content.meta = item;

      await supabasePost('workbook_days', {
        workbook_id: sample.id,
        day_number: item.day,
        item_en: item.en,
        item_ja: item.ja,
        item_emoji: item.emoji,
        content_json: content,
      });
      console.log(`    ✓ Day ${item.day} done`);
    }

    // 4. Mark as completed
    await supabasePatch('workbooks', `id=eq.${sample.id}`, {
      status: 'completed',
      days_completed: 5,
      completed_at: new Date().toISOString(),
    });
    console.log(`  ✓ ${sample.title} complete!`);
  }

  console.log('\n✓ All sample workbooks generated!');
}

main().catch(err => { console.error(err); process.exit(1); });
