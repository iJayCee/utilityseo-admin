// ==========================================================
// COMPLETE ADMIN PANEL WITH LOGO - COPY THIS ENTIRE FILE
// ==========================================================

// STEP 1: Add this constant at the TOP of your App.jsx (after imports):

const LOGO_BASE64 = "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCABBAEEDASIAAhEBAxEB/8QAHAAAAgMBAQEBAAAAAAAAAAAAAAQCAwUGAQcI/8QALhAAAgIBAgQEBgEFAAAAAAAAAAECAwQRYQUSMVEGcXKxFCEjJDSRQVJTYpKh/8QAGgEAAgMBAQAAAAAAAAAAAAAAAgQDBQYBB//EACoRAAICAgEBBgYDAAAAAAAAAAABAgMEERIhBRMUMVFxIjIzNEFhUpHB/9oADAMBAAIRAxEAPwD8jQqSrjol0B1rshmEPpx8kDgazwy4roOcBN1rsRcF2G3AawuDcSzo82Jg5F0f6owfL++hD4NzeorbOcDHdexFw2N3M8PcZxa3ZfwzKjBLVyVbaXm10MpwF7cKUHqUdAOGhRwIuA24EHATnjAOIrygXcoC/cA8Tcqh9KHpQOAxTD6FfpXsShWpWRT6NrU9A8PqCf6LLj0NrwvwfHcY5udBWa/OuuXTTu+50lOWkko6JL5JL+Dk6ctJJJ6JDdWZuS42VCpaiDGejraszc5vxh4axOJ0TzMGqFObFczUVordmu+/7JVZm41Vmbjtl9eTDhYtoNyUlpnyeVbTaa0aK3A3/FOPCvjeQ4LSNjU0t2tX/wB1MlwMtbi8ZNC7gIcoF/KBW9wR8Tfoh9vX6F7HsoNJtdS/Hh9tV6F7EnA9HWKpVpeqLPhtCFWZuNVZm5l8VxbaZPIpi5Qfzkl1W/kJVZm5gMmVuFc6ren+r1RWT5Vy0zrKszcaqzNzk6szcexrrJx5lrp3GcTJndNQh1YUJOT0izjNnxGdOfVJKP6EHAclAg4F9LGf5GuBmcoF3KBUdwQ8To8WH2tXoj7EnAtwVGeDRODUouuOjXkWOB6dXj7qi16ItlHohNwE8jhmHdLmnjx5n1a1jr+jVcCDgLZGBXcuNkU1+1sGVal5oyquGYlT1jSm/wDJt+5e4LsOOBBwFIdn1UrVcFH2WgFUo+SFHAg4DjgQcCOeMccTI5QD4jF/v1/7AZrdX8l/aFPh9RTgn4K9THWAC/Z/2tfsga/kRFnjABhhHhFgBEzjPGU5f49npYALX/Tl7MCXkzBAAMGVx//Z";


// STEP 2: Replace your entire AdminPanel component with this:

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

  const showToast = (msg) => { 
    setToast(msg); 
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
      
      const transformedUsers = data.map(user => ({
        id: user.id.toString(),
        email: user.email,
        plan: user.plan || 'free',
        status: 'active',
        joined: user.created_at,
        searches: 0,
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
          <p style={{ textAlign:"center", color:"#334155", fontSize:11, marginTop:16 }}>Hint: admin@utilityseo.com / admin123</p>
        </div>
        <button onClick={onBack} style={{ display:"block", margin:"20px auto 0", background:"none", border:"none", color:"#334155", cursor:"pointer", fontSize:13, fontFamily:"Sora,sans-serif" }}>← Back to main site</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#070710", fontFamily:"Sora,sans-serif" }}>
      {toast && <div style={{ position:"fixed", top:20, right:20, zIndex:999, background:"#22c55e", color:"#fff", padding:"12px 20px", borderRadius:12, fontSize:13, fontWeight:600, boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>✓ {toast}</div>}

      <div style={{ background:"#0d0d18", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <img src={LOGO_BASE64} alt="UtilitySEO" style={{ width:32, height:32, borderRadius:8, objectFit:"cover" }} />
          <span style={{ fontSize:16, fontWeight:700 }}>UtilitySEO</span>
          <span style={{ padding:"3px 12px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:99, fontSize:11, fontWeight:700, color:"#ef4444", letterSpacing:"0.05em" }}>SUPER ADMIN</span>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <button onClick={onBack} style={{ padding:"8px 16px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:"#94a3b8", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>← Main Site</button>
          <button onClick={() => setAuthed(false)} style={{ padding:"8px 16px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, color:"#ef4444", fontSize:13, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ padding:"32px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32 }}>
          {stats.map(s => (
            <div key={s.label} className="glass" style={{ borderRadius:16, padding:20 }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:32, fontWeight:800, color:s.col }}>{s.val}</div>
              <div style={{ fontSize:13, color:"#475569", marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

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

        {loadingUsers ? (
          <div style={{ textAlign:"center", padding:60 }}>
            <Spinner />
            <p style={{ color:"#64748b", marginTop:16 }}>Loading users...</p>
          </div>
        ) : (
          <div className="glass" style={{ borderRadius:18, overflow:"hidden" }}>
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
