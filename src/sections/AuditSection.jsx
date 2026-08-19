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
import { card, label, Section, SectionHeader } from "../shared.jsx";

const btn = (bg = "#7C3AED") => ({ padding:"10px 18px", background:bg, border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", minHeight:44 });
const ghost = { ...btn("transparent"), border:"1px solid rgba(255,255,255,0.12)", color:"#e2e8f0", fontWeight:600 };
const mono = { fontFamily:"JetBrains Mono,monospace" };

// Colour by WHO acted, not by whether it went well. "Stripe changed this" is
// not good or bad news on its own - it is the attribution that matters, and a
// traffic-light palette here would imply a judgement the log is not making.
const ACTOR = {
  admin:  { colour:"#a78bfa", label:"Admin" },
  stripe: { colour:"#38bdf8", label:"Stripe" },
  system: { colour:"#64748b", label:"System" },
  self:   { colour:"#34d399", label:"Customer" },
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
    <Section>
      <SectionHeader
        title="Audit log"
        subtitle="Every change to an account, including the ones made by Stripe and by scheduled jobs."
        right={<button style={ghost} onClick={load}>Refresh</button>}
      />

      {error && (
        <div style={{ ...card, borderColor:"rgba(248,113,113,0.3)", background:"rgba(248,113,113,0.08)", color:"#f87171", fontSize:13 }}>{error}</div>
      )}

      {/* Plans currently pinned by hand. This is otherwise invisible state:
          without it, an account whose plan stops responding to Stripe looks
          broken rather than deliberately held. */}
      {!!data?.locked?.length && (
        <div style={{ ...card, borderColor:"rgba(167,139,250,0.3)" }}>
          <p style={label}>Plans set by hand</p>
          <p style={{ fontSize:12.5, color:"#94a3b8", lineHeight:1.6, margin:"0 0 12px" }}>
            Billing will not change these. A renewal or card update in Stripe is recorded below but not applied.
            Clearing the lock hands the plan back to Stripe from its next subscription event.
          </p>
          {data.locked.map(u => (
            <div key={u.id} style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap", padding:"8px 0", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize:13, color:"#e2e8f0", flex:1, minWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</span>
              <span style={{ ...mono, fontSize:12, color:"#a78bfa" }}>{u.plan}</span>
              <span style={{ fontSize:11, color:"#64748b" }}>by {u.plan_locked_by || "admin"} · {when(u.plan_locked_at)}</span>
              <button style={{ ...ghost, padding:"6px 12px", minHeight:36, fontSize:12 }}
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
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{ padding:"7px 14px", borderRadius:8, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:"Sora,sans-serif",
                     border:`1px solid ${filter===f.id ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
                     background: filter===f.id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                     color: filter===f.id ? "#a78bfa" : "#64748b" }}>
            {f.label}
          </button>
        ))}
      </div>

      {!data && !error && <div style={card}><p style={{ color:"#64748b", fontSize:13 }}>Loading…</p></div>}

      {data && !entries.length && (
        <div style={{ ...card, textAlign:"center", padding:32 }}>
          <p style={{ fontSize:14, color:"#94a3b8", margin:0 }}>Nothing recorded yet.</p>
          <p style={{ fontSize:12.5, color:"#64748b", margin:"8px 0 0", lineHeight:1.6 }}>
            The log starts from the moment it was added, so anything that happened before then is not here.
          </p>
        </div>
      )}

      {entries.map(e => {
        const a = ACTOR[e.actor] || ACTOR.system;
        const blocked = e.action === BLOCKED;
        return (
          <div key={e.id} style={{ ...card, marginBottom:10, borderColor: blocked ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.07)" }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ fontSize:11, fontWeight:700, color:a.colour, background:`${a.colour}1a`, border:`1px solid ${a.colour}33`, padding:"3px 10px", borderRadius:99 }}>{a.label}</span>
              <span style={{ ...mono, fontSize:12.5, color: blocked ? "#f59e0b" : "#e2e8f0", fontWeight:700 }}>{e.action}</span>
              {e.target_email && <span style={{ fontSize:12.5, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:260 }}>{e.target_email}</span>}
              <span style={{ fontSize:11.5, color:"#475569", marginLeft:"auto", whiteSpace:"nowrap" }}>{when(e.at)}</span>
            </div>

            {(e.before_value !== null || e.after_value !== null) && (
              <p style={{ ...mono, fontSize:12.5, color:"#94a3b8", margin:"8px 0 0" }}>
                {val(e.before_value)} <span style={{ color:"#475569" }}>→</span>{" "}
                <span style={{ color: blocked ? "#f59e0b" : "#34d399" }}>{val(e.after_value)}</span>
                {blocked && <span style={{ color:"#f59e0b", fontFamily:"Sora,sans-serif", fontSize:11.5 }}> (not applied)</span>}
              </p>
            )}

            {e.note && <p style={{ fontSize:12, color:"#64748b", margin:"6px 0 0", lineHeight:1.6 }}>{e.note}</p>}
            {e.actor_id && <p style={{ ...mono, fontSize:10.5, color:"#334155", margin:"6px 0 0" }}>{e.actor_id}</p>}
          </div>
        );
      })}
    </Section>
  );
};

export default AuditSection;
