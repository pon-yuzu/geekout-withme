#!/usr/bin/env node
/**
 * One-off script: translate English tips/try_it_hint to Japanese
 * in adaptive_workbook_days for the most recent student config.
 *
 * Usage: source .env && node scripts/fix-tips-lang.mjs [config_id]
 */
// Env vars must be set before running:
//   export PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... ANTHROPIC_API_KEY=...
//   node scripts/fix-tips-lang.mjs [config_id]
const required = ['PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ANTHROPIC_API_KEY'];
for (const key of required) {
  if (!process.env[key]) { console.error(`Missing env var: ${key}`); process.exit(1); }
}
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const sb = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Find target config
let configId = process.argv[2];
if (!configId) {
  const { data } = await sb.from('student_configs').select('id').order('created_at', { ascending: false }).limit(1);
  if (!data?.length) { console.error('No student configs found'); process.exit(1); }
  configId = data[0].id;
}
console.log('Target config:', configId);

// Fetch all days
const { data: days, error } = await sb.from('adaptive_workbook_days')
  .select('id, day_number, content_json')
  .eq('config_id', configId)
  .order('day_number');

if (error) { console.error('Fetch error:', error); process.exit(1); }
console.log(`Found ${days.length} days`);

// Filter days with English tips (no hiragana in title)
const hasJapanese = (str) => /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(str || '');
const needsFix = days.filter(d => {
  const tips = d.content_json?.tips;
  const hint = d.content_json?.try_it_hint;
  return (tips && !hasJapanese(tips.title) && !hasJapanese(tips.content)) ||
         (hint && !hasJapanese(hint));
});

console.log(`Days needing fix: ${needsFix.length}`);
if (needsFix.length === 0) { console.log('Nothing to fix!'); process.exit(0); }

// Translate each day's tips
for (const day of needsFix) {
  const { tips, try_it_hint } = day.content_json;
  console.log(`\nDay ${day.day_number}: translating...`);

  const prompt = `Translate the following English workbook content to natural Japanese. Keep the same tone and meaning.

TIPS TITLE: ${tips?.title || ''}
TIPS CONTENT: ${tips?.content || ''}
TRY IT HINT: ${try_it_hint || ''}

Return ONLY a JSON object with exactly these fields:
{
  "tips_title": "日本語のタイトル",
  "tips_content": "日本語の内容（段落は\\n\\nで区切る）",
  "try_it_hint": "日本語のヒント"
}`;

  try {
    const resp = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = resp.content[0].text.trim();
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { console.error(`  Day ${day.day_number}: no JSON in response`); continue; }

    const translated = JSON.parse(jsonMatch[0]);

    // Update content_json
    const updated = { ...day.content_json };
    if (translated.tips_title && translated.tips_content) {
      updated.tips = { title: translated.tips_title, content: translated.tips_content };
    }
    if (translated.try_it_hint) {
      updated.try_it_hint = translated.try_it_hint;
    }

    const { error: updateErr } = await sb.from('adaptive_workbook_days')
      .update({ content_json: updated })
      .eq('id', day.id);

    if (updateErr) { console.error(`  Day ${day.day_number}: update error`, updateErr); }
    else { console.log(`  Day ${day.day_number}: OK — "${translated.tips_title}"`); }
  } catch (e) {
    console.error(`  Day ${day.day_number}: API error`, e.message);
  }
}

console.log('\nDone!');
