// MonitoringSection - extracted verbatim from App.jsx (admin split). Behaviour is
// byte-identical to the inline version; props carry the App-level state and
// handlers it used in place. Restyle happens separately.
const MonitoringSection = ({ loadMonitoring, monData, monError, monLoading, stats }) => (
          <div style={{ width:"100%" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:800, color:"#e2e8f0", margin:0 }}>🩺 Monitoring</h2>
                <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0" }}>System health, business stats and captured backend errors</p>
              </div>
              <button onClick={loadMonitoring}
                style={{ padding:"9px 20px", background:"#7C3AED", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
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
                    {/* Build = the commit actually RUNNING. Amber once it's a week
                        old: if you've pushed since and this hasn't changed, deploys
                        are failing silently (this exact failure went unnoticed for
                        5 days in Jul 2026 - npm ci broke on every Railway build). */}
                    {card("Build", h.commit ? `${h.commit} · ${fmtUptime(h.uptime_s)} old` : "—", (h.uptime_s || 0) > 7 * 86400 ? "#fbbf24" : "#e2e8f0")}
                  </div>
                  {(h.uptime_s || 0) > 7 * 86400 && (
                    <p style={{ fontSize:12, color:"#fbbf24", margin:"0 0 16px" }}>
                      The running build is over a week old. If you have pushed backend changes since, check Railway - deploys may be failing silently.
                    </p>
                  )}

                  {/* Business stats */}
                  {s && (
                    <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:16 }}>
                      {card("Users", s.users_total)}
                      {card("Active", s.users_active)}
                      {card("Signups 7d", s.signups_7d, "#a78bfa")}
                      {card("Errors 1h", s.errors_1h, s.errors_1h > 0 ? "#f87171" : "#34d399")}
                      {card("Errors 24h", s.errors_24h, s.errors_24h > 0 ? "#fbbf24" : "#34d399")}
                    </div>
                  )}

                  {/* Plan breakdown */}
                  {s && s.plans && s.plans.length > 0 && (
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
                      {s.plans.map(p => (
                        <span key={p.plan} style={{ background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:99, padding:"5px 12px", fontSize:12, color:"#a78bfa", fontFamily:"JetBrains Mono,monospace" }}>
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
);

export default MonitoringSection;
