#!/usr/bin/env node

/**
 * Generate listening assessment audio files using Google Cloud TTS Neural2.
 *
 * Prerequisites:
 *   npm install @google-cloud/text-to-speech
 *   gcloud auth application-default login
 *
 * Usage:
 *   node scripts/generate-listening-audio.js
 *
 * Output:
 *   public/audio/listening/{id}.mp3  (one file per question)
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'audio', 'listening');

// Import question data — we read the TS source and extract audioText + id
// Since this is a Node script, we parse the TS file directly via a dynamic approach.
// For simplicity, we define the question metadata inline (mirrors listeningQuestions.ts).

const SPEAKING_RATES = {
  A1: 0.85, A2: 0.9, B1: 0.95, B2: 1.0, C1: 1.0,
  N5: 0.85, N4: 0.9, N3: 0.95, N2: 1.0, N1: 1.0,
};

// Voice alternation: even index = voice A, odd index = voice B
const VOICES = {
  english: {
    a: { languageCode: 'en-US', name: 'en-US-Neural2-D' },  // male
    b: { languageCode: 'en-US', name: 'en-US-Neural2-F' },  // female
  },
  japanese: {
    a: { languageCode: 'ja-JP', name: 'ja-JP-Neural2-B' },  // female
    b: { languageCode: 'ja-JP', name: 'ja-JP-Neural2-D' },  // male
  },
};

async function loadQuestions() {
  // We use tsx or ts-node-esm to import TS, but for broad compat we parse JSON-like structure.
  // Easiest: use a subprocess to extract via tsx, or read the file and eval.
  // For robustness, let's just import it via a dynamic import with tsx loader if available,
  // otherwise fall back to reading the source.

  try {
    // Try importing with tsx support (if tsx is installed)
    const mod = await import('../src/lib/listeningQuestions.ts');
    return {
      english: mod.englishListeningPool,
      japanese: mod.japaneseListeningPool,
    };
  } catch {
    // Fallback: read and extract using regex
    const { readFile } = await import('node:fs/promises');
    const source = await readFile(
      join(__dirname, '..', 'src', 'lib', 'listeningQuestions.ts'),
      'utf-8',
    );

    // Extract all id + audioText pairs
    const questions = [];
    const regex = /id:\s*'([^']+)'[\s\S]*?audioText:\s*'([^']*(?:\\.[^']*)*?)'/g;
    let match;
    while ((match = regex.exec(source)) !== null) {
      questions.push({ id: match[1], audioText: match[2].replace(/\\'/g, "'") });
    }

    // Group by language and level
    const english = [];
    const japanese = [];
    for (const q of questions) {
      if (q.id.startsWith('en-')) {
        const level = q.id.split('-')[1];
        let block = english.find((b) => b.level === level);
        if (!block) {
          block = { level, questions: [] };
          english.push(block);
        }
        block.questions.push(q);
      } else if (q.id.startsWith('ja-')) {
        const level = q.id.split('-')[1];
        let block = japanese.find((b) => b.level === level);
        if (!block) {
          block = { level, questions: [] };
          japanese.push(block);
        }
        block.questions.push(q);
      }
    }

    return { english, japanese };
  }
}

async function main() {
  const client = new TextToSpeechClient();

  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  const { english, japanese } = await loadQuestions();

  const allBlocks = [
    ...english.map((b) => ({ ...b, lang: 'english' })),
    ...japanese.map((b) => ({ ...b, lang: 'japanese' })),
  ];

  let generated = 0;
  let skipped = 0;
  const total = allBlocks.reduce((sum, b) => sum + b.questions.length, 0);

  for (const block of allBlocks) {
    const rate = SPEAKING_RATES[block.level] || 1.0;
    const voices = VOICES[block.lang];

    for (let i = 0; i < block.questions.length; i++) {
      const q = block.questions[i];
      const outPath = join(OUTPUT_DIR, `${q.id}.mp3`);

      // Skip if already exists
      if (existsSync(outPath)) {
        skipped++;
        console.log(`  [skip] ${q.id}.mp3 (already exists)`);
        continue;
      }

      const voice = i % 2 === 0 ? voices.a : voices.b;

      const [response] = await client.synthesizeSpeech({
        input: { text: q.audioText },
        voice,
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: rate,
          pitch: 0,
        },
      });

      await writeFile(outPath, response.audioContent, 'binary');
      generated++;
      console.log(`  [${generated + skipped}/${total}] ${q.id}.mp3 (rate=${rate})`);

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  console.log(`\nDone! Generated: ${generated}, Skipped: ${skipped}, Total: ${total}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
