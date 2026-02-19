# Level Check Test Report (2026-02-19)

## 1. Page Load

| Test | Result |
|------|--------|
| `/` top page | 200 OK |
| `/level-check` page | 200 OK |
| Language selection UI (JA/EN) | Renders correctly |
| Navigation | Working |

---

## 2. API Tests (5 runs each, EN + JA)

All 10 calls to `/api/analyze-text` returned **`401 Unauthorized`**.

The endpoint checks `locals.user` (login required) at `src/pages/api/analyze-text.ts:6`.

**Issue**: The text assessment itself runs client-side, but **AI feedback (studyTips, focusAreas, etc.) is unavailable for non-logged-in users**. The frontend (`TextAssessment.tsx:75-82`) silently catches the error (`.catch(() => {})`), so **no crash occurs**, but the results screen shows no feedback.

---

## 3. Question Correctness (100 questions total)

| Language | Level | Questions | Result |
|----------|-------|-----------|--------|
| English | A1 | 10 | All correct |
| English | A2 | 10 | All correct |
| English | B1 | 10 | All correct |
| English | B2 | 10 | All correct |
| English | **C1** | 10 | **1 issue found** |
| Japanese | N5 | 10 | All correct |
| Japanese | N4 | 10 | All correct |
| Japanese | N3 | 10 | All correct |
| Japanese | N2 | 10 | All correct |
| Japanese | N1 | 10 | All correct |

### Issue: C1 Q4 (`questions.ts:134`)

```
Q: "___ the severe weather, the event proceeded as planned."
Options: ['Despite', 'Notwithstanding', 'Although', 'However']
Marked correct: Notwithstanding (index 1)
```

**Both "Despite" and "Notwithstanding" are grammatically correct and semantically equivalent here.** A learner selecting "Despite" would be unfairly marked wrong.

**Fix options:**
- Change `correct: 1` to `correct: [0, 1]` to accept both answers
- Or replace "Despite" with "Nevertheless" (which is an adverb and wouldn't work grammatically here, making it clearly wrong)

---

## 4. Resource Links

| URL | Status |
|-----|--------|
| VOA Learning English - Beginning | 200 OK |
| ESOL Courses | 403 (bot protection, works in browser) |
| VOA Learning English | 200 OK |
| ER Central | 200 OK |
| TED-Ed | 200 OK |
| BBC Learning English | 200 OK |
| The Economist | 403 (bot protection, works in browser) |
| NPR Podcasts | 200 OK |
| Tadoku Free Books | 200 OK |
| Yomujp | 200 OK |
| NHK NEWS WEB EASY | 200 OK |
| NHK NEWS | 200 OK |
| Aozora Bunko | 200 OK |

All links functional (403s are bot protection only, browser access works fine).

---

## 5. Scoring Logic (Code Review)

- 5 questions per level, 3+ correct to pass -> advance to next level
- On fail: assign previous level (fail A1/N5 -> "Starter")
- Fisher-Yates shuffle selects 5 from pool of 10 -> correct
- `checkCorrect` handles both `number` and `number[]` -> correct
- Level progression: A1->A2->B1->B2->C1 (EN), N5->N4->N3->N2->N1 (JA) -> correct

---

## Summary of Issues Found

| # | Severity | Description | File | Line |
|---|----------|-------------|------|------|
| 1 | **High** | C1 Q4: "Despite" and "Notwithstanding" both correct, only one accepted | `src/lib/questions.ts` | 134 |
| 2 | **Medium** | Non-logged-in users get no AI feedback after assessment (401 from `/api/analyze-text`) — no crash but poor UX | `src/pages/api/analyze-text.ts` | 6 |
| 3 | **Low** | `/api/analyze-voice` likely has same auth issue for voice assessment feedback | `src/pages/api/analyze-voice.ts` | - |
