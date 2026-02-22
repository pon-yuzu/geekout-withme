// === Topic (Method/Theme) Mappings ===
export interface TopicConfig {
  id: string;
  label: string;
  labelJa: string;
  contentType: string;
  contentTypeJa: string;
  sectionLabels: {
    main: string;
    mainSubtitle: string;
    mainBodyLabel: string;
    mainDetailsLabel: string;
    review: string;
    reviewSubtitle: string;
    tips: string;
    tipsEmoji: string;
    conversation: string;
  };
  itemPrompt: string;
}

export const TOPICS: Record<string, TopicConfig> = {
  cooking: {
    id: 'cooking',
    label: 'Cooking',
    labelJa: '料理',
    contentType: 'recipe',
    contentTypeJa: 'レシピ',
    sectionLabels: {
      main: 'Recipe',
      mainSubtitle: 'のレシピを読んでみよう',
      mainBodyLabel: 'Ingredients',
      mainDetailsLabel: 'Steps',
      review: 'Restaurant Review',
      reviewSubtitle: 'のレストランレビュー',
      tips: 'Tips',
      tipsEmoji: '🦘',
      conversation: 'Conversation',
    },
    itemPrompt: '日本料理のレシピ30品（例：餃子、唐揚げ、ラーメンなど、日本人が海外で作りたい定番料理）',
  },
  gardening: {
    id: 'gardening',
    label: 'Gardening',
    labelJa: 'ガーデニング',
    contentType: 'plant',
    contentTypeJa: '植物の育て方',
    sectionLabels: {
      main: 'Plant Care Guide',
      mainSubtitle: 'の育て方を読んでみよう',
      mainBodyLabel: 'Overview',
      mainDetailsLabel: 'Key Points',
      review: 'Garden Center Review',
      reviewSubtitle: 'のガーデンセンターレビュー',
      tips: 'Tips',
      tipsEmoji: '🌿',
      conversation: 'Conversation',
    },
    itemPrompt: '育てやすい植物・ハーブ・花30種（例：バジル、ローズマリー、トマト、ひまわりなど）',
  },
  music: {
    id: 'music',
    label: 'Music',
    labelJa: '音楽',
    contentType: 'song',
    contentTypeJa: '曲の紹介',
    sectionLabels: {
      main: 'Song Introduction',
      mainSubtitle: 'の曲紹介を読んでみよう',
      mainBodyLabel: 'Details',
      mainDetailsLabel: 'Key Points',
      review: 'Live Music Review',
      reviewSubtitle: 'のライブレビュー',
      tips: 'Tips',
      tipsEmoji: '🎵',
      conversation: 'Conversation',
    },
    itemPrompt: '有名な英語の曲30曲（初心者でも歌詞が分かりやすく、英語学習に適した曲）',
  },
  travel: {
    id: 'travel',
    label: 'Travel',
    labelJa: '旅行',
    contentType: 'destination',
    contentTypeJa: '旅行先の紹介',
    sectionLabels: {
      main: 'Destination Guide',
      mainSubtitle: 'の旅行ガイドを読んでみよう',
      mainBodyLabel: 'Overview',
      mainDetailsLabel: 'Highlights',
      review: 'Hotel/Hostel Review',
      reviewSubtitle: 'の宿泊レビュー',
      tips: 'Tips',
      tipsEmoji: '✈️',
      conversation: 'Conversation',
    },
    itemPrompt: '人気の旅行先・観光スポット30箇所（世界各地の定番観光地）',
  },
  fitness: {
    id: 'fitness',
    label: 'Fitness',
    labelJa: 'フィットネス',
    contentType: 'workout',
    contentTypeJa: 'エクササイズ',
    sectionLabels: {
      main: 'Workout Guide',
      mainSubtitle: 'のエクササイズを読んでみよう',
      mainBodyLabel: 'Overview',
      mainDetailsLabel: 'Steps',
      review: 'Gym/Studio Review',
      reviewSubtitle: 'のジムレビュー',
      tips: 'Tips',
      tipsEmoji: '💪',
      conversation: 'Conversation',
    },
    itemPrompt: '人気のエクササイズ・ワークアウト30種（ヨガ、ランニング、筋トレなど）',
  },
};

// === Level (Current Position) Mappings ===
export interface LevelConfig {
  id: string;
  label: string;
  labelJa: string;
  cefr: string;
  vocabSize: string;
  grammarConstraints: string;
  promptRules: string;
}

export const LEVELS: Record<string, LevelConfig> = {
  eiken5: {
    id: 'eiken5',
    label: 'Eiken Grade 5',
    labelJa: '英検5級（中1程度）',
    cefr: 'A1',
    vocabSize: '600語',
    grammarConstraints: '現在形・過去形・現在進行形',
    promptRules: `1. 英文は全て英検5級レベル（中学1年生が読める程度）
2. 使う単語は基本的な日常語彙（600語レベル）
3. 文は短く、シンプルに（1文10語以内が理想）
4. 過去形、現在形、現在進行形を適切に使い分ける
5. 複雑な構文（関係代名詞、仮定法等）は使わない`,
  },
  eiken4: {
    id: 'eiken4',
    label: 'Eiken Grade 4',
    labelJa: '英検4級（中2程度）',
    cefr: 'A1-A2',
    vocabSize: '1200語',
    grammarConstraints: '現在完了形・比較級・不定詞・動名詞まで',
    promptRules: `1. 英文は英検4級レベル（中学2年生が読める程度）
2. 使う単語は日常語彙（1200語レベル）
3. 文はやや長くてもOK（1文15語以内が理想）
4. 現在完了形、比較級、不定詞、動名詞を使ってよい
5. 仮定法や分詞構文は避ける`,
  },
  eiken3: {
    id: 'eiken3',
    label: 'Eiken Grade 3',
    labelJa: '英検3級（中3程度）',
    cefr: 'A2',
    vocabSize: '2100語',
    grammarConstraints: '受動態・関係代名詞・現在完了進行形まで',
    promptRules: `1. 英文は英検3級レベル（中学3年生が読める程度）
2. 使う単語は中級日常語彙（2100語レベル）
3. 受動態、関係代名詞、現在完了進行形を使ってよい
4. 仮定法は避ける
5. 自然な英語表現を心がける`,
  },
  toeic400: {
    id: 'toeic400',
    label: 'TOEIC 400',
    labelJa: 'TOEIC 400点レベル',
    cefr: 'A2-B1',
    vocabSize: '3000語',
    grammarConstraints: '基本的な文法は全て使用可、複雑な構文は控えめに',
    promptRules: `1. TOEIC 400点レベルの英語
2. 使う単語は3000語レベル
3. 基本文法は自由に使用可
4. イディオムは一般的なもののみ
5. ビジネス表現も少し含めてよい`,
  },
  toeic600: {
    id: 'toeic600',
    label: 'TOEIC 600',
    labelJa: 'TOEIC 600点レベル',
    cefr: 'B1',
    vocabSize: '5000語',
    grammarConstraints: '全文法使用可、自然な英語を心がける',
    promptRules: `1. TOEIC 600点レベルの英語
2. 使う単語は5000語レベル
3. 全文法を自然に使用してよい
4. イディオム・慣用句も使ってよい
5. より自然で流暢な英語表現を心がける`,
  },
};

// === JLPT Level Mappings (Japanese) ===
export const JLPT_LEVELS: Record<string, LevelConfig> = {
  jlpt_n5: {
    id: 'jlpt_n5',
    label: 'JLPT N5',
    labelJa: 'JLPT N5（入門）',
    cefr: 'A1',
    vocabSize: '800語',
    grammarConstraints: 'です・ます形、基本助詞',
    promptRules: `1. JLPT N5レベルの日本語（基礎レベル）
2. 語彙は800語以内、漢字100字以内（全てふりがな付き）
3. 文は短くシンプル（1文15文字以内）
4. です・ます形のみ`,
  },
  jlpt_n4: {
    id: 'jlpt_n4',
    label: 'JLPT N4',
    labelJa: 'JLPT N4（初級）',
    cefr: 'A2',
    vocabSize: '1500語',
    grammarConstraints: 'て形、ない形、辞書形、可能形',
    promptRules: `1. JLPT N4レベルの日本語（初級レベル）
2. 語彙は1500語以内、漢字300字以内（N5以上にはふりがな付き）
3. 文はやや長くてもOK（1文25文字以内）
4. て形・ない形・辞書形・可能形を使ってよい
5. 敬語や複雑な受身・使役は避ける`,
  },
  jlpt_n3: {
    id: 'jlpt_n3',
    label: 'JLPT N3',
    labelJa: 'JLPT N3（中級）',
    cefr: 'B1',
    vocabSize: '3750語',
    grammarConstraints: '受身形、使役形、条件形、敬語の基本',
    promptRules: `1. JLPT N3レベルの日本語（中級レベル）
2. 語彙は3750語以内、漢字600字以内
3. 受身形、使役形、条件形を使ってよい
4. 基本的な敬語を使ってよい
5. 自然な日本語表現を心がける`,
  },
  jlpt_n2: {
    id: 'jlpt_n2',
    label: 'JLPT N2',
    labelJa: 'JLPT N2（上級前半）',
    cefr: 'B2',
    vocabSize: '6000語',
    grammarConstraints: '複合動詞、形式名詞、慣用表現',
    promptRules: `1. JLPT N2レベルの日本語（上級前半）
2. 語彙は6000語レベル、漢字1000字以内
3. 複合動詞、形式名詞、慣用表現を使ってよい
4. 新聞・ビジネス日本語も含めてよい
5. より自然で洗練された表現を心がける`,
  },
  jlpt_n1: {
    id: 'jlpt_n1',
    label: 'JLPT N1',
    labelJa: 'JLPT N1（上級）',
    cefr: 'C1',
    vocabSize: '10000語',
    grammarConstraints: '全文法使用可、文語的表現も可',
    promptRules: `1. JLPT N1レベルの日本語（上級）
2. 語彙は10000語レベル、漢字2000字以内
3. 全文法を自然に使用してよい
4. 文語的表現、ビジネス敬語、慣用句も使ってよい
5. ネイティブに近い自然で流暢な日本語表現を心がける`,
  },
};

export function getJlptLevelConfig(id: string): LevelConfig | undefined {
  return JLPT_LEVELS[id];
}

// === Destination (Goal) Mappings ===
export interface DestinationConfig {
  id: string;
  label: string;
  labelJa: string;
  country: string;
  regions: string[];
  supermarkets: string[];
  currency: string;
  cultureTips: string;
  reviewLocationHint: string;
}

export const DESTINATIONS: Record<string, DestinationConfig> = {
  australia_wh: {
    id: 'australia_wh',
    label: 'Working Holiday in Australia',
    labelJa: 'オーストラリア ワーキングホリデー',
    country: 'Australia',
    regions: ['Sydney', 'Melbourne', 'Brisbane', 'Gold Coast', 'Perth', 'Cairns'],
    supermarkets: ['Coles', 'Woolworths', 'Aldi'],
    currency: 'AUD',
    cultureTips: 'シェアハウス文化、カフェ文化、ビーチライフ、BBQ文化',
    reviewLocationHint: 'オーストラリアの都市（ビーチ沿い、カフェ街など）',
  },
  us_study: {
    id: 'us_study',
    label: 'Study Abroad in the US',
    labelJa: 'アメリカ留学',
    country: 'USA',
    regions: ['New York', 'Los Angeles', 'San Francisco', 'Boston', 'Seattle', 'Chicago'],
    supermarkets: ['Walmart', 'Trader Joe\'s', 'Whole Foods', 'Target'],
    currency: 'USD',
    cultureTips: 'キャンパスライフ、ルームメイト文化、チップ文化、フードトラック',
    reviewLocationHint: 'アメリカの都市（キャンパス近く、ダウンタウンなど）',
  },
  canada_move: {
    id: 'canada_move',
    label: 'Moving to Canada',
    labelJa: 'カナダ移住',
    country: 'Canada',
    regions: ['Vancouver', 'Toronto', 'Montreal', 'Calgary', 'Ottawa', 'Victoria'],
    supermarkets: ['Loblaws', 'Metro', 'Sobeys', 'Costco'],
    currency: 'CAD',
    cultureTips: '多文化主義、アウトドア文化、ティム・ホートンズ、メープルシロップ',
    reviewLocationHint: 'カナダの都市（ウォーターフロント、ダウンタウンなど）',
  },
  uk_wh: {
    id: 'uk_wh',
    label: 'Working Holiday in the UK',
    labelJa: 'イギリス ワーキングホリデー',
    country: 'UK',
    regions: ['London', 'Manchester', 'Edinburgh', 'Oxford', 'Cambridge', 'Brighton'],
    supermarkets: ['Tesco', 'Sainsbury\'s', 'Asda', 'Waitrose'],
    currency: 'GBP',
    cultureTips: 'パブ文化、アフタヌーンティー、フットボール、マーケット巡り',
    reviewLocationHint: 'イギリスの都市（テムズ川沿い、歴史的な通りなど）',
  },
  nz_wh: {
    id: 'nz_wh',
    label: 'Working Holiday in New Zealand',
    labelJa: 'ニュージーランド ワーキングホリデー',
    country: 'New Zealand',
    regions: ['Auckland', 'Wellington', 'Queenstown', 'Christchurch', 'Rotorua'],
    supermarkets: ['Countdown', 'New World', 'Pak\'nSave'],
    currency: 'NZD',
    cultureTips: 'マオリ文化、アウトドア・アクティビティ、ファームステイ、ラグビー',
    reviewLocationHint: 'ニュージーランドの都市（山が見える、湖畔など）',
  },
};

export function getTopicConfig(id: string): TopicConfig | undefined {
  if (TOPICS[id]) return TOPICS[id];

  // カスタムテーマ: "custom_xxx" 形式
  if (id.startsWith('custom_')) {
    const name = id.replace('custom_', '');
    return {
      id,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      labelJa: name,
      contentType: 'topic',
      contentTypeJa: 'トピック',
      sectionLabels: {
        main: 'Main Content',
        mainSubtitle: 'について読んでみよう',
        mainBodyLabel: 'Overview',
        mainDetailsLabel: 'Key Points',
        review: 'Review',
        reviewSubtitle: 'のレビュー',
        tips: 'Tips',
        tipsEmoji: '💡',
        conversation: 'Conversation',
      },
      itemPrompt: `${name}に関連するアイテム・トピック30個（バリエーション豊かに）`,
    };
  }

  return undefined;
}

export function getLevelConfig(id: string): LevelConfig | undefined {
  return LEVELS[id];
}

export function getDestinationConfig(id: string): DestinationConfig | undefined {
  return DESTINATIONS[id];
}
