// AnnounceSection - extracted verbatim from App.jsx (admin split). Behaviour is
// byte-identical to the inline version; props carry the App-level state and
// handlers it used in place. Restyle happens as a separate pass.
const AnnounceSection = ({ annBusy, annData, annError, annForm, annLoading, deleteAnnouncement, loadAnnouncements, sendAnnouncement, setAnnForm, toggleAnnouncement, users }) => {
          const TYPES = {
            outage:      { label: "Outage",      icon: "🔴", col: "#f87171", desc: "Something is down right now" },
            maintenance: { label: "Maintenance", icon: "🛠", col: "#fbbf24", desc: "Planned or ongoing work" },
            update:      { label: "Update",      icon: "✨", col: "#34d399", desc: "New feature or improvement" },
            notice:      { label: "Notice",      icon: "ℹ️", col: "#a78bfa", desc: "General information" },
          };
          const TEMPLATES = {
            outage:      { title: "Service disruption", body: "We're aware of an issue affecting [feature] and are working on a fix. We'll update here as soon as it's resolved. Sorry for the disruption." },
            maintenance: { title: "Scheduled maintenance", body: "We'll be carrying out maintenance on [date] between [time] and [time] UTC. The platform may be briefly unavailable during this window." },
            update:      { title: "What's new", body: "We've just shipped [feature]. Here's what it does and how to use it: [details]." },
            notice:      { title: "A quick note", body: "[Your message here]." },
          };
          const applyTemplate = (type) => setAnnForm({ type, title: TEMPLATES[type].title, body: TEMPLATES[type].body });
          const fmtDate = (d) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
          return (
          <div style={{ maxWidth: 1000, width: "100%", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#e2e8f0", margin: 0 }}>📢 Announcements</h2>
                <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>Broadcast a message to all users' notification bell. Full history kept below.</p>
              </div>
              <button onClick={loadAnnouncements} style={{ padding: "9px 20px", background: "#7C3AED", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif" }}>↻ Refresh</button>
            </div>

            {annError && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#f87171", fontSize: 13 }}>{annError}</div>}

            {/* Composer */}
            <div className="glass" style={{ borderRadius: 14, padding: "18px 20px", marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>New announcement</div>
              {/* Type + templates */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {Object.entries(TYPES).map(([id, t]) => (
                  <button key={id} onClick={() => setAnnForm(f => ({ ...f, type: id }))} title={t.desc}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 10, cursor: "pointer", fontFamily: "Sora,sans-serif", fontSize: 13, fontWeight: 600,
                      background: annForm.type === id ? `${t.col}1f` : "transparent", border: `1px solid ${annForm.type === id ? `${t.col}77` : "rgba(255,255,255,0.1)"}`, color: annForm.type === id ? t.col : "#94a3b8" }}>
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
                <button onClick={() => applyTemplate(annForm.type)}
                  style={{ marginLeft: "auto", padding: "7px 13px", borderRadius: 10, cursor: "pointer", fontFamily: "Sora,sans-serif", fontSize: 12.5, fontWeight: 600, background: "transparent", border: "1px dashed rgba(255,255,255,0.2)", color: "#94a3b8" }}>
                  ↳ Use "{TYPES[annForm.type].label}" template
                </button>
              </div>
              <input value={annForm.title} onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))} placeholder="Title (e.g. Scheduled maintenance)" maxLength={200}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: 14, fontWeight: 600, padding: "10px 12px", marginBottom: 10, fontFamily: "Sora,sans-serif", boxSizing: "border-box" }} />
              <textarea value={annForm.body} onChange={e => setAnnForm(f => ({ ...f, body: e.target.value }))} placeholder="Message body…" rows={4} maxLength={4000}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: 13.5, padding: "10px 12px", fontFamily: "Sora,sans-serif", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "#475569" }}>Goes live instantly to every user's bell. {annForm.body.length}/4000</span>
                <button onClick={sendAnnouncement} disabled={annBusy || !annForm.title.trim() || !annForm.body.trim()}
                  style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: TYPES[annForm.type].col, color: "#0d0d14", fontSize: 13.5, fontWeight: 800, cursor: annBusy ? "default" : "pointer", opacity: (annBusy || !annForm.title.trim() || !annForm.body.trim()) ? 0.5 : 1, fontFamily: "Sora,sans-serif" }}>
                  {annBusy ? "Sending…" : `Send ${TYPES[annForm.type].label.toLowerCase()}`}
                </button>
              </div>
            </div>

            {/* History */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>History ({annData?.length || 0})</div>
            {annLoading && <div style={{ textAlign: "center", padding: "40px", color: "#64748b", fontSize: 14 }}>Loading…</div>}
            {annData && annData.length === 0 && !annLoading && <div style={{ textAlign: "center", padding: "40px", color: "#64748b", fontSize: 14 }}>No announcements sent yet.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(annData || []).map(a => {
                const t = TYPES[a.type] || TYPES.notice;
                return (
                  <div key={a.id} className="glass" style={{ borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${t.col}`, opacity: a.active ? 1 : 0.55 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: t.col, background: `${t.col}1f`, border: `1px solid ${t.col}55`, borderRadius: 99, padding: "2px 9px" }}>{t.icon} {t.label}</span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{a.title}</span>
                          {!a.active && <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", background: "rgba(100,116,139,0.15)", borderRadius: 99, padding: "2px 8px" }}>HIDDEN</span>}
                        </div>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 6px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{a.body}</p>
                        <div style={{ fontSize: 11, color: "#475569", fontFamily: "JetBrains Mono,monospace" }}>
                          {fmtDate(a.created_at)}{a.created_by ? ` · ${a.created_by}` : ""} · read by {a.read_count}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => toggleAnnouncement(a)} title={a.active ? "Hide from users" : "Show to users"}
                          style={{ padding: "6px 12px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Sora,sans-serif" }}>
                          {a.active ? "Hide" : "Show"}
                        </button>
                        <button onClick={() => deleteAnnouncement(a.id)} title="Delete permanently"
                          style={{ padding: "6px 12px", borderRadius: 8, background: "transparent", border: "1px solid rgba(248,113,113,0.35)", color: "#f87171", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Sora,sans-serif" }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          );
};

export default AnnounceSection;
