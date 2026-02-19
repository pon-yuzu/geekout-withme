import type { GenerationConfig, TopicItem, UserPreferences } from '../types';
import { getTopicConfig, getLevelConfig, getDestinationConfig } from '../slots';

function buildProfileSection(profile: UserPreferences): string {
  const parts: string[] = [];
  if (profile.gender) parts.push(`- 性別：${profile.gender}`);
  if (profile.interests?.length) parts.push(`- 趣味・興味：${profile.interests.join('、')}`);
  if (profile.favoriteColors?.length) parts.push(`- 好きな色：${profile.favoriteColors.join('、')}`);
  if (profile.personality) parts.push(`- 性格・雰囲気：${profile.personality}`);
  if (profile.additionalInfo) parts.push(`- その他：${profile.additionalInfo}`);
  return parts.length > 0 ? parts.join('\n') : '- 特になし';
}

export function buildContentPrompt(
  config: GenerationConfig,
  item: TopicItem
): string {
  const topicConfig = getTopicConfig(config.topic);
  const levelConfig = getLevelConfig(config.level);

  if (!topicConfig || !levelConfig) {
    throw new Error('Invalid config: missing topic or level config');
  }

  const destConfig = getDestinationConfig(config.destination);
  const goalDescription = config.destLabel;

  const reviewLocationHint = destConfig
    ? `架空の${destConfig.country}のお店・施設名（${destConfig.reviewLocationHint}）`
    : `架空の英語圏のお店・施設名（学習者の目標「${goalDescription}」に関連する場所）`;

  const reviewLocation = destConfig
    ? `${destConfig.regions.join('、')}のいずれかの地名`
    : '英語圏の都市名（目標に関連する場所）';

  const tipsTitle = destConfig
    ? `${destConfig.country}で${item.ja}を楽しむなら`
    : `「${goalDescription}」に向けて${item.ja}で英語を学ぶコツ`;

  const tipsContent = destConfig
    ? `日本語で3-4段落。${destConfig.country}での実用情報。スーパー（${destConfig.supermarkets.join('、')}）での買い物、現地での楽しみ方、${destConfig.cultureTips}に関する情報など`
    : `日本語で3-4段落。「${goalDescription}」という目標に向けた実用的なアドバイス。${topicConfig.labelJa}と英語学習を組み合わせたヒント、日常での練習法など`;

  const conversationScene = destConfig
    ? `${destConfig.country}での日常的なシーン`
    : `「${goalDescription}」に関連した日常的な英語のシーン`;

  const sectionLabels = topicConfig.sectionLabels;

  const bodyHint = topicConfig.id === 'cooking'
    ? 'レシピの材料リスト（英語で）'
    : `${topicConfig.contentType}の概要・説明・背景（英語で）`;

  const detailsHint = topicConfig.id === 'cooking'
    ? '調理ステップ。動詞を太字にする。例：**Cut** the cabbage very small. 最後は **Enjoy!** で終わる'
    : `${topicConfig.contentType}のポイント・特徴のリスト。重要な動詞や単語を太字にする`;

  return `あなたは英語教材を作成する専門家です。${levelConfig.labelJa}の英語で、${topicConfig.labelJa}に関するコンテンツを作成してください。

# 作成するアイテム
${item.en}（${item.ja}）

# 学習者のプロフィール
- 目標：${goalDescription}
${buildProfileSection(config.profile)}

# レベル制約
${levelConfig.promptRules}

# 出力形式
以下のJSON形式で出力してください。

\`\`\`json
{
  "main": {
    "title": "${sectionLabels.main}: ${item.en}",
    "intro": "（${item.en}の1-2文の説明。${levelConfig.labelJa}レベルの英語で）",
    "body": "（${bodyHint}）",
    "details": [
      "（${detailsHint}）",
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
    "place": "（${reviewLocationHint}）",
    "location": "（${reviewLocation}）",
    "stars": 5,
    "content": "（レビュー本文。5-7文程度。過去形を使う。場所の雰囲気、体験の良さを描写する。${levelConfig.labelJa}レベルの英語で）"
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
    "title": "（日本語のタイトル。例：${tipsTitle}）",
    "content": "（${tipsContent}）"
  },
  "conversation": {
    "scene": "（日本語でシーン説明。${conversationScene}）",
    "lines": [
      {"speaker": "A", "text": "（${levelConfig.labelJa}レベルの英語のセリフ）"},
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

# 重要なルール
${levelConfig.promptRules}
6. 会話は自然で、「${goalDescription}」に向けた英語学習中にありそうなシチュエーション
7. vocabリストには必ずその文章で使われている重要単語を含める
8. クイズの正解は "correct" フィールドで0, 1, 2のいずれかで指定（0が最初の選択肢）
9. 30日間でバリエーションを出す（異なる場所、シチュエーションを使う）

JSONのみを出力してください。`;
}
