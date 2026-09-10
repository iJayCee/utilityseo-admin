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
import { SkeletonRows } from "../Shell.jsx";

const KIND_STYLE = {
  live: { label: "live balance", pill: "pill-green" },
  ours: { label: "our spend", pill: "pill-purple" },
  none: { label: "not readable", pill: "pill-grey" },
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

  const link = { fontSize: 11.5, color: "var(--sky)", textDecoration: "none", whiteSpace: "nowrap" };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <h3 className="card-title">What is left</h3>
          <p className="card-sub">
            Every service we pay for, what runs on it, and where to top it up. A balance marked live came from the provider just now.
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {data?.aiSpendMonthToDate != null && (
            <div style={{ textAlign: "right" }}>
              <div className="label">AI this month</div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>{money(data.aiSpendMonthToDate)}</div>
            </div>
          )}
          <button type="button" className="btn btn-sm" onClick={load} disabled={loading}>
            {loading ? "Reading…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && <div className="card" style={{ marginBottom: 16, borderColor: "rgba(248,113,113,0.3)" }}><p style={{ fontSize: 12.5, color: "var(--red)", margin: 0 }}>{error}</p></div>}
      {loading && !data && <div className="card" style={{ marginBottom: 16 }}><SkeletonRows rows={3} /></div>}

      {data?.services?.map(s => {
        const k = KIND_STYLE[s.kind] || KIND_STYLE.none;
        const low = s.kind === "live" && s.balance != null && s.balance < 10;
        return (
          <div key={s.id} className="card" style={{ padding: "16px 18px", marginBottom: 16, borderColor: low ? "rgba(248,113,113,0.4)" : undefined }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{s.name}</span>
                  <span className={`pill ${k.pill}`}>{k.label}</span>
                  {!s.configured && <span className="pill pill-gold">not connected</span>}
                  {low && <span className="pill pill-red">running out</span>}
                </div>
                <p className="card-sub" style={{ marginTop: 4 }}>{s.what}</p>
                <p className="card-sub" style={{ marginTop: 4, fontSize: 11.5 }}>{s.error ? s.error + " " : ""}{s.note}</p>
              </div>

              <div style={{ textAlign: "right", minWidth: 120 }}>
                {s.kind === "live" && s.balance != null && (
                  <>
                    <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: low ? "var(--red)" : "var(--green)" }}>{money(s.balance)}</div>
                    {s.spentToday != null && <div style={{ fontSize: 11, color: "var(--muted)" }}>{money(s.spentToday)} today</div>}
                  </>
                )}
                {s.kind === "ours" && (
                  <>
                    <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{money(s.spent30d) ?? "-"}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>our spend, 30 days</div>
                  </>
                )}
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                  {s.links?.console && <a href={s.links.console} target="_blank" rel="noopener noreferrer" style={link}>Sign in</a>}
                  {s.links?.billing && <a href={s.links.billing} target="_blank" rel="noopener noreferrer" style={{ ...link, color: "var(--purple-text)", fontWeight: 700 }}>Top up</a>}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {data?.legend && (
        <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
          {Object.entries(data.legend).map(([k, v]) => `${KIND_STYLE[k]?.label || k}: ${v}`).join("  ")}
        </p>
      )}
    </div>
  );
};

export default BalancesPanel;
