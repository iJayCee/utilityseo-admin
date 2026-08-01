// PromosSection - extracted verbatim from App.jsx (admin split). Behaviour is
// byte-identical to the inline version; props carry the App-level state and
// handlers it used in place. Restyle happens as a separate pass.
const PromosSection = ({ createPromo, deletePromo, email, expandedPromo, loadPromoSignups, loading, loadingPromos, plan, promoForm, promoFormError, promoSignups, promos, savingPromo, setPromoForm, stats, togglePromoActive, users }) => (
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
                    <option value="enterprise">Enterprise</option>
                    <option value="entrepreneur">Entrepreneur</option>
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
                    <span style={{ fontSize:12, padding:"3px 8px", borderRadius:6, background:planMeta(p.trial_plan).bg, color:planMeta(p.trial_plan).color, fontWeight:600 }}>
                      {planShort(p.trial_plan)}
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
                                const isPaid = u.plan && u.plan !== 'free';
                                const isTrialActive = u.temp_plan && u.temp_plan_expires_at && new Date(u.temp_plan_expires_at) > new Date();
                                return (
                                  <div key={u.id} style={{ display:"grid", gridTemplateColumns:"1fr 120px 120px 140px", gap:10, padding:"10px 14px", borderBottom:ui<ps.data.users.length-1?"1px solid rgba(255,255,255,0.04)":"none", alignItems:"center" }}>
                                    <span style={{ fontSize:12, color:"#e2e8f0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"JetBrains Mono,monospace" }}>{u.email}</span>
                                    <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:isPaid?"rgba(34,197,94,0.1)":isTrialActive?"rgba(245,158,11,0.1)":"rgba(255,255,255,0.04)", color:isPaid?"#22c55e":isTrialActive?"#f59e0b":"#64748b", fontWeight:600, width:"fit-content" }}>
                                      {isPaid ? planLabel(u.plan) : isTrialActive ? `Trial (${planShort(u.temp_plan)})` : "Free"}
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
);

export default PromosSection;
