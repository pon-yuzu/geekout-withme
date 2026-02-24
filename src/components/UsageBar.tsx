import { useState, useEffect } from 'react';

interface FeatureUsage {
  used: number;
  limit: number;
}

interface UsageData {
  level_check: FeatureUsage;
  workbook: FeatureUsage;
  translation: FeatureUsage;
}

const LABELS: Record<string, { en: string; ja: string; icon: string }> = {
  level_check: { en: 'Level Check', ja: 'レベルチェック', icon: '📝' },
  workbook: { en: 'Workbook', ja: 'ワークブック', icon: '📖' },
  translation: { en: 'Translation', ja: '翻訳', icon: '🌐' },
};

function barColor(ratio: number): string {
  if (ratio >= 1) return '#ef4444';
  if (ratio >= 0.8) return '#f59e0b';
  return '#22c55e';
}

export default function UsageBar() {
  const [data, setData] = useState<UsageData | null>(null);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'ja'>('en');

  useEffect(() => {
    const cookieLang = document.cookie.match(/lang=(en|ja)/)?.[1];
    if (cookieLang) setLang(cookieLang as 'en' | 'ja');

    fetch('/api/usage')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setData(d))
      .catch(() => {});
  }, []);

  if (!data) return null;

  const { level_check, workbook, translation } = data;
  const compact = `${level_check.used}/${level_check.limit}  ${workbook.used}/${workbook.limit}  ${translation.used}/${translation.limit}`;

  const features = [
    { key: 'level_check', ...level_check },
    { key: 'workbook', ...workbook },
    { key: 'translation', ...translation },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9998,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '13px',
      }}
    >
      {open ? (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            padding: '14px 16px',
            minWidth: '220px',
            border: '1px solid #fed7aa',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontWeight: 600, color: '#374151', fontSize: '13px' }}>
              {lang === 'ja' ? 'AI 使用量（今日）' : 'AI Usage (Today)'}
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                fontSize: '16px',
                lineHeight: 1,
                padding: '0 0 0 8px',
              }}
            >
              &times;
            </button>
          </div>
          {features.map((f) => {
            const ratio = f.limit > 0 ? f.used / f.limit : 0;
            const label = LABELS[f.key];
            return (
              <div key={f.key} style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '3px',
                    color: '#4b5563',
                  }}
                >
                  <span>
                    {label.icon} {lang === 'ja' ? label.ja : label.en}
                  </span>
                  <span style={{ fontWeight: 500 }}>
                    {f.used}/{f.limit}
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    borderRadius: '3px',
                    background: '#f3f4f6',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(ratio * 100, 100)}%`,
                      borderRadius: '3px',
                      background: barColor(ratio),
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: '#1f2937',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'transform 0.15s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span style={{ fontSize: '14px' }}>&#9889;</span>
          <span>{compact}</span>
        </button>
      )}
    </div>
  );
}
