// MonitoringSection - system health, business stats and captured backend
// errors. Props carry the App-level state and handlers. Built from the
// shell's shared parts; the shell's top bar carries the title.
import { EmptyState, Kpi, KpiSkeleton } from "../Shell.jsx";

const MonitoringSection = ({ loadMonitoring, monData, monError, monLoading, stats }) => (
          <div style={{ width:"100%" }}>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:14 }}>
              <button type="button" className="btn btn-primary" onClick={loadMonitoring}>↻ Refresh</button>
            </div>

            {monError && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"var(--red)", fontSize:13 }}>{monError}</div>}
            {(monLoading || (!monData && !monError)) && <KpiSkeleton n={5} />}

            {monData && !monLoading && (() => {
              const h = monData.health || {};
              const s = monData.stats;
              const errors = monData.errors || [];
              const alerts = monData.alerts || [];
              const fmtUptime = (sec) => { if (sec == null) return "-"; const d=Math.floor(sec/86400), hr=Math.floor((sec%86400)/3600), m=Math.floor((sec%3600)/60); return d>0?`${d}d ${hr}h`:hr>0?`${hr}h ${m}m`:`${m}m`; };
              const dbOk = h.db === "connected";
              const stale = (h.uptime_s || 0) > 7 * 86400;
              const lvlColor = (lvl) => lvl === "error" ? "var(--red)" : lvl === "warn" ? "var(--gold)" : "var(--text-2)";
              return (
                <>
                  {/* Health */}
                  <div className="kpi-grid" style={{ marginBottom:16 }}>
                    <Kpi label="Database" value={dbOk ? "● Connected" : "● Down"} tone={dbOk ? "green" : "red"} />
                    <Kpi label="Uptime" value={fmtUptime(h.uptime_s)} />
                    <Kpi label="Memory" value={h.memory_mb ? `${h.memory_mb.heap_used} / ${h.memory_mb.heap_total} MB` : "-"} />
                    <Kpi label="DB Pool" value={h.pool ? `${h.pool.idle}/${h.pool.total} idle` : "-"} tone={h.pool && h.pool.waiting > 0 ? "gold" : "text"} />
                    {/* Build = the commit actually RUNNING. Amber once it's a week
                        old: if you've pushed since and this hasn't changed, deploys
                        are failing silently (this exact failure went unnoticed for
                        5 days in Jul 2026 - npm ci broke on every Railway build). */}
                    <Kpi label="Build" value={h.commit ? `${h.commit} · ${fmtUptime(h.uptime_s)} old` : "-"} tone={stale ? "gold" : "text"} />
                  </div>
                  {stale && (
                    <p style={{ fontSize:12, color:"var(--gold)", margin:"0 0 16px" }}>
                      The running build is over a week old. If you have pushed backend changes since, check Railway - deploys may be failing silently.
                    </p>
                  )}

                  {/* Business stats */}
                  {s && (
                    <div className="kpi-grid" style={{ marginBottom:16 }}>
                      <Kpi label="Users" value={s.users_total} />
                      <Kpi label="Active" value={s.users_active} />
                      <Kpi label="Signups 7d" value={s.signups_7d} tone="purple" />
                      <Kpi label="Errors 1h" value={s.errors_1h} tone={s.errors_1h > 0 ? "red" : "green"} />
                      <Kpi label="Errors 24h" value={s.errors_24h} tone={s.errors_24h > 0 ? "gold" : "green"} />
                    </div>
                  )}

                  {/* Plan breakdown */}
                  {s && s.plans && s.plans.length > 0 && (
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
                      {s.plans.map(p => (
                        <span key={p.plan} className="pill pill-purple mono" style={{ fontSize:12, padding:"5px 12px" }}>
                          {p.plan}: <strong style={{ color:"var(--text)" }}>{p.count}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Recent errors */}
                  <div className="card" style={{ marginBottom:20 }}>
                    <p className="label" style={{ marginBottom:12 }}>Recent Errors ({errors.length})</p>
                    {errors.length === 0 ? (
                      <div style={{ color:"var(--green)", fontSize:13, padding:"8px 0" }}>✓ No errors logged. All clear.</div>
                    ) : (
                      <div className="scroll-x">
                        <table className="tbl mono" style={{ fontSize:12 }}>
                          <thead>
                            <tr>
                              <th>Time</th>
                              <th>Level</th>
                              <th>Source</th>
                              <th>Message</th>
                              <th>Path</th>
                            </tr>
                          </thead>
                          <tbody>
                            {errors.map(e => (
                              <tr key={e.id} style={{ color:"var(--text-2)" }}>
                                <td style={{ whiteSpace:"nowrap" }}>{new Date(e.created_at).toLocaleString()}</td>
                                <td style={{ color:lvlColor(e.level), fontWeight:700 }}>{e.level}</td>
                                <td>{e.source || "-"}</td>
                                <td style={{ color:"var(--text)", maxWidth:360, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={e.message}>{e.message}</td>
                                <td>{e.method ? `${e.method} ${e.path || ""}` : "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Recent alerts */}
                  <div className="card">
                    <p className="label" style={{ marginBottom:12 }}>Recent User Alerts ({alerts.length})</p>
                    {alerts.length === 0 ? (
                      <EmptyState title="No alerts triggered" text="Rank and traffic alerts users have set up show here when they fire." />
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {alerts.map(a => (
                          <div key={a.id} className="mono" style={{ display:"flex", gap:12, fontSize:12, color:"var(--text-2)", borderTop:"1px solid var(--border)", paddingTop:8 }}>
                            <span style={{ whiteSpace:"nowrap", color:"var(--muted)" }}>{a.triggered_at ? new Date(a.triggered_at).toLocaleDateString() : ""}</span>
                            <span style={{ color:"var(--gold)", fontWeight:700 }}>{a.alert_type}</span>
                            <span style={{ color:"var(--text)" }}>{a.site}</span>
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
