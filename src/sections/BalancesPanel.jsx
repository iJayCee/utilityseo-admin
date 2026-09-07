// What every paid service costs, and how much is left.
//
// The 2am panel: something has stopped, and the first question is whether we
// ran out of money. Every row carries a sign-in link and a billing link, so
// topping up is one click from the thing that told you to.
//
// The labels matter more than the numbers. A live balance came from the
// provider a second ago. "Spent" is our own record of what we sent them,
// which is not a balance and cannot see spend from anywhere else. And a
// provider that publishes nothing readable says so, rather than us showing a
// number that could be mistaken for a balance.
import { useEffect, useState } from "react";

const KIND_STYLE = {
  live: { label: "live balance", colour: "#34d399", bg: "rgba(52,211,153,0.12)" },
  ours: { label: "our spend", colour: "#a5b4fc", bg: "rgba(99,102,241,0.14)" },
  none: { label: "not readable", colour: "#64748b", bg: "rgba(100,116,139,0.12)" },
};

const money = (n) => (n == null ? null : `$${Number(n).toFixed(2)}`);

const BalancesPanel = ({ adminFetch, API_URL }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const r = await adminFetch(`${API_URL}/admin/external-data/balances`);
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || "Could not read the balances.");
      setData(body);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const card = { background: "#13131F", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 18px", marginBottom: 16 };
  const muted = { fontSize: 12, color: "#64748b", lineHeight: 1.6, margin: 0 };
  const link = { fontSize: 11.5, color: "#818cf8", textDecoration: "none", whiteSpace: "nowrap" };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0", margin: 0 }}>What is left</h3>
          <p style={{ ...muted, marginTop: 3 }}>
            Every service we pay for, what runs on it, and where to top it up. A balance marked live came from the provider just now.
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {data?.aiSpendMonthToDate != null && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>AI this month</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", fontFamily: "JetBrains Mono,monospace" }}>{money(data.aiSpendMonthToDate)}</div>
            </div>
          )}
          <button onClick={load} disabled={loading} style={{ minHeight: 36, padding: "0 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#94a3b8", fontSize: 12.5, cursor: "pointer" }}>
            {loading ? "Reading…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && <div style={{ ...card, borderColor: "rgba(248,113,113,0.3)" }}><p style={{ ...muted, color: "#f87171" }}>{error}</p></div>}
      {loading && !data && <div style={card}><p style={muted}>Reading the providers…</p></div>}

      {data?.services?.map(s => {
        const k = KIND_STYLE[s.kind] || KIND_STYLE.none;
        const low = s.kind === "live" && s.balance != null && s.balance < 10;
        return (
          <div key={s.id} style={{ ...card, borderColor: low ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{s.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: k.bg, color: k.colour }}>{k.label}</span>
                  {!s.configured && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}>not connected</span>}
                  {low && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "rgba(248,113,113,0.15)", color: "#f87171" }}>running out</span>}
                </div>
                <p style={{ ...muted, marginTop: 4 }}>{s.what}</p>
                <p style={{ ...muted, marginTop: 4, fontSize: 11.5 }}>{s.error ? s.error + " " : ""}{s.note}</p>
              </div>

              <div style={{ textAlign: "right", minWidth: 120 }}>
                {s.kind === "live" && s.balance != null && (
                  <>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "JetBrains Mono,monospace", color: low ? "#f87171" : "#34d399" }}>{money(s.balance)}</div>
                    {s.spentToday != null && <div style={{ fontSize: 11, color: "#64748b" }}>{money(s.spentToday)} today</div>}
                  </>
                )}
                {s.kind === "ours" && (
                  <>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "JetBrains Mono,monospace", color: "#e2e8f0" }}>{money(s.spent30d) ?? "-"}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>our spend, 30 days</div>
                  </>
                )}
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                  {s.links?.console && <a href={s.links.console} target="_blank" rel="noopener noreferrer" style={link}>Sign in</a>}
                  {s.links?.billing && <a href={s.links.billing} target="_blank" rel="noopener noreferrer" style={{ ...link, color: "#a78bfa", fontWeight: 700 }}>Top up</a>}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {data?.legend && (
        <p style={{ ...muted, fontSize: 11 }}>
          {Object.entries(data.legend).map(([k, v]) => `${KIND_STYLE[k]?.label || k}: ${v}`).join("  ")}
        </p>
      )}
    </div>
  );
};

export default BalancesPanel;
