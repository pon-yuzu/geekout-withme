import { useState, useEffect, useRef } from 'react';
import {
  CATEGORIES,
  CONVERSATION_LEVELS,
  ICEBREAKERS,
  ROLES,
  type ConversationCard,
  type ConversationLevelId,
  type CategoryKey,
} from '../../data/conversationData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeckCard extends ConversationCard {
  category: CategoryKey;
}

interface SessionConfig {
  myLevel: ConversationLevelId;
  partnerLevel: ConversationLevelId;
  selectedCats: CategoryKey[];
  sessionMinutes: number;
}

interface CardData {
  category: string;
  topic: string;
  topicJa: string;
  prompt: string;
  vocab: string[];
}

interface TimerEventData {
  event: 'start' | 'language_switch' | 'end';
  totalMinutes?: number;
  newLang?: 'ja' | 'en';
}

interface Props {
  onShareToChat?: (text: string) => void;
  onShareCardToChat?: (cardData: CardData) => void;
  onTimerEvent?: (eventData: TimerEventData) => void;
  autoLevel?: ConversationLevelId | null;
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen({
  onStart,
  defaultLevel,
}: {
  onStart: (config: SessionConfig) => void;
  defaultLevel?: ConversationLevelId | null;
}) {
  const [myLevel, setMyLevel] = useState<ConversationLevelId>(defaultLevel || 'beginner');
  const [partnerLevel, setPartnerLevel] = useState<ConversationLevelId>('beginner');
  const [selectedCats, setSelectedCats] = useState<CategoryKey[]>(['cooking']);
  const [sessionMinutes, setSessionMinutes] = useState(20);

  const toggleCat = (cat: CategoryKey) => {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const canStart = selectedCats.length > 0;

  return (
    <div className="space-y-5 p-1">
      {/* My Level */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Your Level / あなたのレベル
        </h4>
        <div className="flex gap-2">
          {CONVERSATION_LEVELS.map(l => (
            <button
              key={l.id}
              onClick={() => setMyLevel(l.id)}
              className={`flex-1 py-2 px-2 rounded-lg border-2 text-center text-xs font-medium transition-colors ${
                myLevel === l.id
                  ? 'border-orange-400 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <div className="text-lg mb-0.5">{l.emoji}</div>
              <div>{l.label}</div>
              <div className="text-[10px] opacity-70">{l.ja}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Partner Level */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Partner's Level / 相手のレベル
        </h4>
        <div className="flex gap-2">
          {CONVERSATION_LEVELS.map(l => (
            <button
              key={l.id}
              onClick={() => setPartnerLevel(l.id)}
              className={`flex-1 py-2 px-2 rounded-lg border-2 text-center text-xs font-medium transition-colors ${
                partnerLevel === l.id
                  ? 'border-teal-400 bg-teal-50 text-teal-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <div className="text-lg mb-0.5">{l.emoji}</div>
              <div>{l.label}</div>
              <div className="text-[10px] opacity-70">{l.ja}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Topics */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Topics / トピック
        </h4>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORIES) as CategoryKey[]).map(key => {
            const cat = CATEGORIES[key];
            const selected = selectedCats.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleCat(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-colors ${
                  selected
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Session Duration */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Session / セッション時間
        </h4>
        <div className="flex gap-2">
          {[10, 15, 20, 30].map(m => (
            <button
              key={m}
              onClick={() => setSessionMinutes(m)}
              className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                sessionMinutes === m
                  ? 'border-orange-400 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              {m}min
            </button>
          ))}
        </div>
      </div>

      {/* Start */}
      <button
        onClick={() => canStart && onStart({ myLevel, partnerLevel, selectedCats, sessionMinutes })}
        disabled={!canStart}
        className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        START SESSION / セッション開始
      </button>
    </div>
  );
}

// ─── Session Timer ────────────────────────────────────────────────────────────

function SessionTimer({
  totalSeconds,
  isRunning,
  onToggle,
  onReset,
  lang,
  onLangSwitch,
  onTimerEnd,
}: {
  totalSeconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  lang: 'en' | 'ja';
  onLangSwitch: () => void;
  onTimerEnd?: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const halfTime = Math.floor(totalSeconds / 2);
  const remaining = totalSeconds - elapsed;
  const isAlmostDone = remaining <= 60 && remaining > 0;
  const pct = (elapsed / totalSeconds) * 100;

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining]);

  useEffect(() => {
    if (elapsed === halfTime && isRunning) {
      onLangSwitch();
    }
  }, [elapsed, halfTime, isRunning, onLangSwitch]);

  useEffect(() => {
    if (remaining === 0 && isRunning) {
      onTimerEnd?.();
    }
  }, [remaining, isRunning, onTimerEnd]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3">
      {/* Progress bar */}
      <div className="relative h-1.5 bg-gray-100 rounded-full mb-2 overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${
            isAlmostDone ? 'bg-gradient-to-r from-yellow-400 to-red-400' : 'bg-gradient-to-r from-orange-400 to-orange-500'
          }`}
          style={{ width: `${pct}%` }}
        />
        <div className="absolute left-1/2 top-0 w-0.5 h-full bg-yellow-400" />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <div className={`text-xl font-bold tabular-nums ${isAlmostDone ? 'text-red-500' : 'text-gray-800'}`}>
            {formatTime(remaining)}
          </div>
          <div className={`text-[10px] font-semibold ${lang === 'en' ? 'text-orange-500' : 'text-teal-500'}`}>
            {lang === 'en' ? 'English Time' : '日本語タイム'}
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={onToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
              isRunning
                ? 'bg-red-50 text-red-500 border border-red-200'
                : 'bg-orange-50 text-orange-500 border border-orange-200'
            }`}
          >
            {isRunning ? '⏸' : '▶'}
          </button>
          <button
            onClick={() => { setElapsed(0); onReset(); }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-gray-100 text-gray-500 border border-gray-200"
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Topic Card ───────────────────────────────────────────────────────────────

function TopicCard({
  card,
  onNext,
  onShuffle,
  onShare,
  cardIndex,
  totalCards,
}: {
  card: DeckCard;
  onNext: () => void;
  onShuffle: () => void;
  onShare?: () => void;
  cardIndex: number;
  totalCards: number;
}) {
  const [showVocab, setShowVocab] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);

  useEffect(() => {
    setCurrentPrompt(0);
    setShowVocab(false);
  }, [card.topic]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] uppercase tracking-widest text-orange-500 font-semibold">
          {CATEGORIES[card.category].label}
        </span>
        <span className="text-[10px] text-gray-400">
          {cardIndex + 1} / {totalCards}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-gray-800 leading-tight">{card.topic}</h3>
      <p className="text-sm text-gray-500 mb-3">{card.ja}</p>

      {/* Prompt */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
          Conversation Prompt
        </div>
        <div className="bg-orange-50 border-l-3 border-orange-400 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">
          {card.prompts[currentPrompt]}
        </div>
        <div className="flex gap-1.5 mt-2">
          {card.prompts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPrompt(i)}
              className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
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
      <div className="mb-3">
        <button
          onClick={() => setShowVocab(!showVocab)}
          className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600"
        >
          {showVocab ? '▾' : '▸'} Useful Vocab / 役立つ語彙
        </button>
        {showVocab && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {card.vocab.map((v, i) => (
              <span key={i} className="bg-gray-100 rounded-md px-2 py-1 text-xs text-gray-600">
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
          className="flex-1 py-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          🔀 Shuffle
        </button>
        {onShare && (
          <button
            onClick={onShare}
            className="flex-1 py-2 text-xs font-medium text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
          >
            💬 Share
          </button>
        )}
        <button
          onClick={onNext}
          className="flex-[2] py-2 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Next Card →
        </button>
      </div>
    </div>
  );
}

// ─── Icebreaker Widget ────────────────────────────────────────────────────────

function IcebreakerWidget() {
  const [current, setCurrent] = useState(() => Math.floor(Math.random() * ICEBREAKERS.length));

  return (
    <button
      onClick={() => setCurrent((current + 1) % ICEBREAKERS.length)}
      className="w-full text-left p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl mb-3"
    >
      <div className="text-[10px] uppercase tracking-widest text-orange-400 font-semibold mb-1">
        🎲 Icebreaker — tap for next!
      </div>
      <div className="text-sm text-gray-700 leading-snug">{ICEBREAKERS[current].en}</div>
      <div className="text-xs text-gray-500 mt-0.5">{ICEBREAKERS[current].ja}</div>
    </button>
  );
}

// ─── Role Selector ────────────────────────────────────────────────────────────

function RoleSelector({
  selectedRole,
  onSelect,
}: {
  selectedRole: string;
  onSelect: (role: string) => void;
}) {
  return (
    <div className="mb-3">
      <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
        Conversation Style / 会話スタイル
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ROLES.map(r => (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedRole === r.id
                ? 'bg-orange-100 text-orange-600 border border-orange-300'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {r.icon} {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Active Session ───────────────────────────────────────────────────────────

function ActiveSession({
  config,
  onEnd,
  onShareToChat,
  onShareCardToChat,
  onTimerEvent,
}: {
  config: SessionConfig;
  onEnd: () => void;
  onShareToChat?: (text: string) => void;
  onShareCardToChat?: (cardData: CardData) => void;
  onTimerEvent?: (eventData: TimerEventData) => void;
}) {
  const { myLevel, partnerLevel, selectedCats, sessionMinutes } = config;

  const effectiveLevel =
    CONVERSATION_LEVELS.findIndex(l => l.id === myLevel) <=
    CONVERSATION_LEVELS.findIndex(l => l.id === partnerLevel)
      ? myLevel
      : partnerLevel;

  const allCards: DeckCard[] = [];
  selectedCats.forEach(catKey => {
    const cat = CATEGORIES[catKey];
    const levelIndex = CONVERSATION_LEVELS.findIndex(l => l.id === effectiveLevel);
    CONVERSATION_LEVELS.forEach((l, i) => {
      if (i >= levelIndex && i <= levelIndex + 1 && cat.cards[l.id]) {
        cat.cards[l.id].forEach(card => allCards.push({ ...card, category: catKey }));
      }
    });
  });

  const [deck, setDeck] = useState(() => shuffleArray(allCards));
  const [cardIdx, setCardIdx] = useState(0);
  const [role, setRole] = useState('free');
  const [timerRunning, setTimerRunning] = useState(false);
  const [lang, setLang] = useState<'en' | 'ja'>('en');
  const [showLangAlert, setShowLangAlert] = useState(false);

  const currentCard = deck[cardIdx % deck.length];

  const handleLangSwitch = () => {
    const newLang = lang === 'en' ? 'ja' : 'en';
    setLang(newLang);
    setShowLangAlert(true);
    setTimeout(() => setShowLangAlert(false), 3000);
    onTimerEvent?.({ event: 'language_switch', newLang });
  };

  const handleTimerToggle = () => {
    const willRun = !timerRunning;
    setTimerRunning(willRun);
    if (willRun) {
      onTimerEvent?.({ event: 'start', totalMinutes: sessionMinutes });
    }
  };

  const handleShare = () => {
    if (!currentCard) return;
    const prompt = currentCard.prompts[0];
    if (onShareCardToChat) {
      onShareCardToChat({
        category: currentCard.category,
        topic: currentCard.topic,
        topicJa: currentCard.ja,
        prompt,
        vocab: currentCard.vocab,
      });
    } else if (onShareToChat) {
      const text = `🃏 Topic: ${currentCard.topic} / ${currentCard.ja} — ${prompt}`;
      onShareToChat(text);
    }
  };

  return (
    <div className="relative">
      {/* Language switch alert */}
      {showLangAlert && (
        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg ${
          lang === 'ja' ? 'bg-teal-500' : 'bg-orange-500'
        }`}>
          {lang === 'ja' ? '🇯🇵 日本語タイム！' : '🇺🇸 English Time!'}
        </div>
      )}

      <SessionTimer
        totalSeconds={sessionMinutes * 60}
        isRunning={timerRunning}
        onToggle={handleTimerToggle}
        onReset={() => { setTimerRunning(false); setLang('en'); }}
        lang={lang}
        onLangSwitch={handleLangSwitch}
        onTimerEnd={() => onTimerEvent?.({ event: 'end' })}
      />

      <RoleSelector selectedRole={role} onSelect={setRole} />
      <IcebreakerWidget />

      {currentCard && (
        <TopicCard
          card={currentCard}
          onNext={() => setCardIdx(i => i + 1)}
          onShuffle={() => { setDeck(shuffleArray(allCards)); setCardIdx(0); }}
          onShare={(onShareCardToChat || onShareToChat) ? handleShare : undefined}
          cardIndex={cardIdx % deck.length}
          totalCards={deck.length}
        />
      )}

      <button
        onClick={onEnd}
        className="w-full py-2.5 text-xs font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
      >
        End Session / セッション終了
      </button>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function ConversationCards({ onShareToChat, onShareCardToChat, onTimerEvent, autoLevel }: Props) {
  const [screen, setScreen] = useState<'setup' | 'session'>('setup');
  const [config, setConfig] = useState<SessionConfig | null>(null);

  return (
    <div className="h-full overflow-y-auto">
      {screen === 'setup' ? (
        <SetupScreen
          defaultLevel={autoLevel}
          onStart={cfg => {
            setConfig(cfg);
            setScreen('session');
          }}
        />
      ) : config ? (
        <ActiveSession
          config={config}
          onEnd={() => setScreen('setup')}
          onShareToChat={onShareToChat}
          onShareCardToChat={onShareCardToChat}
          onTimerEvent={onTimerEvent}
        />
      ) : null}
    </div>
  );
}
