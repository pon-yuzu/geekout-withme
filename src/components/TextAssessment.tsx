import { useState } from 'react';

interface Props {
  language: 'english' | 'japanese';
  onComplete: (level: string) => void;
  onBack: () => void;
}

interface Question {
  level: string;
  question: string;
  options: string[];
  correct: number;
}

const englishQuestions: Question[] = [
  {
    level: 'A1',
    question: 'Choose the correct word: "She ___ a student."',
    options: ['is', 'are', 'am', 'be'],
    correct: 0,
  },
  {
    level: 'A2',
    question: 'What does "I\'m looking forward to meeting you" mean?',
    options: [
      'I don\'t want to meet you',
      'I\'m excited to meet you',
      'I forgot to meet you',
      'I\'m tired of meeting you',
    ],
    correct: 1,
  },
  {
    level: 'B1',
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
    level: 'B2',
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
    level: 'C1',
    question: 'Which sentence uses the subjunctive mood correctly?',
    options: [
      'I wish I was taller.',
      'I wish I were taller.',
      'I wish I am taller.',
      'I wish I being taller.',
    ],
    correct: 1,
  },
];

const japaneseQuestions: Question[] = [
  {
    level: 'N5',
    question: '「わたしは がくせい ___。」正しいものを選んでください。',
    options: ['だ', 'です', 'ます', 'いる'],
    correct: 1,
  },
  {
    level: 'N4',
    question: '「映画を見た___、レストランに行きました。」',
    options: ['あとで', 'まえに', 'ながら', 'ために'],
    correct: 0,
  },
  {
    level: 'N3',
    question: '「彼は忙しい___、いつも手伝ってくれる。」',
    options: ['のに', 'ので', 'から', 'けど'],
    correct: 0,
  },
  {
    level: 'N2',
    question: '「この問題は難しい___、誰も解けなかった。」',
    options: ['あまり', 'ほど', 'くらい', 'だけ'],
    correct: 0,
  },
  {
    level: 'N1',
    question: '「彼の成功は努力の___だ。」',
    options: ['たまもの', 'おかげ', 'せい', 'ゆえ'],
    correct: 0,
  },
];

export default function TextAssessment({ language, onComplete, onBack }: Props) {
  const questions = language === 'english' ? englishQuestions : japaneseQuestions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const currentQuestion = questions[currentIndex];

  const handleSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    // Check if answer is wrong - stop at current level
    if (selectedOption !== currentQuestion.correct) {
      // Calculate level based on where they stopped
      const level = currentIndex === 0 
        ? (language === 'english' ? 'Below A1' : 'Below N5')
        : questions[currentIndex - 1].level;
      onComplete(level);
      return;
    }

    // If last question answered correctly
    if (currentIndex === questions.length - 1) {
      onComplete(currentQuestion.level);
      return;
    }

    // Move to next question
    setCurrentIndex(currentIndex + 1);
    setSelectedOption(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <span className="text-sm text-slate-400">
          Question {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-2 mb-8">
        <div
          className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Level indicator */}
      <div className="text-center mb-4">
        <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm">
          Level: {currentQuestion.level}
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
            key={index}
            onClick={() => handleSelect(index)}
            className={`w-full px-6 py-4 rounded-xl text-left transition-all ${
              selectedOption === index
                ? 'bg-primary-500/30 border-2 border-primary-500'
                : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
            }`}
          >
            <span className="inline-block w-8 h-8 rounded-full bg-white/10 text-center leading-8 mr-3">
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
              ? 'bg-gradient-to-r from-primary-500 to-accent-500 hover:opacity-90'
              : 'bg-white/10 text-slate-500 cursor-not-allowed'
          }`}
        >
          {currentIndex === questions.length - 1 ? 'Finish' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
