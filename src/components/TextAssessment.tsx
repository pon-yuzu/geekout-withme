import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../i18n/index';
import {
  englishQuestionPool,
  japaneseQuestionPool,
  selectQuestions,
  QUESTIONS_PER_LEVEL,
  PASS_THRESHOLD,
  type LevelBlock,
} from '../lib/questions';

interface Props {
  language: 'english' | 'japanese';
  onComplete: (level: string) => void;
  onBack: () => void;
  onQuit?: () => void;
  onFeedback?: (feedback: any) => void;
}

export default function TextAssessment({
  language,
  onComplete,
  onBack,
  onQuit,
  onFeedback,
}: Props) {
  const { t, lang } = useTranslation();
  const pool = language === 'english' ? englishQuestionPool : japaneseQuestionPool;

  // Build levels with randomly selected questions (memoized on mount)
  const levels: LevelBlock[] = useMemo(
    () =>
      pool.map((block) => ({
        level: block.level,
        questions: selectQuestions(block.questions, QUESTIONS_PER_LEVEL),
      })),
    [language],
  );

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [levelCorrect, setLevelCorrect] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [allAnswers, setAllAnswers] = useState<
    { level: string; correct: boolean }[]
  >([]);

  // Feedback state
  const [feedbackState, setFeedbackState] = useState<'correct' | 'incorrect' | null>(null);
  const [showingFeedback, setShowingFeedback] = useState(false);

  // Level cleared flash
  const [levelCleared, setLevelCleared] = useState<string | null>(null);

  const currentLevel = levels[currentLevelIndex];
  const currentQuestion = currentLevel.questions[currentQuestionIndex];
  const totalQuestions = levels.length * QUESTIONS_PER_LEVEL;
  const answeredSoFar = currentLevelIndex * QUESTIONS_PER_LEVEL + currentQuestionIndex;

  const checkCorrect = (
    selected: number,
    correct: number | number[],
  ): boolean => {
    if (Array.isArray(correct)) return correct.includes(selected);
    return selected === correct;
  };

  const handleSelect = (optionIndex: number) => {
    if (showingFeedback) return;
    setSelectedOption(optionIndex);
  };

  const sendFeedbackRequest = (
    level: string,
    answers: { level: string; correct: boolean }[],
  ) => {
    fetch('/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, level, answers, uiLang: lang }),
    })
      .then((res) => res.json())
      .then((data) => onFeedback?.(data))
      .catch(() => {});
  };

  const advanceAfterFeedback = (
    isCorrect: boolean,
    updatedAnswers: { level: string; correct: boolean }[],
    newLevelCorrect: number,
  ) => {
    if (currentQuestionIndex < currentLevel.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setLevelCorrect(newLevelCorrect);
      setSelectedOption(null);
      setFeedbackState(null);
      setShowingFeedback(false);
      return;
    }

    const passed = newLevelCorrect >= PASS_THRESHOLD;

    if (passed && currentLevelIndex < levels.length - 1) {
      // Show level cleared flash before advancing
      setLevelCleared(currentLevel.level);
      setTimeout(() => {
        setLevelCleared(null);
        setCurrentLevelIndex(currentLevelIndex + 1);
        setCurrentQuestionIndex(0);
        setLevelCorrect(0);
        setSelectedOption(null);
        setFeedbackState(null);
        setShowingFeedback(false);
      }, 800);
      return;
    }

    if (!passed) {
      const level =
        currentLevelIndex === 0
          ? language === 'english'
            ? 'Starter'
            : 'Starter'
          : levels[currentLevelIndex - 1].level;
      sendFeedbackRequest(level, updatedAnswers);
      onComplete(level);
      return;
    }

    // Passed final level
    sendFeedbackRequest(currentLevel.level, updatedAnswers);
    onComplete(currentLevel.level);
  };

  const handleNext = () => {
    if (selectedOption === null || showingFeedback) return;

    const isCorrect = checkCorrect(selectedOption, currentQuestion.correct);
    const newAnswer = { level: currentLevel.level, correct: isCorrect };
    const updatedAnswers = [...allAnswers, newAnswer];
    setAllAnswers(updatedAnswers);

    const newLevelCorrect = isCorrect ? levelCorrect + 1 : levelCorrect;

    // Show feedback
    setFeedbackState(isCorrect ? 'correct' : 'incorrect');
    setShowingFeedback(true);

    setTimeout(() => {
      advanceAfterFeedback(isCorrect, updatedAnswers, newLevelCorrect);
    }, 800);
  };

  const isLastQuestion =
    currentLevelIndex === levels.length - 1 &&
    currentQuestionIndex === currentLevel.questions.length - 1;

  // Determine correct answer index for feedback display
  const correctIndex = Array.isArray(currentQuestion.correct)
    ? currentQuestion.correct[0]
    : currentQuestion.correct;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          disabled={showingFeedback}
          className="text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          {t('levelCheck.back')}
        </button>
        <span className="text-sm text-gray-500">
          {currentLevel.level} — {currentQuestionIndex + 1} /{' '}
          {currentLevel.questions.length}
        </span>
        {onQuit && (
          <button
            onClick={() => { if (confirm(t('levelCheck.quitConfirm'))) onQuit(); }}
            disabled={showingFeedback}
            className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            {t('levelCheck.quit')}
          </button>
        )}
      </div>

      {/* Level Stepper */}
      <div className="flex items-center justify-center gap-1 mb-4">
        {levels.map((lvl, i) => {
          const isCurrent = i === currentLevelIndex;
          const isPassed = i < currentLevelIndex;
          return (
            <div key={lvl.level} className="flex items-center">
              {i > 0 && (
                <div
                  className={`w-4 h-0.5 mx-0.5 ${
                    isPassed ? 'bg-orange-400' : 'bg-gray-200'
                  }`}
                />
              )}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-orange-500 text-white ring-2 ring-orange-300'
                    : isPassed
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isPassed ? '✓' : lvl.level}
              </div>
            </div>
          );
        })}
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

      {/* Level Cleared Flash */}
      {levelCleared && (
        <div className="text-center mb-4 animate-pulse">
          <span className="inline-block px-4 py-2 bg-green-100 border border-green-300 rounded-full text-green-700 font-medium">
            {t('levelCheck.levelCleared', { level: levelCleared })}
          </span>
        </div>
      )}

      {/* Level indicator */}
      {!levelCleared && (
        <>
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
            {currentQuestion.options.map((option, index) => {
              let className =
                'w-full px-6 py-4 rounded-xl text-left transition-all ';

              if (showingFeedback) {
                if (index === correctIndex) {
                  className += 'bg-green-50 border-2 border-green-500 text-green-800';
                } else if (index === selectedOption && feedbackState === 'incorrect') {
                  className += 'bg-red-50 border-2 border-red-400 text-red-700';
                } else {
                  className += 'bg-white border-2 border-gray-200 opacity-50';
                }
              } else if (selectedOption === index) {
                className += 'bg-orange-50 border-2 border-orange-500';
              } else {
                className += 'bg-white border-2 border-gray-200 hover:bg-orange-50';
              }

              return (
                <button
                  key={`${currentLevelIndex}-${currentQuestionIndex}-${index}`}
                  onClick={() => handleSelect(index)}
                  disabled={showingFeedback}
                  className={className}
                >
                  <span className="inline-block w-8 h-8 rounded-full bg-gray-100 text-center leading-8 mr-3">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Feedback message */}
          {showingFeedback && (
            <div className="text-center mb-4">
              <span
                className={`inline-block px-4 py-2 rounded-full font-medium text-sm ${
                  feedbackState === 'correct'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {feedbackState === 'correct'
                  ? t('levelCheck.correct')
                  : t('levelCheck.incorrect')}
              </span>
            </div>
          )}

          {/* Next button */}
          <div className="text-center">
            <button
              onClick={handleNext}
              disabled={selectedOption === null || showingFeedback}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                selectedOption !== null && !showingFeedback
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLastQuestion ? t('levelCheck.finish') : t('levelCheck.next')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
