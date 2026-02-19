import { useState } from 'react';
import { useTranslation } from '../i18n/index';

interface Props {
  language: 'english' | 'japanese';
  onComplete: (level: string) => void;
  onBack: () => void;
  onFeedback?: (feedback: any) => void;
}

interface Question {
  question: string;
  options: string[];
  correct: number | number[];
}

interface LevelBlock {
  level: string;
  questions: Question[];
}

// ── English (CEFR A1–C1) ── 3 questions per level, all unambiguous
const englishLevels: LevelBlock[] = [
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
    ],
  },
  {
    level: 'B1',
    questions: [
      {
        question: 'Choose the correct sentence:',
        options: [
          'If I would have known, I would have come.',
          'If I had known, I would have come.',
          'If I knew, I would have came.',
          'If I know, I would come.',
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
    ],
  },
];

// ── Japanese (JLPT N5–N1) ── 3 questions per level, all unambiguous
const japaneseLevels: LevelBlock[] = [
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
    ],
  },
];

const PASS_THRESHOLD = 2; // 3問中2問正解でレベル通過

export default function TextAssessment({
  language,
  onComplete,
  onBack,
  onFeedback,
}: Props) {
  const { t } = useTranslation();
  const levels = language === 'english' ? englishLevels : japaneseLevels;
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [levelCorrect, setLevelCorrect] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [allAnswers, setAllAnswers] = useState<
    { level: string; correct: boolean }[]
  >([]);

  const currentLevel = levels[currentLevelIndex];
  const currentQuestion = currentLevel.questions[currentQuestionIndex];
  const totalQuestions = levels.reduce(
    (sum, l) => sum + l.questions.length,
    0,
  );
  const answeredSoFar =
    levels
      .slice(0, currentLevelIndex)
      .reduce((sum, l) => sum + l.questions.length, 0) + currentQuestionIndex;

  const checkCorrect = (
    selected: number,
    correct: number | number[],
  ): boolean => {
    if (Array.isArray(correct)) return correct.includes(selected);
    return selected === correct;
  };

  const handleSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const sendFeedbackRequest = (
    level: string,
    answers: { level: string; correct: boolean }[],
  ) => {
    fetch('/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, level, answers }),
    })
      .then((res) => res.json())
      .then((data) => onFeedback?.(data))
      .catch(() => {});
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const correct = checkCorrect(selectedOption, currentQuestion.correct);
    const newAnswer = { level: currentLevel.level, correct };
    const updatedAnswers = [...allAnswers, newAnswer];
    setAllAnswers(updatedAnswers);

    const newLevelCorrect = correct ? levelCorrect + 1 : levelCorrect;

    if (currentQuestionIndex < currentLevel.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setLevelCorrect(newLevelCorrect);
      setSelectedOption(null);
      return;
    }

    const passed = newLevelCorrect >= PASS_THRESHOLD;

    if (!passed) {
      const level =
        currentLevelIndex === 0
          ? language === 'english'
            ? 'Below A1'
            : 'Below N5'
          : levels[currentLevelIndex - 1].level;
      sendFeedbackRequest(level, updatedAnswers);
      onComplete(level);
      return;
    }

    if (currentLevelIndex === levels.length - 1) {
      sendFeedbackRequest(currentLevel.level, updatedAnswers);
      onComplete(currentLevel.level);
      return;
    }

    setCurrentLevelIndex(currentLevelIndex + 1);
    setCurrentQuestionIndex(0);
    setLevelCorrect(0);
    setSelectedOption(null);
  };

  const isLastQuestion =
    currentLevelIndex === levels.length - 1 &&
    currentQuestionIndex === currentLevel.questions.length - 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-800 transition-colors"
        >
          {t('levelCheck.back')}
        </button>
        <span className="text-sm text-gray-500">
          {currentLevel.level} — {currentQuestionIndex + 1} /{' '}
          {currentLevel.questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((answeredSoFar + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* Level indicator */}
      <div className="text-center mb-4">
        <span className="inline-block px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-sm text-gray-700">
          {t('levelCheck.level')} {currentLevel.level}
        </span>
      </div>

      {/* Question */}
      <h3 className="text-xl font-medium text-center mb-8">
        {currentQuestion.question}
      </h3>

      {/* Options */}
      <div className="space-y-3 max-w-lg mx-auto mb-8">
        {currentQuestion.options.map((option, index) => (
          <button
            key={`${currentLevelIndex}-${currentQuestionIndex}-${index}`}
            onClick={() => handleSelect(index)}
            className={`w-full px-6 py-4 rounded-xl text-left transition-all ${
              selectedOption === index
                ? 'bg-orange-50 border-2 border-orange-500'
                : 'bg-white border-2 border-gray-200 hover:bg-orange-50'
            }`}
          >
            <span className="inline-block w-8 h-8 rounded-full bg-gray-100 text-center leading-8 mr-3">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </button>
        ))}
      </div>

      {/* Next button */}
      <div className="text-center">
        <button
          onClick={handleNext}
          disabled={selectedOption === null}
          className={`px-8 py-3 rounded-full font-medium transition-all ${
            selectedOption !== null
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLastQuestion ? t('levelCheck.finish') : t('levelCheck.next')}
        </button>
      </div>
    </div>
  );
}
