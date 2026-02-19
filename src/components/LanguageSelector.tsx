import { setLangCookie, type Lang } from '../i18n/index';

export default function LanguageSelector() {
  const handleSelect = (lang: Lang) => {
    setLangCookie(lang);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-xl text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Choose Your Language
        </h2>
        <p className="text-gray-500 mb-1">言語を選んでください</p>
        <p className="text-gray-400 text-sm mb-8">
          Select the language for this site
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleSelect('en')}
            className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center gap-4"
          >
            <span className="text-3xl">🇺🇸</span>
            <div className="text-left">
              <span className="text-lg font-semibold block">English</span>
              <span className="text-sm text-gray-500">Use this site in English</span>
            </div>
          </button>

          <button
            onClick={() => handleSelect('ja')}
            className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center gap-4"
          >
            <span className="text-3xl">🇯🇵</span>
            <div className="text-left">
              <span className="text-lg font-semibold block">日本語</span>
              <span className="text-sm text-gray-500">日本語でサイトを表示</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
