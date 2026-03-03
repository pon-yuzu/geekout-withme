/**
 * Voice Lounge - Conversation Facilitator Tool
 * 
 * Usage:
 *   import VoiceLoungeTool from './components/VoiceLoungeTool';
 *   <VoiceLoungeTool />
 * 
 * Optional props:
 *   - userLevel: string ('beginner' | 'intermediate' | 'advanced') — pre-fill from Level Check
 *   - userInterests: string[] — pre-fill from user profile (e.g. ['anime', 'cooking'])
 *   - theme: 'dark' | 'light' — default 'dark'
 *   - locale: 'en' | 'ja' — UI language, default 'en'
 * 
 * Dependencies:
 *   - React 18+
 *   - ../data/conversationData.js (card data)
 */

import { useState, useEffect, useRef } from "react";
import { CATEGORIES, LEVELS, ICEBREAKERS, ROLES } from "../data/conversationData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── CSS Custom Properties (override these to match your site theme) ────────
// See IMPLEMENTATION_SPEC.md for theming instructions

const defaultThemeVars = {
  "--vl-bg-primary": "#0D0F14",
  "--vl-bg-secondary": "rgba(255,255,255,0.04)",
  "--vl-bg-hover": "rgba(255,255,255,0.06)",
  "--vl-text-primary": "#F0F0F0",
  "--vl-text-secondary": "#8B95A5",
  "--vl-text-muted": "#555",
  "--vl-border": "#2A2D3A",
  "--vl-accent-purple": "#6C5CE7",
  "--vl-accent-purple-light": "#A29BFE",
  "--vl-accent-green": "#00B894",
  "--vl-accent-green-light": "#55EFC4",
  "--vl-accent-yellow": "#FDCB6E",
  "--vl-accent-yellow-light": "#FFEAA7",
  "--vl-accent-red": "#E17055",
  "--vl-font-body": "'DM Sans', sans-serif",
  "--vl-font-display": "'Space Grotesk', sans-serif",
  "--vl-radius-sm": "8px",
  "--vl-radius-md": "12px",
  "--vl-radius-lg": "16px",
  "--vl-radius-xl": "20px",
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

function SetupScreen({ onStart, defaultLevel, defaultInterests }) {
  const [myLevel, setMyLevel] = useState(defaultLevel || "beginner");
  const [partnerLevel, setPartnerLevel] = useState("beginner");
  const [selectedCats, setSelectedCats] = useState(defaultInterests?.length ? defaultInterests : ["cooking"]);
  const [sessionMinutes, setSessionMinutes] = useState(20);

  const toggleCat = (cat) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const canStart = selectedCats.length > 0;

  return (
    <div className="vl-setup" style={{ padding: "0 4px" }}>
      {/* Level Selection */}
      <div style={{ marginBottom: 28 }}>
        <h3 className="vl-section-label">Your Level / あなたのレベル</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setMyLevel(l.id)}
              className={`vl-level-btn ${myLevel === l.id ? "active" : ""}`}
              data-color="purple"
              style={{
                flex: 1,
                padding: "12px 8px",
                border: myLevel === l.id ? "2px solid var(--vl-accent-purple)" : "2px solid var(--vl-border)",
                borderRadius: "var(--vl-radius-md)",
                background: myLevel === l.id ? "rgba(108, 92, 231, 0.15)" : "var(--vl-bg-secondary)",
                color: myLevel === l.id ? "var(--vl-accent-purple-light)" : "var(--vl-text-secondary)",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "var(--vl-font-body)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{l.emoji}</div>
              <div style={{ fontWeight: 600 }}>{l.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{l.ja}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Partner Level */}
      <div style={{ marginBottom: 28 }}>
        <h3 className="vl-section-label">Partner's Level / 相手のレベル</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setPartnerLevel(l.id)}
              style={{
                flex: 1,
                padding: "12px 8px",
                border: partnerLevel === l.id ? "2px solid var(--vl-accent-green)" : "2px solid var(--vl-border)",
                borderRadius: "var(--vl-radius-md)",
                background: partnerLevel === l.id ? "rgba(0, 184, 148, 0.15)" : "var(--vl-bg-secondary)",
                color: partnerLevel === l.id ? "var(--vl-accent-green-light)" : "var(--vl-text-secondary)",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "var(--vl-font-body)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{l.emoji}</div>
              <div style={{ fontWeight: 600 }}>{l.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{l.ja}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Selection */}
      <div style={{ marginBottom: 28 }}>
        <h3 className="vl-section-label">Topics / トピック（複数選択OK）</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => toggleCat(key)}
              style={{
                padding: "10px 16px",
                border: selectedCats.includes(key) ? `2px solid ${cat.color}` : "2px solid var(--vl-border)",
                borderRadius: 20,
                background: selectedCats.includes(key) ? `${cat.color}22` : "var(--vl-bg-secondary)",
                color: selectedCats.includes(key) ? cat.color : "var(--vl-text-secondary)",
                cursor: "pointer",
                fontSize: 14,
                fontFamily: "var(--vl-font-body)",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Session Duration */}
      <div style={{ marginBottom: 32 }}>
        <h3 className="vl-section-label">Session / セッション時間</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {[10, 15, 20, 30].map((m) => (
            <button
              key={m}
              onClick={() => setSessionMinutes(m)}
              style={{
                flex: 1,
                padding: "10px 8px",
                border: sessionMinutes === m ? "2px solid var(--vl-accent-yellow)" : "2px solid var(--vl-border)",
                borderRadius: "var(--vl-radius-md)",
                background: sessionMinutes === m ? "rgba(253, 203, 110, 0.15)" : "var(--vl-bg-secondary)",
                color: sessionMinutes === m ? "var(--vl-accent-yellow-light)" : "var(--vl-text-secondary)",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "var(--vl-font-body)",
                transition: "all 0.2s",
              }}
            >
              {m}min
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={() => canStart && onStart({ myLevel, partnerLevel, selectedCats, sessionMinutes })}
        disabled={!canStart}
        style={{
          width: "100%",
          padding: "16px",
          border: "none",
          borderRadius: "var(--vl-radius-lg)",
          background: canStart ? "linear-gradient(135deg, var(--vl-accent-purple), var(--vl-accent-purple-light))" : "var(--vl-border)",
          color: canStart ? "#fff" : "var(--vl-text-muted)",
          fontSize: 17,
          fontWeight: 700,
          fontFamily: "var(--vl-font-body)",
          cursor: canStart ? "pointer" : "not-allowed",
          transition: "all 0.3s",
          letterSpacing: 1,
        }}
      >
        🚀 START SESSION / セッション開始
      </button>
    </div>
  );
}

function TopicCard({ card, category, onNext, onShuffle, cardIndex, totalCards }) {
  const [showVocab, setShowVocab] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const catData = CATEGORIES[category];

  return (
    <div
      className="vl-topic-card"
      style={{
        background: "var(--vl-bg-secondary)",
        border: `1px solid ${catData.color}44`,
        borderRadius: "var(--vl-radius-xl)",
        padding: "24px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: catData.color, fontFamily: "var(--vl-font-body)", fontWeight: 600 }}>
          {catData.label}
        </span>
        <span style={{ fontSize: 12, color: "var(--vl-text-muted)", fontFamily: "var(--vl-font-body)" }}>
          {cardIndex + 1} / {totalCards}
        </span>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--vl-text-primary)", marginBottom: 4, fontFamily: "var(--vl-font-display)", lineHeight: 1.3 }}>
        {card.topic}
      </h2>
      <p style={{ fontSize: 15, color: "var(--vl-text-secondary)", marginBottom: 20, fontFamily: "var(--vl-font-body)" }}>
        {card.ja}
      </p>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--vl-text-secondary)", marginBottom: 10, fontFamily: "var(--vl-font-body)" }}>
          💡 Conversation Prompt
        </div>
        <div style={{
          background: "var(--vl-bg-hover)",
          borderRadius: 14,
          padding: "16px",
          fontSize: 15,
          lineHeight: 1.7,
          color: "#DDD",
          fontFamily: "var(--vl-font-body)",
          borderLeft: `3px solid ${catData.color}`,
        }}>
          {card.prompts[currentPrompt]}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {card.prompts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPrompt(i)}
              style={{
                width: 32, height: 32,
                border: currentPrompt === i ? `2px solid ${catData.color}` : "2px solid var(--vl-border)",
                borderRadius: "var(--vl-radius-sm)",
                background: currentPrompt === i ? `${catData.color}22` : "transparent",
                color: currentPrompt === i ? catData.color : "var(--vl-text-muted)",
                cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--vl-font-body)",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowVocab(!showVocab)}
          style={{ background: "none", border: "none", color: "var(--vl-text-secondary)", cursor: "pointer", fontSize: 12, fontFamily: "var(--vl-font-body)", padding: "4px 0", textTransform: "uppercase", letterSpacing: 1 }}
        >
          {showVocab ? "▾" : "▸"} Useful Vocab / 役立つ語彙
        </button>
        {showVocab && (
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {card.vocab.map((v, i) => (
              <span key={i} style={{ background: "var(--vl-bg-hover)", borderRadius: "var(--vl-radius-sm)", padding: "6px 12px", fontSize: 13, color: "#AAA", fontFamily: "var(--vl-font-body)" }}>
                {v}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        <button onClick={onShuffle} style={{ flex: 1, padding: "12px", border: "2px solid var(--vl-border)", borderRadius: "var(--vl-radius-md)", background: "transparent", color: "var(--vl-text-secondary)", cursor: "pointer", fontSize: 14, fontFamily: "var(--vl-font-body)", fontWeight: 500 }}>
          🔀 Shuffle
        </button>
        <button onClick={onNext} style={{ flex: 2, padding: "12px", border: "none", borderRadius: "var(--vl-radius-md)", background: `linear-gradient(135deg, ${catData.color}, ${catData.color}BB)`, color: "#fff", cursor: "pointer", fontSize: 14, fontFamily: "var(--vl-font-body)", fontWeight: 600 }}>
          Next Card →
        </button>
      </div>
    </div>
  );
}

function SessionTimer({ totalSeconds, isRunning, onToggle, onReset, lang, onLangSwitch }) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const halfTime = Math.floor(totalSeconds / 2);
  const remaining = totalSeconds - elapsed;
  const isAlmostDone = remaining <= 60 && remaining > 0;

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, remaining]);

  useEffect(() => {
    if (elapsed === halfTime && isRunning) {
      onLangSwitch();
    }
  }, [elapsed, halfTime, isRunning]);

  const pct = (elapsed / totalSeconds) * 100;

  return (
    <div className="vl-timer" style={{ background: "var(--vl-bg-secondary)", borderRadius: "var(--vl-radius-lg)", padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ position: "relative", height: 6, background: "var(--vl-border)", borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${pct}%`,
          background: isAlmostDone ? "linear-gradient(90deg, var(--vl-accent-yellow), var(--vl-accent-red))" : "linear-gradient(90deg, var(--vl-accent-purple), var(--vl-accent-purple-light))",
          borderRadius: 3, transition: "width 1s linear",
        }} />
        <div style={{ position: "absolute", left: "50%", top: -2, width: 2, height: 10, background: "var(--vl-accent-yellow)", borderRadius: 1 }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--vl-font-display)", color: isAlmostDone ? "var(--vl-accent-red)" : "var(--vl-text-primary)", letterSpacing: 2 }}>
            {formatTime(remaining)}
          </div>
          <div style={{ fontSize: 12, color: lang === "en" ? "var(--vl-accent-purple-light)" : "var(--vl-accent-green-light)", fontFamily: "var(--vl-font-body)", fontWeight: 600, marginTop: 2 }}>
            {lang === "en" ? "🇺🇸 English Time" : "🇯🇵 日本語タイム"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onToggle} style={{ width: 44, height: 44, border: "2px solid var(--vl-border)", borderRadius: "var(--vl-radius-md)", background: isRunning ? "rgba(225, 112, 85, 0.15)" : "rgba(108, 92, 231, 0.15)", color: isRunning ? "var(--vl-accent-red)" : "var(--vl-accent-purple-light)", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isRunning ? "⏸" : "▶"}
          </button>
          <button onClick={() => { setElapsed(0); onReset(); }} style={{ width: 44, height: 44, border: "2px solid var(--vl-border)", borderRadius: "var(--vl-radius-md)", background: "transparent", color: "var(--vl-text-secondary)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
            ↺
          </button>
        </div>
      </div>
    </div>
  );
}

function IcebreakerWidget() {
  const [current, setCurrent] = useState(() => Math.floor(Math.random() * ICEBREAKERS.length));
  return (
    <button
      onClick={() => setCurrent((current + 1) % ICEBREAKERS.length)}
      style={{ width: "100%", padding: "16px 20px", background: "linear-gradient(135deg, rgba(253, 203, 110, 0.1), rgba(225, 112, 85, 0.1))", border: "1px solid rgba(253, 203, 110, 0.3)", borderRadius: "var(--vl-radius-lg)", cursor: "pointer", textAlign: "left", marginBottom: 16 }}
    >
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--vl-accent-yellow)", marginBottom: 8, fontFamily: "var(--vl-font-body)", fontWeight: 600 }}>
        🎲 Icebreaker — tap for next!
      </div>
      <div style={{ fontSize: 15, color: "var(--vl-text-primary)", lineHeight: 1.5, fontFamily: "var(--vl-font-body)" }}>
        {ICEBREAKERS[current].en}
      </div>
      <div style={{ fontSize: 13, color: "var(--vl-text-secondary)", marginTop: 4, fontFamily: "var(--vl-font-body)" }}>
        {ICEBREAKERS[current].ja}
      </div>
    </button>
  );
}

function RoleSelector({ selectedRole, onSelect }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--vl-text-secondary)", marginBottom: 10, fontFamily: "var(--vl-font-body)" }}>
        Conversation Style / 会話スタイル
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {ROLES.map((r) => (
          <button key={r.id} onClick={() => onSelect(r.id)} style={{
            padding: "8px 14px",
            border: selectedRole === r.id ? "2px solid var(--vl-accent-purple-light)" : "2px solid var(--vl-border)",
            borderRadius: "var(--vl-radius-md)",
            background: selectedRole === r.id ? "rgba(108, 92, 231, 0.15)" : "transparent",
            color: selectedRole === r.id ? "var(--vl-accent-purple-light)" : "var(--vl-text-secondary)",
            cursor: "pointer", fontSize: 13, fontFamily: "var(--vl-font-body)", fontWeight: 500, whiteSpace: "nowrap",
          }}>
            {r.icon} {r.label}
          </button>
        ))}
      </div>
      {selectedRole && (
        <div style={{ marginTop: 8, fontSize: 13, color: "var(--vl-text-muted)", fontFamily: "var(--vl-font-body)", fontStyle: "italic" }}>
          {ROLES.find((r) => r.id === selectedRole)?.desc}
        </div>
      )}
    </div>
  );
}

function ActiveSession({ config, onEnd }) {
  const { myLevel, partnerLevel, selectedCats, sessionMinutes } = config;
  const effectiveLevel =
    LEVELS.findIndex((l) => l.id === myLevel) <= LEVELS.findIndex((l) => l.id === partnerLevel) ? myLevel : partnerLevel;

  const allCards = [];
  selectedCats.forEach((catKey) => {
    const cat = CATEGORIES[catKey];
    const levelIndex = LEVELS.findIndex((l) => l.id === effectiveLevel);
    LEVELS.forEach((l, i) => {
      if (i >= levelIndex && i <= levelIndex + 1 && cat.cards[l.id]) {
        cat.cards[l.id].forEach((card) => allCards.push({ ...card, category: catKey }));
      }
    });
  });

  const [deck, setDeck] = useState(() => shuffleArray(allCards));
  const [cardIdx, setCardIdx] = useState(0);
  const [role, setRole] = useState("free");
  const [timerRunning, setTimerRunning] = useState(false);
  const [lang, setLang] = useState("en");
  const [showLangAlert, setShowLangAlert] = useState(false);

  const currentCard = deck[cardIdx % deck.length];

  const handleLangSwitch = () => {
    setLang((l) => (l === "en" ? "ja" : "en"));
    setShowLangAlert(true);
    setTimeout(() => setShowLangAlert(false), 3000);
  };

  return (
    <div className="vl-session" style={{ padding: "0 4px" }}>
      {showLangAlert && (
        <div className="vl-lang-alert" style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: lang === "ja" ? "linear-gradient(135deg, var(--vl-accent-green), var(--vl-accent-green-light))" : "linear-gradient(135deg, var(--vl-accent-purple), var(--vl-accent-purple-light))",
          color: "#fff", padding: "14px 28px", borderRadius: "var(--vl-radius-lg)",
          fontSize: 16, fontWeight: 700, fontFamily: "var(--vl-font-body)",
          zIndex: 1000, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          animation: "vl-slideDown 0.3s ease-out",
        }}>
          {lang === "ja" ? "🇯🇵 Switch to 日本語！" : "🇺🇸 Switch to English!"}
        </div>
      )}

      <SessionTimer
        totalSeconds={sessionMinutes * 60}
        isRunning={timerRunning}
        onToggle={() => setTimerRunning(!timerRunning)}
        onReset={() => { setTimerRunning(false); setLang("en"); }}
        lang={lang}
        onLangSwitch={handleLangSwitch}
      />
      <RoleSelector selectedRole={role} onSelect={setRole} />
      <IcebreakerWidget />
      {currentCard && (
        <TopicCard
          card={currentCard}
          category={currentCard.category}
          onNext={() => setCardIdx((i) => i + 1)}
          onShuffle={() => { setDeck(shuffleArray(allCards)); setCardIdx(0); }}
          cardIndex={cardIdx % deck.length}
          totalCards={deck.length}
        />
      )}
      <button onClick={onEnd} style={{
        width: "100%", marginTop: 20, padding: "14px",
        border: "2px solid var(--vl-accent-red)", borderRadius: 14,
        background: "transparent", color: "var(--vl-accent-red)",
        fontSize: 14, fontFamily: "var(--vl-font-body)", fontWeight: 600, cursor: "pointer",
      }}>
        End Session / セッション終了
      </button>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function VoiceLoungeTool({ userLevel, userInterests, theme = "dark" }) {
  const [screen, setScreen] = useState("setup");
  const [config, setConfig] = useState(null);

  return (
    <div className="vl-root" style={{ ...defaultThemeVars, minHeight: "100vh", color: "var(--vl-text-primary)", fontFamily: "var(--vl-font-body)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .vl-root * { margin: 0; padding: 0; box-sizing: border-box; }
        .vl-root button:hover { filter: brightness(1.1); }
        .vl-root button:active { transform: scale(0.98); }
        .vl-section-label {
          font-size: 13px; text-transform: uppercase; letter-spacing: 2px;
          color: var(--vl-text-secondary); margin-bottom: 14px;
          font-family: var(--vl-font-body); font-weight: 400;
        }
        @keyframes vl-slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes vl-fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "24px 16px 40px", animation: "vl-fadeIn 0.4s ease-out" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 3, color: "var(--vl-accent-purple)", fontWeight: 600, marginBottom: 6 }}>
            Geek Out With Me
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 700, fontFamily: "var(--vl-font-display)",
            background: "linear-gradient(135deg, var(--vl-accent-purple-light), var(--vl-accent-green-light))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.3,
          }}>
            Voice Lounge
          </h1>
          <p style={{ fontSize: 14, color: "var(--vl-text-secondary)", marginTop: 4 }}>
            {screen === "setup" ? "Set up your session / セッションを設定しよう" : "Happy chatting! / 楽しくお話しよう！"}
          </p>
        </div>

        {screen === "setup" ? (
          <SetupScreen
            defaultLevel={userLevel}
            defaultInterests={userInterests}
            onStart={(cfg) => { setConfig(cfg); setScreen("session"); }}
          />
        ) : (
          <ActiveSession config={config} onEnd={() => setScreen("setup")} />
        )}
      </div>
    </div>
  );
}
