// Who may have a demo workspace.
//
// The demo is a worked example with every screen full. It used to be
// available to any signed-in account, which handed free signups a fake
// interiors business and used their one project slot. This is the list of
// accounts that may create one, and the switch that opens it to everyone
// when the demo becomes an onboarding aid rather than a sales one.
import { useEffect, useState } from "react";

const DemoAccessSection = ({ adminFetch, API_URL }) => {
  const [data, setData] = useState(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const r = await adminFetch(`${API_URL}/admin/demo-access`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load the demo allow-list.");
      setData(d);
    } catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const call = async (path, opts) => {
    setBusy(true); setError("");
    try {
      // adminFetch adds the credentials but not a content type; a JSON body
      // without one arrives at the server as nothing.
      const r = await adminFetch(`${API_URL}/admin/demo-access${path}`, { ...opts, headers: { ...(opts.headers || {}), ...(opts.body ? { 'Content-Type': 'application/json' } : {}) } });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "That did not work.");
      setData(d);
      return true;
    } catch (e) { setError(e.message); return false; }
    finally { setBusy(false); }
  };

  const add = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (await call("", { method: "POST", body: JSON.stringify({ email: email.trim() }) })) setEmail("");
  };

  const card = { background: "var(--card-bg, #13131F)", border: "1px solid var(--card-border, rgba(255,255,255,0.07))", borderRadius: 14, padding: "18px 20px", marginBottom: 16 };
  const muted = { fontSize: 12.5, color: "var(--text-muted, #64748b)", lineHeight: 1.6, margin: 0 };

  if (!data && !error) return <div style={card}><p style={muted}>Loading…</p></div>;

  return (
    <div>
      <div style={card}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Demo workspace</p>
        <p style={{ ...muted, marginTop: 4 }}>
          A worked example of a fictional interiors business with every screen full. Accounts on this list see an "Add demo workspace" button on their projects screen; nobody else does.
        </p>
        {error && <p style={{ ...muted, color: "#f87171", marginTop: 10 }}>{error}</p>}
      </div>

      {data && (
        <>
          <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{data.everyone ? "Open to every account" : "Allow-list only"}</p>
              <p style={{ ...muted, marginTop: 3 }}>
                {data.everyone
                  ? "Any signed-in account can create a demo workspace. It counts against their project limit."
                  : "Only the addresses below can create one."}
              </p>
            </div>
            <button onClick={() => call("/everyone", { method: "POST", body: JSON.stringify({ on: !data.everyone }) })} disabled={busy}
              style={{ minHeight: 40, padding: "0 16px", borderRadius: 10, border: "1px solid var(--card-border, rgba(255,255,255,0.12))", background: data.everyone ? "rgba(248,113,113,0.12)" : "#7C3AED", color: data.everyone ? "#f87171" : "#fff", fontSize: 13, fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>
              {data.everyone ? "Back to allow-list only" : "Open to everyone"}
            </button>
          </div>

          <div style={card}>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "var(--text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Allowed accounts</p>
            {data.emails.length === 0 && <p style={muted}>Nobody. Add an address below.</p>}
            {data.emails.map(e => (
              <div key={e.email} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--card-border, rgba(255,255,255,0.07))" }}>
                <span style={{ flex: 1, fontFamily: "JetBrains Mono, monospace", fontSize: 12.5 }}>{e.email}</span>
                <span style={{ ...muted, fontSize: 11 }}>{e.fromEnv ? "set in the server environment" : e.addedBy ? `added by ${e.addedBy}` : ""}</span>
                {!e.fromEnv && (
                  <button onClick={() => call(`/${encodeURIComponent(e.email)}`, { method: "DELETE" })} disabled={busy}
                    style={{ minHeight: 32, padding: "0 10px", borderRadius: 8, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 12, cursor: "pointer" }}>Remove</button>
                )}
              </div>
            ))}
            <form onSubmit={add} style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com"
                style={{ flex: 1, minWidth: 0, minHeight: 40, padding: "8px 12px", borderRadius: 10, border: "1px solid var(--card-border, rgba(255,255,255,0.12))", background: "var(--input-bg, rgba(255,255,255,0.05))", color: "inherit", fontSize: 14 }} />
              <button type="submit" disabled={busy || !email.trim()} style={{ minHeight: 40, padding: "0 16px", borderRadius: 10, border: "none", background: "#7C3AED", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Add</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default DemoAccessSection;
