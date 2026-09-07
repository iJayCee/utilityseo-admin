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

const STATUS_META = {
  new:        { label: "New",        colour: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  researched: { label: "Researched", colour: "#a5b4fc", bg: "rgba(99,102,241,0.14)" },
  contacted:  { label: "Contacted",  colour: "#fbbf24", bg: "rgba(251,191,36,0.14)" },
  replied:    { label: "Replied",    colour: "#34d399", bg: "rgba(52,211,153,0.14)" },
  signed_up:  { label: "Signed up",  colour: "#22c55e", bg: "rgba(34,197,94,0.18)" },
  dead:       { label: "No",         colour: "#64748b", bg: "rgba(100,116,139,0.12)" },
};

const SEV = { critical: "#f87171", high: "#fb923c", medium: "#fbbf24", low: "#64748b" };

const card = { background: "#13131F", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px", marginBottom: 16 };
const muted = { fontSize: 12.5, color: "#64748b", lineHeight: 1.6, margin: 0 };
const input = { minHeight: 40, padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#e2e8f0", fontSize: 14 };
const btn = (primary) => ({ minHeight: 38, padding: "0 14px", borderRadius: 9, border: primary ? "none" : "1px solid rgba(255,255,255,0.12)", background: primary ? "#7C3AED" : "transparent", color: primary ? "#fff" : "#94a3b8", fontSize: 12.5, fontWeight: 600, cursor: "pointer" });

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

  if (!data && !error) return <div style={card}><p style={muted}>Loading…</p></div>;

  return (
    <div>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#e2e8f0", margin: 0 }}>Prospects</h2>
            <p style={{ ...muted, marginTop: 4 }}>
              A website, a scan, a way to reach them and a draft written from what the scan found. Nothing sends from here: you copy the draft and send it yourself.
            </p>
          </div>
          {data && (
            <div style={{ display: "flex", gap: 16 }}>
              {[["total", "Total"], ["contacted", "Contacted"], ["replied", "Replied"], ["signed_up", "Signed up"]].map(([k, label]) => (
                <div key={k} style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10.5, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#e2e8f0", fontFamily: "JetBrains Mono,monospace" }}>{data.counts?.[k] ?? 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <form onSubmit={add} style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="theirwebsite.co.uk" style={{ ...input, flex: "2 1 240px", minWidth: 0 }} />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="contact email, if you have one" style={{ ...input, flex: "2 1 220px", minWidth: 0 }} />
          <select value={code} onChange={e => setCode(e.target.value)} style={{ ...input, flex: "1 1 150px" }}>
            <option value="">No trial code</option>
            {codes.map(c => <option key={c.code} value={c.code}>{c.code} ({c.trial_days}d {c.trial_plan})</option>)}
          </select>
          <button type="submit" disabled={busy === "add" || !url.trim()} style={btn(true)}>{busy === "add" ? "Adding…" : "Add and scan"}</button>
        </form>
        {error && <p style={{ ...muted, color: "#f87171", marginTop: 10 }}>{error}</p>}
      </div>

      {data?.prospects?.length === 0 && <div style={card}><p style={muted}>Nothing here yet. Add a website above, or send one over from the Leads table on the Marketing tab.</p></div>}

      {data?.prospects?.map(p => {
        const meta = STATUS_META[p.status] || STATUS_META.new;
        const open = openId === p.id;
        const draft = drafts[p.id];
        const picked = draft?.templates?.find(t => t.id === chosen[p.id]);
        const issues = p.scan?.issues || [];
        return (
          <div key={p.id} style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: meta.bg, color: meta.colour, whiteSpace: "nowrap" }}>{meta.label}</span>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{p.company || p.domain}</div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#818cf8", fontFamily: "JetBrains Mono,monospace", textDecoration: "none" }}>{p.domain} ↗</a>
              </div>
              {p.scan?.score != null && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700 }}>SCORE</div>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "JetBrains Mono,monospace", color: p.scan.score >= 80 ? "#34d399" : p.scan.score >= 60 ? "#fbbf24" : "#f87171" }}>{p.scan.score}</div>
                </div>
              )}
              {p.contact_email && (
                <div style={{ textAlign: "right", minWidth: 160 }}>
                  <div style={{ fontSize: 12, color: "#e2e8f0", fontFamily: "JetBrains Mono,monospace" }}>{p.contact_email}</div>
                  <div style={{ fontSize: 10.5, color: p.contact_kind === "personal" ? "#fbbf24" : "#64748b" }}>
                    {p.contact_kind === "role" ? "company address" : p.contact_kind === "personal" ? "a named person" : p.contact_kind || ""}
                  </div>
                </div>
              )}
              <button onClick={() => { setOpenId(open ? null : p.id); if (!open && !drafts[p.id] && p.scan) loadDraft(p.id); }} style={btn(false)}>{open ? "Close" : "Open"}</button>
            </div>

            {open && (
              <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  <button onClick={() => research(p.id)} disabled={busy === `research-${p.id}`} style={btn(!p.scan)}>
                    {busy === `research-${p.id}` ? "Scanning…" : p.scan ? "Scan again" : "Scan and find a contact"}
                  </button>
                  {Object.entries(STATUS_META).map(([k, m]) => k !== p.status && (
                    <button key={k} onClick={() => patch(p.id, { status: k })} style={btn(false)}>Mark {m.label.toLowerCase()}</button>
                  ))}
                </div>

                {!p.scan && <p style={muted}>No scan yet. Scan the site and the drafts fill themselves in from what it finds.</p>}

                {p.scan && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>
                        What we found on {p.scan.pagesScanned} page{p.scan.pagesScanned === 1 ? "" : "s"}
                      </p>
                      {issues.length === 0 && <p style={muted}>Nothing wrong, which is rarer than you would think. The "just the report" angle is the honest one here.</p>}
                      {issues.slice(0, 8).map(i => (
                        <div key={i.id} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: 99, background: SEV[i.severity] || "#64748b", marginTop: 5 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, color: "#e2e8f0" }}>{i.title}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{i.severity}{i.pages?.length ? ` · ${i.pages.length} page${i.pages.length === 1 ? "" : "s"}` : ""}</div>
                          </div>
                        </div>
                      ))}

                      <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", margin: "16px 0 8px" }}>Addresses on their site</p>
                      {(p.emails || []).length === 0 && <p style={muted}>None published. The site may use a contact form instead.</p>}
                      {(p.emails || []).map(e => (
                        <div key={e.address} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                          <span style={{ flex: 1, fontSize: 12, fontFamily: "JetBrains Mono,monospace", color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis" }}>{e.address}</span>
                          <span style={{ fontSize: 10.5, padding: "1px 7px", borderRadius: 99, background: e.kind === "role" ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)", color: e.kind === "role" ? "#34d399" : "#fbbf24" }}>
                            {e.kind === "role" ? "company" : "a person"}
                          </span>
                          {p.contact_email !== e.address && <button onClick={() => patch(p.id, { contactEmail: e.address })} style={{ ...btn(false), minHeight: 28 }}>Use</button>}
                        </div>
                      ))}
                      {(p.emails || []).some(e => e.kind === "personal") && (
                        <p style={{ ...muted, fontSize: 11, marginTop: 8 }}>
                          A named address is that person's own data. A company address is the safer one to write to, and usually reaches the same desk.
                        </p>
                      )}
                    </div>

                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>The angle</p>
                      {!draft && <p style={muted}>Loading the drafts…</p>}
                      {draft?.error && <p style={{ ...muted, color: "#f87171" }}>{draft.error}</p>}
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
                        {draft?.templates?.map(t => (
                          <button key={t.id} onClick={() => t.available && setChosen(x => ({ ...x, [p.id]: t.id }))} disabled={!t.available}
                            title={t.available ? t.when : t.why}
                            style={{ textAlign: "left", padding: "8px 11px", borderRadius: 9, cursor: t.available ? "pointer" : "not-allowed",
                              background: chosen[p.id] === t.id ? "rgba(124,58,237,0.16)" : "transparent",
                              border: `1px solid ${chosen[p.id] === t.id ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
                              color: t.available ? "#e2e8f0" : "#475569", opacity: t.available ? 1 : 0.7 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{t.label}</div>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{t.available ? t.when : t.why}</div>
                          </button>
                        ))}
                      </div>

                      {picked && (
                        <>
                          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                              <strong style={{ color: "#e2e8f0" }}>To:</strong> {draft.to || "no address yet"}<br />
                              <strong style={{ color: "#e2e8f0" }}>Subject:</strong> {picked.subject}
                            </div>
                            <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "#cbd5e1", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{picked.body}</pre>
                          </div>
                          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                            <button onClick={() => copy(p.id, `Subject: ${picked.subject}\n\n${picked.body}`)} style={btn(true)}>
                              {copied === p.id ? "Copied" : "Copy the draft"}
                            </button>
                            {draft.to && (
                              <a href={`mailto:${draft.to}?subject=${encodeURIComponent(picked.subject)}&body=${encodeURIComponent(picked.body)}`}
                                style={{ ...btn(false), display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Open in email</a>
                            )}
                            <button onClick={() => patch(p.id, { status: "contacted", offerCode: draft.code || undefined })} style={btn(false)}>I have sent it</button>
                          </div>
                          {draft.code && <p style={{ ...muted, fontSize: 11, marginTop: 8 }}>The draft offers code {draft.code}. Marking it sent records that, so ProspectFlow can show whether they used it.</p>}
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <textarea defaultValue={p.notes || ""} placeholder="Notes" rows={2} onBlur={e => e.target.value !== (p.notes || "") && patch(p.id, { notes: e.target.value })}
                    style={{ ...input, flex: 1, minWidth: 0, resize: "vertical", fontFamily: "inherit" }} />
                  <button onClick={() => window.confirm(`Remove ${p.domain}?`) && call(`/${p.id}`, { method: "DELETE" }).then(load)} style={{ ...btn(false), color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>Remove</button>
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
