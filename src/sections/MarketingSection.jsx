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
import { Section } from "../shared.jsx";
import { EmptyState, Kpi, SkeletonRows } from "../Shell.jsx";

const CARD_GAP = 20;
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
  running:   { pill:"pill-green", label:"Running" },
  scheduled: { pill:"pill-purple", label:"Scheduled" },
  ended:     { pill:"pill-grey", label:"Ended" },
};

const StatusPill = ({ status }) => {
  const c = STATUS[status] || STATUS.running;
  return <span className={`pill ${c.pill}`}>{c.label}</span>;
};

const readJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`The API returned ${res.status} instead of data.`); }
};

const EMPTY_FORM = { name:"", platform:"google_ads", details:"", utmCampaign:"", utmSource:"", landingUrl:"", startedOn:"", endedOn:"", manualSignups:"" };


// The leads themselves.
//
// The funnel above counts them and the privacy panel counts them again, but
// until now there was nowhere to look at one - so a lead arrived, became a
// number, and was never followed up. Signed-up leads are marked, because
// "120 leads" and "9 of them became accounts" are different facts and only
// the second tells you whether any of this is working.
const LeadsPanel = ({ adminFetch, API_URL }) => {
  // Send a lead to the Prospects pipeline: same URL, same flow as one typed
  // in by hand. The lead id travels with it so the two rows stay connected.
  //
  // The scan starts server side and nobody waits for it. Pressing this on
  // twenty leads in a minute queues twenty scans that run one at a time, so
  // the button comes back immediately and the Prospects tab fills in as they
  // finish, rather than the browser holding twenty open crawls.
  const [prospecting, setProspecting] = useState(null);
  const [prospected, setProspected] = useState([]);
  const addProspect = async (l) => {
    setProspecting(l.id);
    try {
      const r = await adminFetch(`${API_URL}/admin/prospects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: l.url, email: l.email || undefined, leadId: l.id, research: true }),
      });
      if (r.ok) setProspected(p => [...p, l.id]);
    } catch { /* the Prospects tab is the place that reports its own errors */ }
    finally { setProspecting(null); }
  };

  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [consentedOnly, setConsentedOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const qs = new URLSearchParams({ limit: "200" });
      if (search.trim()) qs.set("search", search.trim());
      if (consentedOnly) qs.set("consented", "1");
      const r = await adminFetch(`${API_URL}/admin/marketing/leads?${qs}`);
      setData(await r.json());
    } catch { setData({ leads: [], counts: {} }); }
    setBusy(false);
  };

  useEffect(() => { if (open && !data) load(); /* eslint-disable-next-line */ }, [open]);

  const c = data?.counts || {};
  return (
    <div className="card" style={{ marginTop:16, marginBottom:CARD_GAP }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <div>
          <div className="card-title" style={{ fontSize:14 }}>Leads</div>
          <div className="card-sub">
            {data
              ? `${c.total} total · ${c.consented} opted in to marketing · ${c.anonymous} with no email · ${c.last7} in the last 7 days`
              : "Everyone who ran a free scan or asked for a report."}
          </div>
        </div>
        <button type="button" className="btn btn-sm" onClick={() => setOpen(o => !o)}>
          {open ? "Hide" : "View leads"}
        </button>
      </div>

      {open && (
        <>
          <div style={{ display:"flex", gap:8, alignItems:"center", margin:"14px 0 10px", flexWrap:"wrap" }}>
            <input className="field" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") load(); }}
              placeholder="Search email or site…"
              style={{ flex:1, minWidth:200, width:"auto" }} />
            <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text-2)", cursor:"pointer" }}>
              <input type="checkbox" checked={consentedOnly} onChange={e => setConsentedOnly(e.target.checked)} />
              Opted in only
            </label>
            <button type="button" className="btn btn-primary btn-sm" onClick={load} disabled={busy}>
              {busy ? "Loading…" : "Search"}
            </button>
          </div>

          {!data ? (busy ? <SkeletonRows rows={4} /> : null) : data.leads.length === 0 ? (
            <EmptyState title="No leads match that" text="Try a shorter search, or clear the opted-in filter." />
          ) : (
            <div className="scroll-x" style={{ maxHeight:460, overflowY:"auto", border:"1px solid var(--border)", borderRadius:10 }}>
              <table className="tbl" style={{ fontSize:12 }}>
                <thead>
                  <tr>
                    {["Email","Site","Source","Score","Campaign","When","Account"].map(h => (
                      <th key={h} style={{ position:"sticky", top:0, background:"var(--card)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.leads.map(l => (
                    <tr key={l.id}>
                      <td style={{ color:"var(--text)", whiteSpace:"nowrap" }}>
                        {l.email || <span style={{ color:"var(--muted)" }}>anonymous</span>}
                        {l.marketing_consent && <span title="Opted in to marketing" className="pill pill-green" style={{ marginLeft:6, fontSize:9.5, padding:"1px 6px" }}>OPT-IN</span>}
                      </td>
                      <td title={l.url} style={{ maxWidth:240 }}>
                        {/* The address is the useful thing on this row: it is
                            somebody's actual website and the first thing you
                            want to do is look at it. Opened in a new tab with
                            noopener, because it is a stranger's site. */}
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <a href={l.url} target="_blank" rel="noopener noreferrer"
                            style={{ flex:1, minWidth:0, color:"var(--sky)", textDecoration:"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {l.url.replace(/^https?:\/\/(www\.)?/, "")}
                          </a>
                          <button type="button" className="btn btn-sm btn-active" onClick={() => addProspect(l)} disabled={prospecting === l.id}
                            title={prospected.includes(l.id) ? "Added. The scan is running now; the result appears in the Prospects tab." : "Add to Prospects: scans the site, looks for a contact and drafts an email"}
                            style={{ flexShrink:0, minHeight:26, padding:"0 8px", fontSize:11 }}>
                            {prospecting === l.id ? "…" : prospected.includes(l.id) ? "Added" : "Prospect"}
                          </button>
                        </div>
                      </td>
                      <td style={{ color:"var(--muted)", whiteSpace:"nowrap" }}>{l.source}</td>
                      <td className="num" style={{ color:"var(--text-2)" }}>{l.score ?? "-"}</td>
                      <td style={{ color:"var(--muted)", whiteSpace:"nowrap" }}>{/* Campaign and source are different facts and were sharing one
                            cell, so "chatgpt.com" (a source: they arrived from
                            ChatGPT) looked like a campaign name we had chosen.
                            Shown separately, and labelled. */}
                        {l.utm_campaign || l.utm_source ? (
                          <>
                            {l.utm_campaign && <div title="utm_campaign">{l.utm_campaign}</div>}
                            {l.utm_source && (
                              <div style={{ fontSize:10.5, color:"var(--dim)" }} title="utm_source: where they came from">
                                via {l.utm_source}{l.utm_medium ? ` · ${l.utm_medium}` : ""}
                              </div>
                            )}
                          </>
                        ) : <span style={{ color:"var(--muted)" }}>direct</span>}</td>
                      <td style={{ color:"var(--muted)", whiteSpace:"nowrap" }}>
                        {/* Date and the time to the second. Several leads
                            arrive within a minute of each other from one
                            person trying a few URLs, and a bare date cannot
                            tell that apart from five separate visitors. */}
                        <div>{new Date(l.submitted_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"2-digit" })}</div>
                        <div className="mono" style={{ fontSize:10.5, color:"var(--dim)" }}
                          title={new Date(l.submitted_at).toISOString()}>
                          {new Date(l.submitted_at).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false })}
                        </div>
                      </td>
                      <td style={{ whiteSpace:"nowrap" }}>
                        {l.user_id
                          ? <span className="pill pill-purple">{l.plan || "signed up"}</span>
                          : <span style={{ color:"var(--muted)" }}>-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

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
  const roasTone = (r) => (r === null || r === undefined ? "grey" : r >= 1 ? "green" : "red");

  return (
    <Section>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:14 }}>
        <button type="button" className="btn" onClick={load}>Refresh</button>
        <button type="button" className="btn btn-primary" onClick={() => setShow(v => !v)}>{showForm ? "Cancel" : "New campaign"}</button>
      </div>

      {error && (
        <div className="card" style={{ marginBottom:CARD_GAP, borderColor:"rgba(248,113,113,0.3)", background:"rgba(248,113,113,0.08)", color:"var(--red)", fontSize:13 }}>{error}</div>
      )}

      {showForm && (
        <form onSubmit={createCampaign} className="card" style={{ marginBottom:CARD_GAP }}>
          <p className="label" style={{ marginBottom:10 }}>New campaign</p>
          <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))" }}>
            <div>
              <p className="label" style={{ marginBottom:6 }}>Name</p>
              <input className="field" value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} placeholder="Spring search push" />
            </div>
            <div>
              <p className="label" style={{ marginBottom:6 }}>Platform</p>
              <select className="field" value={form.platform} onChange={e => setForm(f => ({ ...f, platform:e.target.value }))}>
                {(data?.platforms || []).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <p className="label" style={{ marginBottom:6 }}>Starts</p>
              <input className="field" type="date" value={form.startedOn} onChange={e => setForm(f => ({ ...f, startedOn:e.target.value }))} />
            </div>
            <div>
              <p className="label" style={{ marginBottom:6 }}>Ends (optional)</p>
              <input className="field" type="date" value={form.endedOn} onChange={e => setForm(f => ({ ...f, endedOn:e.target.value }))} />
            </div>
            <div>
              <p className="label" style={{ marginBottom:6 }}>utm_campaign</p>
              <input className="field mono" value={form.utmCampaign} onChange={e => setForm(f => ({ ...f, utmCampaign:e.target.value }))} placeholder="spring26" />
            </div>
            <div>
              <p className="label" style={{ marginBottom:6 }}>Signups so far (optional)</p>
              <input className="field" type="number" min="0" value={form.manualSignups} onChange={e => setForm(f => ({ ...f, manualSignups:e.target.value }))} placeholder="0" />
            </div>
          </div>
          <div style={{ marginTop:12 }}>
            <p className="label" style={{ marginBottom:6 }}>Details</p>
            <textarea className="field" style={{ minHeight:70, resize:"vertical" }} value={form.details} onChange={e => setForm(f => ({ ...f, details:e.target.value }))} placeholder="Audience, creative, bid strategy, anything you will want to remember in six months." />
          </div>
          {/* Said at the point the field is filled in, not buried in a help
              page - this is the one instruction that makes tracking work. */}
          <p style={{ fontSize:12, color:"var(--muted)", lineHeight:1.6, marginTop:12 }}>
            Put <span className="mono" style={{ color:"var(--text)" }}>?utm_campaign={form.utmCampaign || "spring26"}&amp;utm_source={form.platform}</span> on the end of the ad's landing page URL.
            Signups arriving with it are counted as <strong>tracked</strong> - the only count that is hard evidence.
            Leave it blank for offline campaigns and use the manual figure instead.
          </p>
          <button type="submit" className="btn btn-primary" style={{ marginTop:12 }} disabled={busy === "create"}>
            {busy === "create" ? "Saving…" : "Create campaign"}
          </button>
        </form>
      )}

      {!data && !error && <div className="card" style={{ marginBottom:CARD_GAP }}><SkeletonRows rows={5} /></div>}

      {data && (
        <>
          {/* THE FUNNEL: leads -> signups -> paying, plus verified revenue.
              "Paying" means at least one successful Stripe charge - a granted
              plan is not cash and does not count. The lead -> signup step is
              indicative (they are parallel entry points, not a sequence);
              signup -> paying is a true subset and its rate can be trusted. */}
          {data.funnel && (
            <div className="card" style={{ marginBottom:CARD_GAP }}>
              <p className="label">Funnel</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:10, marginTop:8 }}>
                {data.funnel.stages.map((s, i) => (
                  <div key={s.key} style={{ padding:"12px 14px", borderRadius:10, background:"var(--purple-soft)", border:"1px solid rgba(124,58,237,0.2)" }}>
                    <p className="label" style={{ marginBottom:4 }}>{s.label}</p>
                    <p style={{ ...mono, fontSize:22, fontWeight:700, color:"var(--text)", margin:0 }}>{s.count}</p>
                    {i > 0 && (
                      <p style={{ fontSize:11, color: s.indicative ? "var(--muted)" : "var(--text-2)", margin:"4px 0 0" }}>
                        {s.ratePctFromPrev === null ? "no upstream yet" : `${s.ratePctFromPrev}% of ${data.funnel.stages[i - 1].label.toLowerCase()}`}
                        {s.indicative ? " · indicative" : ""}
                      </p>
                    )}
                    {i === 0 && <p style={{ fontSize:11, color:"var(--muted)", margin:"4px 0 0" }}>free-scan emails</p>}
                  </div>
                ))}
                <div style={{ padding:"12px 14px", borderRadius:10, background:"rgba(52,211,153,0.06)", border:"1px solid rgba(52,211,153,0.25)" }}>
                  <p className="label" style={{ marginBottom:4 }}>Revenue</p>
                  <p style={{ ...mono, fontSize:22, fontWeight:700, color:"var(--green)", margin:0 }}>{gbp(data.funnel.revenuePence)}</p>
                  <p style={{ fontSize:11, color:"var(--muted)", margin:"4px 0 0" }}>Stripe-verified, all time</p>
                </div>
              </div>
              <p style={{ fontSize:11, color:"var(--muted)", margin:"10px 0 0", lineHeight:1.5 }}>
                Leads and signups are parallel doors in, so that first rate is directional, not causal. Paying counts only people with a successful Stripe charge - plans granted by hand are not revenue.
              </p>
            </div>
          )}

          {/* The list behind the funnel's first number. It sits directly under
              the count it explains rather than behind a tab nobody opens. */}
          <LeadsPanel adminFetch={adminFetch} API_URL={API_URL} />

          {/* Totals. Spend is a single figure because a pound is a pound.
              Signups are three figures because they are three different
              claims - and merging them is the one thing this screen must
              never do. */}
          <div className="kpi-grid" style={{ marginBottom:CARD_GAP }}>
            <Kpi label="Total spend" value={gbp(t.spendPence)} sub={`${t.campaigns} campaign${t.campaigns === 1 ? "" : "s"}, ${t.running} running`} />
            <Kpi label="Tracked signups" value={t.signups.tracked} tone="green" sub="arrived with a campaign tag" />
            {/* Divided by trackable spend only. Including offline spend that
                can never produce a tracked signup would make the channels
                that do work look expensive. */}
            <Kpi label="Cost per tracked signup" value={cps(t.costPerTrackedSignup)} sub={`over ${gbp(t.trackablePence)} of taggable spend`} />
            {/* ROAS over trackable spend, from tracked users' Stripe charges
                only. Null (a dash) until there is both spend and attributable
                revenue - never a made-up number from softer evidence. */}
            <Kpi label="ROAS (tracked)" tone={roasTone(t.revenue?.roas)}
              value={t.revenue?.roas === null || t.revenue?.roas === undefined ? "-" : `${t.revenue.roas}x`}
              sub={`${gbp(t.revenue?.trackedPence || 0)} back from ${t.revenue?.trackedPaying || 0} paying`} />
            <Kpi label="Self-reported / manual" value={`${t.signups.claimed} / ${t.signups.manual}`} tone="grey" sub="softer evidence, kept separate" />
          </div>

          {t.untrackablePence > 0 && (
            <p style={{ fontSize:12, color:"var(--gold)", lineHeight:1.6, marginTop:-8, marginBottom:CARD_GAP }}>
              {gbp(t.untrackablePence)} of spend is on campaigns with no utm_campaign, so it can never appear in the tracked figure.
              {t.untrackablePence > t.trackablePence && " That is most of the budget - read the tracked number as a corner of the picture, not the whole of it."}
            </p>
          )}

          {data.spendByMonth.length > 1 && (
            <div className="card" style={{ marginBottom:CARD_GAP }}>
              <p className="label">Spend by month</p>
              <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:110, marginTop:10 }}>
                {data.spendByMonth.map(m => (
                  <div key={m.month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, minWidth:0 }} title={`${shortMonth(m.month)}: ${gbp(m.pence)}`}>
                    {/* A month with no spend still gets a slot, so a pause in
                        advertising looks like a pause rather than like
                        continuous activity. */}
                    <div style={{ width:"100%", height:Math.max(2, Math.round((m.pence / maxMonth) * 80)), background: m.pence ? "var(--purple)" : "rgba(255,255,255,0.08)", borderRadius:"4px 4px 0 0" }} />
                    <span style={{ fontSize:10, color:"var(--muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%" }}>{shortMonth(m.month)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!data.orphanUtms.length && (
            <div className="card" style={{ marginBottom:CARD_GAP, borderColor:"rgba(245,158,11,0.3)" }}>
              <p className="label" style={{ marginBottom:6 }}>Signups tagged with an unknown campaign</p>
              <p style={{ fontSize:12.5, color:"var(--text-2)", lineHeight:1.6, margin:"0 0 10px" }}>
                These people arrived with a utm_campaign that matches no campaign here - usually a typo in the ad, or a campaign never logged.
                Their signups are currently credited to nothing.
              </p>
              {data.orphanUtms.map(o => (
                <div key={o.utm} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"6px 0", borderTop:"1px solid var(--border)" }}>
                  <span style={{ ...mono, fontSize:12.5, color:"var(--text)" }}>{o.utm}</span>
                  <span style={{ ...mono, fontSize:12.5, color:"var(--gold)" }}>{o.signups} signup{o.signups === 1 ? "" : "s"}</span>
                </div>
              ))}
            </div>
          )}

          {!data.campaigns.length && (
            <div className="card" style={{ marginBottom:CARD_GAP }}>
              <EmptyState title="No campaigns logged yet"
                text="Log one for anything you spend money on to get people here - ads, sponsorships, a newsletter placement."
                action={<button type="button" className="btn btn-primary" onClick={() => setShow(true)}>New campaign</button>} />
            </div>
          )}

          {data.campaigns.map(c => (
            <div key={c.id} className="card" style={{ marginBottom:CARD_GAP }}>
              <div style={{ display:"flex", gap:12, alignItems:"flex-start", flexWrap:"wrap", justifyContent:"space-between" }}>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                    <h4 className="card-title">{c.name}</h4>
                    <StatusPill status={c.status} />
                    <span style={{ fontSize:12, color:"var(--muted)" }}>{c.platformLabel}</span>
                  </div>
                  {c.utm_campaign
                    ? <p style={{ ...mono, fontSize:11.5, color:"var(--purple-text)", margin:"6px 0 0" }}>utm_campaign={c.utm_campaign}</p>
                    : <p style={{ fontSize:11.5, color:"var(--muted)", margin:"6px 0 0" }}>No UTM - signups here can only be self-reported or hand-counted</p>}
                  {c.details && <p style={{ fontSize:12.5, color:"var(--text-2)", margin:"8px 0 0", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{c.details}</p>}
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ ...mono, fontSize:20, fontWeight:700, color:"var(--text)", margin:0 }}>{gbp(c.spendPence)}</p>
                  <p style={{ fontSize:11, color:"var(--muted)", margin:"2px 0 0" }}>
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
                    { k:"tracked", title:"Tracked", why:"arrived with the tag", colour:"var(--green)", ring:"rgba(52,211,153,0.35)" },
                    { k:"claimed", title:"Self-reported", why:"platform-wide, in dates", colour:"var(--text-2)", ring:"rgba(255,255,255,0.25)" },
                    { k:"manual",  title:"Manual", why:"typed in by hand", colour:"var(--text-2)", ring:"rgba(255,255,255,0.25)" },
                  ].map(x => (
                    <div key={x.k} style={{ padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.02)", border:`1px solid ${c.best === x.k ? x.ring : "var(--border)"}` }}>
                      <p className="label" style={{ marginBottom:4 }}>{x.title}</p>
                      <p style={{ ...mono, fontSize:18, fontWeight:700, color:x.colour, margin:0 }}>{c.signups[x.k]}</p>
                      <p style={{ ...mono, fontSize:12, color:"var(--text)", margin:"4px 0 0" }}>{cps(c.costPerSignup[x.k])}<span className="label" style={{ marginLeft:4 }}>each</span></p>
                      <p style={{ fontSize:10.5, color:"var(--muted)", margin:"4px 0 0", lineHeight:1.4 }}>{x.why}</p>
                    </div>
                  ))}
                </div>

                {/* Returns, tracked evidence only: what the people who arrived
                    carrying this campaign's tag went on to pay via Stripe.
                    ROAS/ROI stay dashes until there is spend to divide by -
                    and there is deliberately no claimed or manual revenue,
                    because invented money on a budget screen is worse than a
                    dash. */}
                {c.utm_campaign && (
                  <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"baseline", marginTop:10, padding:"10px 12px", borderRadius:10, background:"rgba(52,211,153,0.04)", border:"1px solid rgba(52,211,153,0.15)" }}>
                    <span className="label">Returns</span>
                    <span style={{ ...mono, fontSize:13, color:"var(--green)" }}>{gbp(c.revenue?.trackedPence || 0)} revenue</span>
                    <span style={{ ...mono, fontSize:13, color:"var(--text)" }}>{c.revenue?.trackedPaying || 0} paying</span>
                    <span style={{ ...mono, fontSize:13, color: c.revenue?.roas === null || c.revenue?.roas === undefined ? "var(--muted)" : c.revenue.roas >= 1 ? "var(--green)" : "var(--red)" }}>
                      ROAS {c.revenue?.roas === null || c.revenue?.roas === undefined ? "-" : `${c.revenue.roas}x`}
                    </span>
                    <span style={{ ...mono, fontSize:13, color: c.revenue?.roiPct === null || c.revenue?.roiPct === undefined ? "var(--muted)" : c.revenue.roiPct >= 0 ? "var(--green)" : "var(--red)" }}>
                      ROI {c.revenue?.roiPct === null || c.revenue?.roiPct === undefined ? "-" : `${c.revenue.roiPct > 0 ? "+" : ""}${c.revenue.roiPct}%`}
                    </span>
                    <span style={{ fontSize:10.5, color:"var(--muted)" }}>from tracked signups' Stripe charges</span>
                  </div>
                )}
              </div>

              <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
                <button type="button" className="btn btn-sm" onClick={() => { const next = expanded === c.id ? null : c.id; setExpanded(next); if (next) loadSignups(c.id); }}>
                  {expanded === c.id ? "Hide" : "Spend & signups"}
                </button>
                <button type="button" className="btn btn-sm" onClick={() => patch(c.id, { archived: !c.archived })} disabled={busy === `patch-${c.id}`}>
                  {c.archived ? "Unarchive" : "Archive"}
                </button>
              </div>

              {expanded === c.id && (
                <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid var(--border)" }}>
                  <p className="label" style={{ marginBottom:6 }}>Add spend</p>
                  <div style={{ display:"grid", gap:8, gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", alignItems:"end" }}>
                    <input className="field" type="date" value={spendForm[c.id]?.spentOn || ""} onChange={e => setSpendForm(s => ({ ...s, [c.id]: { ...s[c.id], spentOn:e.target.value } }))} />
                    <input className="field" placeholder="Amount, e.g. 250" value={spendForm[c.id]?.amount || ""} onChange={e => setSpendForm(s => ({ ...s, [c.id]: { ...s[c.id], amount:e.target.value } }))} />
                    <input className="field" placeholder="Note (optional)" value={spendForm[c.id]?.note || ""} onChange={e => setSpendForm(s => ({ ...s, [c.id]: { ...s[c.id], note:e.target.value } }))} />
                    <button type="button" className="btn btn-primary" onClick={() => addSpend(c.id)} disabled={busy === `spend-${c.id}`}>
                      {busy === `spend-${c.id}` ? "Saving…" : "Add"}
                    </button>
                  </div>

                  {c.firstSpendOn && (
                    <p style={{ fontSize:11.5, color:"var(--muted)", margin:"10px 0 0" }}>
                      Spend recorded from {c.firstSpendOn} to {c.lastSpendOn}.
                    </p>
                  )}

                  {signups[c.id] && (
                    <div style={{ marginTop:14 }}>
                      <p className="label" style={{ marginBottom:6 }}>Who signed up</p>
                      {!signups[c.id].tracked.length && !signups[c.id].claimed.length && (
                        <p style={{ fontSize:12.5, color:"var(--muted)", lineHeight:1.6 }}>Nobody yet, by either measure.</p>
                      )}
                      {signups[c.id].tracked.map(u => (
                        <div key={`t${u.id}`} style={{ display:"flex", justifyContent:"space-between", gap:10, padding:"6px 0", borderTop:"1px solid var(--border)" }}>
                          <span style={{ fontSize:12.5, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</span>
                          <span style={{ fontSize:11.5, color:"var(--green)", whiteSpace:"nowrap" }}>tracked · {new Date(u.created_at).toLocaleDateString("en-GB")}</span>
                        </div>
                      ))}
                      {signups[c.id].claimed.map(u => (
                        <div key={`c${u.id}`} style={{ display:"flex", justifyContent:"space-between", gap:10, padding:"6px 0", borderTop:"1px solid var(--border)" }}>
                          <span style={{ fontSize:12.5, color:"var(--text-2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</span>
                          <span style={{ fontSize:11.5, color:"var(--muted)", whiteSpace:"nowrap" }}>said "{u.referral_source}"</span>
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
          <p style={{ fontSize:11.5, color:"var(--muted)", lineHeight:1.6, marginTop:8 }}>{data.trackingNote}</p>
        </>
      )}
    </Section>
  );
};

export default MarketingSection;
