// CapacitySection - extracted verbatim from App.jsx (admin split). Behaviour is
// byte-identical to the inline version; props carry the App-level state and
// handlers it used in place. Restyle happens separately.
const CapacitySection = ({ capData, capError, capLoading, loadCapacity }) => (
          <div style={{ width:"100%" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:800, color:"#e2e8f0", margin:0 }}>📊 Capacity</h2>
                <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0" }}>Where we are against our limits, and what to do as we grow</p>
              </div>
              <button onClick={loadCapacity}
                style={{ padding:"9px 20px", background:"#7C3AED", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                ↻ Refresh
              </button>
            </div>

            {capError && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#f87171", fontSize:13 }}>{capError}</div>}
            {capLoading && <div style={{ textAlign:"center", padding:"60px 20px", color:"#64748b", fontSize:14 }}>Loading capacity data…</div>}

            {capData && !capLoading && (() => {
              const COL = { ok:"#34d399", warn:"#fbbf24", critical:"#f87171" };
              const BG  = { ok:"rgba(52,211,153,0.12)", warn:"rgba(251,191,36,0.12)", critical:"rgba(248,113,113,0.12)" };
              const overall = capData.overall || "ok";
              const headline = overall === "ok"
                ? "✓ All systems well within limits - no action needed."
                : overall === "warn"
                  ? "⚠ One or more metrics are approaching their limit - see the amber items below."
                  : "🔴 One or more metrics are at capacity - action recommended now.";
              const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString());
              return (
                <>
                  <div style={{ background:BG[overall], border:`1px solid ${COL[overall]}55`, borderRadius:12, padding:"14px 18px", marginBottom:20, color:COL[overall], fontSize:14, fontWeight:600 }}>
                    {headline}
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {(capData.meters || []).map(m => (
                      <div key={m.key} className="glass" style={{ borderRadius:14, padding:"16px 18px", borderLeft:`3px solid ${COL[m.status]}` }}>
                        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, marginBottom:8, flexWrap:"wrap" }}>
                          <div style={{ fontSize:14, fontWeight:700, color:"#e2e8f0" }}>{m.label}</div>
                          <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:15, fontWeight:800, color:COL[m.status] }}>
                            {fmt(m.current)}{m.limit ? <span style={{ color:"#475569", fontWeight:600 }}> / {fmt(m.limit)} {m.unit}</span> : <span style={{ color:"#475569" }}> {m.unit}</span>}
                          </div>
                        </div>
                        {m.pct != null && (
                          <div style={{ height:7, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", marginBottom:8 }}>
                            <div style={{ height:"100%", width:`${Math.max(2, m.pct)}%`, background:COL[m.status], borderRadius:4, transition:"width 0.3s" }} />
                          </div>
                        )}
                        <div style={{ display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                          <div style={{ fontSize:12, color:"#64748b" }}>{m.note}{m.pct != null ? `  ·  ${m.pct}% of limit` : ""}</div>
                        </div>
                        {m.status !== "ok" && (
                          <div style={{ fontSize:12.5, color:"#cbd5e1", marginTop:8, paddingTop:8, borderTop:"1px solid rgba(255,255,255,0.06)", lineHeight:1.5 }}>
                            <strong style={{ color:COL[m.status] }}>What to do: </strong>{m.advice}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Static ceilings - context for the "when to upgrade" story */}
                  {capData.limits && (
                    <div style={{ marginTop:22 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>Fixed limits (per instance)</div>
                      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                        {[
                          ["Backend instances", capData.limits.instances, "add replicas to scale"],
                          ["Concurrent requests", capData.limits.requestConcurrency, "processed at once"],
                          ["Request queue", capData.limits.requestQueueMax, "waiting before 503"],
                          ["Rate limit", `${capData.limits.rateLimitPerMin}/min`, "per user"],
                          ["DB pool", capData.limits.dbPoolMax, "connections/instance"],
                        ].map(([label, val, sub]) => (
                          <div key={label} className="glass" style={{ borderRadius:12, padding:"12px 16px", flex:"1 1 150px", minWidth:150 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:5 }}>{label}</div>
                            <div style={{ fontSize:20, fontWeight:800, color:"#e2e8f0", fontFamily:"JetBrains Mono,monospace" }}>{val}</div>
                            <div style={{ fontSize:11, color:"#64748b", marginTop:3 }}>{sub}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize:11, color:"#475569", marginTop:18 }}>Generated {new Date(capData.generatedAt).toLocaleString("en-GB")}</p>
                </>
              );
            })()}
          </div>
);

export default CapacitySection;
