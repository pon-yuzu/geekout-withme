# リソースライブラリ実装仕様書

## 参照ドキュメント

この仕様書と合わせて、以下の詳細調査レポートを参照してください：

1. **日本語学習リソース調査**: `Free_Online_Japanese_Learning_Resources__A_Comprehensive_Survey_for_All_JLPT_Levels_in_2025.md`
   - 100+件の完全なリソースリスト
   - 技能×レベル別マトリックス
   - 学習段階別おすすめ組み合わせ

2. **英語学習リソース調査**: `Free_Online_English_Learning_Resources_for_Japanese_Learners_2025.md`
   - 100+件の完全なリソースリスト（日本人向け）
   - CEFR技能×レベル別マトリックス
   - 試験対策（IELTS/TOEIC/英検）セクション

**重要**: 下記のリソースデータは主要なもののみ抜粋しています。上記レポートから追加リソースを抽出してデータに含めてください。

---

## 概要

Geek Out With Me サイトの `/resources` ページを、フィルター機能付きのインタラクティブなリソースライブラリに拡張する。日本語学習リソース（JLPT N5-N1）と英語学習リソース（CEFR A1-C1）の両方を、技能・レベル・カテゴリでフィルタリングできるようにする。

## 技術スタック

- **フレームワーク**: Astro + React
- **スタイリング**: Tailwind CSS
- **既存のデザイン**: Glassmorphism（`bg-white/5`, `border-white/10`）
- **ブランドカラー**: Primary `#0ea5e9`（Sky）, Accent `#d946ef`（Fuchsia）

---

## データ構造

### 型定義 (`/src/data/resources.ts`)

```typescript
export type Skill = 'reading' | 'writing' | 'listening' | 'speaking';
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type Language = 'japanese' | 'english';
export type FreeScope = 'free' | 'freemium';

export interface Resource {
  id: string;
  name: string;
  nameJa?: string;  // 日本語名（あれば）
  url: string;
  language: Language;
  skills: Skill[];
  levels: (JLPTLevel | CEFRLevel)[];
  freeScope: FreeScope;
  description: string;
  category: string;
  recommended?: boolean;  // おすすめリソース
}
```

---

## リソースデータ

### 日本語学習リソース（外国人向け）

```typescript
export const japaneseResources: Resource[] = [
  // ========== GRADED READERS ==========
  {
    id: 'tadoku',
    name: 'Tadoku Free Books',
    nameJa: 'にほんごたどく',
    url: 'https://tadoku.org/japanese/en/free-books-en/',
    language: 'japanese',
    skills: ['reading', 'listening'],
    levels: ['N5', 'N4', 'N3', 'N2'],
    freeScope: 'free',
    description: 'NPO-backed graded readers with furigana, illustrations, and audio.',
    category: 'Graded Readers',
    recommended: true,
  },
  {
    id: 'yomujp',
    name: 'YomuJP',
    nameJa: '読むJP',
    url: 'https://yomujp.com/',
    language: 'japanese',
    skills: ['reading', 'listening'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'Non-fiction graded readings by JLPT level. Includes N6 super-beginner content.',
    category: 'Graded Readers',
    recommended: true,
  },
  {
    id: 'satori-reader',
    name: 'Satori Reader',
    url: 'https://www.satorireader.com/',
    language: 'japanese',
    skills: ['reading', 'listening', 'speaking'],
    levels: ['N4', 'N3', 'N2'],
    freeScope: 'freemium',
    description: 'Original stories with native audio and inline grammar explanations.',
    category: 'Graded Readers',
  },
  {
    id: 'watanoc',
    name: 'Watanoc',
    nameJa: '和タのC',
    url: 'https://watanoc.com/',
    language: 'japanese',
    skills: ['reading', 'listening'],
    levels: ['N5', 'N4', 'N3'],
    freeScope: 'free',
    description: 'Free web magazine on food, culture, daily life with built-in dictionary.',
    category: 'Graded Readers',
  },
  {
    id: 'tenyomi',
    name: 'Tenyomi',
    url: 'https://tenyomi.com/browse/',
    language: 'japanese',
    skills: ['reading', 'listening'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'JLPT-graded reading passages with vocabulary, grammar, and audio.',
    category: 'Graded Readers',
  },
  {
    id: 'bilingual-manga',
    name: 'Bilingual Manga',
    url: 'https://bilingualmanga.org/',
    language: 'japanese',
    skills: ['reading'],
    levels: ['N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'Japanese manga with one-click toggle between Japanese and English.',
    category: 'Graded Readers',
  },
  {
    id: 'learn-natively',
    name: 'Learn Natively',
    url: 'https://learnnatively.com/',
    language: 'japanese',
    skills: ['reading'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'Crowd-sourced difficulty ratings for Japanese books, manga, and media.',
    category: 'Graded Readers',
    recommended: true,
  },
  {
    id: 'hirogaru',
    name: 'Hirogaru',
    nameJa: 'ひろがる',
    url: 'https://hirogaru-nihongo.jp/',
    language: 'japanese',
    skills: ['reading', 'listening'],
    levels: ['N4', 'N3'],
    freeScope: 'free',
    description: 'Japan Foundation cultural content with toggleable subtitles and vocab lists.',
    category: 'Graded Readers',
  },

  // ========== NEWS ==========
  {
    id: 'nhk-easy',
    name: 'NHK NEWS WEB EASY',
    url: 'https://www3.nhk.or.jp/news/easy/',
    language: 'japanese',
    skills: ['reading', 'listening'],
    levels: ['N4', 'N3'],
    freeScope: 'free',
    description: 'Real news in simplified Japanese with furigana and audio. The gold standard.',
    category: 'News',
    recommended: true,
  },
  {
    id: 'todai',
    name: 'Todai Easy Japanese',
    url: 'https://easyjapanese.net/',
    language: 'japanese',
    skills: ['reading', 'listening', 'speaking'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'freemium',
    description: 'News aggregator with JLPT sorting, flashcards, and AI pronunciation scoring.',
    category: 'News',
  },
  {
    id: 'matcha-easy',
    name: 'MATCHA Easy Japanese',
    url: 'https://matcha-jp.com/easy/',
    language: 'japanese',
    skills: ['reading'],
    levels: ['N4', 'N3'],
    freeScope: 'free',
    description: 'Travel and culture articles in easy Japanese with furigana.',
    category: 'News',
  },
  {
    id: 'kahoku-easy',
    name: 'Kahoku Easy News',
    url: 'https://kahoku.news/easyjapanese/',
    language: 'japanese',
    skills: ['reading', 'listening'],
    levels: ['N5', 'N4'],
    freeScope: 'free',
    description: 'Regional news in very easy Japanese with AI read-aloud and worksheets.',
    category: 'News',
  },

  // ========== YOUTUBE ==========
  {
    id: 'comprehensible-japanese',
    name: 'Comprehensible Japanese',
    url: 'https://www.youtube.com/c/ComprehensibleJapanese',
    language: 'japanese',
    skills: ['listening'],
    levels: ['N5', 'N4', 'N3', 'N2'],
    freeScope: 'free',
    description: 'Comprehensible input in pure Japanese with no English. Perfect for immersion.',
    category: 'YouTube',
    recommended: true,
  },
  {
    id: 'nihongo-no-mori',
    name: 'Nihongo no Mori',
    url: 'https://www.youtube.com/c/nihaboradio',
    language: 'japanese',
    skills: ['listening', 'reading'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'JLPT prep videos for all levels with clear Japanese explanations.',
    category: 'YouTube',
  },
  {
    id: 'japanese-ammo-misa',
    name: 'Japanese Ammo with Misa',
    url: 'https://www.youtube.com/c/JapaneseAmmowithMisa',
    language: 'japanese',
    skills: ['listening', 'reading'],
    levels: ['N5', 'N4', 'N3'],
    freeScope: 'free',
    description: 'Grammar explanations in English. Very friendly and clear style.',
    category: 'YouTube',
  },
  {
    id: 'miku-real-japanese',
    name: 'Miku Real Japanese',
    url: 'https://www.youtube.com/c/MikuRealJapanese',
    language: 'japanese',
    skills: ['listening'],
    levels: ['N5', 'N4', 'N3'],
    freeScope: 'free',
    description: 'Natural conversational Japanese for beginners.',
    category: 'YouTube',
  },
  {
    id: 'sambon-juku',
    name: 'Sambon Juku',
    nameJa: '三本塾',
    url: 'https://www.youtube.com/c/Sanbonsenseijapanese',
    language: 'japanese',
    skills: ['listening', 'reading'],
    levels: ['N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'Upper-level grammar in Japanese. Great for N3+ learners.',
    category: 'YouTube',
  },

  // ========== PODCAST ==========
  {
    id: 'nihongo-con-teppei',
    name: 'Nihongo con Teppei',
    url: 'https://nihongoconteppei.com/',
    language: 'japanese',
    skills: ['listening'],
    levels: ['N5', 'N4', 'N3', 'N2'],
    freeScope: 'free',
    description: 'Bite-sized daily Japanese podcast. Perfect for building habits.',
    category: 'Podcast',
    recommended: true,
  },
  {
    id: 'sakura-tips',
    name: 'Sakura Tips',
    url: 'https://sakuratips.com/',
    language: 'japanese',
    skills: ['listening'],
    levels: ['N4', 'N3'],
    freeScope: 'free',
    description: 'Short episodes with free transcripts for intermediates.',
    category: 'Podcast',
  },
  {
    id: 'japanese-with-noriko',
    name: 'Japanese with Noriko',
    url: 'https://www.youtube.com/c/LearnJapanesewithNoriko',
    language: 'japanese',
    skills: ['listening'],
    levels: ['N3', 'N2'],
    freeScope: 'free',
    description: 'Pure Japanese podcast with transcript support.',
    category: 'Podcast',
  },
  {
    id: 'bilingual-news',
    name: 'Bilingual News',
    url: 'https://bilingualnews.jp/',
    language: 'japanese',
    skills: ['listening'],
    levels: ['N2', 'N1'],
    freeScope: 'free',
    description: 'Authentic bilingual current affairs discussion for advanced learners.',
    category: 'Podcast',
  },

  // ========== PRONUNCIATION ==========
  {
    id: 'ojad',
    name: 'OJAD Accent Dictionary',
    url: 'https://www.gavo.t.u-tokyo.ac.jp/ojad/eng/pages/home',
    language: 'japanese',
    skills: ['speaking', 'listening'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'University of Tokyo pitch accent dictionary with 9,000+ words.',
    category: 'Pronunciation',
    recommended: true,
  },
  {
    id: 'forvo-ja',
    name: 'Forvo Japanese',
    url: 'https://forvo.com/languages/ja/',
    language: 'japanese',
    skills: ['speaking', 'listening'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'World\'s largest pronunciation dictionary with 373,000+ Japanese recordings.',
    category: 'Pronunciation',
  },
  {
    id: 'speechling-ja',
    name: 'Speechling',
    url: 'https://speechling.com/',
    language: 'japanese',
    skills: ['speaking', 'listening'],
    levels: ['N5', 'N4', 'N3', 'N2'],
    freeScope: 'freemium',
    description: 'Human coach feedback on your pronunciation. 10 free recordings/month.',
    category: 'Pronunciation',
  },
  {
    id: 'youglish-ja',
    name: 'YouGlish Japanese',
    url: 'https://youglish.com/japanese',
    language: 'japanese',
    skills: ['listening', 'speaking'],
    levels: ['N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'Hear words in real YouTube contexts. Great for natural pronunciation.',
    category: 'Pronunciation',
  },

  // ========== WRITING ==========
  {
    id: 'langcorrect',
    name: 'LangCorrect',
    url: 'https://langcorrect.com/',
    language: 'japanese',
    skills: ['writing'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'Lang-8 successor. Get writing corrections from native speakers.',
    category: 'Writing',
    recommended: true,
  },
  {
    id: 'hinative',
    name: 'HiNative',
    url: 'https://hinative.com/',
    language: 'japanese',
    skills: ['writing', 'speaking', 'reading'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'freemium',
    description: 'Q&A platform for quick corrections and pronunciation checks.',
    category: 'Writing',
  },
  {
    id: 'journaly',
    name: 'Journaly',
    url: 'https://journaly.com/',
    language: 'japanese',
    skills: ['writing'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'Clean journal-based platform for writing practice with peer feedback.',
    category: 'Writing',
  },

  // ========== CONVERSATION ==========
  {
    id: 'hilokal',
    name: 'Hilokal',
    url: 'https://www.hilokal.com/en/speak/Japanese',
    language: 'japanese',
    skills: ['speaking', 'listening'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'Free live audio rooms by level. Listen first, speak when ready.',
    category: 'Conversation',
    recommended: true,
  },
  {
    id: 'hellotalk',
    name: 'HelloTalk',
    url: 'https://www.hellotalk.com/',
    language: 'japanese',
    skills: ['speaking', 'listening', 'writing', 'reading'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'freemium',
    description: 'Language exchange app with 25M+ users and voice rooms.',
    category: 'Conversation',
  },
  {
    id: 'tandem',
    name: 'Tandem',
    url: 'https://www.tandem.net/',
    language: 'japanese',
    skills: ['speaking', 'listening', 'writing'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'freemium',
    description: 'Application-reviewed language exchange for higher quality matches.',
    category: 'Conversation',
  },
  {
    id: 'free4talk',
    name: 'Free4Talk',
    url: 'https://www.free4talk.com/',
    language: 'japanese',
    skills: ['speaking', 'listening'],
    levels: ['N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'Free voice/video chat rooms. No scheduling, 24/7 available.',
    category: 'Conversation',
  },

  // ========== APPS ==========
  {
    id: 'wanikani',
    name: 'WaniKani',
    url: 'https://www.wanikani.com/',
    language: 'japanese',
    skills: ['reading'],
    levels: ['N5', 'N4', 'N3', 'N2'],
    freeScope: 'freemium',
    description: 'SRS kanji/vocab learning with mnemonics. First 3 levels free.',
    category: 'Apps',
  },
  {
    id: 'renshuu',
    name: 'Renshuu',
    url: 'https://www.renshuu.org/',
    language: 'japanese',
    skills: ['reading', 'writing', 'listening'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'Comprehensive free platform: vocab, kanji, grammar, games.',
    category: 'Apps',
    recommended: true,
  },
  {
    id: 'anki',
    name: 'Anki',
    url: 'https://ankiweb.net/',
    language: 'japanese',
    skills: ['reading', 'listening'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'The gold standard SRS flashcard app. Desktop & Android free.',
    category: 'Apps',
    recommended: true,
  },
  {
    id: 'bunpro',
    name: 'Bunpro',
    url: 'https://bunpro.jp/',
    language: 'japanese',
    skills: ['reading', 'writing', 'listening'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'freemium',
    description: 'SRS grammar drilling with reading passages and JLPT practice.',
    category: 'Apps',
  },
  {
    id: 'clozemaster-ja',
    name: 'Clozemaster',
    url: 'https://www.clozemaster.com/',
    language: 'japanese',
    skills: ['reading', 'listening'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'freemium',
    description: 'Gamified fill-in-the-blank sentences with native audio.',
    category: 'Apps',
  },

  // ========== AI TOOLS ==========
  {
    id: 'yomitan',
    name: 'Yomitan',
    url: 'https://yomitan.wiki/',
    language: 'japanese',
    skills: ['reading'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'Browser popup dictionary. Essential for reading anything online.',
    category: 'AI & Tools',
    recommended: true,
  },
  {
    id: 'language-reactor',
    name: 'Language Reactor',
    url: 'https://www.languagereactor.com/',
    language: 'japanese',
    skills: ['reading', 'listening'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'freemium',
    description: 'Dual subtitles on Netflix/YouTube with popup dictionary.',
    category: 'AI & Tools',
    recommended: true,
  },
  {
    id: 'chatgpt-ja',
    name: 'ChatGPT / Claude',
    url: 'https://chat.openai.com/',
    language: 'japanese',
    skills: ['reading', 'writing', 'listening', 'speaking'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'freemium',
    description: 'AI conversation partner for grammar questions, practice, and corrections.',
    category: 'AI & Tools',
  },
  {
    id: 'jpdb',
    name: 'jpdb.io',
    url: 'https://jpdb.io/',
    language: 'japanese',
    skills: ['reading'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'SRS with media vocabulary tracking. Pre-learn vocab before watching.',
    category: 'AI & Tools',
  },

  // ========== COMPREHENSIVE ==========
  {
    id: 'irodori',
    name: 'IRODORI',
    url: 'https://irodori.jpf.go.jp/',
    language: 'japanese',
    skills: ['reading', 'writing', 'listening', 'speaking'],
    levels: ['N5', 'N4'],
    freeScope: 'free',
    description: 'Japan Foundation free course: 1,433 pages, 9+ hrs audio.',
    category: 'Comprehensive',
    recommended: true,
  },
  {
    id: 'marugoto',
    name: 'Marugoto',
    url: 'https://marugoto.jpf.go.jp/',
    language: 'japanese',
    skills: ['reading', 'writing', 'listening', 'speaking'],
    levels: ['N5', 'N4'],
    freeScope: 'free',
    description: 'Official Japan Foundation coursebook online. Completely free.',
    category: 'Comprehensive',
  },
  {
    id: 'minato',
    name: 'Minato JF e-Learning',
    url: 'https://minato-jf.jp/',
    language: 'japanese',
    skills: ['reading', 'writing', 'listening', 'speaking'],
    levels: ['N5', 'N4', 'N3'],
    freeScope: 'free',
    description: 'Japan Foundation umbrella platform with Marugoto, Irodori, and more.',
    category: 'Comprehensive',
  },
  {
    id: 'tae-kim',
    name: 'Tae Kim\'s Guide',
    url: 'https://guidetojapanese.org/',
    language: 'japanese',
    skills: ['reading', 'writing'],
    levels: ['N5', 'N4', 'N3', 'N2'],
    freeScope: 'free',
    description: 'Best free grammar reference from first principles.',
    category: 'Comprehensive',
    recommended: true,
  },
  {
    id: 'imabi',
    name: 'IMABI',
    url: 'https://imabi.org/',
    language: 'japanese',
    skills: ['reading', 'writing'],
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
    freeScope: 'free',
    description: 'Most comprehensive free grammar resource. 400+ lessons.',
    category: 'Comprehensive',
  },
];
```

### 英語学習リソース（日本人向け）

```typescript
export const englishResources: Resource[] = [
  // ========== GRADED READERS ==========
  {
    id: 'free-graded-readers',
    name: 'Free Graded Readers',
    url: 'https://freegradedreaders.com/',
    language: 'english',
    skills: ['reading'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '著作権切れのGraded Readersを無料公開。CEFRでレベル分け。',
    category: 'Graded Readers',
    recommended: true,
  },
  {
    id: 'er-central',
    name: 'ER Central',
    url: 'https://er-central.com/',
    language: 'english',
    skills: ['reading', 'listening'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '短めの読み物・リスニング素材。8,000語レベルまであり、一般書籍への橋渡しに。',
    category: 'Graded Readers',
    recommended: true,
  },
  {
    id: 'esol-courses',
    name: 'ESOL Courses',
    url: 'https://www.esolcourses.com/',
    language: 'english',
    skills: ['reading'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '歴史、科学、文化など幅広いトピックの短い読み物。クイズ付き。',
    category: 'Graded Readers',
  },
  {
    id: 'english-e-reader',
    name: 'English e-Reader',
    url: 'https://english-e-reader.net/',
    language: 'english',
    skills: ['reading'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: 'Oxford、Penguin等の主要出版社Graded Readersを電子書籍で。',
    category: 'Graded Readers',
  },

  // ========== NEWS ==========
  {
    id: 'voa',
    name: 'VOA Learning English',
    url: 'https://learningenglish.voanews.com/',
    language: 'english',
    skills: ['reading', 'listening', 'speaking'],
    levels: ['A2', 'B1', 'B2'],
    freeScope: 'free',
    description: '制限語彙でゆっくり読まれるニュース。英語学習ニュースの金字塔。',
    category: 'News',
    recommended: true,
  },
  {
    id: 'bbc-learning',
    name: 'BBC Learning English',
    url: 'https://www.bbc.co.uk/learningenglish',
    language: 'english',
    skills: ['reading', 'listening', 'speaking', 'writing'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '4技能すべてをカバーする世界最高峰の無料リソース。6 Minute English等。',
    category: 'News',
    recommended: true,
  },
  {
    id: 'breaking-news-english',
    name: 'Breaking News English',
    url: 'https://breakingnewsenglish.com/',
    language: 'english',
    skills: ['reading', 'listening', 'writing', 'speaking'],
    levels: ['A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '同一ニュースを7段階の難易度で提供。1つの記事で全レベル対応。',
    category: 'News',
    recommended: true,
  },
  {
    id: 'news-in-levels',
    name: 'News in Levels',
    url: 'https://www.newsinlevels.com/',
    language: 'english',
    skills: ['reading', 'listening'],
    levels: ['A1', 'A2', 'B1', 'B2'],
    freeScope: 'free',
    description: 'ニュースを3レベルで提供。毎日更新、音声付き。',
    category: 'News',
  },
  {
    id: 'simple-wikipedia',
    name: 'Simple English Wikipedia',
    url: 'https://simple.wikipedia.org/',
    language: 'english',
    skills: ['reading'],
    levels: ['A2', 'B1', 'B2'],
    freeScope: 'free',
    description: 'Basic English（約1,500語）で書かれた百科事典。',
    category: 'News',
  },

  // ========== YOUTUBE ==========
  {
    id: 'bbc-youtube',
    name: 'BBC Learning English (YouTube)',
    url: 'https://www.youtube.com/c/bbclearningenglish',
    language: 'english',
    skills: ['listening', 'reading'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '文法・語彙・発音・ニュース。最も信頼できる公式学習チャンネル。',
    category: 'YouTube',
    recommended: true,
  },
  {
    id: 'english-with-lucy',
    name: 'English with Lucy',
    url: 'https://www.youtube.com/c/EnglishwithLucy',
    language: 'english',
    skills: ['listening', 'speaking'],
    levels: ['A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: 'イギリス英語の文法・語彙・発音。1,100万登録。',
    category: 'YouTube',
  },
  {
    id: 'rachels-english',
    name: 'Rachel\'s English',
    url: 'https://www.youtube.com/c/rachelsenglish',
    language: 'english',
    skills: ['listening', 'speaking'],
    levels: ['A2', 'B1', 'B2'],
    freeScope: 'free',
    description: 'アメリカ英語発音特化。口の動き詳細解説。世界最高の発音チャンネル。',
    category: 'YouTube',
    recommended: true,
  },
  {
    id: 'engvid',
    name: 'engVid',
    url: 'https://www.youtube.com/user/engaborigenal',
    language: 'english',
    skills: ['listening', 'reading'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '11人の講師。IELTS/TOEFL/文法/語彙/ビジネス全対応。',
    category: 'YouTube',
  },
  {
    id: 'hapa-eikaiwa',
    name: 'Hapa英会話',
    url: 'https://www.youtube.com/c/HapaEikaiwa',
    language: 'english',
    skills: ['listening', 'speaking'],
    levels: ['A2', 'B1', 'B2'],
    freeScope: 'free',
    description: '日米ハーフのJunによる日本語解説付き英語レッスン。',
    category: 'YouTube',
    recommended: true,
  },
  {
    id: 'atsueigo',
    name: 'Atsueigo',
    url: 'https://www.youtube.com/c/Atsueigo',
    language: 'english',
    skills: ['listening', 'reading'],
    levels: ['B1', 'B2', 'C1'],
    freeScope: 'free',
    description: 'IELTS 8.5・英検1級のATSUが語る学習法。',
    category: 'YouTube',
  },

  // ========== PODCAST ==========
  {
    id: 'voa-podcast',
    name: 'VOA Learning English Podcast',
    url: 'https://learningenglish.voanews.com/',
    language: 'english',
    skills: ['listening'],
    levels: ['A2', 'B1'],
    freeScope: 'free',
    description: 'ゆっくり明瞭な英語ニュース。トランスクリプト付き。',
    category: 'Podcast',
    recommended: true,
  },
  {
    id: '6-minute-english',
    name: '6 Minute English (BBC)',
    url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english',
    language: 'english',
    skills: ['listening'],
    levels: ['B1', 'B2'],
    freeScope: 'free',
    description: '6分間で語彙・文法を学べるBBCの人気番組。',
    category: 'Podcast',
    recommended: true,
  },
  {
    id: 'all-ears-english',
    name: 'All Ears English',
    url: 'https://www.allearsenglish.com/',
    language: 'english',
    skills: ['listening'],
    levels: ['B1', 'B2', 'C1'],
    freeScope: 'free',
    description: 'アメリカ英語の自然な会話。IELTS対策エピソードも。',
    category: 'Podcast',
  },
  {
    id: 'hapa-podcast',
    name: 'Hapa英会話 Podcast',
    url: 'https://hapaeikaiwa.com/',
    language: 'english',
    skills: ['listening'],
    levels: ['A2', 'B1', 'B2'],
    freeScope: 'free',
    description: '日英バイリンガルPodcast。ネイティブ会話+日本語解説。',
    category: 'Podcast',
    recommended: true,
  },
  {
    id: 'ted-talks',
    name: 'TED Talks Daily',
    url: 'https://www.ted.com/podcasts',
    language: 'english',
    skills: ['listening'],
    levels: ['B2', 'C1'],
    freeScope: 'free',
    description: '字幕・スクリプト付きのプレゼンテーション。',
    category: 'Podcast',
  },

  // ========== PRONUNCIATION ==========
  {
    id: 'elsa-speak',
    name: 'ELSA Speak',
    url: 'https://elsaspeak.com/',
    language: 'english',
    skills: ['speaking', 'listening'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'freemium',
    description: 'AI音声認識で発音を音素単位で分析。発音矯正AI分野で世界最先端。',
    category: 'Pronunciation',
    recommended: true,
  },
  {
    id: 'youglish-en',
    name: 'YouGlish English',
    url: 'https://youglish.com/english',
    language: 'english',
    skills: ['listening', 'speaking'],
    levels: ['A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: 'YouTube上で特定単語が使われる瞬間を検索。US/UK/AUSフィルター付き。',
    category: 'Pronunciation',
  },
  {
    id: 'forvo-en',
    name: 'Forvo English',
    url: 'https://forvo.com/languages/en/',
    language: 'english',
    skills: ['listening', 'speaking'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '世界最大の発音辞典。数十万の英語発音が登録済み。',
    category: 'Pronunciation',
  },
  {
    id: 'speechling-en',
    name: 'Speechling',
    url: 'https://speechling.com/',
    language: 'english',
    skills: ['speaking', 'listening'],
    levels: ['A1', 'A2', 'B1', 'B2'],
    freeScope: 'freemium',
    description: 'プロコーチが発音を添削。月10回無料。',
    category: 'Pronunciation',
  },
  {
    id: 'sounds-of-speech',
    name: 'Sounds of Speech',
    url: 'https://soundsofspeech.uiowa.edu/',
    language: 'english',
    skills: ['speaking'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '口腔内の動きをアニメーションで表示。音声学的に発音を理解。',
    category: 'Pronunciation',
  },

  // ========== WRITING ==========
  {
    id: 'write-improve',
    name: 'Write & Improve (Cambridge)',
    url: 'https://writeandimprove.com/',
    language: 'english',
    skills: ['writing'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: 'Cambridge公式AIライティング添削。CEFRレベル判定付き。完全無料。',
    category: 'Writing',
    recommended: true,
  },
  {
    id: 'grammarly',
    name: 'Grammarly',
    url: 'https://www.grammarly.com/',
    language: 'english',
    skills: ['writing'],
    levels: ['B1', 'B2', 'C1'],
    freeScope: 'freemium',
    description: 'AIベースの英文校正。基本文法・スペルチェック無料。',
    category: 'Writing',
  },
  {
    id: 'langcorrect-en',
    name: 'LangCorrect',
    url: 'https://langcorrect.com/',
    language: 'english',
    skills: ['writing'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: 'Lang-8後継。ネイティブから添削をもらえる。',
    category: 'Writing',
    recommended: true,
  },
  {
    id: 'hinative-en',
    name: 'HiNative',
    url: 'https://hinative.com/',
    language: 'english',
    skills: ['writing', 'speaking', 'reading'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'freemium',
    description: '「この表現は自然ですか？」をサクッとネイティブに確認。',
    category: 'Writing',
  },
  {
    id: 'languagetool',
    name: 'LanguageTool',
    url: 'https://languagetool.org/',
    language: 'english',
    skills: ['writing'],
    levels: ['B1', 'B2', 'C1'],
    freeScope: 'freemium',
    description: 'オープンソースベースの文法チェッカー。Grammarlyの代替。',
    category: 'Writing',
  },

  // ========== CONVERSATION ==========
  {
    id: 'hilokal-en',
    name: 'Hilokal',
    url: 'https://www.hilokal.com/',
    language: 'english',
    skills: ['speaking', 'listening'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '無料ライブ音声会話ルーム。聴くだけでもOK。永久無料宣言。',
    category: 'Conversation',
    recommended: true,
  },
  {
    id: 'hellotalk-en',
    name: 'HelloTalk',
    url: 'https://www.hellotalk.com/',
    language: 'english',
    skills: ['speaking', 'listening', 'writing', 'reading'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'freemium',
    description: '6,000万+ユーザーの言語交換アプリ。翻訳・添削ツール内蔵。',
    category: 'Conversation',
  },
  {
    id: 'tandem-en',
    name: 'Tandem',
    url: 'https://www.tandem.net/',
    language: 'english',
    skills: ['speaking', 'listening', 'writing'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'freemium',
    description: '審査制で質の高いマッチング。',
    category: 'Conversation',
  },
  {
    id: 'free4talk-en',
    name: 'Free4Talk',
    url: 'https://www.free4talk.com/',
    language: 'english',
    skills: ['speaking', 'listening'],
    levels: ['A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '無料ビデオ/音声チャットルーム。予約不要、24時間。',
    category: 'Conversation',
  },
  {
    id: 'italki',
    name: 'italki',
    url: 'https://www.italki.com/',
    language: 'english',
    skills: ['speaking', 'listening', 'writing'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'freemium',
    description: '世界最大級の語学チューターマーケット。無料でパートナー検索も。',
    category: 'Conversation',
  },

  // ========== APPS ==========
  {
    id: 'duolingo',
    name: 'Duolingo',
    url: 'https://www.duolingo.com/',
    language: 'english',
    skills: ['reading', 'writing', 'listening', 'speaking'],
    levels: ['A1', 'A2', 'B1'],
    freeScope: 'freemium',
    description: '世界で最も有名な語学アプリ。習慣形成には最強。',
    category: 'Apps',
  },
  {
    id: 'cake',
    name: 'Cake',
    url: 'https://mycake.me/',
    language: 'english',
    skills: ['listening', 'speaking'],
    levels: ['A2', 'B1', 'B2'],
    freeScope: 'freemium',
    description: '映画・ドラマの短いクリップでリスニング＆スピーキング練習。',
    category: 'Apps',
    recommended: true,
  },
  {
    id: 'anki-en',
    name: 'Anki',
    url: 'https://ankiweb.net/',
    language: 'english',
    skills: ['reading', 'listening'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: 'SRSフラッシュカードの金字塔。TOEIC/IELTS/英検デッキ多数。',
    category: 'Apps',
    recommended: true,
  },
  {
    id: 'clozemaster-en',
    name: 'Clozemaster',
    url: 'https://www.clozemaster.com/',
    language: 'english',
    skills: ['reading', 'listening'],
    levels: ['A2', 'B1', 'B2', 'C1'],
    freeScope: 'freemium',
    description: '文脈の中で語彙を覚える穴埋め形式。',
    category: 'Apps',
  },
  {
    id: 'mikan',
    name: 'mikan',
    url: 'https://mikan.link/',
    language: 'english',
    skills: ['reading'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'freemium',
    description: 'TOEIC/英検/大学受験の単語帳。日本人向け特化。',
    category: 'Apps',
  },
  {
    id: 'santa-alc',
    name: 'Santaアルク',
    url: 'https://santa.alc.co.jp/',
    language: 'english',
    skills: ['reading', 'listening'],
    levels: ['A2', 'B1', 'B2', 'C1'],
    freeScope: 'freemium',
    description: 'AI TOEIC対策。3億データで最短スコアアップ。',
    category: 'Apps',
  },

  // ========== AI TOOLS ==========
  {
    id: 'language-reactor-en',
    name: 'Language Reactor',
    url: 'https://www.languagereactor.com/',
    language: 'english',
    skills: ['reading', 'listening'],
    levels: ['A2', 'B1', 'B2', 'C1'],
    freeScope: 'freemium',
    description: 'Netflix/YouTubeに英日二言語字幕を同時表示。魔法のツール。',
    category: 'AI & Tools',
    recommended: true,
  },
  {
    id: 'chatgpt-en',
    name: 'ChatGPT / Claude',
    url: 'https://chat.openai.com/',
    language: 'english',
    skills: ['reading', 'writing', 'listening', 'speaking'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'freemium',
    description: '24時間稼働の英語家庭教師。文法質問、添削、会話練習なんでも。',
    category: 'AI & Tools',
    recommended: true,
  },
  {
    id: 'speak',
    name: 'Speak',
    url: 'https://www.speak.com/',
    language: 'english',
    skills: ['speaking', 'listening'],
    levels: ['A1', 'A2', 'B1', 'B2'],
    freeScope: 'freemium',
    description: 'AIスピーキングチューター。アウトプット重視。日本語UIあり。',
    category: 'AI & Tools',
  },
  {
    id: 'talkpal',
    name: 'TalkPal AI',
    url: 'https://talkpal.ai/',
    language: 'english',
    skills: ['speaking', 'listening', 'reading', 'writing'],
    levels: ['A1', 'A2', 'B1', 'B2'],
    freeScope: 'freemium',
    description: 'GPTベースのAI会話パートナー。Roleplay、Debate等のモード。',
    category: 'AI & Tools',
  },

  // ========== COMPREHENSIVE ==========
  {
    id: 'british-council',
    name: 'British Council LearnEnglish',
    url: 'https://learnenglish.britishcouncil.org/',
    language: 'english',
    skills: ['reading', 'writing', 'listening', 'speaking'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: 'British Councilの包括的英語学習プラットフォーム。完全無料。',
    category: 'Comprehensive',
    recommended: true,
  },
  {
    id: 'usa-learns',
    name: 'USA Learns',
    url: 'https://www.usalearns.org/',
    language: 'english',
    skills: ['reading', 'writing', 'listening', 'speaking'],
    levels: ['A1', 'A2', 'B1'],
    freeScope: 'free',
    description: '米国政府系機関の無料英語コース。ビデオベース。',
    category: 'Comprehensive',
  },

  // ========== TEST PREP ==========
  {
    id: 'ielts-british-council',
    name: 'British Council IELTS',
    url: 'https://takeielts.britishcouncil.org/',
    language: 'english',
    skills: ['reading', 'writing', 'listening', 'speaking'],
    levels: ['B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '公式IELTS練習テスト。全セクション模範解答付き。',
    category: 'Test Prep',
    recommended: true,
  },
  {
    id: 'ielts-liz',
    name: 'IELTS Liz',
    url: 'https://ieltsliz.com/',
    language: 'english',
    skills: ['reading', 'writing', 'listening', 'speaking'],
    levels: ['B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '元IELTS試験官による無料レッスン。全セクションのTips。',
    category: 'Test Prep',
    recommended: true,
  },
  {
    id: 'toeic-official',
    name: 'TOEIC公式サンプル問題',
    url: 'https://www.iibc-global.org/toeic/test/lr/about/sample.html',
    language: 'english',
    skills: ['reading', 'listening'],
    levels: ['A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '全パートのサンプル問題。最も信頼できるソース。',
    category: 'Test Prep',
  },
  {
    id: 'english-upgrader',
    name: 'English Upgrader',
    url: 'https://www.iibc-global.org/toeic/support/englishupgrader.html',
    language: 'english',
    skills: ['listening'],
    levels: ['A2', 'B1', 'B2'],
    freeScope: 'free',
    description: 'TOEIC公式のPodcast型学習アプリ。70本以上のコンテンツ。',
    category: 'Test Prep',
  },
  {
    id: 'eiken-past',
    name: '英検過去問',
    url: 'https://www.eiken.or.jp/eiken/exam/',
    language: 'english',
    skills: ['reading', 'listening'],
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    freeScope: 'free',
    description: '直近3回分の過去問＋音声を無料公開。',
    category: 'Test Prep',
    recommended: true,
  },
];
```

---

## UIコンポーネント仕様

### ファイル構成

```
/src/
├── data/
│   └── resources.ts          # 上記データ + 型定義
├── components/
│   └── ResourceLibrary.tsx   # メインReactコンポーネント
└── pages/
    └── resources.astro       # Astroページ（既存を更新）
```

### ResourceLibrary.tsx

#### 状態管理

```typescript
interface FilterState {
  language: 'all' | 'japanese' | 'english';
  skills: Skill[];           // 複数選択可
  levels: string[];          // 複数選択可（JLPTとCEFR混在OK）
  freeScope: 'all' | 'free' | 'freemium';
  category: string;          // 'all' または特定カテゴリ
  search: string;            // テキスト検索
}
```

#### UI構成

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Search: [________________]                           │
├─────────────────────────────────────────────────────────┤
│ Language: [All] [日本語🇯🇵] [English🇬🇧]                   │
├─────────────────────────────────────────────────────────┤
│ Skills:   [📖 Reading] [✍️ Writing] [👂 Listening] [🗣️ Speaking] │
├─────────────────────────────────────────────────────────┤
│ Level:    [N5][N4][N3][N2][N1] | [A1][A2][B1][B2][C1]  │
├─────────────────────────────────────────────────────────┤
│ Category: [All ▼]                                       │
├─────────────────────────────────────────────────────────┤
│ Free:     [All] [Free Only] [Freemium OK]              │
├─────────────────────────────────────────────────────────┤
│ 📊 Showing 42 resources                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ⭐ Tadoku Free Books                          FREE 🇯🇵  │
│ にほんごたどく                                          │
│ 📖 👂  |  N5 N4 N3 N2  |  Graded Readers              │
│ NPO-backed graded readers with furigana...             │
│ [Visit Site →]                                          │
└─────────────────────────────────────────────────────────┘
```

#### フィルターロジック

1. **Language**: 選択した言語のリソースのみ表示
2. **Skills**: OR条件（選択した技能のいずれかを含む）
3. **Levels**: OR条件（選択したレベルのいずれかを含む）
4. **Category**: 完全一致
5. **FreeScope**: 完全一致（'free'選択時はfreemium除外）
6. **Search**: name, description, category をcase-insensitiveで部分一致

#### レスポンシブ対応

- **Desktop**: 3カラムグリッド
- **Tablet**: 2カラムグリッド
- **Mobile**: 1カラム + フィルターはアコーディオン/モーダル

---

## デザイン要件

### カラー

```css
/* Brand */
--primary: #0ea5e9;     /* Sky 500 */
--accent: #d946ef;      /* Fuchsia 500 */

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);

/* Status */
--free: #22c55e;        /* Green 500 */
--freemium: #eab308;    /* Yellow 500 */
```

### カードスタイル

```css
.resource-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  backdrop-filter: blur(8px);
  transition: all 0.2s;
}

.resource-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.resource-card.recommended {
  border-color: #d946ef;  /* Accent highlight */
}
```

### フィルターボタン

```css
.filter-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 9999px;  /* pill shape */
}

.filter-btn.active {
  background: #0ea5e9;
  border-color: #0ea5e9;
}
```

---

## 追加機能（Phase 2で実装可能）

1. **Level Check連携**: 診断結果から自動でフィルターをセット
2. **お気に入り機能**: LocalStorageに保存
3. **進捗トラッキング**: 使ったリソースをチェック
4. **ソート機能**: おすすめ順 / 名前順 / カテゴリ順

---

## テスト項目

1. [ ] 全フィルターが正しく動作する
2. [ ] 検索がリアルタイムで反映される
3. [ ] レスポンシブでモバイルでも使いやすい
4. [ ] 外部リンクが新しいタブで開く
5. [ ] おすすめリソースがハイライトされる
6. [ ] 結果が0件の場合に適切なメッセージを表示
