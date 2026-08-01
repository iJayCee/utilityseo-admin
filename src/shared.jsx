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
