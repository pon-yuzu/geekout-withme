# Level Check Test Report v3 (2026-02-20)

## Changes Since v2
- **FIXED**: Audio files generated and deployed (100 mp3 via Google Cloud TTS Neural2)
- **FIXED**: en-A2-05.mp3 was truncated (5.9KB) — regenerated to 52.6KB
- **FIXED**: C1 Q4 "Despite"/"Notwithstanding" — now accepts both (`correct: [0, 1]`)
- **FIXED**: `/api/save-assessment` now saves `listeningLevel` and accepts `'listening'` mode
- **FIXED**: Skill gap notice now compares all three skills (text/listening/voice)
- **ADDED**: `sql/011_add_listening_level.sql` migration for DB schema update
- **MOVED**: `@google-cloud/text-to-speech` to devDependencies

---

## 1. Page Load

| Test | Result |
|------|--------|
| `/` top page | 200 OK |
| `/level-check` page | 200 OK |
| Language selection UI (JA/EN) | Renders correctly |
| Mode selection (Text/Listening/Voice/Both) | Renders correctly |
| Navigation | Working |

---

## 2. API Tests (10 total: 5 EN + 5 JA)

All 10 calls to `/api/analyze-text` returned **`401 Unauthorized`** (requires login — by design for AI feedback).

---

## 3. Text Assessment Questions (100 questions)

| Language | Level | Questions | Result |
|----------|-------|-----------|--------|
| English | A1-B2 | 40 | All correct |
| English | C1 | 10 | All correct (Q4 fixed: accepts both Despite/Notwithstanding) |
| Japanese | N5-N1 | 50 | All correct |

---

## 4. Listening Assessment Questions (100 questions)

### English Listening (50 questions: A1-C1, 10 per level)

| Level | Questions | Types | Issues |
|-------|-----------|-------|--------|
| A1 | 10 | 5 comprehension + 5 dictation | None |
| A2 | 10 | 6 comprehension + 4 dictation | None |
| B1 | 10 | 6 comprehension + 4 dictation | None |
| B2 | 10 | 6 comprehension + 4 dictation | None |
| C1 | 10 | 6 comprehension + 4 dictation | None |

### Japanese Listening (50 questions: N5-N1, 10 per level)

| Level | Questions | Types | Issues |
|-------|-----------|-------|--------|
| N5 | 10 | 6 comprehension + 4 dictation | None |
| N4 | 10 | 6 comprehension + 4 dictation | None |
| N3 | 10 | 6 comprehension + 4 dictation | None |
| N2 | 10 | 6 comprehension + 4 dictation | None |
| N1 | 10 | 6 comprehension + 4 dictation | None |

All 100 listening questions verified — correct answers are accurate, difficulty is appropriate for each level.

### Audio Files

| Test | Result |
|------|--------|
| 100 mp3 files in `public/audio/listening/` | All present |
| File sizes | 19KB–163KB (appropriate for content length) |
| en-A2-05.mp3 (previously truncated) | Fixed — 52.6KB |
| TTS voices | EN: Neural2-D (male) / Neural2-F (female) alternating |
| TTS voices | JA: Neural2-B (female) / Neural2-D (male) alternating |
| Speaking rates | A1/N5=0.85, A2/N4=0.9, B1/N3=0.95, B2+/N2+=1.0 |

### Listening Component Logic
- 5 questions per level, 3+ correct to pass
- Fisher-Yates shuffle from pool of 10
- Audio plays max 2 times per question
- Questions shown only after first listen
- On audio error: still allows answering (graceful fallback)
- Teal color scheme (distinct from text's orange)

---

## 5. Flow Logic Tests

### "Both" Mode Flow
```
Language Select → Mode Select → Text Assessment → Transition (shows text result)
→ Listening Assessment → Transition (shows text + listening results)
→ Voice Assessment → Results (shows all 3 levels)
```
Flow is correct. Transition screens display accumulated results properly.

### Results Page
- Dynamic grid: 2-col for 2 skills, 3-col for 3 skills
- Skill gap notice compares all available skills (text, listening, voice)
- Save endpoint sends and stores `listeningLevel`

### Scoring Logic
- Text: 5 per level, pass = 3+ correct
- Listening: 5 per level, pass = 3+ correct
- Voice: progressive levels, AI or fallback scoring

---

## 6. Save Assessment API

| Test | Result |
|------|--------|
| Accepts mode `'text'` | Yes |
| Accepts mode `'listening'` | Yes (fixed in v3) |
| Accepts mode `'voice'` | Yes |
| Accepts mode `'both'` | Yes |
| Saves `listeningLevel` | Yes (fixed in v3) |
| DB migration `011_add_listening_level.sql` | Created — needs manual apply |

---

## 7. i18n Completeness

All listening i18n keys present in both `en.json` and `ja.json`:
- `levelCheck.selectMode.listening` / `listeningSub`
- `levelCheck.transition.listeningTitle` / `listeningDesc` / `listeningContinue`
- `listening.play` / `playing` / `replay` / `replaysLeft` / `listenFirst`
- `results.listening`

---

## 8. Resource Links (unchanged)

All 13 resource URLs return 200 OK (except ESOL Courses and The Economist which return 403 due to bot protection — they work in browsers).

---

## Remaining Items

| # | Severity | Description | Action |
|---|----------|-------------|--------|
| 1 | **MEDIUM** | DB migration `011_add_listening_level.sql` not yet applied | Run in Supabase SQL editor |
| 2 | **LOW** | Non-logged-in users get no AI feedback (401 on analyze endpoints) | By design — consider simplified fallback later |

---

## Deployment Status

- Code: Deployed to Cloudflare Pages via `git push origin main`
- Audio files: 100 mp3 included in deploy
- DB: Migration `011_add_listening_level.sql` pending manual apply
