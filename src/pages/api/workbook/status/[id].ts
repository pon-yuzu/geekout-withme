import type { APIRoute } from 'astro';
import type { TopicItem, GenerationConfig, DayContent, WorkbookLanguage } from '../../../../lib/workbook/types';
import { claudeGenerate, extractJSON } from '../../../../lib/claude';
import { getWorkbook, updateWorkbookStatus, insertDay } from '../../../../lib/workbook/db';
import { buildContentPrompt } from '../../../../lib/workbook/prompts/content-generation';

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) return new Response('Unauthorized', { status: 401 });

  const workbookId = params.id!;
  const apiKey = import.meta.env.CF_AI_TOKEN ?? locals.runtime?.env?.CF_AI_TOKEN;
  if (!apiKey) return new Response('AI not configured', { status: 500 });

  const supabase = locals.supabase!;
  const workbook = await getWorkbook(supabase, workbookId);

  if (!workbook) {
    return new Response(JSON.stringify({ error: 'Workbook not found' }), { status: 404 });
  }

  // Owner check
  if (workbook.user_id !== user.id) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  if (workbook.status === 'completed' || workbook.status === 'failed') {
    return new Response(
      JSON.stringify({
        status: workbook.status,
        daysCompleted: workbook.days_completed,
        total: 30,
        workbookId,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parse profile to get items and config
  const profileData = workbook.profile_json as GenerationConfig & { items: TopicItem[] };
  const items = profileData.items;
  const nextDay = workbook.days_completed + 1;

  if (nextDay > 30) {
    await updateWorkbookStatus(supabase, workbookId, 'completed', 30);
    return new Response(
      JSON.stringify({
        status: 'completed',
        daysCompleted: 30,
        total: 30,
        workbookId,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  const item = items[nextDay - 1];
  if (!item) {
    await updateWorkbookStatus(supabase, workbookId, 'failed', workbook.days_completed);
    return new Response(
      JSON.stringify({
        status: 'failed',
        daysCompleted: workbook.days_completed,
        total: 30,
        workbookId,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const config: GenerationConfig = {
      language: (workbook.language ?? profileData.language ?? 'english') as WorkbookLanguage,
      topic: workbook.topic,
      topicLabel: workbook.topic_label,
      level: workbook.level,
      levelLabel: workbook.level_label,
      destination: workbook.destination,
      destLabel: workbook.dest_label,
      profile: profileData.profile ?? {},
      themeColor: workbook.theme_color,
    };

    const prompt = buildContentPrompt(config, item);
    const response = await claudeGenerate(apiKey, prompt, { maxTokens: 4096 });

    const content = extractJSON<DayContent>(response);
    content.meta = item;

    await insertDay(supabase, {
      workbook_id: workbookId,
      day_number: nextDay,
      item_en: item.en,
      item_ja: item.ja,
      item_emoji: item.emoji,
      content_json: content,
    });

    const newCompleted = nextDay;
    const newStatus = newCompleted >= 30 ? 'completed' : 'generating';
    await updateWorkbookStatus(supabase, workbookId, newStatus, newCompleted);

    return new Response(
      JSON.stringify({
        status: newStatus,
        daysCompleted: newCompleted,
        total: 30,
        workbookId,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error(`Failed to generate day ${nextDay}:`, err);
    return new Response(
      JSON.stringify({
        status: 'generating',
        daysCompleted: workbook.days_completed,
        total: 30,
        workbookId,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
};
