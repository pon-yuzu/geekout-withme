// === Chat State Machine ===
export type WorkbookLanguage = 'english' | 'japanese';

export type ChatState =
  | 'GREETING'
  | 'ASK_LANGUAGE'
  | 'ASK_TOPIC'
  | 'ASK_LEVEL'
  | 'ASK_DESTINATION'
  | 'ASK_PREFERENCES'
  | 'CONFIRM_SLOTS'
  | 'GENERATING'
  | 'COMPLETE';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SlotValues {
  language?: WorkbookLanguage;
  topic?: string;
  topicLabel?: string;
  level?: string;
  levelLabel?: string;
  destination?: string;
  destLabel?: string;
  preferences?: UserPreferences;
  isPublic?: boolean;
}

export interface UserPreferences {
  gender?: string;
  interests?: string[];
  favoriteColors?: string[];
  personality?: string;
  additionalInfo?: string;
}

export interface ChatSession {
  state: ChatState;
  slots: SlotValues;
  messages: ChatMessage[];
}

// === AI Structured Output ===
export interface SlotExtraction {
  extracted: boolean;
  value?: string;
  label?: string;
}

// === Workbook ===
export interface Workbook {
  id: string;
  user_id: string;
  language: string;
  topic: string;
  topic_label: string;
  level: string;
  level_label: string;
  destination: string;
  dest_label: string;
  profile_json: Record<string, unknown>;
  theme_color: string;
  title: string;
  subtitle: string;
  is_public: boolean;
  status: 'generating' | 'completed' | 'failed';
  days_completed: number;
  created_at: string;
  completed_at: string | null;
}

export interface TopicItem {
  day: number;
  en: string;
  ja: string;
  emoji: string;
}

// === Day Content (generalized structure for any topic) ===
export interface DayContent {
  main: {
    title: string;
    intro: string;
    body: string;
    details: string[];
  };
  main_vocab: VocabItem[];
  quiz1: Quiz;
  review: {
    place: string;
    location: string;
    stars: number;
    content: string;
  };
  review_vocab: VocabItem[];
  quiz2: Quiz;
  tips: {
    title: string;
    content: string;
  };
  conversation: {
    scene: string;
    lines: ConversationLine[];
  };
  conversation_vocab: VocabItem[];
  quiz3: Quiz;
  try_it_hint: string;
  meta: TopicItem;
}

export interface VocabItem {
  word: string;
  meaning: string;
}

export interface Quiz {
  question: string;
  options: string[];
  correct: number;
}

export interface ConversationLine {
  speaker: string;
  text: string;
}

export interface WorkbookDay {
  id: string;
  workbook_id: string;
  day_number: number;
  item_en: string;
  item_ja: string;
  item_emoji: string | null;
  content_json: DayContent;
  created_at: string;
}

// === Generation ===
export interface GenerationConfig {
  language: WorkbookLanguage;
  topic: string;
  topicLabel: string;
  level: string;
  levelLabel: string;
  destination: string;
  destLabel: string;
  profile: UserPreferences;
  themeColor: string;
}

export interface GenerationStatus {
  status: 'generating' | 'completed' | 'failed';
  daysCompleted: number;
  total: number;
  workbookId: string;
}
