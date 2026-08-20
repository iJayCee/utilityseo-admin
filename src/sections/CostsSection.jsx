// CostsSection - extracted verbatim from App.jsx (admin split). Behaviour is
// byte-identical to the inline version; props carry the App-level state and
// handlers it used in place. Restyle happens separately.
const CostsSection = ({ costData, costError, costInputs, costLoading, loadCostForecast, search, setCostInputs, users }) => (
          <div style={{ width:"100%" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:800, color:"#e2e8f0", margin:0 }}>Cost forecast</h2>
                <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0" }}>What the pay-as-you-go APIs cost at different user counts. Adjust the assumptions to match reality.</p>
              </div>
              <button onClick={loadCostForecast}
                style={{ padding:"9px 20px", background:"#7C3AED", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
                ↻ Reset
              </button>
            </div>

            {costError && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#f87171", fontSize:13 }}>{costError}</div>}
            {costLoading && <div style={{ textAlign:"center", padding:"60px 20px", color:"#64748b", fontSize:14 }}>Loading cost model…</div>}

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

              const Field = ({ label, k, suffix, width = 90 }) => (
                <label style={{ display:"flex", flexDirection:"column", gap:4, fontSize:11.5, color:"#94a3b8", fontWeight:600 }}>
                  {label}
                  <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <input type="number" value={ci[k]} onChange={set(k)}
                      style={{ width, background:"#0f172a", border:"1px solid #334155", borderRadius:8, color:"#e2e8f0", fontSize:13, padding:"7px 9px", fontFamily:"JetBrains Mono,monospace" }} />
                    {suffix && <span style={{ fontSize:11, color:"#64748b" }}>{suffix}</span>}
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
                    <div className="glass" style={{ borderRadius:14, padding:"18px 20px", marginBottom:18, borderLeft:"3px solid #34d399" }}>
                      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:14 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"#34d399", textTransform:"uppercase", letterSpacing:"0.05em" }}>Measured AI spend · last {usage.days} days</div>
                        <div style={{ fontSize:11, color:"#475569" }}>{(usage.total?.calls || 0).toLocaleString()} calls logged</div>
                      </div>
                      {(usage.total?.calls || 0) === 0 ? (
                        <p style={{ fontSize:13, color:"#64748b", margin:0 }}>No AI calls logged yet in this window. Metering starts recording from the deploy that added it - run any AI feature (or wait for the weekly brand-tracking cron) and real numbers will appear here.</p>
                      ) : (
                        <>
                          <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:14 }}>
                            {[
                              ["Last 30 days", usdM(usage.total?.cost), "#34d399"],
                              ["Month to date", usdM(usage.monthToDate?.cost), "#e2e8f0"],
                              ["Per paying customer", usage.payingCustomers > 0 ? usdM((usage.total?.cost || 0) / usage.payingCustomers) : "-", "#e2e8f0"],
                              ["Tokens (in/out)", `${Math.round((usage.total?.in_tok || 0) / 1000)}k / ${Math.round((usage.total?.out_tok || 0) / 1000)}k`, "#94a3b8"],
                            ].map(([l, v, c]) => (
                              <div key={l} style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"12px 14px", flex:"1 1 130px", minWidth:130 }}>
                                <div style={{ fontSize:10.5, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:5 }}>{l}</div>
                                <div style={{ fontSize:20, fontWeight:800, color:c, fontFamily:"JetBrains Mono,monospace" }}>{v}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>By feature</div>
                          {(usage.byFeature || []).slice(0, 8).map(f => {
                            const pct = usage.total?.cost > 0 ? (f.cost / usage.total.cost) * 100 : 0;
                            return (
                              <div key={f.feature} style={{ marginBottom:8 }}>
                                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:3 }}>
                                  <span style={{ color:"#cbd5e1" }}>{FEATURE_LABEL[f.feature] || f.feature} <span style={{ color:"#475569" }}>· {f.calls.toLocaleString()} calls</span></span>
                                  <span style={{ color:"#e2e8f0", fontFamily:"JetBrains Mono,monospace", fontWeight:700 }}>{usdM(f.cost)}</span>
                                </div>
                                <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                                  <div style={{ height:"100%", width:`${Math.max(1, pct)}%`, background:"#34d399", borderRadius:3 }} />
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", margin:"4px 0 10px" }}>Projection (estimate) - adjust the assumptions below</div>

                  {/* Assumptions */}
                  <div className="glass" style={{ borderRadius:14, padding:"18px 20px", marginBottom:18 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:14 }}>Assumptions (per active user)</div>
                    <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-end" }}>
                      <Field label="Keywords tracked" k="keywordsPerUser" />
                      <label style={{ display:"flex", flexDirection:"column", gap:4, fontSize:11.5, color:"#94a3b8", fontWeight:600 }}>
                        Rank refresh
                        <select value={ci.rankRefreshCadence} onChange={set("rankRefreshCadence")}
                          style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:8, color:"#e2e8f0", fontSize:13, padding:"7px 9px" }}>
                          <option value="daily">Daily</option>
                          <option value="every3days">Every 3 days</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </label>
                      <Field label="% on rank tracking" k="pctUsersRankTracking" suffix="%" width={70} />
                      <Field label="Backlink refreshes/mo" k="backlinkRefreshesPerUserMonth" width={70} />
                      <Field label="Avg subscription" k="avgSubscriptionGBP" suffix="£/mo" width={70} />
                    </div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", margin:"16px 0 10px" }}>AI-backed features</div>
                    <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-end" }}>
                      <Field label="% tracking a brand" k="pctUsersBrandTracking" suffix="%" width={70} />
                      <label style={{ display:"flex", flexDirection:"column", gap:4, fontSize:11.5, color:"#94a3b8", fontWeight:600 }}>
                        <span title="8 prompts x up to 4 AI platforms x weekly = ~140. Automatic cron.">Brand checks/mo <span style={{ color:"#f59e0b" }}>ⓘ</span></span>
                        <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <input type="number" value={ci.brandChecksPerUserMonth} onChange={set("brandChecksPerUserMonth")}
                            style={{ width:80, background:"#0f172a", border:"1px solid #334155", borderRadius:8, color:"#e2e8f0", fontSize:13, padding:"7px 9px", fontFamily:"JetBrains Mono,monospace" }} />
                        </span>
                      </label>
                      <Field label="Blog posts/mo" k="blogPostsPerUserMonth" width={70} />
                      <Field label="Other AI actions/mo" k="aiActionsPerUserMonth" width={70} />
                    </div>
                    <details style={{ marginTop:14 }}>
                      <summary style={{ fontSize:12, color:"#64748b", cursor:"pointer" }}>Advanced: unit costs (USD)</summary>
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
                  <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:18 }}>
                    {[
                      ["Cost / user / month", money(perUserGbp), "#f59e0b"],
                      ["Subscription / user", money(sub), "#e2e8f0"],
                      ["Gross margin", marginPct == null ? "-" : marginPct + "%", marginPct >= 80 ? "#34d399" : marginPct >= 50 ? "#fbbf24" : "#f87171"],
                    ].map(([l, v, c]) => (
                      <div key={l} className="glass" style={{ borderRadius:14, padding:"16px 18px", flex:"1 1 160px", minWidth:160 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>{l}</div>
                        <div style={{ fontSize:24, fontWeight:800, color:c, fontFamily:"JetBrains Mono,monospace" }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Per-user breakdown by API */}
                  <div className="glass" style={{ borderRadius:14, padding:"16px 18px", marginBottom:18 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:12 }}>Per-user monthly cost by API</div>
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
                            <span style={{ color:"#cbd5e1" }}>{label} <span style={{ color:"#475569" }}>· {sub2}</span></span>
                            <span style={{ color:"#e2e8f0", fontFamily:"JetBrains Mono,monospace", fontWeight:700 }}>{money(toGbp(usd))}</span>
                          </div>
                          <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${Math.max(1, pct)}%`, background:"#a78bfa", borderRadius:3 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Projection table across user tiers */}
                  <div className="glass" style={{ borderRadius:14, padding:"16px 18px", overflowX:"auto" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:12 }}>Total monthly cost by user count</div>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:520 }}>
                      <thead>
                        <tr style={{ color:"#64748b", textAlign:"right", fontSize:11, textTransform:"uppercase" }}>
                          <th style={{ textAlign:"left", padding:"6px 8px" }}>Users</th>
                          <th style={{ padding:"6px 8px" }}>Rank tracking</th>
                          <th style={{ padding:"6px 8px" }}>Backlinks</th>
                          <th style={{ padding:"6px 8px" }} title="Brand tracking + blog + other AI">AI (all)</th>
                          <th style={{ padding:"6px 8px", color:"#94a3b8" }}>Total / mo</th>
                          <th style={{ padding:"6px 8px" }}>vs revenue</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontFamily:"JetBrains Mono,monospace" }}>
                        {tiers.map(n => {
                          const rev = sub * n;
                          const total = toGbp(pu.total) * n;
                          const isCurrent = n === (costData.signals.users || 1);
                          return (
                            <tr key={n} style={{ textAlign:"right", borderTop:"1px solid rgba(255,255,255,0.05)", background:isCurrent ? "rgba(124,58,237,0.08)" : "transparent" }}>
                              <td style={{ textAlign:"left", padding:"8px", color:"#e2e8f0", fontWeight:700 }}>{n.toLocaleString()}{isCurrent && <span style={{ fontSize:10, color:"#a78bfa", marginLeft:6 }}>now</span>}</td>
                              <td style={{ padding:"8px", color:"#94a3b8" }}>{money(toGbp(pu.serp) * n)}</td>
                              <td style={{ padding:"8px", color:"#94a3b8" }}>{money(toGbp(pu.backlinks) * n)}</td>
                              <td style={{ padding:"8px", color:"#94a3b8" }}>{money(toGbp(pu.ai) * n)}</td>
                              <td style={{ padding:"8px", color:"#f59e0b", fontWeight:800 }}>{money(total)}</td>
                              <td style={{ padding:"8px", color: rev > 0 && total / rev < 0.2 ? "#34d399" : "#94a3b8" }}>{rev > 0 ? Math.round((total / rev) * 100) + "% of rev" : "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <p style={{ fontSize:11, color:"#475569", marginTop:16, lineHeight:1.5 }}>
                    Brand tracking runs automatically on a weekly cron across ~4 AI platforms (Perplexity is itself paid), so it costs whether or not users log in - the easiest line to forget. AI features already run on your existing keys and there is no live token metering yet, so all figures are estimates from the code, not measured spend. Unit costs approximate (early 2026) - re-check with vendors. "vs revenue" is total API cost as a share of subscription revenue.
                  </p>
                </>
              );
            })()}
          </div>
);

export default CostsSection;
