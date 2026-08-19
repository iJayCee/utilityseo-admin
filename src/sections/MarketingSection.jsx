// Marketing: what was spent, where, and what it bought.
//
// The design problem this screen solves is not layout, it is honesty about
// evidence. There are three ways to say a signup came from a campaign and they
// disagree:
//
//   TRACKED  the signup arrived carrying this campaign's utm_campaign. Hard.
//   CLAIMED  the "where did you hear about us" answer matches the platform.
//            Self-reported, platform-wide, and it cannot tell one Google Ads
//            campaign from another.
//   MANUAL   a number typed in, for campaigns that predate tracking or that no
//            UTM could ever reach (print, events, word of mouth).
//
// They are shown side by side and never averaged. A single blended
// "signups: 34" would be built from hard evidence, a guess and a dropdown
// answer, and nobody looking at it could tell which parts were which - while
// the cost-per-signup underneath it drives real budget decisions.
import { useState, useEffect } from "react";
import { card, label, Section, SectionHeader } from "../shared.jsx";

const input = { padding:"10px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, color:"#e2e8f0", fontSize:13, fontFamily:"Sora,sans-serif", width:"100%", boxSizing:"border-box" };
const btn = (bg = "#7C3AED") => ({ padding:"10px 18px", background:bg, border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", minHeight:44 });
const ghost = { ...btn("transparent"), border:"1px solid rgba(255,255,255,0.12)", color:"#e2e8f0", fontWeight:600 };
const mono = { fontFamily:"JetBrains Mono,monospace" };

const gbp = (pence) => `£${((Number(pence) || 0) / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// Null means "no signups of this kind", which is NOT £0.00 - that would read
// as free. The dash plus a label is the difference between "we measured
// nothing" and "it cost nothing".
const cps = (pence) => (pence === null || pence === undefined ? "-" : gbp(pence));
const shortMonth = (m) => {
  try { return new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }); }
  catch { return m; }
};

const STATUS = {
  running:   { color:"#22c55e", bg:"rgba(34,197,94,0.1)",   label:"Running" },
  scheduled: { color:"#38bdf8", bg:"rgba(56,189,248,0.1)",  label:"Scheduled" },
  ended:     { color:"#64748b", bg:"rgba(148,163,184,0.1)", label:"Ended" },
};

const StatusPill = ({ status }) => {
  const c = STATUS[status] || STATUS.running;
  return <span style={{ fontSize:11, fontWeight:700, color:c.color, background:c.bg, border:`1px solid ${c.color}33`, padding:"3px 10px", borderRadius:99, whiteSpace:"nowrap" }}>{c.label}</span>;
};

const readJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`The API returned ${res.status} instead of data.`); }
};

const EMPTY_FORM = { name:"", platform:"google_ads", details:"", utmCampaign:"", utmSource:"", landingUrl:"", startedOn:"", endedOn:"", manualSignups:"" };

const MarketingSection = ({ adminFetch, API_URL }) => {
  const [data, setData]       = useState(null);
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState("");
  const [showForm, setShow]   = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [expanded, setExpanded] = useState(null);
  const [spendForm, setSpendForm] = useState({});
  const [signups, setSignups] = useState({});

  const load = async () => {
    setError("");
    try {
      const res = await adminFetch(`${API_URL}/admin/marketing`);
      const d = await readJson(res);
      if (!res.ok) throw new Error(d.error || "Could not load marketing data");
      setData(d);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const createCampaign = async (e) => {
    e?.preventDefault();
    setBusy("create"); setError("");
    try {
      const res = await adminFetch(`${API_URL}/admin/marketing/campaigns`, {
        method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form),
      });
      const d = await readJson(res);
      // The server's message is shown as written - it is the one that knows
      // whether this was a duplicate UTM, a backwards date range or a missing
      // name, and it names the other campaign when the UTM clashes.
      if (!res.ok) throw new Error(d.error || "Could not save the campaign");
      setForm(EMPTY_FORM); setShow(false); await load();
    } catch (e) { setError(e.message); } finally { setBusy(""); }
  };

  const addSpend = async (campaignId) => {
    const f = spendForm[campaignId] || {};
    setBusy(`spend-${campaignId}`); setError("");
    try {
      const res = await adminFetch(`${API_URL}/admin/marketing/campaigns/${campaignId}/spend`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ spentOn: f.spentOn, amount: f.amount, note: f.note }),
      });
      const d = await readJson(res);
      if (!res.ok) throw new Error(d.error || "Could not save the spend");
      setSpendForm(s => ({ ...s, [campaignId]: { spentOn: f.spentOn, amount: "", note: "" } }));
      await load();
    } catch (e) { setError(e.message); } finally { setBusy(""); }
  };

  const patch = async (id, body) => {
    setBusy(`patch-${id}`); setError("");
    try {
      const res = await adminFetch(`${API_URL}/admin/marketing/campaigns/${id}`, {
        method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body),
      });
      const d = await readJson(res);
      if (!res.ok) throw new Error(d.error || "Could not update");
      await load();
    } catch (e) { setError(e.message); } finally { setBusy(""); }
  };

  const loadSignups = async (id) => {
    try {
      const res = await adminFetch(`${API_URL}/admin/marketing/campaigns/${id}/signups`);
      const d = await readJson(res);
      if (res.ok) setSignups(s => ({ ...s, [id]: d }));
    } catch { /* the summary still stands without the drill-down */ }
  };

  const t = data?.totals;
  const maxMonth = Math.max(1, ...(data?.spendByMonth || []).map(m => m.pence));

  return (
    <Section>
      <SectionHeader
        title="Marketing"
        subtitle="Ad spend by campaign, and the signups it can be shown to have produced."
        right={<>
          <button style={ghost} onClick={load}>Refresh</button>
          <button style={btn()} onClick={() => setShow(v => !v)}>{showForm ? "Cancel" : "New campaign"}</button>
        </>}
      />

      {error && (
        <div style={{ ...card, borderColor:"rgba(248,113,113,0.3)", background:"rgba(248,113,113,0.08)", color:"#f87171", fontSize:13 }}>{error}</div>
      )}

      {showForm && (
        <form onSubmit={createCampaign} style={card}>
          <p style={label}>New campaign</p>
          <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))" }}>
            <div>
              <p style={label}>Name</p>
              <input style={input} value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} placeholder="Spring search push" />
            </div>
            <div>
              <p style={label}>Platform</p>
              <select style={input} value={form.platform} onChange={e => setForm(f => ({ ...f, platform:e.target.value }))}>
                {(data?.platforms || []).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <p style={label}>Starts</p>
              <input style={input} type="date" value={form.startedOn} onChange={e => setForm(f => ({ ...f, startedOn:e.target.value }))} />
            </div>
            <div>
              <p style={label}>Ends (optional)</p>
              <input style={input} type="date" value={form.endedOn} onChange={e => setForm(f => ({ ...f, endedOn:e.target.value }))} />
            </div>
            <div>
              <p style={label}>utm_campaign</p>
              <input style={{ ...input, ...mono }} value={form.utmCampaign} onChange={e => setForm(f => ({ ...f, utmCampaign:e.target.value }))} placeholder="spring26" />
            </div>
            <div>
              <p style={label}>Signups so far (optional)</p>
              <input style={input} type="number" min="0" value={form.manualSignups} onChange={e => setForm(f => ({ ...f, manualSignups:e.target.value }))} placeholder="0" />
            </div>
          </div>
          <div style={{ marginTop:12 }}>
            <p style={label}>Details</p>
            <textarea style={{ ...input, minHeight:70, resize:"vertical" }} value={form.details} onChange={e => setForm(f => ({ ...f, details:e.target.value }))} placeholder="Audience, creative, bid strategy, anything you will want to remember in six months." />
          </div>
          {/* Said at the point the field is filled in, not buried in a help
              page - this is the one instruction that makes tracking work. */}
          <p style={{ fontSize:12, color:"#64748b", lineHeight:1.6, marginTop:12 }}>
            Put <span style={{ ...mono, color:"#e2e8f0" }}>?utm_campaign={form.utmCampaign || "spring26"}&amp;utm_source={form.platform}</span> on the end of the ad's landing page URL.
            Signups arriving with it are counted as <strong>tracked</strong> - the only count that is hard evidence.
            Leave it blank for offline campaigns and use the manual figure instead.
          </p>
          <button type="submit" style={{ ...btn(), marginTop:12 }} disabled={busy === "create"}>
            {busy === "create" ? "Saving…" : "Create campaign"}
          </button>
        </form>
      )}

      {!data && !error && <div style={card}><p style={{ color:"#64748b", fontSize:13 }}>Loading…</p></div>}

      {data && (
        <>
          {/* Totals. Spend is a single figure because a pound is a pound.
              Signups are three figures because they are three different
              claims - and merging them is the one thing this screen must
              never do. */}
          <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", marginBottom:20 }}>
            <div style={{ ...card, marginBottom:0 }}>
              <p style={label}>Total spend</p>
              <p style={{ ...mono, fontSize:24, fontWeight:700, color:"#e2e8f0", margin:0 }}>{gbp(t.spendPence)}</p>
              <p style={{ fontSize:11.5, color:"#64748b", margin:"4px 0 0" }}>{t.campaigns} campaign{t.campaigns === 1 ? "" : "s"}, {t.running} running</p>
            </div>
            <div style={{ ...card, marginBottom:0 }}>
              <p style={label}>Tracked signups</p>
              <p style={{ ...mono, fontSize:24, fontWeight:700, color:"#22c55e", margin:0 }}>{t.signups.tracked}</p>
              <p style={{ fontSize:11.5, color:"#64748b", margin:"4px 0 0" }}>arrived with a campaign tag</p>
            </div>
            <div style={{ ...card, marginBottom:0 }}>
              <p style={label}>Cost per tracked signup</p>
              <p style={{ ...mono, fontSize:24, fontWeight:700, color:"#e2e8f0", margin:0 }}>{cps(t.costPerTrackedSignup)}</p>
              {/* Divided by trackable spend only. Including offline spend that
                  can never produce a tracked signup would make the channels
                  that do work look expensive. */}
              <p style={{ fontSize:11.5, color:"#64748b", margin:"4px 0 0" }}>over {gbp(t.trackablePence)} of taggable spend</p>
            </div>
            <div style={{ ...card, marginBottom:0 }}>
              <p style={label}>Self-reported / manual</p>
              <p style={{ ...mono, fontSize:24, fontWeight:700, color:"#94a3b8", margin:0 }}>{t.signups.claimed} / {t.signups.manual}</p>
              <p style={{ fontSize:11.5, color:"#64748b", margin:"4px 0 0" }}>softer evidence, kept separate</p>
            </div>
          </div>

          {t.untrackablePence > 0 && (
            <p style={{ fontSize:12, color:"#f59e0b", lineHeight:1.6, marginTop:-8, marginBottom:20 }}>
              {gbp(t.untrackablePence)} of spend is on campaigns with no utm_campaign, so it can never appear in the tracked figure.
              {t.untrackablePence > t.trackablePence && " That is most of the budget - read the tracked number as a corner of the picture, not the whole of it."}
            </p>
          )}

          {data.spendByMonth.length > 1 && (
            <div style={card}>
              <p style={label}>Spend by month</p>
              <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:110, marginTop:10 }}>
                {data.spendByMonth.map(m => (
                  <div key={m.month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, minWidth:0 }} title={`${shortMonth(m.month)}: ${gbp(m.pence)}`}>
                    {/* A month with no spend still gets a slot, so a pause in
                        advertising looks like a pause rather than like
                        continuous activity. */}
                    <div style={{ width:"100%", height:Math.max(2, Math.round((m.pence / maxMonth) * 80)), background: m.pence ? "#7C3AED" : "rgba(255,255,255,0.08)", borderRadius:"4px 4px 0 0" }} />
                    <span style={{ fontSize:10, color:"#64748b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%" }}>{shortMonth(m.month)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!data.orphanUtms.length && (
            <div style={{ ...card, borderColor:"rgba(245,158,11,0.3)" }}>
              <p style={label}>Signups tagged with an unknown campaign</p>
              <p style={{ fontSize:12.5, color:"#94a3b8", lineHeight:1.6, margin:"0 0 10px" }}>
                These people arrived with a utm_campaign that matches no campaign here - usually a typo in the ad, or a campaign never logged.
                Their signups are currently credited to nothing.
              </p>
              {data.orphanUtms.map(o => (
                <div key={o.utm} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"6px 0", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ ...mono, fontSize:12.5, color:"#e2e8f0" }}>{o.utm}</span>
                  <span style={{ ...mono, fontSize:12.5, color:"#f59e0b" }}>{o.signups} signup{o.signups === 1 ? "" : "s"}</span>
                </div>
              ))}
            </div>
          )}

          {!data.campaigns.length && (
            <div style={{ ...card, textAlign:"center", padding:32 }}>
              <p style={{ fontSize:14, color:"#94a3b8", margin:0 }}>No campaigns logged yet.</p>
              <p style={{ fontSize:12.5, color:"#64748b", margin:"8px 0 16px", lineHeight:1.6 }}>
                Log one for anything you spend money on to get people here - ads, sponsorships, a newsletter placement.
              </p>
              <button style={btn()} onClick={() => setShow(true)}>New campaign</button>
            </div>
          )}

          {data.campaigns.map(c => (
            <div key={c.id} style={card}>
              <div style={{ display:"flex", gap:12, alignItems:"flex-start", flexWrap:"wrap", justifyContent:"space-between" }}>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                    <h4 style={{ fontSize:15, fontWeight:700, color:"#e2e8f0", margin:0 }}>{c.name}</h4>
                    <StatusPill status={c.status} />
                    <span style={{ fontSize:12, color:"#64748b" }}>{c.platformLabel}</span>
                  </div>
                  {c.utm_campaign
                    ? <p style={{ ...mono, fontSize:11.5, color:"#7C3AED", margin:"6px 0 0" }}>utm_campaign={c.utm_campaign}</p>
                    : <p style={{ fontSize:11.5, color:"#64748b", margin:"6px 0 0" }}>No UTM - signups here can only be self-reported or hand-counted</p>}
                  {c.details && <p style={{ fontSize:12.5, color:"#94a3b8", margin:"8px 0 0", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{c.details}</p>}
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ ...mono, fontSize:20, fontWeight:700, color:"#e2e8f0", margin:0 }}>{gbp(c.spendPence)}</p>
                  <p style={{ fontSize:11, color:"#64748b", margin:"2px 0 0" }}>
                    {c.spendRows ? `${c.spendRows} entr${c.spendRows === 1 ? "y" : "ies"}` : "no spend logged"}
                  </p>
                </div>
              </div>

              {/* The three counts, each with its own cost. Reading across this
                  row is the whole point of the screen: where they agree you can
                  trust the number, and where they diverge you can see it. */}
              {/* Wraps rather than scrolls sideways.
                  It was a horizontal scroller, which passed the mobile check
                  because the content was technically reachable - while on a
                  375px screen the print campaign showed "TRACKED 0" in the
                  first slot and hid its actual figure, 3 manual signups, off
                  the right edge. A number you have to discover by swiping is
                  not on screen, and the one that gets hidden is whichever the
                  campaign happens to be measured by. */}
              <div style={{ marginTop:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(115px, 1fr))", gap:10 }}>
                  {[
                    { k:"tracked", title:"Tracked", why:"arrived with the tag", colour:"#22c55e" },
                    { k:"claimed", title:"Self-reported", why:"platform-wide, in dates", colour:"#94a3b8" },
                    { k:"manual",  title:"Manual", why:"typed in by hand", colour:"#94a3b8" },
                  ].map(x => (
                    <div key={x.k} style={{ padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.02)", border:`1px solid ${c.best === x.k ? `${x.colour}55` : "rgba(255,255,255,0.06)"}` }}>
                      <p style={{ ...label, marginBottom:4 }}>{x.title}</p>
                      <p style={{ ...mono, fontSize:18, fontWeight:700, color:x.colour, margin:0 }}>{c.signups[x.k]}</p>
                      <p style={{ ...mono, fontSize:12, color:"#e2e8f0", margin:"4px 0 0" }}>{cps(c.costPerSignup[x.k])}<span style={{ ...label, marginBottom:0, marginLeft:4 }}>each</span></p>
                      <p style={{ fontSize:10.5, color:"#475569", margin:"4px 0 0", lineHeight:1.4 }}>{x.why}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
                <button style={ghost} onClick={() => { const next = expanded === c.id ? null : c.id; setExpanded(next); if (next) loadSignups(c.id); }}>
                  {expanded === c.id ? "Hide" : "Spend & signups"}
                </button>
                <button style={ghost} onClick={() => patch(c.id, { archived: !c.archived })} disabled={busy === `patch-${c.id}`}>
                  {c.archived ? "Unarchive" : "Archive"}
                </button>
              </div>

              {expanded === c.id && (
                <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                  <p style={label}>Add spend</p>
                  <div style={{ display:"grid", gap:8, gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", alignItems:"end" }}>
                    <input style={input} type="date" value={spendForm[c.id]?.spentOn || ""} onChange={e => setSpendForm(s => ({ ...s, [c.id]: { ...s[c.id], spentOn:e.target.value } }))} />
                    <input style={input} placeholder="Amount, e.g. 250" value={spendForm[c.id]?.amount || ""} onChange={e => setSpendForm(s => ({ ...s, [c.id]: { ...s[c.id], amount:e.target.value } }))} />
                    <input style={input} placeholder="Note (optional)" value={spendForm[c.id]?.note || ""} onChange={e => setSpendForm(s => ({ ...s, [c.id]: { ...s[c.id], note:e.target.value } }))} />
                    <button style={btn()} onClick={() => addSpend(c.id)} disabled={busy === `spend-${c.id}`}>
                      {busy === `spend-${c.id}` ? "Saving…" : "Add"}
                    </button>
                  </div>

                  {c.firstSpendOn && (
                    <p style={{ fontSize:11.5, color:"#64748b", margin:"10px 0 0" }}>
                      Spend recorded from {c.firstSpendOn} to {c.lastSpendOn}.
                    </p>
                  )}

                  {signups[c.id] && (
                    <div style={{ marginTop:14 }}>
                      <p style={label}>Who signed up</p>
                      {!signups[c.id].tracked.length && !signups[c.id].claimed.length && (
                        <p style={{ fontSize:12.5, color:"#64748b", lineHeight:1.6 }}>Nobody yet, by either measure.</p>
                      )}
                      {signups[c.id].tracked.map(u => (
                        <div key={`t${u.id}`} style={{ display:"flex", justifyContent:"space-between", gap:10, padding:"6px 0", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                          <span style={{ fontSize:12.5, color:"#e2e8f0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</span>
                          <span style={{ fontSize:11.5, color:"#22c55e", whiteSpace:"nowrap" }}>tracked · {new Date(u.created_at).toLocaleDateString("en-GB")}</span>
                        </div>
                      ))}
                      {signups[c.id].claimed.map(u => (
                        <div key={`c${u.id}`} style={{ display:"flex", justifyContent:"space-between", gap:10, padding:"6px 0", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                          <span style={{ fontSize:12.5, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</span>
                          <span style={{ fontSize:11.5, color:"#64748b", whiteSpace:"nowrap" }}>said "{u.referral_source}"</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* The caveat that stops a zero being misread. Placed at the bottom
              rather than the top: it matters when someone is puzzled by a
              number, not before they have seen one. */}
          <p style={{ fontSize:11.5, color:"#475569", lineHeight:1.6, marginTop:8 }}>{data.trackingNote}</p>
        </>
      )}
    </Section>
  );
};

export default MarketingSection;
