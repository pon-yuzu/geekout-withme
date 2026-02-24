interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface WorkersAiResponse {
  result: { response: string };
  success: boolean;
  errors: unknown[];
}

const CF_MODEL = '@cf/meta/llama-3.1-70b-instruct';

// Workers AI via binding (edge, no API key needed)
export async function analyzeWithWorkersAI(
  ai: { run(model: string, inputs: Record<string, unknown>): Promise<{ response: string }> },
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const result = await ai.run(CF_MODEL, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });
  return result.response;
}

// Workers AI via REST API
async function callWorkersAiRest(
  token: string,
  messages: AiMessage[],
  maxTokens?: number
): Promise<string> {
  const accountId = import.meta.env.CF_ACCOUNT_ID;
  if (!accountId) throw new Error('CF_ACCOUNT_ID is not set');

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CF_MODEL}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages,
        max_tokens: maxTokens ?? 1024,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Workers AI REST error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as WorkersAiResponse;
  if (!data.success) {
    throw new Error(`Workers AI error: ${JSON.stringify(data.errors)}`);
  }
  return data.result.response;
}

// Adapter: same signature as old analyzeWithClaude
export async function analyzeWithClaude(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  apiToken: string
): Promise<string> {
  const aiMessages: AiMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];
  return callWorkersAiRest(apiToken, aiMessages);
}

// Unified: tries REST API if token set, otherwise Workers AI binding
export async function analyze(opts: {
  ai?: { run(model: string, inputs: Record<string, unknown>): Promise<{ response: string }> };
  claudeApiKey?: string; // now CF_AI_TOKEN — kept param name for caller compat
  systemPrompt: string;
  userMessage: string;
}): Promise<string> {
  const { ai, claudeApiKey: cfToken, systemPrompt, userMessage } = opts;

  if (cfToken) {
    return analyzeWithClaude(
      systemPrompt,
      [{ role: 'user', content: userMessage }],
      cfToken
    );
  }

  if (ai) {
    return analyzeWithWorkersAI(ai, systemPrompt, userMessage);
  }

  throw new Error('No AI backend available. Set CF_AI_TOKEN or enable Workers AI binding.');
}

export function buildVoiceAnalysisPrompt(language: string, level: string, uiLang?: string): string {
  const feedbackLang = uiLang === 'ja' ? 'Japanese' : 'English';
  const levelCriteria: Record<string, string> = {
    // CEFR
    A1: 'Can produce simple phrases about themselves (name, origin). Basic vocabulary and simple sentence patterns are sufficient.',
    A2: 'Can describe daily activities and hobbies using simple sentences. Minor grammar errors are acceptable.',
    B1: 'Can express opinions with reasons. Uses some complex sentences. Occasional errors are fine if meaning is clear.',
    B2: 'Can discuss abstract topics, give arguments for and against. Good range of vocabulary with mostly accurate grammar.',
    C1: 'Can express complex ideas fluently with precise vocabulary. Rare errors only. Natural, sophisticated expression.',
    // JLPT
    N5: 'Can produce basic Japanese sentences (self-introduction, simple statements). Hiragana-level vocabulary and です/ます form are sufficient.',
    N4: 'Can describe daily activities and simple experiences. Uses て-form, past tense, and basic conjunctions. Errors in particles are acceptable.',
    N3: 'Can explain preferences and give reasons. Uses some intermediate grammar (〜そう、〜のに、etc.). Meaning should be clear despite minor errors.',
    N2: 'Can discuss social topics with nuance. Uses complex grammar patterns (〜ものの、〜わけにはいかない、etc.) with mostly accurate usage.',
    N1: 'Can articulate complex arguments fluently. Uses advanced expressions naturally. Near-native command of grammar and vocabulary.',
  };

  const criteria = levelCriteria[level] || 'Demonstrates competency appropriate for this level.';

  return `You are a language assessment expert evaluating a ${language} speaker at the ${level} level.

PASSING CRITERIA for ${level}:
${criteria}

IMPORTANT GUIDELINES:
- Focus on what the speaker CAN do, not minor mistakes.
- If their ability is AT or ABOVE the ${level} level, they PASS.
- Speech recognition transcripts may contain minor errors from the recognition engine — do not penalize these.
- For Japanese: the transcript may lack spaces between words. This is normal.
- Be encouraging. This is a placement test, not a gatekeeping exam.

Evaluate the transcript and return a JSON object with this exact structure:
{
  "assessedLevel": "<the level you assess, e.g. A1, B2, N3, etc.>",
  "passed": <true if they demonstrate ${level}-level competency or above>,
  "feedback": "<2-3 sentences of constructive feedback in ${feedbackLang}>",
  "strengths": ["<strength 1 in ${feedbackLang}>", "<strength 2 in ${feedbackLang}>"],
  "improvements": ["<area to improve 1 in ${feedbackLang}>", "<area to improve 2 in ${feedbackLang}>"]
}

Return ONLY the JSON object, no other text.`;
}

export function buildTextAnalysisPrompt(language: string, uiLang?: string): string {
  const feedbackLang = uiLang === 'ja' ? 'Japanese' : 'English';
  return `You are a language learning coach. A ${language} learner just completed a reading/writing assessment. Based on their answer history, provide personalized feedback.

Return a JSON object with this exact structure:
{
  "feedback": "<2-3 sentences of encouraging, constructive feedback in ${feedbackLang}>",
  "studyTips": ["<tip 1 in ${feedbackLang}>", "<tip 2 in ${feedbackLang}>", "<tip 3 in ${feedbackLang}>"],
  "focusAreas": ["<area 1 in ${feedbackLang}>", "<area 2 in ${feedbackLang}>"]
}

Return ONLY the JSON object, no other text.`;
}

// Multi-turn chat via Workers AI REST API
export async function claudeChat(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  apiToken: string,
  options?: { maxTokens?: number }
): Promise<string> {
  const aiMessages: AiMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];
  return callWorkersAiRest(apiToken, aiMessages, options?.maxTokens ?? 1024);
}

// Content generation via Workers AI REST API
export async function claudeGenerate(
  apiToken: string,
  prompt: string,
  options?: { maxTokens?: number; system?: string }
): Promise<string> {
  const aiMessages: AiMessage[] = [];
  if (options?.system) {
    aiMessages.push({ role: 'system', content: options.system });
  }
  aiMessages.push({ role: 'user', content: prompt });
  return callWorkersAiRest(apiToken, aiMessages, options?.maxTokens ?? 4096);
}

// Extract JSON from markdown code blocks
export function extractJSON<T>(text: string): T {
  let jsonStr = text;
  if (text.includes('```json')) {
    jsonStr = text.split('```json')[1].split('```')[0];
  } else if (text.includes('```')) {
    jsonStr = text.split('```')[1].split('```')[0];
  }
  return JSON.parse(jsonStr.trim()) as T;
}
