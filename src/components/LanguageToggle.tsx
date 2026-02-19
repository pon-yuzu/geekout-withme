import { setLangCookie, type Lang } from '../i18n/index';

interface Props {
  lang: Lang;
}

export default function LanguageToggle({ lang }: Props) {
  const toggle = () => {
    setLangCookie(lang === 'en' ? 'ja' : 'en');
  };

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 text-xs font-bold border border-gray-300 rounded-md hover:border-orange-500 hover:text-orange-500 transition-colors"
      title={lang === 'en' ? 'Switch to Japanese' : '英語に切り替え'}
    >
      {lang === 'en' ? 'JA' : 'EN'}
    </button>
  );
}
