// UpgradesSection - paid APIs and infrastructure worth buying, and when each
// starts paying for itself. Props carry the App-level state and handlers.
// Built from the shell's shared parts; the shell's top bar carries the title.
import { Kpi, SkeletonRows } from "../Shell.jsx";

const UpgradesSection = ({ loadUpgrades, upgData, upgError, upgLoading, users }) => (
          <div style={{ width:"100%" }}>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:14 }}>
              <button type="button" className="btn btn-primary" onClick={loadUpgrades}>↻ Refresh</button>
            </div>

            {upgError && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"var(--red)", fontSize:13 }}>{upgError}</div>}
            {(upgLoading || (!upgData && !upgError)) && <div className="card"><SkeletonRows rows={5} /></div>}

            {upgData && !upgLoading && (() => {
              const s = upgData.signals || {};
              const statusOf = (it) => it.done ? "done" : it.triggerMet ? "now" : "later";
              const META = {
                now:   { col:"var(--green)", bg:"rgba(52,211,153,0.06)", pill:"pill-green",  chip:"Recommended now" },
                later: { col:"var(--muted)", bg:"var(--card)",           pill:"pill-grey",   chip:"Later" },
                done:  { col:"var(--purple-text)", bg:"rgba(124,58,237,0.06)", pill:"pill-purple", chip:"✓ Done" },
              };
              return (
                <>
                  {/* Live signals the triggers are based on */}
                  <div className="kpi-grid" style={{ marginBottom:20 }}>
                    <Kpi label="Paying customers" value={s.payingCustomers ?? "-"} tone="green" />
                    <Kpi label="Total users" value={s.totalUsers ?? "-"} />
                    <Kpi label="Scans (7 days)" value={s.scansLast7Days ?? "-"} />
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    {(upgData.items || []).map(it => {
                      const st = statusOf(it);
                      const m = META[st];
                      return (
                        <div key={it.id} className="card" style={{ borderLeft:`3px solid ${m.col}`, background:m.bg }}>
                          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:6 }}>
                            <div style={{ display:"flex", alignItems:"baseline", gap:10, flexWrap:"wrap" }}>
                              <span className="label">{it.category}</span>
                              <span style={{ fontSize:16, fontWeight:800, color:"var(--text)" }}>{it.name}</span>
                            </div>
                            <span className={`pill ${m.pill}`}>{m.chip}</span>
                          </div>
                          <p style={{ fontSize:13, color:"var(--text-2)", lineHeight:1.55, margin:"0 0 12px" }}>{it.unlocks}</p>

                          <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:12 }}>
                            {(it.providers || []).map(p => (
                              <div key={p.name} style={{ display:"flex", gap:10, alignItems:"baseline", flexWrap:"wrap", padding:"7px 12px", background:"rgba(255,255,255,0.03)", borderRadius:9 }}>
                                <span style={{ fontSize:13, fontWeight:700, color: p.name === it.recommended ? "var(--purple-text)" : "var(--text)", minWidth:150 }}>
                                  {p.name}{p.name === it.recommended && <span style={{ fontSize:10, color:"var(--purple-text)", marginLeft:6 }}>◆ pick</span>}
                                </span>
                                <span className="mono" style={{ fontSize:12, fontWeight:600, color:"var(--text-2)" }}>{p.cost}</span>
                                <span style={{ fontSize:11.5, color:"var(--muted)" }}>{p.note}</span>
                              </div>
                            ))}
                          </div>

                          <div style={{ fontSize:12.5, color: st === "now" ? m.col : "var(--muted)" }}>
                            <strong>{it.done ? "Status: " : "Buy when: "}</strong>
                            {it.done ? "Already configured ✓" : it.buyWhen}
                            {st === "now" && !it.done && <span style={{ marginLeft:8, fontWeight:700 }}>← trigger met</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ fontSize:11, color:"var(--muted)", marginTop:18, lineHeight:1.5 }}>
                    Pricing is approximate (early 2026) and should be re-checked before buying - vendors change plans often. Generated {new Date(upgData.generatedAt).toLocaleString("en-GB")}
                  </p>
                </>
              );
            })()}
          </div>
);

export default UpgradesSection;
