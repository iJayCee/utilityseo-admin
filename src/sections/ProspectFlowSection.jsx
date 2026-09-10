import { Badge } from "../shared.jsx";
import { EmptyState, Kpi, KpiSkeleton } from "../Shell.jsx";
// ProspectFlowSection - who signed up with a promo code, and what they have
// paid since. Props carry the App-level state and handlers. Built from the
// shell's shared parts; the shell's top bar carries the title.
const ProspectFlowSection = ({ email, loadCodeRevenue, loadProspectFlow, pfCodeFilter, pfData, pfError, pfLoading, pfSearch, pfStatusFilter, setPfCodeFilter, setPfData, setPfSearch, setPfStatusFilter, stats, users }) => (
          <div>
            <div style={{ width:"100%" }}>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:14 }}>
              <button type="button" className="btn btn-primary" onClick={() => { setPfData(null); loadProspectFlow(); }}>↻ Refresh</button>
            </div>

            {pfError && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"var(--red)", fontSize:13 }}>{pfError}</div>}
            {(pfLoading || (!pfData && !pfError)) && (
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:12, color:"var(--muted)", margin:"0 0 10px" }}>Loading Stripe data - this may take a few seconds...</p>
                <KpiSkeleton n={3} />
              </div>
            )}

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
              const fmtDay = (d) => new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"});
              return (
                <div>
                  <div className="kpi-grid" style={{ marginBottom:28 }}>
                    <Kpi label="Total Signups" value={pfData.users.length} tone="purple" />
                    <Kpi label="Now Paying" value={totalPaying} tone="green" />
                    <Kpi label="Revenue" value={`£${pfData.users.reduce((a,u)=>a+(u.total_paid||0),0).toFixed(2)}`} tone="green" />
                  </div>
                  <div style={{ display:"flex", gap:14, marginBottom:28, flexWrap:"wrap" }}>
                    {Object.entries(byCode).map(([code, stats]) => (
                      <div key={code} className="card" onClick={() => setPfCodeFilter(pfCodeFilter===code ? "all" : code)}
                        style={{ borderColor: pfCodeFilter===code ? "var(--purple)" : undefined, cursor:"pointer", minWidth:180, padding:"14px 18px" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:10 }}>
                          <span className="mono" style={{ fontSize:14, fontWeight:800, color:"var(--text)" }}>{code}</span>
                          <span className="pill pill-purple">{stats.signups} signup{stats.signups!==1?"s":""}</span>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 12px" }}>
                          <div style={{ fontSize:12, color:"var(--muted)" }}>Paying: <span style={{ color:"var(--green)", fontWeight:700 }}>{stats.paying}</span></div>
                          <div style={{ fontSize:12, color:"var(--muted)" }}>Revenue: <span style={{ color:"var(--text)", fontWeight:600 }}>£{stats.totalRevenue.toFixed(0)}</span></div>
                        </div>
                        <button type="button" className="btn btn-sm btn-active" style={{ marginTop:12, width:"100%" }}
                          onClick={e => { e.stopPropagation(); loadCodeRevenue(code); }}>
                          Revenue breakdown
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
                    <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                      <input className="field" value={pfSearch} onChange={e => setPfSearch(e.target.value)} placeholder="Search email, name or company..."
                        style={{ flex:1, minWidth:200, width:"auto" }} />
                      <select className="field" value={pfCodeFilter} onChange={e => setPfCodeFilter(e.target.value)}
                        style={{ width:"auto", minWidth:200, color:"var(--purple-text)", fontWeight:700 }}>
                        <option value="all">All codes ({pfData.users.length})</option>
                        {codes.filter(cd => cd !== "all").map(code => (
                          <option key={code} value={code}>{code} - {byCode[code]?.signups||0} signups</option>
                        ))}
                      </select>
                      <span style={{ fontSize:12, color:"var(--muted)", whiteSpace:"nowrap" }}>{filtered.length} result{filtered.length!==1?"s":""}</span>
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {[
                        { id:"all",      label:"All signups" },
                        { id:"paying",   label:"✓ Paying" },
                        { id:"free",     label:"Not yet paying" },
                      ].map(f => (
                        <button key={f.id} type="button" className={`btn btn-sm${pfStatusFilter===f.id ? " btn-active" : ""}`} onClick={() => setPfStatusFilter(f.id)}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* 650px of fixed columns, so on a phone the flexible User
                      column collapses and the row is on screen but unreadable.
                      Header and rows share ONE scroller so they cannot drift
                      apart. Inert above ~700px. */}
                  <div className="card" style={{ padding:0, overflow:"hidden" }}>
                    <div className="scroll-x">
                      <table className="tbl" style={{ minWidth:700 }}>
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Code</th>
                            <th>Plan</th>
                            <th>Signed Up</th>
                            <th>First Payment</th>
                            <th style={{ textAlign:"right" }}>Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding:0 }}><EmptyState title="No results match your filters" text="Try another code, status or search." /></td></tr>
                          ) : filtered.map(u => {
                            const isPaying = !!u.first_payment;
                            return (
                              <tr key={u.id}>
                                <td>
                                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{u.email}</div>
                                  <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{[u.first_name,u.last_name].filter(Boolean).join(" ")||u.company_name||"-"}</div>
                                </td>
                                <td className="mono" style={{ fontSize:12, color:"var(--purple-text)", fontWeight:700 }}>{u.promo_code_used}</td>
                                <td><Badge plan={u.plan} /></td>
                                <td style={{ fontSize:12, color:"var(--muted)", whiteSpace:"nowrap" }}>{fmtDay(u.created_at)}</td>
                                <td>
                                  {u.first_payment_date ? (
                                    <div>
                                      <div style={{ fontSize:12, color:"var(--green)", fontWeight:600, whiteSpace:"nowrap" }}>{fmtDay(u.first_payment_date)}</div>
                                      {u.days_to_first_payment!==null && <div style={{ fontSize:10, color:"var(--dim)" }}>{u.days_to_first_payment}d after signup</div>}
                                    </div>
                                  ) : <span style={{ fontSize:12, color:"var(--dim)" }}>Not yet</span>}
                                </td>
                                <td className="num" style={{ fontSize:13, color:isPaying?"var(--text)":"var(--dim)" }}>
                                  {isPaying?`£${u.total_paid.toFixed(2)}`:"-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
            </div>{/* end max-width wrapper */}
          </div>
);

export default ProspectFlowSection;
