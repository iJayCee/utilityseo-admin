import { planMeta, planLabel, planShort } from "../shared.jsx";
import { EmptyState, Kpi, SkeletonRows } from "../Shell.jsx";
// PromosSection - create promo codes and see who signed up with each. Props
// carry the App-level state and handlers. Built from the shell's shared
// parts; the shell's top bar carries the title.
//
// The code list keeps its grid: admin.css restyles .promo-table-header and
// .promo-row into stacked cards on a phone, and the hidden spans pad the grid
// so the column count matches the header on a desktop.
const PROMO_COLS = "160px 1fr 90px 70px 70px 100px 80px 110px";
const fieldLabel = { display:"block", marginBottom:6 };

const PromosSection = ({ createPromo, deletePromo, email, expandedPromo, loadPromoSignups, loading, loadingPromos, promoForm, promoFormError, promoSignups, promos, savingPromo, setPromoForm, stats, togglePromoActive, users }) => (
          <div>
            <div className="card" style={{ marginBottom:20 }}>
              <p className="card-title" style={{ marginBottom:16 }}>Create Promo Code</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, marginBottom:16 }}>
                <div>
                  <label className="label" style={fieldLabel}>Code <span style={{ color:"var(--red)" }}>*</span></label>
                  <input className="field mono" value={promoForm.code} onChange={e => setPromoForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="e.g. LAUNCH50"
                    style={{ textTransform:"uppercase" }} />
                </div>
                <div>
                  <label className="label" style={fieldLabel}>Trial Plan <span style={{ color:"var(--red)" }}>*</span></label>
                  <select className="field" value={promoForm.trial_plan} onChange={e => setPromoForm(f=>({...f,trial_plan:e.target.value}))}>
                    <option value="enterprise">Enterprise</option>
                    <option value="entrepreneur">Entrepreneur</option>
                  </select>
                </div>
                <div>
                  <label className="label" style={fieldLabel}>Trial Days <span style={{ color:"var(--red)" }}>*</span></label>
                  <input className="field" type="number" min="1" value={promoForm.trial_days} onChange={e => setPromoForm(f=>({...f,trial_days:e.target.value}))} placeholder="14" />
                </div>
                <div>
                  <label className="label" style={fieldLabel}>Max Uses <span style={{ color:"var(--dim)", fontSize:10, textTransform:"none", letterSpacing:0 }}>(blank = unlimited)</span></label>
                  <input className="field" type="number" min="1" value={promoForm.max_uses} onChange={e => setPromoForm(f=>({...f,max_uses:e.target.value}))} placeholder="Unlimited" />
                </div>
                <div>
                  <label className="label" style={fieldLabel}>Expiry Date <span style={{ color:"var(--dim)", fontSize:10, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
                  <input className="field" type="date" value={promoForm.expires_at} onChange={e => setPromoForm(f=>({...f,expires_at:e.target.value}))}
                    style={{ color:promoForm.expires_at?"var(--text)":"var(--dim)", colorScheme:"dark" }} />
                </div>
                <div style={{ gridColumn:"1 / -1" }}>
                  <label className="label" style={fieldLabel}>Description <span style={{ color:"var(--dim)", fontSize:10, textTransform:"none", letterSpacing:0 }}>(internal note)</span></label>
                  <input className="field" value={promoForm.description} onChange={e => setPromoForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Launch campaign - influencer outreach May 2025" />
                </div>
              </div>
              {promoFormError && <p style={{ color:"var(--red)", fontSize:13, marginBottom:12 }}>{promoFormError}</p>}
              <button type="button" className="btn btn-primary" onClick={createPromo} disabled={savingPromo}>
                {savingPromo ? "Creating…" : "+ Create Code"}
              </button>
            </div>

            <div className="card" style={{ padding:0, overflow:"hidden" }}>
              <div className="promo-table-header" style={{ display:"grid", gridTemplateColumns:PROMO_COLS, gap:12, padding:"12px 20px", borderBottom:"1px solid var(--border)" }}>
                {["Code","Description","Plan","Days","Uses","Max Uses","Expiry","Actions"].map(h => (
                  <span key={h} className="label">{h}</span>
                ))}
              </div>
              {loadingPromos ? <div style={{ padding:20 }}><SkeletonRows rows={4} /></div>
              : promos.length === 0 ? <EmptyState title="No promo codes yet" text="Create one above and it will show here with its signups." />
              : promos.map((p, i) => (
                <div key={p.id} style={{ borderBottom:i<promos.length-1?"1px solid var(--border)":"none" }}>
                <div className="promo-row" style={{ display:"grid", gridTemplateColumns:PROMO_COLS, gap:12, padding:"14px 20px", alignItems:"center", opacity:p.is_active?1:0.45 }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
                    <span className="mono" style={{ fontSize:13, fontWeight:700, color:p.is_active?"var(--purple-text)":"var(--muted)", letterSpacing:"0.05em" }}>{p.code}</span>
                    <span style={{ fontSize:12, padding:"3px 8px", borderRadius:6, background:planMeta(p.trial_plan).bg, color:planMeta(p.trial_plan).color, fontWeight:600 }}>
                      {planShort(p.trial_plan)}
                    </span>
                  </div>
                  <span style={{ fontSize:12, color:"var(--muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.description||"-"}</span>
                  <span style={{ display:"none" }}></span>
                  <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, color:"var(--text-2)" }}><span style={{ fontSize:10, color:"var(--dim)" }}>DAYS </span>{p.trial_days}</span>
                    <span style={{ fontSize:12, color:"var(--text-2)" }}><span style={{ fontSize:10, color:"var(--dim)" }}>USES </span>{p.uses_count}{p.max_uses?`/${p.max_uses}`:""}</span>
                    <span style={{ fontSize:12, color:p.expires_at&&new Date(p.expires_at)<new Date()?"var(--red)":"var(--muted)" }}><span style={{ fontSize:10, color:"var(--dim)" }}>EXPIRY </span>{p.expires_at?new Date(p.expires_at).toLocaleDateString("en-GB"):"Never"}</span>
                  </div>
                  <span style={{ display:"none" }}></span><span style={{ display:"none" }}></span><span style={{ display:"none" }}></span>
                  <div style={{ display:"flex", gap:6 }}>
                    <button type="button" className={`btn btn-sm${expandedPromo === p.id ? " btn-active" : ""}`} onClick={() => loadPromoSignups(p.id)}>
                      {expandedPromo === p.id ? "▲ Hide" : "Signups"}
                    </button>
                    <button type="button" className={`btn btn-sm${p.is_active ? " btn-danger" : ""}`} onClick={() => togglePromoActive(p)} title={p.is_active?"Deactivate":"Activate"}
                      style={p.is_active ? undefined : { color:"var(--green)", borderColor:"rgba(52,211,153,0.35)" }}>
                      {p.is_active?"Off":"On"}
                    </button>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => deletePromo(p.id)} title="Delete permanently" aria-label="Delete permanently">
                      ✕
                    </button>
                  </div>
                </div>

                {/* Signups panel */}
                {expandedPromo === p.id && (() => {
                  const ps = promoSignups[p.id];
                  return (
                    <div style={{ background:"rgba(124,58,237,0.04)", borderTop:"1px solid rgba(124,58,237,0.15)", padding:"16px 20px", marginTop:4 }}>
                      {!ps || ps.loading ? (
                        <SkeletonRows rows={3} />
                      ) : ps.error ? (
                        <p style={{ color:"var(--red)", fontSize:13 }}>Failed to load signups</p>
                      ) : (
                        <>
                          {/* Summary stats */}
                          <div className="kpi-grid" style={{ marginBottom:14 }}>
                            <Kpi label="Total signups" value={ps.data.total} />
                            <Kpi label="Converted to paid" value={`${ps.data.converted} (${ps.data.conversionRate}%)`} tone="green" />
                            <Kpi label="Still on trial" value={ps.data.stillTrial} tone="gold" />
                            <Kpi label="Trial expired (free)" value={ps.data.expired} tone="red" />
                          </div>
                          {/* User list */}
                          {ps.data.total === 0 ? (
                            <EmptyState title="No signups yet" text="No users have signed up with this code yet." />
                          ) : (
                            <div className="scroll-x" style={{ borderRadius:10, border:"1px solid var(--border)" }}>
                              <table className="tbl">
                                <thead>
                                  <tr>
                                    <th>Email</th>
                                    <th>Plan</th>
                                    <th>Status</th>
                                    <th>Signed up</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ps.data.users.map(u => {
                                    const isPaid = u.plan && u.plan !== 'free';
                                    const isTrialActive = u.temp_plan && u.temp_plan_expires_at && new Date(u.temp_plan_expires_at) > new Date();
                                    return (
                                      <tr key={u.id}>
                                        <td className="mono" style={{ fontSize:12, color:"var(--text)", maxWidth:320, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</td>
                                        <td>
                                          <span className={`pill ${isPaid ? "pill-green" : isTrialActive ? "pill-gold" : "pill-grey"}`}>
                                            {isPaid ? planLabel(u.plan) : isTrialActive ? `Trial (${planShort(u.temp_plan)})` : "Free"}
                                          </span>
                                        </td>
                                        <td style={{ fontSize:11, color:u.is_active?"var(--green)":"var(--text-2)" }}>{u.is_active?"Active":"Deactivated"}</td>
                                        <td style={{ fontSize:11, color:"var(--muted)", whiteSpace:"nowrap" }}>{new Date(u.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
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
