import { useState, useEffect } from "react";
import BackupsSection from "./sections/BackupsSection";
import PromosSection from "./sections/PromosSection.jsx";
import MonitoringSection from "./sections/MonitoringSection.jsx";
import CapacitySection from "./sections/CapacitySection.jsx";
import UpgradesSection from "./sections/UpgradesSection.jsx";
import CostsSection from "./sections/CostsSection.jsx";
import AnnounceSection from "./sections/AnnounceSection.jsx";
import ProspectFlowSection from "./sections/ProspectFlowSection.jsx";
import PrivacySection from "./sections/PrivacySection.jsx";
import CollectionToggleSection from "./sections/CollectionToggleSection.jsx";
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
        <div style={{ textAlign:"center", marginBottom:6, fontSize:12, fontWeight:700, color:"#a78bfa" }}>
          {months[activeBar].label}: <span style={{ color:"#e2e8f0" }}>{counts[activeBar]} signup{counts[activeBar] !== 1 ? "s" : ""}</span>
        </div>
      )}
      <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:48 }}>
        {counts.map((c, i) => (
          <div key={i}
            onClick={() => setActiveBar(activeBar === i ? null : i)}
            style={{ flex:1, background: activeBar === i ? "#a78bfa" : i === 11 ? "#a78bfa" : "rgba(129,140,248,0.35)",
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

// Single source of truth for plan vocabulary in the admin app. Current tiers
// are Entrepreneur / Enterprise; pro / proPlus are legacy aliases kept so old
// rows still render with a sensible label and colour.
import { PLAN_META, planMeta, planLabel, planShort, isLegacyPlan, Badge, StatusBadge, Input, Spinner } from "./shared.jsx";

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
const EditModal = ({ user, onSave, onClose }) => {
  const [plan, setPlan] = useState(user.plan);
  const [status, setStatus] = useState(user.status);
  const [cookieConsent, setCookieConsent] = useState(user.cookieConsent || null);
  const [tempOn, setTempOn] = useState(!!user.tempPlan);
  const [tempPlan, setTempPlan] = useState(user.tempPlan || "enterprise");
  const [tempDays, setTempDays] = useState(7);

  // Nothing here is applied until Save Changes is pressed, but the plan buttons
  // highlight the moment they are clicked, so a selection LOOKS committed. The
  // backdrop closed the modal on any outside click and silently discarded it -
  // which reads exactly like "I set Enterprise and it went back", and is the
  // most likely explanation for a plan change that never seemed to stick.
  const dirty = plan !== user.plan
    || status !== user.status
    || cookieConsent !== (user.cookieConsent || null)
    || tempOn !== !!user.tempPlan;

  const closeGuarded = () => {
    if (dirty && !window.confirm('You have unsaved changes. Discard them?')) return;
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:24 }} onClick={closeGuarded}>
      <div style={{ width:"100%", maxWidth:480, background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h3 style={{ fontWeight:700, fontSize:16 }}>Edit User</h3>
            <p style={{ fontSize:12, color:"#475569", marginTop:2, fontFamily:"JetBrains Mono,monospace" }}>{user.email}</p>
          </div>
          <button onClick={closeGuarded} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:20 }}>×</button>
        </div>

        <div style={{ padding:24, maxHeight:"70vh", overflowY:"auto" }}>
          {/* Plan */}
          <p style={{ fontSize:12, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>Permanent Plan</p>
          {/* Current tiers are Entrepreneur (1 seat, 1 project) and Enterprise
              (unlimited). Legacy pro/proPlus rows show a note below if present. */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:6 }}>
            {[["free","Free","#64748b"],["entrepreneur","Entrepreneur","#a78bfa"],["enterprise","Enterprise","#f59e0b"]].map(([id,label,col]) => (
              <button key={id} onClick={() => setPlan(id)}
                style={{ padding:"12px 8px", borderRadius:12, border:`2px solid ${plan===id ? col : "rgba(255,255,255,0.08)"}`, background: plan===id ? `${col}18` : "rgba(255,255,255,0.03)", color: plan===id ? col : "#64748b", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", transition:"all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>
          {isLegacyPlan(plan) && (
            <div style={{ marginBottom:20, padding:"8px 12px", borderRadius:8, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.25)", fontSize:11, color:"#f59e0b" }}>
              This user is on the legacy <strong>{planLabel(plan)}</strong> plan ({plan === "proPlus" ? "maps to Enterprise" : "maps to Entrepreneur"}). Switching to a current tier is recommended.
            </div>
          )}
          {!isLegacyPlan(plan) && <div style={{ marginBottom:14 }} />}

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
                <div style={{ width:36, height:20, borderRadius:99, background: tempOn ? "#7C3AED" : "rgba(255,255,255,0.1)", position:"relative", transition:"background 0.2s" }}>
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
                  {[["free","Free","#64748b"],["entrepreneur","Entrepreneur","#a78bfa"],["enterprise","Enterprise","#f59e0b"]].map(([id,label,col]) => (
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
                  style={{ width:"100%", accentColor:"#7C3AED" }} />
                <div style={{ padding:"10px 14px", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:10, marginTop:12 }}>
                  <p style={{ fontSize:12, color:"#fbbf24" }}>Will get <strong>{planLabel(tempPlan)}</strong> access for {tempDays} day{tempDays!==1?"s":""}, then revert to {planLabel(plan)}.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:10 }}>
          <button onClick={closeGuarded} style={{ flex:1, padding:"12px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, color:"#64748b", fontSize:14, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>Cancel</button>
          <button onClick={() => onSave({ ...user, plan, status, cookieConsent, tempPlan: tempOn ? tempPlan : null, tempDays: tempOn ? tempDays : null, revokeTemp: !tempOn && !!user.tempPlan })}
            style={{ flex:2, padding:"12px", background: dirty ? "#7C3AED" : "rgba(124,58,237,0.35)", border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
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
    return `⏱ Temp ${planLabel(u.tempPlan)} · ${daysLeft > 0 ? `${daysLeft}d left` : "Expired"}`;
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
            style={{ padding:"6px 14px", background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:8, color:"#a78bfa", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
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
              style={{ width:"100%", padding:"10px", background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:8, color:"#a78bfa", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
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
  const loadOverview = async () => {
    try {
      const r = await adminFetch(`${API_URL}/admin/overview`);
      setOverview(await r.json());
    } catch { setOverview({ error: true }); }
  };

  const loadProjects = async (userId) => {
    setProjects(null);
    try {
      const r = await adminFetch(`${API_URL}/admin/users/${userId}/projects`);
      const d = await r.json();
      setProjects(d.projects || []);
    } catch { setProjects([]); }
  };

  const saveScanCap = async (projectId) => {
    setCapSaving(projectId); setCapMsg("");
    try {
      const raw = capDraft[projectId];
      const r = await adminFetch(`${API_URL}/admin/projects/${projectId}/scan-cap`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max_scan_pages: raw === "" || raw === undefined ? null : raw }),
      });
      const d = await r.json();
      if (!r.ok) { setCapMsg(d.error || "Could not save"); return; }
      setProjects(ps => (ps || []).map(p => p.id === projectId ? { ...p, max_scan_pages: d.project.max_scan_pages } : p));
      setCapMsg(`Saved: ${d.project.name} -> ${d.project.max_scan_pages ?? "default limits"}`);
    } catch { setCapMsg("Could not save"); }
    finally { setCapSaving(null); }
  };

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

  // Overview is the landing tab: the founder's daily check should be zero
  // clicks, and every other tab is a drill-down from it.
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  // Projects belonging to the user currently open in the info modal - both the
  // ones they own and the ones shared with them. Support always arrives from
  // "this customer has a problem", so projects are a detail of the user rather
  // than a browser of their own.
  const [projects, setProjects] = useState(null);
  const [capDraft, setCapDraft] = useState({});
  const [capSaving, setCapSaving] = useState(null);
  const [capMsg, setCapMsg] = useState("");
  const [pfData, setPfData] = useState(null);
  const [pfLoading, setPfLoading] = useState(false);
  const [pfError, setPfError] = useState("");
  const [monData, setMonData] = useState(null);
  const [monLoading, setMonLoading] = useState(false);
  const [monError, setMonError] = useState("");
  const [annData, setAnnData] = useState(null);
  const [annLoading, setAnnLoading] = useState(false);
  const [annError, setAnnError] = useState("");
  const [annBusy, setAnnBusy] = useState(false);
  const [annForm, setAnnForm] = useState({ type: "update", title: "", body: "" });
  const [capData, setCapData] = useState(null);
  const [capLoading, setCapLoading] = useState(false);
  const [capError, setCapError] = useState("");
  const [upgData, setUpgData] = useState(null);
  const [upgLoading, setUpgLoading] = useState(false);
  const [upgError, setUpgError] = useState("");
  const [costData, setCostData] = useState(null);
  const [costLoading, setCostLoading] = useState(false);
  const [costError, setCostError] = useState("");
  const [costInputs, setCostInputs] = useState(null); // editable assumptions
  const [bkData, setBkData] = useState(null);
  const [bkLoading, setBkLoading] = useState(false);
  const [bkError, setBkError] = useState("");
  const [bkBusy, setBkBusy] = useState("");        // 'backup' | 'restore' while running
  const [bkMsg, setBkMsg] = useState("");
  const [restoreConfirm, setRestoreConfirm] = useState("");
  const [pfCodeFilter, setPfCodeFilter] = useState("all");
  const [pfStatusFilter, setPfStatusFilter] = useState("all");
  const [pfSearch, setPfSearch] = useState("");
  const [revenueModal, setRevenueModal] = useState(null); // { code, period, data, loading }
  const [promos, setPromos] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [promoForm, setPromoForm] = useState({ code:"", description:"", trial_plan:"enterprise", trial_days:"14", max_uses:"", expires_at:"" });
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
  const [viewingUser, _setViewingUser] = useState(null);
  // Wrapping the setter keeps the project list in step with the modal without
  // an effect: opening a user loads their projects, closing clears them so the
  // next user never flashes the previous one's list.
  const setViewingUser = (u) => {
    _setViewingUser(u);
    setCapDraft({}); setCapMsg("");
    if (u?.id) loadProjects(u.id); else setProjects(null);
  };
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

  useEffect(() => { if (authed) { loadUsers(); loadOverview(); } }, []);

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
      loadOverview();   // Overview is the landing tab; it must not open empty
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
      newWin.document.write('<html><body style="background:#0a0a0f;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#a78bfa;font-size:15px;">Loading account…</body></html>');
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
      // Creds go via adminFetch headers - never in the query string (which logs).
      const res = await adminFetch(`${API_URL}/admin/prospect-flow`);
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
      // Creds go via adminFetch headers - only non-secret params in the URL.
      const params = new URLSearchParams({ code, period });
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

  const loadCapacity = async () => {
    setCapLoading(true); setCapError("");
    try {
      const res = await adminFetch(`${API_URL}/admin/capacity`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load");
      setCapData(d);
    } catch (err) { setCapError(err.message); }
    setCapLoading(false);
  };

  const loadUpgrades = async () => {
    setUpgLoading(true); setUpgError("");
    try {
      const res = await adminFetch(`${API_URL}/admin/upgrades`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load");
      setUpgData(d);
    } catch (err) { setUpgError(err.message); }
    setUpgLoading(false);
  };

  const loadAnnouncements = async () => {
    setAnnLoading(true); setAnnError("");
    try {
      const res = await adminFetch(`${API_URL}/admin/announcements`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load");
      setAnnData(d.announcements || []);
    } catch (err) { setAnnError(err.message); }
    setAnnLoading(false);
  };

  const sendAnnouncement = async () => {
    if (!annForm.title.trim() || !annForm.body.trim()) { setAnnError("Title and message are required."); return; }
    if (!window.confirm(`Send this ${annForm.type} announcement to ALL users? They'll see it in the bell on the workspace screen.`)) return;
    setAnnBusy(true); setAnnError("");
    try {
      const res = await adminFetch(`${API_URL}/admin/announcements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(annForm) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to send");
      setAnnForm({ type: "update", title: "", body: "" });
      await loadAnnouncements();
    } catch (err) { setAnnError(err.message); }
    setAnnBusy(false);
  };

  const toggleAnnouncement = async (a) => {
    try {
      await adminFetch(`${API_URL}/admin/announcements/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !a.active }) });
      await loadAnnouncements();
    } catch (err) { setAnnError(err.message); }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement permanently? It will disappear from every user's bell.")) return;
    try {
      await adminFetch(`${API_URL}/admin/announcements/${id}`, { method: "DELETE" });
      await loadAnnouncements();
    } catch (err) { setAnnError(err.message); }
  };

  const loadCostForecast = async () => {
    setCostLoading(true); setCostError("");
    try {
      const [res, usageRes] = await Promise.all([
        adminFetch(`${API_URL}/admin/cost-forecast`),
        adminFetch(`${API_URL}/admin/usage?days=30`).catch(() => null),
      ]);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load");
      // Measured spend (may be unavailable on older backends).
      let usage = null;
      try { if (usageRes && usageRes.ok) usage = await usageRes.json(); } catch {}
      setCostData({ ...d, usage });
      // Seed the editable inputs from the model defaults + unit costs (first load only).
      setCostInputs(prev => prev || {
        ...d.defaults,
        serpCost: d.model.serp.unitCost,
        backlinkCost: d.model.backlinks.unitCost,
        brandCost: d.model.brand.unitCost,
        blogCost: d.model.blog.unitCost,
        llmCost: d.model.llm.unitCost,
      });
    } catch (err) { setCostError(err.message); }
    setCostLoading(false);
  };

  const loadBackups = async () => {
    setBkLoading(true); setBkError(""); setBkMsg("");
    try {
      const res = await adminFetch(`${API_URL}/admin/backup`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load");
      setBkData(d);
    } catch (err) { setBkError(err.message); }
    setBkLoading(false);
  };

  const runBackupNow = async () => {
    setBkBusy("backup"); setBkError(""); setBkMsg("");
    try {
      const res = await adminFetch(`${API_URL}/admin/backup/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminEmail: adminCreds.email, adminPassword: adminCreds.password }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Backup failed");
      setBkMsg(`Backup complete - ${(d.sizeBytes / 1048576).toFixed(1)} MB stored.`);
      await loadBackups();
    } catch (err) { setBkError(err.message); }
    setBkBusy("");
  };

  const restoreBackup = async () => {
    setBkBusy("restore"); setBkError(""); setBkMsg("");
    try {
      const res = await adminFetch(`${API_URL}/admin/backup/restore`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminEmail: adminCreds.email, adminPassword: adminCreds.password, confirm: "RESTORE LIVE DATABASE" }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Restore failed");
      setBkMsg("Restore complete. A pre-restore safety backup was taken first.");
      setRestoreConfirm("");
      await loadBackups();
    } catch (err) { setBkError(err.message); }
    setBkBusy("");
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === "overview") loadOverview();
    if (tab === "prospectflow") loadProspectFlow();
    if (tab === "promos" && promos.length === 0) loadPromos();
    if (tab === "monitoring") loadMonitoring();
    if (tab === "capacity") loadCapacity();
    if (tab === "upgrades") loadUpgrades();
    if (tab === "costs") loadCostForecast();
    if (tab === "announce") loadAnnouncements();
    if (tab === "backups") loadBackups();
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
      <span onClick={() => toggleSort(col)} style={{ cursor:"pointer", userSelect:"none", fontSize:11, color:active?"#a78bfa":"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", display:"flex", alignItems:"center", gap:3 }}>
        {label} <span style={{ fontSize:9, opacity:active?1:0.4 }}>{active?(sortDir==="asc"?"▲":"▼"):"⇅"}</span>
      </span>
    );
  };

  const newSignups = users.filter(u => { if (!u.joined) return false; const c=new Date(); c.setDate(c.getDate()-statsWindow); return new Date(u.joined)>=c; }).length;
  const countFree         = users.filter(u => u.plan==="free").length;
  // Current tiers (legacy pro -> entrepreneur, proPlus -> enterprise).
  const countEntrepreneur = users.filter(u => u.plan==="entrepreneur" || u.plan==="pro").length;
  const countEnterprise   = users.filter(u => u.plan==="enterprise" || u.plan==="proPlus").length;
  const countPaid         = countEntrepreneur + countEnterprise;
  const countDeactivated = users.filter(u => u.status==="deactivated").length;

  const stats = [
    { label:"Total Users",   val:users.length,                                      icon:"👥", col:"#a78bfa" },
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
            <button type="submit" disabled={loading} style={{ width:"100%", padding:"13px", background:"#7C3AED", border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
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

      {/* One column for the whole panel. Before this the tab bar spanned the
          full window while each section centred itself at its own max-width -
          900, 960, 1000, 1100 - so the content moved sideways every time you
          changed tab, and the tabs never lined up with what was under them.
          1600 matches the customer app, so the two feel like one product. */}
      <div className="admin-body" style={{ padding:"32px", maxWidth:1600, margin:"0 auto", boxSizing:"border-box" }}>
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
              <div style={{ textAlign:"center", borderLeft:"1px solid rgba(255,255,255,0.07)", borderRight:"1px solid rgba(255,255,255,0.07)" }}><div style={{ fontSize:20, fontWeight:800, color:"#a78bfa" }}>{countEntrepreneur}</div><div style={{ fontSize:10, fontWeight:700, color:"#7C3AED", textTransform:"uppercase", letterSpacing:"0.04em", marginTop:2 }}>Entrepreneur</div></div>
              <div style={{ textAlign:"center" }}><div style={{ fontSize:20, fontWeight:800, color:"#f59e0b" }}>{countEnterprise}</div><div style={{ fontSize:10, fontWeight:700, color:"#d97706", textTransform:"uppercase", letterSpacing:"0.04em", marginTop:2 }}>Enterprise</div></div>
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

          {/* Quick-find: type an email or name anywhere in the admin and land on
              the filtered Users list. Support starts from "this customer emailed
              us", so the search box lives in the header, not inside one tab. */}
          <div className="glass" style={{ borderRadius:16, padding:"14px 20px", gridColumn:"1 / -1", display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:16 }} aria-hidden="true">🔎</span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); if (activeTab !== "users" && e.target.value) handleTabSwitch("users"); }}
              placeholder="Find a user by email, name or company - jumps to the Users list as you type"
              style={{ flex:1, padding:"9px 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, color:"#e2e8f0", fontSize:13, fontFamily:"Sora,sans-serif", outline:"none" }} />
            {search && (
              <button onClick={() => setSearch("")}
                style={{ padding:"7px 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#94a3b8", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                Clear
              </button>
            )}
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
        {/* Navigation grouped by the job you came to do, not a flat strip of
            eleven tabs. Overview stands alone as the landing view; everything
            else is a drill-down inside one of four groups. */}
        <div className="tab-bar" style={{ display:"flex", gap:22, marginBottom:28, borderBottom:"1px solid rgba(255,255,255,0.07)", paddingBottom:10, flexWrap:"wrap", alignItems:"flex-end" }}>
          {[
            { name:null, tabs:[{id:"overview",label:"◈ Overview"}] },
            { name:"People", tabs:[{id:"users",label:"Users"},{id:"upgrades",label:"Upgrades"}] },
            { name:"Revenue", tabs:[{id:"promos",label:"Promo codes"},{id:"prospectflow",label:"ProspectFlow"},{id:"costs",label:"Cost forecast"}] },
            { name:"Operations", tabs:[{id:"monitoring",label:"Monitoring"},{id:"capacity",label:"Capacity"},{id:"backups",label:"Backups"},{id:"loadtest",label:"Load test"}] },
            { name:"Comms", tabs:[{id:"announce",label:"Announcements"}] },
            { name:"Legal", tabs:[{id:"privacy",label:"Privacy"}] },
            { name:"External", tabs:[{id:"collection",label:"Collection toggle"}] },
          ].map(group => (
            <div key={group.name || "overview"}>
              {group.name && <p style={{ fontSize:10, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 5px 4px" }}>{group.name}</p>}
              <div style={{ display:"flex", gap:4 }}>
                {group.tabs.map(tab => (
                  <button key={tab.id} className="tab-btn" onClick={() => handleTabSwitch(tab.id)}
                    style={{ padding:"8px 16px", background:activeTab===tab.id?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.03)", border:`1px solid ${activeTab===tab.id?"rgba(124,58,237,0.5)":"rgba(255,255,255,0.06)"}`, color:activeTab===tab.id?"#a78bfa":"#64748b", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"Sora,sans-serif", borderRadius:9, transition:"all 0.15s" }}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── USERS TAB ── */}
        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div>
            {overview === null && <p style={{ color:"#64748b" }}>Loading…</p>}
            {overview?.error && <p style={{ color:"#f87171" }}>Could not load the overview.</p>}
            {overview && !overview.error && (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:12, marginBottom:20 }}>
                  {[
                    ["Users", overview.users.total, `${overview.users.paid || 0} paid · ${overview.users.new_7d || 0} new this week`, "#a78bfa"],
                    ["Projects", overview.projects.total, null, "#a78bfa"],
                    ["Site scans", overview.scans.total, `${overview.scans.last_7d || 0} this week`, "#7dd3fc"],
                    ["Errors (24h)", overview.errors.last_24h, overview.errors.last_24h > 0 ? "check Monitoring" : "all quiet", overview.errors.last_24h > 0 ? "#f87171" : "#4ade80"],
                    ["AI spend (30d)", `$${(overview.llm.cost_30d || 0).toFixed(2)}`, `${overview.llm.calls_30d || 0} calls`, "#fbbf24"],
                    ["Database", overview.dbSize || "-", null, "#94a3b8"],
                  ].map(([label, val, sub, col]) => (
                    <div key={label}
                      onClick={() => { const go = { "Users":"users", "Errors (24h)":"monitoring", "AI spend (30d)":"costs", "Site scans":"capacity", "Database":"backups" }[label]; if (go) handleTabSwitch(go); }}
                      title="Open the detailed view"
                      style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"16px 18px", cursor:"pointer" }}>
                      <p style={{ fontSize:11, color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", margin:0 }}>{label}</p>
                      <p style={{ fontSize:26, fontWeight:800, color:col, margin:"6px 0 0", fontFamily:"JetBrains Mono,monospace" }}>{val ?? "-"}</p>
                      {sub && <p style={{ fontSize:11, color:"#475569", margin:"4px 0 0" }}>{sub}</p>}
                    </div>
                  ))}
                </div>

                {/* The data flywheel: the asset that grows with usage and cannot be
                    bought or backfilled later. Shown with growth, because a flat
                    count says nothing about whether the flywheel is turning. */}
                <div style={{ background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:14, padding:"18px 20px" }}>
                  <p style={{ fontSize:14, fontWeight:700, color:"#e2e8f0", margin:"0 0 4px" }}>Data flywheel</p>
                  <p style={{ fontSize:12, color:"#64748b", lineHeight:1.6, margin:"0 0 14px", maxWidth:640 }}>
                    Datasets that accumulate with every customer and every month. This is the asset
                    keyword-data vendors sell - ours grows for free with usage, and history cannot be
                    backfilled later.
                  </p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
                    {[
                      ["Keyword metrics", overview.dataAssets.keywordMetrics.total,
                        `${overview.dataAssets.keywordMetrics.new_7d || 0} new this week · ${overview.dataAssets.keywordMetrics.markets || 0} market${(overview.dataAssets.keywordMetrics.markets || 0) === 1 ? "" : "s"}`,
                        "volumes, competition and bid prices per keyword+market, from Keyword Planner"],
                      // The series, as opposed to the latest value above. This
                      // is the part that cannot be bought or backfilled - months
                      // only accumulate by having been recorded.
                      ["Keyword history", overview.dataAssets.keywordHistory?.total,
                        `${overview.dataAssets.keywordHistory?.months || 0} month${(overview.dataAssets.keywordHistory?.months || 0) === 1 ? "" : "s"} · ${(overview.dataAssets.keywordHistory?.keywords || 0).toLocaleString()} terms`,
                        "the same figures month by month - seasonality and rising terms, which vendors charge for"],
                      ["Rank snapshots", overview.dataAssets.keywordSnapshots.total,
                        `${overview.dataAssets.keywordSnapshots.days || 0} daily snapshots`,
                        "tracked-keyword positions, one row per keyword per day"],
                      ["AI answer records", overview.dataAssets.brandTrackingResults.total,
                        `across ${overview.dataAssets.brandTrackingResults.days || 0} run days`,
                        "which brands the AI platforms name, question by question"],
                    ].map(([label, val, sub, desc]) => (
                      <div key={label} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 16px" }}>
                        <p style={{ fontSize:11, color:"#a78bfa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", margin:0 }}>{label}</p>
                        <p style={{ fontSize:24, fontWeight:800, color:"#e2e8f0", margin:"6px 0 0", fontFamily:"JetBrains Mono,monospace" }}>{(val ?? 0).toLocaleString()}</p>
                        <p style={{ fontSize:11, color:"#64748b", margin:"4px 0 0" }}>{sub}</p>
                        <p style={{ fontSize:10, color:"#475569", margin:"6px 0 0", lineHeight:1.5 }}>{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "users" && (<>
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", gap:10, marginBottom:10, flexWrap:"wrap" }}>
            <div style={{ position:"relative", flex:1, minWidth:200 }}>
              <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:"#475569", fontSize:16 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email, name or company…"
                style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"12px 16px 12px 44px", color:"#fff", fontSize:14, outline:"none", fontFamily:"JetBrains Mono,monospace", boxSizing:"border-box" }}
                onFocus={e => e.target.style.border="1px solid #7C3AED"} onBlur={e => e.target.style.border="1px solid rgba(255,255,255,0.1)"} />
            </div>
            <button onClick={() => setShowFilters(f => !f)}
              style={{ padding:"12px 18px", background:showFilters?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.05)", border:`1px solid ${showFilters?"#7C3AED":"rgba(255,255,255,0.1)"}`, borderRadius:14, color:showFilters?"#a78bfa":"#94a3b8", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600, display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
              🎛 Filters {activeFiltersCount>0 && <span style={{ background:"#7C3AED", color:"#fff", borderRadius:99, padding:"1px 7px", fontSize:11 }}>{activeFiltersCount}</span>}
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
                    <option value="entrepreneur">Entrepreneur</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="pro">Pro (legacy)</option>
                    <option value="proPlus">Pro+ (legacy)</option>
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
          <PromosSection createPromo={createPromo} deletePromo={deletePromo} email={email} expandedPromo={expandedPromo} loadPromoSignups={loadPromoSignups} loading={loading} loadingPromos={loadingPromos} promoForm={promoForm} promoFormError={promoFormError} promoSignups={promoSignups} promos={promos} savingPromo={savingPromo} setPromoForm={setPromoForm} stats={stats} togglePromoActive={togglePromoActive} users={users} />
        )}
      </div>


        {/* ── PROSPECTFLOW TAB ── */}
        {activeTab === "loadtest" && (
          <LoadTestPanel />
        )}

        {activeTab === "monitoring" && (
          <MonitoringSection loadMonitoring={loadMonitoring} monData={monData} monError={monError} monLoading={monLoading} stats={stats} />
        )}

        {activeTab === "capacity" && (
          <CapacitySection capData={capData} capError={capError} capLoading={capLoading} loadCapacity={loadCapacity} />
        )}

        {activeTab === "upgrades" && (
          <UpgradesSection loadUpgrades={loadUpgrades} upgData={upgData} upgError={upgError} upgLoading={upgLoading} users={users} />
        )}

        {activeTab === "costs" && (
          <CostsSection costData={costData} costError={costError} costInputs={costInputs} costLoading={costLoading} loadCostForecast={loadCostForecast} search={search} setCostInputs={setCostInputs} users={users} />
        )}

        {activeTab === "announce" && (
          <AnnounceSection annBusy={annBusy} annData={annData} annError={annError} annForm={annForm} annLoading={annLoading} deleteAnnouncement={deleteAnnouncement} loadAnnouncements={loadAnnouncements} sendAnnouncement={sendAnnouncement} setAnnForm={setAnnForm} toggleAnnouncement={toggleAnnouncement} users={users} />
        )}

        {activeTab === "backups" && (
          <BackupsSection bkData={bkData} bkError={bkError} bkMsg={bkMsg} bkBusy={bkBusy}
            bkLoading={bkLoading} loadBackups={loadBackups} runBackupNow={runBackupNow} restoreBackup={restoreBackup} restoreConfirm={restoreConfirm} setRestoreConfirm={setRestoreConfirm} />
        )}

        {activeTab === "privacy" && (
          <PrivacySection adminFetch={adminFetch} API_URL={API_URL} />
        )}

        {activeTab === "collection" && (
          <CollectionToggleSection adminFetch={adminFetch} API_URL={API_URL} />
        )}

        {activeTab === "prospectflow" && (
          <ProspectFlowSection email={email} loadCodeRevenue={loadCodeRevenue} loadProspectFlow={loadProspectFlow} pfCodeFilter={pfCodeFilter} pfData={pfData} pfError={pfError} pfLoading={pfLoading} pfSearch={pfSearch} pfStatusFilter={pfStatusFilter} setPfCodeFilter={setPfCodeFilter} setPfData={setPfData} setPfSearch={setPfSearch} setPfStatusFilter={setPfStatusFilter} stats={stats} users={users} />
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
                    📊 <span style={{ fontFamily:"JetBrains Mono,monospace", color:"#a78bfa" }}>{revenueModal.code}</span> earnings
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
                      background:revenueModal.period===p.id?"rgba(124,58,237,0.25)":"transparent",
                      color:revenueModal.period===p.id?"#a78bfa":"#64748b" }}>
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
                        { label:"Total signups",    val:d.total_signups,                    col:"#a78bfa" },
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
                                <Badge plan={u.plan} />
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

            {/* Capabilities granted by support, not self-serve. */}
            <div style={{ marginBottom:16, padding:"14px 18px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#e2e8f0", margin:0 }}>Weekly auto-scans</p>
                <p style={{ fontSize:11, color:"#64748b", margin:"3px 0 0", lineHeight:1.5 }}>
                  Lets this account schedule weekly re-crawls per project. Off for everyone by
                  default - crawls cost server time - and enforced by the cron, not just the UI.
                </p>
              </div>
              <button
                onClick={async () => {
                  const next = !viewingUser.auto_scan_allowed;
                  try {
                    const r = await adminFetch(`${API_URL}/admin/users/${viewingUser.id}`, {
                      method: "PATCH", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ auto_scan_allowed: next }),
                    });
                    if (r.ok) {
                      _setViewingUser({ ...viewingUser, auto_scan_allowed: next });
                      setUsers(us => us.map(u => u.id === viewingUser.id ? { ...u, auto_scan_allowed: next } : u));
                    }
                  } catch {}
                }}
                style={{ flexShrink:0, padding:"7px 16px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif",
                  background: viewingUser.auto_scan_allowed ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${viewingUser.auto_scan_allowed ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.12)"}`,
                  color: viewingUser.auto_scan_allowed ? "#4ade80" : "#94a3b8" }}>
                {viewingUser.auto_scan_allowed ? "Enabled" : "Disabled"}
              </button>
            </div>

            {/* Projects this user owns or can see, with the crawl ceiling for each. */}
            <div style={{ marginBottom:24, padding:"16px 18px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#e2e8f0", marginBottom:4 }}>Projects</p>
              <p style={{ fontSize:11, color:"#64748b", lineHeight:1.6, marginBottom:12 }}>
                Owned and shared. The crawl ceiling raises one project past the customer-facing
                1000-page limit (up to 10000); leave blank and save to restore the normal limits.
                It permits a bigger crawl, it never forces one.
              </p>
              {capMsg && <p style={{ fontSize:12, color:"#a78bfa", marginBottom:10 }}>{capMsg}</p>}
              {projects === null ? <p style={{ fontSize:12, color:"#64748b" }}>Loading…</p>
              : projects.length === 0 ? <p style={{ fontSize:12, color:"#64748b" }}>This user has no projects.</p>
              : projects.map(pr => (
                <div key={`${pr.access}-${pr.id}`} style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap", padding:"9px 0", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ flex:"1 1 200px", minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <span style={{ color:"#e2e8f0", fontSize:13, fontWeight:600 }}>{pr.name}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:99,
                        background: pr.access === "owner" ? "rgba(124,58,237,0.18)" : "rgba(148,163,184,0.14)",
                        color: pr.access === "owner" ? "#a78bfa" : "#94a3b8" }}>
                        {pr.access === "owner" ? "owner" : `shared · ${pr.role || "member"}`}
                      </span>
                    </div>
                    <div style={{ color:"#475569", fontSize:11, fontFamily:"JetBrains Mono,monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {pr.url} · {pr.scans} scan{pr.scans === 1 ? "" : "s"}
                    </div>
                  </div>
                  {pr.access === "owner" ? (
                    <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                      <input type="number" min="1" max="10000"
                        value={capDraft[pr.id] !== undefined ? capDraft[pr.id] : (pr.max_scan_pages ?? "")}
                        onChange={e => setCapDraft(d => ({ ...d, [pr.id]: e.target.value }))}
                        placeholder="default"
                        style={{ width:96, padding:"6px 9px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#e2e8f0", fontSize:12, fontFamily:"JetBrains Mono,monospace", outline:"none" }} />
                      <button onClick={() => saveScanCap(pr.id)} disabled={capSaving === pr.id}
                        style={{ padding:"6px 12px", background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.4)", borderRadius:8, color:"#a78bfa", fontSize:11, fontWeight:700, cursor: capSaving === pr.id ? "not-allowed" : "pointer", fontFamily:"Sora,sans-serif", opacity: capSaving === pr.id ? 0.5 : 1 }}>
                        {capSaving === pr.id ? "…" : "Save"}
                      </button>
                    </div>
                  ) : (
                    // The ceiling belongs to the project, so it is only editable
                    // from the account that owns it - editing here would silently
                    // change another customer's limit.
                    <span style={{ fontSize:11, color:"#475569", flexShrink:0 }}>
                      ceiling set by owner{pr.max_scan_pages ? ` (${pr.max_scan_pages})` : ""}
                    </span>
                  )}
                </div>
              ))}
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
