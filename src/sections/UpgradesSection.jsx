// UpgradesSection - extracted verbatim from App.jsx (admin split). Behaviour is
// byte-identical to the inline version; props carry the App-level state and
// handlers it used in place. Restyle happens separately.
const UpgradesSection = ({ loadUpgrades, upgData, upgError, upgLoading, users }) => (
          <div style={{ width:"100%" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:800, color:"#e2e8f0", margin:0 }}>🛒 Upgrades</h2>
                <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0" }}>Paid APIs and infrastructure worth buying, and when each starts paying for itself</p>
              </div>
              <button onClick={loadUpgrades}
                style={{ padding:"9px 20px", background:"#7C3AED", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                ↻ Refresh
              </button>
            </div>

            {upgError && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#f87171", fontSize:13 }}>{upgError}</div>}
            {upgLoading && <div style={{ textAlign:"center", padding:"60px 20px", color:"#64748b", fontSize:14 }}>Loading upgrades…</div>}

            {upgData && !upgLoading && (() => {
              const s = upgData.signals || {};
              const statusOf = (it) => it.done ? "done" : it.triggerMet ? "now" : "later";
              const META = {
                now:   { col:"#34d399", bg:"rgba(52,211,153,0.10)", chip:"Recommended now" },
                later: { col:"#64748b", bg:"rgba(100,116,139,0.08)", chip:"Later" },
                done:  { col:"#a78bfa", bg:"rgba(129,140,248,0.10)", chip:"✓ Done" },
              };
              return (
                <>
                  {/* Live signals the triggers are based on */}
                  <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:20 }}>
                    {[
                      ["Paying customers", s.payingCustomers, "#34d399"],
                      ["Total users", s.totalUsers, "#e2e8f0"],
                      ["Scans (7 days)", s.scansLast7Days, "#e2e8f0"],
                    ].map(([label, val, col]) => (
                      <div key={label} className="glass" style={{ borderRadius:12, padding:"12px 16px", flex:"1 1 150px", minWidth:150 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:5 }}>{label}</div>
                        <div style={{ fontSize:22, fontWeight:800, color:col, fontFamily:"JetBrains Mono,monospace" }}>{val ?? "-"}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    {(upgData.items || []).map(it => {
                      const st = statusOf(it);
                      const m = META[st];
                      return (
                        <div key={it.id} className="glass" style={{ borderRadius:14, padding:"18px 20px", borderLeft:`3px solid ${m.col}`, background:m.bg }}>
                          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:6 }}>
                            <div style={{ display:"flex", alignItems:"baseline", gap:10, flexWrap:"wrap" }}>
                              <span style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>{it.category}</span>
                              <span style={{ fontSize:16, fontWeight:800, color:"#e2e8f0" }}>{it.name}</span>
                            </div>
                            <span style={{ fontSize:11, fontWeight:700, color:m.col, background:`${m.col}1f`, border:`1px solid ${m.col}55`, borderRadius:99, padding:"3px 11px", whiteSpace:"nowrap" }}>{m.chip}</span>
                          </div>
                          <p style={{ fontSize:13, color:"#cbd5e1", lineHeight:1.55, margin:"0 0 12px" }}>{it.unlocks}</p>

                          <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:12 }}>
                            {(it.providers || []).map(p => (
                              <div key={p.name} style={{ display:"flex", gap:10, alignItems:"baseline", flexWrap:"wrap", padding:"7px 12px", background:"rgba(255,255,255,0.03)", borderRadius:9 }}>
                                <span style={{ fontSize:13, fontWeight:700, color: p.name === it.recommended ? "#a78bfa" : "#e2e8f0", minWidth:150 }}>
                                  {p.name}{p.name === it.recommended && <span style={{ fontSize:10, color:"#a78bfa", marginLeft:6 }}>◆ pick</span>}
                                </span>
                                <span style={{ fontSize:12, fontWeight:600, color:"#94a3b8", fontFamily:"JetBrains Mono,monospace" }}>{p.cost}</span>
                                <span style={{ fontSize:11.5, color:"#64748b" }}>{p.note}</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ fontSize:12.5, color: st === "now" ? m.col : "#64748b" }}>
                            <strong>{it.done ? "Status: " : "Buy when: "}</strong>
                            {it.done ? "Already configured ✓" : it.buyWhen}
                            {st === "now" && !it.done && <span style={{ marginLeft:8, fontWeight:700 }}>← trigger met</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ fontSize:11, color:"#475569", marginTop:18, lineHeight:1.5 }}>
                    Pricing is approximate (early 2026) and should be re-checked before buying - vendors change plans often. Generated {new Date(upgData.generatedAt).toLocaleString("en-GB")}
                  </p>
                </>
              );
            })()}
          </div>
);

export default UpgradesSection;
