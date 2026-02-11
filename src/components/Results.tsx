import { useState } from 'react';

interface Props {
  language: 'english' | 'japanese';
  textLevel?: string;
  voiceLevel?: string;
  onRestart: () => void;
}

const levelDescriptions: Record<string, Record<string, string>> = {
  english: {
    'Below A1': 'Just starting out! Focus on basic vocabulary and simple phrases.',
    'A1': 'Beginner - You can understand and use familiar everyday expressions.',
    'A2': 'Elementary - You can communicate in simple, routine tasks.',
    'B1': 'Intermediate - You can deal with most situations while traveling.',
    'B2': 'Upper Intermediate - You can interact with fluency and spontaneity.',
    'C1': 'Advanced - You can express yourself fluently and spontaneously.',
    'C2': 'Mastery - You can understand virtually everything heard or read.',
  },
  japanese: {
    'Below N5': 'Just starting out! Focus on hiragana, katakana, and basic phrases.',
    'N5': 'Beginner - You can read and understand typical expressions and kanji.',
    'N4': 'Elementary - You can understand basic Japanese in everyday situations.',
    'N3': 'Intermediate - You can understand Japanese used in everyday situations to a certain degree.',
    'N2': 'Upper Intermediate - You can understand Japanese used in everyday situations and various circumstances.',
    'N1': 'Advanced - You can understand Japanese used in a variety of circumstances.',
  },
};

const resourceRecommendations: Record<string, Record<string, { name: string; url: string; description: string }[]>> = {
  english: {
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

export default function Results({ language, textLevel, voiceLevel, onRestart }: Props) {
  const [showInterests, setShowInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const descriptions = levelDescriptions[language];
  const mainLevel = textLevel || voiceLevel || 'A1';
  
  // Get resources for the main level, fallback to beginner if not found
  const resources = resourceRecommendations[language][mainLevel] || 
    resourceRecommendations[language][language === 'english' ? 'A1' : 'N5'];

  const interests = [
    { id: 'anime', emoji: '🎬', label: 'Anime / Drama' },
    { id: 'music', emoji: '🎵', label: 'Music' },
    { id: 'cooking', emoji: '🍳', label: 'Cooking / Food' },
    { id: 'tech', emoji: '💻', label: 'Technology' },
    { id: 'gaming', emoji: '🎮', label: 'Gaming' },
    { id: 'travel', emoji: '✈️', label: 'Travel' },
    { id: 'sports', emoji: '⚽', label: 'Sports' },
    { id: 'business', emoji: '💼', label: 'Business' },
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
        <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
        <p className="text-slate-400">Here's what we found</p>
      </div>

      {/* Level Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {textLevel && (
          <div className="bg-gradient-to-br from-primary-500/20 to-primary-500/5 border border-primary-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📝</span>
              <span className="text-sm text-slate-400">Reading & Writing</span>
            </div>
            <div className="text-3xl font-bold mb-2">{textLevel}</div>
            <p className="text-sm text-slate-300">{descriptions[textLevel] || descriptions['A1']}</p>
          </div>
        )}
        {voiceLevel && (
          <div className="bg-gradient-to-br from-accent-500/20 to-accent-500/5 border border-accent-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎤</span>
              <span className="text-sm text-slate-400">Speaking & Listening</span>
            </div>
            <div className="text-3xl font-bold mb-2">{voiceLevel}</div>
            <p className="text-sm text-slate-300">{descriptions[voiceLevel] || descriptions['A1']}</p>
          </div>
        )}
      </div>

      {/* Skill Gap Notice */}
      {textLevel && voiceLevel && textLevel !== voiceLevel && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
          <p className="text-yellow-200">
            💡 Your reading/writing and speaking levels are different — this is totally normal! 
            Many learners have stronger skills in one area.
          </p>
        </div>
      )}

      {/* Recommended Resources */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">📚 Recommended Free Resources</h3>
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
            >
              <div className="font-medium">{resource.name}</div>
              <div className="text-sm text-slate-400">{resource.description}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Interest Selection */}
      {!showInterests ? (
        <button
          onClick={() => setShowInterests(true)}
          className="w-full py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors mb-8"
        >
          ✨ Get personalized recommendations based on your interests
        </button>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">What are you interested in?</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {interests.map(interest => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`p-3 rounded-xl text-center transition-all ${
                  selectedInterests.includes(interest.id)
                    ? 'bg-primary-500/30 border-2 border-primary-500'
                    : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                }`}
              >
                <span className="text-2xl block">{interest.emoji}</span>
                <span className="text-sm">{interest.label}</span>
              </button>
            ))}
          </div>
          {selectedInterests.length > 0 && (
            <p className="text-sm text-slate-400 text-center">
              🚧 Personalized recommendations coming soon!<br />
              Join our community to get notified.
            </p>
          )}
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors"
        >
          🔄 Take Again
        </button>
        <a
          href="/community"
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-center hover:opacity-90 transition-opacity"
        >
          🌏 Join Our Community
        </a>
      </div>
    </div>
  );
}
