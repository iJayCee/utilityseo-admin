// CapacitySection - where we are against our limits, and what to do as we grow.
// Props carry the App-level state and handlers. Built from the shell's shared
// parts (admin.css + Shell.jsx); the shell's top bar carries the title.
import { Kpi, SkeletonRows } from "../Shell.jsx";

const CapacitySection = ({ capData, capError, capLoading, loadCapacity }) => (
          <div style={{ width:"100%" }}>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:14 }}>
              <button type="button" className="btn btn-primary" onClick={loadCapacity}>↻ Refresh</button>
            </div>

            {capError && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"var(--red)", fontSize:13 }}>{capError}</div>}
            {(capLoading || (!capData && !capError)) && <div className="card"><SkeletonRows rows={5} /></div>}

            {capData && !capLoading && (() => {
              const COL = { ok:"var(--green)", warn:"var(--gold)", critical:"var(--red)" };
              const BG  = { ok:"rgba(52,211,153,0.12)", warn:"rgba(251,191,36,0.12)", critical:"rgba(248,113,113,0.12)" };
              const BORDER = { ok:"rgba(52,211,153,0.35)", warn:"rgba(251,191,36,0.35)", critical:"rgba(248,113,113,0.35)" };
              const overall = capData.overall || "ok";
              const headline = overall === "ok"
                ? "✓ All systems well within limits - no action needed."
                : overall === "warn"
                  ? "One or more metrics are approaching their limit - see the amber items below."
                  : "One or more metrics are at capacity - action recommended now.";
              const fmt = (n) => (n == null ? "-" : Number(n).toLocaleString());
              return (
                <>
                  <div style={{ background:BG[overall], border:`1px solid ${BORDER[overall]}`, borderRadius:12, padding:"14px 18px", marginBottom:20, color:COL[overall], fontSize:14, fontWeight:600 }}>
                    {headline}
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {(capData.meters || []).map(m => (
                      <div key={m.key} className="card" style={{ padding:"16px 18px", borderLeft:`3px solid ${COL[m.status] || "var(--border-strong)"}` }}>
                        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, marginBottom:8, flexWrap:"wrap" }}>
                          <div className="card-title" style={{ fontSize:14 }}>{m.label}</div>
                          <div className="mono" style={{ fontSize:15, fontWeight:800, color:COL[m.status] || "var(--text)" }}>
                            {fmt(m.current)}{m.limit ? <span style={{ color:"var(--muted)", fontWeight:600 }}> / {fmt(m.limit)} {m.unit}</span> : <span style={{ color:"var(--muted)" }}> {m.unit}</span>}
                          </div>
                        </div>
                        {m.pct != null && (
                          <div style={{ height:7, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", marginBottom:8 }}>
                            <div style={{ height:"100%", width:`${Math.max(2, m.pct)}%`, background:COL[m.status] || "var(--purple)", borderRadius:4, transition:"width 0.3s" }} />
                          </div>
                        )}
                        <div style={{ display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                          <div style={{ fontSize:12, color:"var(--muted)" }}>{m.note}{m.pct != null ? `  ·  ${m.pct}% of limit` : ""}</div>
                        </div>
                        {m.status !== "ok" && (
                          <div style={{ fontSize:12.5, color:"var(--text-2)", marginTop:8, paddingTop:8, borderTop:"1px solid var(--border)", lineHeight:1.5 }}>
                            <strong style={{ color:COL[m.status] }}>What to do: </strong>{m.advice}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Static ceilings - context for the "when to upgrade" story */}
                  {capData.limits && (
                    <div style={{ marginTop:22 }}>
                      <p className="label" style={{ marginBottom:10 }}>Fixed limits (per instance)</p>
                      <div className="kpi-grid">
                        {[
                          ["Backend instances", capData.limits.instances, "add replicas to scale"],
                          ["Concurrent requests", capData.limits.requestConcurrency, "processed at once"],
                          ["Request queue", capData.limits.requestQueueMax, "waiting before 503"],
                          ["Rate limit", `${capData.limits.rateLimitPerMin}/min`, "per user"],
                          ["DB pool", capData.limits.dbPoolMax, "connections/instance"],
                        ].map(([label, val, sub]) => (
                          <Kpi key={label} label={label} value={val} sub={sub} />
                        ))}
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize:11, color:"var(--muted)", marginTop:18 }}>Generated {new Date(capData.generatedAt).toLocaleString("en-GB")}</p>
                </>
              );
            })()}
          </div>
);

export default CapacitySection;
