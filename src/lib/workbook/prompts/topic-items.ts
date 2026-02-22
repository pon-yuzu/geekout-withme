import type { GenerationConfig, TopicItem } from '../types';
import { getTopicConfig } from '../slots';

export function buildTopicItemsPrompt(config: GenerationConfig): string {
  const topicConfig = getTopicConfig(config.topic);
  const itemDescription = topicConfig?.itemPrompt ?? `${config.topicLabel}に関連するアイテム30個`;
  const isJapanese = config.language === 'japanese';

  const expertRole = isJapanese ? '日本語教材の専門家' : '英語教材の専門家';
  const langLabel = isJapanese ? '日本語学習' : '英語学習';

  return `あなたは${expertRole}です。以下のテーマで30日間の${langLabel}ワークブック用のアイテムリストを作成してください。

# テーマ
${config.topicLabel}

# 求めるアイテム
${itemDescription}

# 出力形式
以下のJSON配列形式で、30個のアイテムを出力してください。
各アイテムは英語名、日本語名、絵文字を含めてください。
バリエーション豊かに、初心者から上級者まで楽しめる順番で並べてください。

\`\`\`json
[
  {"day": 1, "en": "English Name", "ja": "日本語名", "emoji": "🎯"},
  {"day": 2, "en": "...", "ja": "...", "emoji": "..."},
  ...
]
\`\`\`

JSONのみを出力してください。`;
}

export function parseTopicItemsResponse(text: string): TopicItem[] {
  let jsonStr = text;
  if (text.includes('```json')) {
    jsonStr = text.split('```json')[1].split('```')[0];
  } else if (text.includes('```')) {
    jsonStr = text.split('```')[1].split('```')[0];
  }
  return JSON.parse(jsonStr.trim()) as TopicItem[];
}
