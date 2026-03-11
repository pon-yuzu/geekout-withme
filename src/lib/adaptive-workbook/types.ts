// Student Config: hearing data schema for personalized workbook generation

export interface StudentConfig {
  target_language: 'english' | 'japanese';
  student: {
    user_id: string;
    display_name: string;
    location: string;
    occupation: string;
    language_environment: string;
  };
  level: {
    cefr: string;
    eiken?: string;
    jlpt?: string;
    weak_skills: string[];
    skill_priority: string[];
  };
  goals: {
    target_exam?: string;
    deadline?: string;
    phase: string;
    free_text: string;
  };
  navigator: {
    name: string;
    personality: string;
    speech_samples: string[];
  };
  scenario: {
    workplace: string;
    scenes: string[];
  };
  monthly_themes: {
    theme: string;
  }[];
  tech: {
    difficulty: 'easy' | 'normal' | 'hard';
    tts: 'browser' | 'google';
  };
}

// DB row for student_configs table
export interface StudentConfigRow {
  id: string;
  user_id: string;
  config_json: StudentConfig;
  status: ConfigStatus;
  generation_mode: 'batch' | 'weekly' | 'daily';
  days_completed: number;
  total_days: number;
  created_at: string;
  updated_at: string;
  // Enriched fields (from API join)
  user_email?: string;
  display_name?: string;
}

export type ConfigStatus = 'draft' | 'approved' | 'generating' | 'preview' | 'review' | 'active';

// DB row for adaptive_workbook_days table
export interface AdaptiveWorkbookDay {
  id: string;
  config_id: string;
  day_number: number;
  content_json: AdaptiveDayContent | null;
  review_status: 'pending' | 'approved' | 'rejected';
  review_notes: string | null;
  generated_at: string | null;
  generation_context: Record<string, unknown> | null;
}

// Content structure for each day (11 sections, DayContent-compatible)
export interface AdaptiveDayContent {
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

// CEFR level options for hearing form
export const CEFR_LEVELS = [
  { value: 'A1', label: 'A1 - Beginner' },
  { value: 'A2', label: 'A2 - Elementary' },
  { value: 'B1', label: 'B1 - Intermediate' },
  { value: 'B2', label: 'B2 - Upper Intermediate' },
  { value: 'C1', label: 'C1 - Advanced' },
  { value: 'C2', label: 'C2 - Proficiency' },
] as const;

export const JLPT_LEVELS = [
  { value: 'N5', label: 'N5 - Basic' },
  { value: 'N4', label: 'N4 - Elementary' },
  { value: 'N3', label: 'N3 - Intermediate' },
  { value: 'N2', label: 'N2 - Upper Intermediate' },
  { value: 'N1', label: 'N1 - Advanced' },
] as const;

export const EIKEN_LEVELS = [
  { value: 'eiken5', label: '英検5級' },
  { value: 'eiken4', label: '英検4級' },
  { value: 'eiken3', label: '英検3級' },
  { value: 'eiken_pre2', label: '英検準2級' },
  { value: 'eiken2', label: '英検2級' },
  { value: 'eiken_pre1', label: '英検準1級' },
  { value: 'eiken1', label: '英検1級' },
] as const;

export const SKILL_OPTIONS = [
  'listening',
  'speaking',
  'reading',
  'writing',
  'grammar',
  'vocabulary',
  'pronunciation',
] as const;

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy (やさしめ)' },
  { value: 'normal', label: 'Normal (標準)' },
  { value: 'hard', label: 'Hard (チャレンジ)' },
] as const;
