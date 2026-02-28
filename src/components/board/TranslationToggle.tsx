import { useState } from 'react';
import { useTranslation } from '../../i18n/index';

interface TranslationToggleProps {
  sourceType: 'thread_title' | 'thread_body' | 'reply';
  sourceId: string;
  text: string;
}

export default function TranslationToggle({ sourceType, sourceId, text }: TranslationToggleProps) {
  const { t, lang } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const targetLanguage = lang === 'ja' ? 'en' : 'ja';

  const handleToggle = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    if (translatedText) {
      setExpanded(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/board/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: sourceType,
          source_id: sourceId,
          target_language: targetLanguage,
          text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTranslatedText(data.translated_text);
        setExpanded(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={handleToggle}
        disabled={loading}
        className="text-xs text-teal-500 hover:text-teal-600 transition-colors"
      >
        {loading ? t('board.translating') : t('board.translate')}
      </button>
      {expanded && translatedText && (
        <div className="mt-2 p-2 bg-teal-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
          {translatedText}
        </div>
      )}
    </div>
  );
}
