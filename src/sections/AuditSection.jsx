// Who changed what - and what changed it back.
//
// This exists because a plan set to Enterprise here kept reverting to
// Entrepreneur, and nothing on any screen said why. A Stripe
// customer.subscription.updated webhook was rewriting it from the
// subscription's price: correct behaviour, applied invisibly, so the only
// visible symptom was the same manual upgrade being repeated forever.
//
// So the log deliberately shows AUTOMATED actors alongside human ones. A log
// of admin actions alone would have shown four identical upgrades and no
// explanation for why none of them stuck. That is the whole point: the
// interesting row is usually not the one a person caused.
import { useState, useEffect } from "react";
import { EmptyState, SkeletonRows } from "../Shell.jsx";

// Colour by WHO acted, not by whether it went well. "Stripe changed this" is
// not good or bad news on its own - it is the attribution that matters, and a
// traffic-light palette here would imply a judgement the log is not making.
// There is no sky pill in admin.css, so Stripe carries its own colours.
const ACTOR = {
  admin:  { pill:"pill pill-purple", label:"Admin" },
  stripe: { pill:"pill", style:{ background:"rgba(125,211,252,0.12)", color:"var(--sky)", border:"1px solid rgba(125,211,252,0.35)" }, label:"Stripe" },
  system: { pill:"pill pill-grey",   label:"System" },
  self:   { pill:"pill pill-green",  label:"Customer" },
};

// The one action that is genuinely a warning: billing tried to change a plan
// and was refused. Nothing is broken, but somebody should know.
const BLOCKED = "plan_change_blocked";

const readJson = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`The API returned ${res.status} instead of data.`); }
};

const when = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-GB", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" });
  } catch { return iso; }
};

const val = (v) => {
  if (v === null || v === undefined) return "-";
  if (typeof v === "string") return v;
  return JSON.stringify(v);
};

const AuditSection = ({ adminFetch, API_URL }) => {
  const [data, setData]     = useState(null);
  const [error, setError]   = useState("");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy]     = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await adminFetch(`${API_URL}/admin/audit?limit=300`);
      const d = await readJson(res);
      if (!res.ok) throw new Error(d.error || "Could not load the audit log");
      setData(d);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const clearLock = async (userId) => {
    setBusy(`lock-${userId}`); setError("");
    try {
      const res = await adminFetch(`${API_URL}/admin/users/${userId}/plan-lock`, { method:"DELETE" });
      const d = await readJson(res);
      if (!res.ok) throw new Error(d.error || "Could not clear the lock");
      await load();
    } catch (e) { setError(e.message); } finally { setBusy(""); }
  };

  const entries = (data?.entries || []).filter(e =>
    filter === "all" ? true : filter === "blocked" ? e.action === BLOCKED : e.actor === filter
  );

  return (
    <div style={{ width:"100%" }}>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:14 }}>
        <button type="button" className="btn" onClick={load}>Refresh</button>
      </div>

      {error && (
        <div className="card" style={{ borderColor:"rgba(248,113,113,0.3)", background:"rgba(248,113,113,0.08)", color:"var(--red)", fontSize:13, marginBottom:16 }}>{error}</div>
      )}

      {/* Plans currently pinned by hand. This is otherwise invisible state:
          without it, an account whose plan stops responding to Stripe looks
          broken rather than deliberately held. */}
      {!!data?.locked?.length && (
        <div className="card" style={{ borderColor:"rgba(167,139,250,0.3)", marginBottom:16 }}>
          <p className="label" style={{ marginBottom:6 }}>Plans set by hand</p>
          <p className="card-sub" style={{ margin:"0 0 12px" }}>
            Billing will not change these. A renewal or card update in Stripe is recorded below but not applied.
            Clearing the lock hands the plan back to Stripe from its next subscription event.
          </p>
          {data.locked.map(u => (
            <div key={u.id} style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap", padding:"8px 0", borderTop:"1px solid var(--border)" }}>
              <span style={{ fontSize:13, color:"var(--text)", flex:1, minWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</span>
              <span className="mono" style={{ fontSize:12, color:"var(--purple-text)" }}>{u.plan}</span>
              <span style={{ fontSize:11, color:"var(--muted)" }}>by {u.plan_locked_by || "admin"} · {when(u.plan_locked_at)}</span>
              <button type="button" className="btn btn-sm"
                onClick={() => clearLock(u.id)} disabled={busy === `lock-${u.id}`}>
                {busy === `lock-${u.id}` ? "Clearing…" : "Hand back to Stripe"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
        {[
          { id:"all",     label:"Everything" },
          { id:"admin",   label:"Admin" },
          { id:"stripe",  label:"Stripe" },
          { id:"system",  label:"System" },
          { id:"blocked", label:"Blocked by a lock" },
        ].map(f => (
          <button key={f.id} type="button" className={`btn btn-sm${filter===f.id ? " btn-active" : ""}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {!data && !error && <div className="card"><SkeletonRows /></div>}

      {data && !entries.length && (
        <div className="card">
          <EmptyState title="Nothing recorded yet" text="The log starts from the moment it was added, so anything that happened before then is not here." />
        </div>
      )}

      {entries.map(e => {
        const a = ACTOR[e.actor] || ACTOR.system;
        const blocked = e.action === BLOCKED;
        return (
          <div key={e.id} className="card" style={{ marginBottom:10, borderColor: blocked ? "rgba(245,158,11,0.3)" : undefined }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
              <span className={a.pill} style={a.style}>{a.label}</span>
              <span className="mono" style={{ fontSize:12.5, color: blocked ? "var(--gold)" : "var(--text)", fontWeight:700 }}>{e.action}</span>
              {e.target_email && <span style={{ fontSize:12.5, color:"var(--text-2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:260 }}>{e.target_email}</span>}
              <span style={{ fontSize:11.5, color:"var(--muted)", marginLeft:"auto", whiteSpace:"nowrap" }}>{when(e.at)}</span>
            </div>

            {(e.before_value !== null || e.after_value !== null) && (
              <p className="mono" style={{ fontSize:12.5, color:"var(--text-2)", margin:"8px 0 0" }}>
                {val(e.before_value)} <span style={{ color:"var(--dim)" }}>→</span>{" "}
                <span style={{ color: blocked ? "var(--gold)" : "var(--green)" }}>{val(e.after_value)}</span>
                {blocked && <span style={{ color:"var(--gold)", fontFamily:"Sora,sans-serif", fontSize:11.5 }}> (not applied)</span>}
              </p>
            )}

            {e.note && <p style={{ fontSize:12, color:"var(--muted)", margin:"6px 0 0", lineHeight:1.6 }}>{e.note}</p>}
            {e.actor_id && <p className="mono" style={{ fontSize:10.5, color:"var(--dim)", margin:"6px 0 0" }}>{e.actor_id}</p>}
          </div>
        );
      })}
    </div>
  );
};

export default AuditSection;
