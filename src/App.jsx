import { useState, useEffect } from "react";

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
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
    .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); }
    input, select, textarea { font-family: 'Sora', sans-serif; }
    .desktop-only { display: grid; }
    .mobile-only { display: none; }
    @media (max-width: 700px) {
      .desktop-only { display: none !important; }
      .mobile-only { display: block !important; }
    }
  `}</style>
);

const Badge = ({ plan }) => {
  const cfg = { free:["#64748b","#1e293b"], pro:["#818cf8","#1e1b4b"], proPlus:["#f59e0b","#1c1407"] };
  const col = cfg[plan] || cfg.free;
  const text = { free:"Free", pro:"Pro", proPlus:"Pro Plus" }[plan] || plan;
  return <span style={{ color:col[0], background:col[1], border:`1px solid ${col[0]}33`, padding:"2px 10px", borderRadius:99, fontSize:11, fontWeight:600, letterSpacing:"0.03em" }}>{text}</span>;
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
                  <p style={{ fontSize:12, color:"#fbbf24" }}>⚡ Will get <strong>{{"free":"Free","pro":"Pro","proPlus":"Pro Plus"}[tempPlan]}</strong> access for {tempDays} day{tempDays!==1?"s":""}, then revert to {plan}.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"12px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, color:"#64748b", fontSize:14, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>Cancel</button>
          <button onClick={() => onSave({ ...user, plan, status, tempPlan: tempOn ? tempPlan : null, tempDays: tempOn ? tempDays : null, revokeTemp: !tempOn && !!user.tempPlan })}
            style={{ flex:2, padding:"12px", background:"#6366f1", border:"none", borderRadius:12, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────

const UserRow = ({ u, i, total, onInfo, onEdit, onAccess }) => {
  const [expanded, setExpanded] = useState(false);
  const tempInfo = u.tempPlan && u.tempPlanExpiresAt ? (() => {
    const daysLeft = Math.ceil((new Date(u.tempPlanExpiresAt) - new Date()) / (1000 * 60 * 60 * 24));
    const planLabel = { free:"Free", pro:"Pro", proPlus:"Pro Plus" }[u.tempPlan] || u.tempPlan;
    return `⏱ Temp ${planLabel} · ${daysLeft > 0 ? `${daysLeft}d left` : "Expired"}`;
  })() : null;

  return (
    <div style={{ borderBottom: i < total - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
      {/* Desktop row */}
      <div className="desktop-only"
        style={{ gridTemplateColumns:"2fr 100px 100px 80px 90px 110px 140px", gap:16, padding:"16px 20px", alignItems:"center" }}
        onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"}
        onMouseLeave={e => e.currentTarget.style.background="transparent"}>
        <div>
          <p style={{ fontSize:13, color:"#e2e8f0", fontFamily:"JetBrains Mono,monospace" }}>{u.email}</p>
          {tempInfo && <p style={{ fontSize:11, color:"#f59e0b", marginTop:3 }}>{tempInfo}</p>}
        </div>
        <div><Badge plan={u.plan} /></div>
        <div>
          <span style={{ fontSize:12, fontWeight:600, color: u.status==="active" ? "#22c55e" : "#ef4444", background: u.status==="active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", padding:"3px 10px", borderRadius:99 }}>
            {u.status}
          </span>
        </div>
        <span style={{ fontSize:13, color:"#94a3b8" }}>{u.searches}</span>
        <span style={{ fontSize:11, color:"#475569" }}>{new Date(u.joined).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Europe/London' })}</span>
        <span style={{ fontSize:11, color:"#475569" }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Europe/London' }) : '—'}</span>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <button onClick={onInfo}
            style={{ padding:"6px 14px", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", borderRadius:8, color:"#4ade80", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
            Info
          </button>
          <button onClick={onEdit}
            style={{ padding:"6px 14px", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:8, color:"#818cf8", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
            Edit
          </button>
          <button onClick={onAccess}
            style={{ padding:"6px 14px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, color:"#f87171", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600, whiteSpace:"nowrap" }}>
            👤 Access Account
          </button>
        </div>
      </div>

      {/* Mobile row */}
      <div className="mobile-only">
        <button onClick={() => setExpanded(e => !e)}
          style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"transparent", border:"none", color:"#e2e8f0", cursor:"pointer", fontFamily:"JetBrains Mono,monospace", fontSize:13, textAlign:"left" }}>
          <span style={{ flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginRight:8 }}>{u.email}</span>
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
              <span style={{ fontSize:12, fontWeight:600, color: u.status==="active" ? "#22c55e" : "#ef4444", background: u.status==="active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", padding:"3px 10px", borderRadius:99 }}>
                {u.status}
              </span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, color:"#475569" }}>SEARCHES</span>
              <span style={{ fontSize:13, color:"#94a3b8" }}>{u.searches}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, color:"#475569" }}>JOINED</span>
              <span style={{ fontSize:11, color:"#475569" }}>{new Date(u.joined).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Europe/London' })}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, color:"#475569" }}>LAST SEEN</span>
              <span style={{ fontSize:11, color:"#475569" }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Europe/London' }) : '—'}</span>
            </div>
            <button onClick={onInfo}
              style={{ width:"100%", padding:"10px", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", borderRadius:8, color:"#4ade80", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
              Info
            </button>
            <button onClick={onEdit}
              style={{ width:"100%", padding:"10px", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:8, color:"#818cf8", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
              Edit
            </button>
            <button onClick={onAccess}
              style={{ width:"100%", padding:"10px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, color:"#f87171", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
              👤 Access Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [authed, setAuthed] = useState(() => localStorage.getItem('admin_authed') === 'true');
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

  const MAIN_APP_URL = import.meta.env.VITE_MAIN_APP_URL || 'https://app.utilityseo.com';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Auto-load users if already authenticated (e.g. after page refresh)
  useEffect(() => {
    if (authed) loadUsers();
  }, []);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

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
        // If wrong credentials, show error — do NOT let them in
        setErr("Access denied. Invalid credentials.");
        setLoading(false);
        return;
      }

      const creds = { email, password: pass };
      setAdminCreds(creds);
      sessionStorage.setItem('admin_creds', JSON.stringify(creds));
      setAuthed(true);
      localStorage.setItem('admin_authed', 'true');
      loadUsers();
    } catch (error) {
      setErr("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(`${API_URL}/admin/users`);
      const data = await response.json();

      const transformedUsers = data.map(user => ({
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
        plan: user.plan || 'free',
        status: user.is_active === false ? 'deactivated' : 'active',
        joined: user.created_at,
        lastLogin: user.last_login || null,
        searches: user.scans_today || 0,
        tempPlan: user.temp_plan || null,
        tempPlanExpiresAt: user.temp_plan_expires_at || null,
      }));

      setUsers(transformedUsers);
    } catch (error) {
      showToast('Failed to load users', true);
    } finally {
      setLoadingUsers(false);
    }
  };

  const accessAccount = (user) => {
    if (!adminCreds) { showToast('Session expired — please log out and log in again', true); return; }
    // Open the window immediately (same tick as the click) so mobile browsers allow it.
    // We use _self to navigate in the same tab — more reliable on mobile than _blank.
    // Show a loading state on the window while the fetch completes.
    const newWin = window.open('', '_blank') || window;
    const isSameTab = newWin === window;
    if (newWin && !isSameTab) {
      newWin.document.write('<html><body style="background:#0a0a0f;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#818cf8;font-size:15px;">Loading account…</body></html>');
    }
    fetch(`${API_URL}/admin/impersonate/${user.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail: adminCreds.email, adminPassword: adminCreds.password })
    })
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Failed');
        const url = `${MAIN_APP_URL}?impersonate=${encodeURIComponent(data.token)}&as=${encodeURIComponent(user.email)}&plan=${encodeURIComponent(data.user.plan || 'free')}`;
        if (isSameTab) {
          window.location.href = url;
        } else {
          newWin.location.href = url;
        }
      })
      .catch(e => {
        if (!isSameTab) newWin.close();
        showToast(`Error: ${e.message}`, true);
      });
  };

  const updateUser = async (userId, updates) => {
    try {
      // Update permanent plan
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: updates.plan })
      });

      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = await response.json();

      // Handle temp plan — set or revoke
      if (updates.tempPlan && updates.tempDays) {
        const tempRes = await fetch(`${API_URL}/admin/users/${userId}/temp-plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: updates.tempPlan, days: updates.tempDays })
        });
        if (!tempRes.ok) throw new Error('Failed to set temp plan');
        const tempData = await tempRes.json();
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: updatedUser.plan, tempPlan: tempData.temp_plan, tempPlanExpiresAt: tempData.temp_plan_expires_at } : u));
      } else if (updates.revokeTemp) {
        const revokeRes = await fetch(`${API_URL}/admin/users/${userId}/temp-plan`, { method: 'DELETE' });
        if (!revokeRes.ok) throw new Error('Failed to revoke temp plan');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: updatedUser.plan, tempPlan: null, tempPlanExpiresAt: null } : u));
      } else {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: updatedUser.plan } : u));
      }

      showToast(`${updatedUser.email} updated successfully`);
    } catch (error) {
      showToast('Failed to update user', true);
    }
  };

  // ─── TABS ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("users"); // "users" | "promos"

  // ─── PROMO CODES ─────────────────────────────────────────────────────────────
  const [promos, setPromos] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [promoForm, setPromoForm] = useState({ code:"", description:"", trial_plan:"pro", trial_days:"14", max_uses:"", expires_at:"" });
  const [promoFormError, setPromoFormError] = useState("");
  const [savingPromo, setSavingPromo] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null); // promo being edited inline

  const loadPromos = async () => {
    setLoadingPromos(true);
    try {
      const res = await fetch(`${API_URL}/admin/promo-codes`);
      const data = await res.json();
      setPromos(data);
    } catch { showToast("Failed to load promo codes", true); }
    finally { setLoadingPromos(false); }
  };

  const createPromo = async () => {
    setPromoFormError("");
    if (!promoForm.code.trim()) { setPromoFormError("Code is required"); return; }
    if (!promoForm.trial_days || isNaN(promoForm.trial_days) || Number(promoForm.trial_days) < 1) { setPromoFormError("Trial days must be a positive number"); return; }
    setSavingPromo(true);
    try {
      const res = await fetch(`${API_URL}/admin/promo-codes`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          code: promoForm.code.trim().toUpperCase(),
          description: promoForm.description.trim() || null,
          trial_plan: promoForm.trial_plan,
          trial_days: Number(promoForm.trial_days),
          max_uses: promoForm.max_uses ? Number(promoForm.max_uses) : null,
          expires_at: promoForm.expires_at || null,
        })
      });
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
      const res = await fetch(`${API_URL}/admin/promo-codes/${promo.id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ is_active: !promo.is_active })
      });
      const data = await res.json();
      if (!res.ok) { showToast("Failed to update", true); return; }
      setPromos(prev => prev.map(p => p.id === promo.id ? data : p));
    } catch { showToast("Network error", true); }
  };

  const deletePromo = async (id) => {
    if (!window.confirm("Delete this promo code? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_URL}/admin/promo-codes/${id}`, { method:"DELETE" });
      if (!res.ok) { showToast("Failed to delete", true); return; }
      setPromos(prev => prev.filter(p => p.id !== id));
      showToast("Promo code deleted");
    } catch { showToast("Network error", true); }
  };

  // Load promo codes when switching to promos tab
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === "promos" && promos.length === 0) loadPromos();
  };

  // ─── FILTERS & SORT ──────────────────────────────────────────────────────────
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSector, setFilterSector] = useState("all");
  const [filterReferral, setFilterReferral] = useState("all");
  const [filterMarketing, setFilterMarketing] = useState("all");
  const [viewingUser, setViewingUser] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortCol, setSortCol] = useState("joined");
  const [sortDir, setSortDir] = useState("desc");

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const allSectors = [...new Set(users.map(u => u.companySector).filter(Boolean))].sort();
  const allReferrals = [...new Set(users.map(u => u.referralSource).filter(Boolean))].sort();
  const activeFiltersCount = [filterPlan!=="all", filterStatus!=="all", filterSector!=="all", filterReferral!=="all", filterMarketing!=="all", dateFrom, dateTo].filter(Boolean).length;

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      if (q && !u.email.toLowerCase().includes(q) &&
          !(u.firstName+' '+u.lastName).toLowerCase().includes(q) &&
          !(u.companyName||'').toLowerCase().includes(q)) return false;
      if (filterPlan !== "all") {
        if (filterPlan === "trial") { if (!u.tempPlan) return false; }
        else if (u.plan !== filterPlan) return false;
      }
      if (filterStatus !== "all" && u.status !== filterStatus) return false;
      if (filterSector !== "all" && u.companySector !== filterSector) return false;
      if (filterReferral !== "all" && u.referralSource !== filterReferral) return false;
      if (filterMarketing !== "all" && u.marketingConsent !== filterMarketing) return false;
      if (dateFrom && new Date(u.joined) < new Date(dateFrom)) return false;
      if (dateTo) { const t = new Date(dateTo); t.setHours(23,59,59); if (new Date(u.joined) > t) return false; }
      return true;
    })
    .sort((a, b) => {
      let av, bv;
      if (sortCol === "email")     { av = a.email; bv = b.email; }
      else if (sortCol === "plan") { av = a.plan; bv = b.plan; }
      else if (sortCol === "status") { av = a.status; bv = b.status; }
      else if (sortCol === "searches") { av = a.searches; bv = b.searches; }
      else if (sortCol === "joined")   { av = new Date(a.joined); bv = new Date(b.joined); }
      else if (sortCol === "lastLogin") { av = a.lastLogin ? new Date(a.lastLogin) : 0; bv = b.lastLogin ? new Date(b.lastLogin) : 0; }
      else { av = a[sortCol]||""; bv = b[sortCol]||""; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const exportCSV = () => {
    const headers = ["ID","Email","First Name","Last Name","Phone","Company","Sector","Job Role","Referral Source","Plan","Status","Joined","Last Login","Scans Today"];
    const rows = filtered.map(u => [
      u.id, u.email, u.firstName, u.lastName, u.phone,
      u.companyName, u.companySector, u.jobRole, u.referralSource,
      u.plan, u.status,
      u.joined ? new Date(u.joined).toLocaleDateString('en-GB') : '',
      u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-GB') : '',
      u.searches
    ]);
    const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([csv],{type:'text/csv'})),download:`utilityseo-users-${new Date().toISOString().slice(0,10)}.csv`});
    a.click();
  };

  const SortTh = ({ col, label }) => {
    const active = sortCol === col;
    return (
      <span onClick={() => toggleSort(col)} style={{ cursor:"pointer", userSelect:"none", fontSize:11, color: active ? "#818cf8" : "#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", display:"flex", alignItems:"center", gap:3 }}>
        {label} <span style={{ fontSize:9, opacity: active ? 1 : 0.4 }}>{active ? (sortDir==="asc"?"▲":"▼") : "⇅"}</span>
      </span>
    );
  };

  const stats = [
    { label:"Total Users", val: users.length, icon:"👥", col:"#818cf8" },
    { label:"Active", val: users.filter(u=>u.status==="active").length, icon:"✅", col:"#22c55e" },
    { label:"Paid", val: users.filter(u=>u.plan!=="free").length, icon:"💰", col:"#f59e0b" },
    { label:"Temp Access", val: users.filter(u=>u.tempPlan).length, icon:"⏱", col:"#38bdf8" },
  ];

  // ─── LOGIN SCREEN ───────────────────────────────────────────────────────────
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

  // ─── ADMIN DASHBOARD ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#070710", fontFamily:"Sora,sans-serif" }}>
      {toast && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:999, background: toast.isError ? "#ef4444" : "#22c55e", color:"#fff", padding:"12px 20px", borderRadius:12, fontSize:13, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
          {toast.isError ? "✗" : "✓"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background:"#0d0d18", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <img src={LOGO_BASE64} alt="UtilitySEO" style={{ width:32, height:32, borderRadius:8, objectFit:"cover" }} />
          <span style={{ fontSize:16, fontWeight:700 }}>UtilitySEO</span>
          <span style={{ padding:"3px 12px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:99, fontSize:11, fontWeight:700, color:"#ef4444", letterSpacing:"0.05em" }}>SUPER ADMIN</span>
        </div>
        <button onClick={() => { setAuthed(false); setEmail(""); setPass(""); localStorage.removeItem('admin_authed'); }} style={{ padding:"8px 16px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, color:"#ef4444", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>Sign Out</button>
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

        {/* Tab Bar */}
        <div style={{ display:"flex", gap:8, marginBottom:28, borderBottom:"1px solid rgba(255,255,255,0.07)", paddingBottom:0 }}>
          {[{ id:"users", label:"👥 Users" }, { id:"promos", label:"🎟 Promo Codes" }].map(tab => (
            <button key={tab.id} onClick={() => handleTabSwitch(tab.id)}
              style={{ padding:"10px 22px", background: activeTab===tab.id ? "rgba(99,102,241,0.2)" : "transparent", border:"none", borderBottom: activeTab===tab.id ? "2px solid #6366f1" : "2px solid transparent", color: activeTab===tab.id ? "#a5b4fc" : "#64748b", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"Sora,sans-serif", borderRadius:"8px 8px 0 0", marginBottom:-1, transition:"all 0.15s" }}>
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
                onFocus={e => e.target.style.border="1px solid #6366f1"}
                onBlur={e => e.target.style.border="1px solid rgba(255,255,255,0.1)"}
              />
            </div>
            <button onClick={() => setShowFilters(f => !f)}
              style={{ padding:"12px 18px", background: showFilters?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.05)", border:`1px solid ${showFilters?"#6366f1":"rgba(255,255,255,0.1)"}`, borderRadius:14, color: showFilters?"#818cf8":"#94a3b8", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600, display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
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
                    <option value="proPlus">Pro Plus</option>
                    <option value="trial">Trial / Temp access</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Status</label>
                  <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ width:"100%", background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 12px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"Sora,sans-serif", cursor:"pointer" }}>
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="deactivated">Deactivated</option>
                    <option value="suspended">Suspended</option>
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
          <p style={{ color:"#334155", fontSize:12 }}>{filtered.length} of {users.length} users{activeFiltersCount>0?" (filtered)":""}</p>
        </div>

        {/* Users Table */}
        {loadingUsers ? (
          <div style={{ textAlign:"center", padding:60 }}>
            <Spinner />
            <p style={{ color:"#64748b", marginTop:16 }}>Loading users...</p>
          </div>
        ) : (
          <div className="glass" style={{ borderRadius:18, overflow:"hidden" }}>
            {/* Desktop header - hidden on mobile */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 100px 100px 80px 90px 110px 140px", gap:16, padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }} className="desktop-only">
              <SortTh col="email" label="Email" />
              <SortTh col="plan" label="Plan" />
              <SortTh col="status" label="Status" />
              <SortTh col="searches" label="Searches" />
              <SortTh col="joined" label="Joined" />
              <SortTh col="lastLogin" label="Last Seen" />
              <span style={{ fontSize:11, color:"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Actions</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign:"center", padding:60, color:"#334155" }}>No users found</div>
            ) : filtered.map((u, i) => (
              <UserRow key={u.id} u={u} i={i} total={filtered.length} onInfo={() => setViewingUser(u)} onEdit={() => setEditing(u)} onAccess={() => accessAccount(u)} />
            ))}
          </div>
        )}
        </>)}

        {/* ── PROMO CODES TAB ── */}
        {activeTab === "promos" && (
          <div>
            {/* Create new promo code form */}
            <div className="glass" style={{ borderRadius:18, padding:28, marginBottom:28 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#e2e8f0", marginBottom:20 }}>🎟 Create Promo Code</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, marginBottom:16 }}>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Code <span style={{ color:"#ef4444" }}>*</span></label>
                  <input value={promoForm.code} onChange={e => setPromoForm(f=>({...f, code:e.target.value.toUpperCase()}))}
                    placeholder="e.g. LAUNCH50"
                    style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:14, outline:"none", fontFamily:"JetBrains Mono,monospace", boxSizing:"border-box", textTransform:"uppercase" }}
                    onFocus={e=>e.target.style.border="1px solid #6366f1"} onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.1)"} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Trial Plan <span style={{ color:"#ef4444" }}>*</span></label>
                  <select value={promoForm.trial_plan} onChange={e => setPromoForm(f=>({...f, trial_plan:e.target.value}))}
                    style={{ width:"100%", background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"Sora,sans-serif", cursor:"pointer", boxSizing:"border-box" }}>
                    <option value="pro">Pro</option>
                    <option value="proPlus">Pro Plus</option>
                    <option value="free">Free</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Trial Days <span style={{ color:"#ef4444" }}>*</span></label>
                  <input type="number" min="1" value={promoForm.trial_days} onChange={e => setPromoForm(f=>({...f, trial_days:e.target.value}))}
                    placeholder="14"
                    style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:14, outline:"none", fontFamily:"Sora,sans-serif", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.border="1px solid #6366f1"} onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.1)"} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Max Uses <span style={{ color:"#475569", fontSize:10 }}>(blank = unlimited)</span></label>
                  <input type="number" min="1" value={promoForm.max_uses} onChange={e => setPromoForm(f=>({...f, max_uses:e.target.value}))}
                    placeholder="Unlimited"
                    style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:14, outline:"none", fontFamily:"Sora,sans-serif", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.border="1px solid #6366f1"} onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.1)"} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Expiry Date <span style={{ color:"#475569", fontSize:10 }}>(optional)</span></label>
                  <input type="date" value={promoForm.expires_at} onChange={e => setPromoForm(f=>({...f, expires_at:e.target.value}))}
                    style={{ width:"100%", background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:promoForm.expires_at?"#e2e8f0":"#475569", fontSize:13, outline:"none", fontFamily:"Sora,sans-serif", boxSizing:"border-box", colorScheme:"dark" }} />
                </div>
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:6 }}>Description <span style={{ color:"#475569", fontSize:10 }}>(internal note)</span></label>
                  <input value={promoForm.description} onChange={e => setPromoForm(f=>({...f, description:e.target.value}))}
                    placeholder="e.g. Launch campaign — influencer outreach May 2025"
                    style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:14, outline:"none", fontFamily:"Sora,sans-serif", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.border="1px solid #6366f1"} onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.1)"} />
                </div>
              </div>
              {promoFormError && <p style={{ color:"#ef4444", fontSize:13, marginBottom:12 }}>{promoFormError}</p>}
              <button onClick={createPromo} disabled={savingPromo}
                style={{ padding:"11px 28px", background: savingPromo ? "#3730a3" : "#6366f1", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor: savingPromo ? "not-allowed" : "pointer", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                {savingPromo ? <><Spinner /> Creating…</> : "+ Create Code"}
              </button>
            </div>

            {/* Promo codes table */}
            <div className="glass" style={{ borderRadius:18, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"160px 1fr 90px 70px 70px 100px 80px 110px", gap:12, padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                {["Code","Description","Plan","Days","Uses","Max Uses","Expiry","Actions"].map(h => (
                  <span key={h} style={{ fontSize:11, color:"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</span>
                ))}
              </div>
              {loadingPromos ? (
                <div style={{ textAlign:"center", padding:40 }}><Spinner /></div>
              ) : promos.length === 0 ? (
                <div style={{ textAlign:"center", padding:60, color:"#334155" }}>No promo codes yet — create one above</div>
              ) : promos.map((p, i) => (
                <div key={p.id} style={{ display:"grid", gridTemplateColumns:"160px 1fr 90px 70px 70px 100px 80px 110px", gap:12, padding:"14px 20px", borderBottom: i < promos.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems:"center", opacity: p.is_active ? 1 : 0.45 }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:13, fontWeight:700, color: p.is_active ? "#a5b4fc" : "#64748b", letterSpacing:"0.05em" }}>{p.code}</span>
                  <span style={{ fontSize:12, color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.description || "—"}</span>
                  <span style={{ fontSize:12, padding:"3px 8px", borderRadius:6, background: p.trial_plan==="proPlus" ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)", color: p.trial_plan==="proPlus" ? "#f59e0b" : "#818cf8", fontWeight:600, textAlign:"center", display:"inline-block" }}>
                    {p.trial_plan==="proPlus" ? "Pro+" : p.trial_plan==="pro" ? "Pro" : "Free"}
                  </span>
                  <span style={{ fontSize:13, color:"#94a3b8", textAlign:"center" }}>{p.trial_days}d</span>
                  <span style={{ fontSize:13, color:"#94a3b8", textAlign:"center" }}>{p.uses_count}</span>
                  <span style={{ fontSize:13, color:"#94a3b8", textAlign:"center" }}>{p.max_uses ?? "∞"}</span>
                  <span style={{ fontSize:11, color: p.expires_at && new Date(p.expires_at) < new Date() ? "#ef4444" : "#64748b" }}>
                    {p.expires_at ? new Date(p.expires_at).toLocaleDateString("en-GB") : "Never"}
                  </span>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => togglePromoActive(p)}
                      title={p.is_active ? "Deactivate" : "Activate"}
                      style={{ padding:"5px 10px", background: p.is_active ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", border:`1px solid ${p.is_active ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`, borderRadius:7, color: p.is_active ? "#f87171" : "#22c55e", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                      {p.is_active ? "Off" : "On"}
                    </button>
                    <button onClick={() => deletePromo(p.id)}
                      title="Delete permanently"
                      style={{ padding:"5px 10px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:7, color:"#f87171", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Info Modal */}
      {viewingUser && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
          onClick={() => setViewingUser(null)}>
          <div style={{ background:"#0d0d18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:32, maxWidth:560, width:"100%", maxHeight:"88vh", overflowY:"auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:700, color:"#e2e8f0", marginBottom:4 }}>User Info</h2>
                <p style={{ fontSize:13, color:"#475569", fontFamily:"JetBrains Mono,monospace" }}>ID #{viewingUser.id}</p>
              </div>
              <button onClick={() => setViewingUser(null)}
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#94a3b8", fontSize:16, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Sora,sans-serif" }}>✕</button>
            </div>
            {[
              { title:"Account", icon:"👤", rows:[
                ["Email", viewingUser.email],
                ["Plan", viewingUser.plan ? viewingUser.plan.charAt(0).toUpperCase()+viewingUser.plan.slice(1) : "—"],
                ["Status", viewingUser.status],
                ["Joined", viewingUser.joined ? new Date(viewingUser.joined).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" }) : "—"],
                ["Last Login", viewingUser.lastLogin ? new Date(viewingUser.lastLogin).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" }) : "Never"],
                ["Scans Today", viewingUser.searches ?? "—"],
              ]},
              { title:"Personal", icon:"📋", rows:[
                ["First Name", viewingUser.firstName || "—"],
                ["Last Name", viewingUser.lastName || "—"],
                ["Phone", viewingUser.phone || "—"],
              ]},
              { title:"Company", icon:"🏢", rows:[
                ["Company Name", viewingUser.companyName || "—"],
                ["Job Role", viewingUser.jobRole || "—"],
                ["Sector", viewingUser.companySector || "—"],
              ]},
              { title:"Marketing & Acquisition", icon:"📣", rows:[
                ["Heard About Us", viewingUser.referralSource || "—"],
                ["Marketing Consent", viewingUser.marketingConsent],
              ]},
            ].map(section => (
              <div key={section.title} style={{ marginBottom:20 }}>
                <p style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>{section.icon} {section.title}</p>
                <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, overflow:"hidden" }}>
                  {section.rows.map(([label, value], i) => (
                    <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", borderBottom: i < section.rows.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <span style={{ fontSize:13, color:"#475569" }}>{label}</span>
                      <span style={{ fontSize:13, fontWeight:500, textAlign:"right", maxWidth:"60%", wordBreak:"break-all",
                        color: label==="Status" ? (value==="active" ? "#22c55e" : "#94a3b8")
                             : label==="Marketing Consent" ? (value==="Yes" ? "#22c55e" : "#ef4444")
                             : "#e2e8f0" }}>
                        {label==="Marketing Consent" ? (value==="Yes" ? "✅ Opted in" : "❌ Opted out") : String(value ?? "—")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && <EditModal user={editing} onClose={() => setEditing(null)}
        onSave={(updated) => {
          updateUser(updated.id, {
            plan: updated.plan,
            status: updated.status,
            tempPlan: updated.tempPlan,
            tempDays: updated.tempDays,
            revokeTemp: updated.revokeTemp,
          });
          setEditing(null);
        }} />}
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <GlobalStyles />
      <AdminPanel />
    </>
  );
}
