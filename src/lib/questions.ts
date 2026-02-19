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

// ── English (CEFR A1–C1) ── 6 questions per level, 3 randomly selected
export const englishQuestionPool: LevelBlock[] = [
  {
    level: 'A1',
    questions: [
      {
        question: 'Choose the correct word: "She ___ a student."',
        options: ['is', 'are', 'am', 'be'],
        correct: 0,
      },
      {
        question: 'Choose the correct word: "They ___ from Japan."',
        options: ['is', 'am', 'are', 'be'],
        correct: 2,
      },
      {
        question: 'Choose the correct word: "I have two ___."',
        options: ['cat', 'cats', 'a cat', 'the cat'],
        correct: 1,
      },
      {
        question: 'Choose the correct word: "He ___ to school every day."',
        options: ['go', 'goes', 'going', 'gone'],
        correct: 1,
      },
      {
        question: 'Choose the correct word: "This is ___ apple."',
        options: ['a', 'an', 'the', 'some'],
        correct: 1,
      },
      {
        question: 'Choose the correct word: "We ___ happy."',
        options: ['is', 'am', 'are', 'be'],
        correct: 2,
      },
    ],
  },
  {
    level: 'A2',
    questions: [
      {
        question: 'What does "I\'m looking forward to meeting you" mean?',
        options: [
          "I don't want to meet you",
          "I'm excited to meet you",
          'I forgot to meet you',
          "I'm tired of meeting you",
        ],
        correct: 1,
      },
      {
        question: 'Choose the correct word: "Yesterday, I ___ to the store."',
        options: ['go', 'going', 'went', 'gone'],
        correct: 2,
      },
      {
        question: 'Choose the correct word: "She can speak English ___ than her brother."',
        options: ['good', 'better', 'best', 'more good'],
        correct: 1,
      },
      {
        question: 'Choose the correct word: "I ___ never been to Paris."',
        options: ['am', 'have', 'was', 'did'],
        correct: 1,
      },
      {
        question: 'Choose the correct word: "You should ___ more water."',
        options: ['drink', 'drinking', 'drank', 'drunk'],
        correct: 0,
      },
      {
        question: 'Choose the correct word: "She was cooking ___ the phone rang."',
        options: ['while', 'during', 'when', 'since'],
        correct: 2,
      },
    ],
  },
  {
    level: 'B1',
    questions: [
      // Fixed: was third conditional (B2), now second conditional (B1-appropriate)
      {
        question: 'Choose the correct sentence:',
        options: [
          'If I would win the lottery, I would buy a house.',
          'If I won the lottery, I would buy a house.',
          'If I win the lottery, I would bought a house.',
          'If I winning the lottery, I would buy a house.',
        ],
        correct: 1,
      },
      {
        question: 'Choose the correct word: "By the time we arrived, the movie ___."',
        options: [
          'already started',
          'had already started',
          'has already started',
          'is starting',
        ],
        correct: 1,
      },
      {
        question: 'Choose the correct word: "I wish I ___ more time to travel."',
        options: ['have', 'had', 'will have', 'having'],
        correct: 1,
      },
      {
        question: 'Choose the correct word: "She asked me ___ I had been to London."',
        options: ['that', 'what', 'if', 'how'],
        correct: 2,
      },
      {
        question: 'Choose the correct word: "He ___ studying English for three years."',
        options: ['is', 'has been', 'was', 'have been'],
        correct: 1,
      },
      {
        question: 'Choose the correct word: "If it rains tomorrow, we ___ stay home."',
        options: ['would', 'will', 'did', 'are'],
        correct: 1,
      },
    ],
  },
  {
    level: 'B2',
    questions: [
      {
        question: '"He tends to beat around the bush." This means he:',
        options: [
          'Likes gardening',
          'Avoids saying things directly',
          'Is very honest',
          'Speaks too quickly',
        ],
        correct: 1,
      },
      {
        question:
          'Choose the correct form: "Not only ___ the project on time, but she also won an award."',
        options: [
          'she completed',
          'did she complete',
          'she has completed',
          'she completing',
        ],
        correct: 1,
      },
      {
        question:
          'Choose the correct word: "Had I known about the delay, I ___ an earlier flight."',
        options: [
          'would book',
          'would have booked',
          'will book',
          'had booked',
        ],
        correct: 1,
      },
      {
        question: '"She let the cat out of the bag." This means she:',
        options: [
          'Released a pet',
          'Revealed a secret',
          'Made a mistake at work',
          'Forgot something important',
        ],
        correct: 1,
      },
      {
        question:
          'Choose the correct word: "The report ___ by the time the meeting starts."',
        options: [
          'will finish',
          'will have been finished',
          'is finishing',
          'has finished',
        ],
        correct: 1,
      },
      {
        question:
          'Choose the correct word: "Were it not for your help, I ___ the deadline."',
        options: [
          'would miss',
          'would have missed',
          'will miss',
          'had missed',
        ],
        correct: 1,
      },
    ],
  },
  {
    level: 'C1',
    questions: [
      {
        question:
          'Choose the correct word: "The proposal, ___ merits are questionable, was nonetheless approved."',
        options: ['who', 'whose', 'which', 'that'],
        correct: 1,
      },
      {
        question:
          'Choose the correct word: "Scarcely had he arrived ___ the meeting began."',
        options: ['when', 'than', 'that', 'then'],
        correct: 0,
      },
      {
        question:
          'Choose the correct word: "So pervasive is the influence of media ___ it shapes public opinion unconsciously."',
        options: ['that', 'which', 'what', 'where'],
        correct: 0,
      },
      {
        question:
          'Choose the correct word: "No sooner had the announcement been made ___ the crowd erupted."',
        options: ['when', 'than', 'that', 'before'],
        correct: 1,
      },
      {
        question:
          'Choose the correct word: "It is imperative that she ___ present at the hearing."',
        options: ['is', 'be', 'was', 'will be'],
        correct: 1,
      },
      {
        question:
          'Choose the correct word: "The extent ___ this policy has failed is remarkable."',
        options: ['to which', 'in that', 'for what', 'by where'],
        correct: 0,
      },
    ],
  },
];

// ── Japanese (JLPT N5–N1) ── 6 questions per level, 3 randomly selected
export const japaneseQuestionPool: LevelBlock[] = [
  {
    level: 'N5',
    questions: [
      {
        question: '「わたしは まいにち がっこう___いきます。」',
        options: ['を', 'に', 'で', 'が'],
        correct: 1,
      },
      {
        question: '「きのう ともだちと えいがを ___。」',
        options: ['みます', 'みません', 'みました', 'みて'],
        correct: 2,
      },
      {
        question: '「この りんごは ___ おいしいです。」',
        options: ['とても', 'あまり', 'ぜんぜん', 'たくさん'],
        correct: 0,
      },
      {
        question: '「わたしは コーヒー___ のみます。」',
        options: ['が', 'を', 'に', 'で'],
        correct: 1,
      },
      {
        question: '「あした ともだち___ あいます。」',
        options: ['を', 'が', 'に', 'で'],
        correct: 2,
      },
      {
        question: '「テーブルの うえ___ ほんが あります。」',
        options: ['で', 'を', 'が', 'に'],
        correct: 3,
      },
    ],
  },
  {
    level: 'N4',
    questions: [
      {
        question: '「しゅくだいを ___から、あそびに いきます。」',
        options: ['して', 'した', 'する', 'します'],
        correct: 0,
      },
      {
        question: '「この かんじが ___か。」',
        options: ['よむ', 'よめます', 'よみたい', 'よんだ'],
        correct: 1,
      },
      {
        question: '「母に プレゼントを ___もらいました。」',
        options: ['かって', 'かいて', 'かった', 'かう'],
        correct: 0,
      },
      {
        question: '「あめが ふっている___、でかけましょう。」',
        options: ['けど', 'から', 'ので', 'し'],
        correct: 0,
      },
      {
        question: '「先生に ほめ___うれしかったです。」',
        options: ['られて', 'させて', 'れて', 'して'],
        correct: 0,
      },
      {
        question: '「このケーキは おいしそう___。」',
        options: ['です', 'だ', 'な', 'に'],
        correct: 0,
      },
    ],
  },
  {
    level: 'N3',
    questions: [
      {
        question: '「レポートは 金曜日___出してください。」',
        options: ['まで', 'までに', 'ごろ', 'ぐらい'],
        correct: 1,
      },
      {
        question: '「彼女は うれしそう___笑った。」',
        options: ['な', 'に', 'で', 'と'],
        correct: 1,
      },
      {
        question: '「説明書を 読んだ___、使い方が わからない。」',
        options: ['のに', 'ので', 'ために', 'ところ'],
        correct: 0,
      },
      {
        question: '「天気予報___、明日は雨だそうです。」',
        options: ['にとって', 'によると', 'として', 'に対して'],
        correct: 1,
      },
      {
        question: '「忙しいからといって、健康を 無視する___。」',
        options: ['べきではない', 'べきだ', 'はずだ', 'わけだ'],
        correct: 0,
      },
      {
        question: '「電車が 遅れた___、会議に 間に合わなかった。」',
        options: ['せいで', 'おかげで', 'ために', 'くせに'],
        correct: 0,
      },
    ],
  },
  {
    level: 'N2',
    questions: [
      {
        question: '「日本語を 3年 勉強した___、まだ 上手に 話せない。」',
        options: ['ものの', 'ものだ', 'ものか', 'ものを'],
        correct: 0,
      },
      {
        question: '「終電が なくなったので、歩いて 帰る___。」',
        options: ['しかない', 'つもりだ', 'ようにする', 'ことにした'],
        correct: 0,
      },
      {
        question:
          '「明日は 大事な 試験だから、勉強___わけにはいかない。」',
        options: ['する', 'した', 'しない', 'している'],
        correct: 2,
      },
      {
        question: '「この問題は 難しい___、時間が かかった。」',
        options: ['だけあって', 'にしては', 'わりに', 'くせに'],
        correct: 0,
      },
      {
        question: '「彼は プロの 音楽家___、演奏が すばらしい。」',
        options: ['だけあって', 'にしては', 'としても', 'ことから'],
        correct: 0,
      },
      {
        question: '「いくら 頼んでも、彼は 首を 縦に ___。」',
        options: ['ふらない', 'ふらなかった', 'ふった', 'ふる'],
        correct: 1,
      },
    ],
  },
  {
    level: 'N1',
    questions: [
      {
        question:
          '「この プロジェクトの 成功は、チーム全員の 協力の___だ。」',
        options: ['たまもの', 'せい', 'くせ', 'すえ'],
        correct: 0,
      },
      {
        question: '「本日___、応募を 締め切らせていただきます。」',
        options: ['をもって', 'において', 'にわたって', 'にかけて'],
        correct: 0,
      },
      {
        question: '「部長___、責任も 大きくなる。」',
        options: ['ともなると', 'にしては', 'としても', 'ことから'],
        correct: 0,
      },
      {
        question: '「結果は ともかく___、努力した ことに 意味がある。」',
        options: ['として', 'にせよ', 'からして', 'ながらも'],
        correct: 0,
      },
      {
        question: '「彼女は 社長で ある___、一人の 母親でもある。」',
        options: ['と同時に', 'にもかかわらず', 'がゆえに', 'をもって'],
        correct: 0,
      },
      {
        question: '「この法律は 全国民に 例外___適用される。」',
        options: ['なく', 'なしに', 'もなく', 'もなしに'],
        correct: 0,
      },
    ],
  },
];

export const QUESTIONS_PER_LEVEL = 3;
export const PASS_THRESHOLD = 2;
