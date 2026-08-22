import { useState, useEffect } from "react";

// Everything this platform depends on that we do not control.
//
// The question this page exists to answer is not "what keys are set" - it is
// "what breaks, and how badly, if this one stops working". So every row leads
// with the consequence rather than the variable name, and the ones that take
// the whole platform down with them are marked as such and sorted to the top
// of their group when they are not configured.

const CARD = { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"16px 18px" };
const LABEL = { fontSize:10, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" };

const StatusPill = ({ service }) => {
  // Partial is its own state deliberately. A Stripe key without its webhook
  // secret takes payments and never hears about them - showing that as green
  // would hide the single most expensive failure on this page.
  const s = service.retired
    ? { bg:"rgba(255,255,255,0.05)", fg:"#64748b", text:"NOT USED" }
    : service.partial
      ? { bg:"rgba(251,191,36,0.12)", fg:"#fcd34d", text:"PARTIAL" }
      : service.configured
        ? { bg:"rgba(52,211,153,0.12)", fg:"#34d399", text:"CONFIGURED" }
        : service.critical
          ? { bg:"rgba(248,113,113,0.12)", fg:"#f87171", text:"MISSING" }
          : { bg:"rgba(255,255,255,0.05)", fg:"#64748b", text:"NOT SET" };
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:99, background:s.bg, color:s.fg, whiteSpace:"nowrap", letterSpacing:"0.03em" }}>
      {s.text}
    </span>
  );
};

const ServiceRow = ({ s }) => (
  <div style={{ padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
    <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:9, minWidth:0 }}>
        <span style={{ fontSize:14, fontWeight:700, color: s.retired ? "#64748b" : "#e2e8f0" }}>{s.name}</span>
        {s.critical && (
          <span title="The platform does not function without this"
            style={{ fontSize:9.5, fontWeight:700, padding:"2px 7px", borderRadius:99, background:"rgba(124,58,237,0.15)", color:"#a78bfa", whiteSpace:"nowrap" }}>
            CRITICAL
          </span>
        )}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, whiteSpace:"nowrap" }}>
        <span style={{ fontSize:11.5, color:"#64748b", fontFamily:"JetBrains Mono,monospace" }}>{s.cost}</span>
        <StatusPill service={s} />
      </div>
    </div>

    <div style={{ fontSize:12.5, color:"#94a3b8", marginTop:5, lineHeight:1.55 }}>{s.purpose}</div>

    {s.limits && (
      <div style={{ fontSize:11.5, color:"#64748b", marginTop:4, fontFamily:"JetBrains Mono,monospace" }}>{s.limits}</div>
    )}

    {s.caveat && (
      // The limits of a source belong next to the source, not in somebody's
      // memory. This is where "it cannot list backlinks" lives.
      <div style={{ fontSize:11.5, color:"#fcd34d", marginTop:6, lineHeight:1.55, paddingLeft:10, borderLeft:"2px solid rgba(251,191,36,0.3)" }}>
        {s.caveat}
      </div>
    )}

    <div style={{ fontSize:11.5, color:"#64748b", marginTop:6, lineHeight:1.55 }}>
      <span style={{ color:"#475569" }}>If it stops: </span>{s.whenMissing}
    </div>

    {s.env.length > 0 && (
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
        {s.env.map(v => (
          <span key={v.name} title={v.set ? "Set in Railway" : "Not set on this server"}
            style={{
              fontSize:10, fontFamily:"JetBrains Mono,monospace", padding:"2px 8px", borderRadius:6,
              background: v.set ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
              color: v.set ? "#34d399" : "#f87171",
              border:`1px solid ${v.set ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
            }}>
            {v.set ? "✓" : "✗"} {v.name}
          </span>
        ))}
      </div>
    )}

    {s.signup && !s.configured && !s.retired && (
      <a href={s.signup} target="_blank" rel="noopener noreferrer"
        style={{ display:"inline-block", marginTop:8, fontSize:11.5, color:"#a78bfa", textDecoration:"none", fontWeight:600 }}>
        Get a key &rarr;
      </a>
    )}
  </div>
);

const ExternalDataSection = ({ adminFetch, API_URL }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const r = await adminFetch(`${API_URL}/admin/external-data`);
      const body = await r.json();
      if (!r.ok) setError(body.error || "Could not load the service list.");
      else setData(body);
    } catch {
      setError("Could not reach the server.");
    }
    setLoading(false);
  };

  // Load once on mount. `load` is intentionally not a dependency: it is
  // recreated every render, so listing it would refetch in a loop.
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = data?.counts;

  return (
    <div style={{ width:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, gap:12, flexWrap:"wrap" }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#e2e8f0", margin:0 }}>External data</h2>
          <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0" }}>
            Every outside service the platform depends on, what it costs, and what breaks without it
          </p>
        </div>
        <button onClick={load}
          style={{ padding:"9px 20px", background:"#7C3AED", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>
          &#8635; Refresh
        </button>
      </div>

      {error && (
        <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#f87171", fontSize:13 }}>
          {error}
        </div>
      )}

      {loading && <div style={{ textAlign:"center", padding:"60px 20px", color:"#64748b", fontSize:14 }}>Loading services…</div>}

      {data && !loading && (
        <>
          {counts.criticalMissing > 0 && (
            // Surfaced above everything else: a critical service without its
            // key is an outage that has already started, whether or not
            // anybody has noticed it yet.
            <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:12, padding:"14px 18px", marginBottom:20, color:"#f87171", fontSize:13, lineHeight:1.6 }}>
              <strong>{counts.criticalMissing} critical {counts.criticalMissing === 1 ? "service is" : "services are"} not configured.</strong>{" "}
              These are the ones the platform cannot run without. Check the Railway variables for the rows marked CRITICAL below.
            </div>
          )}

          <div style={{ ...CARD, marginBottom:20, display:"flex", gap:28, flexWrap:"wrap" }}>
            <div>
              <div style={LABEL}>Services</div>
              <div style={{ fontSize:20, fontWeight:800, color:"#e2e8f0", fontFamily:"JetBrains Mono,monospace", marginTop:4 }}>{counts.total}</div>
            </div>
            <div>
              <div style={LABEL}>Configured</div>
              <div style={{ fontSize:20, fontWeight:800, color:"#34d399", fontFamily:"JetBrains Mono,monospace", marginTop:4 }}>{counts.configured}</div>
            </div>
            <div>
              <div style={LABEL}>Not set</div>
              <div style={{ fontSize:20, fontWeight:800, color: counts.missing > 0 ? "#fcd34d" : "#64748b", fontFamily:"JetBrains Mono,monospace", marginTop:4 }}>{counts.missing}</div>
            </div>
          </div>

          {Object.entries(data.categories).map(([key, label]) => {
            const inGroup = data.services.filter(s => s.category === key);
            if (!inGroup.length) return null;
            // Anything not configured sorts first inside its group: this page
            // is read when something is wrong, and the broken rows should not
            // be the ones you have to scroll for.
            const sorted = [...inGroup].sort((a, b) => (a.configured === b.configured ? 0 : a.configured ? 1 : -1));
            return (
              <div key={key} style={{ ...CARD, marginBottom:16 }}>
                <div style={{ ...LABEL, marginBottom:2 }}>{label}</div>
                {sorted.map(s => <ServiceRow key={s.id} s={s} />)}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default ExternalDataSection;
