// What is breaking, and what is about to run out.
//
// Every fact on this panel already existed somewhere in this app: balances on
// the External Data tab, the error log on Monitoring, the running build on
// Monitoring too. Nothing was hidden. Nothing was noticed either, because
// noticing meant going to look on a day when nothing appeared to be wrong.
//
// So it sits at the top of the front page and it is silent when there is
// nothing to say. A panel that always shows something is a panel that gets
// scrolled past, and then the day it is right it gets scrolled past too.
import { useEffect, useState } from "react";
import { Skeleton } from "../Shell.jsx";
// The label for a tab comes from the one list that names the screens, so a
// renamed tab cannot leave this panel pointing at a name nobody recognises.
import { navItem, TAB_IDS } from "../nav.js";

const LEVEL = {
  critical: { pill:"pill-red",    label:"BREAKING",  tint:"rgba(248,113,113,0.09)", edge:"rgba(248,113,113,0.32)", text:"var(--red)" },
  warning:  { pill:"pill-gold",   label:"SOON",      tint:"rgba(245,158,11,0.08)",  edge:"rgba(245,158,11,0.3)",   text:"var(--gold)" },
  watch:    { pill:"pill-purple", label:"WORTH DOING", tint:"rgba(124,58,237,0.08)", edge:"rgba(124,58,237,0.3)",  text:"var(--purple-text)" },
};

const Row = ({ w, onGo }) => {
  const l = LEVEL[w.level] || LEVEL.warning;
  return (
    <div style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"11px 14px",
                  borderRadius:10, background:l.tint, border:`1px solid ${l.edge}` }}>
      <span className={`pill ${l.pill}`} style={{ fontSize:9.5, padding:"2px 8px", flexShrink:0, marginTop:1 }}>{l.label}</span>
      <div style={{ minWidth:0, flex:1 }}>
        <div style={{ fontSize:13, fontWeight:700, color:l.text, lineHeight:1.45 }}>{w.title}</div>
        {w.detail && (
          <div style={{ fontSize:12, color:"var(--text-2)", marginTop:3, lineHeight:1.55 }}>{w.detail}</div>
        )}
        {/* The action is the point. "Errors are up" is an observation; a
            warning has to say what to do about it. */}
        {w.action && (
          <div style={{ fontSize:12, color:"var(--text)", marginTop:4, lineHeight:1.55 }}>
            <span style={{ color:"var(--dim)" }}>Do: </span>{w.action}
          </div>
        )}
        {/* Where the number came from, when it is worth knowing it might be
            incomplete. Better said here than assumed to be certain. */}
        {w.confidence && (
          <div style={{ fontSize:11, color:"var(--muted)", marginTop:4, lineHeight:1.5 }}>{w.confidence}</div>
        )}
        <div style={{ display:"flex", gap:12, marginTop:6, flexWrap:"wrap" }}>
          {w.where && TAB_IDS.has(w.where) && (
            <button type="button" className="btn-bare" onClick={() => onGo(w.where)}
              style={{ fontSize:11.5, color:"var(--sky)" }}>
              Open {navItem(w.where).label}
            </button>
          )}
          {w.link && (
            <a href={w.link} target="_blank" rel="noopener noreferrer"
               style={{ fontSize:11.5, color:"var(--sky)", textDecoration:"none" }}>
              Billing and credit &rarr;
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const WarningsPanel = ({ adminFetch, API_URL, onGo }) => {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminFetch(`${API_URL}/admin/external-data/warnings`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "failed");
      setData(d); setFailed(false);
    } catch { setFailed(true); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const warnings = data?.warnings || [];
  const summary = data?.summary || {};
  const head = [
    summary.critical ? `${summary.critical} breaking` : null,
    summary.warning ? `${summary.warning} needing attention soon` : null,
    summary.watch ? `${summary.watch} worth doing` : null,
  ].filter(Boolean).join(" \u00b7 ");

  // The card and its heading are always rendered, whatever state this is in.
  // A panel whose first paint is a bare grey bar tells you nothing, and a
  // panel that disappears entirely when it has nothing to say is
  // indistinguishable from one that is broken.
  return (
    <div className="card">
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <div>
          <div className="card-title" style={{ fontSize:14 }}>Platform health</div>
          <div className="card-sub">
            {failed
              ? "The check did not run, so this is not an all-clear."
              : loading && !data
                ? "Checking what is breaking and what is close to running out\u2026"
                : warnings.length
                  ? head
                  : "Nothing is breaking and nothing is close to running out."}
          </div>
        </div>
        <button type="button" className="btn btn-sm" onClick={load} disabled={loading}>
          {loading ? "Checking\u2026" : "Check again"}
        </button>
      </div>

      {loading && !data && (
        <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
          <Skeleton h={44} /><Skeleton h={44} w="82%" />
        </div>
      )}

      {failed && (
        <p style={{ fontSize:12, color:"var(--gold)", margin:"10px 0 0", lineHeight:1.55 }}>
          Balances, keys and the error log could not all be read just now. Try again, or open{" "}
          {navItem("monitoring").label} to look directly.
        </p>
      )}

      {warnings.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:12 }}>
          {warnings.map(w => <Row key={w.id} w={w} onGo={onGo} />)}
        </div>
      )}

      {data?.cachedSecondsAgo > 30 && (
        // Balances come from a provider over the wire, so they are cached for
        // a few minutes. Saying how old the answer is costs one line and
        // stops a stale number being read as a live one.
        <p style={{ fontSize:11, color:"var(--muted)", margin:"10px 0 0" }}>
          Checked {Math.round(data.cachedSecondsAgo / 60) || 1} minute{Math.round(data.cachedSecondsAgo / 60) === 1 ? "" : "s"} ago.
        </p>
      )}
    </div>
  );
};

export default WarningsPanel;
