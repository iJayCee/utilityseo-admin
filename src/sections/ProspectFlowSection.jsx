import { Badge, TableScroll } from "../shared.jsx";
// ProspectFlowSection - extracted verbatim from App.jsx (admin split). Behaviour is
// byte-identical to the inline version; props carry the App-level state and
// handlers it used in place. Restyle happens separately.
const ProspectFlowSection = ({ email, loadCodeRevenue, loadProspectFlow, pfCodeFilter, pfData, pfError, pfLoading, pfSearch, pfStatusFilter, setPfCodeFilter, setPfData, setPfSearch, setPfStatusFilter, stats, users }) => (
          <div>
            <div style={{ width:"100%" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:800, color:"#e2e8f0", margin:0 }}>ProspectFlow</h2>
                <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0" }}>Who signed up with a promo code, and what they have paid since</p>
              </div>
              <button onClick={() => { setPfData(null); loadProspectFlow(); }}
                style={{ padding:"9px 20px", background:"#7C3AED", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
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
                if (pfSearch && !`${u.email} ${u.first_name} ${u.last_name} ${u.company_name||""}`.toLowerCase().includes(pfSearch.toLowerCase())) return false;
                return true;
              });
              const byCode = {};
              for (const u of pfData.users) {
                const code = u.promo_code_used || "none";
                if (!byCode[code]) byCode[code] = { signups:0, paying:0, totalRevenue:0 };
                byCode[code].signups++;
                if (u.first_payment) { byCode[code].paying++; byCode[code].totalRevenue += u.total_paid; }
              }
              const totalPaying = pfData.users.filter(u => u.first_payment).length;
              return (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:16, marginBottom:28 }}>
                    {[
                      { label:"Total Signups", val:pfData.users.length, col:"#a78bfa" },
                      { label:"Now Paying", val:totalPaying, col:"#34d399" },
                      { label:"Revenue", val:`£${pfData.users.reduce((a,u)=>a+(u.total_paid||0),0).toFixed(2)}`, col:"#34d399" },
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
                        style={{ background:"#13131F", border:`1px solid ${pfCodeFilter===code?"#7C3AED":"rgba(255,255,255,0.07)"}`, borderRadius:12, padding:"14px 18px", cursor:"pointer", minWidth:180 }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                          <span style={{ fontSize:14, fontWeight:800, color:"#e2e8f0", fontFamily:"JetBrains Mono,monospace" }}>{code}</span>
                          <span style={{ fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:99, background:"rgba(124,58,237,0.15)", color:"#a78bfa" }}>{stats.signups} signup{stats.signups!==1?"s":""}</span>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 12px" }}>
                          <div style={{ fontSize:12, color:"#64748b" }}>Paying: <span style={{ color:"#34d399", fontWeight:700 }}>{stats.paying}</span></div>
                          <div style={{ fontSize:12, color:"#64748b" }}>Revenue: <span style={{ color:"#e2e8f0", fontWeight:600 }}>£{stats.totalRevenue.toFixed(0)}</span></div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); loadCodeRevenue(code); }}
                          style={{ marginTop:12, width:"100%", padding:"7px 0", background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:8, color:"#a78bfa", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                          Revenue breakdown
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <input value={pfSearch} onChange={e => setPfSearch(e.target.value)} placeholder="Search email, name or company..."
                        style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 14px", color:"#e2e8f0", fontSize:13, fontFamily:"Sora,sans-serif", outline:"none" }} />
                      <select value={pfCodeFilter} onChange={e => setPfCodeFilter(e.target.value)}
                        style={{ background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.35)", borderRadius:10, padding:"9px 14px", color:"#a78bfa", fontSize:13, fontWeight:700, fontFamily:"Sora,sans-serif", cursor:"pointer", outline:"none", minWidth:200 }}>
                        <option value="all" style={{ background:"#13131F", color:"#e2e8f0" }}>All codes ({pfData.users.length})</option>
                        {codes.filter(cd => cd !== "all").map(code => (
                          <option key={code} value={code} style={{ background:"#13131F", color:"#e2e8f0" }}>{code} - {byCode[code]?.signups||0} signups</option>
                        ))}
                      </select>
                      <span style={{ fontSize:12, color:"#475569", whiteSpace:"nowrap" }}>{filtered.length} result{filtered.length!==1?"s":""}</span>
                    </div>
                    <div style={{ display:"flex", gap:0, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, overflow:"hidden", width:"fit-content" }}>
                      {[
                        { id:"all",      label:"All signups",         activeCol:"#a78bfa", activeBg:"rgba(124,58,237,0.2)" },
                        { id:"paying",   label:"✓ Paying",            activeCol:"#34d399", activeBg:"rgba(52,211,153,0.15)" },
                        { id:"free",     label:"Not yet paying",      activeCol:"#f87171", activeBg:"rgba(248,113,113,0.15)" },
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
                  {/* 650px of fixed columns, so on a phone the flexible User
                      column collapses and the row is on screen but unreadable.
                      Header and rows share ONE scroller so they cannot drift
                      apart. Inert above ~700px. */}
                  <div style={{ background:"#13131F", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, overflow:"hidden" }}>
                    <TableScroll min={700}>
                    <div style={{ display:"grid", gridTemplateColumns:"2.5fr 130px 90px 110px 120px 90px", padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)" }}>
                      {["User","Code","Plan","Signed Up","First Payment","Revenue"].map(h => (
                        <div key={h} style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</div>
                      ))}
                    </div>
                    {filtered.length === 0 ? (
                      <div style={{ padding:"40px", textAlign:"center", color:"#475569", fontSize:13 }}>No results match your filters</div>
                    ) : filtered.map((u, i) => {
                      const isPaying = !!u.first_payment;
                      return (
                        <div key={u.id} style={{ display:"grid", gridTemplateColumns:"2.5fr 130px 90px 110px 120px 90px", padding:"13px 20px",
                          borderBottom:i<filtered.length-1?"1px solid rgba(255,255,255,0.04)":"none",
                          background:"transparent" }}>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0" }}>{u.email}</div>
                            <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{[u.first_name,u.last_name].filter(Boolean).join(" ")||u.company_name||"-"}</div>
                          </div>
                          <div style={{ fontSize:12, fontFamily:"JetBrains Mono,monospace", color:"#a78bfa", fontWeight:700, alignSelf:"center" }}>{u.promo_code_used}</div>
                          <div style={{ alignSelf:"center" }}>
                            <Badge plan={u.plan} />
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
                        </div>
                      );
                    })}
                    </TableScroll>
                  </div>
                </div>
              );
            })()}
            </div>{/* end max-width wrapper */}
          </div>
);

export default ProspectFlowSection;
