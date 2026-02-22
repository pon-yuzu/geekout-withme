import type { SupabaseClient } from '@supabase/supabase-js';
import type { Workbook, WorkbookDay, DayContent, TopicItem } from './types';

export async function createWorkbook(
  supabase: SupabaseClient,
  data: {
    id: string;
    user_id: string;
    language?: string;
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
    is_public?: boolean;
  }
): Promise<void> {
  const { error } = await supabase.from('workbooks').insert(data);
  if (error) throw new Error(`Failed to create workbook: ${error.message}`);
}

export async function getWorkbook(
  supabase: SupabaseClient,
  id: string
): Promise<Workbook | null> {
  const { data, error } = await supabase
    .from('workbooks')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as Workbook;
}

export async function updateWorkbookStatus(
  supabase: SupabaseClient,
  id: string,
  status: string,
  daysCompleted: number
): Promise<void> {
  const update: Record<string, unknown> = {
    status,
    days_completed: daysCompleted,
  };
  if (status === 'completed') {
    update.completed_at = new Date().toISOString();
  }
  const { error } = await supabase.from('workbooks').update(update).eq('id', id);
  if (error) throw new Error(`Failed to update workbook: ${error.message}`);
}

export async function insertDay(
  supabase: SupabaseClient,
  data: {
    workbook_id: string;
    day_number: number;
    item_en: string;
    item_ja: string;
    item_emoji: string;
    content_json: DayContent;
  }
): Promise<void> {
  const { error } = await supabase.from('workbook_days').upsert(data, {
    onConflict: 'workbook_id,day_number',
  });
  if (error) throw new Error(`Failed to insert day: ${error.message}`);
}

export async function getDay(
  supabase: SupabaseClient,
  workbookId: string,
  dayNumber: number
): Promise<WorkbookDay | null> {
  const { data, error } = await supabase
    .from('workbook_days')
    .select('*')
    .eq('workbook_id', workbookId)
    .eq('day_number', dayNumber)
    .single();
  if (error || !data) return null;
  return data as WorkbookDay;
}

export async function getAllDays(
  supabase: SupabaseClient,
  workbookId: string
): Promise<WorkbookDay[]> {
  const { data, error } = await supabase
    .from('workbook_days')
    .select('*')
    .eq('workbook_id', workbookId)
    .order('day_number', { ascending: true });
  if (error) return [];
  return (data ?? []) as WorkbookDay[];
}

export async function getUserWorkbooks(
  supabase: SupabaseClient,
  userId: string
): Promise<Workbook[]> {
  const { data, error } = await supabase
    .from('workbooks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as Workbook[];
}

export async function getPublicWorkbooks(
  supabase: SupabaseClient
): Promise<Workbook[]> {
  const { data, error } = await supabase
    .from('workbooks')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as Workbook[];
}

export async function getSampleWorkbooks(
  supabase: SupabaseClient,
  language?: string
): Promise<Workbook[]> {
  let query = supabase
    .from('workbooks')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'completed')
    .lte('days_completed', 5);
  if (language) {
    query = query.eq('language', language);
  }
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(3);
  if (error) return [];
  return (data ?? []) as Workbook[];
}

export function parseDayContent(day: WorkbookDay): DayContent {
  const raw = typeof day.content_json === 'string'
    ? JSON.parse(day.content_json)
    : day.content_json;

  const emptyQuiz = { question: '', options: ['A', 'B', 'C'], correct: 0 };

  const reviewRaw = raw.review ?? { place: '', location: '', stars: 0, content: '' };

  return {
    main: raw.main ?? raw.recipe
      ? { title: (raw.main ?? raw.recipe).title ?? '', intro: (raw.main ?? raw.recipe).intro ?? '', body: (raw.main ?? raw.recipe).body ?? (raw.main ?? raw.recipe).ingredients ?? '', details: (raw.main ?? raw.recipe).details ?? (raw.main ?? raw.recipe).steps ?? [] }
      : { title: '', intro: '', body: '', details: [] },
    main_vocab: raw.main_vocab ?? raw.recipe_vocab ?? [],
    quiz1: raw.quiz1 ?? emptyQuiz,
    review: {
      place: reviewRaw.place ?? reviewRaw.restaurant ?? '',
      location: reviewRaw.location ?? '',
      stars: reviewRaw.stars ?? 0,
      content: reviewRaw.content ?? '',
    },
    review_vocab: raw.review_vocab ?? [],
    quiz2: raw.quiz2 ?? emptyQuiz,
    tips: raw.tips ?? raw.australia_tips ?? { title: '', content: '' },
    conversation: raw.conversation ?? { scene: '', lines: [] },
    conversation_vocab: raw.conversation_vocab ?? [],
    quiz3: raw.quiz3 ?? emptyQuiz,
    try_it_hint: raw.try_it_hint ?? '',
    meta: raw.meta ?? day as any,
  };
}

export function parseTopicItems(json: string | Record<string, unknown>): TopicItem[] {
  if (typeof json === 'string') {
    return JSON.parse(json) as TopicItem[];
  }
  return json as unknown as TopicItem[];
}
