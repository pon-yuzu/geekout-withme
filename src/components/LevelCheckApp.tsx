import { useState } from 'react';
import TextAssessment from './TextAssessment';
import VoiceAssessment from './VoiceAssessment';
import Results from './Results';

type Language = 'english' | 'japanese';
type Step = 'select-language' | 'select-mode' | 'text-assessment' | 'voice-assessment' | 'results';
type AssessmentMode = 'text' | 'voice' | 'both';

interface AssessmentResult {
  textLevel?: string;
  voiceLevel?: string;
  details?: string;
}

export default function LevelCheckApp() {
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

  const handleRestart = () => {
    setStep('select-language');
    setLanguage(null);
    setMode(null);
    setResults({});
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
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
                ? 'bg-primary-500'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Step: Select Language */}
      {step === 'select-language' && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-6">Which language are you learning?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleLanguageSelect('japanese')}
              className="px-8 py-6 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
            >
              <span className="text-4xl block mb-2">🇯🇵</span>
              <span className="text-lg font-medium">Japanese</span>
              <span className="block text-sm text-slate-400">日本語</span>
            </button>
            <button
              onClick={() => handleLanguageSelect('english')}
              className="px-8 py-6 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
            >
              <span className="text-4xl block mb-2">🇺🇸</span>
              <span className="text-lg font-medium">English</span>
              <span className="block text-sm text-slate-400">英語</span>
            </button>
          </div>
        </div>
      )}

      {/* Step: Select Mode */}
      {step === 'select-mode' && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">What would you like to assess?</h2>
          <p className="text-slate-400 mb-6">You can do both for a complete picture</p>
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <button
              onClick={() => handleModeSelect('text')}
              className="px-6 py-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors text-left"
            >
              <span className="text-2xl mr-3">📝</span>
              <span className="font-medium">Reading & Writing</span>
              <span className="block text-sm text-slate-400 ml-9">Text-based questions</span>
            </button>
            <button
              onClick={() => handleModeSelect('voice')}
              className="px-6 py-4 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors text-left"
            >
              <span className="text-2xl mr-3">🎤</span>
              <span className="font-medium">Speaking & Listening</span>
              <span className="block text-sm text-slate-400 ml-9">Voice-based questions</span>
            </button>
            <button
              onClick={() => handleModeSelect('both')}
              className="px-6 py-4 bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/50 rounded-xl hover:from-primary-500/30 hover:to-accent-500/30 transition-colors text-left"
            >
              <span className="text-2xl mr-3">✨</span>
              <span className="font-medium">Both (Recommended)</span>
              <span className="block text-sm text-slate-400 ml-9">Complete assessment</span>
            </button>
          </div>
          <button
            onClick={() => setStep('select-language')}
            className="mt-6 text-slate-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Step: Text Assessment */}
      {step === 'text-assessment' && language && (
        <TextAssessment
          language={language}
          onComplete={handleTextComplete}
          onBack={() => setStep('select-mode')}
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
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
