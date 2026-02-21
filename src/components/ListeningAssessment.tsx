import { useState, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from '../i18n/index';
import {
  englishListeningPool,
  japaneseListeningPool,
  selectListeningQuestions,
  LISTENING_QUESTIONS_PER_LEVEL,
  LISTENING_PASS_THRESHOLD,
  type ListeningLevelBlock,
} from '../lib/listeningQuestions';

interface Props {
  language: 'english' | 'japanese';
  onComplete: (level: string) => void;
  onBack: () => void;
  onQuit?: () => void;
  onFeedback?: (feedback: any) => void;
}

export default function ListeningAssessment({
  language,
  onComplete,
  onBack,
  onQuit,
  onFeedback,
}: Props) {
  const { t, lang } = useTranslation();
  const pool = language === 'english' ? englishListeningPool : japaneseListeningPool;

  const levels: ListeningLevelBlock[] = useMemo(
    () =>
      pool.map((block) => ({
        level: block.level,
        questions: selectListeningQuestions(block.questions, LISTENING_QUESTIONS_PER_LEVEL),
      })),
    [language],
  );

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [levelCorrect, setLevelCorrect] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [allAnswers, setAllAnswers] = useState<{ level: string; correct: boolean }[]>([]);

  // Audio state
  const [playsRemaining, setPlaysRemaining] = useState(2);
  const [hasListened, setHasListened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Feedback state
  const [feedbackState, setFeedbackState] = useState<'correct' | 'incorrect' | null>(null);
  const [showingFeedback, setShowingFeedback] = useState(false);

  // Level cleared flash
  const [levelCleared, setLevelCleared] = useState<string | null>(null);

  const currentLevel = levels[currentLevelIndex];
  const currentQuestion = currentLevel.questions[currentQuestionIndex];
  const totalQuestions = levels.length * LISTENING_QUESTIONS_PER_LEVEL;
  const answeredSoFar = currentLevelIndex * LISTENING_QUESTIONS_PER_LEVEL + currentQuestionIndex;

  const audioSrc = `/audio/listening/${currentQuestion.id}.mp3`;

  const handlePlay = useCallback(() => {
    if (playsRemaining <= 0 || isPlaying) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    setIsPlaying(true);

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setHasListened(true);
      setPlaysRemaining((prev) => prev - 1);
    });

    audio.addEventListener('error', () => {
      setIsPlaying(false);
      // Still allow answering if audio fails to load
      setHasListened(true);
    });

    audio.play().catch(() => {
      setIsPlaying(false);
      setHasListened(true);
    });
  }, [audioSrc, playsRemaining, isPlaying]);

  const handleSelect = (optionIndex: number) => {
    if (showingFeedback || !hasListened) return;
    setSelectedOption(optionIndex);
  };

  const sendFeedbackRequest = (
    level: string,
    answers: { level: string; correct: boolean }[],
  ) => {
    // Reuse text analysis endpoint for feedback
    fetch('/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, level, answers, assessmentType: 'listening', uiLang: lang }),
    })
      .then((res) => res.json())
      .then((data) => onFeedback?.(data))
      .catch(() => {});
  };

  const resetForNextQuestion = () => {
    setSelectedOption(null);
    setFeedbackState(null);
    setShowingFeedback(false);
    setPlaysRemaining(2);
    setHasListened(false);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const advanceAfterFeedback = (
    updatedAnswers: { level: string; correct: boolean }[],
    newLevelCorrect: number,
  ) => {
    if (currentQuestionIndex < currentLevel.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setLevelCorrect(newLevelCorrect);
      resetForNextQuestion();
      return;
    }

    const passed = newLevelCorrect >= LISTENING_PASS_THRESHOLD;

    if (passed && currentLevelIndex < levels.length - 1) {
      setLevelCleared(currentLevel.level);
      setTimeout(() => {
        setLevelCleared(null);
        setCurrentLevelIndex(currentLevelIndex + 1);
        setCurrentQuestionIndex(0);
        setLevelCorrect(0);
        resetForNextQuestion();
      }, 800);
      return;
    }

    if (!passed) {
      const level =
        currentLevelIndex === 0
          ? 'Starter'
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

    const isCorrect = selectedOption === currentQuestion.correct;
    const newAnswer = { level: currentLevel.level, correct: isCorrect };
    const updatedAnswers = [...allAnswers, newAnswer];
    setAllAnswers(updatedAnswers);

    const newLevelCorrect = isCorrect ? levelCorrect + 1 : levelCorrect;

    setFeedbackState(isCorrect ? 'correct' : 'incorrect');
    setShowingFeedback(true);

    setTimeout(() => {
      advanceAfterFeedback(updatedAnswers, newLevelCorrect);
    }, 800);
  };

  const isLastQuestion =
    currentLevelIndex === levels.length - 1 &&
    currentQuestionIndex === currentLevel.questions.length - 1;

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
          {currentLevel.level} — {currentQuestionIndex + 1} / {currentLevel.questions.length}
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
                    isPassed ? 'bg-teal-400' : 'bg-gray-200'
                  }`}
                />
              )}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-teal-500 text-white ring-2 ring-teal-300'
                    : isPassed
                      ? 'bg-teal-100 text-teal-600'
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
          className="bg-teal-500 h-2 rounded-full transition-all duration-300"
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

      {!levelCleared && (
        <>
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-sm text-gray-700">
              {t('levelCheck.level')} {currentLevel.level}
            </span>
          </div>

          {/* Audio Player */}
          <div className="text-center mb-6">
            <button
              onClick={handlePlay}
              disabled={playsRemaining <= 0 || isPlaying}
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all ${
                isPlaying
                  ? 'bg-teal-100 border-2 border-teal-400 animate-pulse'
                  : playsRemaining > 0
                    ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isPlaying ? (
                <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="mt-3 text-sm text-gray-500">
              {isPlaying
                ? t('listening.playing')
                : !hasListened
                  ? t('listening.play')
                  : playsRemaining > 0
                    ? t('listening.replay')
                    : ''}
            </div>
            <div className="mt-1 text-xs text-gray-400">
              {t('listening.replaysLeft', { count: String(playsRemaining) })}
            </div>
          </div>

          {/* Question (shown after first listen) */}
          {hasListened && (
            <>
              <h3 className="text-xl font-medium text-center mb-6">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-3 max-w-lg mx-auto mb-8">
                {currentQuestion.options.map((option, index) => {
                  let className = 'w-full px-6 py-4 rounded-xl text-left transition-all ';

                  if (showingFeedback) {
                    if (index === currentQuestion.correct) {
                      className += 'bg-green-50 border-2 border-green-500 text-green-800';
                    } else if (index === selectedOption && feedbackState === 'incorrect') {
                      className += 'bg-red-50 border-2 border-red-400 text-red-700';
                    } else {
                      className += 'bg-white border-2 border-gray-200 opacity-50';
                    }
                  } else if (selectedOption === index) {
                    className += 'bg-teal-50 border-2 border-teal-500';
                  } else {
                    className += 'bg-white border-2 border-gray-200 hover:bg-teal-50';
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
                      ? 'bg-teal-500 text-white hover:bg-teal-600'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLastQuestion ? t('levelCheck.finish') : t('levelCheck.next')}
                </button>
              </div>
            </>
          )}

          {/* Listen first hint */}
          {!hasListened && !isPlaying && (
            <p className="text-center text-gray-400 text-sm mt-4">
              {t('listening.listenFirst')}
            </p>
          )}
        </>
      )}
    </div>
  );
}
