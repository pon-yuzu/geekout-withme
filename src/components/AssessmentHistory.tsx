import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/index';

interface AssessmentRecord {
  id: string;
  language: string;
  mode: string;
  text_level: string | null;
  voice_level: string | null;
  feedback: any;
  created_at: string;
}

export default function AssessmentHistory() {
  const { t, lang } = useTranslation();
  const [results, setResults] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/assessment-history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setResults(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">{t('history.loading')}</div>;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-xl font-medium mb-2">{t('history.empty.title')}</h3>
        <p className="text-gray-500 mb-6">{t('history.empty.desc')}</p>
        <a href="/level-check" className="px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors inline-block">
          {t('history.empty.cta')}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map(result => (
        <div key={result.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span>{result.language === 'english' ? '🇺🇸' : '🇯🇵'}</span>
              <span className="font-medium capitalize">{result.language}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">{result.mode}</span>
            </div>
            <span className="text-sm text-gray-500" suppressHydrationWarning>
              {new Date(result.created_at).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex gap-4">
            {result.text_level && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('history.readingWriting')}</span>
                <span className="font-bold text-orange-500">{result.text_level}</span>
              </div>
            )}
            {result.voice_level && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('history.speaking')}</span>
                <span className="font-bold text-teal-500">{result.voice_level}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
