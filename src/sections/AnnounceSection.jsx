// AnnounceSection - broadcast a message to every user's notification bell,
// with the full history underneath. Props carry the App-level state and
// handlers. Built from the shell's shared parts; the top bar carries the title.
import { EmptyState, SkeletonRows } from "../Shell.jsx";

const AnnounceSection = ({ annBusy, annData, annError, annForm, annLoading, deleteAnnouncement, loadAnnouncements, sendAnnouncement, setAnnForm, toggleAnnouncement, users }) => {
          const TYPES = {
            outage:      { label: "Outage",      col: "var(--red)",         pill: "pill-red",    desc: "Something is down right now" },
            maintenance: { label: "Maintenance", col: "var(--gold)",        pill: "pill-gold",   desc: "Planned or ongoing work" },
            update:      { label: "Update",      col: "var(--green)",       pill: "pill-green",  desc: "New feature or improvement" },
            notice:      { label: "Notice",      col: "var(--purple-text)", pill: "pill-purple", desc: "General information" },
          };
          const TEMPLATES = {
            outage:      { title: "Service disruption", body: "We're aware of an issue affecting [feature] and are working on a fix. We'll update here as soon as it's resolved. Sorry for the disruption." },
            maintenance: { title: "Scheduled maintenance", body: "We'll be carrying out maintenance on [date] between [time] and [time] UTC. The platform may be briefly unavailable during this window." },
            update:      { title: "What's new", body: "We've just shipped [feature]. Here's what it does and how to use it: [details]." },
            notice:      { title: "A quick note", body: "[Your message here]." },
          };
          const applyTemplate = (type) => setAnnForm({ type, title: TEMPLATES[type].title, body: TEMPLATES[type].body });
          const fmtDate = (d) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
          const current = TYPES[annForm.type] || TYPES.notice;
          return (
          <div style={{ width:"100%" }}>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:14 }}>
              <button type="button" className="btn btn-primary" onClick={loadAnnouncements}>↻ Refresh</button>
            </div>

            {annError && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "var(--red)", fontSize: 13 }}>{annError}</div>}

            {/* Composer */}
            <div className="card" style={{ marginBottom: 24 }}>
              <p className="label" style={{ marginBottom: 12 }}>New announcement</p>
              {/* Type + templates */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {Object.entries(TYPES).map(([id, t]) => (
                  <button key={id} type="button" className={`btn btn-sm${annForm.type === id ? " btn-active" : ""}`} onClick={() => setAnnForm(f => ({ ...f, type: id }))} title={t.desc}
                    style={annForm.type === id ? { color: t.col, borderColor: t.col } : undefined}>
                    {t.label}
                  </button>
                ))}
                <button type="button" className="btn btn-sm" onClick={() => applyTemplate(annForm.type)} style={{ marginLeft: "auto", borderStyle: "dashed", color: "var(--muted)" }}>
                  ↳ Use "{current.label}" template
                </button>
              </div>
              <input className="field" value={annForm.title} onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))} placeholder="Title (e.g. Scheduled maintenance)" maxLength={200}
                style={{ fontWeight: 600, marginBottom: 10 }} />
              <textarea className="field" value={annForm.body} onChange={e => setAnnForm(f => ({ ...f, body: e.target.value }))} placeholder="Message body…" rows={4} maxLength={4000}
                style={{ fontSize: 13.5, resize: "vertical", lineHeight: 1.5 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Goes live instantly to every user's bell. {annForm.body.length}/4000</span>
                <button type="button" className="btn btn-primary" onClick={sendAnnouncement} disabled={annBusy || !annForm.title.trim() || !annForm.body.trim()}>
                  {annBusy ? "Sending…" : `Send ${current.label.toLowerCase()}`}
                </button>
              </div>
            </div>

            {/* History */}
            <p className="label" style={{ marginBottom: 12 }}>History ({annData?.length || 0})</p>
            {(annLoading || (!annData && !annError)) && <div className="card"><SkeletonRows rows={3} /></div>}
            {annData && annData.length === 0 && !annLoading && <div className="card"><EmptyState title="No announcements sent yet" text="Write one above and it reaches every user's bell straight away." /></div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(annData || []).map(a => {
                const t = TYPES[a.type] || TYPES.notice;
                return (
                  <div key={a.id} className="card" style={{ padding: "14px 16px", borderLeft: `3px solid ${t.col}`, opacity: a.active ? 1 : 0.55 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span className={`pill ${t.pill}`}>{t.label}</span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{a.title}</span>
                          {!a.active && <span className="pill pill-grey">HIDDEN</span>}
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-2)", margin: "0 0 6px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{a.body}</p>
                        <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                          {fmtDate(a.created_at)}{a.created_by ? ` · ${a.created_by}` : ""} · read by {a.read_count}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button type="button" className="btn btn-sm" onClick={() => toggleAnnouncement(a)} title={a.active ? "Hide from users" : "Show to users"}>
                          {a.active ? "Hide" : "Show"}
                        </button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => deleteAnnouncement(a.id)} title="Delete permanently">
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
