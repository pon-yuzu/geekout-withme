import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/index';

interface Props {
  language: 'english' | 'japanese';
  onComplete: (level: string) => void;
  onBack: () => void;
  onQuit?: () => void;
  onFeedback?: (feedback: any) => void;
}

interface VoiceQuestion {
  level: string;
  prompt: string;
  hint: string;
  minWords: number;
  recommendedSeconds: number;
}

const englishVoiceQuestions: VoiceQuestion[] = [
  {
    level: 'A1',
    prompt: 'Please introduce yourself. Say your name and where you are from.',
    hint: 'Example: "My name is... I am from..."',
    minWords: 5,
    recommendedSeconds: 30,
  },
  {
    level: 'A2',
    prompt: 'What do you like to do on weekends? Tell me about your hobbies.',
    hint: 'Talk about activities you enjoy',
    minWords: 15,
    recommendedSeconds: 45,
  },
  {
    level: 'B1',
    prompt: 'Describe your favorite movie or book. Why do you like it?',
    hint: 'Give reasons and examples',
    minWords: 30,
    recommendedSeconds: 60,
  },
  {
    level: 'B2',
    prompt: 'What are the advantages and disadvantages of social media?',
    hint: 'Discuss both sides of the topic',
    minWords: 50,
    recommendedSeconds: 90,
  },
  {
    level: 'C1',
    prompt: 'How do you think technology will change education in the next 20 years?',
    hint: 'Share your predictions and reasoning',
    minWords: 70,
    recommendedSeconds: 120,
  },
];

const japaneseVoiceQuestions: VoiceQuestion[] = [
  {
    level: 'N5',
    prompt: '自己紹介をしてください。名前と出身を言ってください。',
    hint: '例：「私の名前は...です。...から来ました。」',
    minWords: 5,
    recommendedSeconds: 30,
  },
  {
    level: 'N4',
    prompt: '週末は何をしますか？趣味について話してください。',
    hint: '好きな活動について話してください',
    minWords: 15,
    recommendedSeconds: 45,
  },
  {
    level: 'N3',
    prompt: '好きな映画か本について説明してください。なぜ好きですか？',
    hint: '理由と例を挙げてください',
    minWords: 25,
    recommendedSeconds: 60,
  },
  {
    level: 'N2',
    prompt: 'SNSの長所と短所は何だと思いますか？',
    hint: '両方の面について話してください',
    minWords: 40,
    recommendedSeconds: 90,
  },
  {
    level: 'N1',
    prompt: '今後20年間で、テクノロジーは教育をどう変えると思いますか？',
    hint: '予測とその理由を述べてください',
    minWords: 60,
    recommendedSeconds: 120,
  },
];

// Improved Japanese word count: segment by character blocks
function countJapaneseWords(text: string): number {
  const cleaned = text.replace(/[\s。、！？「」『』（）.,!?\-\u3000]/g, '');
  if (!cleaned) return 0;

  let wordCount = 0;
  let prevType = '';

  for (const char of cleaned) {
    const code = char.charCodeAt(0);
    let type: string;

    if (code >= 0x4e00 && code <= 0x9faf) {
      // Each kanji counts as a word
      type = 'kanji';
      wordCount++;
      prevType = type;
      continue;
    } else if (code >= 0x3040 && code <= 0x309f) {
      type = 'hiragana';
    } else if (code >= 0x30a0 && code <= 0x30ff) {
      type = 'katakana';
    } else {
      type = 'other';
    }

    // Hiragana/katakana blocks count as words when switching type
    if (type !== prevType) {
      wordCount++;
    }
    prevType = type;
  }

  return wordCount;
}

function countWords(text: string, lang: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  if (lang === 'japanese') {
    return countJapaneseWords(trimmed);
  }
  return trimmed.split(/\s+/).filter((w) => w.length > 0).length;
}

function countSentences(text: string, lang: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 1;
  if (lang === 'japanese') {
    return (trimmed.match(/[。！？!?]/g) || []).length || 1;
  }
  return (trimmed.match(/[.!?]+/g) || []).length || 1;
}

// Composite fallback scoring: words + sentences + average sentence length
function fallbackAnalysis(
  text: string,
  lang: string,
  question: VoiceQuestion,
): { passed: boolean; isFallback: boolean } {
  const words = countWords(text, lang);
  const sentences = countSentences(text, lang);
  const avgSentenceLen = words / sentences;

  // Hard minimum: must produce at least 50% of expected words
  if (words < question.minWords * 0.5) {
    return { passed: false, isFallback: true };
  }

  // Score components (0-1 each)
  const wordScore = Math.min(words / question.minWords, 1);
  const minSentences = Math.max(Math.ceil(question.minWords / 12), 2);
  const sentenceScore = Math.min(sentences / minSentences, 1);
  const complexityScore = Math.min(avgSentenceLen / 10, 1);

  // Weighted composite — stricter threshold
  const composite = wordScore * 0.6 + sentenceScore * 0.2 + complexityScore * 0.2;

  return { passed: composite >= 0.65, isFallback: true };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function VoiceAssessment({ language, onComplete, onBack, onQuit, onFeedback }: Props) {
  const { t } = useTranslation();
  const questions = language === 'english' ? englishVoiceQuestions : japaneseVoiceQuestions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [levelCleared, setLevelCleared] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentIndex];
  const wordCount = countWords(transcript.trim(), language);
  const tooShort = transcript.trim().length > 0 && wordCount < currentQuestion.minWords * 0.3;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'english' ? 'en-US' : 'ja-JP';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript((prev) => (prev ? prev + ' ' + finalTranscript : finalTranscript));
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [language]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = () => {
    setTranscript('');
    setIsRecording(true);
    setElapsedSeconds(0);
    recognitionRef.current?.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
  };

  const advanceToNext = (isFallback: boolean) => {
    if (currentIndex === questions.length - 1) {
      if (isFallback) {
        onFeedback?.({ isFallback: true });
      }
      onComplete(currentQuestion.level);
      return;
    }

    // Show level cleared flash
    setLevelCleared(currentQuestion.level);
    setTimeout(() => {
      setLevelCleared(null);
      setCurrentIndex(currentIndex + 1);
      setTranscript('');
      setElapsedSeconds(0);
      setIsAnalyzing(false);
    }, 800);
  };

  const handleFail = (isFallback: boolean) => {
    const level =
      currentIndex === 0
        ? 'Starter'
        : questions[currentIndex - 1].level;
    if (isFallback) {
      onFeedback?.({ isFallback: true });
    }
    onComplete(level);
  };

  const analyzeResponse = async () => {
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.trim(),
          language,
          level: currentQuestion.level,
        }),
      });

      if (response.ok) {
        const analysis = await response.json();
        onFeedback?.(analysis);

        if (!analysis.passed) {
          handleFail(false);
          return;
        }

        advanceToNext(false);
        return;
      }
    } catch (error) {
      console.warn('AI API failed, falling back to composite analysis:', error);
    }

    // Composite fallback analysis
    const result = fallbackAnalysis(transcript.trim(), language, currentQuestion);

    if (!result.passed) {
      handleFail(true);
      return;
    }

    advanceToNext(true);
  };

  if (!isSupported) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">🎤</div>
        <h3 className="text-xl font-medium mb-4">{t('voice.notSupported.title')}</h3>
        <p className="text-gray-500 mb-6">{t('voice.notSupported.desc')}</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-100 border border-gray-200 rounded-full hover:bg-orange-50 transition-colors"
        >
          {t('voice.notSupported.back')}
        </button>
      </div>
    );
  }

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
          {t('levelCheck.question')} {currentIndex + 1} / {questions.length}
        </span>
        {onQuit && (
          <button
            onClick={() => { if (confirm(t('levelCheck.quitConfirm'))) onQuit(); }}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            {t('levelCheck.quit')}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Level Cleared Flash */}
      {levelCleared && (
        <div className="text-center py-8 animate-pulse">
          <span className="inline-block px-6 py-3 bg-green-100 border border-green-300 rounded-full text-green-700 font-medium text-lg">
            {t('levelCheck.levelCleared', { level: levelCleared })}
          </span>
        </div>
      )}

      {!levelCleared && (
        <>
          {/* Level indicator */}
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-sm text-gray-700">
              {t('levelCheck.level')} {currentQuestion.level}
            </span>
          </div>

          {/* Question */}
          <h3 className="text-xl font-medium text-center mb-2">
            {currentQuestion.prompt}
          </h3>
          <p className="text-gray-500 text-center mb-8">{currentQuestion.hint}</p>

          {/* Recording UI */}
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-6">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                className={`w-24 h-24 rounded-full transition-all ${
                  isRecording
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-orange-500 hover:bg-orange-600 hover:scale-105'
                } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="text-4xl">{isRecording ? '⏹' : '🎤'}</span>
              </button>

              {/* Timer */}
              {isRecording && (
                <div className="mt-3">
                  <span className="font-mono text-2xl text-gray-800">
                    {formatTime(elapsedSeconds)}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('voice.recommended')}: ~{formatTime(currentQuestion.recommendedSeconds)}
                  </p>
                </div>
              )}

              {!isRecording && !transcript && (
                <p className="mt-3 text-sm text-gray-500">{t('voice.clickToStart')}</p>
              )}
              {isRecording && (
                <p className="mt-2 text-sm text-gray-500">{t('voice.clickToStop')}</p>
              )}
            </div>

            {transcript && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-500 mb-2">{t('voice.yourResponse')}</p>
                <p className="text-gray-800">{transcript.trim()}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {t('voice.wordCount')}: {wordCount}
                </p>
              </div>
            )}

            {/* Too short warning */}
            {tooShort && !isRecording && transcript && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-4 text-center">
                <p className="text-amber-700 text-sm">
                  {t('voice.tooShort')}
                </p>
              </div>
            )}

            {transcript && !isRecording && (
              <div className="text-center">
                <button
                  onClick={analyzeResponse}
                  disabled={isAnalyzing || tooShort}
                  className={`px-8 py-3 rounded-full font-medium transition-all ${
                    isAnalyzing || tooShort
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600 transition-colors'
                  }`}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> {t('voice.analyzing')}
                    </span>
                  ) : (
                    t('voice.submit')
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
