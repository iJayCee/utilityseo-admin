import BalancesPanel from "./BalancesPanel";
import { useState, useEffect } from "react";
import { Kpi, SkeletonRows } from "../Shell.jsx";

// Everything this platform depends on that we do not control.
//
// The question this page exists to answer is not "what keys are set" - it is
// "what breaks, and how badly, if this one stops working". So every row leads
// with the consequence rather than the variable name, and the ones that take
// the whole platform down with them are marked as such and sorted to the top
// of their group when they are not configured.

const LINK = { fontSize:11.5, color:"var(--purple-text)", textDecoration:"none", fontWeight:600, whiteSpace:"nowrap" };

const StatusPill = ({ service }) => {
  // Partial is its own state deliberately. A Stripe key without its webhook
  // secret takes payments and never hears about them - showing that as green
  // would hide the single most expensive failure on this page.
  // Deferred is its own state too, and it beats MISSING. A service we chose
  // not to set up yet is a decision, not a fault, and a page that paints
  // decisions red is a page nobody reads after the first week.
  const s = service.retired
    ? { cls:"pill-grey",   text:"NOT USED" }
    : service.partial
      ? { cls:"pill-gold",  text:"PARTIAL" }
      : service.configured
        ? { cls:"pill-green", text:"CONFIGURED" }
        : service.deferred
          ? (service.deferred.due
              ? { cls:"pill-purple", text:"READY TO SET UP" }
              : { cls:"pill-grey",   text:"LATER" })
          : service.critical
            ? { cls:"pill-red",   text:"MISSING" }
            : { cls:"pill-grey",  text:"NOT SET" };
  return <span className={`pill ${s.cls}`} style={{ fontSize:10 }}>{s.text}</span>;
};

const ServiceRow = ({ s }) => (
  <div style={{ padding:"14px 0", borderBottom:"1px solid var(--border)" }}>
    <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:9, minWidth:0 }}>
        <span style={{ fontSize:14, fontWeight:700, color: s.retired ? "var(--muted)" : "var(--text)" }}>{s.name}</span>
        {s.critical && (
          <span className="pill pill-purple" title="The platform does not function without this" style={{ fontSize:9.5, padding:"2px 7px" }}>
            CRITICAL
          </span>
        )}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, whiteSpace:"nowrap" }}>
        <span className="mono" style={{ fontSize:11.5, color:"var(--muted)" }}>{s.cost}</span>
        <StatusPill service={s} />
      </div>
    </div>

    <div style={{ fontSize:12.5, color:"var(--text-2)", marginTop:5, lineHeight:1.55 }}>{s.purpose}</div>

    {s.limits && (
      <div className="mono" style={{ fontSize:11.5, color:"var(--muted)", marginTop:4 }}>{s.limits}</div>
    )}

    {s.caveat && (
      // The limits of a source belong next to the source, not in somebody's
      // memory. This is where "it cannot list backlinks" lives.
      <div style={{ fontSize:11.5, color:"#fcd34d", marginTop:6, lineHeight:1.55, paddingLeft:10, borderLeft:"2px solid rgba(251,191,36,0.3)" }}>
        {s.caveat}
      </div>
    )}

    <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:6, lineHeight:1.55 }}>
      <span style={{ color:"var(--dim)" }}>If it stops: </span>{s.whenMissing}
    </div>

    {/* Why it is not set up, and what to do when it should be. Written down
        here so the decision gets re-read rather than re-argued every time
        somebody scrolls past a row with no key. */}
    {s.deferred && (
      <div style={{ marginTop:8, padding:"9px 12px", borderRadius:8,
                    background: s.deferred.due ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${s.deferred.due ? "rgba(124,58,237,0.35)" : "var(--border)"}` }}>
        <div style={{ fontSize:11.5, fontWeight:700, color: s.deferred.due ? "var(--purple-text)" : "var(--text-2)" }}>
          {s.deferred.due
            ? `Waiting on ${s.deferred.label} - that has happened.`
            : `Waiting on ${s.deferred.label}.`}
        </div>
        <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:4, lineHeight:1.55 }}>{s.deferred.why}</div>
        {s.deferred.then && (
          <div style={{ fontSize:11.5, color:"var(--text-2)", marginTop:5, lineHeight:1.55 }}>
            <span style={{ color:"var(--dim)" }}>When it is time: </span>{s.deferred.then}
          </div>
        )}
      </div>
    )}

    {s.env.length > 0 && (
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
        {s.env.map(v => (
          <span key={v.name} className={`pill mono ${v.set ? "pill-green" : "pill-red"}`} title={v.set ? "Set in Railway" : "Not set on this server"}
            style={{ fontSize:10, fontWeight:500, padding:"2px 8px", borderRadius:6 }}>
            {v.set ? "✓" : "✗"} {v.name}
          </span>
        ))}
      </div>
    )}

    {/* Always shown, not only when something is missing.
        The old version offered a link exclusively when a service was
        unconfigured, which is the one moment you do not need it: a working
        service is the one whose balance runs out, whose quota is hit, and
        whose dashboard you actually have to find. */}
    {(s.links || (s.signup && !s.configured)) && !s.retired && (
      <div style={{ display:"flex", gap:14, flexWrap:"wrap", alignItems:"center", marginTop:9 }}>
        {s.links?.console && (
          <a href={s.links.console} target="_blank" rel="noopener noreferrer" style={LINK}>
            Sign in &rarr;
          </a>
        )}
        {s.links?.billing && (
          <a href={s.links.billing} target="_blank" rel="noopener noreferrer" style={LINK}>
            Billing and credit &rarr;
          </a>
        )}
        {s.signup && !s.configured && (
          <a href={s.signup} target="_blank" rel="noopener noreferrer" style={LINK}>
            Get a key &rarr;
          </a>
        )}
        {s.links?.note && (
          <span style={{ fontSize:11, color:"var(--muted)", lineHeight:1.5 }}>{s.links.note}</span>
        )}
      </div>
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
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:14 }}>
        <button type="button" className="btn btn-primary" onClick={load}>&#8635; Refresh</button>
      </div>

      {/* What is about to run out, and where to top it up. Above the
          service list because it is the question people open this tab for. */}
      <BalancesPanel adminFetch={adminFetch} API_URL={API_URL} />

      {error && (
        <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"var(--red)", fontSize:13 }}>
          {error}
        </div>
      )}

      {loading && <div className="card"><SkeletonRows /></div>}

      {data && !loading && (
        <>
          {counts.criticalMissing > 0 && (
            // Surfaced above everything else: a critical service without its
            // key is an outage that has already started, whether or not
            // anybody has noticed it yet.
            <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:12, padding:"14px 18px", marginBottom:20, color:"var(--red)", fontSize:13, lineHeight:1.6 }}>
              <strong>{counts.criticalMissing} critical {counts.criticalMissing === 1 ? "service is" : "services are"} not configured.</strong>{" "}
              These are the ones the platform cannot run without. Check the Railway variables for the rows marked CRITICAL below.
            </div>
          )}

          {counts.deferredDue > 0 && (
            // The point of writing down what we were waiting for: it comes
            // back on its own instead of sitting in a note nobody reopens.
            <div style={{ background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.35)", borderRadius:12, padding:"14px 18px", marginBottom:20, color:"var(--purple-text)", fontSize:13, lineHeight:1.6 }}>
              <strong>{counts.deferredDue} {counts.deferredDue === 1 ? "service is" : "services are"} ready to set up.</strong>{" "}
              What each one was waiting for has happened. They are marked READY TO SET UP below.
            </div>
          )}

          <div className="kpi-grid" style={{ marginBottom:20 }}>
            <Kpi label="Services" value={counts.total} />
            <Kpi label="Configured" value={counts.configured} tone="green" />
            <Kpi label="Not set" value={counts.missing} tone={counts.missing > 0 ? "gold" : "grey"} />
            {counts.deferredDue > 0 && <Kpi label="Ready to set up" value={counts.deferredDue} tone="purple" />}
          </div>

          {Object.entries(data.categories).map(([key, label]) => {
            const inGroup = data.services.filter(s => s.category === key);
            if (!inGroup.length) return null;
            // Anything not configured sorts first inside its group: this page
            // is read when something is wrong, and the broken rows should not
            // be the ones you have to scroll for.
            //
            // A deferral is the exception, and sorts LAST - below the working
            // services - because it is not something to fix now. Unless its
            // moment has come, at which point it is exactly that and goes to
            // the top with everything else needing attention.
            const rank = (x) => (x.deferred && !x.deferred.due ? 2 : x.configured ? 1 : 0);
            const sorted = [...inGroup].sort((a, b) => rank(a) - rank(b));
            return (
              <div key={key} className="card" style={{ marginBottom:16 }}>
                <p className="label" style={{ marginBottom:2 }}>{label}</p>
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
