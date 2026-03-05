import { useState, useEffect, useRef } from "react";

// ── Constants ──────────────────────────────────────────────
const STORAGE_KEY = "yuka-tasting-map";

const CATEGORIES = {
  beer: { label: "Beer", color: "#c08b28", icon: "🍺" },
  white_wine: { label: "White Wine", color: "#8fa644", icon: "🥂" },
  rose: { label: "Rosé", color: "#c46b7a", icon: "🌹" },
  sparkling: { label: "Sparkling", color: "#5a9ea8", icon: "✨" },
  rum: { label: "Rum", color: "#b86530", icon: "🫗" },
  whiskey: { label: "Whiskey", color: "#8b5e3c", icon: "🥃" },
  other: { label: "Other", color: "#7a6e8a", icon: "🍸" },
};

const SEASONS = {
  uluru: { label: "Season 1 — Uluru", sub: "The Red Centre Sessions" },
  cruise: { label: "Season 2 — Nordic Cruise", sub: "Baltic & Scandinavian Sips" },
  melbourne: { label: "Season 3 — Melbourne", sub: "Coffee Capital Cocktails" },
};

const SAMPLE_DATA = [
  {
    id: "sample_1",
    name: "Coopers Pale Ale",
    category: "beer",
    season: "uluru",
    sweetness: 65,
    body: 40,
    notes: "Fruity and floral with a biscuity malt backbone — like a citrus shortbread with a bitter marmalade finish.",
    bottleImg: null,
    glassImg: null,
    isSample: true,
  },
  {
    id: "sample_2",
    name: "Bundaberg Spiced Rum",
    category: "rum",
    season: "uluru",
    sweetness: 18,
    body: 60,
    notes: "Warm cinnamon and vanilla, like a rum baba soaked in spiced syrup. The finish lingers with toasted coconut.",
    bottleImg: null,
    glassImg: null,
    isSample: true,
  },
  {
    id: "sample_3",
    name: "Penfolds Koonunga Hill Chardonnay",
    category: "white_wine",
    season: "uluru",
    sweetness: 55,
    body: 50,
    notes: "Buttery and oaked, like a fresh croissant with hints of ripe peach and vanilla cream.",
    bottleImg: null,
    glassImg: null,
    isSample: true,
  },
  {
    id: "sample_4",
    name: "James Boag's Premium Lager",
    category: "beer",
    season: "uluru",
    sweetness: 70,
    body: 20,
    notes: "Crisp and clean with subtle grain sweetness — refreshingly simple, like a palate cleanser between courses.",
    bottleImg: null,
    glassImg: null,
    isSample: true,
  },
  {
    id: "sample_5",
    name: "Starward Nova",
    category: "whiskey",
    season: "uluru",
    sweetness: 35,
    body: 55,
    notes: "Red wine cask influence brings berry notes alongside caramel and oak — like a berry crumble with vanilla ice cream.",
    bottleImg: null,
    glassImg: null,
    isSample: true,
  },
  {
    id: "sample_6",
    name: "Yalumba Y Series Rosé",
    category: "rose",
    season: "uluru",
    sweetness: 60,
    body: 25,
    notes: "Delicate strawberry and watermelon, bone dry with bright acidity — like a fresh berry sorbet.",
    bottleImg: null,
    glassImg: null,
    isSample: true,
  },
];

// ── Styles ─────────────────────────────────────────────────
const colors = {
  bg: "#f9f5ef",
  card: "#fff",
  chart: "#fdfbf8",
  border: "#e5ddd2",
  text: "#3a3028",
  sub: "#8b7b68",
  light: "#c0b8ac",
  accent: "#b8925a",
  title: "#8b6e47",
};

// ── Helpers ────────────────────────────────────────────────
function loadDrinks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveDrinks(drinks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drinks));
}

function readFileAsBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// ── Component ──────────────────────────────────────────────
export default function YukaTastingMap() {
  const [drinks, setDrinks] = useState([]);
  const [season, setSeason] = useState("uluru");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const chartRef = useRef(null);

  // ── Init ──
  useEffect(() => {
    const saved = loadDrinks();
    setDrinks(saved || [...SAMPLE_DATA]);
  }, []);

  // ── Persist ──
  useEffect(() => {
    if (drinks.length > 0) saveDrinks(drinks);
  }, [drinks]);

  // ── Filtered ──
  const filtered = drinks.filter((d) => {
    if (d.season !== season) return false;
    if (activeCategory && d.category !== activeCategory) return false;
    return true;
  });

  // ── Handlers ──
  function handleAdd(drink) {
    const newDrink = {
      ...drink,
      id: "d" + Date.now(),
      isSample: false,
    };
    setDrinks((prev) => [...prev, newDrink]);
    setShowForm(false);
  }

  function handleDelete(id) {
    if (!confirm("Delete this tasting?")) return;
    setDrinks((prev) => prev.filter((d) => d.id !== id));
    setSelected(null);
  }

  function handleReset() {
    if (!confirm("Reset to sample data? All your tastings will be lost.")) return;
    setDrinks([...SAMPLE_DATA]);
    setSelected(null);
  }

  // ── Render ──
  return (
    <div style={{ background: colors.bg, minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px 80px" }}>
        {/* Header */}
        {screenshotMode ? (
          <ScreenshotHeader season={season} count={filtered.length} />
        ) : (
          <NormalHeader />
        )}

        {/* Season Tabs */}
        {!screenshotMode && (
          <SeasonTabs season={season} setSeason={(s) => { setSeason(s); setSelected(null); }} />
        )}

        {/* Category Filter */}
        {!screenshotMode && (
          <CategoryFilter active={activeCategory} setActive={setActiveCategory} drinks={drinks} season={season} />
        )}

        {/* Chart */}
        <Chart
          ref={chartRef}
          drinks={filtered}
          selected={selected}
          onSelect={setSelected}
          screenshotMode={screenshotMode}
        />

        {/* Detail Panel */}
        {selected && !screenshotMode && (
          <DetailPanel
            drink={drinks.find((d) => d.id === selected)}
            onClose={() => setSelected(null)}
            onDelete={handleDelete}
          />
        )}

        {/* Actions */}
        {!screenshotMode && (
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <button onClick={() => setShowForm(true)} style={btnStyle(colors.accent, "#fff")}>
              + Add Tasting
            </button>
            <button onClick={() => setScreenshotMode(true)} style={btnStyle("transparent", colors.sub, true)}>
              📸 Screenshot
            </button>
            <button onClick={handleReset} style={btnStyle("transparent", colors.light, true)}>
              Reset
            </button>
          </div>
        )}

        {/* Screenshot exit */}
        {screenshotMode && (
          <button
            onClick={() => setScreenshotMode(false)}
            style={{
              ...btnStyle(colors.accent, "#fff"),
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
              boxShadow: "0 4px 20px rgba(0,0,0,.25)",
            }}
          >
            ✕ Exit Screenshot
          </button>
        )}

        {/* Add Form Modal */}
        {showForm && (
          <AddForm
            season={season}
            onAdd={handleAdd}
            onClose={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

function NormalHeader() {
  return (
    <div style={{ textAlign: "center", paddingTop: 28, paddingBottom: 8 }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: colors.sub, textTransform: "uppercase" }}>
        ゆかさん専用
      </div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: colors.title, margin: "4px 0 2px", fontWeight: "normal" }}>
        Tasting Map
      </h1>
      <div style={{ fontSize: 11, color: colors.light, fontStyle: "italic" }}>
        A Patissier's Guide to Flavour
      </div>
    </div>
  );
}

function ScreenshotHeader({ season, count }) {
  return (
    <div style={{ textAlign: "center", paddingTop: 28, paddingBottom: 12 }}>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22, color: colors.title, margin: 0, fontWeight: "normal" }}>
        ゆかさんの Tasting Map
      </h1>
      <div style={{ fontSize: 12, color: colors.sub, marginTop: 4 }}>
        {SEASONS[season].sub}
      </div>
      <div style={{ fontSize: 11, color: colors.light, marginTop: 2 }}>
        {count} tasting{count !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

function SeasonTabs({ season, setSeason }) {
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 12, marginBottom: 8 }}>
      {Object.entries(SEASONS).map(([key, val]) => (
        <button
          key={key}
          onClick={() => setSeason(key)}
          style={{
            flex: 1,
            padding: "8px 4px",
            fontSize: 11,
            border: "1px solid " + (season === key ? colors.accent : colors.border),
            background: season === key ? colors.accent : "transparent",
            color: season === key ? "#fff" : colors.sub,
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: season === key ? 600 : 400,
          }}
        >
          {val.label}
        </button>
      ))}
    </div>
  );
}

function CategoryFilter({ active, setActive, drinks, season }) {
  const counts = {};
  drinks.filter((d) => d.season === season).forEach((d) => {
    counts[d.category] = (counts[d.category] || 0) + 1;
  });

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
      <button
        onClick={() => setActive(null)}
        style={{
          padding: "4px 10px",
          fontSize: 11,
          border: "1px solid " + (active === null ? colors.accent : colors.border),
          background: active === null ? colors.accent : "transparent",
          color: active === null ? "#fff" : colors.sub,
          borderRadius: 20,
          cursor: "pointer",
        }}
      >
        All
      </button>
      {Object.entries(CATEGORIES).map(([key, cat]) => {
        const c = counts[key] || 0;
        if (c === 0) return null;
        return (
          <button
            key={key}
            onClick={() => setActive(active === key ? null : key)}
            style={{
              padding: "4px 10px",
              fontSize: 11,
              border: "1px solid " + (active === key ? cat.color : colors.border),
              background: active === key ? cat.color : "transparent",
              color: active === key ? "#fff" : colors.sub,
              borderRadius: 20,
              cursor: "pointer",
            }}
          >
            {cat.icon} {cat.label} ({c})
          </button>
        );
      })}
    </div>
  );
}

const Chart = ({ drinks, selected, onSelect, screenshotMode }) => {
  const size = 320;
  const pad = 36;
  const inner = size - pad * 2;

  function pos(d) {
    return {
      x: pad + (d.sweetness / 100) * inner,
      y: pad + ((100 - d.body) / 100) * inner,
    };
  }

  return (
    <div
      style={{
        background: colors.chart,
        border: "1px solid " + colors.border,
        borderRadius: 12,
        padding: 12,
        position: "relative",
      }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "auto" }}>
        {/* Grid lines */}
        <line x1={size / 2} y1={pad} x2={size / 2} y2={size - pad} stroke={colors.border} strokeDasharray="4 4" />
        <line x1={pad} y1={size / 2} x2={size - pad} y2={size / 2} stroke={colors.border} strokeDasharray="4 4" />

        {/* Quadrant labels */}
        <text x={pad + 8} y={pad + 16} fontSize="8" fill={colors.light} opacity="0.6">Sweet & Full</text>
        <text x={size - pad - 8} y={pad + 16} fontSize="8" fill={colors.light} opacity="0.6" textAnchor="end">Dry & Full</text>
        <text x={pad + 8} y={size - pad - 8} fontSize="8" fill={colors.light} opacity="0.6">Sweet & Light</text>
        <text x={size - pad - 8} y={size - pad - 8} fontSize="8" fill={colors.light} opacity="0.6" textAnchor="end">Dry & Light</text>

        {/* Axis labels */}
        <text x={pad} y={size - pad + 20} fontSize="8" fill={colors.sub} fontWeight="600">SWEET</text>
        <text x={size - pad} y={size - pad + 20} fontSize="8" fill={colors.sub} fontWeight="600" textAnchor="end">DRY</text>
        <text x={pad - 6} y={pad - 6} fontSize="8" fill={colors.sub} fontWeight="600">FULL</text>
        <text x={pad - 6} y={size - pad + 4} fontSize="8" fill={colors.sub} fontWeight="600">LIGHT</text>

        {/* Axis sublabels */}
        <text x={size / 2} y={size - pad + 20} fontSize="7" fill={colors.light} textAnchor="middle">Perceived Sweetness →</text>
        <text
          x={pad - 18}
          y={size / 2}
          fontSize="7"
          fill={colors.light}
          textAnchor="middle"
          transform={`rotate(-90, ${pad - 18}, ${size / 2})`}
        >
          Body →
        </text>

        {/* Border */}
        <rect x={pad} y={pad} width={inner} height={inner} fill="none" stroke={colors.border} rx="4" />

        {/* Dots */}
        {drinks.map((d) => {
          const p = pos(d);
          const cat = CATEGORIES[d.category];
          const isSel = selected === d.id;
          return (
            <g key={d.id} onClick={() => onSelect(isSel ? null : d.id)} style={{ cursor: "pointer" }}>
              {isSel && (
                <circle cx={p.x} cy={p.y} r={14} fill={cat.color} opacity="0.15" />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isSel ? 8 : 6}
                fill={cat.color}
                stroke="#fff"
                strokeWidth="2"
                opacity={selected && !isSel ? 0.35 : 1}
              />
              {(screenshotMode || isSel) && (
                <text
                  x={p.x}
                  y={p.y - 12}
                  fontSize="7"
                  fill={colors.text}
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {d.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

function DetailPanel({ drink, onClose, onDelete }) {
  if (!drink) return null;
  const cat = CATEGORIES[drink.category];

  return (
    <div
      style={{
        background: colors.card,
        border: "1px solid " + colors.border,
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        position: "relative",
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "none",
          border: "none",
          fontSize: 18,
          color: colors.light,
          cursor: "pointer",
        }}
      >
        ×
      </button>

      {/* Name */}
      <h3 style={{ margin: "0 0 8px", color: cat.color, fontSize: 16, fontFamily: "Georgia, serif" }}>
        {drink.name}
      </h3>

      {/* Badges */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ ...badgeStyle, background: cat.color + "20", color: cat.color }}>
          {cat.icon} {cat.label}
        </span>
        {drink.isSample && (
          <span style={{ ...badgeStyle, background: colors.accent + "20", color: colors.accent }}>
            Sample
          </span>
        )}
      </div>

      {/* Scores */}
      <div style={{ fontSize: 12, color: colors.sub, marginBottom: 10 }}>
        Sweetness {drink.sweetness} · Body {drink.body}
      </div>

      {/* Photos */}
      {(drink.bottleImg || drink.glassImg) && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {drink.bottleImg && (
            <img src={drink.bottleImg} alt="Bottle" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
          )}
          {drink.glassImg && (
            <img src={drink.glassImg} alt="Glass" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
          )}
        </div>
      )}

      {/* Notes */}
      {drink.notes && (
        <p style={{ fontSize: 13, color: colors.text, fontStyle: "italic", lineHeight: 1.5, margin: "0 0 12px" }}>
          "{drink.notes}"
        </p>
      )}

      {/* Delete */}
      <button onClick={() => onDelete(drink.id)} style={btnStyle("#d44", "#fff")}>
        × Delete
      </button>
    </div>
  );
}

function AddForm({ season, onAdd, onClose }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("beer");
  const [sweetness, setSweetness] = useState(50);
  const [body, setBody] = useState(50);
  const [notes, setNotes] = useState("");
  const [bottleImg, setBottleImg] = useState(null);
  const [glassImg, setGlassImg] = useState(null);

  async function handleImg(e, setter) {
    const file = e.target.files?.[0];
    if (file) setter(await readFileAsBase64(file));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), category, season, sweetness, body, notes, bottleImg, glassImg });
  }

  return (
    <div style={overlayStyle}>
      <div style={{ background: colors.card, borderRadius: 16, padding: 20, maxWidth: 400, width: "90%", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: colors.title, fontFamily: "Georgia, serif" }}>Add Tasting</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: colors.light, cursor: "pointer" }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <label style={labelStyle}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Coopers Pale Ale"
            required
            style={inputStyle}
          />

          {/* Category */}
          <label style={labelStyle}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>{cat.icon} {cat.label}</option>
            ))}
          </select>

          {/* Season (display only) */}
          <label style={labelStyle}>Season</label>
          <div style={{ fontSize: 13, color: colors.sub, marginBottom: 12 }}>{SEASONS[season].label}</div>

          {/* Sweetness */}
          <label style={labelStyle}>
            Sweetness — <span style={{ color: colors.accent }}>{sweetness}</span>
            <span style={{ color: colors.light, fontSize: 11 }}> (0 = sweet, 100 = dry)</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={sweetness}
            onChange={(e) => setSweetness(+e.target.value)}
            style={{ width: "100%", marginBottom: 12 }}
          />

          {/* Body */}
          <label style={labelStyle}>
            Body — <span style={{ color: colors.accent }}>{body}</span>
            <span style={{ color: colors.light, fontSize: 11 }}> (0 = light, 100 = full)</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={body}
            onChange={(e) => setBody(+e.target.value)}
            style={{ width: "100%", marginBottom: 12 }}
          />

          {/* Photos */}
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Bottle photo</label>
              <input type="file" accept="image/*" onChange={(e) => handleImg(e, setBottleImg)} style={{ fontSize: 12 }} />
              {bottleImg && <img src={bottleImg} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Glass photo</label>
              <input type="file" accept="image/*" onChange={(e) => handleImg(e, setGlassImg)} style={{ fontSize: 12 }} />
              {glassImg && <img src={glassImg} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, marginTop: 4 }} />}
            </div>
          </div>

          {/* Notes */}
          <label style={labelStyle}>Tasting Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the flavour using pastry analogies..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />

          {/* Submit */}
          <button type="submit" style={{ ...btnStyle(colors.accent, "#fff"), width: "100%", marginTop: 12, padding: "12px 0" }}>
            Save Tasting
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────
function btnStyle(bg, color, outline = false) {
  return {
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    border: outline ? "1px solid " + colors.border : "none",
    background: bg,
    color,
    borderRadius: 8,
    cursor: "pointer",
  };
}

const badgeStyle = {
  padding: "3px 10px",
  fontSize: 11,
  borderRadius: 20,
  fontWeight: 500,
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 200,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  color: colors.sub,
  marginBottom: 4,
  fontWeight: 500,
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  fontSize: 14,
  border: "1px solid " + colors.border,
  borderRadius: 8,
  background: colors.bg,
  color: colors.text,
  marginBottom: 12,
  boxSizing: "border-box",
};
