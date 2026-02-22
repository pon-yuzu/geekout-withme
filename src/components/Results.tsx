import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/index';

interface AssessmentFeedback {
  feedback?: string;
  studyTips?: string[];
  focusAreas?: string[];
  strengths?: string[];
  improvements?: string[];
  isFallback?: boolean;
}

interface Props {
  language: 'english' | 'japanese';
  textLevel?: string;
  listeningLevel?: string;
  voiceLevel?: string;
  feedback?: AssessmentFeedback;
  isFallback?: boolean;
  onRestart: () => void;
  isLoggedIn?: boolean;
  mode?: string;
}

const resourceRecommendations: Record<string, Record<string, { name: string; url: string; description: string }[]>> = {
  english: {
    'Starter': [
      { name: 'VOA Learning English - Beginning', url: 'https://learningenglish.voanews.com/p/5609.html', description: 'Video lessons with slow, clear speech' },
      { name: 'ESOL Courses', url: 'https://www.esolcourses.com/', description: 'Simple reading materials' },
    ],
    'A1': [
      { name: 'VOA Learning English - Beginning', url: 'https://learningenglish.voanews.com/p/5609.html', description: 'Video lessons with slow, clear speech' },
      { name: 'ESOL Courses', url: 'https://www.esolcourses.com/', description: 'Simple reading materials' },
    ],
    'A2': [
      { name: 'VOA Learning English', url: 'https://learningenglish.voanews.com/', description: 'News at a slower pace' },
      { name: 'ER Central', url: 'https://er-central.com/', description: 'Short graded readings' },
    ],
    'B1': [
      { name: 'VOA - Intermediate', url: 'https://learningenglish.voanews.com/', description: 'Health, Science, Culture news' },
      { name: 'TED-Ed', url: 'https://ed.ted.com/', description: 'Educational videos with subtitles' },
    ],
    'B2': [
      { name: 'VOA - Words & Their Stories', url: 'https://learningenglish.voanews.com/', description: 'Idioms and expressions' },
      { name: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish/', description: 'Various topics and levels' },
    ],
    'C1': [
      { name: 'The Economist', url: 'https://www.economist.com/', description: 'Advanced reading material' },
      { name: 'NPR Podcasts', url: 'https://www.npr.org/podcasts/', description: 'Native-level listening' },
    ],
  },
  japanese: {
    'Starter': [
      { name: 'Tadoku Free Books', url: 'https://tadoku.org/japanese/free-books/', description: 'Graded readers with audio - Level 0-1' },
      { name: 'Yomujp - N5', url: 'https://yomujp.com/', description: 'Simple readings with furigana' },
    ],
    'N5': [
      { name: 'Tadoku Free Books', url: 'https://tadoku.org/japanese/free-books/', description: 'Graded readers with audio - Level 0-1' },
      { name: 'Yomujp - N5', url: 'https://yomujp.com/', description: 'Simple readings with furigana' },
    ],
    'N4': [
      { name: 'Tadoku Free Books', url: 'https://tadoku.org/japanese/free-books/', description: 'Graded readers - Level 2' },
      { name: 'Yomujp - N4', url: 'https://yomujp.com/', description: 'Culture and daily life topics' },
    ],
    'N3': [
      { name: 'Yomujp - N3', url: 'https://yomujp.com/', description: 'Society and culture readings' },
      { name: 'NHK NEWS WEB EASY', url: 'https://www3.nhk.or.jp/news/easy/', description: 'News in simple Japanese' },
    ],
    'N2': [
      { name: 'Yomujp - N2', url: 'https://yomujp.com/', description: 'More complex topics' },
      { name: 'NHK NEWS', url: 'https://www3.nhk.or.jp/news/', description: 'Regular news in Japanese' },
    ],
    'N1': [
      { name: 'Yomujp - N1', url: 'https://yomujp.com/', description: 'Advanced readings' },
      { name: 'Aozora Bunko', url: 'https://www.aozora.gr.jp/', description: 'Classic Japanese literature' },
    ],
  },
};

// Display name mapping: internal "Starter" → user-facing display
function getDisplayLevel(level: string | undefined, t: (key: string) => string): string {
  if (!level) return '';
  if (level === 'Starter') return t('results.levels.starter');
  return level;
}

export default function Results({ language, textLevel, listeningLevel, voiceLevel, feedback, isFallback, onRestart, isLoggedIn, mode }: Props) {
  const { t } = useTranslation();
  const [showInterests, setShowInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveAttempted = useRef(false);

  const mainLevel = textLevel || listeningLevel || voiceLevel || 'A1';
  const displayTextLevel = getDisplayLevel(textLevel, t);
  const displayListeningLevel = getDisplayLevel(listeningLevel, t);
  const displayVoiceLevel = getDisplayLevel(voiceLevel, t);

  const cardCount = [textLevel, listeningLevel, voiceLevel].filter(Boolean).length;

  // Auto-save for logged-in users
  useEffect(() => {
    if (!isLoggedIn || autoSaveAttempted.current) return;
    autoSaveAttempted.current = true;

    const doSave = async () => {
      setSaveState('saving');
      try {
        const res = await fetch('/api/save-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, mode, textLevel, listeningLevel, voiceLevel, feedback }),
        });
        if (res.ok) {
          setSaveState('saved');
          // Clear any pending session data
          try { sessionStorage.removeItem('pendingAssessment'); } catch {}
        } else {
          setSaveState('error');
        }
      } catch {
        setSaveState('error');
      }
    };

    doSave();
  }, [isLoggedIn]);

  const handleRetry = async () => {
    setSaveState('saving');
    try {
      const res = await fetch('/api/save-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, mode, textLevel, listeningLevel, voiceLevel, feedback }),
      });
      if (res.ok) {
        setSaveState('saved');
        try { sessionStorage.removeItem('pendingAssessment'); } catch {}
      } else {
        setSaveState('error');
      }
    } catch {
      setSaveState('error');
    }
  };

  const getLevelDescription = (level: string): string => {
    if (level === 'Starter') {
      const key = `results.levels.${language}.starter.desc`;
      const result = t(key);
      return result !== key ? result : '';
    }
    const key = `results.levels.${language}.${level}.desc`;
    const result = t(key);
    return result !== key ? result : '';
  };

  const getNextGoal = (level: string): string => {
    if (level === 'Starter') {
      const key = `results.levels.${language}.starter.goal`;
      const result = t(key);
      return result !== key ? result : '';
    }
    const key = `results.levels.${language}.${level}.goal`;
    const result = t(key);
    return result !== key ? result : '';
  };

  const resources = resourceRecommendations[language][mainLevel] ||
    resourceRecommendations[language][language === 'english' ? 'A1' : 'N5'];

  const interests = [
    { id: 'anime', emoji: '🎬', labelKey: 'results.interests.anime' },
    { id: 'music', emoji: '🎵', labelKey: 'results.interests.music' },
    { id: 'cooking', emoji: '🍳', labelKey: 'results.interests.cooking' },
    { id: 'tech', emoji: '💻', labelKey: 'results.interests.tech' },
    { id: 'gaming', emoji: '🎮', labelKey: 'results.interests.gaming' },
    { id: 'travel', emoji: '✈️', labelKey: 'results.interests.travel' },
    { id: 'sports', emoji: '⚽', labelKey: 'results.interests.sports' },
    { id: 'business', emoji: '💼', labelKey: 'results.interests.business' },
  ];

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div>
      {/* Results Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">{t('results.title')}</h2>
        <p className="text-gray-500">{t('results.subtitle')}</p>
      </div>

      {/* Level Cards */}
      <div className={`grid gap-4 mb-8 ${cardCount >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {textLevel && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📝</span>
              <span className="text-sm text-gray-500">{t('results.readingWriting')}</span>
            </div>
            <div className="text-3xl font-bold text-orange-500 mb-2">{displayTextLevel}</div>
            <p className="text-sm text-gray-600 mb-2">{getLevelDescription(textLevel)}</p>
            {getNextGoal(textLevel) && (
              <p className="text-xs text-orange-600 bg-orange-100 rounded-lg px-3 py-2 mt-2">
                {t('results.nextGoal')}: {getNextGoal(textLevel)}
              </p>
            )}
          </div>
        )}
        {listeningLevel && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">👂</span>
              <span className="text-sm text-gray-500">{t('results.listening')}</span>
            </div>
            <div className="text-3xl font-bold text-teal-500 mb-2">{displayListeningLevel}</div>
            <p className="text-sm text-gray-600 mb-2">{getLevelDescription(listeningLevel)}</p>
            {getNextGoal(listeningLevel) && (
              <p className="text-xs text-teal-600 bg-teal-100 rounded-lg px-3 py-2 mt-2">
                {t('results.nextGoal')}: {getNextGoal(listeningLevel)}
              </p>
            )}
          </div>
        )}
        {voiceLevel && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎤</span>
              <span className="text-sm text-gray-500">{t('results.speakingListening')}</span>
            </div>
            <div className="text-3xl font-bold text-teal-500 mb-2">{displayVoiceLevel}</div>
            <p className="text-sm text-gray-600 mb-2">{getLevelDescription(voiceLevel)}</p>
            {getNextGoal(voiceLevel) && (
              <p className="text-xs text-teal-600 bg-teal-50 rounded-lg px-3 py-2 mt-2">
                {t('results.nextGoal')}: {getNextGoal(voiceLevel)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Auto-save indicator for logged-in users */}
      {isLoggedIn && (
        <div className="text-center mb-4">
          {saveState === 'saving' && (
            <span className="text-sm text-gray-500">{t('results.autoSaving')}</span>
          )}
          {saveState === 'saved' && (
            <span className="text-sm text-green-600">{t('results.autoSaved')}</span>
          )}
          {saveState === 'error' && (
            <button
              onClick={handleRetry}
              className="text-sm text-red-600 hover:text-red-700 underline underline-offset-2"
            >
              {t('results.saveError')} — {t('results.retry') || 'Retry'}
            </button>
          )}
        </div>
      )}

      {/* Signup banner for non-logged-in users */}
      {!isLoggedIn && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 mb-8 text-center">
          <div className="text-3xl mb-3">💾</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {t('results.signupBanner.title')}
          </h3>
          <p className="text-gray-600 text-sm mb-5">
            {t('results.signupBanner.desc')}
          </p>
          <a
            href="/signup"
            className="inline-block w-full max-w-xs py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors mb-3"
          >
            {t('results.signupBanner.btn')}
          </a>
          <br />
          <a
            href="/login"
            className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
          >
            {t('results.signupBanner.login')}
          </a>
        </div>
      )}

      {/* Skill Gap Notice */}
      {(() => {
        const levels = [textLevel, listeningLevel, voiceLevel].filter(Boolean);
        const hasGap = levels.length >= 2 && new Set(levels).size > 1;
        return hasGap ? (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-8">
            <p className="text-yellow-700">
              {t('results.skillGap')}
            </p>
          </div>
        ) : null;
      })()}

      {/* AI Fallback Notice */}
      {(isFallback || feedback?.isFallback) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-blue-700 text-sm">
            {t('results.fallbackNotice')}
          </p>
        </div>
      )}

      {/* AI Feedback */}
      {feedback && (feedback.feedback || feedback.studyTips?.length || feedback.focusAreas?.length || feedback.strengths?.length || feedback.improvements?.length) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">{t('results.aiFeedback')}</h3>

          {feedback.feedback && (
            <p className="text-gray-600 mb-4">{feedback.feedback}</p>
          )}

          {feedback.strengths && feedback.strengths.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-green-700 mb-2">{t('results.strengths')}</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {feedback.strengths.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.improvements && feedback.improvements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-amber-600 mb-2">{t('results.improvements')}</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {feedback.improvements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.focusAreas && feedback.focusAreas.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-blue-600 mb-2">{t('results.focusAreas')}</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {feedback.focusAreas.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.studyTips && feedback.studyTips.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-purple-600 mb-2">{t('results.studyTips')}</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {feedback.studyTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommended Resources */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">{t('results.resources')}</h3>
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border border-gray-200 rounded-xl p-4 hover:bg-orange-50 transition-colors shadow-sm"
            >
              <div className="font-medium">{resource.name}</div>
              <div className="text-sm text-gray-500">{resource.description}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Interest Selection */}
      {!showInterests ? (
        <button
          onClick={() => setShowInterests(true)}
          className="w-full py-4 bg-white border border-gray-200 rounded-xl hover:bg-orange-50 transition-colors mb-8 shadow-sm"
        >
          {t('results.personalizeBtn')}
        </button>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('results.interestsTitle')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {interests.map(interest => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`p-3 rounded-xl text-center transition-all ${
                  selectedInterests.includes(interest.id)
                    ? 'bg-orange-50 border-2 border-orange-500'
                    : 'bg-white border-2 border-gray-200 hover:bg-orange-50'
                }`}
              >
                <span className="text-2xl block">{interest.emoji}</span>
                <span className="text-sm">{t(interest.labelKey)}</span>
              </button>
            ))}
          </div>
          {selectedInterests.length > 0 && (
            <p className="text-sm text-gray-500 text-center">
              {t('results.comingSoon')}<br />
              {t('results.comingSoonSub')}
            </p>
          )}
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-white border border-gray-200 rounded-full hover:bg-orange-50 transition-colors shadow-sm"
        >
          {t('results.takeAgain')}
        </button>
        <a
          href="/community"
          className="px-6 py-3 bg-orange-500 text-white rounded-full text-center hover:bg-orange-600 transition-colors"
        >
          {t('results.joinCommunity')}
        </a>
      </div>
    </div>
  );
}
