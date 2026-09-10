// Backups section - off-Railway whole-database backups stored in our own
// bucket. Receives its state and handlers as props from App.jsx. Built from
// the shell's shared parts; the shell's top bar carries the title.
import { Kpi, SkeletonRows } from "../Shell.jsx";

const BackupsSection = ({ bkBusy, bkData, bkError, bkLoading, bkMsg, loadBackups, restoreBackup, restoreConfirm, runBackupNow, setRestoreConfirm }) => (
          <div style={{ width:"100%" }}>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:14 }}>
              <button type="button" className="btn btn-primary" onClick={loadBackups}>↻ Refresh</button>
            </div>

            {bkError && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"var(--red)", fontSize:13 }}>{bkError}</div>}
            {bkMsg && <div style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"var(--green)", fontSize:13 }}>{bkMsg}</div>}
            {(bkLoading || (!bkData && !bkError)) && <div className="card"><SkeletonRows rows={4} /></div>}

            {bkData && !bkLoading && (
              <>
                {!bkData.configured && (
                  <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:12, padding:"16px 18px", marginBottom:20, color:"var(--gold)", fontSize:13, lineHeight:1.6 }}>
                    <strong>Storage not configured.</strong> Set the BACKUP_S3_* environment variables in Railway (bucket endpoint, name, access key, secret) to enable backups. Until then the weekly job is skipped and the buttons below will error.
                  </div>
                )}

                <div className="kpi-grid" style={{ marginBottom:20 }}>
                  <Kpi label="Last backup" value={bkData.lastBackupAt ? new Date(bkData.lastBackupAt).toLocaleString("en-GB") : "Never"} />
                  <Kpi label="Size" value={bkData.lastBackupSize ? `${(bkData.lastBackupSize / 1048576).toFixed(1)} MB` : "-"} />
                  <Kpi label="Schedule" value="Weekly, Sun 03:00 UTC" />
                </div>

                <div style={{ marginBottom:28 }}>
                  <button type="button" className="btn btn-primary" onClick={runBackupNow} disabled={bkBusy || !bkData.configured}>
                    {bkBusy === "backup" ? "Backing up…" : "Back up now"}
                  </button>
                </div>

                <div className="card" style={{ background:"rgba(248,113,113,0.06)", borderColor:"rgba(248,113,113,0.25)", marginBottom:28 }}>
                  <h3 className="card-title" style={{ color:"var(--red)", marginBottom:6 }}>Restore latest backup</h3>
                  <p className="card-sub" style={{ marginBottom:14 }}>
                    This overwrites the live database with the most recent backup. A fresh safety backup is taken automatically first. To proceed, type <strong style={{ color:"var(--text)" }}>RESTORE LIVE DATABASE</strong> below.
                  </p>
                  <input className="field" value={restoreConfirm ?? ""} onChange={e => setRestoreConfirm(e.target.value)} placeholder="Type the confirmation phrase"
                    style={{ maxWidth:320, marginBottom:12 }} />
                  <div>
                    <button type="button" className="btn btn-danger" onClick={restoreBackup} disabled={bkBusy || restoreConfirm !== "RESTORE LIVE DATABASE" || !bkData.configured}>
                      {bkBusy === "restore" ? "Restoring…" : "Restore now"}
                    </button>
                  </div>
                </div>

                {bkData.recent?.length > 0 && (
                  <div>
                    <p className="label" style={{ marginBottom:12 }}>Recent activity</p>
                    <div className="card" style={{ padding:0, overflow:"hidden" }}>
                      {bkData.recent.map((r, i) => (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap", padding:"10px 16px", borderBottom:i < bkData.recent.length - 1 ? "1px solid var(--border)" : "none", fontSize:13 }}>
                          <span style={{ color:"var(--text)" }}>
                            <span style={{ color: r.status === "success" ? "var(--green)" : "var(--red)", marginRight:8 }}>{r.status === "success" ? "✓" : "✕"}</span>
                            {r.kind}{r.error ? <span style={{ color:"var(--red)" }}> - {r.error}</span> : ""}
                          </span>
                          <span className="mono" style={{ color:"var(--muted)", fontSize:12 }}>{new Date(r.created_at).toLocaleString("en-GB")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
);

export default BackupsSection;
