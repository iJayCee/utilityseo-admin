import { useState, useEffect, useRef } from "react";

const LOGO_BASE64 = "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCABBAEEDASIAAhEBAxEB/8QAHAAAAgMBAQEBAAAAAAAAAAAAAAQCAwUGAQcI/8QALhAAAgIBAgQEBgEFAAAAAAAAAAECAwQRYQUSMVEGcXKxFCEjJDSRQVJTYpKh/8QAGgEAAgMBAQAAAAAAAAAAAAAAAgQDBQYBB//EACoRAAICAgEBBgYDAAAAAAAAAAABAgMEERIhBRMUMVFxIjIzNEFhUpHB/9oADAMBAAIRAxEAPwD8jQqSrjol0B1rshmEPpx8kDgazwy4roOcBN1rsRcF2G3AawuDcSzo82Jg5F0f6owfL++hD4NzeorbOcDHdexFw2N3M8PcZxa3ZfwzKjBLVyVbaXm10MpwF7cKUHqUdAOGhRwIuA24EHATnjAOIrygXcoC/cA8Tcqh9KHpQOAxTD6FfpXsShWpWRT6NrU9A8PqCf6LLj0NrwvwfHcY5udBWa/OuuXTTu+50lOWkko6JL5JL+Dk6ctJJJ6JDdWZuS42VCpaiDGejraszc5vxh4axOJ0TzMGqFObFczUVordmu+/7JVZm41Vmbjtl9eTDhYtoNyUlpnyeVbTaa0aK3A3/FOPCvjeQ4LSNjU0t2tX/wB1MlwMtbi8ZNC7gIcoF/KBW9wR8Tfoh9vX6F7HsoNJtdS/Hh9tV6F7EnA9HWKpVpeqLPhtCFWZuNVZm5l8VxbaZPIpi5Qfzkl1W/kJVZm5gMmVuFc6ren+r1RWT5Vy0zrKszcaqzNzk6szcexrrJx5lrp3GcTJndNQh1YUJOT0izjNnxGdOfVJKP6EHAclAg4F9LGf5GuBmcoF3KBUdwQ8To8WH2tXoj7EnAtwVGeDRODUouuOjXkWOB6dXj7qi16ItlHohNwE8jhmHdLmnjx5n1a1jr+jVcCDgLZGBXcuNkU1+1sGVal5oyquGYlT1jSm/wDJt+5e4LsOOBBwFIdn1UrVcFH2WgFUo+SFHAg4DjgQcCOeMccTI5QD4jF/v1/7AZrdX8l/aFPh9RTgn4K9THWAC/Z/2tfsga/kRFnjABhhHhFgBEzjPGU5f49npYALX/Tl7MCXkzBAAMGVx//Z";


// ─── FONTS & GLOBAL STYLES ────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100%; height: 100%; overflow-x: hidden; }
    body { font-family: 'Sora', sans-serif; background: #0a0a0f; color: #fff; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0a0a0f; }
    ::-webkit-scrollbar-thumb { background: #2d2d3d; border-radius: 3px; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse-slow { 0%,100% { opacity:1; } 50% { opacity:.5; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
    @keyframes countUp { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
    .fade-up { animation: fadeUp 0.5s ease forwards; }
    .fade-up-1 { animation: fadeUp 0.5s 0.1s ease both; }
    .fade-up-2 { animation: fadeUp 0.5s 0.2s ease both; }
    .fade-up-3 { animation: fadeUp 0.5s 0.3s ease both; }
    .fade-up-4 { animation: fadeUp 0.5s 0.4s ease both; }
    .spin { animation: spin 1s linear infinite; }
    .pulse-slow { animation: pulse-slow 2s infinite; }
    .count-up { animation: countUp 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); }
    .glow-indigo { box-shadow: 0 0 40px rgba(99,102,241,0.3); }
    .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
    .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
    input, select, textarea { font-family: 'Sora', sans-serif; }
    .score-ring { transition: stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1); }
    .sidebar-link { transition: all 0.15s; }
    .sidebar-link:hover { background: rgba(99,102,241,0.1); }
    .sidebar-link.active { background: rgba(99,102,241,0.15); border-left: 2px solid #6366f1; }
    @media (max-width: 768px) {
      .app-layout { grid-template-columns: 60px 1fr !important; }
    }
  `}</style>
);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_ANALYSIS = {
  url: "",
  score: 74,
  metrics: { performance: 68, seo: 81, accessibility: 79, bestPractices: 72 },
  issues: [
    { id:1, severity:"critical", category:"Performance", title:"Images not optimised", description:"14 images are served in legacy formats (JPEG/PNG). Modern formats like WebP reduce file size by 25–34%.", fix:"Convert all images to WebP using Squoosh or your build pipeline. Add width/height attributes to prevent layout shift.", effort:"Low", impact:"High" },
    { id:2, severity:"critical", category:"SEO", title:"Missing XML sitemap", description:"No sitemap.xml was found. Search engines use sitemaps to discover and index your pages efficiently.", fix:"Generate a sitemap.xml and submit it via Google Search Console under Indexing → Sitemaps.", effort:"Low", impact:"High" },
    { id:3, severity:"high", category:"SEO", title:"Duplicate title tags", description:"4 pages share the same <title> tag. Each page needs a unique, descriptive title for search engines.", fix:"Review all page titles and ensure each is unique, 50–60 characters, and includes the target keyword.", effort:"Medium", impact:"High" },
    { id:4, severity:"high", category:"Performance", title:"Render-blocking resources", description:"3 CSS files and 2 JavaScript files are blocking the initial page render.", fix:"Defer non-critical JS with async/defer attributes. Inline critical CSS and lazy-load the rest.", effort:"Medium", impact:"Medium" },
    { id:5, severity:"medium", category:"Accessibility", title:"Low contrast text", description:"12 text elements fail WCAG AA contrast requirements (minimum 4.5:1 ratio).", fix:"Use a contrast checker and update text/background colours to meet the 4.5:1 minimum ratio.", effort:"Low", impact:"Medium" },
    { id:6, severity:"medium", category:"SEO", title:"Missing meta descriptions", description:"7 pages have no meta description. While not a ranking factor, they heavily influence click-through rates.", fix:"Write unique 150–160 character meta descriptions for each page, including your target keyword naturally.", effort:"Medium", impact:"Medium" },
    { id:7, severity:"low", category:"SEO", title:"Images missing alt text", description:"9 images have no alt attribute, reducing accessibility and missing keyword opportunities.", fix:"Add descriptive alt text to all meaningful images. Decorative images should have alt=\"\".", effort:"Low", impact:"Low" },
  ],
  keywords: [
    { kw:"seo tools online", pos:23, vol:8100, diff:64, trend:+3 },
    { kw:"website analyser", pos:11, vol:5400, diff:52, trend:-1 },
    { kw:"seo checker free", pos:34, vol:12000, diff:71, trend:+7 },
    { kw:"page speed test", pos:8, vol:9200, diff:58, trend:0 },
  ],
  aiInsights: [
    { type:"win", text:"Your SEO score improved 11 points over the last 30 days — great momentum. The keyword 'seo checker free' jumped 7 positions this week." },
    { type:"action", text:"Fixing the 2 critical issues (image optimisation + sitemap) could push your score above 85 and significantly improve crawlability." },
    { type:"trend", text:"Your page 'Website SEO Guide' has gained 340% more impressions this month. Consider expanding it with an FAQ section to capture featured snippets." },
    { type:"warning", text:"3 of your top-10 keywords have lost ground this week. A competitor appears to have published fresh content targeting the same terms." },
  ],
};

const MOCK_USERS = [
  { id:"1", email:"james@startup.io", plan:"pro", status:"active", joined:"2026-01-12", searches:47, temp:null },
  { id:"2", email:"sarah@agency.co.uk", plan:"proPlus", status:"active", joined:"2025-12-08", searches:312, temp:null },
  { id:"3", email:"mike@blog.com", plan:"free", status:"active", joined:"2026-02-01", searches:6, temp:null },
  { id:"4", email:"emma@store.shop", plan:"free", status:"suspended", joined:"2026-01-28", searches:2, temp:null },
  { id:"5", email:"david@consult.io", plan:"pro", status:"active", joined:"2026-01-20", searches:89, temp:{ plan:"proPlus", days:12 } },
  { id:"6", email:"anna@media.com", plan:"proPlus", status:"active", joined:"2025-11-15", searches:521, temp:null },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const c = (...cls) => cls.filter(Boolean).join(" ");

const ScoreRing = ({ score, size=120, stroke=10 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="score-ring" />
      <text x={size/2} y={size/2+2} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={size/4} fontWeight="700" style={{ transform:`rotate(90deg) translate(0,-${size}px)`, fontFamily:"Sora,sans-serif" }}>
        {score}
      </text>
    </svg>
  );
};

const Badge = ({ plan }) => {
  const cfg = { free:["#64748b","#1e293b"], pro:["#818cf8","#1e1b4b"], proPlus:["#f59e0b","#1c1407"] };
  const [text, bg] = [{ free:"Free", pro:"Pro", proPlus:"Pro Plus" }[plan] || plan, cfg[plan] || cfg.free];
  return <span style={{ color:text[0], background:bg[1], border:`1px solid ${text[0]}33`, padding:"2px 10px", borderRadius:99, fontSize:11, fontWeight:600, letterSpacing:"0.03em" }}>{text}</span>;
};

const Pill = ({ children, color="#6366f1" }) => (
  <span style={{ background:`${color}22`, color, border:`1px solid ${color}44`, padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600 }}>{children}</span>
);

const Btn = ({ children, onClick, variant="primary", small, full, disabled, className="" }) => {
  const base = "cursor-pointer font-semibold rounded-xl transition-all duration-150 border-0 outline-none";
  const v = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
    ghost:   "bg-transparent text-indigo-400 hover:bg-indigo-500/10",
    outline: "bg-transparent border border-white/10 text-white/70 hover:border-white/30 hover:text-white",
    danger:  "bg-red-600/20 text-red-400 hover:bg-red-600/30",
    success: "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30",
  }[variant];
  const pad = small ? "px-3 py-1.5 text-sm" : "px-5 py-2.5 text-sm";
  return (
    <button onClick={onClick} disabled={disabled}
      className={c(base, v, pad, full && "w-full", disabled && "opacity-40 cursor-not-allowed", className)}
      style={{ fontFamily:"Sora,sans-serif" }}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={{ display:"block", fontSize:13, color:"#94a3b8", marginBottom:6, fontWeight:500 }}>{label}</label>}
    <input {...props} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 16px", color:"#fff", fontSize:14, outline:"none", fontFamily:"Sora,sans-serif", transition:"border 0.15s", ...props.style }}
      onFocus={e => e.target.style.border="1px solid #6366f1"}
      onBlur={e => e.target.style.border="1px solid rgba(255,255,255,0.1)"}
    />
  </div>
);

const Card = ({ children, className="", style={} }) => (
  <div className={c("glass rounded-2xl", className)} style={{ padding:24, ...style }}>{children}</div>
);

const SeverityBadge = ({ s }) => {
  const cfg = { critical:["#ef4444","#1a0505"], high:["#f97316","#1a0900"], medium:["#f59e0b","#1a1000"], low:["#6366f1","#0d0d1a"] };
  const [col, bg] = cfg[s] || cfg.low;
  return <span style={{ background:bg, color:col, border:`1px solid ${col}44`, padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{s}</span>;
};

const Spinner = () => <div className="spin" style={{ width:20, height:20, border:"2px solid rgba(255,255,255,0.1)", borderTopColor:"#6366f1", borderRadius:"50%", display:"inline-block" }} />;

// ─── UPGRADE MODAL ────────────────────────────────────────────────────────────
const UpgradeModal = ({ user, onClose }) => {
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "£0",
      period: "",
      color: "#64748b",
      features: ["1 scan per day", "Basic SEO analysis", "Issue detection"],
      current: user?.plan === "free",
    },
    {
      id: "pro",
      name: "Pro",
      price: "£20",
      period: "/mo",
      color: "#6366f1",
      popular: true,
      features: ["10 scans per day", "Full SEO analysis", "Keyword tracking", "AI insights", "Scan history"],
      current: user?.plan === "pro",
    },
    {
      id: "proPlus",
      name: "Pro Plus",
      price: "£50",
      period: "/mo",
      color: "#f59e0b",
      features: ["Unlimited scans", "Everything in Pro", "Google Search Console", "Priority support", "Competitor tracking"],
      current: user?.plan === "proPlus",
    },
  ];

  const handleSelect = (planId) => {
    if (planId === user?.plan) return;
    alert(`Stripe integration coming soon! You selected: ${planId}`);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:24 }}
      onClick={onClose}>
      <div style={{ width:"100%", maxWidth:680, background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,0.7)" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding:"24px 28px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h2 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em" }}>Upgrade Your Plan</h2>
            <p style={{ fontSize:13, color:"#64748b", marginTop:4 }}>Unlock more scans and premium features</p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, width:36, height:36, cursor:"pointer", color:"#94a3b8", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        {/* Plans */}
        <div style={{ padding:28, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {plans.map(p => (
            <div key={p.id} style={{ border:`2px solid ${p.current ? p.color : "rgba(255,255,255,0.08)"}`, borderRadius:18, padding:"20px 16px", background: p.current ? `${p.color}12` : "rgba(255,255,255,0.03)", position:"relative", display:"flex", flexDirection:"column", gap:16 }}>
              {p.popular && !p.current && (
                <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:p.color, color:"#fff", fontSize:9, fontWeight:700, padding:"3px 10px", borderRadius:99, whiteSpace:"nowrap", letterSpacing:"0.05em" }}>MOST POPULAR</div>
              )}
              {p.current && (
                <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:p.color, color:"#fff", fontSize:9, fontWeight:700, padding:"3px 10px", borderRadius:99, whiteSpace:"nowrap", letterSpacing:"0.05em" }}>CURRENT PLAN</div>
              )}
              <div>
                <p style={{ fontSize:15, fontWeight:700, color: p.current ? p.color : "#e2e8f0", marginBottom:4 }}>{p.name}</p>
                <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
                  <span style={{ fontSize:26, fontWeight:800, color:"#fff" }}>{p.price}</span>
                  <span style={{ fontSize:12, color:"#64748b" }}>{p.period}</span>
                </div>
              </div>
              <div style={{ flex:1 }}>
                {p.features.map((f, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <span style={{ color: p.current ? p.color : "#22c55e", fontSize:12 }}>✓</span>
                    <span style={{ fontSize:12, color:"#94a3b8" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => handleSelect(p.id)} disabled={p.current}
                style={{ width:"100%", padding:"11px", borderRadius:12, border:`1px solid ${p.current ? "rgba(255,255,255,0.08)" : p.color}`, background: p.current ? "rgba(255,255,255,0.04)" : `${p.color}22`, color: p.current ? "#475569" : p.color, fontSize:13, fontWeight:700, cursor: p.current ? "default" : "pointer", fontFamily:"Sora,sans-serif", transition:"all 0.15s" }}
                onMouseEnter={e => { if (!p.current) e.currentTarget.style.background = `${p.color}44`; }}
                onMouseLeave={e => { if (!p.current) e.currentTarget.style.background = `${p.color}22`; }}>
                {p.current ? "Current Plan" : `Upgrade to ${p.name} →`}
              </button>
            </div>
          ))}
        </div>
        <p style={{ textAlign:"center", color:"#334155", fontSize:12, paddingBottom:20 }}>Cancel anytime · Secure payment via Stripe</p>
      </div>
    </div>
  );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  { id:"scan",     icon:"⚡", label:"New Scan" },
  { id:"results",  icon:"📊", label:"SEO Results" },
  { id:"keywords", icon:"🔑", label:"Keywords" },
  { id:"insights", icon:"✨", label:"AI Insights" },
];

const Sidebar = ({ page, setPage, user, onLogout, collapsed, setCollapsed }) => {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState("");

  // Countdown to midnight reset
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeUntilReset(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Effective plan (temp takes priority)
  const effectivePlan = user?.tempPlan || user?.plan || "free";
  const hasTempAccess = user?.tempPlan && user?.tempPlan !== user?.plan;
  const tempDaysLeft = user?.tempDaysLeft;

  return (
    <>
      {showUpgrade && <UpgradeModal user={{ ...user, plan: effectivePlan }} onClose={() => setShowUpgrade(false)} />}
      <div style={{ width:"100%", height:"100%", background:"#0d0d14", borderRight:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", overflowY:"auto", transition:"width 0.2s" }}>
        <div style={{ padding: collapsed ? "16px 8px" : "24px 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          {/* Logo + collapse toggle */}
          <div style={{ display:"flex", alignItems:"center", justifyContent: collapsed ? "center" : "space-between", marginBottom: collapsed ? 0 : 16 }}>
            {!collapsed && (
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <img src={LOGO_BASE64} alt="UtilitySEO" style={{ width:32, height:32, borderRadius:8, objectFit:"cover" }} />
                <span style={{ fontWeight:700, fontSize:16, letterSpacing:"-0.02em" }}>UtilitySEO</span>
              </div>
            )}
            <button onClick={() => setCollapsed(!collapsed)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"6px 8px", cursor:"pointer", color:"#64748b", fontSize:14, lineHeight:1 }}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {collapsed ? "▶" : "◀"}
            </button>
          </div>

          {/* User info - hide when collapsed */}
          {!collapsed && (
            <div style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:10, padding:"10px 12px" }}>
              <p style={{ fontSize:11, color:"#94a3b8", marginBottom:3 }}>Signed in as</p>
              <p style={{ fontSize:12, color:"#e2e8f0", fontWeight:500, wordBreak:"break-all" }} className="mono">{user?.email || "user@email.com"}</p>
              <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                <Badge plan={effectivePlan} />
                {hasTempAccess && (
                  <span style={{ fontSize:10, color:"#f59e0b", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.3)", padding:"1px 7px", borderRadius:99, fontWeight:600 }}>
                    ⏱ Temp · {tempDaysLeft}d left
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <nav style={{ flex:1, padding:"12px 8px" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              className={c("sidebar-link", page===n.id && "active")}
              title={collapsed ? n.label : undefined}
              style={{ width:"100%", display:"flex", alignItems:"center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding:"10px 12px", borderRadius:10, border:"none", background:"transparent", color: page===n.id ? "#818cf8" : "#64748b", cursor:"pointer", fontSize:13, fontWeight:500, textAlign:"left", marginBottom:2, fontFamily:"Sora,sans-serif", borderLeft: page===n.id ? "2px solid #6366f1" : "2px solid transparent" }}>
              <span style={{ fontSize:16 }}>{n.icon}</span>
              {!collapsed && n.label}
            </button>
          ))}
        </nav>

        <div style={{ padding:"16px 8px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", gap:8 }}>
          {/* Scan reset countdown */}
          {!collapsed && (
            <div style={{ padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:10, textAlign:"center" }}>
              <p style={{ fontSize:10, color:"#334155", marginBottom:2 }}>Scans reset in</p>
              <p style={{ fontSize:13, fontWeight:700, color:"#475569", fontFamily:"JetBrains Mono,monospace" }}>{timeUntilReset}</p>
            </div>
          )}

          {/* Upgrade button - only for free and pro users */}
          {!collapsed && effectivePlan !== "proPlus" && (
            <button style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid rgba(245,158,11,0.4)", background:"rgba(245,158,11,0.1)", color:"#f59e0b", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"Sora,sans-serif" }}
              onClick={() => setShowUpgrade(true)}>
              ⬆ Upgrade {effectivePlan === "free" ? "to Pro" : "to Pro Plus"}
            </button>
          )}
          {collapsed && effectivePlan !== "proPlus" && (
            <button title="Upgrade plan" style={{ width:"100%", padding:"10px 0", borderRadius:10, border:"1px solid rgba(245,158,11,0.4)", background:"rgba(245,158,11,0.1)", color:"#f59e0b", cursor:"pointer", fontSize:16, fontFamily:"Sora,sans-serif" }}
              onClick={() => setShowUpgrade(true)}>
              ⬆
            </button>
          )}
          <button onClick={onLogout} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent: collapsed ? "center" : "flex-start", gap: collapsed ? 0 : 10, padding:"10px 12px", borderRadius:10, border:"none", background:"transparent", color:"#64748b", cursor:"pointer", fontSize:13, fontFamily:"Sora,sans-serif" }}
            title={collapsed ? "Sign out" : undefined}
            onMouseEnter={e => e.currentTarget.style.color="#ef4444"}
            onMouseLeave={e => e.currentTarget.style.color="#64748b"}>
            <span>🚪</span>{!collapsed && " Sign out"}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── PAGE: LOGIN ──────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin, onGoAdmin }) => {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const plans = [
    { id:"free", name:"Free", price:"£0", searches:"1 search/day", color:"#64748b" },
    { id:"pro", name:"Pro", price:"£20/mo", searches:"10 searches/day", color:"#6366f1", popular:true },
    { id:"proPlus", name:"Pro Plus", price:"£50/mo", searches:"Unlimited", color:"#f59e0b" },
  ];

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields"); return; }
    if (mode === 'signup' && password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true); setError("");

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const endpoint = mode === 'signup' ? '/auth/register' : '/auth/login';
        
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, plan })
        });
    
        if (!response.ok) {
          throw new Error(mode === 'signup' ? 'Failed to create account' : 'Invalid credentials');
        }
    
        const data = await response.json();
        localStorage.setItem('token', data.token);
        onLogin({ email, plan: data.user?.plan || plan });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div style={{ width:"100%", maxWidth:480, position:"relative" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:40 }} className="fade-up">
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <img src="data:image/png;base64,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" alt="UtilitySEO" style={{ width:40, height:40, borderRadius:8, objectFit:"cover" }} />
            <span style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em" }}>UtilitySEO</span>
          </div>
          <p style={{ color:"#64748b", fontSize:14 }}>Professional SEO analysis & insights</p>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", borderRadius:12, padding:4, marginBottom:24 }} className="fade-up-1">
          {["signup","login"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:"8px 0", borderRadius:9, border:"none", background: mode===m ? "#6366f1" : "transparent", color: mode===m ? "#fff" : "#64748b", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.2s", fontFamily:"Sora,sans-serif" }}>
              {m === "signup" ? "Create Account" : "Sign In"}
            </button>
          ))}
        </div>

        {/* Plan picker — only on signup */}
        {mode === "signup" && (
          <div style={{ marginBottom:24 }} className="fade-up-2">
            <p style={{ fontSize:13, color:"#94a3b8", marginBottom:12, fontWeight:500 }}>Choose your plan</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {plans.map(p => (
                <div key={p.id} onClick={() => setPlan(p.id)}
                  style={{ border:`2px solid ${plan===p.id ? p.color : "rgba(255,255,255,0.08)"}`, borderRadius:14, padding:"14px 12px", cursor:"pointer", background: plan===p.id ? `${p.color}15` : "rgba(255,255,255,0.03)", transition:"all 0.2s", position:"relative" }}>
                  {p.popular && <div style={{ position:"absolute", top:-8, left:"50%", transform:"translateX(-50%)", background:p.color, color:"#fff", fontSize:9, fontWeight:700, padding:"2px 8px", borderRadius:99, whiteSpace:"nowrap" }}>POPULAR</div>}
                  <p style={{ fontSize:13, fontWeight:700, color: plan===p.id ? p.color : "#e2e8f0", marginBottom:2 }}>{p.name}</p>
                  <p style={{ fontSize:15, fontWeight:800, color:"#fff", marginBottom:2 }}>{p.price}</p>
                  <p style={{ fontSize:10, color:"#64748b" }}>{p.searches}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="glass fade-up-3" style={{ borderRadius:20, padding:28 }}>
          <form onSubmit={submit}>
            <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            {/* Password with eye toggle */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:13, color:"#94a3b8", marginBottom:6, fontWeight:500 }}>Password</label>
              <div style={{ position:"relative" }}>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 44px 12px 16px", color:"#fff", fontSize:14, outline:"none", fontFamily:"Sora,sans-serif", transition:"border 0.15s", boxSizing:"border-box" }}
                  onFocus={e => e.target.style.border="1px solid #6366f1"}
                  onBlur={e => e.target.style.border="1px solid rgba(255,255,255,0.1)"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#64748b", fontSize:16, padding:4, display:"flex", alignItems:"center" }}>
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            {/* Confirm password - signup only */}
            {mode === "signup" && (
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:13, color:"#94a3b8", marginBottom:6, fontWeight:500 }}>Confirm Password</label>
                <div style={{ position:"relative" }}>
                  <input type={showConfirm ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1px solid ${confirmPassword && confirmPassword !== password ? "#ef4444" : "rgba(255,255,255,0.1)"}`, borderRadius:12, padding:"12px 44px 12px 16px", color:"#fff", fontSize:14, outline:"none", fontFamily:"Sora,sans-serif", transition:"border 0.15s", boxSizing:"border-box" }}
                    onFocus={e => e.target.style.border="1px solid #6366f1"}
                    onBlur={e => e.target.style.border=`1px solid ${confirmPassword && confirmPassword !== password ? "#ef4444" : "rgba(255,255,255,0.1)"}`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#64748b", fontSize:16, padding:4, display:"flex", alignItems:"center" }}>
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p style={{ fontSize:11, color:"#ef4444", marginTop:4 }}>Passwords do not match</p>
                )}
              </div>
            )}
            {error && <p style={{ color:"#ef4444", fontSize:13, marginBottom:12 }}>{error}</p>}
            <button type="submit" disabled={loading}
              style={{ width:"100%", padding:"13px", background: loading ? "#3730a3" : "#6366f1", border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:700, cursor: loading ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:"Sora,sans-serif", transition:"background 0.2s" }}>
              {loading ? <><Spinner /> {mode === "signup" ? "Creating account..." : "Signing in..."}</> : mode === "signup" ? "Create Account →" : "Sign In →"}
            </button>
          </form>
        </div>

        {/* Admin access moved to admin.utilityseo.com */}
      </div>
  );
};

// ─── PAGE: SCAN───────────────────────────────────────────────────────────────
const ScanPage = ({ onResults, user, remaining, setRemaining }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);

  const stages = ["Crawling pages…", "Checking meta tags…", "Testing performance…", "Analysing backlinks…", "Generating report…"];

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    const fetchRemaining = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API}/usage/can-scan?t=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRemaining(data.remaining);
        }
      } catch (e) {}
    };
    fetchRemaining();
  }, []);

  const scan = async (e) => {
    e.preventDefault();
    if (!url || loading) return;

    const token = localStorage.getItem('token');
    if (!token) { alert('Please log in'); return; }

    setLoading(true);
    setStage(0);

    const stageInterval = setInterval(() => {
      setStage(prev => prev >= 4 ? 4 : prev + 1);
    }, 1500);

    try {
      // Run the actual scan
      const { analyzeWebsite } = await import('./googlePageSpeedAnalyzer.js');
      const data = await analyzeWebsite(url);

      // Tell backend to record the scan and get new remaining count
      const incRes = await fetch(`${API}/usage/increment-scan`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (incRes.status === 429) {
        alert('Daily scan limit reached. Upgrade to Pro for more scans.');
        clearInterval(stageInterval);
        setLoading(false);
        return;
      }

      if (incRes.ok) {
        const usage = await incRes.json();
        setRemaining(usage.remaining);
      }

      clearInterval(stageInterval);
      setStage(4);
      onResults(data);
      setTimeout(() => { setLoading(false); setStage(0); }, 500);

    } catch (err) {
      clearInterval(stageInterval);
      setLoading(false);
      alert(err.message || 'Failed to analyse website');
    }
  };

  const limit = { free:1, pro:10, proPlus:"∞" }[user?.plan] || 1;
  const displayRemaining = remaining !== null ? (remaining >= 99999 ? "∞" : remaining) : "…";

  return (
    <div style={{ padding:"clamp(16px, 3vw, 40px)", minWidth:0, width:"100%", boxSizing:"border-box" }}>
      <div className="fade-up">
        <h1 style={{ fontSize:32, fontWeight:800, letterSpacing:"-0.03em", marginBottom:8 }}>New Scan</h1>
        <p style={{ color:"#64748b", fontSize:15 }}>Enter your website URL to get a full SEO analysis</p>
      </div>

      <div className="glass fade-up-1" style={{ borderRadius:20, padding:28, marginTop:32 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <span style={{ fontSize:24, fontWeight:800, color:"#818cf8" }}>{displayRemaining}</span>
          <p style={{ fontSize:13, color:"#94a3b8" }}>daily scans remaining</p>
        </div>

        <form onSubmit={scan}>
          <div style={{ display:"flex", gap:10 }}>
            <input
              type="text" placeholder="https://yourwebsite.com" value={url}
              onChange={e => setUrl(e.target.value)} required disabled={loading}
              style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"13px 16px", color:"#fff", fontSize:15, outline:"none", fontFamily:"Sora,sans-serif" }}
              onFocus={e => e.target.style.border="1px solid #6366f1"}
              onBlur={e => e.target.style.border="1px solid rgba(255,255,255,0.1)"}
            />
            <button type="submit" disabled={loading}
              style={{ padding:"13px 24px", background:"#6366f1", border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:700, cursor: loading ? "not-allowed" : "pointer", whiteSpace:"nowrap", fontFamily:"Sora,sans-serif", opacity: loading ? 0.7 : 1 }}>
              {loading ? <Spinner /> : "Analyse →"}
            </button>
          </div>
        </form>

        {loading && (
          <div style={{ marginTop:28, padding:20, background:"rgba(99,102,241,0.08)", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
            {stages.map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", opacity: i <= stage ? 1 : 0.25, transition:"opacity 0.4s" }}>
                <span style={{ fontSize:14 }}>{i < stage ? "✅" : i === stage ? "⏳" : "○"}</span>
                <span style={{ fontSize:13, color: i <= stage ? "#e2e8f0" : "#475569" }}>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:24 }} className="fade-up-2">
        {[
          { icon:"🔍", t:"Deep Crawl", d:"Analyses every page, meta tag, heading and link" },
          { icon:"⚡", t:"Performance", d:"Core Web Vitals, load time and render blocking resources" },
          { icon:"📈", t:"Rankings", d:"Track keyword positions and spot opportunities" },
          { icon:"🤖", t:"AI Insights", d:"Smart recommendations tailored to your site" },
        ].map(f => (
          <div key={f.t} className="glass hover-lift" style={{ borderRadius:14, padding:20 }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{f.icon}</div>
            <p style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{f.t}</p>
            <p style={{ fontSize:12, color:"#64748b", lineHeight:1.5 }}>{f.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── PAGE: RESULTS ────────────────────────────────────────────────────────────
const ResultsPage = ({ analysis, onLoadScan }) => {
  const [expanded, setExpanded] = useState(null);
  const [fixed, setFixed] = useState(new Set(analysis?.fixedIssues || []));
  const [scansList, setScansList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load scans list on mount
  useEffect(() => {
    const loadScans = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/scans/list?limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setScansList(data.scans);
          }
        }
      } catch (error) {
        console.error('Failed to load scans list:', error);
      }
    };
    loadScans();
  }, []);

  // Save fixed issues whenever they change
  useEffect(() => {
    if (!analysis?.id) return;
    
    const saveFixed = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/scans/${analysis.id}/fixed`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fixedIssues: Array.from(fixed) })
          });
        }
      } catch (error) {
        console.error('Failed to save fixed issues:', error);
      }
    };
    
    const timeoutId = setTimeout(saveFixed, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [fixed, analysis?.id]);

  const toggleFixed = (issueId) => {
    setFixed(prev => {
      const newSet = new Set(prev);
      if (newSet.has(issueId)) {
        newSet.delete(issueId);
      } else {
        newSet.add(issueId);
      }
      return newSet;
    });
  };

  if (!analysis) return (
    <div style={{ padding:"24px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", textAlign:"center" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
      <h2 style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>No results yet</h2>
      <p style={{ color:"#64748b" }}>Run a scan first to see your SEO analysis</p>
    </div>
  );

  const counts = { critical: analysis.issues.filter(i=>i.severity==="critical").length, high: analysis.issues.filter(i=>i.severity==="high").length, medium: analysis.issues.filter(i=>i.severity==="medium").length, low: analysis.issues.filter(i=>i.severity==="low").length };

  return (
    <div style={{ padding:"clamp(16px, 3vw, 40px)", minWidth:0, width:"100%", boxSizing:"border-box", position:"relative" }}>
      <div className="fade-up" style={{ position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <p style={{ color:"#64748b", fontSize:13 }} className="mono">{analysis.url}</p>
          
          {/* Scan History Dropdown */}
          {scansList.length > 0 && (
            <div style={{ position:"relative", zIndex:100 }}>
              <button onClick={() => setShowDropdown(!showDropdown)}
                style={{ padding:"6px 12px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#94a3b8", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:6 }}>
                <span>📅</span> Scan History
              </button>
              
              {showDropdown && (
                <>
                  {/* Backdrop to close dropdown when clicking outside */}
                  <div onClick={() => setShowDropdown(false)} style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:999 }} />
                  
                  {/* Dropdown menu */}
                  <div style={{ position:"absolute", right:0, top:"100%", marginTop:8, background:"#0d0d14", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:8, minWidth:280, zIndex:1000, boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
                  {scansList.map((scan, idx) => (
                    <button key={scan.id} onClick={async () => { await onLoadScan(scan.id); setShowDropdown(false); }}
                      style={{ width:"100%", padding:"10px 12px", background: analysis.id === scan.id ? "rgba(99,102,241,0.1)" : "transparent", border:"none", borderRadius:8, color:"#e2e8f0", fontSize:13, cursor:"pointer", textAlign:"left", fontFamily:"Sora,sans-serif", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: idx < scansList.length - 1 ? 4 : 0 }}
                      onMouseEnter={e => e.target.style.background = analysis.id === scan.id ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)"}
                      onMouseLeave={e => e.target.style.background = analysis.id === scan.id ? "rgba(99,102,241,0.1)" : "transparent"}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{new URL(scan.url).hostname}</div>
                        <div style={{ fontSize:11, color:"#64748b" }}>{new Date(scan.created_at).toLocaleDateString()} {new Date(scan.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                      </div>
                      <div style={{ fontSize:16, fontWeight:700, color: scan.score >= 80 ? "#22c55e" : scan.score >= 60 ? "#f59e0b" : "#ef4444" }}>{scan.score}</div>
                    </button>
                  ))}
                </div>
                </>
              )}
            </div>
          )}
        </div>
        <h1 style={{ fontSize:32, fontWeight:800, letterSpacing:"-0.03em", marginBottom:24 }}>SEO Results</h1>
      </div>

      {/* Score header */}
      <div className="glass fade-up-1" style={{ borderRadius:20, padding:28, marginBottom:24, display:"flex", alignItems:"center", gap:32, flexWrap:"wrap" }}>
        <div style={{ textAlign:"center" }}>
          <ScoreRing score={analysis.score} size={130} />
          <p style={{ fontSize:12, color:"#64748b", marginTop:6 }}>Overall Score</p>
        </div>
        <div style={{ flex:1, minWidth:220 }}>
          {Object.entries(analysis.metrics).map(([k, v]) => (
            <div key={k} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:13, color:"#94a3b8", textTransform:"capitalize" }}>{k.replace(/([A-Z])/g," $1")}</span>
                <span style={{ fontSize:13, fontWeight:700, color: v>=80?"#22c55e":v>=60?"#f59e0b":"#ef4444" }}>{v}</span>
              </div>
              <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${v}%`, background: v>=80?"#22c55e":v>=60?"#f59e0b":"#ef4444", borderRadius:3, transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {Object.entries(counts).map(([k,v]) => (
            <div key={k} style={{ background:`${({critical:"#ef4444",high:"#f97316",medium:"#f59e0b",low:"#6366f1"})[k]}15`, border:`1px solid ${({critical:"#ef4444",high:"#f97316",medium:"#f59e0b",low:"#6366f1"})[k]}33`, borderRadius:10, padding:"10px 14px", textAlign:"center" }}>
              <p style={{ fontSize:22, fontWeight:800, color:({critical:"#ef4444",high:"#f97316",medium:"#f59e0b",low:"#6366f1"})[k] }}>{v}</p>
              <p style={{ fontSize:10, color:"#64748b", textTransform:"capitalize" }}>{k}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Issues */}
      <div className="fade-up-2">
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>Issues & How to Fix Them</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {analysis.issues.map(issue => (
            <div key={issue.id} className="glass hover-lift" style={{ borderRadius:14, overflow:"hidden", opacity: fixed.has(issue.id) ? 0.5 : 1, transition:"opacity 0.3s" }}>
              <div onClick={() => setExpanded(expanded===issue.id ? null : issue.id)}
                style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14, cursor:"pointer" }}>
                <SeverityBadge s={issue.severity} />
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:600, color: fixed.has(issue.id) ? "#475569" : "#e2e8f0", textDecoration: fixed.has(issue.id) ? "line-through" : "none" }}>{issue.title}</p>
                  <p style={{ fontSize:12, color:"#475569", marginTop:2 }}>{issue.category}</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {!fixed.has(issue.id) ? (
                    <button onClick={e => { e.stopPropagation(); toggleFixed(issue.id); }}
                      style={{ padding:"4px 10px", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:8, color:"#22c55e", fontSize:11, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
                      Mark Fixed
                    </button>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); toggleFixed(issue.id); }}
                      style={{ padding:"4px 10px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, color:"#ef4444", fontSize:11, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
                      Undo
                    </button>
                  )}
                  <span style={{ color:"#475569", fontSize:18, transform: expanded===issue.id ? "rotate(180deg)" : "rotate(0)", transition:"transform 0.2s" }}>⌄</span>
                </div>
              </div>

              {expanded === issue.id && (
                <div style={{ padding:"0 20px 20px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16 }}>
                    <div style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:12, padding:16 }}>
                      <p style={{ fontSize:11, color:"#ef4444", fontWeight:700, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>⚠ The Problem</p>
                      <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.6 }}>{issue.description}</p>
                    </div>
                    <div style={{ background:"rgba(34,197,94,0.06)", border:"1px solid rgba(34,197,94,0.15)", borderRadius:12, padding:16 }}>
                      <p style={{ fontSize:11, color:"#22c55e", fontWeight:700, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>✅ How to Fix</p>
                      <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.6 }}>{issue.fix}</p>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:16, marginTop:12 }}>
                    <span style={{ fontSize:12, color:"#64748b" }}>Effort: <span style={{ color:"#e2e8f0", fontWeight:600 }}>{issue.effort}</span></span>
                    <span style={{ fontSize:12, color:"#64748b" }}>Impact: <span style={{ color:"#818cf8", fontWeight:600 }}>{issue.impact}</span></span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ height:40 }} />
    </div>
  );
};

// ─── PAGE: KEYWORDS ───────────────────────────────────────────────────────────
const KeywordsPage = ({ analysis, user }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [newKw, setNewKw] = useState("");
  const [keywords, setKeywords] = useState(analysis?.keywords || MOCK_ANALYSIS.keywords);

  const canUseGSC = user?.plan === "proPlus";

  const connect = async () => {
    if (!canUseGSC) return;
    setConnecting(true);
    await new Promise(r => setTimeout(r, 1500));
    setConnected(true);
    setConnecting(false);
  };

  const addKw = () => {
    if (!newKw.trim()) return;
    setKeywords(prev => [...prev, { kw:newKw.trim(), pos: Math.floor(Math.random()*80)+5, vol: Math.floor(Math.random()*5000)+200, diff: Math.floor(Math.random()*60)+20, trend: Math.floor(Math.random()*10)-5 }]);
    setNewKw("");
  };

  return (
    <div style={{ padding:"clamp(16px, 3vw, 40px)", minWidth:0, width:"100%", boxSizing:"border-box" }}>
      <div className="fade-up">
        <h1 style={{ fontSize:32, fontWeight:800, letterSpacing:"-0.03em", marginBottom:8 }}>Keyword Tracking</h1>
        <p style={{ color:"#64748b", fontSize:15 }}>Monitor your search rankings and discover new opportunities</p>
      </div>

      {/* GSC Connect banner */}
      <div className="fade-up-1" style={{ marginTop:28, background: connected ? "rgba(34,197,94,0.08)" : "rgba(99,102,241,0.08)", border:`1px solid ${connected ? "rgba(34,197,94,0.3)" : "rgba(99,102,241,0.25)"}`, borderRadius:16, padding:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:12, background: connected ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
            {connected ? "✅" : "🔗"}
          </div>
          <div>
            <p style={{ fontWeight:600, fontSize:15 }}>{connected ? "Google Search Console Connected" : "Connect Google Search Console"}</p>
            <p style={{ fontSize:13, color:"#64748b", marginTop:2 }}>
              {connected ? "Pulling live data from your property" : canUseGSC ? "Sync real keyword data from your account" : "Available on Pro Plus plan"}
            </p>
          </div>
        </div>
        {!connected && (
          <button onClick={connect} disabled={!canUseGSC || connecting}
            style={{ padding:"10px 20px", background: canUseGSC ? "#6366f1" : "rgba(255,255,255,0.06)", border:"none", borderRadius:10, color: canUseGSC ? "#fff" : "#475569", fontSize:13, fontWeight:600, cursor: canUseGSC ? "pointer" : "not-allowed", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:8 }}>
            {connecting ? <><Spinner /> Connecting…</> : canUseGSC ? "Connect →" : "Upgrade to Pro Plus"}
          </button>
        )}
      </div>

      {/* Add keyword */}
      <div className="fade-up-2" style={{ marginTop:24, display:"flex", gap:10 }}>
        <input value={newKw} onChange={e => setNewKw(e.target.value)} onKeyDown={e => e.key==="Enter" && addKw()}
          placeholder="Add a keyword to track (e.g. 'seo tools uk')"
          style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 16px", color:"#fff", fontSize:14, outline:"none", fontFamily:"Sora,sans-serif" }}
          onFocus={e => e.target.style.border="1px solid #6366f1"}
          onBlur={e => e.target.style.border="1px solid rgba(255,255,255,0.1)"}
        />
        <button onClick={addKw} style={{ padding:"12px 20px", background:"#6366f1", border:"none", borderRadius:12, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>Add</button>
      </div>

      {/* Keywords table */}
      <div className="glass fade-up-3" style={{ borderRadius:18, overflow:"hidden", marginTop:20 }}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"grid", gridTemplateColumns:"1fr 80px 90px 80px 70px", gap:16 }}>
          {["Keyword","Position","Volume","Difficulty","Trend"].map(h => (
            <span key={h} style={{ fontSize:11, color:"#475569", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</span>
          ))}
        </div>
        {keywords.map((k, i) => (
          <div key={i} style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"1fr 80px 90px 80px 70px", gap:16, alignItems:"center" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <span style={{ fontSize:14, fontWeight:500, color:"#e2e8f0" }} className="mono">{k.kw}</span>
            <span style={{ fontSize:15, fontWeight:700, color: k.pos<=10?"#22c55e":k.pos<=30?"#f59e0b":"#ef4444" }}>#{k.pos}</span>
            <span style={{ fontSize:13, color:"#94a3b8" }}>{k.vol.toLocaleString()}/mo</span>
            <div>
              <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${k.diff}%`, background:`hsl(${120-k.diff},70%,50%)`, borderRadius:3 }} />
              </div>
              <span style={{ fontSize:10, color:"#475569", marginTop:2, display:"block" }}>{k.diff}/100</span>
            </div>
            <span style={{ fontSize:13, fontWeight:600, color: k.trend>0?"#22c55e":k.trend<0?"#ef4444":"#64748b" }}>
              {k.trend > 0 ? `↑ ${k.trend}` : k.trend < 0 ? `↓ ${Math.abs(k.trend)}` : "—"}
            </span>
          </div>
        ))}
      </div>
      <div style={{ height:40 }} />
    </div>
  );
};

// ─── PAGE: AI INSIGHTS ────────────────────────────────────────────────────────
const InsightsPage = ({ analysis }) => {
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(true);
  const insights = analysis?.aiInsights || MOCK_ANALYSIS.aiInsights;

  const refresh = async () => {
    setLoading(true); setShown(false);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false); setShown(true);
  };

  const icfg = {
    win:     { icon:"🏆", color:"#22c55e", bg:"rgba(34,197,94,0.08)",  border:"rgba(34,197,94,0.2)",  label:"Win" },
    action:  { icon:"⚡", color:"#6366f1", bg:"rgba(99,102,241,0.08)", border:"rgba(99,102,241,0.2)", label:"Action" },
    trend:   { icon:"📈", color:"#f59e0b", bg:"rgba(245,158,11,0.08)", border:"rgba(245,158,11,0.2)", label:"Trend" },
    warning: { icon:"⚠️", color:"#ef4444", bg:"rgba(239,68,68,0.08)",  border:"rgba(239,68,68,0.2)",  label:"Watch" },
  };

  const score = analysis?.score || 74;
  const history = [58, 61, 65, 68, 71, 74];

  return (
    <div style={{ padding:"clamp(16px, 3vw, 40px)", minWidth:0, width:"100%", boxSizing:"border-box" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:32 }} className="fade-up">
        <div>
          <h1 style={{ fontSize:32, fontWeight:800, letterSpacing:"-0.03em", marginBottom:8 }}>AI Insights</h1>
          <p style={{ color:"#64748b", fontSize:15 }}>Smart analysis of your SEO performance and opportunities</p>
        </div>
        <button onClick={refresh} disabled={loading}
          style={{ padding:"10px 18px", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:12, color:"#818cf8", fontSize:13, fontWeight:600, cursor: loading ? "wait" : "pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"Sora,sans-serif" }}>
          {loading ? <><Spinner /> Refreshing…</> : "↻ Refresh"}
        </button>
      </div>

      {/* Progress mini chart */}
      <div className="glass fade-up-1" style={{ borderRadius:18, padding:24, marginBottom:24 }}>
        <p style={{ fontSize:13, color:"#64748b", marginBottom:16, fontWeight:500 }}>Score progression (last 6 weeks)</p>
        <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:64 }}>
          {history.map((v, i) => (
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10, color: i===history.length-1 ? "#818cf8" : "#475569", fontWeight: i===history.length-1 ? 700 : 400 }}>{v}</span>
              <div style={{ width:"100%", background: i===history.length-1 ? "#6366f1" : "rgba(255,255,255,0.08)", borderRadius:"4px 4px 0 0", height:`${(v/100)*64}px`, transition:"height 1s" }} />
            </div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
          <span style={{ fontSize:11, color:"#334155" }}>6 weeks ago</span>
          <span style={{ fontSize:11, color:"#6366f1", fontWeight:600 }}>This week</span>
        </div>
        <div style={{ marginTop:16, padding:"10px 14px", background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:18 }}>📈</span>
          <span style={{ fontSize:13, color:"#22c55e", fontWeight:600 }}>+{score - history[0]} points over 6 weeks — you're in the top 30% of improving sites</span>
        </div>
      </div>

      {/* AI Insight cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {shown && insights.map((ins, i) => {
          const cfg = icfg[ins.type] || icfg.action;
          return (
            <div key={i} className={`fade-up-${i+1}`}
              style={{ background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:16, padding:20, display:"flex", gap:14 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:`${cfg.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                {cfg.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:cfg.color, textTransform:"uppercase", letterSpacing:"0.08em", background:`${cfg.color}20`, padding:"2px 8px", borderRadius:99 }}>{cfg.label}</span>
                </div>
                <p style={{ fontSize:14, color:"#cbd5e1", lineHeight:1.65 }}>{ins.text}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height:40 }} />
    </div>
  );
};

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
// UPDATED ADMIN PANEL - Connects to Real Railway Database
// Replace the AdminPanel component in App.jsx with this

const AdminPanel = ({ onBack }) => {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const doLogin = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setErr("");
    
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      setAuthed(true);
      loadUsers();
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(`${API_URL}/admin/users`);
      const data = await response.json();
      
      // Transform data to match expected format
      const transformedUsers = data.map(user => ({
        id: user.id.toString(),
        email: user.email,
        plan: user.plan || 'free',
        status: 'active',
        joined: user.created_at,
        searches: user.scans_today || 0,
        temp: null
      }));
      
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      showToast('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, plan: updatedUser.plan, ...updates }
          : u
      ));
      
      showToast(`${updatedUser.email} updated successfully`);
    } catch (error) {
      console.error('Update error:', error);
      showToast('Failed to update user');
    }
  };

  const filtered = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));

  const stats = [
    { label:"Total Users", val: users.length, icon:"👥", col:"#818cf8" },
    { label:"Active", val: users.filter(u=>u.status==="active").length, icon:"✅", col:"#22c55e" },
    { label:"Paid", val: users.filter(u=>u.plan!=="free").length, icon:"💰", col:"#f59e0b" },
    { label:"Temp Access", val: users.filter(u=>u.temp).length, icon:"⏱", col:"#38bdf8" },
  ];

  if (!authed) return (
    <div style={{ minHeight:"100vh", background:"#070710", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <img src={LOGO_BASE64} alt="UtilitySEO" style={{ width:36, height:36, borderRadius:8, objectFit:"cover" }} />
                      <span style={{ fontSize:20, fontWeight:800 }}>UtilitySEO</span>
          </div>
          <div style={{ display:"inline-block", padding:"4px 14px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:99, fontSize:11, fontWeight:700, color:"#ef4444", letterSpacing:"0.1em", textTransform:"uppercase" }}>Super Admin</div>
          <p style={{ color:"#475569", fontSize:13, marginTop:10 }}>Restricted. Authorised personnel only.</p>
        </div>
        <div className="glass" style={{ borderRadius:20, padding:28 }}>
          <form onSubmit={doLogin}>
            <Input label="Admin Email" type="email" placeholder="admin@utilityseo.com" value={email} onChange={e => setEmail(e.target.value)} />
            <Input label="Password" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
            {err && <p style={{ color:"#ef4444", fontSize:13, marginBottom:12 }}>{err}</p>}
            <button type="submit" disabled={loading} style={{ width:"100%", padding:"13px", background:"#6366f1", border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {loading ? <><Spinner /> Authenticating…</> : "Access Admin Panel →"}
            </button>
          </form>

        </div>
        <button onClick={onBack} style={{ display:"block", margin:"20px auto 0", background:"none", border:"none", color:"#334155", cursor:"pointer", fontSize:13, fontFamily:"Sora,sans-serif" }}>← Back to main site</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#070710", fontFamily:"Sora,sans-serif" }}>
      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:999, background:"#22c55e", color:"#fff", padding:"12px 20px", borderRadius:12, fontSize:13, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>✓ {toast}</div>}

      {/* Header */}
      <div style={{ background:"#0d0d18", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⚡</div>
          <span style={{ fontSize:16, fontWeight:700 }}>UtilitySEO</span>
          <span style={{ padding:"3px 12px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:99, fontSize:11, fontWeight:700, color:"#ef4444", letterSpacing:"0.05em" }}>SUPER ADMIN</span>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <button onClick={onBack} style={{ padding:"8px 16px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:"#94a3b8", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>← Main Site</button>
          <button onClick={() => setAuthed(false)} style={{ padding:"8px 16px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, color:"#ef4444", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ padding:"32px" }}>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32 }}>
          {stats.map(s => (
            <div key={s.label} className="glass" style={{ borderRadius:16, padding:20 }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:32, fontWeight:800, color:s.col }}>{s.val}</div>
              <div style={{ fontSize:13, color:"#475569", marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom:20 }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:"#475569", fontSize:16 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by email address…"
              style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"14px 16px 14px 44px", color:"#fff", fontSize:14, outline:"none", fontFamily:"JetBrains Mono,monospace" }}
              onFocus={e => e.target.style.border="1px solid #6366f1"}
              onBlur={e => e.target.style.border="1px solid rgba(255,255,255,0.1)"}
            />
          </div>
          <p style={{ color:"#334155", fontSize:12, marginTop:8 }}>{filtered.length} of {users.length} users</p>
        </div>

        {/* Users Table */}
        {loadingUsers ? (
          <div style={{ textAlign:"center", padding:60 }}>
            <Spinner />
            <p style={{ color:"#64748b", marginTop:16 }}>Loading users...</p>
          </div>
        ) : (
          <div className="glass" style={{ borderRadius:18, overflow:"hidden" }}>
            {/* Header row */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 100px 100px 80px 80px 100px", gap:16, padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              {["Email","Plan","Status","Searches","Joined","Actions"].map(h => (
                <span key={h} style={{ fontSize:11, color:"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</span>
              ))}
            </div>

            {filtered.map((u, i) => (
              <div key={u.id} style={{ display:"grid", gridTemplateColumns:"2fr 100px 100px 80px 80px 100px", gap:16, padding:"16px 20px", borderBottom: i<filtered.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems:"center" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <div>
                  <p style={{ fontSize:13, color:"#e2e8f0", fontFamily:"JetBrains Mono,monospace" }}>{u.email}</p>
                  {u.temp && <p style={{ fontSize:11, color:"#f59e0b", marginTop:3 }}>⏱ Temp {u.temp.plan} · {u.temp.days}d left</p>}
                </div>
                <div><Badge plan={u.plan} /></div>
                <div>
                  <span style={{ fontSize:12, fontWeight:600, color: u.status==="active" ? "#22c55e" : "#ef4444", background: u.status==="active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", padding:"3px 10px", borderRadius:99 }}>
                    {u.status}
                  </span>
                </div>
                <span style={{ fontSize:13, color:"#94a3b8" }}>{u.searches}</span>
                <span style={{ fontSize:11, color:"#475569" }}>{new Date(u.joined).toLocaleDateString()}</span>
                <button onClick={() => setEditing(u)}
                  style={{ padding:"6px 14px", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:8, color:"#818cf8", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && <EditModal user={editing} onClose={() => setEditing(null)}
        onSave={(updated) => {
          updateUser(updated.id, { 
            plan: updated.plan,
            status: updated.status,
            temp: updated.temp 
          });
          setEditing(null);
        }} />}
    </div>
  );

};

const EditModal = ({ user, onSave, onClose }) => {
  const [plan, setPlan] = useState(user.plan);
  const [status, setStatus] = useState(user.status);
  const [tempOn, setTempOn] = useState(!!user.temp);
  const [tempPlan, setTempPlan] = useState(user.temp?.plan || "pro");
  const [tempDays, setTempDays] = useState(user.temp?.days || 7);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:24 }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:480, background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h3 style={{ fontWeight:700, fontSize:16 }}>Edit User</h3>
            <p style={{ fontSize:12, color:"#475569", marginTop:2, fontFamily:"JetBrains Mono,monospace" }}>{user.email}</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:20 }}>×</button>
        </div>

        <div style={{ padding:24, maxHeight:"70vh", overflowY:"auto" }}>
          {/* Plan */}
          <p style={{ fontSize:12, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>Permanent Plan</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:20 }}>
            {[["free","Free","#64748b"],["pro","Pro","#6366f1"],["proPlus","Pro Plus","#f59e0b"]].map(([id,label,col]) => (
              <button key={id} onClick={() => setPlan(id)}
                style={{ padding:"12px 8px", borderRadius:12, border:`2px solid ${plan===id ? col : "rgba(255,255,255,0.08)"}`, background: plan===id ? `${col}18` : "rgba(255,255,255,0.03)", color: plan===id ? col : "#64748b", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", transition:"all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>

          {/* Status */}
          <p style={{ fontSize:12, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>Account Status</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
            {[["active","Active","#22c55e"],["suspended","Suspended","#ef4444"]].map(([id,label,col]) => (
              <button key={id} onClick={() => setStatus(id)}
                style={{ padding:"12px", borderRadius:12, border:`2px solid ${status===id ? col : "rgba(255,255,255,0.08)"}`, background: status===id ? `${col}18` : "rgba(255,255,255,0.03)", color: status===id ? col : "#64748b", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                {label}
              </button>
            ))}
          </div>

          {/* Temp access */}
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, overflow:"hidden" }}>
            <button onClick={() => setTempOn(!tempOn)}
              style={{ width:"100%", padding:"14px 16px", background:"none", border:"none", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:20, borderRadius:99, background: tempOn ? "#6366f1" : "rgba(255,255,255,0.1)", position:"relative", transition:"background 0.2s" }}>
                  <div style={{ position:"absolute", top:2, left: tempOn ? 18 : 2, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
                </div>
                <span style={{ fontSize:14, fontWeight:600, color:"#e2e8f0" }}>Temporary Access Override</span>
              </div>
              <span style={{ fontSize:11, color:"#475569" }}>{tempOn ? "ON" : "OFF"}</span>
            </button>

            {tempOn && (
              <div style={{ padding:"0 16px 16px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize:12, color:"#64748b", marginTop:14, marginBottom:8 }}>Temporary plan</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:16 }}>
                  {[["free","Free","#64748b"],["pro","Pro","#6366f1"],["proPlus","Pro Plus","#f59e0b"]].map(([id,label,col]) => (
                    <button key={id} onClick={() => setTempPlan(id)}
                      style={{ padding:"8px", borderRadius:10, border:`2px solid ${tempPlan===id ? col : "rgba(255,255,255,0.08)"}`, background: tempPlan===id ? `${col}18` : "rgba(255,255,255,0.03)", color: tempPlan===id ? col : "#64748b", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <p style={{ fontSize:12, color:"#64748b" }}>Duration</p>
                  <span style={{ fontSize:14, fontWeight:700, color:"#f59e0b" }}>{tempDays} days</span>
                </div>
                <input type="range" min={1} max={90} value={tempDays} onChange={e => setTempDays(Number(e.target.value))}
                  style={{ width:"100%", accentColor:"#6366f1" }} />
                <div style={{ padding:"10px 14px", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:10, marginTop:12 }}>
                  <p style={{ fontSize:12, color:"#fbbf24" }}>⚡ Will get <strong>{["free","Free","pro","Pro","proPlus","Pro Plus"].filter((_,i)=>i%2===1)[["free","pro","proPlus"].indexOf(tempPlan)]}</strong> access for {tempDays} day{tempDays!==1?"s":""}, then revert to {plan}.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"12px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, color:"#64748b", fontSize:14, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>Cancel</button>
          <button onClick={() => onSave({ ...user, plan, status, temp: tempOn ? { plan:tempPlan, days:tempDays } : null })}
            style={{ flex:2, padding:"12px", background:"#6366f1", border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("loading"); // loading | login | app | admin
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("scan");
  const [analysis, setAnalysis] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // On mount: check for existing token and restore session
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setScreen("app");
        fetch(`${API}/scans/latest`, { headers: { 'Authorization': `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : null)
          .then(data => { if (data?.scan) setAnalysis(data.scan); })
          .catch(() => {});
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setScreen("login");
      }
    } else {
      setScreen("login");
    }
  }, []);

  const handleLogin = async (userData) => {
    // Fetch fresh user data from server to get correct plan
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetch(`${API}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const fresh = await res.json();
          userData = { ...userData, plan: fresh.plan || userData.plan, tempPlan: fresh.tempPlan, tempDaysLeft: fresh.tempDaysLeft };
        }
      }
    } catch {}
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setScreen("app");
    setPage("scan");
    
    // Load latest scan if available
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${API}/scans/latest`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAnalysis(data.scan);
        }
      }
    } catch (error) {
      console.log('No previous scans found');
    }
  };

  const handleResults = async (data) => {
    setAnalysis(data);
    setPage("results");
    
    // Save scan to database
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/scans/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            url: data.url,
            score: data.score,
            metrics: data.metrics,
            issues: data.issues,
            keywords: data.keywords || [],
            aiInsights: data.aiInsights || [],
            fixedIssues: []
          })
        });
        console.log('Scan saved successfully');
      }
    } catch (error) {
      console.error('Failed to save scan:', error);
    }
  };

  const loadScan = async (scanId) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/scans/${scanId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAnalysis(data.scan);
          setPage("results");
        }
      }
    } catch (error) {
      console.error('Failed to load scan:', error);
    }
  };

  if (screen === "loading") return (
    <>
      <GlobalStyles />
      <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#0a0a0f" }}>
        <div className="spin" style={{ width:32, height:32, border:"3px solid rgba(99,102,241,0.3)", borderTop:"3px solid #6366f1", borderRadius:"50%" }} />
      </div>
    </>
  );

  if (screen === "admin") return (
    <>
      <GlobalStyles />
      <AdminPanel onBack={() => setScreen("login")} />
    </>
  );

  if (screen === "login") return (
    <>
      <GlobalStyles />
      <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#0a0a0f", padding:"20px", overflow:"auto" }}>
        <LoginPage onLogin={handleLogin} onGoAdmin={() => setScreen("admin")} />
      </div>
    </>
  );

  const sidebarWidth = sidebarCollapsed ? 60 : 220;

  return (
    <>
      <GlobalStyles />
      <style>{`
        @media (max-width: 768px) {
          .app-layout { grid-template-columns: 60px 1fr !important; }
          .sidebar-label { display: none !important; }
        }
      `}</style>
      <div className="app-layout" style={{ display:"grid", gridTemplateColumns:`${sidebarWidth}px 1fr`, minHeight:"100vh", width:"100vw", maxWidth:"100vw", overflow:"hidden", position:"fixed", top:0, left:0, right:0, bottom:0, transition:"grid-template-columns 0.2s" }}>
        <Sidebar page={page} setPage={setPage} user={user} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed}
          onLogout={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setScreen("login"); setUser(null); setAnalysis(null); setRemaining(null); }} />
        <main style={{ background:"#0a0a0f", height:"100vh", overflowY:"auto", width:"100%", boxSizing:"border-box" }}>
          {page === "scan"     && <ScanPage onResults={handleResults} user={user} remaining={remaining} setRemaining={setRemaining} />}
          {page === "results"  && <ResultsPage analysis={analysis} onLoadScan={loadScan} />}
          {page === "keywords" && <KeywordsPage analysis={analysis} user={user} />}
          {page === "insights" && <InsightsPage analysis={analysis} />}
        </main>
      </div>
    </>
  );
}