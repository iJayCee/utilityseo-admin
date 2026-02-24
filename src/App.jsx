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

const UserRow = ({ u, i, total, onEdit }) => {
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
        style={{ gridTemplateColumns:"2fr 100px 100px 80px 80px 100px", gap:16, padding:"16px 20px", alignItems:"center" }}
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
        <span style={{ fontSize:11, color:"#475569" }}>{new Date(u.joined).toLocaleDateString()}</span>
        <button onClick={onEdit}
          style={{ padding:"6px 14px", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:8, color:"#818cf8", fontSize:12, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
          Edit
        </button>
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
              <span style={{ fontSize:11, color:"#475569" }}>{new Date(u.joined).toLocaleDateString()}</span>
            </div>
            <button onClick={onEdit}
              style={{ width:"100%", padding:"10px", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:8, color:"#818cf8", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif", fontWeight:600 }}>
              Edit
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
        plan: user.plan || 'free',
        status: 'active',
        joined: user.created_at,
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

  const filtered = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));

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
            {/* Desktop header - hidden on mobile */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 100px 100px 80px 80px 100px", gap:16, padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }} className="desktop-only">
              {["Email","Plan","Status","Searches","Joined","Actions"].map(h => (
                <span key={h} style={{ fontSize:11, color:"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign:"center", padding:60, color:"#334155" }}>No users found</div>
            ) : filtered.map((u, i) => (
              <UserRow key={u.id} u={u} i={i} total={filtered.length} onEdit={() => setEditing(u)} />
            ))}
          </div>
        )}
      </div>

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
