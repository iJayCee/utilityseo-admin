// Prospecting: a website we might be able to help, from URL to sent email.
//
// Put in an address, we scan it and look for a way to write to them, then
// pick an angle and copy the draft. Nothing is sent from here. The draft is
// written from the scan and only from the scan, so every claim in it is
// something the reader can check on their own site in thirty seconds.
//
// The contact list separates role addresses (info@, hello@) from named ones.
// That distinction is legal, not cosmetic: a published company address is a
// corporate subscriber and fair game for business post, a named person's
// address is their personal data and a weaker footing. The label is there so
// the choice is made with eyes open.
import { useEffect, useState } from "react";
import { EmptyState, Kpi, SkeletonRows } from "../Shell.jsx";

const STATUS_META = {
  new:        { label: "New",        pill: "pill-grey" },
  researched: { label: "Researched", pill: "pill-purple" },
  contacted:  { label: "Contacted",  pill: "pill-gold" },
  replied:    { label: "Replied",    pill: "pill-green" },
  signed_up:  { label: "Signed up",  pill: "pill-green" },
  dead:       { label: "No",         pill: "pill-grey" },
};

const SEV = { critical: "var(--red)", high: "#fb923c", medium: "var(--gold)", low: "var(--muted)" };

const CARD_GAP = 16;
const muted = { fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6, margin: 0 };

const ProspectsSection = ({ adminFetch, API_URL }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState("");
  const [openId, setOpenId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [chosen, setChosen] = useState({});
  const [codes, setCodes] = useState([]);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState("");

  const call = async (path, opts = {}) => {
    const r = await adminFetch(`${API_URL}/admin/prospects${path}`, {
      ...opts,
      headers: { ...(opts.headers || {}), ...(opts.body ? { "Content-Type": "application/json" } : {}) },
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "That did not work.");
    return d;
  };

  const load = async () => {
    setError("");
    try { setData(await call("")); } catch (e) { setError(e.message); }
  };

  useEffect(() => {
    load();
    adminFetch(`${API_URL}/admin/promo-codes`).then(r => r.ok ? r.json() : null)
      .then(d => setCodes((d?.codes || d || []).filter(c => c.is_active)))
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const add = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy("add"); setError("");
    try {
      const d = await call("", { method: "POST", body: JSON.stringify({ url: url.trim(), email: email.trim() || undefined }) });
      setUrl(""); setEmail("");
      await load();
      setOpenId(d.prospect.id);
      research(d.prospect.id);
    } catch (e2) { setError(e2.message); } finally { setBusy(""); }
  };

  const research = async (id) => {
    setBusy(`research-${id}`); setError("");
    try {
      const d = await call(`/${id}/research`, { method: "POST" });
      if (d.scanError || d.contactError) setError([d.scanError, d.contactError].filter(Boolean).join(" "));
      await load();
      loadDraft(id);
    } catch (e) { setError(e.message); } finally { setBusy(""); }
  };

  const loadDraft = async (id) => {
    try {
      const d = await call(`/${id}/draft${code ? `?code=${encodeURIComponent(code)}` : ""}`);
      setDrafts(x => ({ ...x, [id]: d }));
      const first = d.templates.find(t => t.available);
      if (first) setChosen(x => ({ ...x, [id]: x[id] || first.id }));
    } catch (e) { setDrafts(x => ({ ...x, [id]: { error: e.message, templates: [] } })); }
  };

  const patch = async (id, body) => {
    try { await call(`/${id}`, { method: "PATCH", body: JSON.stringify(body) }); await load(); }
    catch (e) { setError(e.message); }
  };

  const copy = async (id, text) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(""), 2000); } catch { setError("Could not copy. Select the text and copy it by hand."); }
  };

  // The add form renders straight away, the way every other section does.
  // Returning a bare "Loading…" left the tab empty for as long as the
  // request took, and meant a render test of this section only ever proved
  // that the word Loading appears.
  return (
    <div>
      {data && (
        <div className="kpi-grid" style={{ marginBottom: CARD_GAP }}>
          {[["total", "Total"], ["contacted", "Contacted"], ["replied", "Replied"], ["signed_up", "Signed up"]].map(([k, label]) => (
            <Kpi key={k} label={label} value={data.counts?.[k] ?? 0} />
          ))}
        </div>
      )}

      <div className="card" style={{ marginBottom: CARD_GAP }}>
        <p className="card-title">Add a website</p>
        <p className="card-sub">
          A website, a scan, a way to reach them and a draft written from what the scan found. Nothing sends from here: you copy the draft and send it yourself.
        </p>
        <form onSubmit={add} style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <input className="field" value={url} onChange={e => setUrl(e.target.value)} placeholder="theirwebsite.co.uk" style={{ flex: "2 1 240px", minWidth: 0, width: "auto" }} />
          <input className="field" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact email, if you have one" style={{ flex: "2 1 220px", minWidth: 0, width: "auto" }} />
          <select className="field" value={code} onChange={e => setCode(e.target.value)} style={{ flex: "1 1 150px", width: "auto" }}>
            <option value="">No trial code</option>
            {codes.map(c => <option key={c.code} value={c.code}>{c.code} ({c.trial_days}d {c.trial_plan})</option>)}
          </select>
          <button type="submit" className="btn btn-primary" disabled={busy === "add" || !url.trim()}>{busy === "add" ? "Adding…" : "Add and scan"}</button>
        </form>
        {error && <p style={{ ...muted, color: "var(--red)", marginTop: 10 }}>{error}</p>}
      </div>

      {!data && !error && <div className="card" style={{ marginBottom: CARD_GAP }}><SkeletonRows rows={4} /></div>}
      {data?.prospects?.length === 0 && <div className="card" style={{ marginBottom: CARD_GAP }}><EmptyState title="Nothing here yet" text="Add a website above, or send one over from the Leads table on the Marketing tab." /></div>}

      {data?.prospects?.map(p => {
        const meta = STATUS_META[p.status] || STATUS_META.new;
        const open = openId === p.id;
        const draft = drafts[p.id];
        const picked = draft?.templates?.find(t => t.id === chosen[p.id]);
        const issues = p.scan?.issues || [];
        return (
          <div key={p.id} className="card" style={{ marginBottom: CARD_GAP }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span className={`pill ${meta.pill}`}>{meta.label}</span>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{p.company || p.domain}</div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="mono" style={{ fontSize: 12, color: "var(--sky)", textDecoration: "none" }}>{p.domain} ↗</a>
              </div>
              {p.scan?.score != null && (
                <div style={{ textAlign: "center" }}>
                  <div className="label">Score</div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: p.scan.score >= 80 ? "var(--green)" : p.scan.score >= 60 ? "var(--gold)" : "var(--red)" }}>{p.scan.score}</div>
                </div>
              )}
              {p.contact_email && (
                <div style={{ textAlign: "right", minWidth: 160 }}>
                  <div className="mono" style={{ fontSize: 12, color: "var(--text)" }}>{p.contact_email}</div>
                  <div style={{ fontSize: 10.5, color: p.contact_kind === "personal" ? "var(--gold)" : "var(--muted)" }}>
                    {p.contact_kind === "role" ? "company address" : p.contact_kind === "personal" ? "a named person" : p.contact_kind || ""}
                  </div>
                </div>
              )}
              <button type="button" className="btn btn-sm" onClick={() => { setOpenId(open ? null : p.id); if (!open && !drafts[p.id] && p.scan) loadDraft(p.id); }}>{open ? "Close" : "Open"}</button>
            </div>

            {open && (
              <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  <button type="button" className={`btn btn-sm${!p.scan ? " btn-primary" : ""}`} onClick={() => research(p.id)} disabled={busy === `research-${p.id}`}>
                    {busy === `research-${p.id}` ? "Scanning…" : p.scan ? "Scan again" : "Scan and find a contact"}
                  </button>
                  {Object.entries(STATUS_META).map(([k, m]) => k !== p.status && (
                    <button key={k} type="button" className="btn btn-sm" onClick={() => patch(p.id, { status: k })}>Mark {m.label.toLowerCase()}</button>
                  ))}
                </div>

                {!p.scan && <p style={muted}>No scan yet. Scan the site and the drafts fill themselves in from what it finds.</p>}

                {p.scan && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
                    <div>
                      <p className="label" style={{ margin: "0 0 8px" }}>
                        What we found on {p.scan.pagesScanned} page{p.scan.pagesScanned === 1 ? "" : "s"}
                      </p>
                      {issues.length === 0 && <p style={muted}>Nothing wrong, which is rarer than you would think. The "just the report" angle is the honest one here.</p>}
                      {issues.slice(0, 8).map(i => (
                        <div key={i.id} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: 99, background: SEV[i.severity] || "var(--muted)", marginTop: 5 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, color: "var(--text)" }}>{i.title}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>{i.severity}{i.pages?.length ? ` · ${i.pages.length} page${i.pages.length === 1 ? "" : "s"}` : ""}</div>
                          </div>
                        </div>
                      ))}

                      <p className="label" style={{ margin: "16px 0 8px" }}>Addresses on their site</p>
                      {(p.emails || []).length === 0 && <p style={muted}>None published. The site may use a contact form instead.</p>}
                      {(p.emails || []).map(e => (
                        <div key={e.address} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                          <span className="mono" style={{ flex: 1, fontSize: 12, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis" }}>{e.address}</span>
                          <span className={`pill ${e.kind === "role" ? "pill-green" : "pill-gold"}`} style={{ fontSize: 10.5, padding: "1px 7px" }}>
                            {e.kind === "role" ? "company" : "a person"}
                          </span>
                          {p.contact_email !== e.address && <button type="button" className="btn btn-sm" onClick={() => patch(p.id, { contactEmail: e.address })} style={{ minHeight: 28 }}>Use</button>}
                        </div>
                      ))}
                      {(p.emails || []).some(e => e.kind === "personal") && (
                        <p style={{ ...muted, fontSize: 11, marginTop: 8 }}>
                          A named address is that person's own data. A company address is the safer one to write to, and usually reaches the same desk.
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="label" style={{ margin: "0 0 8px" }}>The angle</p>
                      {!draft && <p style={muted}>Loading the drafts…</p>}
                      {draft?.error && <p style={{ ...muted, color: "var(--red)" }}>{draft.error}</p>}
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
                        {draft?.templates?.map(t => (
                          <button key={t.id} type="button" onClick={() => t.available && setChosen(x => ({ ...x, [p.id]: t.id }))} disabled={!t.available}
                            title={t.available ? t.when : t.why}
                            style={{ textAlign: "left", padding: "8px 11px", borderRadius: 9, cursor: t.available ? "pointer" : "not-allowed", fontFamily: "inherit",
                              background: chosen[p.id] === t.id ? "var(--purple-soft)" : "transparent",
                              border: `1px solid ${chosen[p.id] === t.id ? "rgba(124,58,237,0.5)" : "var(--border-strong)"}`,
                              color: t.available ? "var(--text)" : "var(--dim)", opacity: t.available ? 1 : 0.7 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{t.label}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{t.available ? t.when : t.why}</div>
                          </button>
                        ))}
                      </div>

                      {picked && (
                        <>
                          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-strong)", borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>
                              <strong style={{ color: "var(--text)" }}>To:</strong> {draft.to || "no address yet"}<br />
                              <strong style={{ color: "var(--text)" }}>Subject:</strong> {picked.subject}
                            </div>
                            <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--text-2)", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{picked.body}</pre>
                          </div>
                          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                            <button type="button" className="btn btn-sm btn-primary" onClick={() => copy(p.id, `Subject: ${picked.subject}\n\n${picked.body}`)}>
                              {copied === p.id ? "Copied" : "Copy the draft"}
                            </button>
                            {draft.to && (
                              <a href={`mailto:${draft.to}?subject=${encodeURIComponent(picked.subject)}&body=${encodeURIComponent(picked.body)}`}
                                className="btn btn-sm" style={{ textDecoration: "none" }}>Open in email</a>
                            )}
                            <button type="button" className="btn btn-sm" onClick={() => patch(p.id, { status: "contacted", offerCode: draft.code || undefined })}>I have sent it</button>
                          </div>
                          {draft.code && <p style={{ ...muted, fontSize: 11, marginTop: 8 }}>The draft offers code {draft.code}. Marking it sent records that, so ProspectFlow can show whether they used it.</p>}
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <textarea className="field" defaultValue={p.notes || ""} placeholder="Notes" rows={2} onBlur={e => e.target.value !== (p.notes || "") && patch(p.id, { notes: e.target.value })}
                    style={{ flex: 1, minWidth: 0, resize: "vertical" }} />
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => window.confirm(`Remove ${p.domain}?`) && call(`/${p.id}`, { method: "DELETE" }).then(load)}>Remove</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProspectsSection;
