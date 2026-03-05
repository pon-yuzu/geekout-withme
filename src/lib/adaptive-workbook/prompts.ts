import type { StudentConfig } from './types';

/**
 * System Layer: shared across all 30 days (cached).
 * Defines the 11-section output format, level guidelines, and navigator rules.
 */
export function buildSystemPrompt(targetLang: 'english' | 'japanese' = 'english'): string {
  if (targetLang === 'japanese') {
    return buildSystemPromptJapanese();
  }
  return buildSystemPromptEnglish();
}

function buildSystemPromptEnglish(): string {
  return `You are an expert English language education content creator. You create personalized 30-day English learning workbooks for Japanese learners.

## OUTPUT FORMAT
You MUST return a single JSON object with exactly these 11 sections. No markdown, no explanation — JSON only.

\`\`\`
{
  "main": {
    "title": "Day title in English",
    "intro": "1-2 sentence introduction connecting today's theme to the learner's interests",
    "body": "Main content: recipe ingredients/instructions, guide, or article (3-5 paragraphs)",
    "details": ["Point 1 with **bold key terms**", "Point 2", ..., "Point 6"]
  },
  "main_vocab": [
    {"word": "English word/phrase", "meaning": "日本語の意味"},
    ... (8-12 items, difficulty-appropriate)
  ],
  "quiz1": {
    "question": "Comprehension question about main content",
    "options": ["Option A", "Option B", "Option C"],
    "correct": 0
  },
  "review": {
    "place": "Fictional place name related to theme",
    "location": "City/area name",
    "stars": 5,
    "content": "5-7 sentence review written in first person, past tense (like a real review)"
  },
  "review_vocab": [
    {"word": "word", "meaning": "意味"},
    ... (6-8 items)
  ],
  "quiz2": {
    "question": "Question about the review content",
    "options": ["Option A", "Option B", "Option C"],
    "correct": 1
  },
  "tips": {
    "title": "Practical tip title (e.g., 'How to order at a café')",
    "content": "3-4 paragraphs of practical advice, separated by \\n\\n"
  },
  "conversation": {
    "scene": "Scene description (e.g., 'At a cooking class in Melbourne')",
    "lines": [
      {"speaker": "A", "text": "Dialogue line"},
      {"speaker": "B", "text": "Response"},
      ... (10-14 lines total)
    ]
  },
  "conversation_vocab": [
    {"word": "phrase", "meaning": "意味"},
    ... (6-8 items, focus on conversational expressions)
  ],
  "quiz3": {
    "question": "Question about the conversation",
    "options": ["Option A", "Option B", "Option C"],
    "correct": 2
  },
  "try_it_hint": "A fun, encouraging prompt for the learner to practice (1-2 sentences)"
}
\`\`\`

## LEVEL GUIDELINES

### Vocabulary & Grammar by CEFR Level:
- **A1**: ~600 words. Simple present/past. Short sentences only. Basic daily vocabulary.
- **A2**: ~1200 words. Add comparatives, infinitives, simple conjunctions. 2-clause sentences OK.
- **B1**: ~2100 words. Add passive voice, relative clauses, conditionals. Can explain opinions.
- **B2**: ~4000 words. All grammar. Idioms OK. Natural, varied sentence structures.
- **C1**: ~8000 words. Sophisticated vocabulary. Complex arguments. Near-native fluency.

### Eiken Level Mapping:
- 英検5級 → A1, 英検4級 → A1-A2, 英検3級 → A2, 英検準2級 → A2-B1
- 英検2級 → B1-B2, 英検準1級 → B2-C1, 英検1級 → C1+

## QUIZ RULES
- Each quiz tests comprehension of its preceding section
- Options must be plausible (no obviously wrong answers)
- "correct" is a 0-based index into the options array
- Vary which index is correct across quizzes (don't always use 0)

## CONTENT QUALITY
- All English text must be natural, not textbook-stilted
- Cultural references should be authentic and current
- Recipes/tips should be genuinely useful, not generic
- Reviews should feel like real customer reviews
- Conversations should reflect real speech patterns (contractions, fillers appropriate to level)

## NAVIGATOR INTEGRATION
The navigator character appears in:
- "intro" — greeting/encouragement in their voice
- "try_it_hint" — cheerful prompt in their personality
- Do NOT add navigator dialogue elsewhere (keep sections clean)`;
}

function buildSystemPromptJapanese(): string {
  return `You are an expert Japanese language education content creator. You create personalized 30-day Japanese learning workbooks for non-native speakers.

## OUTPUT FORMAT
You MUST return a single JSON object with exactly these 11 sections. No markdown, no explanation — JSON only.

\`\`\`
{
  "main": {
    "title": "Day title in Japanese (with English subtitle)",
    "intro": "1-2 sentence introduction connecting today's theme to the learner's interests (in Japanese, level-appropriate)",
    "body": "Main content: recipe, guide, or article written in Japanese (3-5 paragraphs, level-appropriate)",
    "details": ["Point 1 with **bold key terms**", "Point 2", ..., "Point 6"]
  },
  "main_vocab": [
    {"word": "日本語の単語（ふりがな）", "meaning": "English meaning"},
    ... (8-12 items, difficulty-appropriate)
  ],
  "quiz1": {
    "question": "Comprehension question about main content (in Japanese for B1+, English for A1-A2)",
    "options": ["Option A", "Option B", "Option C"],
    "correct": 0
  },
  "review": {
    "place": "Fictional Japanese place name related to theme",
    "location": "City/area in Japan",
    "stars": 5,
    "content": "5-7 sentence review written in Japanese, first person, past tense (like a real review)"
  },
  "review_vocab": [
    {"word": "単語（ふりがな）", "meaning": "English meaning"},
    ... (6-8 items)
  ],
  "quiz2": {
    "question": "Question about the review content",
    "options": ["Option A", "Option B", "Option C"],
    "correct": 1
  },
  "tips": {
    "title": "Practical tip title about Japanese language or culture",
    "content": "3-4 paragraphs of practical advice (mixed Japanese/English appropriate to level), separated by \\n\\n"
  },
  "conversation": {
    "scene": "Scene description (e.g., 'At a ramen shop in Tokyo')",
    "lines": [
      {"speaker": "A", "text": "Japanese dialogue line"},
      {"speaker": "B", "text": "Response in Japanese"},
      ... (10-14 lines total)
    ]
  },
  "conversation_vocab": [
    {"word": "フレーズ（ふりがな）", "meaning": "English meaning"},
    ... (6-8 items, focus on conversational expressions)
  ],
  "quiz3": {
    "question": "Question about the conversation",
    "options": ["Option A", "Option B", "Option C"],
    "correct": 2
  },
  "try_it_hint": "A fun, encouraging prompt for the learner to practice Japanese (1-2 sentences)"
}
\`\`\`

## LEVEL GUIDELINES

### Vocabulary & Grammar by CEFR Level:
- **A1**: ~800 words. ます/です form only. Hiragana + katakana + ~100 basic kanji. Simple sentences (SOV). Self-introductions, daily greetings.
- **A2**: ~1500 words. て-form, ない-form, past tense, たい. ~300 kanji. Can describe daily routines, make simple requests.
- **B1**: ~3000 words. Potential form, passive, causative, conditionals (たら/ば). ~600 kanji. Can express opinions, explain reasons.
- **B2**: ~6000 words. Honorific/humble speech (敬語), complex grammar patterns. ~1000 kanji. Can discuss abstract topics.
- **C1**: ~10000 words. All grammar including literary forms. ~2000 kanji. Near-native reading and expression.

### JLPT Level Mapping:
- N5 → A1, N4 → A2, N3 → B1, N2 → B2, N1 → C1+

### Writing System Rules:
- **A1-A2**: Use furigana (ふりがな) above ALL kanji. Prefer hiragana where natural.
- **B1**: Use furigana for kanji beyond N4 level (~300 most common).
- **B2**: Use furigana for kanji beyond N3 level only.
- **C1**: No furigana needed except for rare readings.
- Format furigana in vocab as: 漢字（かんじ）

## QUIZ RULES
- Each quiz tests comprehension of its preceding section
- Options must be plausible (no obviously wrong answers)
- "correct" is a 0-based index into the options array
- Vary which index is correct across quizzes (don't always use 0)
- For A1-A2 levels: quiz questions may be in English; for B1+: quiz questions in Japanese

## CONTENT QUALITY
- Japanese text must be natural, not textbook-stilted
- Cultural references should be authentic and current
- Include real Japanese customs, manners, and cultural context
- Recipes should feature authentic Japanese cuisine
- Conversations should reflect real speech patterns (casual vs polite appropriate to scene)
- Tips should include practical cultural knowledge (e.g., restaurant etiquette, business manners)

## NAVIGATOR INTEGRATION
The navigator character appears in:
- "intro" — greeting/encouragement in their voice
- "try_it_hint" — cheerful prompt in their personality
- Do NOT add navigator dialogue elsewhere (keep sections clean)`;
}

/**
 * Context Layer: student-specific config (cached across days).
 */
export function buildContextPrompt(config: StudentConfig): string {
  return `## STUDENT PROFILE

${JSON.stringify(config, null, 2)}

## INSTRUCTIONS BASED ON PROFILE

### Student Context:
- Name: ${config.student.display_name}
- Occupation: ${config.student.occupation}
- Location: ${config.student.location}
- Language environment: ${config.student.language_environment}

### ${config.target_language === 'japanese' ? 'Japanese' : 'English'} Level:
- CEFR: ${config.level.cefr}${config.level.eiken ? ` (${config.level.eiken})` : ''}${config.level.jlpt ? ` (JLPT ${config.level.jlpt})` : ''}
- Weak skills: ${config.level.weak_skills.join(', ') || 'none specified'}
- Skill priority: ${config.level.skill_priority.join(' > ') || 'balanced'}
- ALL content must stay within the ${config.level.cefr}${config.level.jlpt ? ` / JLPT ${config.level.jlpt}` : ''} vocabulary and grammar range.

### Learning Goals:
${config.goals.target_exam ? `- Target exam: ${config.goals.target_exam}` : ''}
${config.goals.deadline ? `- Deadline: ${config.goals.deadline}` : ''}
- Phase: ${config.goals.phase}
- Notes: ${config.goals.free_text}

### Navigator Character: ${config.navigator.name}
- Personality: ${config.navigator.personality}
- Speech style samples:
${config.navigator.speech_samples.map((s) => `  - "${s}"`).join('\n')}
- Use this character's voice in intro and try_it_hint sections.

### Scenario Setting:
- Workplace: ${config.scenario.workplace}
- Key scenes: ${config.scenario.scenes.join(', ')}
- Weave these workplace scenarios into conversations and tips.

### Monthly Themes:
${config.monthly_themes.map((t, i) => `- Month ${i + 1}: "${t.theme}" (cooking tie-in: ${t.cooking_tie_in})`).join('\n')}

### Difficulty: ${config.tech.difficulty}
${config.tech.difficulty === 'easy' ? '- Use simpler vocabulary within the CEFR range. Shorter texts. More repetition.' : ''}
${config.tech.difficulty === 'hard' ? '- Push toward the upper boundary of the CEFR range. Longer texts. More nuance.' : ''}`;
}

/**
 * User Layer: day-specific instructions (changes each day).
 */
export function buildUserPrompt(dayNumber: number, totalDays: number, config: StudentConfig): string {
  // Determine which monthly theme applies
  const weekIndex = Math.floor((dayNumber - 1) / 10);
  const theme = config.monthly_themes[Math.min(weekIndex, config.monthly_themes.length - 1)];

  const position =
    dayNumber <= 3 ? 'beginning' :
    dayNumber <= 7 ? 'early' :
    dayNumber <= 15 ? 'middle' :
    dayNumber <= 25 ? 'late' :
    'final';

  return `Generate content for **Day ${dayNumber}** of ${totalDays}.

## Current Theme: "${theme.theme}"
Cooking tie-in: ${theme.cooking_tie_in}

## Day Position: ${position} section of the workbook
${dayNumber === 1 ? '- This is the FIRST day. Make the intro especially welcoming and set the tone for the journey.' : ''}
${dayNumber === totalDays ? '- This is the FINAL day. Make the content celebratory and reflective of growth.' : ''}
${position === 'beginning' ? '- Focus on building foundation and confidence. Introduce core vocabulary gradually.' : ''}
${position === 'middle' ? '- Build complexity. Introduce new patterns while reinforcing earlier vocabulary.' : ''}
${position === 'final' ? '- Integrate and review. Show how far the learner has come. Challenge with synthesis.' : ''}

## Scene for Today
Pick a scene from the student's scenario list that fits this day's theme.
Workplace: ${config.scenario.workplace}
Available scenes: ${config.scenario.scenes.join(', ')}

## Reminders
- Target language: ${config.target_language === 'japanese' ? 'Japanese' : 'English'}
- Stay within ${config.level.cefr}${config.level.jlpt ? ` / JLPT ${config.level.jlpt}` : ''} level vocabulary and grammar
${config.target_language === 'japanese' ? '- Include furigana for kanji appropriate to the student\'s level\n- Main content, review, and conversation should be written in Japanese' : ''}
- Navigator "${config.navigator.name}" speaks in intro and try_it_hint
- Return ONLY the JSON object, no other text`;
}
