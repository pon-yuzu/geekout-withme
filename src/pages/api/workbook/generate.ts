import type { APIRoute } from 'astro';
import type { SlotValues, GenerationConfig, TopicItem, WorkbookLanguage } from '../../../lib/workbook/types';
import { nanoid } from 'nanoid';
import { claudeGenerate, extractJSON } from '../../../lib/claude';
import { createWorkbook } from '../../../lib/workbook/db';
import { buildTopicItemsPrompt } from '../../../lib/workbook/prompts/topic-items';
import { getTopicConfig, getLevelConfig, getJlptLevelConfig } from '../../../lib/workbook/slots';
import { tryIncrementUsage, quotaExceededResponse } from '../../../lib/quota';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: subs } = await locals.supabase!
    .from('subscriptions').select('status')
    .eq('user_id', user.id).in('status', ['active', 'trialing']).limit(1);
  if (!subs?.length) return new Response('Premium required', { status: 403 });

  // Daily quota check
  const quotaResult = await tryIncrementUsage(locals, 'workbook');
  if (!quotaResult.allowed) {
    return quotaExceededResponse('workbook');
  }

  const apiKey = import.meta.env.CF_AI_TOKEN ?? locals.runtime?.env?.CF_AI_TOKEN;
  if (!apiKey) return new Response('AI not configured', { status: 500 });

  // 月1冊制限チェック
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { count } = await locals.supabase!
    .from('workbooks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', monthStart);
  if ((count ?? 0) >= 1) {
    return new Response(
      JSON.stringify({ error: 'ワークブックは月1冊まで作成できます。来月またお試しください。' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { slots } = (await request.json()) as { slots: SlotValues };

  if (!slots.topic || !slots.level || !slots.destination) {
    return new Response(JSON.stringify({ error: 'Missing slots' }), { status: 400 });
  }

  const language: WorkbookLanguage = slots.language ?? 'english';
  const isJapanese = language === 'japanese';

  const topicConfig = getTopicConfig(slots.topic);
  const levelConfig = isJapanese
    ? getJlptLevelConfig(slots.level)
    : getLevelConfig(slots.level);

  if (!topicConfig || !levelConfig) {
    return new Response(JSON.stringify({ error: 'Invalid topic or level' }), { status: 400 });
  }

  const config: GenerationConfig = {
    language,
    topic: slots.topic,
    topicLabel: slots.topicLabel ?? topicConfig.labelJa,
    level: slots.level,
    levelLabel: slots.levelLabel ?? levelConfig.labelJa,
    destination: slots.destination,
    destLabel: slots.destLabel ?? slots.destination,
    profile: slots.preferences ?? {},
    themeColor: 'orange',
  };

  // Generate 30 topic items with Claude
  const itemsPrompt = buildTopicItemsPrompt(config);
  let items: TopicItem[];
  try {
    const itemsResponse = await claudeGenerate(apiKey, itemsPrompt);
    items = extractJSON<TopicItem[]>(itemsResponse);
  } catch (err) {
    console.error('Failed to generate topic items:', err);
    return new Response(JSON.stringify({ error: 'Failed to generate topic items' }), { status: 500 });
  }

  // Create workbook record
  const workbookId = nanoid(12);
  const langSuffix = isJapanese ? '日本語' : '英語';
  const title = `30日間${topicConfig.labelJa}${langSuffix}`;
  const subtitle = `${levelConfig.labelJa} → ${config.destLabel}`;

  await createWorkbook(locals.supabase!, {
    id: workbookId,
    user_id: user.id,
    language,
    topic: slots.topic,
    topic_label: topicConfig.labelJa,
    level: slots.level,
    level_label: levelConfig.labelJa,
    destination: slots.destination,
    dest_label: config.destLabel,
    profile_json: { ...config, items },
    theme_color: config.themeColor,
    title,
    subtitle,
    is_public: slots.isPublic ?? false,
  });

  return new Response(
    JSON.stringify({
      status: 'generating',
      daysCompleted: 0,
      total: 30,
      workbookId,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
