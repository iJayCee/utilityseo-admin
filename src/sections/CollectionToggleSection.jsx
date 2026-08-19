// The kill switch an external tool polls before each scheduled run.
//
// Deliberately holds no customer data and cannot be attached to a project, a
// user or a workspace - see the table comment in the backend migration. What is
// on screen is the whole record: a name, a state, a reason and who changed it.
//
// The secret is shown exactly once, on creation or rotation, because only its
// hash is stored. There is no "reveal" button because there is nothing to reveal.
import { useState, useEffect } from "react";
import { card, label } from "../shared.jsx";

const input = { padding:"10px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, color:"#e2e8f0", fontSize:13, fontFamily:"Sora,sans-serif" };
const btn = (bg = "#7C3AED") => ({ padding:"9px 18px", background:bg, border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" });
const mono = { fontFamily:"JetBrains Mono,monospace" };

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
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#e2e8f0", margin: 0 }}>🛑 Collection toggle</h2>
        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0", maxWidth: 700, lineHeight: 1.6 }}>
          A kill switch an external tool polls before each scheduled run. Holds no customer data and is not
          attached to any project or account. Switching it off stops that tool collecting; it cannot start it.
        </p>
      </div>

      {error && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#f87171", fontSize: 13 }}>{error}</div>}

      {freshSecret && (
        <div style={{ ...card, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.35)" }}>
          <div style={{ ...label, color: "#fbbf24" }}>
            {freshSecret.rotated ? "New secret for" : "Secret for"} {freshSecret.name} - shown once
          </div>
          <p style={{ ...mono, fontSize: 13, color: "#fcd34d", wordBreak: "break-all", margin: "6px 0 10px",
                      background: "rgba(0,0,0,0.35)", padding: "10px 12px", borderRadius: 8 }}>
            {freshSecret.secret}
          </p>
          <p style={{ fontSize: 12, color: "#fcd34d", margin: "0 0 10px", lineHeight: 1.6 }}>
            Copy this now. Only a hash is stored, so it cannot be shown again - rotate if it is lost.
            {freshSecret.rotated ? " The previous secret stopped working immediately." : ""}
            {" "}Send it as <span style={mono}>Authorization: Bearer &lt;secret&gt;</span>, never in a URL.
          </p>
          <button onClick={() => setFreshSecret(null)} style={btn("#334155")}>I have copied it</button>
        </div>
      )}

      {toggles.map(t => (
        <div key={t.id} style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>{t.name}</span>
            <span style={{ padding: "3px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                           background: t.stopped ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                           border: `1px solid ${t.stopped ? "rgba(239,68,68,0.45)" : "rgba(34,197,94,0.45)"}`,
                           color: t.stopped ? "#f87171" : "#4ade80" }}>
              {t.stopped ? "STOPPED" : "COLLECTING"}
            </span>
            <span style={{ flex: 1 }} />
            <button onClick={() => rotate(t)} disabled={busy === `rot-${t.id}`} style={btn("#334155")}>Rotate secret</button>
          </div>

          <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px" }}>
            Last changed by <strong style={{ color: "#cbd5e1" }}>{t.changed_by || "unknown"}</strong>
            {" on "}{new Date(t.changed_at).toLocaleString("en-GB")}
            {t.reason ? ` - "${t.reason}"` : ""}
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
            <input value={reasons[t.id] ?? ""} onChange={e => setReasons({ ...reasons, [t.id]: e.target.value })}
              placeholder="Reason (optional, returned to the polling tool)"
              style={{ ...input, flex: 1, minWidth: 240 }} />
            {t.stopped
              ? <button onClick={() => setStopped(t, false)} disabled={busy === `set-${t.id}`} style={btn("#22c55e")}>Resume collection</button>
              : <button onClick={() => setStopped(t, true)} disabled={busy === `set-${t.id}`} style={btn("#ef4444")}>Stop collection</button>}
          </div>

          <div style={label}>History</div>
          {(t.history || []).length === 0
            ? <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>No changes recorded.</p>
            : (t.history || []).map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12, flexWrap: "wrap" }}>
                <span style={{ ...mono, color: "#a78bfa", minWidth: 110 }}>{h.action}</span>
                <span style={{ color: "#94a3b8", flex: 1, minWidth: 150 }}>
                  {h.new_stopped === null ? "-" : `${stateWord(h.old_stopped)} → ${stateWord(h.new_stopped)}`}
                  {h.reason ? ` · "${h.reason}"` : ""}
                </span>
                <span style={{ color: "#cbd5e1" }}>{h.actor}</span>
                <span style={{ color: "#64748b" }}>{new Date(h.at).toLocaleString("en-GB")}</span>
              </div>
            ))}
        </div>
      ))}

      <div style={card}>
        <div style={label}>Create a toggle</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name"
            style={{ ...input, flex: 1, minWidth: 220 }} />
          <button onClick={create} disabled={busy === "create"} style={btn()}>Create</button>
        </div>
        <p style={{ fontSize: 11.5, color: "#64748b", margin: "10px 0 0", lineHeight: 1.55 }}>
          A new toggle starts in the COLLECTING state, so creating one can never halt a running job.
        </p>
      </div>
    </div>
  );
};

export default CollectionToggleSection;
