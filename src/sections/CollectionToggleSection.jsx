// The kill switch an external tool polls before each scheduled run.
//
// Deliberately holds no customer data and cannot be attached to a project, a
// user or a workspace - see the table comment in the backend migration. What is
// on screen is the whole record: a name, a state, a reason and who changed it.
//
// The secret is shown exactly once, on creation or rotation, because only its
// hash is stored. There is no "reveal" button because there is nothing to reveal.
import { useState, useEffect } from "react";

const readJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`The API returned ${res.status} instead of data.`); }
};

const stateWord = (v) => (v === null || v === undefined ? "?" : v ? "stopped" : "collecting");

const CollectionToggleSection = ({ adminFetch, API_URL }) => {
  const [toggles, setToggles] = useState([]);
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState("");
  const [newName, setNewName] = useState("NowSignage");
  const [reasons, setReasons] = useState({});
  // Component state only. Never written to storage, gone on navigation.
  const [freshSecret, setFreshSecret] = useState(null);

  const load = async () => {
    setError("");
    try {
      const r = await adminFetch(`${API_URL}/admin/collection-toggles`);
      const j = await readJson(r);
      if (!r.ok) setError(j.error || "Could not load toggles");
      else setToggles(j.toggles || []);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newName.trim()) return;
    setBusy("create"); setError("");
    try {
      const r = await adminFetch(`${API_URL}/admin/collection-toggles`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const j = await readJson(r);
      if (!r.ok) setError(j.error || "Could not create");
      else { setFreshSecret({ name: j.toggle.name, secret: j.secret }); load(); }
    } catch (e) { setError(e.message); }
    setBusy("");
  };

  const setStopped = async (t, stopped) => {
    setBusy(`set-${t.id}`); setError("");
    try {
      const r = await adminFetch(`${API_URL}/admin/collection-toggles/${t.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        // A real boolean, matching the client, which treats only literal true as stop.
        body: JSON.stringify({ stopped, reason: reasons[t.id] || "" }),
      });
      const j = await readJson(r);
      if (!r.ok) setError(j.error || "Could not update");
      else load();
    } catch (e) { setError(e.message); }
    setBusy("");
  };

  const rotate = async (t) => {
    setBusy(`rot-${t.id}`); setError("");
    try {
      const r = await adminFetch(`${API_URL}/admin/collection-toggles/${t.id}/rotate`, { method: "POST" });
      const j = await readJson(r);
      if (!r.ok) setError(j.error || "Could not rotate");
      else { setFreshSecret({ name: t.name, secret: j.secret, rotated: true }); load(); }
    } catch (e) { setError(e.message); }
    setBusy("");
  };

  return (
    <div style={{ width: "100%" }}>
      {error && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "var(--red)", fontSize: 13 }}>{error}</div>}

      {freshSecret && (
        <div className="card" style={{ background: "rgba(251,191,36,0.08)", borderColor: "rgba(251,191,36,0.35)", marginBottom: 16 }}>
          <p className="label" style={{ color: "var(--gold)" }}>
            {freshSecret.rotated ? "New secret for" : "Secret for"} {freshSecret.name} - shown once
          </p>
          <p className="mono" style={{ fontSize: 13, color: "#fcd34d", wordBreak: "break-all", margin: "6px 0 10px",
                      background: "rgba(0,0,0,0.35)", padding: "10px 12px", borderRadius: 8 }}>
            {freshSecret.secret}
          </p>
          <p style={{ fontSize: 12, color: "#fcd34d", margin: "0 0 10px", lineHeight: 1.6 }}>
            Copy this now. Only a hash is stored, so it cannot be shown again - rotate if it is lost.
            {freshSecret.rotated ? " The previous secret stopped working immediately." : ""}
            {" "}Send it as <span className="mono">Authorization: Bearer &lt;secret&gt;</span>, never in a URL.
          </p>
          <button type="button" className="btn btn-sm" onClick={() => setFreshSecret(null)}>I have copied it</button>
        </div>
      )}

      {toggles.map(t => (
        <div key={t.id} className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
            <span className="card-title" style={{ fontSize: 16 }}>{t.name}</span>
            <span className={`pill ${t.stopped ? "pill-red" : "pill-green"}`}>
              {t.stopped ? "STOPPED" : "COLLECTING"}
            </span>
            <span style={{ flex: 1 }} />
            <button type="button" className="btn btn-sm" onClick={() => rotate(t)} disabled={busy === `rot-${t.id}`}>Rotate secret</button>
          </div>

          <p style={{ fontSize: 12, color: "var(--text-2)", margin: "0 0 12px" }}>
            Last changed by <strong style={{ color: "var(--text)" }}>{t.changed_by || "unknown"}</strong>
            {" on "}{new Date(t.changed_at).toLocaleString("en-GB")}
            {t.reason ? ` - "${t.reason}"` : ""}
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
            <input className="field" value={reasons[t.id] ?? ""} onChange={e => setReasons({ ...reasons, [t.id]: e.target.value })}
              placeholder="Reason (optional, returned to the polling tool)"
              style={{ flex: 1, minWidth: 240, width: "auto" }} />
            {t.stopped
              ? <button type="button" className="btn btn-primary" onClick={() => setStopped(t, false)} disabled={busy === `set-${t.id}`}>Resume collection</button>
              : <button type="button" className="btn btn-danger" onClick={() => setStopped(t, true)} disabled={busy === `set-${t.id}`}>Stop collection</button>}
          </div>

          <p className="label" style={{ marginBottom: 6 }}>History</p>
          {(t.history || []).length === 0
            ? <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>No changes recorded.</p>
            : (t.history || []).map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 12, flexWrap: "wrap" }}>
                <span className="mono" style={{ color: "var(--purple-text)", minWidth: 110 }}>{h.action}</span>
                <span style={{ color: "var(--text-2)", flex: 1, minWidth: 150 }}>
                  {h.new_stopped === null ? "-" : `${stateWord(h.old_stopped)} → ${stateWord(h.new_stopped)}`}
                  {h.reason ? ` · "${h.reason}"` : ""}
                </span>
                <span style={{ color: "var(--text)" }}>{h.actor}</span>
                <span style={{ color: "var(--muted)" }}>{new Date(h.at).toLocaleString("en-GB")}</span>
              </div>
            ))}
        </div>
      ))}

      <div className="card">
        <p className="label">Create a toggle</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <input className="field" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name"
            style={{ flex: 1, minWidth: 220, width: "auto" }} />
          <button type="button" className="btn btn-primary" onClick={create} disabled={busy === "create"}>Create</button>
        </div>
        <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "10px 0 0", lineHeight: 1.55 }}>
          A new toggle starts in the COLLECTING state, so creating one can never halt a running job.
        </p>
      </div>
    </div>
  );
};

export default CollectionToggleSection;
