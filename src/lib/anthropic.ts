import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-5-20250514';

interface GenerateDayOptions {
  systemPrompt: string;
  contextPrompt: string;
  userPrompt: string;
  apiKey: string;
  maxTokens?: number;
}

/**
 * Generate a single day's content using Anthropic API with Prompt Caching.
 * System + Context layers are cached across calls for cost optimization.
 */
export async function generateDay(opts: GenerateDayOptions): Promise<string> {
  const { systemPrompt, contextPrompt, userPrompt, apiKey, maxTokens = 8192 } = opts;

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
      {
        type: 'text',
        text: contextPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      { role: 'user', content: userPrompt },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Anthropic API');
  }
  return textBlock.text;
}

/**
 * Extract JSON from potential markdown code blocks with error handling.
 */
export function extractJSON<T>(text: string): T {
  let jsonStr = text;
  try {
    if (text.includes('```json')) {
      const parts = text.split('```json');
      if (parts.length < 2) throw new Error('Malformed JSON code block');
      jsonStr = parts[1].split('```')[0];
    } else if (text.includes('```')) {
      const parts = text.split('```');
      if (parts.length < 2) throw new Error('Malformed code block');
      jsonStr = parts[1].split('```')[0];
    }

    if (!jsonStr || !jsonStr.trim()) {
      throw new Error('Empty JSON content');
    }

    return JSON.parse(jsonStr.trim()) as T;
  } catch (err: any) {
    throw new Error(`Failed to extract JSON from AI response: ${err.message}. Response preview: ${text.slice(0, 200)}`);
  }
}

/**
 * Validate that generated content has the required structure.
 */
export function validateDayContent(content: any): string[] {
  const errors: string[] = [];
  if (!content.main?.title) errors.push('Missing main.title');
  if (!content.main?.body) errors.push('Missing main.body');
  if (!Array.isArray(content.main_vocab)) errors.push('Missing main_vocab array');
  if (!content.quiz1?.question || !Array.isArray(content.quiz1?.options)) errors.push('Invalid quiz1');
  if (!content.review?.content) errors.push('Missing review.content');
  if (!content.quiz2?.question || !Array.isArray(content.quiz2?.options)) errors.push('Invalid quiz2');
  if (!content.tips?.content) errors.push('Missing tips.content');
  if (!content.conversation?.lines || !Array.isArray(content.conversation.lines)) errors.push('Invalid conversation');
  if (!content.quiz3?.question || !Array.isArray(content.quiz3?.options)) errors.push('Invalid quiz3');
  return errors;
}

/**
 * Get Anthropic API key from runtime environment.
 */
export function getAnthropicKey(locals: any): string | null {
  const runtime = locals.runtime;
  return runtime?.env?.ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY || null;
}
