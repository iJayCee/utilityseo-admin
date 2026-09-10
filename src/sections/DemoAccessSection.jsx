// Who may have a demo workspace.
//
// The demo is a worked example with every screen full. It used to be
// available to any signed-in account, which handed free signups a fake
// interiors business and used their one project slot. This is the list of
// accounts that may create one, and the switch that opens it to everyone
// when the demo becomes an onboarding aid rather than a sales one.
import { useEffect, useState } from "react";
import { EmptyState, SkeletonRows } from "../Shell.jsx";

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

  // Heading first, loading state in the body: the same shape as every other
  // section, and the only version a render test can see past.
  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="card-title">Demo workspace</p>
        <p className="card-sub">
          A worked example of a fictional interiors business with every screen full. Accounts on this list see an "Add demo workspace" button on their projects screen; nobody else does.
        </p>
        {error && <p className="card-sub" style={{ color: "var(--red)", marginTop: 10 }}>{error}</p>}
      </div>

      {!data && !error && <div className="card" style={{ marginBottom: 16 }}><SkeletonRows rows={3} /></div>}

      {data && (
        <>
          <div className="card" style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{data.everyone ? "Open to every account" : "Allow-list only"}</p>
              <p className="card-sub">
                {data.everyone
                  ? "Any signed-in account can create a demo workspace. It counts against their project limit."
                  : "Only the addresses below can create one."}
              </p>
            </div>
            <button type="button" className={`btn ${data.everyone ? "btn-danger" : "btn-primary"}`} onClick={() => call("/everyone", { method: "POST", body: JSON.stringify({ on: !data.everyone }) })} disabled={busy}>
              {data.everyone ? "Back to allow-list only" : "Open to everyone"}
            </button>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <p className="label" style={{ marginBottom: 10 }}>Allowed accounts</p>
            {data.emails.length === 0 && <EmptyState title="Nobody yet" text="Add an address below." />}
            {data.emails.map(e => (
              <div key={e.email} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span className="mono" style={{ flex: 1, fontSize: 12.5 }}>{e.email}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{e.fromEnv ? "set in the server environment" : e.addedBy ? `added by ${e.addedBy}` : ""}</span>
                {!e.fromEnv && (
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => call(`/${encodeURIComponent(e.email)}`, { method: "DELETE" })} disabled={busy}>Remove</button>
                )}
              </div>
            ))}
            <form onSubmit={add} style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input type="email" className="field" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" style={{ flex: 1, minWidth: 0 }} />
              <button type="submit" className="btn btn-primary" disabled={busy || !email.trim()}>Add</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default DemoAccessSection;
