// CostsSection - what the pay-as-you-go APIs cost at different user counts,
// with the measured AI spend above the projection. Props carry the App-level
// state and handlers. Built from the shell's shared parts; the shell's top bar
// carries the title.
import { Kpi, KpiSkeleton } from "../Shell.jsx";

const CostsSection = ({ costData, costError, costInputs, costLoading, loadCostForecast, search, setCostInputs, users }) => (
          <div style={{ width:"100%" }}>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:14 }}>
              <button type="button" className="btn btn-primary" onClick={loadCostForecast}>↻ Reset</button>
            </div>

            {costError && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"var(--red)", fontSize:13 }}>{costError}</div>}
            {(costLoading || (!costData && !costError)) && <KpiSkeleton n={3} />}

            {costData && costInputs && !costLoading && (() => {
              const ci = costInputs;
              const num = (v, d) => { const n = parseFloat(v); return isFinite(n) && n >= 0 ? n : d; };
              const set = (k) => (e) => setCostInputs(p => ({ ...p, [k]: e.target.value }));
              const gbp = num(ci.usdToGbp, 0.79);
              const cadence = { daily: 30, every3days: 10, weekly: 4.3 }[ci.rankRefreshCadence] || 4.3;
              // Cost per ACTIVE user per month, in USD.
              const perUser = () => {
                const searches = num(ci.keywordsPerUser, 0) * cadence * (num(ci.pctUsersRankTracking, 0) / 100);
                const serp = searches * num(ci.serpCost, 0);
                const backlinks = num(ci.backlinkRefreshesPerUserMonth, 0) * num(ci.backlinkCost, 0);
                const brandChecks = num(ci.brandChecksPerUserMonth, 0) * (num(ci.pctUsersBrandTracking, 0) / 100);
                const brand = brandChecks * num(ci.brandCost, 0);
                const blog = num(ci.blogPostsPerUserMonth, 0) * num(ci.blogCost, 0);
                const llm = num(ci.aiActionsPerUserMonth, 0) * num(ci.llmCost, 0);
                const ai = brand + blog + llm; // all LLM-backed lines
                return { serp, backlinks, brand, blog, llm, ai, total: serp + backlinks + ai, searches, brandChecks };
              };
              const pu = perUser();
              const toGbp = (usd) => usd * gbp;
              const money = (n) => "£" + (n < 10 ? n.toFixed(2) : Math.round(n).toLocaleString());
              const sub = num(ci.avgSubscriptionGBP, 0);
              const perUserGbp = toGbp(pu.total);
              const marginPct = sub > 0 ? Math.round(((sub - perUserGbp) / sub) * 100) : null;
              const tiers = [...new Set([costData.signals.users || 1, 5, 10, 25, 50, 100, 250, 500])].filter(n => n > 0).sort((a, b) => a - b);

              const fieldLabel = { display:"flex", flexDirection:"column", gap:4, fontSize:11.5, color:"var(--text-2)", fontWeight:600 };
              const Field = ({ label, k, suffix, width = 90 }) => (
                <label style={fieldLabel}>
                  {label}
                  <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <input type="number" className="field mono" value={ci[k]} onChange={set(k)} style={{ width, fontSize:13, padding:"7px 9px", minHeight:36 }} />
                    {suffix && <span style={{ fontSize:11, color:"var(--muted)" }}>{suffix}</span>}
                  </span>
                </label>
              );

              // Measured spend from the llm_usage table (real, not estimated).
              const usage = costData.usage;
              const usdM = (n) => "£" + ((n || 0) * gbp < 10 ? ((n || 0) * gbp).toFixed(2) : Math.round((n || 0) * gbp).toLocaleString());
              const FEATURE_LABEL = { "brand-tracking": "Brand tracking", "blog": "Blog writing", "multi-model-audit": "Multi-model audit", "fix-issue": "Fix with AI", "page-suggestions": "Page suggestions", "conversion-suggestions": "Conversion suggestions", "meta-generator": "Meta generator", "traffic-drop-diagnostic": "Traffic-drop diagnostic", "keyword-opportunities": "Keyword opportunities", "keyword-explorer": "Keyword explorer", "competitor-suggestions": "Competitor suggestions", "benchmark-comparison": "Benchmark comparison", "content-score": "Content score", "ai-generate": "AI generate" };

              return (
                <>
                  {/* MEASURED spend - real token usage from llm_usage */}
                  {usage && usage.available && (
                    <div className="card" style={{ marginBottom:18, borderLeft:"3px solid var(--green)" }}>
                      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:14 }}>
                        <p className="label" style={{ color:"var(--green)" }}>Measured AI spend · last {usage.days} days</p>
                        <span style={{ fontSize:11, color:"var(--muted)" }}>{(usage.total?.calls || 0).toLocaleString()} calls logged</span>
                      </div>
                      {(usage.total?.calls || 0) === 0 ? (
                        <p style={{ fontSize:13, color:"var(--muted)", margin:0 }}>No AI calls logged yet in this window. Metering starts recording from the deploy that added it - run any AI feature (or wait for the weekly brand-tracking cron) and real numbers will appear here.</p>
                      ) : (
                        <>
                          <div className="kpi-grid" style={{ marginBottom:14 }}>
                            <Kpi label="Last 30 days" value={usdM(usage.total?.cost)} tone="green" />
                            <Kpi label="Month to date" value={usdM(usage.monthToDate?.cost)} />
                            <Kpi label="Per paying customer" value={usage.payingCustomers > 0 ? usdM((usage.total?.cost || 0) / usage.payingCustomers) : "-"} />
                            <Kpi label="Tokens (in/out)" value={`${Math.round((usage.total?.in_tok || 0) / 1000)}k / ${Math.round((usage.total?.out_tok || 0) / 1000)}k`} tone="grey" />
                          </div>
                          <p className="label" style={{ marginBottom:8 }}>By feature</p>
                          {(usage.byFeature || []).slice(0, 8).map(f => {
                            const pct = usage.total?.cost > 0 ? (f.cost / usage.total.cost) * 100 : 0;
                            return (
                              <div key={f.feature} style={{ marginBottom:8 }}>
                                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:3 }}>
                                  <span style={{ color:"var(--text)" }}>{FEATURE_LABEL[f.feature] || f.feature} <span style={{ color:"var(--muted)" }}>· {f.calls.toLocaleString()} calls</span></span>
                                  <span className="mono" style={{ color:"var(--text)", fontWeight:700 }}>{usdM(f.cost)}</span>
                                </div>
                                <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                                  <div style={{ height:"100%", width:`${Math.max(1, pct)}%`, background:"var(--green)", borderRadius:3 }} />
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}

                  <p className="label" style={{ margin:"4px 0 10px" }}>Projection (estimate) - adjust the assumptions below</p>

                  {/* Assumptions */}
                  <div className="card" style={{ marginBottom:18 }}>
                    <p className="label" style={{ marginBottom:14 }}>Assumptions (per active user)</p>
                    <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-end" }}>
                      <Field label="Keywords tracked" k="keywordsPerUser" />
                      <label style={fieldLabel}>
                        Rank refresh
                        <select className="field" value={ci.rankRefreshCadence} onChange={set("rankRefreshCadence")} style={{ width:"auto", fontSize:13, padding:"7px 9px", minHeight:36 }}>
                          <option value="daily">Daily</option>
                          <option value="every3days">Every 3 days</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </label>
                      <Field label="% on rank tracking" k="pctUsersRankTracking" suffix="%" width={70} />
                      <Field label="Backlink refreshes/mo" k="backlinkRefreshesPerUserMonth" width={70} />
                      <Field label="Avg subscription" k="avgSubscriptionGBP" suffix="£/mo" width={70} />
                    </div>
                    <p className="label" style={{ margin:"16px 0 10px" }}>AI-backed features</p>
                    <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-end" }}>
                      <Field label="% tracking a brand" k="pctUsersBrandTracking" suffix="%" width={70} />
                      <label style={fieldLabel}>
                        <span title="8 prompts x up to 4 AI platforms x weekly = ~140. Automatic cron.">Brand checks/mo <span style={{ color:"var(--gold)" }}>(i)</span></span>
                        <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <input type="number" className="field mono" value={ci.brandChecksPerUserMonth} onChange={set("brandChecksPerUserMonth")}
                            style={{ width:80, fontSize:13, padding:"7px 9px", minHeight:36 }} />
                        </span>
                      </label>
                      <Field label="Blog posts/mo" k="blogPostsPerUserMonth" width={70} />
                      <Field label="Other AI actions/mo" k="aiActionsPerUserMonth" width={70} />
                    </div>
                    <details style={{ marginTop:14 }}>
                      <summary style={{ fontSize:12, color:"var(--muted)", cursor:"pointer" }}>Advanced: unit costs (USD)</summary>
                      <div style={{ display:"flex", gap:18, flexWrap:"wrap", marginTop:12, alignItems:"flex-end" }}>
                        <Field label="SERP / search" k="serpCost" width={90} />
                        <Field label="Backlink / refresh" k="backlinkCost" width={90} />
                        <Field label="Brand / check" k="brandCost" width={90} />
                        <Field label="Blog / post" k="blogCost" width={90} />
                        <Field label="Other AI / action" k="llmCost" width={90} />
                        <Field label="USD→GBP" k="usdToGbp" width={90} />
                      </div>
                    </details>
                  </div>

                  {/* Per-user result */}
                  <div className="kpi-grid" style={{ marginBottom:18 }}>
                    <Kpi label="Cost / user / month" value={money(perUserGbp)} tone="gold" />
                    <Kpi label="Subscription / user" value={money(sub)} />
                    <Kpi label="Gross margin" value={marginPct == null ? "-" : marginPct + "%"} tone={marginPct >= 80 ? "green" : marginPct >= 50 ? "gold" : "red"} />
                  </div>

                  {/* Per-user breakdown by API */}
                  <div className="card" style={{ marginBottom:18 }}>
                    <p className="label" style={{ marginBottom:12 }}>Per-user monthly cost by API</p>
                    {[
                      ["Rank tracking (SERP)", pu.serp, `${Math.round(pu.searches).toLocaleString()} searches`],
                      ["Backlinks", pu.backlinks, `${num(ci.backlinkRefreshesPerUserMonth,0)} refreshes`],
                      ["Brand tracking (AI, auto weekly)", pu.brand, `${Math.round(pu.brandChecks).toLocaleString()} checks`],
                      ["Blog writing (AI)", pu.blog, `${num(ci.blogPostsPerUserMonth,0)} posts`],
                      ["Other AI", pu.llm, `${num(ci.aiActionsPerUserMonth,0)} actions`],
                    ].map(([label, usd, sub2]) => {
                      const pct = pu.total > 0 ? (usd / pu.total) * 100 : 0;
                      return (
                        <div key={label} style={{ marginBottom:10 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:4 }}>
                            <span style={{ color:"var(--text)" }}>{label} <span style={{ color:"var(--muted)" }}>· {sub2}</span></span>
                            <span className="mono" style={{ color:"var(--text)", fontWeight:700 }}>{money(toGbp(usd))}</span>
                          </div>
                          <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${Math.max(1, pct)}%`, background:"var(--purple-text)", borderRadius:3 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Projection table across user tiers */}
                  <div className="card">
                    <p className="label" style={{ marginBottom:12 }}>Total monthly cost by user count</p>
                    <div className="scroll-x">
                      <table className="tbl" style={{ minWidth:520 }}>
                        <thead>
                          <tr>
                            <th>Users</th>
                            <th style={{ textAlign:"right" }}>Rank tracking</th>
                            <th style={{ textAlign:"right" }}>Backlinks</th>
                            <th style={{ textAlign:"right" }} title="Brand tracking + blog + other AI">AI (all)</th>
                            <th style={{ textAlign:"right", color:"var(--text-2)" }}>Total / mo</th>
                            <th style={{ textAlign:"right" }}>vs revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tiers.map(n => {
                            const rev = sub * n;
                            const total = toGbp(pu.total) * n;
                            const isCurrent = n === (costData.signals.users || 1);
                            return (
                              <tr key={n} style={{ background:isCurrent ? "rgba(124,58,237,0.08)" : "transparent" }}>
                                <td className="mono" style={{ color:"var(--text)", fontWeight:700 }}>{n.toLocaleString()}{isCurrent && <span style={{ fontSize:10, color:"var(--purple-text)", marginLeft:6 }}>now</span>}</td>
                                <td className="num" style={{ color:"var(--text-2)" }}>{money(toGbp(pu.serp) * n)}</td>
                                <td className="num" style={{ color:"var(--text-2)" }}>{money(toGbp(pu.backlinks) * n)}</td>
                                <td className="num" style={{ color:"var(--text-2)" }}>{money(toGbp(pu.ai) * n)}</td>
                                <td className="num" style={{ color:"var(--gold)", fontWeight:800 }}>{money(total)}</td>
                                <td className="num" style={{ color: rev > 0 && total / rev < 0.2 ? "var(--green)" : "var(--text-2)" }}>{rev > 0 ? Math.round((total / rev) * 100) + "% of rev" : "-"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <p style={{ fontSize:11, color:"var(--muted)", marginTop:16, lineHeight:1.5 }}>
                    Brand tracking runs automatically on a weekly cron across ~4 AI platforms (Perplexity is itself paid), so it costs whether or not users log in - the easiest line to forget. AI features already run on your existing keys and there is no live token metering yet, so all figures are estimates from the code, not measured spend. Unit costs approximate (early 2026) - re-check with vendors. "vs revenue" is total API cost as a share of subscription revenue.
                  </p>
                </>
              );
            })()}
          </div>
);

export default CostsSection;
