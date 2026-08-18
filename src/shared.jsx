// Shared admin UI primitives - plan metadata, badges, inputs, spinner.
// Moved out of App.jsx when the sections were split into their own files:
// module-scope names do not cross files, so every section that rendered a
// Spinner or Badge crashed with a ReferenceError until these were importable.
export const PLAN_META = {
  free:         { label:"Free",          short:"Free",  color:"#64748b", bg:"rgba(255,255,255,0.06)" },
  entrepreneur: { label:"Entrepreneur",  short:"Entr.", color:"#a78bfa", bg:"rgba(124,58,237,0.15)" },
  enterprise:   { label:"Enterprise",    short:"Ent.",  color:"#f59e0b", bg:"rgba(245,158,11,0.15)" },
  pro:          { label:"Pro (legacy)",  short:"Pro",   color:"#a78bfa", bg:"rgba(124,58,237,0.12)" },
  proPlus:      { label:"Pro+ (legacy)", short:"Pro+",  color:"#fbbf24", bg:"rgba(245,158,11,0.12)" },
};
export const planMeta  = (p) => PLAN_META[p] || PLAN_META.free;
export const planLabel = (p) => planMeta(p).label;
export const planShort = (p) => planMeta(p).short;
export const isLegacyPlan = (p) => p === "pro" || p === "proPlus";

export const Badge = ({ plan }) => {
  const m = planMeta(plan);
  return <span style={{ color:m.color, background:m.bg, border:`1px solid ${m.color}33`, padding:"2px 10px", borderRadius:99, fontSize:11, fontWeight:600, letterSpacing:"0.03em" }}>{m.label}</span>;
};

// ── Status badge - distinct colours per state ─────────────────────────────────
export const StatusBadge = ({ status }) => {
  const cfg = {
    active:      { color:"#22c55e", bg:"rgba(34,197,94,0.1)",   border:"rgba(34,197,94,0.3)",   icon:"●", label:"Active" },
    deactivated: { color:"#94a3b8", bg:"rgba(148,163,184,0.1)", border:"rgba(148,163,184,0.3)", icon:"○", label:"Deactivated" },
    suspended:   { color:"#ef4444", bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   icon:"⊘", label:"Suspended" },
  };
  const c = cfg[status] || cfg.active;
  return (
    <span style={{ fontSize:12, fontWeight:600, color:c.color, background:c.bg,
      border:`1px solid ${c.border}`, padding:"3px 10px", borderRadius:99,
      display:"inline-flex", alignItems:"center", gap:4 }}>
      <span style={{ fontSize:8 }}>{c.icon}</span>{c.label}
    </span>
  );
};

export const Input = ({ label, ...props }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={{ display:"block", fontSize:13, color:"#94a3b8", marginBottom:6, fontWeight:500 }}>{label}</label>}
    <input {...props} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 16px", color:"#fff", fontSize:14, outline:"none", fontFamily:"Sora,sans-serif", transition:"border 0.15s", ...props.style }}
      onFocus={e => e.target.style.border="1px solid #7C3AED"}
      onBlur={e => e.target.style.border="1px solid rgba(255,255,255,0.1)"}
    />
  </div>
);

export const Spinner = () => <div className="spin" style={{ width:20, height:20, border:"2px solid rgba(255,255,255,0.1)", borderTopColor:"#7C3AED", borderRadius:"50%", display:"inline-block" }} />;

// ── Section scaffolding ──────────────────────────────────────────────────────
// Every tab was laying itself out by hand, and they had drifted: header margins
// of 24 / 28 / none, card padding of "18px 20px" / 28 / 20, root wrappers of
// <div style={{width:"100%"}}> / <div> / a redundant double wrapper. Nothing was
// individually wrong, which is why it survived - but moving between tabs moved
// the content, and that is what makes an app feel unfinished.
//
// These are the single definitions. A section that wants different spacing now
// has to say so explicitly rather than differ by accident.

export const SECTION_GAP = 24;   // header -> body
export const CARD_GAP    = 20;   // card -> card

// Card surface, matching the customer app's cardSty.
export const card = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
  padding: "18px 20px",
  marginBottom: CARD_GAP,
};

export const label = {
  fontSize: 11, fontWeight: 700, color: "#475569",
  textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6,
};

// The root every section returns. Fixes the width/wrapper drift in one place.
export const Section = ({ children }) => (
  <div style={{ width: "100%" }}>{children}</div>
);

// Title on the left, actions on the right, one consistent gap underneath.
// `right` takes the buttons a section used to place itself.
export const SectionHeader = ({ title, subtitle, right }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                gap:16, flexWrap:"wrap", marginBottom:SECTION_GAP }}>
    <div style={{ minWidth:0 }}>
      <h3 style={{ fontSize:16, fontWeight:700, color:"#e2e8f0", margin:0 }}>{title}</h3>
      {subtitle && <p style={{ fontSize:12.5, color:"#64748b", margin:"4px 0 0", lineHeight:1.5 }}>{subtitle}</p>}
    </div>
    {right && <div style={{ display:"flex", gap:8, flexWrap:"wrap", flexShrink:0 }}>{right}</div>}
  </div>
);

// Horizontal scroller for a wide grid table.
//
// The admin tables are 680-740px of FIXED columns, so on a phone they do not
// merely overflow - the flexible column collapses and the row is on screen and
// unreadable. Worse, the users table sat inside a wrapper with overflow:hidden,
// so it was clipped outright with no way to reach the rest.
//
// Desktop-safe by construction: when `min` fits the available width the
// scroller is inert and the layout is unchanged.
export const TableScroll = ({ min, children, style }) => (
  <div className="scroll-x" style={style}>
    <div style={{ minWidth: min }}>{children}</div>
  </div>
);
