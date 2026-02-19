import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/index';

interface Props {
  language: 'english' | 'japanese';
  onComplete: (level: string) => void;
  onBack: () => void;
}

interface VoiceQuestion {
  level: string;
  prompt: string;
  hint: string;
  minWords: number;
}

const englishVoiceQuestions: VoiceQuestion[] = [
  {
    level: 'A1',
    prompt: 'Please introduce yourself. Say your name and where you are from.',
    hint: 'Example: "My name is... I am from..."',
    minWords: 5,
  },
  {
    level: 'A2',
    prompt: 'What do you like to do on weekends? Tell me about your hobbies.',
    hint: 'Talk about activities you enjoy',
    minWords: 15,
  },
  {
    level: 'B1',
    prompt: 'Describe your favorite movie or book. Why do you like it?',
    hint: 'Give reasons and examples',
    minWords: 30,
  },
  {
    level: 'B2',
    prompt: 'What are the advantages and disadvantages of social media?',
    hint: 'Discuss both sides of the topic',
    minWords: 50,
  },
  {
    level: 'C1',
    prompt: 'How do you think technology will change education in the next 20 years?',
    hint: 'Share your predictions and reasoning',
    minWords: 70,
  },
];

const japaneseVoiceQuestions: VoiceQuestion[] = [
  {
    level: 'N5',
    prompt: '自己紹介をしてください。名前と出身を言ってください。',
    hint: '例：「私の名前は...です。...から来ました。」',
    minWords: 5,
  },
  {
    level: 'N4',
    prompt: '週末は何をしますか？趣味について話してください。',
    hint: '好きな活動について話してください',
    minWords: 15,
  },
  {
    level: 'N3',
    prompt: '好きな映画か本について説明してください。なぜ好きですか？',
    hint: '理由と例を挙げてください',
    minWords: 25,
  },
  {
    level: 'N2',
    prompt: 'SNSの長所と短所は何だと思いますか？',
    hint: '両方の面について話してください',
    minWords: 40,
  },
  {
    level: 'N1',
    prompt: '今後20年間で、テクノロジーは教育をどう変えると思いますか？',
    hint: '予測とその理由を述べてください',
    minWords: 60,
  },
];

function countWords(text: string, lang: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  if (lang === 'japanese') {
    const chars = trimmed.replace(/[\s。、！？「」『』（）.,!?\-\u3000]/g, '');
    return Math.ceil(chars.length / 2);
  }
  return trimmed.split(/\s+/).filter((w) => w.length > 0).length;
}

export default function VoiceAssessment({ language, onComplete, onBack }: Props) {
  const { t } = useTranslation();
  const questions = language === 'english' ? englishVoiceQuestions : japaneseVoiceQuestions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
          setTranscript(prev => prev ? prev + ' ' + finalTranscript : finalTranscript);
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
    };
  }, [language]);

  const startRecording = () => {
    setTranscript('');
    setIsRecording(true);
    recognitionRef.current?.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
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

        if (!analysis.passed) {
          const level = currentIndex === 0
            ? (language === 'english' ? 'Below A1' : 'Below N5')
            : questions[currentIndex - 1].level;
          onComplete(level);
          return;
        }

        if (currentIndex === questions.length - 1) {
          onComplete(analysis.assessedLevel || currentQuestion.level);
          return;
        }

        setCurrentIndex(currentIndex + 1);
        setTranscript('');
        setIsAnalyzing(false);
        return;
      }
    } catch (error) {
      console.warn('Claude API failed, falling back to word count analysis:', error);
    }

    const wordCount = countWords(transcript.trim(), language);

    if (wordCount < currentQuestion.minWords * 0.5) {
      const level = currentIndex === 0
        ? (language === 'english' ? 'Below A1' : 'Below N5')
        : questions[currentIndex - 1].level;
      onComplete(level);
      return;
    }

    if (currentIndex === questions.length - 1) {
      onComplete(currentQuestion.level);
      return;
    }

    setCurrentIndex(currentIndex + 1);
    setTranscript('');
    setIsAnalyzing(false);
  };

  if (!isSupported) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">🎤</div>
        <h3 className="text-xl font-medium mb-4">{t('voice.notSupported.title')}</h3>
        <p className="text-gray-500 mb-6">
          {t('voice.notSupported.desc')}
        </p>
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
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

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
      <p className="text-gray-500 text-center mb-8">
        {currentQuestion.hint}
      </p>

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
          <p className="mt-3 text-sm text-gray-500">
            {isRecording ? t('voice.clickToStop') : t('voice.clickToStart')}
          </p>
        </div>

        {transcript && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">{t('voice.yourResponse')}</p>
            <p className="text-gray-800">{transcript.trim()}</p>
          </div>
        )}

        {transcript && !isRecording && (
          <div className="text-center">
            <button
              onClick={analyzeResponse}
              disabled={isAnalyzing}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                isAnalyzing
                  ? 'bg-gray-100 text-gray-500'
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
    </div>
  );
}
