import { useState } from 'react';
import { useTranslation } from '../i18n/index';
import TextAssessment from './TextAssessment';
import VoiceAssessment from './VoiceAssessment';
import Results from './Results';

type Language = 'english' | 'japanese';
type Step = 'select-language' | 'select-mode' | 'text-assessment' | 'voice-assessment' | 'results';
type AssessmentMode = 'text' | 'voice' | 'both';

interface AssessmentFeedback {
  feedback?: string;
  studyTips?: string[];
  focusAreas?: string[];
  strengths?: string[];
  improvements?: string[];
}

interface AssessmentResult {
  textLevel?: string;
  voiceLevel?: string;
  details?: string;
  feedback?: AssessmentFeedback;
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

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setStep('select-mode');
  };

  const handleModeSelect = (selectedMode: AssessmentMode) => {
    setMode(selectedMode);
    if (selectedMode === 'text' || selectedMode === 'both') {
      setStep('text-assessment');
    } else {
      setStep('voice-assessment');
    }
  };

  const handleTextComplete = (level: string) => {
    setResults(prev => ({ ...prev, textLevel: level }));
    if (mode === 'both') {
      setStep('voice-assessment');
    } else {
      setStep('results');
    }
  };

  const handleVoiceComplete = (level: string) => {
    setResults(prev => ({ ...prev, voiceLevel: level }));
    setStep('results');
  };

  const handleFeedback = (feedback: AssessmentFeedback) => {
    setResults(prev => ({ ...prev, feedback }));
  };

  const handleRestart = () => {
    setStep('select-language');
    setLanguage(null);
    setMode(null);
    setResults({});
  };

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
              ((step === 'text-assessment' || step === 'voice-assessment') && i === 2) ||
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
          onFeedback={handleFeedback}
        />
      )}

      {/* Step: Voice Assessment */}
      {step === 'voice-assessment' && language && (
        <VoiceAssessment
          language={language}
          onComplete={handleVoiceComplete}
          onBack={() => mode === 'both' ? setStep('text-assessment') : setStep('select-mode')}
        />
      )}

      {/* Step: Results */}
      {step === 'results' && language && (
        <Results
          language={language}
          textLevel={results.textLevel}
          voiceLevel={results.voiceLevel}
          feedback={results.feedback}
          onRestart={handleRestart}
          isLoggedIn={isLoggedIn}
          mode={mode || undefined}
        />
      )}
    </div>
  );
}
