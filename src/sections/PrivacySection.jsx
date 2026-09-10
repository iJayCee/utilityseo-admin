// Privacy: the one screen where "we handled it" has to be provable.
//
// Everything behind this was curl-only until now, which meant the answer to a
// subject access request depended on someone remembering an endpoint under
// deadline pressure. A one calendar month clock is not the moment to be
// reading source code.
//
// Holds its own state rather than taking twenty props from App.jsx: nothing
// else on the admin reads any of it, so threading it upwards would only make
// App.jsx longer.
import { useState, useEffect } from "react";
import { EmptyState, Kpi } from "../Shell.jsx";

const mono = { fontFamily:"JetBrains Mono,monospace" };
const CARD_GAP = 20;

const REQUEST_TYPES = ["access", "erasure", "objection", "rectification", "portability"];

// Railway serves an HTML error page while a container is restarting, and
// res.json() on that throws "Unexpected token '<'" - which is what this screen
// showed during its own first deploy. Useless to read and it looks like the
// feature is broken rather than the API being briefly away.
const readJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`The API returned ${res.status} instead of data. If a deploy just went out, give it a moment and refresh.`); }
};

const PrivacySection = ({ adminFetch, API_URL }) => {
  const [requests, setRequests] = useState([]);
  const [retention, setRetention] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");

  const [lookupEmail, setLookupEmail] = useState("");
  const [found, setFound] = useState(null);

  const [newType, setNewType] = useState("access");
  const [newId, setNewId] = useState("");

  const [runReport, setRunReport] = useState(null);
  const [runConfirm, setRunConfirm] = useState("");

  const load = async () => {
    setError(""); setBusy("load");
    try {
      const [a, b] = await Promise.all([
        adminFetch(`${API_URL}/admin/data-requests`),
        adminFetch(`${API_URL}/admin/retention`),
      ]);
      if (a.ok) setRequests((await readJson(a)).requests || []);
      if (b.ok) setRetention(await readJson(b));
      else setError((await readJson(b)).error || "Could not load retention status");
    } catch (e) { setError(e.message); }
    setBusy("");
  };

  useEffect(() => { load(); }, []);

  const lookup = async () => {
    if (!lookupEmail.trim()) return;
    setBusy("lookup"); setError(""); setFound(null);
    try {
      const r = await adminFetch(`${API_URL}/admin/data-request?email=${encodeURIComponent(lookupEmail.trim())}&counts=1`);
      const j = await readJson(r);
      if (!r.ok) setError(j.error || "Lookup failed"); else setFound(j);
    } catch (e) { setError(e.message); }
    setBusy("");
  };

  // Fetched rather than linked, because the endpoint needs the admin headers a
  // plain <a href> cannot send.
  const download = async () => {
    setBusy("export");
    try {
      const r = await adminFetch(`${API_URL}/admin/data-request/export?email=${encodeURIComponent(lookupEmail.trim())}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `utilityseo-data-${lookupEmail.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setError(e.message); }
    setBusy("");
  };

  const logRequest = async () => {
    if (!newId.trim()) return;
    setBusy("log"); setError(""); setMsg("");
    try {
      const r = await adminFetch(`${API_URL}/admin/data-request`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newType, identifier: newId.trim() }),
      });
      const j = await readJson(r);
      if (!r.ok) setError(j.error || "Could not log the request");
      else {
        setMsg(`Logged. Due by ${new Date(new Date(j.received_at).setMonth(new Date(j.received_at).getMonth() + 1)).toLocaleDateString("en-GB")}.`);
        setNewId(""); load();
      }
    } catch (e) { setError(e.message); }
    setBusy("");
  };

  const complete = async (id) => {
    setBusy(`done-${id}`);
    try {
      await adminFetch(`${API_URL}/admin/data-requests/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actions_taken: "Marked complete from the admin panel." }),
      });
      load();
    } catch (e) { setError(e.message); }
    setBusy("");
  };

  const runRetention = async (dryRun) => {
    setBusy(dryRun ? "dry" : "live"); setError(""); setRunReport(null);
    try {
      const r = await adminFetch(`${API_URL}/admin/retention/run`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun }),
      });
      const j = await readJson(r);
      if (!r.ok) setError(j.error || "Run failed");
      else { setRunReport(j); if (!dryRun) { setRunConfirm(""); load(); } }
    } catch (e) { setError(e.message); }
    setBusy("");
  };

  const open = requests.filter(r => !r.completed_at);
  const done = requests.filter(r => r.completed_at);

  return (
    <div style={{ width:"100%" }}>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:14 }}>
        <button type="button" className="btn btn-primary" onClick={load}>↻ Refresh</button>
      </div>

      {error && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"var(--red)", fontSize:13 }}>{error}</div>}
      {msg && <div style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"var(--green)", fontSize:13 }}>{msg}</div>}

      {/* ── Open requests, first, because they are the thing with a deadline ── */}
      <div className="card" style={{ marginBottom:CARD_GAP }}>
        <h3 className="card-title" style={{ marginBottom:12 }}>Open requests {open.length > 0 && <span style={{ color:"var(--gold)" }}>({open.length})</span>}</h3>
        {open.length === 0 && <EmptyState title="Nothing outstanding" text="Requests logged below appear here until they are marked done." />}
        {open.map(r => (
          <div key={r.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 0", borderBottom:"1px solid var(--border)", flexWrap:"wrap" }}>
            <span style={{ ...mono, fontSize:12, color:"var(--purple-text)", textTransform:"uppercase" }}>{r.type}</span>
            <span style={{ fontSize:13, color:"var(--text)", flex:1, minWidth:180 }}>{r.identifier}</span>
            <span style={{ fontSize:12, color:r.days_left <= 7 ? "var(--red)" : "var(--muted)" }}>
              {r.days_left >= 0 ? `${r.days_left} days left` : `${Math.abs(r.days_left)} days OVERDUE`}
            </span>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => complete(r.id)} disabled={busy === `done-${r.id}`}>Mark done</button>
          </div>
        ))}
      </div>

      {/* ── Log a new one ── */}
      <div className="card" style={{ marginBottom:CARD_GAP }}>
        <h3 className="card-title">Log a request</h3>
        <p className="card-sub" style={{ marginBottom:14 }}>
          Log it when it arrives, not when it is finished. The clock starts on arrival, and this log is the evidence it was met. An objection or erasure also suppresses the address immediately.
        </p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <select className="field" value={newType} onChange={e => setNewType(e.target.value)} style={{ width:"auto", minWidth:160 }}>
            {REQUEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input className="field" value={newId} onChange={e => setNewId(e.target.value)} placeholder="Email address or other identifier"
            style={{ flex:1, minWidth:220, width:"auto" }} />
          <button type="button" className="btn btn-primary" onClick={logRequest} disabled={busy === "log"}>Log it</button>
        </div>
      </div>

      {/* ── Subject lookup ── */}
      <div className="card" style={{ marginBottom:CARD_GAP }}>
        <h3 className="card-title">What do we hold?</h3>
        <p className="card-sub" style={{ marginBottom:14 }}>
          Tables are discovered from the live schema, not a written list, so a table added last week is included. Anything that could not be read is listed rather than left out.
        </p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
          <input className="field" value={lookupEmail} onChange={e => setLookupEmail(e.target.value)} placeholder="email@example.com"
            onKeyDown={e => e.key === "Enter" && lookup()} style={{ flex:1, minWidth:220, width:"auto" }} />
          <button type="button" className="btn btn-primary" onClick={lookup} disabled={busy === "lookup"}>{busy === "lookup" ? "Looking…" : "Look up"}</button>
          <button type="button" className="btn" onClick={download} disabled={!found || busy === "export"}>Download export</button>
        </div>

        {found && (
          <div>
            <p style={{ fontSize:13, color:"var(--text)", margin:"0 0 10px" }}>
              {found.foundAt ? <>Found in <strong>{found.foundAt}</strong>. {found.projects?.length || 0} project(s).</> : "Nothing held for this address."}
              {found.suppression && <span style={{ color:"var(--gold)" }}> Suppressed ({found.suppression.reason}).</span>}
            </p>
            {found.warnings?.length > 0 && (
              <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:10, padding:"10px 14px", marginBottom:12, color:"var(--gold)", fontSize:12 }}>
                <strong>Incomplete.</strong> {found.warnings.join(" ")}
              </div>
            )}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {Object.entries(found.tables || {}).filter(([, n]) => n > 0).map(([t, n]) => (
                <span key={t} className="pill pill-purple mono" style={{ borderRadius:8 }}>{t} {n}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Retention ── */}
      {retention && (
        <div className="card" style={{ marginBottom:CARD_GAP }}>
          <h3 className="card-title">Retention</h3>
          <p className="card-sub" style={{ marginBottom:14 }}>
            The policy promises deletion within {retention.graceDays} days of an account being closed. The job runs nightly at 02:00 UTC; the buttons below are for when you need it sooner.
          </p>

          <div className="kpi-grid" style={{ marginBottom:18 }}>
            <Kpi label="Due now" value={retention.dueNow} tone={retention.dueNow ? "gold" : "text"} />
            <Kpi label="Closed, waiting" value={retention.pending?.length || 0} />
            <Kpi label="Erased to date" value={retention.erased?.length || 0} />
          </div>

          {retention.leads?.total > 0 && (
            <div style={{ marginBottom:18, paddingBottom:14, borderBottom:"1px solid var(--border)" }}>
              <div className="label" style={{ marginBottom:8 }}>Free-scan leads</div>
              <div style={{ fontSize:12, color:"var(--text-2)", lineHeight:1.6 }}>
                <span style={{ ...mono, color:"var(--purple-text)" }}>{retention.leads.total}</span> held here rather than in the CMS.{" "}
                <span style={{ ...mono, color:"var(--purple-text)" }}>{retention.leads.linked}</span> joined to an account,{" "}
                <span style={{ ...mono, color:"var(--purple-text)" }}>{retention.leads.anonymous}</span> with no email at all,{" "}
                <span style={{ ...mono, color:"var(--purple-text)" }}>{retention.leads.consented}</span> opted in to marketing.
                <div style={{ marginTop:5, color:"var(--muted)" }}>A lookup above finds these whether or not the person ever signed up, so one search answers the whole request.</div>
              </div>
            </div>
          )}

          {retention.pending?.length > 0 && (
            <div style={{ marginBottom:18 }}>
              {retention.pending.slice(0, 10).map(p => (
                <div key={p.id} style={{ display:"flex", gap:14, padding:"7px 0", borderBottom:"1px solid var(--border)", fontSize:12, flexWrap:"wrap" }}>
                  <span style={{ color:"var(--text)", flex:1, minWidth:180 }}>{p.email}</span>
                  <span style={{ color:"var(--muted)" }}>closed {new Date(p.deactivated_at).toLocaleDateString("en-GB")}</span>
                  <span style={{ color:"var(--purple-text)" }}>erase on {new Date(p.erase_at).toLocaleDateString("en-GB")}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom:18 }}>
            <div className="label" style={{ marginBottom:8 }}>Logs aged out automatically</div>
            {retention.operational?.map(p => (
              <div key={p.table} style={{ fontSize:12, color:"var(--text-2)", marginBottom:5, lineHeight:1.5 }}>
                <span style={{ ...mono, color:"var(--purple-text)" }}>{p.table}</span> after {p.days} days. {p.why}
              </div>
            ))}
            <div className="label" style={{ margin:"14px 0 8px" }}>Never aged out</div>
            {retention.neverPruned?.map(p => (
              <div key={p.table} style={{ fontSize:12, color:"var(--text-2)", marginBottom:5, lineHeight:1.5 }}>
                <span style={{ ...mono, color:"var(--purple-text)" }}>{p.table}</span> {p.why}
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <button type="button" className="btn" onClick={() => runRetention(true)} disabled={busy === "dry"}>
              {busy === "dry" ? "Checking…" : "Dry run"}
            </button>
            {/* Live runs are typed out in full. Erasure is irreversible and the
                dry run costs nothing, so there is no good reason to make this
                one click away from the safe version. */}
            <input className="field" value={runConfirm} onChange={e => setRunConfirm(e.target.value)} placeholder="Type ERASE to enable"
              style={{ width:190 }} />
            <button type="button" className="btn btn-danger" onClick={() => runRetention(false)} disabled={runConfirm !== "ERASE" || busy === "live"}>
              {busy === "live" ? "Erasing…" : "Run for real"}
            </button>
          </div>

          {runReport && (
            <div style={{ marginTop:16, background:"rgba(255,255,255,0.03)", border:"1px solid var(--border-strong)", borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:runReport.dryRun ? "var(--purple-text)" : "var(--green)", marginBottom:8 }}>
                {runReport.dryRun ? "Dry run - nothing was deleted" : "Completed"}
              </div>
              <div style={{ fontSize:12, color:"var(--text-2)", lineHeight:1.7 }}>
                {runReport.due} account(s) {runReport.dryRun ? "would be" : ""} erased.
                {Object.keys(runReport.operational || {}).length > 0 && <> Logs: {Object.entries(runReport.operational).map(([t, n]) => `${t} ${n}`).join(", ")}.</>}
                {runReport.codesCleared > 0 && <> {runReport.codesCleared} expired 2FA code(s) cleared.</>}
                <div style={{ marginTop:8, color:"var(--muted)" }}>{runReport.mustBeDoneElsewhere}</div>
              </div>
              {runReport.warnings?.length > 0 && (
                <div style={{ marginTop:10, color:"var(--gold)", fontSize:12 }}>
                  {runReport.warnings.map((w, i) => <div key={i}>{w}</div>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {done.length > 0 && (
        <div className="card" style={{ marginBottom:CARD_GAP }}>
          <h3 className="card-title" style={{ marginBottom:12 }}>Answered</h3>
          {done.slice(0, 20).map(r => (
            <div key={r.id} style={{ display:"flex", gap:14, padding:"7px 0", borderBottom:"1px solid var(--border)", fontSize:12, flexWrap:"wrap" }}>
              <span style={{ ...mono, color:"var(--purple-text)", textTransform:"uppercase" }}>{r.type}</span>
              <span style={{ color:"var(--text)", flex:1, minWidth:160 }}>{r.identifier}</span>
              <span style={{ color:"var(--muted)" }}>{new Date(r.completed_at).toLocaleDateString("en-GB")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrivacySection;
