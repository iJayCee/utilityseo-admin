import { useState, useEffect } from "react";
import LoadTestPanel from "./LoadTestPanel";

const LOGO_BASE64 = "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCABBAEEDASIAAhEBAxEB/8QAHAAAAgMBAQEBAAAAAAAAAAAAAAQCAwUGAQcI/8QALhAAAgIBAgQEBgEFAAAAAAAAAAECAwQRYQUSMVEGcXKxFCEjJDSRQVJTYpKh/8QAGgEAAgMBAQAAAAAAAAAAAAAAAgQDBQYBB//EACoRAAICAgEBBgYDAAAAAAAAAAABAgMEERIhBRMUMVFxIjIzNEFhUpHB/9oADAMBAAIRAxEAPwD8jQqSrjol0B1rshmEPpx8kDgazwy4roOcBN1rsRcF2G3AawuDcSzo82Jg5F0f6owfL++hD4NzeorbOcDHdexFw2N3M8PcZxa3ZfwzKjBLVyVbaXm10MpwF7cKUHqUdAOGhRwIuA24EHATnjAOIrygXcoC/cA8Tcqh9KHpQOAxTD6FfpXsShWpWRT6NrU9A8PqCf6LLj0NrwvwfHcY5udBWa/OuuXTTu+50lOWkko6JL5JL+Dk6ctJJJ6JDdWZuS42VCpaiDGejraszc5vxh4axOJ0TzMGqFObFczUVordmu+/7JVZm41Vmbjtl9eTDhYtoNyUlpnyeVbTaa0aK3A3/FOPCvjeQ4LSNjU0t2tX/wB1MlwMtbi8ZNC7gIcoF/KBW9wR8Tfoh9vX6F7HsoNJtdS/Hh9tV6F7EnA9HWKpVpeqLPhtCFWZuNVZm5l8VxbaZPIpi5Qfzkl1W/kJVZm5gMmVuFc6ren+r1RWT5Vy0zrKszcaqzNzk6szcexrrJx5lrp3GcTJndNQh1YUJOT0izjNnxGdOfVJKP6EHAclAg4F9LGf5GuBmcoF3KBUdwQ8To8WH2tXoj7EnAtwVGeDRODUouuOjXkWOB6dXj7qi16ItlHohNwE8jhmHdLmnjx5n1a1jr+jVcCDgLZGBXcuNkU1+1sGVal5oyquGYlT1jSm/wDJt+5e4LsOOBBwFIdn1UrVcFH2WgFUo+SFHAg4DjgQcCOeMccTI5QD4jF/v1/7AZrdX8l/aFPh9RTgn4K9THWAC/Z/2tfsga/kRFnjABhhHhFgBEzjPGU5f49npYALX/Tl7MCXkzBAAMGVx//Z";

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
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
    .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); }
    input, select, textarea { font-family: 'Sora', sans-serif; }
    .desktop-only { display: grid; }
    .mobile-only { display: none; }
    @media (max-width: 700px) {
      .desktop-only { display: none !important; }
      .mobile-only { display: block !important; }
      .admin-header { padding: 12px 16px !important; }
      .admin-body { padding: 16px !important; }
      .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
      .admin-chart-card { grid-column: 1 / -1 !important; }
      .tab-bar { gap: 4px !important; }
      .tab-btn { padding: 8px 12px !important; font-size: 12px !important; }
      .promo-table-header { display: none !important; }
      .promo-row { display: flex !important; flex-direction: column !important; gap: 8px !important; padding: 16px !important; }
      .promo-row-grid { display: contents !important; }
    }
  `}</style>
);

const MonthlyChart = ({ users }) => {
  const [activeBar, setActiveBar] = useState(null);
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleString('en-GB', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() });
  }
  const counts = months.map(m =>
    users.filter(u => {
      if (!u.joined) return false;
      const d = new Date(u.joined);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    }).length
  );
  const max = Math.max(...counts, 1);
  return (
    <div style={{ width:"100%", marginTop:8 }}>
      {activeBar !== null && (
        <div style={{ textAlign:"center", marginBottom:6, fontSize:12, fontWeight:700, color:"#818cf8" }}>
          {months[activeBar].label}: <span style={{ color:"#e2e8f0" }}>{counts[activeBar]} signup{counts[activeBar] !== 1 ? "s" : ""}</span>
        </div>
      )}
      <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:48 }}>
        {counts.map((c, i) => (
          <div key={i}
            onClick={() => setActiveBar(activeBar === i ? null : i)}
            style={{ flex:1, background: activeBar === i ? "#a78bfa" : i === 11 ? "#818cf8" : "rgba(129,140,248,0.35)",
              borderRadius:"3px 3px 0 0", height:`${Math.max((c / max) * 100, 4)}%`,
              transition:"all 0.15s", cursor:"pointer" }} />
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
        <span style={{ fontSize:9, color:"#334155" }}>{months[0].label}</span>
        <span style={{ fontSize:9, color:"#334155" }}>{months[11].label}</span>
      </div>
    </div>
  );
};

const Badge = ({ plan }) => {
  const cfg = { free:["#64748b","#1e293b"], pro:["#818cf8","#1e1b4b"], proPlus:["#f59e0b","#1c1407"] };
  const col = cfg[plan] || cfg.free;
  const text = { free:"Free", pro:"Pro", proPlus:"Pro Plus" }[plan] || plan;
  return <span style={{ color:col[0], background:col[1], border:`1px solid ${col[0]}33`, padding:"2px 10px", borderRadius:99, fontSize:11, fontWeight:600, letterSpacing:"0.03em" }}>{text}</span>;
};

// ── Status badge - distinct colours per state ─────────────────────────────────
const StatusBadge = ({ status }) => {
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

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={{ display:"block", fontSize:13, color:"#94a3b8", marginBottom:6, fontWeight:500 }}>{label}</label>}
    <input {...props} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 16px", color:"#fff", fontSize:14, outline:"none", fontFamily:"Sora,sans-serif", transition:"border 0.15s", ...props.style }}
      onFocus={e => e.target.style.border="1px solid #6366f1"}
      onBlur={e => e.target.style.border="1px solid rgba(255,255,255,0.1)"}
    />
  </div>
);

const Spinner = () => <div className="spin" style={{ width:20, height:20, border:"2px solid rgba(255,255,255,0.1)", borderTopColor:"#6366f1", borderRadius:"50%", display:"inline-block" }} />;

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
const EditModal = ({ user, onSave, onClose }) => {
  const [plan, setPlan] = useState(user.plan);
  const [status, setStatus] = useState(user.status);
  const [cookieConsent, setCookieConsent] = useState(user.cookieConsent || null);
  const [tempOn, setTempOn] = useState(!!user.tempPlan);
  const [tempPlan, setTempPlan] = useState(user.tempPlan || "pro");
  const [tempDays, setTempDays] = useState(7);

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
          {/* Pro Plus removed from assignment - Pro is now the unlimited tier.
              Legacy proPlus rows still display with their badge below if present. */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:6 }}>
            {[["free","Free","#64748b"],["pro","Pro","#6366f1"]].map(([id,label,col]) => (
              <button key={id} onClick={() => setPlan(id)}
                style={{ padding:"12px 8px", borderRadius:12, border:`2px solid ${plan===id ? col : "rgba(255,255,255,0.08)"}`, background: plan===id ? `${col}18` : "rgba(255,255,255,0.03)", color: plan===id ? col : "#64748b", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", transition:"all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>
          {plan === 'proPlus' && (
            <div style={{ marginBottom:20, padding:"8px 12px", borderRadius:8, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.25)", fontSize:11, color:"#f59e0b" }}>
              This user is on legacy <strong>Pro Plus</strong>. Pro now offers the same unlimited features - switching to Pro is recommended.
            </div>
          )}
          {plan !== 'proPlus' && <div style={{ marginBottom:14 }} />}

          {/* Status - now includes Deactivated */}
          <p style={{ fontSize:12, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>Account Status</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:20 }}>
            {[
              ["active","● Active","#22c55e"],
              ["deactivated","○ Deactivated","#94a3b8"],
              ["suspended","⊘ Suspended","#ef4444"],
            ].map(([id,label,col]) => (
              <button key={id} onClick={() => setStatus(id)}
                style={{ padding:"12px 8px", borderRadius:12, border:`2px solid ${status===id ? col : "rgba(255,255,255,0.08)"}`, background: status===id ? `${col}18` : "rgba(255,255,255,0.03)", color: status===id ? col : "#64748b", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                {label}
              </button>
            ))}
          </div>

          {status === "deactivated" && (
            <div style={{ padding:"10px 14px", background:"rgba(148,163,184,0.08)", border:"1px solid rgba(148,163,184,0.2)", borderRadius:10, marginBottom:20 }}>
              <p style={{ fontSize:12, color:"#94a3b8" }}>⚠️ Deactivated accounts cannot log in. The user deactivated their own account and can be reactivated here.</p>
            </div>
          )}

          {/* Cookie Consent */}
          <p style={{ fontSize:12, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>Cookie Consent</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:20 }}>
            {[["accepted","✅ Accepted","#22c55e"],["declined","❌ Declined","#ef4444"],[null,"⏳ Not Set","#475569"]].map(([val, label, col]) => (
              <button key={String(val)} onClick={() => setCookieConsent(val)}
                style={{ padding:"10px 8px", borderRadius:12, border:`2px solid ${cookieConsent===val ? col : "rgba(255,255,255,0.08)"}`, background: cookieConsent===val ? `${col}18` : "rgba(255,255,255,0.03)", color: cookieConsent===val ? col : "#64748b", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", transition:"all 0.15s" }}>
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
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:6, marginBottom:16 }}>
                  {[["free","Free","#64748b"],["pro","Pro","#6366f1"]].map(([id,label,col]) => (
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
                  <p style={{ fontSize:12, color:"#fbbf24" }}>Will get <strong>{({"free":"Free","pro":"Pro","proPlus":"Pro Plus"})[tempPlan]}</strong> access for {tempDays} day{tempDays!==1?"s":""}, then revert to {plan}.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"12px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, color:"#64748b", fontSize:14, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>Cancel</button>
          <button onClick={() => onSave({ ...user, plan, status, cookieConsent, tempPlan: tempOn ? tempPlan : null, tempDays: tempOn ? tempDays : null, revokeTemp: !tempOn && !!user.tempPlan })}
            style={{ flex:2, padding:"12px", background:"#6366f1", border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── USER ROW ──────────────────────────────────────────────────────────────────
const UserRow = ({ u, i, total, onInfo, onEdit, onAccess, starred, onToggleStar }) => {
  const [expanded, setExpanded] = useState(false);
  const tempInfo = u.tempPlan && u.tempPlanExpiresAt ? (() => {
    const daysLeft = Math.ceil((new Date(u.tempPlanExpiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    const planLabel = { free:"Free", pro:"Pro", proPlus:"Pro Plus" }[u.tempPlan] || u.tempPlan;
    return `⏱ Temp ${planLabel} · ${daysLeft > 0 ? `${daysLeft}d left` : "Expired"}`;
  })() : null;

  const isDeactivated = u.status === "deactivated";

  return (
    <div style={{ borderBottom: i < total - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
      background: isDeactivated ? "rgba(148,163,184,0.03)" : "transparent" }}>
      {/* Desktop row */}
      <div className="desktop-only"
        style={{ gridTemplateColumns:"2fr 100px 130px 60px 60px 50px 90px 110px 140px", gap:16, padding:"16px 20px", alignItems:"center",
          opacity: isDeactivated ? 0.65 : 1 }}
        onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"}
        onMouseLeave={e => e.currentTarget.style.background=isDeactivated ? "rgba(148,163,184,0.03)" : "transparent"}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <p style={{ fontSize:13, color: isDeactivated ? "#64748b" : "#e2e8f0", fontFamily:"JetBrains Mono,monospace" }}>{u.email}</p>
            {isDeactivated && <span style={{ fontSize:10, color:"#94a3b8", background:"rgba(148,163,184,0.1)", border:"1px solid rgba(148,163,184,0.2)", padding:"1px 6px", borderRadius:4, fontWeight:700, letterSpacing:"0.05em" }}>DEACTIVATED</span>}
          </div>
          {tempInfo && <p style={{ fontSize:11, color:"#f59e0b", marginTop:3 }}>{tempInfo}</p>}
        </div>
        <div><Badge plan={u.plan} /></div>
        <div><StatusBadge status={u.status} /></div>
        <div>
          <span style={{ fontSize:13, color:"#94a3b8" }}>{u.searches}</span>
          <span style={{ fontSize:10, color:"#334155", display:"block" }}>today</span>
        </div>
        <div>
          <span style={{ fontSize:13, color:"#94a3b8" }}>{u.totalScans}</span>
          <span style={{ fontSize:10, color:"#334155", display:"block" }}>lifetime</span>
        </div>
        <span title={`Cookie: ${u.cookieConsent || "not set"}`} style={{ fontSize:14, textAlign:"center" }}>
          {u.cookieConsent === "accepted" ? "✅" : u.cookieConsent === "declined" ? "❌" : "⏳"}
        </span>
        <span style={{ fontSize:11, color:"#475569" }}>{new Date(u.joined).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Europe/London' })}</span>
        <span style={{ fontSize:11, color:"#475569" }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Europe/London' }) : '-'}</span>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <button onClick={onToggleStar}
            title={starred ? "Unstar" : "Star user"}
            style={{ padding:"6px 14px", background: starred ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)", border:`1px solid ${starred ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius:8, color: starred ? "#f59e0b" : "#475569", fontSize:14, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
            {starred ? "★" : "☆"}
          </button>
          <button onClick={onInfo}
            style={{ padding:"6px 14px", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", borderRadius:8, color:"#4ade80", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
            Info
          </button>
          <button onClick={onEdit}
            style={{ padding:"6px 14px", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:8, color:"#818cf8", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
            Edit
          </button>
          {!isDeactivated && (
            <button onClick={onAccess}
              style={{ padding:"6px 14px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, color:"#f87171", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600, whiteSpace:"nowrap" }}>
              👤 Access Account
            </button>
          )}
        </div>
      </div>

      {/* Mobile row */}
      <div className="mobile-only">
        <button onClick={() => setExpanded(e => !e)}
          style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"transparent", border:"none", color: isDeactivated ? "#64748b" : "#e2e8f0", cursor:"pointer", fontFamily:"JetBrains Mono,monospace", fontSize:13, textAlign:"left" }}>
          <span style={{ flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginRight:8 }}>{u.email}</span>
          {isDeactivated && <span style={{ fontSize:9, color:"#94a3b8", background:"rgba(148,163,184,0.1)", padding:"1px 5px", borderRadius:3, fontWeight:700, marginRight:6, flexShrink:0 }}>OFF</span>}
          <span style={{ fontSize:11, color:"#475569", marginRight:8, flexShrink:0 }}>{expanded ? "▲" : "▼"}</span>
        </button>
        {expanded && (
          <div style={{ padding:"0 16px 16px", display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:11, color:"#475569" }}>PLAN</span>
              <Badge plan={u.plan} />
            </div>
            {tempInfo && <p style={{ fontSize:11, color:"#f59e0b" }}>{tempInfo}</p>}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:11, color:"#475569" }}>STATUS</span>
              <StatusBadge status={u.status} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, color:"#475569" }}>TODAY'S SCANS</span>
              <span style={{ fontSize:13, color:"#94a3b8" }}>{u.searches}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, color:"#475569" }}>LIFETIME SCANS</span>
              <span style={{ fontSize:13, color:"#94a3b8" }}>{u.totalScans}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, color:"#475569" }}>JOINED</span>
              <span style={{ fontSize:11, color:"#475569" }}>{new Date(u.joined).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Europe/London' })}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, color:"#475569" }}>LAST SEEN</span>
              <span style={{ fontSize:11, color:"#475569" }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Europe/London' }) : '-'}</span>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={onToggleStar}
                style={{ flex:1, padding:"10px", background: starred ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)", border:`1px solid ${starred ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius:8, color: starred ? "#f59e0b" : "#475569", fontSize:14, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                {starred ? "★ Starred" : "☆ Star"}
              </button>
              <button onClick={onInfo}
                style={{ flex:1, padding:"10px", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", borderRadius:8, color:"#4ade80", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
                Info
              </button>
            </div>
            <button onClick={onEdit}
              style={{ width:"100%", padding:"10px", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:8, color:"#818cf8", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
              Edit
            </button>
            {!isDeactivated && (
              <button onClick={onAccess}
                style={{ width:"100%", padding:"10px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, color:"#f87171", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
                👤 Access Account
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


const AdminPanel = () => {
  // `authed` must be true AND we must have creds in sessionStorage. Without
  // both, every admin API call silently 401s and the user sees empty tables
  // with no explanation - because sessionStorage clears on browser restart
  // while localStorage persists. If the flag is stale but creds are missing,
  // clear the flag so the login screen renders instead of a blank dashboard.
  const [authed, setAuthed] = useState(() => {
    const flag = localStorage.getItem('admin_authed') === 'true';
    const hasCreds = !!sessionStorage.getItem('admin_creds');
    if (flag && !hasCreds) {
      localStorage.removeItem('admin_authed');
      return false;
    }
    return flag;
  });
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [adminCreds, setAdminCreds] = useState(() => { try { return JSON.parse(sessionStorage.getItem('admin_creds') || 'null'); } catch { return null; } });

  // SECURITY: every admin endpoint (other than /login) now requires admin
  // credentials. This wrapper attaches them as headers on every fetch so we
  // don't have to thread credentials through 20+ call sites.
  const adminFetch = async (url, opts = {}) => {
    const headers = { ...(opts.headers || {}) };
    // Pull latest creds fresh each call (covers the login → immediate-fetch
    // race where setAdminCreds hasn't reached state yet).
    let creds = adminCreds;
    if (!creds?.email || !creds?.password) {
      try { creds = JSON.parse(sessionStorage.getItem('admin_creds') || 'null'); } catch {}
    }
    if (creds?.email && creds?.password) {
      headers['x-admin-email'] = creds.email;
      headers['x-admin-password'] = creds.password;
    }
    const res = await fetch(url, { ...opts, headers });
    // Session expired (creds rejected) - clear auth state so the login screen
    // renders on the next render cycle, surfacing the issue to the user.
    if (res.status === 401) {
      sessionStorage.removeItem('admin_creds');
      localStorage.removeItem('admin_authed');
      setAdminCreds(null);
      setAuthed(false);
    }
    return res;
  };

  const [activeTab, setActiveTab] = useState("users");
  const [pfData, setPfData] = useState(null);
  const [pfLoading, setPfLoading] = useState(false);
  const [pfError, setPfError] = useState("");
  const [monData, setMonData] = useState(null);
  const [monLoading, setMonLoading] = useState(false);
  const [monError, setMonError] = useState("");
  const [pfCodeFilter, setPfCodeFilter] = useState("all");
  const [pfStatusFilter, setPfStatusFilter] = useState("all");
  const [pfSearch, setPfSearch] = useState("");
  const [revenueModal, setRevenueModal] = useState(null); // { code, period, data, loading }
  const [promos, setPromos] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [promoForm, setPromoForm] = useState({ code:"", description:"", trial_plan:"pro", trial_days:"14", max_uses:"", expires_at:"" });
  const [promoFormError, setPromoFormError] = useState("");
  const [expandedPromo, setExpandedPromo] = useState(null); // promo id
  const [promoSignups, setPromoSignups] = useState({}); // { [promoId]: { loading, data } }
  const [savingPromo, setSavingPromo] = useState(false);
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  // Hard-delete confirmation state - null when no modal open, otherwise the
  // user being deleted. The user must type the email exactly (matched by
  // both client + server) before the destructive action proceeds.
  const [hardDeletingUser, setHardDeletingUser] = useState(null);
  const [hardDeleteConfirm, setHardDeleteConfirm] = useState("");
  const [hardDeleting, setHardDeleting] = useState(false);
  const [filterSector, setFilterSector] = useState("all");
  const [filterReferral, setFilterReferral] = useState("all");
  const [filterMarketing, setFilterMarketing] = useState("all");
  const [filterStarred, setFilterStarred] = useState(false);
  const [starredIds, setStarredIds] = useState(new Set());
  const [viewingUser, setViewingUser] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortCol, setSortCol] = useState("joined");
  const [sortDir, setSortDir] = useState("desc");
  const [statsWindow, setStatsWindow] = useState(7);

  const MAIN_APP_URL = import.meta.env.VITE_MAIN_APP_URL || 'https://app.utilityseo.com';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => { if (authed) loadUsers(); }, []);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const doLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const response = await adminFetch(`${API_URL}/admin/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email, password:pass }) });
      if (!response.ok) { setErr("Access denied. Invalid credentials."); setLoading(false); return; }
      const creds = { email, password:pass };
      setAdminCreds(creds);
      sessionStorage.setItem('admin_creds', JSON.stringify(creds));
      setAuthed(true);
      localStorage.setItem('admin_authed', 'true');
      loadUsers();
    } catch { setErr("Connection error. Please try again."); }
    finally { setLoading(false); }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await adminFetch(`${API_URL}/admin/users`);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Users endpoint returned ${response.status}`);
      }
      const data = await response.json();
      const transformed = data.map(user => ({
        id: user.id.toString(),
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        companyName: user.company_name || '',
        companySector: user.company_sector || '',
        jobRole: user.job_role || '',
        referralSource: user.referral_source || '',
        marketingConsent: user.marketing_consent === true ? 'Yes' : 'No',
        cookieConsent: user.cookie_consent || null,
        cookieConsentAt: user.cookie_consent_at || null,
        plan: user.plan || 'free',
        status: user.is_active === false ? 'deactivated' : 'active',
        joined: user.created_at,
        lastLogin: user.last_login || null,
        lastScanAt: user.last_scan_at || null,
        searches: user.scans_today || 0,
        totalScans: user.total_scans || 0,
        tempPlan: user.temp_plan || null,
        tempPlanExpiresAt: user.temp_plan_expires_at || null,
        isStarred: user.is_starred || false,
        adminNotes: user.admin_notes || '',
      }));
      setUsers(transformed);
      setStarredIds(new Set(transformed.filter(u => u.isStarred).map(u => String(u.id))));
    } catch (err) {
      console.error('[admin] loadUsers failed:', err);
      showToast(err.message || 'Failed to load users', true);
    }
    finally { setLoadingUsers(false); }
  };

  const accessAccount = (user) => {
    if (!adminCreds) { showToast('Session expired - please log out and log in again', true); return; }
    const newWin = window.open('', '_blank') || window;
    const isSameTab = newWin === window;
    if (newWin && !isSameTab) {
      newWin.document.write('<html><body style="background:#0a0a0f;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#818cf8;font-size:15px;">Loading account…</body></html>');
    }
    adminFetch(`${API_URL}/admin/impersonate/${user.id}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ adminEmail:adminCreds.email, adminPassword:adminCreds.password }) })
      .then(r => r.json().then(data => ({ ok:r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Failed');
        const url = `${MAIN_APP_URL}?impersonate=${encodeURIComponent(data.token)}&as=${encodeURIComponent(user.email)}&plan=${encodeURIComponent(data.user.plan || 'free')}`;
        if (isSameTab) { sessionStorage.setItem('impersonationToken', data.token); sessionStorage.setItem('impersonationEmail', user.email); sessionStorage.setItem('impersonationPlan', data.user.plan || 'free'); window.location.href = url; }
        else { try { newWin.sessionStorage.setItem('impersonationToken', data.token); newWin.sessionStorage.setItem('impersonationEmail', user.email); newWin.sessionStorage.setItem('impersonationPlan', data.user.plan || 'free'); } catch(e) {} newWin.location.href = url; }
      })
      .catch(e => { if (!isSameTab) newWin.close(); showToast(`Error: ${e.message}`, true); });
  };

  const updateUser = async (userId, updates) => {
    try {
      const response = await adminFetch(`${API_URL}/admin/users/${userId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ plan:updates.plan, status:updates.status, cookie_consent:updates.cookieConsent }) });
      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = await response.json();
      if (updates.tempPlan && updates.tempDays) {
        const tempRes = await adminFetch(`${API_URL}/admin/users/${userId}/temp-plan`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ plan:updates.tempPlan, days:updates.tempDays }) });
        if (!tempRes.ok) throw new Error('Failed to set temp plan');
        const tempData = await tempRes.json();
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan:updatedUser.plan, status:updates.status, tempPlan:tempData.temp_plan, tempPlanExpiresAt:tempData.temp_plan_expires_at } : u));
      } else if (updates.revokeTemp) {
        const revokeRes = await adminFetch(`${API_URL}/admin/users/${userId}/temp-plan`, { method:'DELETE' });
        if (!revokeRes.ok) throw new Error('Failed to revoke temp plan');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan:updatedUser.plan, status:updates.status, tempPlan:null, tempPlanExpiresAt:null } : u));
      } else {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan:updatedUser.plan, status:updates.status, cookieConsent:updatedUser.cookie_consent || u.cookieConsent } : u));
      }
      showToast(`${updatedUser.email} updated successfully`);
    } catch { showToast('Failed to update user', true); }
  };

  // ── Hard delete user ──────────────────────────────────────────────────
  // Backend requires confirmEmail in the body to match user.email exactly.
  // We mirror the same check client-side as a safety net so the request
  // can't even fire unless the typed value matches.
  const performHardDelete = async () => {
    if (!hardDeletingUser) return;
    if (hardDeleteConfirm.trim().toLowerCase() !== hardDeletingUser.email.toLowerCase()) {
      showToast('Typed email does not match', true);
      return;
    }
    setHardDeleting(true);
    try {
      const res = await adminFetch(`${API_URL}/admin/users/${hardDeletingUser.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmEmail: hardDeleteConfirm.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      // Drop the user from local state + close any modals
      setUsers(prev => prev.filter(u => u.id !== hardDeletingUser.id));
      if (viewingUser?.id === hardDeletingUser.id) setViewingUser(null);
      showToast(`${hardDeletingUser.email} permanently deleted`);
      setHardDeletingUser(null);
      setHardDeleteConfirm('');
    } catch (err) {
      showToast(err.message || 'Delete failed', true);
    } finally {
      setHardDeleting(false);
    }
  };

  const loadPromos = async () => {
    setLoadingPromos(true);
    try { const res = await adminFetch(`${API_URL}/admin/promo-codes`); const data = await res.json(); setPromos(data); }
    catch { showToast("Failed to load promo codes", true); }
    finally { setLoadingPromos(false); }
  };

  const loadPromoSignups = async (promoId) => {
    if (expandedPromo === promoId) { setExpandedPromo(null); return; }
    setExpandedPromo(promoId);
    if (promoSignups[promoId]?.data) return;
    setPromoSignups(prev => ({ ...prev, [promoId]: { loading: true } }));
    try {
      const res = await adminFetch(`${API_URL}/admin/promo-codes/${promoId}/signups`);
      const data = await res.json();
      setPromoSignups(prev => ({ ...prev, [promoId]: { loading: false, data } }));
    } catch { setPromoSignups(prev => ({ ...prev, [promoId]: { loading: false, error: true } })); }
  };

  const createPromo = async () => {
    setPromoFormError("");
    if (!promoForm.code.trim()) { setPromoFormError("Code is required"); return; }
    if (!promoForm.trial_days || isNaN(promoForm.trial_days) || Number(promoForm.trial_days) < 1) { setPromoFormError("Trial days must be a positive number"); return; }
    setSavingPromo(true);
    try {
      const res = await adminFetch(`${API_URL}/admin/promo-codes`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ code:promoForm.code.trim().toUpperCase(), description:promoForm.description.trim()||null, trial_plan:promoForm.trial_plan, trial_days:Number(promoForm.trial_days), max_uses:promoForm.max_uses?Number(promoForm.max_uses):null, expires_at:promoForm.expires_at||null }) });
      const data = await res.json();
      if (!res.ok) { setPromoFormError(data.error || "Failed"); return; }
      setPromos(prev => [data, ...prev]);
      setPromoForm({ code:"", description:"", trial_plan:"pro", trial_days:"14", max_uses:"", expires_at:"" });
      showToast(`Code ${data.code} created`);
    } catch { setPromoFormError("Network error"); }
    finally { setSavingPromo(false); }
  };

  const togglePromoActive = async (promo) => {
    try {
      const res = await adminFetch(`${API_URL}/admin/promo-codes/${promo.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ is_active:!promo.is_active }) });
      const data = await res.json();
      if (!res.ok) { showToast("Failed to update", true); return; }
      setPromos(prev => prev.map(p => p.id === promo.id ? data : p));
    } catch { showToast("Network error", true); }
  };

  const deletePromo = async (id) => {
    if (!window.confirm("Delete this promo code? This cannot be undone.")) return;
    try {
      const res = await adminFetch(`${API_URL}/admin/promo-codes/${id}`, { method:"DELETE" });
      if (!res.ok) { showToast("Failed to delete", true); return; }
      setPromos(prev => prev.filter(p => p.id !== id));
      showToast("Promo code deleted");
    } catch { showToast("Network error", true); }
  };

  const loadProspectFlow = async () => {
    if (pfData) return;
    setPfLoading(true); setPfError("");
    try {
      if (!adminCreds) { setPfError("Session expired - please log out and back in."); setPfLoading(false); return; }
      const params = new URLSearchParams({ adminEmail: adminCreds.email, adminPassword: adminCreds.password });
      const res = await adminFetch(`${API_URL}/admin/prospect-flow?${params}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load");
      setPfData(d);
    } catch (err) { setPfError(err.message); }
    setPfLoading(false);
  };

  const loadCodeRevenue = async (code, period = '3m') => {
    setRevenueModal({ code, period, data: null, loading: true });
    try {
      if (!adminCreds) return;
      const params = new URLSearchParams({ adminEmail: adminCreds.email, adminPassword: adminCreds.password, code, period });
      const res = await adminFetch(`${API_URL}/admin/prospect-flow/code-revenue?${params}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      setRevenueModal({ code, period, data: d, loading: false });
    } catch (err) {
      setRevenueModal({ code, period, data: null, loading: false, error: err.message });
    }
  };

  const loadMonitoring = async () => {
    setMonLoading(true); setMonError("");
    try {
      const res = await adminFetch(`${API_URL}/admin/monitoring`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load");
      setMonData(d);
    } catch (err) { setMonError(err.message); }
    setMonLoading(false);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === "prospectflow") loadProspectFlow();
    if (tab === "promos" && promos.length === 0) loadPromos();
    if (tab === "monitoring") loadMonitoring();
  };

  const allSectors = [...new Set(users.map(u => u.companySector).filter(Boolean))].sort();
  const allReferrals = [...new Set(users.map(u => u.referralSource).filter(Boolean))].sort();
  const activeFiltersCount = [filterPlan!=="all", filterStatus!=="all", filterSector!=="all", filterReferral!=="all", filterMarketing!=="all", dateFrom, dateTo].filter(Boolean).length;

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const saveNote = async (userId, text) => {
    setNoteSaving(true);
    try {
      const res = await adminFetch(`${API_URL}/admin/users/${userId}/notes`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ notes:text }) });
      if (!res.ok) throw new Error('Save failed');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, adminNotes:text } : u));
      showToast('Note saved');
    } catch { showToast('Failed to save note', true); }
    setNoteSaving(false);
  };

  const toggleStar = async (id) => {
    const sid = String(id);
    setStarredIds(prev => { const next = new Set(prev); next.has(sid) ? next.delete(sid) : next.add(sid); return next; });
    try { await adminFetch(`${API_URL}/admin/users/${id}/star`, { method:'PATCH', headers:{'Content-Type':'application/json'} }); }
    catch { setStarredIds(prev => { const next = new Set(prev); next.has(sid) ? next.delete(sid) : next.add(sid); return next; }); }
  };

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      if (q && !u.email.toLowerCase().includes(q) && !(u.firstName+' '+u.lastName).toLowerCase().includes(q) && !(u.companyName||'').toLowerCase().includes(q)) return false;
      if (filterPlan !== "all") { if (filterPlan === "trial") { if (!u.tempPlan) return false; } else if (u.plan !== filterPlan) return false; }
      if (filterStatus !== "all" && u.status !== filterStatus) return false;
      if (filterSector !== "all" && u.companySector !== filterSector) return false;
      if (filterReferral !== "all" && u.referralSource !== filterReferral) return false;
      if (filterMarketing !== "all" && u.marketingConsent !== filterMarketing) return false;
      if (filterStarred && !starredIds.has(String(u.id))) return false;
      if (dateFrom && new Date(u.joined) < new Date(dateFrom)) return false;
      if (dateTo) { const t = new Date(dateTo); t.setHours(23,59,59); if (new Date(u.joined) > t) return false; }
      return true;
    })
    .sort((a, b) => {
      let av, bv;
      if (sortCol === "email") { av=a.email; bv=b.email; }
      else if (sortCol === "plan") { av=a.plan; bv=b.plan; }
      else if (sortCol === "status") { av=a.status; bv=b.status; }
      else if (sortCol === "searches") { av=a.searches; bv=b.searches; }
      else if (sortCol === "totalScans") { av=a.totalScans; bv=b.totalScans; }
      else if (sortCol === "joined") { av=new Date(a.joined); bv=new Date(b.joined); }
      else if (sortCol === "lastLogin") { av=a.lastLogin?new Date(a.lastLogin):0; bv=b.lastLogin?new Date(b.lastLogin):0; }
      else { av=a[sortCol]||""; bv=b[sortCol]||""; }
      if (av < bv) return sortDir==="asc"?-1:1;
      if (av > bv) return sortDir==="asc"?1:-1;
      return 0;
    });

  const exportCSV = () => {
    const headers = ["ID","Email","First Name","Last Name","Phone","Company","Sector","Job Role","Referral Source","Plan","Status","Joined","Last Login","Scans Today","Lifetime Scans"];
    const rows = filtered.map(u => [u.id,u.email,u.firstName,u.lastName,u.phone,u.companyName,u.companySector,u.jobRole,u.referralSource,u.plan,u.status,u.joined?new Date(u.joined).toLocaleDateString('en-GB'):'',u.lastLogin?new Date(u.lastLogin).toLocaleDateString('en-GB'):'',u.searches,u.totalScans]);
    const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([csv],{type:'text/csv'})),download:`utilityseo-users-${new Date().toISOString().slice(0,10)}.csv`});
    a.click();
  };

  const SortTh = ({ col, label }) => {
    const active = sortCol === col;
    return (
      <span onClick={() => toggleSort(col)} style={{ cursor:"pointer", userSelect:"none", fontSize:11, color:active?"#818cf8":"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", display:"flex", alignItems:"center", gap:3 }}>
        {label} <span style={{ fontSize:9, opacity:active?1:0.4 }}>{active?(sortDir==="asc"?"▲":"▼"):"⇅"}</span>
      </span>
    );
  };

  const newSignups = users.filter(u => { if (!u.joined) return false; const c=new Date(); c.setDate(c.getDate()-statsWindow); return new Date(u.joined)>=c; }).length;
  const countFree    = users.filter(u => u.plan==="free").length;
  const countPro     = users.filter(u => u.plan==="pro").length;
  const countProPlus = users.filter(u => u.plan==="proPlus").length;
  const countPaid    = countPro + countProPlus;
  const countDeactivated = users.filter(u => u.status==="deactivated").length;

  const stats = [
    { label:"Total Users",   val:users.length,                                      icon:"👥", col:"#818cf8" },
    { label:"Active",        val:users.filter(u=>u.status==="active").length,        icon:"✅", col:"#22c55e" },
    { label:"Deactivated",   val:countDeactivated,                                   icon:"○",  col:"#94a3b8",
      onClick: () => { setFilterStatus("deactivated"); setShowFilters(true); } },
    { label:"Temp Access",   val:users.filter(u=>u.tempPlan).length,                 icon:"⏱", col:"#38bdf8" },
  ];

  // ─── LOGIN ───────────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight:"100vh", background:"#070710", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <img src={LOGO_BASE64} alt="UtilitySEO" style={{ width:36, height:36, borderRadius:8, objectFit:"cover" }} />
            <span style={{ fontSize:20, fontWeight:800 }}>UtilitySEO</span>
          </div>
          <br />
          <div style={{ display:"inline-block", padding:"4px 14px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:99, fontSize:11, fontWeight:700, color:"#ef4444", letterSpacing:"0.1em", textTransform:"uppercase" }}>Super Admin</div>
          <p style={{ color:"#475569", fontSize:13, marginTop:10 }}>Restricted. Authorised personnel only.</p>
        </div>
        <div className="glass" style={{ borderRadius:20, padding:28 }}>
          <form onSubmit={doLogin}>
            <Input label="Admin Email" type="email" placeholder="enter your email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input label="Password" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
            {err && <p style={{ color:"#ef4444", fontSize:13, marginBottom:12 }}>{err}</p>}
            <button type="submit" disabled={loading} style={{ width:"100%", padding:"13px", background:"#6366f1", border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {loading ? <><Spinner /> Authenticating…</> : "Access Admin Panel →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // ─── DASHBOARD ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#070710", fontFamily:"Sora,sans-serif" }}>
      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:999, background:toast.isError?"#ef4444":"#22c55e", color:"#fff", padding:"12px 20px", borderRadius:12, fontSize:13, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>{toast.isError?"✗":"✓"} {toast.msg}</div>}

      <div className="admin-header" style={{ background:"#0d0d18", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <img src={LOGO_BASE64} alt="UtilitySEO" style={{ width:32, height:32, borderRadius:8, objectFit:"cover" }} />
          <span style={{ fontSize:16, fontWeight:700 }}>UtilitySEO</span>
          <span style={{ padding:"3px 12px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:99, fontSize:11, fontWeight:700, color:"#ef4444", letterSpacing:"0.05em" }}>SUPER ADMIN</span>
        </div>
        <button onClick={() => { setAuthed(false); setEmail(""); setPass(""); localStorage.removeItem('admin_authed'); }} style={{ padding:"8px 16px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, color:"#ef4444", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>Sign Out</button>
      </div>

      <div className="admin-body" style={{ padding:"32px" }}>
        {/* Stats */}
        <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:16, marginBottom:32 }}>
          {stats.map(s => (
            <div key={s.label} className="glass" style={{ borderRadius:16, padding:20, cursor:s.onClick?"pointer":"default", transition:"border-color 0.15s" }}
              onClick={s.onClick}
              onMouseEnter={e => { if(s.onClick) e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; }}
              onMouseLeave={e => { if(s.onClick) e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:32, fontWeight:800, color:s.col }}>{s.val}</div>
              <div style={{ fontSize:13, color:"#475569", marginTop:4 }}>{s.label}</div>
              {s.onClick && <div style={{ fontSize:10, color:"#334155", marginTop:4 }}>click to filter ↗</div>}
            </div>
          ))}

          <div className="glass" style={{ borderRadius:16, padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:2 }}>
              <span style={{ fontSize:24 }}>💰</span>
              <span style={{ fontSize:26, fontWeight:800, color:"#f59e0b" }}>{countPaid}</span>
            </div>
            <div style={{ fontSize:13, color:"#475569", marginBottom:12 }}>Paid</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
              <div style={{ textAlign:"center" }}><div style={{ fontSize:20, fontWeight:800, color:"#64748b" }}>{countFree}</div><div style={{ fontSize:10, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.04em", marginTop:2 }}>Free</div></div>
              <div style={{ textAlign:"center", borderLeft:"1px solid rgba(255,255,255,0.07)", borderRight:"1px solid rgba(255,255,255,0.07)" }}><div style={{ fontSize:20, fontWeight:800, color:"#818cf8" }}>{countPro}</div><div style={{ fontSize:10, fontWeight:700, color:"#6366f1", textTransform:"uppercase", letterSpacing:"0.04em", marginTop:2 }}>Pro</div></div>
              <div style={{ textAlign:"center" }}><div style={{ fontSize:20, fontWeight:800, color:"#f59e0b" }}>{countProPlus}</div><div style={{ fontSize:10, fontWeight:700, color:"#d97706", textTransform:"uppercase", letterSpacing:"0.04em", marginTop:2 }}>Pro+</div></div>
            </div>
          </div>

          <div className="glass" style={{ borderRadius:16, padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:2 }}>
              <span style={{ fontSize:20 }}>📈</span>
              <div style={{ display:"flex", gap:3 }}>
                {[{label:"7d",val:7},{label:"30d",val:30},{label:"90d",val:90},{label:"1yr",val:365}].map(p => (
                  <button key={p.val} onClick={() => setStatsWindow(p.val)}
                    style={{ padding:"2px 6px", fontSize:9, fontWeight:700, fontFamily:"Sora,sans-serif", cursor:"pointer", borderRadius:5, border:`1px solid ${statsWindow===p.val?"#34d399":"rgba(255,255,255,0.1)"}`, background:statsWindow===p.val?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.04)", color:statsWindow===p.val?"#34d399":"#475569" }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ fontSize:28, fontWeight:800, color:"#34d399", marginTop:4 }}>{newSignups}</div>
            <div style={{ fontSize:12, color:"#475569", marginBottom:4 }}>New Signups</div>
          </div>

          <div className="glass" style={{ borderRadius:16, padding:20, gridColumn:"1 / -1" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:13, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}>Monthly Signups - Last 12 Months</span>
              <span style={{ fontSize:11, color:"#334155" }}>Current month highlighted</span>
            </div>
            <MonthlyChart users={users} />
          </div>
        </div>

        {/* Tab Bar */}
        <div className="tab-bar" style={{ display:"flex", gap:8, marginBottom:28, borderBottom:"1px solid rgba(255,255,255,0.07)", paddingBottom:0 }}>
          {[{id:"users",label:"👥 Users"},{id:"promos",label:"🎟 Promo Codes"},{id:"prospectflow",label:"💰 ProspectFlow"},{id:"loadtest",label:"⚡ Load Test"},{id:"monitoring",label:"🩺 Monitoring"}].map(tab => (
            <button key={tab.id} className="tab-btn" onClick={() => handleTabSwitch(tab.id)}
              style={{ padding:"10px 22px", background:activeTab===tab.id?"rgba(99,102,241,0.2)":"transparent", border:"none", borderBottom:activeTab===tab.id?"2px solid #6366f1":"2px solid transparent", color:activeTab===tab.id?"#a5b4fc":"#64748b", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"Sora,sans-serif", borderRadius:"8px 8px 0 0", marginBottom:-1, transition:"all 0.15s" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (<>
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", gap:10, marginBottom:10, flexWrap:"wrap" }}>
            <div style={{ position:"relative", flex:1, minWidth:200 }}>
              <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:"#475569", fontSize:16 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email, name or company…"
                style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"12px 16px 12px 44px", color:"#fff", fontSize:14, outline:"none", fontFamily:"JetBrains Mono,monospace", boxSizing:"border-box" }}
                onFocus={e => e.target.style.border="1px solid #6366f1"} onBlur={e => e.target.style.border="1px solid rgba(255,255,255,0.1)"} />
            </div>
            <button onClick={() => setShowFilters(f => !f)}
              style={{ padding:"12px 18px", background:showFilters?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.05)", border:`1px solid ${showFilters?"#6366f1":"rgba(255,255,255,0.1)"}`, borderRadius:14, color:showFilters?"#818cf8":"#94a3b8", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600, display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
              🎛 Filters {activeFiltersCount>0 && <span style={{ background:"#6366f1", color:"#fff", borderRadius:99, padding:"1px 7px", fontSize:11 }}>{activeFiltersCount}</span>}
            </button>
            <button onClick={exportCSV}
              style={{ padding:"12px 18px", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", borderRadius:14, color:"#22c55e", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600, display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
              ⬇ Export CSV
            </button>
          </div>

          {showFilters && (
            <div className="glass" style={{ borderRadius:16, padding:20, marginBottom:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14 }}>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Plan</label>
                  <select value={filterPlan} onChange={e=>setFilterPlan(e.target.value)} style={{ width:"100%", background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"Sora,sans-serif", cursor:"pointer" }}>
                    <option value="all">All plans</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="proPlus">Pro Plus (legacy)</option>
                    <option value="trial">Trial / Temp access</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Status</label>
                  <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ width:"100%", background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"Sora,sans-serif", cursor:"pointer" }}>
                    <option value="all">All statuses</option>
                    <option value="active">● Active</option>
                    <option value="deactivated">○ Deactivated</option>
                    <option value="suspended">⊘ Suspended</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Industry</label>
                  <select value={filterSector} onChange={e=>setFilterSector(e.target.value)} style={{ width:"100%", background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"Sora,sans-serif", cursor:"pointer" }}>
                    <option value="all">All industries</option>
                    {allSectors.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Heard via</label>
                  <select value={filterReferral} onChange={e=>setFilterReferral(e.target.value)} style={{ width:"100%", background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"Sora,sans-serif", cursor:"pointer" }}>
                    <option value="all">All sources</option>
                    {allReferrals.map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Marketing</label>
                  <select value={filterMarketing} onChange={e=>setFilterMarketing(e.target.value)} style={{ width:"100%", background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"Sora,sans-serif", cursor:"pointer" }}>
                    <option value="all">All</option>
                    <option value="Yes">✅ Opted in</option>
                    <option value="No">❌ Opted out</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Joined from</label>
                  <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{ width:"100%", background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 12px", color:dateFrom?"#e2e8f0":"#475569", fontSize:13, outline:"none", fontFamily:"Sora,sans-serif", boxSizing:"border-box", colorScheme:"dark" }} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Joined to</label>
                  <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{ width:"100%", background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 12px", color:dateTo?"#e2e8f0":"#475569", fontSize:13, outline:"none", fontFamily:"Sora,sans-serif", boxSizing:"border-box", colorScheme:"dark" }} />
                </div>
              </div>
              {activeFiltersCount>0 && (
                <button onClick={()=>{setFilterPlan("all");setFilterStatus("all");setFilterSector("all");setFilterReferral("all");setFilterMarketing("all");setDateFrom("");setDateTo("");}}
                  style={{ marginTop:14, padding:"7px 16px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, color:"#f87171", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
                  ✕ Clear all filters
                </button>
              )}
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={() => setFilterStarred(s => !s)}
              style={{ padding:"6px 14px", background:filterStarred?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${filterStarred?"rgba(245,158,11,0.4)":"rgba(255,255,255,0.08)"}`, borderRadius:8, color:filterStarred?"#f59e0b":"#475569", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
              {filterStarred ? "★ Starred" : "☆ Starred"}
            </button>
            <p style={{ color:"#334155", fontSize:12 }}>{filtered.length} of {users.length} users{activeFiltersCount>0?" (filtered)":""}</p>
            {countDeactivated > 0 && filterStatus !== "deactivated" && (
              <button onClick={() => { setFilterStatus("deactivated"); setShowFilters(true); }}
                style={{ padding:"4px 10px", background:"rgba(148,163,184,0.1)", border:"1px solid rgba(148,163,184,0.25)", borderRadius:6, color:"#94a3b8", fontSize:11, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
                ○ {countDeactivated} deactivated account{countDeactivated!==1?"s":""}
              </button>
            )}
          </div>
        </div>

        {loadingUsers ? (
          <div style={{ textAlign:"center", padding:60 }}><Spinner /><p style={{ color:"#64748b", marginTop:16 }}>Loading users...</p></div>
        ) : (
          <div className="glass" style={{ borderRadius:18, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 100px 130px 60px 60px 50px 90px 110px 140px", gap:16, padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }} className="desktop-only">
              <SortTh col="email" label="Email" />
              <SortTh col="plan" label="Plan" />
              <SortTh col="status" label="Status" />
              <SortTh col="searches" label="Today" />
              <SortTh col="totalScans" label="Lifetime" />
              <span title="Cookie Consent" style={{ fontSize:11, color:"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>🍪</span>
              <SortTh col="joined" label="Joined" />
              <SortTh col="lastLogin" label="Last Seen" />
              <span style={{ fontSize:11, color:"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Actions</span>
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign:"center", padding:60, color:"#334155" }}>No users found</div>
            ) : filtered.map((u, i) => (
              <UserRow key={u.id} u={u} i={i} total={filtered.length}
                onInfo={() => { setViewingUser(u); setNoteText(u.adminNotes || ''); }}
                onEdit={() => setEditing(u)}
                onAccess={() => accessAccount(u)}
                starred={starredIds.has(String(u.id))}
                onToggleStar={() => toggleStar(String(u.id))} />
            ))}
          </div>
        )}
        </>)}

        {/* ── PROMO CODES TAB ── */}
        {activeTab === "promos" && (
          <div>
            <div className="glass" style={{ borderRadius:18, padding:28, marginBottom:28 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#e2e8f0", marginBottom:20 }}>🎟 Create Promo Code</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, marginBottom:16 }}>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Code <span style={{ color:"#ef4444" }}>*</span></label>
                  <input value={promoForm.code} onChange={e => setPromoForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="e.g. LAUNCH50"
                    style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:14, outline:"none", fontFamily:"JetBrains Mono,monospace", boxSizing:"border-box", textTransform:"uppercase" }}
                    onFocus={e=>e.target.style.border="1px solid #6366f1"} onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.1)"} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Trial Plan <span style={{ color:"#ef4444" }}>*</span></label>
                  <select value={promoForm.trial_plan} onChange={e => setPromoForm(f=>({...f,trial_plan:e.target.value}))} style={{ width:"100%", background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"Sora,sans-serif", cursor:"pointer", boxSizing:"border-box" }}>
                    <option value="pro">Pro</option>
                    <option value="free">Free</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Trial Days <span style={{ color:"#ef4444" }}>*</span></label>
                  <input type="number" min="1" value={promoForm.trial_days} onChange={e => setPromoForm(f=>({...f,trial_days:e.target.value}))} placeholder="14"
                    style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:14, outline:"none", fontFamily:"Sora,sans-serif", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.border="1px solid #6366f1"} onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.1)"} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Max Uses <span style={{ color:"#475569", fontSize:10 }}>(blank = unlimited)</span></label>
                  <input type="number" min="1" value={promoForm.max_uses} onChange={e => setPromoForm(f=>({...f,max_uses:e.target.value}))} placeholder="Unlimited"
                    style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:14, outline:"none", fontFamily:"Sora,sans-serif", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.border="1px solid #6366f1"} onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.1)"} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Expiry Date <span style={{ color:"#475569", fontSize:10 }}>(optional)</span></label>
                  <input type="date" value={promoForm.expires_at} onChange={e => setPromoForm(f=>({...f,expires_at:e.target.value}))} style={{ width:"100%", background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:promoForm.expires_at?"#e2e8f0":"#475569", fontSize:13, outline:"none", fontFamily:"Sora,sans-serif", boxSizing:"border-box", colorScheme:"dark" }} />
                </div>
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Description <span style={{ color:"#475569", fontSize:10 }}>(internal note)</span></label>
                  <input value={promoForm.description} onChange={e => setPromoForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Launch campaign - influencer outreach May 2025"
                    style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:14, outline:"none", fontFamily:"Sora,sans-serif", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.border="1px solid #6366f1"} onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.1)"} />
                </div>
              </div>
              {promoFormError && <p style={{ color:"#ef4444", fontSize:13, marginBottom:12 }}>{promoFormError}</p>}
              <button onClick={createPromo} disabled={savingPromo}
                style={{ padding:"11px 28px", background:savingPromo?"#3730a3":"#6366f1", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:savingPromo?"not-allowed":"pointer", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                {savingPromo ? <><Spinner /> Creating…</> : "+ Create Code"}
              </button>
            </div>

            <div className="glass" style={{ borderRadius:18, overflow:"hidden" }}>
              <div className="promo-table-header" style={{ display:"grid", gridTemplateColumns:"160px 1fr 90px 70px 70px 100px 80px 110px", gap:12, padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                {["Code","Description","Plan","Days","Uses","Max Uses","Expiry","Actions"].map(h => (
                  <span key={h} style={{ fontSize:11, color:"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</span>
                ))}
              </div>
              {loadingPromos ? <div style={{ textAlign:"center", padding:40 }}><Spinner /></div>
              : promos.length === 0 ? <div style={{ textAlign:"center", padding:60, color:"#334155" }}>No promo codes yet - create one above</div>
              : promos.map((p, i) => (
                <div key={p.id} style={{ borderBottom:i<promos.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}>
                <div className="promo-row" style={{ display:"grid", gridTemplateColumns:"160px 1fr 90px 70px 70px 100px 80px 110px", gap:12, padding:"14px 20px", alignItems:"center", opacity:p.is_active?1:0.45 }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
                    <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:13, fontWeight:700, color:p.is_active?"#a5b4fc":"#64748b", letterSpacing:"0.05em" }}>{p.code}</span>
                    <span style={{ fontSize:12, padding:"3px 8px", borderRadius:6, background:p.trial_plan==="proPlus"?"rgba(245,158,11,0.15)":"rgba(99,102,241,0.15)", color:p.trial_plan==="proPlus"?"#f59e0b":"#818cf8", fontWeight:600 }}>
                      {p.trial_plan==="proPlus"?"Pro+":p.trial_plan==="pro"?"Pro":"Free"}
                    </span>
                  </div>
                  <span style={{ fontSize:12, color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.description||"-"}</span>
                  <span style={{ display:"none" }}></span>
                  <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, color:"#94a3b8" }}><span style={{ fontSize:10, color:"#475569" }}>DAYS </span>{p.trial_days}</span>
                    <span style={{ fontSize:12, color:"#94a3b8" }}><span style={{ fontSize:10, color:"#475569" }}>USES </span>{p.uses_count}{p.max_uses?`/${p.max_uses}`:""}</span>
                    <span style={{ fontSize:12, color:p.expires_at&&new Date(p.expires_at)<new Date()?"#ef4444":"#64748b" }}><span style={{ fontSize:10, color:"#475569" }}>EXPIRY </span>{p.expires_at?new Date(p.expires_at).toLocaleDateString("en-GB"):"Never"}</span>
                  </div>
                  <span style={{ display:"none" }}></span><span style={{ display:"none" }}></span><span style={{ display:"none" }}></span>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => loadPromoSignups(p.id)}
                      style={{ padding:"5px 10px", background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:7, color:"#818cf8", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                      {expandedPromo === p.id ? "▲ Hide" : "👥 Signups"}
                    </button>
                    <button onClick={() => togglePromoActive(p)} title={p.is_active?"Deactivate":"Activate"}
                      style={{ padding:"5px 10px", background:p.is_active?"rgba(239,68,68,0.1)":"rgba(34,197,94,0.1)", border:`1px solid ${p.is_active?"rgba(239,68,68,0.3)":"rgba(34,197,94,0.3)"}`, borderRadius:7, color:p.is_active?"#f87171":"#22c55e", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                      {p.is_active?"Off":"On"}
                    </button>
                    <button onClick={() => deletePromo(p.id)} title="Delete permanently"
                      style={{ padding:"5px 10px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:7, color:"#f87171", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                      ✕
                    </button>
                  </div>
                </div>

                {/* Signups panel */}
                {expandedPromo === p.id && (() => {
                  const ps = promoSignups[p.id];
                  return (
                    <div style={{ background:"rgba(99,102,241,0.04)", borderTop:"1px solid rgba(99,102,241,0.15)", padding:"16px 20px", marginTop:4 }}>
                      {!ps || ps.loading ? (
                        <div style={{ display:"flex", alignItems:"center", gap:8, color:"#64748b", fontSize:13 }}><Spinner /> Loading signups…</div>
                      ) : ps.error ? (
                        <p style={{ color:"#f87171", fontSize:13 }}>Failed to load signups</p>
                      ) : (
                        <>
                          {/* Summary stats */}
                          <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:14 }}>
                            {[
                              { label:"Total signups", val:ps.data.total, col:"#e2e8f0" },
                              { label:"Converted to paid", val:`${ps.data.converted} (${ps.data.conversionRate}%)`, col:"#22c55e" },
                              { label:"Still on trial", val:ps.data.stillTrial, col:"#f59e0b" },
                              { label:"Trial expired (free)", val:ps.data.expired, col:"#ef4444" },
                            ].map(s => (
                              <div key={s.label} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 16px", minWidth:140 }}>
                                <p style={{ fontSize:10, color:"#475569", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>{s.label}</p>
                                <p style={{ fontSize:20, fontWeight:800, color:s.col }}>{s.val}</p>
                              </div>
                            ))}
                          </div>
                          {/* User list */}
                          {ps.data.total === 0 ? (
                            <p style={{ fontSize:13, color:"#475569" }}>No users have signed up with this code yet.</p>
                          ) : (
                            <div style={{ borderRadius:10, overflow:"hidden", border:"1px solid rgba(255,255,255,0.06)" }}>
                              <div style={{ display:"grid", gridTemplateColumns:"1fr 120px 120px 140px", gap:10, padding:"8px 14px", background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                                {["Email","Plan","Status","Signed up"].map(h => (
                                  <span key={h} style={{ fontSize:10, color:"#475569", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</span>
                                ))}
                              </div>
                              {ps.data.users.map((u, ui) => {
                                const isPaid = u.plan === 'pro' || u.plan === 'proPlus';
                                const isTrialActive = u.temp_plan && u.temp_plan_expires_at && new Date(u.temp_plan_expires_at) > new Date();
                                return (
                                  <div key={u.id} style={{ display:"grid", gridTemplateColumns:"1fr 120px 120px 140px", gap:10, padding:"10px 14px", borderBottom:ui<ps.data.users.length-1?"1px solid rgba(255,255,255,0.04)":"none", alignItems:"center" }}>
                                    <span style={{ fontSize:12, color:"#e2e8f0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"JetBrains Mono,monospace" }}>{u.email}</span>
                                    <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:isPaid?"rgba(34,197,94,0.1)":isTrialActive?"rgba(245,158,11,0.1)":"rgba(255,255,255,0.04)", color:isPaid?"#22c55e":isTrialActive?"#f59e0b":"#64748b", fontWeight:600, width:"fit-content" }}>
                                      {isPaid ? (u.plan==="proPlus"?"Pro Plus":"Pro") : isTrialActive ? `Trial (${u.temp_plan==="proPlus"?"Pro+":"Pro"})` : "Free"}
                                    </span>
                                    <span style={{ fontSize:11, color:u.is_active?"#22c55e":"#94a3b8" }}>{u.is_active?"Active":"Deactivated"}</span>
                                    <span style={{ fontSize:11, color:"#64748b" }}>{new Date(u.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


        {/* ── PROSPECTFLOW TAB ── */}
        {activeTab === "loadtest" && (
          <LoadTestPanel />
        )}

        {activeTab === "monitoring" && (
          <div style={{ maxWidth:1100, width:"100%", margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:800, color:"#e2e8f0", margin:0 }}>🩺 Monitoring</h2>
                <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0" }}>System health, business stats and captured backend errors</p>
              </div>
              <button onClick={loadMonitoring}
                style={{ padding:"9px 20px", background:"#6366f1", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                ↻ Refresh
              </button>
            </div>

            {monError && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#f87171", fontSize:13 }}>{monError}</div>}
            {monLoading && <div style={{ textAlign:"center", padding:"60px 20px", color:"#64748b", fontSize:14 }}>Loading monitoring data…</div>}

            {monData && !monLoading && (() => {
              const h = monData.health || {};
              const s = monData.stats;
              const fmtUptime = (sec) => { if (sec == null) return "—"; const d=Math.floor(sec/86400), hr=Math.floor((sec%86400)/3600), m=Math.floor((sec%3600)/60); return d>0?`${d}d ${hr}h`:hr>0?`${hr}h ${m}m`:`${m}m`; };
              const card = (label, value, accent) => (
                <div className="glass" style={{ borderRadius:14, padding:"16px 18px", flex:"1 1 150px", minWidth:150 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>{label}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:accent||"#e2e8f0", fontFamily:"JetBrains Mono,monospace" }}>{value}</div>
                </div>
              );
              const dbOk = h.db === "connected";
              const lvlColor = (lvl) => lvl === "error" ? "#f87171" : lvl === "warn" ? "#fbbf24" : "#94a3b8";
              return (
                <>
                  {/* Health */}
                  <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:16 }}>
                    {card("Database", dbOk ? "● Connected" : "● Down", dbOk ? "#34d399" : "#f87171")}
                    {card("Uptime", fmtUptime(h.uptime_s))}
                    {card("Memory", h.memory_mb ? `${h.memory_mb.heap_used} / ${h.memory_mb.heap_total} MB` : "—")}
                    {card("DB Pool", h.pool ? `${h.pool.idle}/${h.pool.total} idle` : "—", h.pool && h.pool.waiting > 0 ? "#fbbf24" : "#e2e8f0")}
                    {card("Build", h.commit || "—")}
                  </div>

                  {/* Business stats */}
                  {s && (
                    <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:16 }}>
                      {card("Users", s.users_total)}
                      {card("Active", s.users_active)}
                      {card("Signups 7d", s.signups_7d, "#a5b4fc")}
                      {card("Errors 1h", s.errors_1h, s.errors_1h > 0 ? "#f87171" : "#34d399")}
                      {card("Errors 24h", s.errors_24h, s.errors_24h > 0 ? "#fbbf24" : "#34d399")}
                    </div>
                  )}

                  {/* Plan breakdown */}
                  {s && s.plans && s.plans.length > 0 && (
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
                      {s.plans.map(p => (
                        <span key={p.plan} style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:99, padding:"5px 12px", fontSize:12, color:"#a5b4fc", fontFamily:"JetBrains Mono,monospace" }}>
                          {p.plan}: <strong style={{ color:"#e2e8f0" }}>{p.count}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Recent errors */}
                  <div className="glass" style={{ borderRadius:16, padding:20, marginBottom:20 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:12 }}>Recent Errors ({monData.errors.length})</div>
                    {monData.errors.length === 0 ? (
                      <div style={{ color:"#34d399", fontSize:13, padding:"8px 0" }}>✓ No errors logged. All clear.</div>
                    ) : (
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:"JetBrains Mono,monospace" }}>
                          <thead>
                            <tr style={{ color:"#475569", textAlign:"left" }}>
                              <th style={{ padding:"6px 10px", fontWeight:600 }}>Time</th>
                              <th style={{ padding:"6px 10px", fontWeight:600 }}>Level</th>
                              <th style={{ padding:"6px 10px", fontWeight:600 }}>Source</th>
                              <th style={{ padding:"6px 10px", fontWeight:600 }}>Message</th>
                              <th style={{ padding:"6px 10px", fontWeight:600 }}>Path</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monData.errors.map(e => (
                              <tr key={e.id} style={{ borderTop:"1px solid rgba(255,255,255,0.05)", color:"#94a3b8" }}>
                                <td style={{ padding:"6px 10px", whiteSpace:"nowrap" }}>{new Date(e.created_at).toLocaleString()}</td>
                                <td style={{ padding:"6px 10px", color:lvlColor(e.level), fontWeight:700 }}>{e.level}</td>
                                <td style={{ padding:"6px 10px" }}>{e.source || "—"}</td>
                                <td style={{ padding:"6px 10px", color:"#cbd5e1", maxWidth:360, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={e.message}>{e.message}</td>
                                <td style={{ padding:"6px 10px" }}>{e.method ? `${e.method} ${e.path || ""}` : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Recent alerts */}
                  <div className="glass" style={{ borderRadius:16, padding:20 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:12 }}>Recent User Alerts ({monData.alerts.length})</div>
                    {monData.alerts.length === 0 ? (
                      <div style={{ color:"#64748b", fontSize:13, padding:"8px 0" }}>No alerts triggered.</div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {monData.alerts.map(a => (
                          <div key={a.id} style={{ display:"flex", gap:12, fontSize:12, color:"#94a3b8", fontFamily:"JetBrains Mono,monospace", borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:8 }}>
                            <span style={{ whiteSpace:"nowrap", color:"#64748b" }}>{a.triggered_at ? new Date(a.triggered_at).toLocaleDateString() : ""}</span>
                            <span style={{ color:"#fbbf24", fontWeight:700 }}>{a.alert_type}</span>
                            <span style={{ color:"#cbd5e1" }}>{a.site}</span>
                            <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={a.detail}>{a.keyword ? `[${a.keyword}] ` : ""}{a.detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeTab === "prospectflow" && (
          <div>
            <div style={{ maxWidth:1100, width:"100%", margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:800, color:"#e2e8f0", margin:0 }}>💰 ProspectFlow</h2>
                <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0" }}>Promo code signups - commission tracking for Josh &amp; Joel</p>
              </div>
              <button onClick={() => { setPfData(null); loadProspectFlow(); }}
                style={{ padding:"9px 20px", background:"#6366f1", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                ↻ Refresh
              </button>
            </div>

            {pfError && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#f87171", fontSize:13 }}>{pfError}</div>}
            {pfLoading && <div style={{ textAlign:"center", padding:"60px 20px", color:"#64748b", fontSize:14 }}>Loading Stripe data - this may take a few seconds...</div>}

            {pfData && (() => {
              const codes = ["all", ...new Set(pfData.users.map(u => u.promo_code_used).filter(Boolean))];
              const filtered = pfData.users.filter(u => {
                if (pfCodeFilter !== "all" && u.promo_code_used !== pfCodeFilter) return false;
                if (pfStatusFilter === "paying" && !u.first_payment) return false;
                if (pfStatusFilter === "free" && u.first_payment) return false;
                if (pfStatusFilter === "eligible" && !u.within_commission_window) return false;
                if (pfSearch && !`${u.email} ${u.first_name} ${u.last_name} ${u.company_name||""}`.toLowerCase().includes(pfSearch.toLowerCase())) return false;
                return true;
              });
              const byCode = {};
              for (const u of pfData.users) {
                const code = u.promo_code_used || "none";
                if (!byCode[code]) byCode[code] = { signups:0, paying:0, totalRevenue:0, commission:0, eligible:0 };
                byCode[code].signups++;
                if (u.first_payment) { byCode[code].paying++; byCode[code].totalRevenue += u.total_paid; byCode[code].commission += u.commission_amount; }
                if (u.within_commission_window) byCode[code].eligible++;
              }
              const totalPaying = pfData.users.filter(u => u.first_payment).length;
              const totalCommission = pfData.users.reduce((s,u) => s + (u.commission_amount||0), 0);
              const totalEligible = pfData.users.filter(u => u.within_commission_window).length;
              return (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
                    {[
                      { label:"Total Signups", val:pfData.users.length, col:"#818cf8" },
                      { label:"Now Paying", val:totalPaying, col:"#34d399" },
                      { label:"Commission Eligible", val:totalEligible, col:"#f59e0b" },
                      { label:"Total Commission", val:`£${totalCommission.toFixed(2)}`, col:"#34d399" },
                    ].map(s => (
                      <div key={s.label} style={{ background:"#13131F", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 18px" }}>
                        <div style={{ fontSize:22, fontWeight:800, color:s.col, fontFamily:"JetBrains Mono,monospace" }}>{s.val}</div>
                        <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginTop:3, textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:14, marginBottom:28, flexWrap:"wrap" }}>
                    {Object.entries(byCode).map(([code, stats]) => (
                      <div key={code} onClick={() => setPfCodeFilter(pfCodeFilter===code ? "all" : code)}
                        style={{ background:"#13131F", border:`1px solid ${pfCodeFilter===code?"#6366f1":"rgba(255,255,255,0.07)"}`, borderRadius:12, padding:"14px 18px", cursor:"pointer", minWidth:180 }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                          <span style={{ fontSize:14, fontWeight:800, color:"#e2e8f0", fontFamily:"JetBrains Mono,monospace" }}>{code}</span>
                          <span style={{ fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:99, background:"rgba(99,102,241,0.15)", color:"#a5b4fc" }}>{stats.signups} signup{stats.signups!==1?"s":""}</span>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 12px" }}>
                          <div style={{ fontSize:12, color:"#64748b" }}>Paying: <span style={{ color:"#34d399", fontWeight:700 }}>{stats.paying}</span></div>
                          <div style={{ fontSize:12, color:"#64748b" }}>Eligible: <span style={{ color:"#f59e0b", fontWeight:700 }}>{stats.eligible}</span></div>
                          <div style={{ fontSize:12, color:"#64748b" }}>Revenue: <span style={{ color:"#e2e8f0", fontWeight:600 }}>£{stats.totalRevenue.toFixed(0)}</span></div>
                          <div style={{ fontSize:12, color:"#64748b" }}>Commission: <span style={{ color:"#34d399", fontWeight:700 }}>£{stats.commission.toFixed(2)}</span></div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); loadCodeRevenue(code); }}
                          style={{ marginTop:12, width:"100%", padding:"7px 0", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:8, color:"#a5b4fc", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                          📊 Calculate earnings
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <input value={pfSearch} onChange={e => setPfSearch(e.target.value)} placeholder="Search email, name or company..."
                        style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 14px", color:"#e2e8f0", fontSize:13, fontFamily:"Sora,sans-serif", outline:"none" }} />
                      <select value={pfCodeFilter} onChange={e => setPfCodeFilter(e.target.value)}
                        style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.35)", borderRadius:10, padding:"9px 14px", color:"#a5b4fc", fontSize:13, fontWeight:700, fontFamily:"Sora,sans-serif", cursor:"pointer", outline:"none", minWidth:200 }}>
                        <option value="all" style={{ background:"#13131F", color:"#e2e8f0" }}>All codes ({pfData.users.length})</option>
                        {codes.filter(cd => cd !== "all").map(code => (
                          <option key={code} value={code} style={{ background:"#13131F", color:"#e2e8f0" }}>{code} - {byCode[code]?.signups||0} signups</option>
                        ))}
                      </select>
                      <span style={{ fontSize:12, color:"#475569", whiteSpace:"nowrap" }}>{filtered.length} result{filtered.length!==1?"s":""}</span>
                    </div>
                    <div style={{ display:"flex", gap:0, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, overflow:"hidden", width:"fit-content" }}>
                      {[
                        { id:"all",      label:"All signups",         activeCol:"#818cf8", activeBg:"rgba(99,102,241,0.2)" },
                        { id:"paying",   label:"✓ Paying",            activeCol:"#34d399", activeBg:"rgba(52,211,153,0.15)" },
                        { id:"free",     label:"Not yet paying",      activeCol:"#f87171", activeBg:"rgba(248,113,113,0.15)" },
                        { id:"eligible", label:"Commission eligible", activeCol:"#f59e0b", activeBg:"rgba(245,158,11,0.15)" },
                      ].map((f, i, arr) => (
                        <button key={f.id} onClick={() => setPfStatusFilter(f.id)}
                          style={{ padding:"8px 16px", border:"none", borderRight:i<arr.length-1?"1px solid rgba(255,255,255,0.07)":"none",
                            fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Sora,sans-serif", whiteSpace:"nowrap",
                            background:pfStatusFilter===f.id?f.activeBg:"transparent",
                            color:pfStatusFilter===f.id?f.activeCol:"#64748b" }}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ background:"#13131F", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, overflow:"hidden" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"2.5fr 130px 90px 110px 120px 90px 110px", padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
                      {["User","Code","Plan","Signed Up","First Payment","Revenue","Commission"].map(h => (
                        <div key={h} style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</div>
                      ))}
                    </div>
                    {filtered.length === 0 ? (
                      <div style={{ padding:"40px", textAlign:"center", color:"#475569", fontSize:13 }}>No results match your filters</div>
                    ) : filtered.map((u, i) => {
                      const isPaying = !!u.first_payment;
                      const isEligible = u.within_commission_window;
                      return (
                        <div key={u.id} style={{ display:"grid", gridTemplateColumns:"2.5fr 130px 90px 110px 120px 90px 110px", padding:"13px 20px",
                          borderBottom:i<filtered.length-1?"1px solid rgba(255,255,255,0.04)":"none",
                          background:isEligible?"rgba(245,158,11,0.04)":"transparent" }}>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0" }}>{u.email}</div>
                            <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{[u.first_name,u.last_name].filter(Boolean).join(" ")||u.company_name||"-"}</div>
                          </div>
                          <div style={{ fontSize:12, fontFamily:"JetBrains Mono,monospace", color:"#818cf8", fontWeight:700, alignSelf:"center" }}>{u.promo_code_used}</div>
                          <div style={{ alignSelf:"center" }}>
                            <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99,
                              background:u.plan==="proPlus"?"rgba(245,158,11,0.15)":u.plan==="pro"?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.06)",
                              color:u.plan==="proPlus"?"#f59e0b":u.plan==="pro"?"#a5b4fc":"#64748b" }}>
                              {u.plan==="proPlus"?"Pro+":u.plan==="pro"?"Pro":"Free"}
                            </span>
                          </div>
                          <div style={{ fontSize:12, color:"#64748b", alignSelf:"center" }}>{new Date(u.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"})}</div>
                          <div style={{ alignSelf:"center" }}>
                            {u.first_payment_date ? (
                              <div>
                                <div style={{ fontSize:12, color:"#34d399", fontWeight:600 }}>{new Date(u.first_payment_date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"})}</div>
                                {u.days_to_first_payment!==null && <div style={{ fontSize:10, color:"#475569" }}>{u.days_to_first_payment}d after signup</div>}
                              </div>
                            ) : <span style={{ fontSize:12, color:"#475569" }}>Not yet</span>}
                          </div>
                          <div style={{ fontSize:13, color:isPaying?"#e2e8f0":"#334155", fontFamily:"JetBrains Mono,monospace", alignSelf:"center" }}>
                            {isPaying?`£${u.total_paid.toFixed(2)}`:"-"}
                          </div>
                          <div style={{ alignSelf:"center" }}>
                            {isEligible ? (
                              <div>
                                <div style={{ fontSize:13, fontWeight:700, color:"#f59e0b", fontFamily:"JetBrains Mono,monospace" }}>£{u.commission_amount.toFixed(2)}</div>
                                <div style={{ fontSize:10, color:"#92400e" }}>15% of first</div>
                              </div>
                            ) : isPaying ? <span style={{ fontSize:11, color:"#475569" }}>Outside window</span>
                              : <span style={{ fontSize:11, color:"#334155" }}>-</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop:10, padding:"8px 14px", background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.12)", borderRadius:8, fontSize:11, color:"#92400e" }}>
                    🟡 Amber row = commission eligible (first payment within 90 days) · Commission = 15% of first payment only
                  </div>
                </div>
              );
            })()}
            </div>{/* end max-width wrapper */}
          </div>
        )}

        {/* ── REVENUE MODAL ── */}
        {revenueModal && (
          <div onClick={() => setRevenueModal(null)}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:32, width:"100%", maxWidth:620, maxHeight:"85vh", overflowY:"auto" }}>

              {/* Modal header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
                <div>
                  <div style={{ fontSize:18, fontWeight:800, color:"#e2e8f0" }}>
                    📊 <span style={{ fontFamily:"JetBrains Mono,monospace", color:"#a5b4fc" }}>{revenueModal.code}</span> earnings
                  </div>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>Revenue generated by signups from this promo code</div>
                </div>
                <button onClick={() => setRevenueModal(null)}
                  style={{ background:"transparent", border:"none", color:"#64748b", fontSize:20, cursor:"pointer", padding:"4px 8px" }}>×</button>
              </div>

              {/* Period tabs */}
              <div style={{ display:"flex", gap:0, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, overflow:"hidden", marginBottom:24, width:"fit-content" }}>
                {[
                  { id:"3m",  label:"Last 3 months" },
                  { id:"6m",  label:"Last 6 months" },
                  { id:"12m", label:"Last 12 months" },
                  { id:"all", label:"All time" },
                ].map((p, i, arr) => (
                  <button key={p.id} onClick={() => loadCodeRevenue(revenueModal.code, p.id)}
                    style={{ padding:"8px 18px", border:"none", borderRight:i<arr.length-1?"1px solid rgba(255,255,255,0.07)":"none",
                      fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Sora,sans-serif",
                      background:revenueModal.period===p.id?"rgba(99,102,241,0.25)":"transparent",
                      color:revenueModal.period===p.id?"#a5b4fc":"#64748b" }}>
                    {p.label}
                  </button>
                ))}
              </div>

              {revenueModal.loading && <div style={{ textAlign:"center", padding:"40px", color:"#64748b" }}>Calculating from Stripe...</div>}
              {revenueModal.error && <div style={{ color:"#f87171", fontSize:13, padding:"16px", background:"rgba(248,113,113,0.1)", borderRadius:10 }}>{revenueModal.error}</div>}

              {revenueModal.data && (() => {
                const d = revenueModal.data;
                return (
                  <div>
                    {/* Summary cards */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:24 }}>
                      {[
                        { label:"Total signups",    val:d.total_signups,                    col:"#818cf8" },
                        { label:"Paying customers", val:d.paying_users,                     col:"#34d399" },
                        { label:"Revenue",          val:`£${d.total_revenue.toFixed(2)}`,   col:"#e2e8f0" },
                        { label:"Commission owed",  val:`£${d.total_commission.toFixed(2)}`,col:"#f59e0b" },
                      ].map(s => (
                        <div key={s.label} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 18px" }}>
                          <div style={{ fontSize:22, fontWeight:800, color:s.col, fontFamily:"JetBrains Mono,monospace" }}>{s.val}</div>
                          <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginTop:3, textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Commission callout */}
                    <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:"14px 18px", marginBottom:20 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#f59e0b", marginBottom:4 }}>💰 Commission to pay</div>
                      <div style={{ fontSize:28, fontWeight:800, color:"#f59e0b", fontFamily:"JetBrains Mono,monospace" }}>£{d.total_commission.toFixed(2)}</div>
                      <div style={{ fontSize:11, color:"#92400e", marginTop:4 }}>15% of each customer's first payment · {d.paying_users} paying customer{d.paying_users!==1?"s":""}</div>
                    </div>

                    {/* Per-user breakdown */}
                    {d.users.filter(u => u.revenue_in_period > 0 || u.first_payment).length > 0 && (
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Customer breakdown</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          {d.users.filter(u => u.revenue_in_period > 0 || u.first_payment).map((u, i) => (
                            <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 80px", gap:12, padding:"10px 14px", background:"rgba(255,255,255,0.02)", borderRadius:10, alignItems:"center" }}>
                              <div>
                                <div style={{ fontSize:13, color:"#e2e8f0", fontWeight:600 }}>{u.email}</div>
                                <div style={{ fontSize:11, color:"#64748b" }}>{u.name}</div>
                              </div>
                              <div style={{ textAlign:"right" }}>
                                <div style={{ fontSize:12, color:"#34d399", fontWeight:700, fontFamily:"JetBrains Mono,monospace" }}>£{u.revenue_in_period.toFixed(2)}</div>
                                <div style={{ fontSize:10, color:"#475569" }}>revenue</div>
                              </div>
                              <div style={{ textAlign:"right" }}>
                                <div style={{ fontSize:12, color:"#f59e0b", fontWeight:700, fontFamily:"JetBrains Mono,monospace" }}>£{u.commission.toFixed(2)}</div>
                                <div style={{ fontSize:10, color:"#475569" }}>commission</div>
                              </div>
                              <div style={{ textAlign:"right" }}>
                                <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99,
                                  background:u.plan==="proPlus"?"rgba(245,158,11,0.15)":u.plan==="pro"?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.06)",
                                  color:u.plan==="proPlus"?"#f59e0b":u.plan==="pro"?"#a5b4fc":"#64748b" }}>
                                  {u.plan==="proPlus"?"Pro+":u.plan==="pro"?"Pro":"Free"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      {/* User Info Modal */}
      {viewingUser && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={() => setViewingUser(null)}>
          <div style={{ background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:32, maxWidth:560, width:"100%", maxHeight:"88vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <h2 style={{ fontSize:20, fontWeight:700, color:"#e2e8f0" }}>User Info</h2>
                  <StatusBadge status={viewingUser.status} />
                </div>
                <p style={{ fontSize:13, color:"#475569", fontFamily:"JetBrains Mono,monospace" }}>ID #{viewingUser.id}</p>
              </div>
              <button onClick={() => setViewingUser(null)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#94a3b8", fontSize:16, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Sora,sans-serif" }}>✕</button>
            </div>

            {viewingUser.status === "deactivated" && (
              <div style={{ padding:"12px 16px", background:"rgba(148,163,184,0.08)", border:"1px solid rgba(148,163,184,0.25)", borderRadius:10, marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>○</span>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:"#94a3b8" }}>Account Deactivated</p>
                  <p style={{ fontSize:12, color:"#64748b" }}>This user deactivated their own account. Use Edit to reactivate.</p>
                </div>
              </div>
            )}

            {[
              { title:"Account", icon:"👤", rows:[
                ["Email", viewingUser.email],
                ["Plan", viewingUser.plan?viewingUser.plan.charAt(0).toUpperCase()+viewingUser.plan.slice(1):"-"],
                ["Status", viewingUser.status],
                ["Joined", viewingUser.joined?new Date(viewingUser.joined).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}):"-"],
                ["Last Login", viewingUser.lastLogin?new Date(viewingUser.lastLogin).toLocaleString("en-GB",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Europe/London"}):"Never"],
                ["Last Scan", viewingUser.lastScanAt?new Date(viewingUser.lastScanAt).toLocaleString("en-GB",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Europe/London"}):"Never"],
                ["Scans Today", viewingUser.searches??"-"],
                ["Lifetime Scans", viewingUser.totalScans??"-"],
              ]},
              { title:"Personal", icon:"📋", rows:[["First Name",viewingUser.firstName||"-"],["Last Name",viewingUser.lastName||"-"],["Phone",viewingUser.phone||"-"]]},
              { title:"Company", icon:"🏢", rows:[["Company Name",viewingUser.companyName||"-"],["Job Role",viewingUser.jobRole||"-"],["Sector",viewingUser.companySector||"-"]]},
              { title:"Marketing & Acquisition", icon:"📣", rows:[["Heard About Us",viewingUser.referralSource||"-"],["Marketing Consent",viewingUser.marketingConsent]]},
              { title:"Privacy & Consent", icon:"🍪", rows:[["Cookie Consent",viewingUser.cookieConsent]]},
            ].map(section => (
              <div key={section.title} style={{ marginBottom:20 }}>
                <p style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>{section.icon} {section.title}</p>
                <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
                  {section.rows.map(([label, value], i) => (
                    <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", borderBottom:i<section.rows.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                      <span style={{ fontSize:13, color:"#475569" }}>{label}</span>
                      <span style={{ fontSize:13, fontWeight:500, textAlign:"right", maxWidth:"60%", wordBreak:"break-all",
                        color: label==="Status" ? (value==="active"?"#22c55e":value==="deactivated"?"#94a3b8":"#ef4444")
                             : label==="Marketing Consent" ? (value==="Yes"?"#22c55e":"#ef4444")
                             : label==="Cookie Consent" ? (value==="accepted"?"#22c55e":value==="declined"?"#ef4444":"#f59e0b")
                             : "#e2e8f0" }}>
                        {label==="Marketing Consent" ? (value==="Yes"?"✅ Opted in":"❌ Opted out")
                          : label==="Cookie Consent" ? (value==="accepted"?"✅ Accepted":value==="declined"?"❌ Declined":"⏳ Not yet set")
                          : label==="Status" ? (value==="active"?"● Active":value==="deactivated"?"○ Deactivated":"⊘ Suspended")
                          : String(value??"-")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginTop:8 }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>📝 Admin Notes</p>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Internal notes about this account - visible to admins only..." rows={4}
                style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 14px", color:"#e2e8f0", fontSize:13, fontFamily:"JetBrains Mono,monospace", resize:"vertical", outline:"none", boxSizing:"border-box", lineHeight:1.6 }} />
              <button onClick={() => saveNote(viewingUser.id, noteText)} disabled={noteSaving}
                style={{ marginTop:10, width:"100%", padding:"10px 0", background:noteSaving?"rgba(124,58,237,0.3)":"#7C3AED", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:noteSaving?"default":"pointer", fontFamily:"Sora,sans-serif" }}>
                {noteSaving ? "Saving..." : "Save Note"}
              </button>
            </div>

            {/* Danger zone - hard delete trigger */}
            <div style={{ marginTop:24, paddingTop:18, borderTop:"1px solid rgba(239,68,68,0.15)" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#f87171", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>⚠ Danger zone</p>
              <p style={{ fontSize:12, color:"#94a3b8", lineHeight:1.55, marginBottom:10 }}>
                Permanently delete this user and all their data - projects, scans, keywords, brand tracking history, blog plans, integration tokens. This cannot be undone. Prefer "deactivate" unless you genuinely need the email freed up.
              </p>
              <button onClick={() => { setHardDeletingUser(viewingUser); setHardDeleteConfirm(""); }}
                style={{ padding:"9px 16px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.4)", borderRadius:10, color:"#f87171", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                Delete account permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hard-delete confirmation modal */}
      {hardDeletingUser && (
        <div onClick={(e) => { if (e.target === e.currentTarget) { setHardDeletingUser(null); setHardDeleteConfirm(''); } }}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:1100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ width:"100%", maxWidth:480, background:"#13131F", border:"1px solid rgba(239,68,68,0.4)", borderRadius:16, padding:"24px 26px", boxShadow:"0 24px 60px rgba(239,68,68,0.15)" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"#f87171", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>⚠ Permanent deletion</p>
            <p style={{ fontSize:16, fontWeight:800, color:"#fff", marginBottom:8 }}>Delete {hardDeletingUser.email}?</p>
            <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.6, marginBottom:14 }}>
              Removes the user row, every project they own, and all associated scans, keywords, brand tracking, blog plans, and integration tokens. <strong style={{ color:"#fca5a5" }}>This cannot be undone.</strong>
            </p>
            <p style={{ fontSize:12, fontWeight:600, color:"#cbd5e1", marginBottom:6 }}>Type the email to confirm:</p>
            <input value={hardDeleteConfirm} onChange={e => setHardDeleteConfirm(e.target.value)} autoFocus
              placeholder={hardDeletingUser.email}
              style={{ width:"100%", padding:"10px 12px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, color:"#fff", fontSize:13, fontFamily:"JetBrains Mono,monospace", outline:"none", boxSizing:"border-box", marginBottom:14 }}
            />
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={() => { setHardDeletingUser(null); setHardDeleteConfirm(''); }}
                style={{ padding:"9px 16px", background:"transparent", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, color:"#94a3b8", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                Cancel
              </button>
              <button onClick={performHardDelete}
                disabled={hardDeleting || hardDeleteConfirm.trim().toLowerCase() !== hardDeletingUser.email.toLowerCase()}
                style={{
                  padding:"9px 18px",
                  background: hardDeleteConfirm.trim().toLowerCase() === hardDeletingUser.email.toLowerCase() ? "#dc2626" : "rgba(220,38,38,0.3)",
                  border:"none", borderRadius:10, color:"#fff", fontSize:12, fontWeight:700,
                  cursor: hardDeleting || hardDeleteConfirm.trim().toLowerCase() !== hardDeletingUser.email.toLowerCase() ? "not-allowed" : "pointer",
                  fontFamily:"Sora,sans-serif",
                }}>
                {hardDeleting ? "Deleting..." : "Delete forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && <EditModal user={editing} onClose={() => setEditing(null)}
        onSave={(updated) => { updateUser(updated.id, { plan:updated.plan, status:updated.status, tempPlan:updated.tempPlan, tempDays:updated.tempDays, revokeTemp:updated.revokeTemp }); setEditing(null); }} />}
    </div>
  );
};

export default function App() {
  return (<><GlobalStyles /><AdminPanel /></>);
}
