import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/index';
import TextAssessment from './TextAssessment';
import ListeningAssessment from './ListeningAssessment';
import VoiceAssessment from './VoiceAssessment';
import Results from './Results';

type Language = 'english' | 'japanese';
type Step =
  | 'select-language'
  | 'select-mode'
  | 'text-assessment'
  | 'transition-listening'
  | 'listening-assessment'
  | 'transition-voice'
  | 'voice-assessment'
  | 'results';
type AssessmentMode = 'text' | 'listening' | 'voice' | 'both';

interface AssessmentFeedback {
  feedback?: string;
  studyTips?: string[];
  focusAreas?: string[];
  strengths?: string[];
  improvements?: string[];
  isFallback?: boolean;
}

interface AssessmentResult {
  textLevel?: string;
  listeningLevel?: string;
  voiceLevel?: string;
  details?: string;
  feedback?: AssessmentFeedback;
  isFallback?: boolean;
}

interface LevelCheckAppProps {
  isLoggedIn?: boolean;
}

export default function LevelCheckApp({ isLoggedIn }: LevelCheckAppProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('select-language');
  const [language, setLanguage] = useState<Language | null>(null);
  const [mode, setMode] = useState<AssessmentMode | null>(null);
  const [results, setResults] = useState<AssessmentResult>({});

  // Save results to sessionStorage for post-signup recovery
  useEffect(() => {
    if (step === 'results' && language && !isLoggedIn) {
      try {
        sessionStorage.setItem('pendingAssessment', JSON.stringify({
          language,
          mode,
          textLevel: results.textLevel,
          listeningLevel: results.listeningLevel,
          voiceLevel: results.voiceLevel,
          feedback: results.feedback,
        }));
      } catch {}
    }
  }, [step, language, mode, results, isLoggedIn]);

  // On mount, check for pending assessment and auto-save if logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    try {
      const pending = sessionStorage.getItem('pendingAssessment');
      if (!pending) return;
      const data = JSON.parse(pending);
      fetch('/api/save-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => {
        if (res.ok) sessionStorage.removeItem('pendingAssessment');
      }).catch(() => {});
    } catch {}
  }, [isLoggedIn]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setStep('select-mode');
  };

  const handleModeSelect = (selectedMode: AssessmentMode) => {
    setMode(selectedMode);
    if (selectedMode === 'text' || selectedMode === 'both') {
      setStep('text-assessment');
    } else if (selectedMode === 'listening') {
      setStep('listening-assessment');
    } else {
      setStep('voice-assessment');
    }
  };

  const handleTextComplete = (level: string) => {
    setResults(prev => ({ ...prev, textLevel: level }));
    if (mode === 'both') {
      setStep('transition-listening');
    } else {
      setStep('results');
    }
  };

  const handleListeningComplete = (level: string) => {
    setResults(prev => ({ ...prev, listeningLevel: level }));
    if (mode === 'both') {
      setStep('transition-voice');
    } else {
      setStep('results');
    }
  };

  const handleVoiceComplete = (level: string) => {
    setResults(prev => ({ ...prev, voiceLevel: level }));
    setStep('results');
  };

  const handleTextFeedback = (feedback: AssessmentFeedback) => {
    setResults(prev => ({ ...prev, feedback }));
  };

  const handleListeningFeedback = (feedback: AssessmentFeedback) => {
    setResults(prev => ({
      ...prev,
      feedback: { ...prev.feedback, ...feedback },
    }));
  };

  const handleVoiceFeedback = (feedback: AssessmentFeedback) => {
    setResults(prev => ({
      ...prev,
      feedback: { ...prev.feedback, ...feedback },
      isFallback: feedback.isFallback || prev.isFallback,
    }));
  };

  const handleQuit = () => {
    setStep('select-mode');
    setResults({});
  };

  const handleRestart = () => {
    setStep('select-language');
    setLanguage(null);
    setMode(null);
    setResults({});
    try { sessionStorage.removeItem('pendingAssessment'); } catch {}
  };

  const isAssessmentStep =
    step === 'text-assessment' ||
    step === 'listening-assessment' ||
    step === 'voice-assessment' ||
    step === 'transition-listening' ||
    step === 'transition-voice';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      {/* Progress Indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {['select-language', 'select-mode', 'assessment', 'results'].map((s, i) => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full ${
              (step === 'select-language' && i === 0) ||
              (step === 'select-mode' && i === 1) ||
              (isAssessmentStep && i === 2) ||
              (step === 'results' && i === 3)
                ? 'bg-orange-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step: Select Language */}
      {step === 'select-language' && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-6">{t('levelCheck.selectLang.title')}</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleLanguageSelect('japanese')}
              className="px-8 py-6 bg-white border border-gray-200 rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
            >
              <span className="text-4xl block mb-2">🇯🇵</span>
              <span className="text-lg font-medium">{t('levelCheck.selectLang.japanese')}</span>
              <span className="block text-sm text-gray-500">{t('levelCheck.selectLang.japaneseSub')}</span>
            </button>
            <button
              onClick={() => handleLanguageSelect('english')}
              className="px-8 py-6 bg-white border border-gray-200 rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
            >
              <span className="text-4xl block mb-2">🇺🇸</span>
              <span className="text-lg font-medium">{t('levelCheck.selectLang.english')}</span>
              <span className="block text-sm text-gray-500">{t('levelCheck.selectLang.englishSub')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Step: Select Mode */}
      {step === 'select-mode' && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">{t('levelCheck.selectMode.title')}</h2>
          <p className="text-gray-500 mb-6">{t('levelCheck.selectMode.subtitle')}</p>
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <button
              onClick={() => handleModeSelect('text')}
              className="px-6 py-4 bg-white border border-gray-200 rounded-xl hover:bg-orange-50 transition-colors text-left shadow-sm"
            >
              <span className="text-2xl mr-3">📝</span>
              <span className="font-medium">{t('levelCheck.selectMode.text')}</span>
              <span className="block text-sm text-gray-500 ml-9">{t('levelCheck.selectMode.textSub')}</span>
            </button>
            <button
              onClick={() => handleModeSelect('listening')}
              className="px-6 py-4 bg-white border border-gray-200 rounded-xl hover:bg-orange-50 transition-colors text-left shadow-sm"
            >
              <span className="text-2xl mr-3">👂</span>
              <span className="font-medium">{t('levelCheck.selectMode.listening')}</span>
              <span className="block text-sm text-gray-500 ml-9">{t('levelCheck.selectMode.listeningSub')}</span>
            </button>
            <button
              onClick={() => handleModeSelect('voice')}
              className="px-6 py-4 bg-white border border-gray-200 rounded-xl hover:bg-orange-50 transition-colors text-left shadow-sm"
            >
              <span className="text-2xl mr-3">🎤</span>
              <span className="font-medium">{t('levelCheck.selectMode.voice')}</span>
              <span className="block text-sm text-gray-500 ml-9">{t('levelCheck.selectMode.voiceSub')}</span>
            </button>
            <button
              onClick={() => handleModeSelect('both')}
              className="px-6 py-4 bg-orange-50 border border-orange-500 rounded-xl hover:bg-orange-100 transition-colors text-left shadow-sm"
            >
              <span className="text-2xl mr-3">✨</span>
              <span className="font-medium">{t('levelCheck.selectMode.both')}</span>
              <span className="block text-sm text-gray-500 ml-9">{t('levelCheck.selectMode.bothSub')}</span>
            </button>
          </div>
          {!isLoggedIn && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 max-w-md mx-auto">
              <p className="text-blue-700 text-sm">
                <a href="/login" className="underline underline-offset-2 font-medium hover:text-blue-900">{t('levelCheck.loginForAccuracy')}</a>
              </p>
            </div>
          )}
          <button
            onClick={() => setStep('select-language')}
            className="mt-6 text-gray-500 hover:text-gray-800 transition-colors"
          >
            {t('levelCheck.back')}
          </button>
        </div>
      )}

      {/* Step: Text Assessment */}
      {step === 'text-assessment' && language && (
        <TextAssessment
          language={language}
          onComplete={handleTextComplete}
          onBack={() => setStep('select-mode')}
          onQuit={handleQuit}
          onFeedback={handleTextFeedback}
        />
      )}

      {/* Step: Transition to Listening (both mode) */}
      {step === 'transition-listening' && language && (
        <div className="text-center py-8">
          <div className="text-5xl mb-6">✅</div>
          <h2 className="text-2xl font-semibold mb-3">
            {t('levelCheck.transition.title')}
          </h2>
          <div className="inline-block bg-orange-50 border border-orange-200 rounded-xl px-6 py-4 mb-6">
            <p className="text-gray-600">
              {t('results.readingWriting')}: <span className="font-bold text-orange-500">{results.textLevel}</span>
            </p>
          </div>
          <p className="text-gray-500 mb-8">
            {t('levelCheck.transition.listeningDesc')}
          </p>
          <button
            onClick={() => setStep('listening-assessment')}
            className="px-8 py-3 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600 transition-colors"
          >
            {t('levelCheck.transition.listeningContinue')}
          </button>
          <div className="mt-4">
            <button
              onClick={() => { if (confirm(t('levelCheck.quitConfirm'))) handleQuit(); }}
              className="text-sm text-red-400 hover:text-red-600 transition-colors"
            >
              {t('levelCheck.quit')}
            </button>
          </div>
        </div>
      )}

      {/* Step: Listening Assessment */}
      {step === 'listening-assessment' && language && (
        <ListeningAssessment
          language={language}
          onComplete={handleListeningComplete}
          onBack={() => mode === 'both' ? setStep('transition-listening') : setStep('select-mode')}
          onQuit={handleQuit}
          onFeedback={handleListeningFeedback}
        />
      )}

      {/* Step: Transition to Voice (both mode) */}
      {step === 'transition-voice' && language && (
        <div className="text-center py-8">
          <div className="text-5xl mb-6">✅</div>
          <h2 className="text-2xl font-semibold mb-3">
            {t('levelCheck.transition.listeningTitle')}
          </h2>
          <div className="inline-flex flex-col sm:flex-row gap-3 mb-6">
            {results.textLevel && (
              <div className="inline-block bg-orange-50 border border-orange-200 rounded-xl px-6 py-4">
                <p className="text-gray-600">
                  {t('results.readingWriting')}: <span className="font-bold text-orange-500">{results.textLevel}</span>
                </p>
              </div>
            )}
            <div className="inline-block bg-teal-50 border border-teal-200 rounded-xl px-6 py-4">
              <p className="text-gray-600">
                {t('results.listening')}: <span className="font-bold text-teal-500">{results.listeningLevel}</span>
              </p>
            </div>
          </div>
          <p className="text-gray-500 mb-8">
            {t('levelCheck.transition.desc')}
          </p>
          <button
            onClick={() => setStep('voice-assessment')}
            className="px-8 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
          >
            {t('levelCheck.transition.continue')}
          </button>
          <div className="mt-4">
            <button
              onClick={() => { if (confirm(t('levelCheck.quitConfirm'))) handleQuit(); }}
              className="text-sm text-red-400 hover:text-red-600 transition-colors"
            >
              {t('levelCheck.quit')}
            </button>
          </div>
        </div>
      )}

      {/* Step: Voice Assessment */}
      {step === 'voice-assessment' && language && (
        <VoiceAssessment
          language={language}
          onComplete={handleVoiceComplete}
          onBack={() => mode === 'both' ? setStep('transition-voice') : setStep('select-mode')}
          onQuit={handleQuit}
          onFeedback={handleVoiceFeedback}
        />
      )}

      {/* Step: Results */}
      {step === 'results' && language && (
        <Results
          language={language}
          textLevel={results.textLevel}
          listeningLevel={results.listeningLevel}
          voiceLevel={results.voiceLevel}
          feedback={results.feedback}
          isFallback={results.isFallback}
          onRestart={handleRestart}
          isLoggedIn={isLoggedIn}
          mode={mode || undefined}
        />
      )}
    </div>
  );
}
