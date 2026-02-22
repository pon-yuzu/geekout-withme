import { useState, useEffect } from 'react';
import {
  CATEGORIES,
  CONVERSATION_LEVELS,
  ICEBREAKERS,
  type ConversationCard,
  type ConversationLevelId,
  type CategoryKey,
} from '../data/conversationData';
import { useTranslation } from '../i18n/index';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface DeckCard extends ConversationCard {
  category: CategoryKey;
}

type AccessTier = 'anonymous' | 'free' | 'premium';

const ANONYMOUS_CARD_LIMIT = 3;

interface Props {
  autoLevel?: ConversationLevelId | null;
  lang?: string;
  accessTier?: AccessTier;
}

export default function ConversationCardsStandalone({ autoLevel, lang = 'ja', accessTier = 'anonymous' }: Props) {
  const { t } = useTranslation();
  const isEn = lang === 'en';
  const isAnonymous = accessTier === 'anonymous';
  const catKeys = Object.keys(CATEGORIES) as CategoryKey[];
  const firstCat = catKeys[0];

  const [level, setLevel] = useState<ConversationLevelId>(autoLevel || 'beginner');
  const [selectedCats, setSelectedCats] = useState<CategoryKey[]>(
    isAnonymous ? [firstCat] : catKeys
  );
  const [started, setStarted] = useState(false);

  const toggleCat = (cat: CategoryKey) => {
    if (isAnonymous) return;
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const selectAll = () => { if (!isAnonymous) setSelectedCats(catKeys); };
  const selectNone = () => { if (!isAnonymous) setSelectedCats([]); };

  if (!started) {
    return (
      <div className="max-w-xl mx-auto">
        {/* Preview note for anonymous */}
        {isAnonymous && (
          <div className="bg-orange-100 border border-orange-300 rounded-xl p-4 mb-6 text-sm text-orange-700 text-center font-medium">
            {t('convCards.anonymous.previewNote')}
          </div>
        )}

        {/* How to use */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-sm text-gray-600">
          {isEn
            ? 'How to use: Pick a card, then try writing about it in your journal, talking to yourself, or preparing for your next language exchange!'
            : '使い方：カードを選んで、日記に書いたり、独り言で話してみたり、次の言語交換の準備に使おう！'}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Level */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              {isEn ? 'Your Level' : 'あなたのレベル'}
            </h3>
            <div className="flex gap-2">
              {CONVERSATION_LEVELS.map(l => (
                <button
                  key={l.id}
                  onClick={() => !isAnonymous && setLevel(l.id)}
                  disabled={isAnonymous}
                  className={`flex-1 py-3 px-2 rounded-xl border-2 text-center text-sm font-medium transition-colors ${
                    level === l.id
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  } ${isAnonymous ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-xl mb-1">{l.emoji}</div>
                  <div>{l.label}</div>
                  <div className="text-[10px] opacity-70">{l.ja}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isEn ? 'Topics' : 'トピック'}
              </h3>
              {!isAnonymous && (
                <div className="flex gap-2 text-xs">
                  <button onClick={selectAll} className="text-orange-500 hover:text-orange-600">
                    {isEn ? 'All' : '全選択'}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button onClick={selectNone} className="text-gray-400 hover:text-gray-500">
                    {isEn ? 'None' : '解除'}
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {catKeys.map(key => {
                const cat = CATEGORIES[key];
                const selected = selectedCats.includes(key);
                const disabled = isAnonymous && key !== firstCat;
                return (
                  <button
                    key={key}
                    onClick={() => toggleCat(key)}
                    disabled={disabled}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${
                      selected
                        ? 'border-orange-400 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start */}
          <button
            onClick={() => selectedCats.length > 0 && setStarted(true)}
            disabled={selectedCats.length === 0}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isEn ? 'Draw Cards' : 'カードを引く'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <CardBrowser
      level={level}
      selectedCats={selectedCats}
      onBack={() => setStarted(false)}
      lang={lang}
      accessTier={accessTier}
    />
  );
}

// ─── Card Browser ────────────────────────────────────────────────────────────

function CardBrowser({
  level,
  selectedCats,
  onBack,
  lang,
  accessTier,
}: {
  level: ConversationLevelId;
  selectedCats: CategoryKey[];
  onBack: () => void;
  lang: string;
  accessTier: AccessTier;
}) {
  const { t } = useTranslation();
  const isEn = lang === 'en';
  const isAnonymous = accessTier === 'anonymous';

  const allCards: DeckCard[] = [];
  selectedCats.forEach(catKey => {
    const cat = CATEGORIES[catKey];
    const levelIndex = CONVERSATION_LEVELS.findIndex(l => l.id === level);
    CONVERSATION_LEVELS.forEach((l, i) => {
      if (i >= levelIndex && i <= levelIndex + 1 && cat.cards[l.id]) {
        cat.cards[l.id].forEach(card => allCards.push({ ...card, category: catKey }));
      }
    });
  });

  const [deck, setDeck] = useState(() => shuffleArray(allCards));
  const [cardIdx, setCardIdx] = useState(0);
  const [icebreaker, setIcebreaker] = useState(() => Math.floor(Math.random() * ICEBREAKERS.length));
  const [showSignupCta, setShowSignupCta] = useState(false);

  useEffect(() => {
    setDeck(shuffleArray(allCards));
    setCardIdx(0);
    setShowSignupCta(false);
  }, [level, selectedCats.join(',')]);

  const effectiveTotal = isAnonymous ? Math.min(deck.length, ANONYMOUS_CARD_LIMIT) : deck.length;
  const currentCard = deck[cardIdx % deck.length];

  const handleNext = () => {
    if (isAnonymous && cardIdx + 1 >= ANONYMOUS_CARD_LIMIT) {
      setShowSignupCta(true);
      return;
    }
    setCardIdx(i => i + 1);
  };

  const handleShuffle = () => {
    if (isAnonymous) return;
    setDeck(shuffleArray(allCards));
    setCardIdx(0);
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-4 text-sm text-gray-500 hover:text-orange-500 transition-colors flex items-center gap-1"
      >
        ← {isEn ? 'Change Settings' : '設定に戻る'}
      </button>

      {/* Icebreaker */}
      <button
        onClick={() => setIcebreaker((icebreaker + 1) % ICEBREAKERS.length)}
        className="w-full text-left p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl mb-4"
      >
        <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold mb-1">
          {isEn ? 'Icebreaker — tap for next!' : 'アイスブレイカー — タップで次！'}
        </div>
        <div className="text-sm text-gray-700 leading-snug">{ICEBREAKERS[icebreaker].en}</div>
        <div className="text-xs text-gray-500 mt-0.5">{ICEBREAKERS[icebreaker].ja}</div>
      </button>

      {/* Signup CTA overlay for anonymous users */}
      {showSignupCta && (
        <div className="bg-white border-2 border-orange-300 rounded-2xl p-8 shadow-lg text-center mb-4">
          <div className="text-4xl mb-4">🔓</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {t('convCards.anonymous.signupTitle')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('convCards.anonymous.signupDesc')}
          </p>
          <a
            href="/signup"
            className="inline-block w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors mb-3"
          >
            {t('convCards.anonymous.signupBtn')}
          </a>
          <a
            href="/login"
            className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
          >
            {t('convCards.anonymous.loginLink')}
          </a>
        </div>
      )}

      {/* Topic Card */}
      {!showSignupCta && currentCard && (
        <TopicCardStandalone
          card={currentCard}
          cardIndex={cardIdx % effectiveTotal}
          totalCards={effectiveTotal}
          onNext={handleNext}
          onShuffle={handleShuffle}
          disableShuffle={isAnonymous}
        />
      )}
    </div>
  );
}

// ─── Topic Card ──────────────────────────────────────────────────────────────

function TopicCardStandalone({
  card,
  cardIndex,
  totalCards,
  onNext,
  onShuffle,
  disableShuffle,
}: {
  card: DeckCard;
  cardIndex: number;
  totalCards: number;
  onNext: () => void;
  onShuffle: () => void;
  disableShuffle?: boolean;
}) {
  const [showVocab, setShowVocab] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);

  useEffect(() => {
    setCurrentPrompt(0);
    setShowVocab(false);
  }, [card.topic]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] uppercase tracking-widest text-orange-500 font-semibold">
          {CATEGORIES[card.category].label}
        </span>
        <span className="text-[10px] text-gray-400">
          {cardIndex + 1} / {totalCards}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-800 leading-tight">{card.topic}</h3>
      <p className="text-sm text-gray-500 mb-4">{card.ja}</p>

      {/* Prompt */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
          Conversation Prompt
        </div>
        <div className="bg-orange-50 border-l-3 border-orange-400 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
          {card.prompts[currentPrompt]}
        </div>
        <div className="flex gap-1.5 mt-2">
          {card.prompts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPrompt(i)}
              className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
                currentPrompt === i
                  ? 'bg-orange-100 text-orange-600 border border-orange-300'
                  : 'bg-gray-50 text-gray-400 border border-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Vocab */}
      <div className="mb-4">
        <button
          onClick={() => setShowVocab(!showVocab)}
          className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600"
        >
          {showVocab ? '▾' : '▸'} Useful Vocab / 役立つ語彙
        </button>
        {showVocab && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {card.vocab.map((v, i) => (
              <span key={i} className="bg-gray-100 rounded-md px-2.5 py-1 text-xs text-gray-600">
                {v}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onShuffle}
          disabled={disableShuffle}
          className={`flex-1 py-2.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl transition-colors ${
            disableShuffle ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          Shuffle
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-2.5 text-sm font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors"
        >
          Next Card →
        </button>
      </div>
    </div>
  );
}
