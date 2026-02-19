import type { APIRoute } from 'astro';
import type { ChatState, ChatSession, SlotValues } from '../../../lib/workbook/types';
import { claudeChat } from '../../../lib/claude';
import { getChatSystemPrompt } from '../../../lib/workbook/prompts/chat-system';
import { TOPICS, LEVELS } from '../../../lib/workbook/slots';

interface ChatRequest {
  message: string;
  session: ChatSession;
  autoLevel?: string;
}

interface SlotData {
  type: string;
  value: any;
  label?: string;
}

const EXPECTED_SLOT: Record<string, string | null> = {
  GREETING: null,
  ASK_TOPIC: 'topic',
  ASK_LEVEL: 'level',
  ASK_DESTINATION: 'destination',
  ASK_PREFERENCES: 'preferences',
  CONFIRM_SLOTS: 'confirm',
};

function extractSlotFromResponse(text: string): { cleanText: string; slot: SlotData | null } {
  const slotMatch = text.match(/```slot\s*([\s\S]*?)```/);
  if (!slotMatch) return { cleanText: text, slot: null };

  const cleanText = text.replace(/```slot[\s\S]*?```/, '').trim();
  try {
    const slot = JSON.parse(slotMatch[1].trim()) as SlotData;
    return { cleanText, slot };
  } catch {
    return { cleanText: text, slot: null };
  }
}

function validateSlot(state: ChatState, slot: SlotData): boolean {
  const expected = EXPECTED_SLOT[state];
  if (!expected) return false;
  if (slot.type !== expected) return false;

  switch (slot.type) {
    case 'topic':
      return typeof slot.value === 'string' && slot.value.length > 0;
    case 'level':
      return typeof slot.value === 'string' && slot.value in LEVELS;
    case 'destination':
      return typeof slot.value === 'string' && slot.value.length > 0;
    case 'preferences':
      return typeof slot.value === 'object' && slot.value !== null;
    case 'confirm':
      return slot.value === 'yes' || slot.value === 'no';
    default:
      return false;
  }
}

function getNextState(current: ChatState, slot: SlotData | null): ChatState {
  if (current === 'GREETING') return 'ASK_TOPIC';
  if (!slot) return current;

  switch (slot.type) {
    case 'topic':
      return 'ASK_LEVEL';
    case 'level':
      return 'ASK_DESTINATION';
    case 'destination':
      return 'ASK_PREFERENCES';
    case 'preferences':
      return 'CONFIRM_SLOTS';
    case 'confirm':
      return slot.value === 'yes' ? 'GENERATING' : 'ASK_TOPIC';
    default:
      return current;
  }
}

function applySlot(slots: SlotValues, slot: SlotData): SlotValues {
  const updated = { ...slots };
  switch (slot.type) {
    case 'topic':
      updated.topic = slot.value;
      updated.topicLabel = slot.label ?? TOPICS[slot.value]?.labelJa ?? slot.value;
      break;
    case 'level':
      updated.level = slot.value;
      updated.levelLabel = slot.label ?? LEVELS[slot.value]?.labelJa ?? slot.value;
      break;
    case 'destination':
      updated.destination = slot.value;
      updated.destLabel = slot.label ?? slot.value;
      break;
    case 'preferences':
      updated.preferences = slot.value;
      break;
  }
  return updated;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: subs } = await locals.supabase!
    .from('subscriptions').select('status')
    .eq('user_id', user.id).eq('status', 'active').limit(1);
  if (!subs?.length) return new Response('Premium required', { status: 403 });

  const apiKey = import.meta.env.CLAUDE_API_KEY ?? locals.runtime?.env?.CLAUDE_API_KEY;
  if (!apiKey) return new Response('AI not configured', { status: 500 });

  const { message, session, autoLevel } = (await request.json()) as ChatRequest;

  const currentState = session.state;
  const systemPrompt = getChatSystemPrompt(currentState, session.slots, autoLevel);

  const aiMessages = [
    ...session.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ];

  const responseText = await claudeChat(systemPrompt, aiMessages, apiKey, { maxTokens: 1024 });
  const { cleanText, slot } = extractSlotFromResponse(responseText);

  const validSlot = slot && validateSlot(currentState, slot) ? slot : null;
  const nextState = getNextState(currentState, validSlot);
  const updatedSlots = validSlot ? applySlot(session.slots, validSlot) : session.slots;

  const updatedSession: ChatSession = {
    state: nextState,
    slots: updatedSlots,
    messages: [
      ...session.messages,
      { role: 'user', content: message },
      { role: 'assistant', content: cleanText },
    ],
  };

  return new Response(
    JSON.stringify({
      reply: cleanText,
      session: updatedSession,
      slots: updatedSlots,
      state: nextState,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
