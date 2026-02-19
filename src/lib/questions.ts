export interface Question {
  question: string;
  options: string[];
  correct: number | number[];
}

export interface LevelBlock {
  level: string;
  questions: Question[];
}

// Fisher-Yates shuffle + pick N
export function selectQuestions(pool: Question[], count: number): Question[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// ── English (CEFR A1–C1) ── 10 questions per level, 3 randomly selected
export const englishQuestionPool: LevelBlock[] = [
  {
    level: 'A1',
    questions: [
      // be verb
      { question: 'Choose the correct word: "She ___ a student."', options: ['is', 'are', 'am', 'be'], correct: 0 },
      // plural
      { question: 'Choose the correct word: "I have two ___."', options: ['cat', 'cats', 'a cat', 'the cat'], correct: 1 },
      // 3rd person -s
      { question: 'Choose the correct word: "He ___ to school every day."', options: ['go', 'goes', 'going', 'gone'], correct: 1 },
      // article
      { question: 'Choose the correct word: "This is ___ apple."', options: ['a', 'an', 'the', 'some'], correct: 1 },
      // possessive
      { question: 'Choose the correct word: "That is ___ book."', options: ['she', 'her', 'hers', 'herself'], correct: 1 },
      // preposition
      { question: 'Choose the correct word: "The cat is ___ the table."', options: ['in', 'on', 'at', 'to'], correct: 1 },
      // question word
      { question: 'Choose the correct word: "___ is your name?"', options: ['Who', 'What', 'Where', 'When'], correct: 1 },
      // can
      { question: 'Choose the correct word: "She ___ swim very well."', options: ['can', 'cans', 'is can', 'do can'], correct: 0 },
      // there is/are
      { question: 'Choose the correct word: "There ___ three books on the desk."', options: ['is', 'are', 'has', 'have'], correct: 1 },
      // demonstrative
      { question: 'Choose the correct word: "___ shoes over there are mine."', options: ['This', 'That', 'These', 'Those'], correct: 3 },
    ],
  },
  {
    level: 'A2',
    questions: [
      // past simple
      { question: 'Choose the correct word: "Yesterday, I ___ to the store."', options: ['go', 'going', 'went', 'gone'], correct: 2 },
      // comparative
      { question: 'Choose the correct word: "She can speak English ___ than her brother."', options: ['good', 'better', 'best', 'more good'], correct: 1 },
      // present perfect
      { question: 'Choose the correct word: "I ___ never been to Paris."', options: ['am', 'have', 'was', 'did'], correct: 1 },
      // modal (should)
      { question: 'Choose the correct word: "You should ___ more water."', options: ['drink', 'drinking', 'drank', 'drunk'], correct: 0 },
      // time clause
      { question: 'Choose the correct word: "She was cooking ___ the phone rang."', options: ['while', 'during', 'when', 'since'], correct: 2 },
      // countable/uncountable
      { question: 'Choose the correct word: "How ___ sugar do you want?"', options: ['many', 'much', 'few', 'several'], correct: 1 },
      // going to
      { question: 'Choose the correct word: "We ___ going to visit London next week."', options: ['is', 'are', 'was', 'been'], correct: 1 },
      // past continuous
      { question: 'Choose the correct word: "I ___ watching TV when you called."', options: ['am', 'is', 'was', 'were'], correct: 2 },
      // adverb of frequency
      { question: 'Choose the correct word: "She ___ eats breakfast before work."', options: ['always', 'ever', 'yet', 'already'], correct: 0 },
      // phrasal expression
      { question: 'What does "I\'m looking forward to meeting you" mean?', options: ["I don't want to meet you", "I'm excited to meet you", 'I forgot to meet you', "I'm tired of meeting you"], correct: 1 },
    ],
  },
  {
    level: 'B1',
    questions: [
      // second conditional
      { question: 'Choose the correct sentence:', options: ['If I would win the lottery, I would buy a house.', 'If I won the lottery, I would buy a house.', 'If I win the lottery, I would bought a house.', 'If I winning the lottery, I would buy a house.'], correct: 1 },
      // past perfect
      { question: 'Choose the correct word: "By the time we arrived, the movie ___."', options: ['already started', 'had already started', 'has already started', 'is starting'], correct: 1 },
      // wish + past
      { question: 'Choose the correct word: "I wish I ___ more time to travel."', options: ['have', 'had', 'will have', 'having'], correct: 1 },
      // reported speech
      { question: 'Choose the correct word: "She asked me ___ I had been to London."', options: ['that', 'what', 'if', 'how'], correct: 2 },
      // present perfect continuous
      { question: 'Choose the correct word: "He ___ studying English for three years."', options: ['is', 'has been', 'was', 'have been'], correct: 1 },
      // passive voice
      { question: 'Choose the correct word: "The bridge ___ built in 1990."', options: ['is', 'was', 'has', 'had'], correct: 1 },
      // relative clause
      { question: 'Choose the correct word: "The woman ___ lives next door is a doctor."', options: ['who', 'which', 'what', 'whom'], correct: 0 },
      // used to
      { question: 'Choose the correct word: "I ___ play tennis every weekend, but now I don\'t."', options: ['use to', 'used to', 'was used to', 'am used to'], correct: 1 },
      // first conditional
      { question: 'Choose the correct word: "If it rains tomorrow, we ___ stay home."', options: ['would', 'will', 'did', 'are'], correct: 1 },
      // gerund vs infinitive
      { question: 'Choose the correct word: "She enjoys ___ in the park."', options: ['run', 'running', 'to run', 'ran'], correct: 1 },
    ],
  },
  {
    level: 'B2',
    questions: [
      // idiom
      { question: '"He tends to beat around the bush." This means he:', options: ['Likes gardening', 'Avoids saying things directly', 'Is very honest', 'Speaks too quickly'], correct: 1 },
      // inversion (Not only)
      { question: 'Choose the correct form: "Not only ___ the project on time, but she also won an award."', options: ['she completed', 'did she complete', 'she has completed', 'she completing'], correct: 1 },
      // third conditional
      { question: 'Choose the correct word: "Had I known about the delay, I ___ an earlier flight."', options: ['would book', 'would have booked', 'will book', 'had booked'], correct: 1 },
      // future perfect
      { question: 'Choose the correct word: "By next year, she ___ here for a decade."', options: ['works', 'will work', 'will have worked', 'has worked'], correct: 2 },
      // participle clause
      { question: 'Choose the correct word: "___ the instructions carefully, he assembled the furniture."', options: ['Having read', 'Have read', 'Had read', 'Being read'], correct: 0 },
      // wish + past perfect (regret)
      { question: 'Choose the correct word: "I wish I ___ harder for the exam."', options: ['study', 'studied', 'had studied', 'would study'], correct: 2 },
      // cleft sentence
      { question: 'Choose the correct word: "It was Maria ___ solved the problem, not John."', options: ['who', 'which', 'whom', 'what'], correct: 0 },
      // mixed conditional
      { question: 'Choose the correct word: "If she had taken that job, she ___ in London now."', options: ['will be living', 'would be living', 'is living', 'had been living'], correct: 1 },
      // phrasal verb
      { question: '"She came up with a great idea." "Came up with" means:', options: ['rejected', 'discovered by accident', 'thought of', 'forgot about'], correct: 2 },
      // idiom
      { question: '"She let the cat out of the bag." This means she:', options: ['Released a pet', 'Revealed a secret', 'Made a mistake at work', 'Forgot something important'], correct: 1 },
    ],
  },
  {
    level: 'C1',
    questions: [
      // inversion (Scarcely...when)
      { question: 'Choose the correct word: "Scarcely had he arrived ___ the meeting began."', options: ['when', 'than', 'that', 'then'], correct: 0 },
      // relative clause (whose)
      { question: 'Choose the correct word: "The proposal, ___ merits are questionable, was nonetheless approved."', options: ['who', 'whose', 'which', 'that'], correct: 1 },
      // subjunctive
      { question: 'Choose the correct word: "It is imperative that she ___ present at the hearing."', options: ['is', 'be', 'was', 'will be'], correct: 1 },
      // advanced connector
      { question: 'Choose the correct word: "___ the severe weather, the event proceeded as planned."', options: ['Despite', 'Notwithstanding', 'Although', 'However'], correct: [0, 1] },
      // cleft emphasis
      { question: 'Choose the correct word: "What ___ me most was her determination."', options: ['impressed', 'impressing', 'was impressed', 'to impress'], correct: 0 },
      // complex passive
      { question: 'Choose the correct word: "The suspect is believed ___ the country last week."', options: ['to leave', 'to have left', 'leaving', 'having left'], correct: 1 },
      // nominalization
      { question: 'Choose the best paraphrase: "The committee decided to postpone the vote."', options: ['The postponement of the vote was decided by the committee.', 'The committee postponed deciding the vote.', 'The vote decided to postpone the committee.', 'Postponing the committee was the vote\'s decision.'], correct: 0 },
      // register/formality
      { question: 'Which sentence is most appropriate for a formal report?', options: ['Lots of people showed up to the meeting.', 'A significant number of attendees were present.', 'Tons of folks came to the meeting.', 'So many people came it was crazy.'], correct: 1 },
      // ellipsis
      { question: 'Choose the correct word: "She could have warned us, but she chose not ___."', options: ['to', 'to do', 'doing', 'done'], correct: 0 },
      // inversion (No sooner...than)
      { question: 'Choose the correct word: "No sooner had the announcement been made ___ the crowd erupted."', options: ['when', 'than', 'that', 'before'], correct: 1 },
    ],
  },
];

// ── Japanese (JLPT N5–N1) ── 10 questions per level, 3 randomly selected
export const japaneseQuestionPool: LevelBlock[] = [
  {
    level: 'N5',
    questions: [
      // 助詞 に (direction)
      { question: '「わたしは まいにち がっこう___いきます。」', options: ['を', 'に', 'で', 'が'], correct: 1 },
      // 過去形
      { question: '「きのう ともだちと えいがを ___。」', options: ['みます', 'みません', 'みました', 'みて'], correct: 2 },
      // 副詞
      { question: '「この りんごは ___ おいしいです。」', options: ['とても', 'あまり', 'ぜんぜん', 'たくさん'], correct: 0 },
      // 助詞 を (object)
      { question: '「わたしは コーヒー___ のみます。」', options: ['が', 'を', 'に', 'で'], correct: 1 },
      // 助詞 に (person)
      { question: '「あした ともだち___ あいます。」', options: ['を', 'が', 'に', 'で'], correct: 2 },
      // 存在文
      { question: '「テーブルの うえ___ ほんが あります。」', options: ['で', 'を', 'が', 'に'], correct: 3 },
      // い形容詞
      { question: '「きょうは ___ないです。」', options: ['さむい', 'さむく', 'さむ', 'さむくて'], correct: 1 },
      // たい形
      { question: '「わたしは にほんに ___たいです。」', options: ['いく', 'いき', 'いって', 'いか'], correct: 1 },
      // 助詞 で (place of action)
      { question: '「としょかん___ べんきょうします。」', options: ['に', 'を', 'で', 'が'], correct: 2 },
      // 疑問詞
      { question: '「あなたの くに___ どこですか。」', options: ['が', 'は', 'を', 'に'], correct: 1 },
    ],
  },
  {
    level: 'N4',
    questions: [
      // て形接続
      { question: '「しゅくだいを ___から、あそびに いきます。」', options: ['して', 'した', 'する', 'します'], correct: 0 },
      // 可能形
      { question: '「この かんじが ___か。」', options: ['よむ', 'よめます', 'よみたい', 'よんだ'], correct: 1 },
      // てもらう
      { question: '「母に プレゼントを ___もらいました。」', options: ['かって', 'かいて', 'かった', 'かう'], correct: 0 },
      // 逆接 (けど)
      { question: '「あめが ふっている___、でかけましょう。」', options: ['けど', 'から', 'ので', 'し'], correct: 0 },
      // 受身形
      { question: '「先生に ほめ___うれしかったです。」', options: ['られて', 'させて', 'れて', 'して'], correct: 0 },
      // そう (appearance)
      { question: '「このケーキは おいしそう___。」', options: ['です', 'だ', 'な', 'に'], correct: 0 },
      // 条件 (たら)
      { question: '「あした 天気が よかっ___、ピクニックに いきましょう。」', options: ['たら', 'ても', 'ので', 'から'], correct: 0 },
      // ている (state)
      { question: '「まどが ___います。」', options: ['あけて', 'あいて', 'あける', 'あく'], correct: 1 },
      // ようにする
      { question: '「まいにち やさいを 食べる___しています。」', options: ['ように', 'ために', 'ことに', 'ほうに'], correct: 0 },
      // 使役
      { question: '「先生は 学生___ 発表させました。」', options: ['を', 'が', 'に', 'で'], correct: 2 },
    ],
  },
  {
    level: 'N3',
    questions: [
      // までに (deadline)
      { question: '「レポートは 金曜日___出してください。」', options: ['まで', 'までに', 'ごろ', 'ぐらい'], correct: 1 },
      // そうに (appearance adverb)
      { question: '「彼女は うれしそう___笑った。」', options: ['な', 'に', 'で', 'と'], correct: 1 },
      // のに (despite)
      { question: '「説明書を 読んだ___、使い方が わからない。」', options: ['のに', 'ので', 'ために', 'ところ'], correct: 0 },
      // によると (according to)
      { question: '「天気予報___、明日は雨だそうです。」', options: ['にとって', 'によると', 'として', 'に対して'], correct: 1 },
      // べき (should)
      { question: '「忙しいからといって、健康を 無視する___。」', options: ['べきではない', 'べきだ', 'はずだ', 'わけだ'], correct: 0 },
      // せいで (blame)
      { question: '「電車が 遅れた___、会議に 間に合わなかった。」', options: ['せいで', 'おかげで', 'ために', 'くせに'], correct: 0 },
      // ようになる (change)
      { question: '「日本語が 少し 話せる___なりました。」', options: ['ように', 'ことに', 'ために', 'みたいに'], correct: 0 },
      // ことがある (experience)
      { question: '「富士山に 登った___があります。」', options: ['もの', 'こと', 'ところ', 'はず'], correct: 1 },
      // ば conditional
      { question: '「もう少し 安けれ___、買うのに。」', options: ['ば', 'たら', 'なら', 'と'], correct: 0 },
      // passive with feelings
      { question: '「急に 雨に ___、かさがなくて こまりました。」', options: ['ふって', 'ふられて', 'ふらせて', 'ふれて'], correct: 1 },
    ],
  },
  {
    level: 'N2',
    questions: [
      // ものの (although)
      { question: '「日本語を 3年 勉強した___、まだ 上手に 話せない。」', options: ['ものの', 'ものだ', 'ものか', 'ものを'], correct: 0 },
      // しかない (no choice)
      { question: '「終電が なくなったので、歩いて 帰る___。」', options: ['しかない', 'つもりだ', 'ようにする', 'ことにした'], correct: 0 },
      // わけにはいかない (can't afford to)
      { question: '「明日は 大事な 試験だから、勉強___わけにはいかない。」', options: ['する', 'した', 'しない', 'している'], correct: 2 },
      // だけあって (as expected)
      { question: '「彼は プロの 音楽家___、演奏が すばらしい。」', options: ['だけあって', 'にしては', 'としても', 'ことから'], correct: 0 },
      // 一方で (on the other hand)
      { question: '「都会は 便利な___、家賃が 高い。」', options: ['一方で', 'ところで', 'せいで', 'うちに'], correct: 0 },
      // うちに (while)
      { question: '「温かい___、食べてください。」', options: ['うちに', 'あいだ', 'ところに', 'ばかりに'], correct: 0 },
      // っぽい (tendency)
      { question: '「彼は すぐ 怒る。___っぽい ところがある。」', options: ['おこり', 'おこれ', 'おこら', 'おこる'], correct: 0 },
      // に関して (regarding)
      { question: '「この 問題___、もう少し 調べる 必要がある。」', options: ['に関して', 'にとって', 'によって', 'にかけて'], correct: 0 },
      // ことから (because/from the fact)
      { question: '「形が 星に 似ている___、この花は「星草」と 呼ばれている。」', options: ['ことから', 'ことに', 'ものから', 'ところから'], correct: 0 },
      // ぎみ (slightly/tendency)
      { question: '「最近 少し 太り___で、運動を 始めました。」', options: ['ぎみ', 'がち', 'っぽい', 'げ'], correct: 0 },
    ],
  },
  {
    level: 'N1',
    questions: [
      // たまもの (result of)
      { question: '「この プロジェクトの 成功は、チーム全員の 協力の___だ。」', options: ['たまもの', 'せい', 'くせ', 'すえ'], correct: 0 },
      // をもって (as of)
      { question: '「本日___、応募を 締め切らせていただきます。」', options: ['をもって', 'において', 'にわたって', 'にかけて'], correct: 0 },
      // ともなると (when it comes to)
      { question: '「部長___、責任も 大きくなる。」', options: ['ともなると', 'にしては', 'としても', 'ことから'], correct: 0 },
      // と同時に (at the same time as)
      { question: '「彼女は 社長で ある___、一人の 母親でもある。」', options: ['と同時に', 'にもかかわらず', 'がゆえに', 'をもって'], correct: 0 },
      // なく/なしに (without exception)
      { question: '「この法律は 全国民に 例外___適用される。」', options: ['なく', 'なしに', 'もなく', 'もなしに'], correct: 0 },
      // ずにはいられない (can't help but)
      { question: '「その映画を見たら、泣か___。」', options: ['ずにはいられない', 'ないではおかない', 'ざるをえない', 'ないことはない'], correct: 0 },
      // にほかならない (nothing but)
      { question: '「彼の成功は、努力の結果___。」', options: ['にほかならない', 'にすぎない', 'にかぎらない', 'にちがいない'], correct: 0 },
      // をよそに (ignoring)
      { question: '「周囲の心配___、彼は一人で山に向かった。」', options: ['をよそに', 'をもとに', 'をめぐって', 'をこめて'], correct: 0 },
      // いかんによらず (regardless of)
      { question: '「理由の___、暴力は許されない。」', options: ['いかんによらず', 'いかんでは', 'いかんにより', 'いかんとも'], correct: 0 },
      // ならでは (unique to)
      { question: '「この味は、京都___のものだ。」', options: ['ならでは', 'ばかり', 'だけ', 'こそ'], correct: 0 },
    ],
  },
];

export const QUESTIONS_PER_LEVEL = 5;
export const PASS_THRESHOLD = 3;
