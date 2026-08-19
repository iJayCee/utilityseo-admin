// Backups section - extracted verbatim from App.jsx as part of splitting the
// 2,600-line monolith into a component per section. Receives its state and
// handlers as props so behaviour is byte-identical to the inline version;
// restyling comes as a separate pass once every section is extracted.
const BackupsSection = ({ bkBusy, bkData, bkError, bkLoading, bkMsg, loadBackups, restoreBackup, restoreConfirm, runBackupNow, setRestoreConfirm }) => (
          <div style={{ width:"100%" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:800, color:"#e2e8f0", margin:0 }}>💾 Backups</h2>
                <p style={{ fontSize:13, color:"#64748b", margin:"4px 0 0" }}>Off-Railway whole-database backups stored in your own bucket</p>
              </div>
              <button onClick={loadBackups} style={{ padding:"9px 20px", background:"#7C3AED", border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif" }}>↻ Refresh</button>
            </div>

            {bkError && <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#f87171", fontSize:13 }}>{bkError}</div>}
            {bkMsg && <div style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#4ade80", fontSize:13 }}>{bkMsg}</div>}
            {bkLoading && <div style={{ textAlign:"center", padding:"60px 20px", color:"#64748b", fontSize:14 }}>Loading backup status…</div>}

            {bkData && !bkLoading && (
              <>
                {!bkData.configured && (
                  <div style={{ background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.3)", borderRadius:12, padding:"16px 18px", marginBottom:20, color:"#fcd34d", fontSize:13, lineHeight:1.6 }}>
                    <strong>Storage not configured.</strong> Set the BACKUP_S3_* environment variables in Railway (bucket endpoint, name, access key, secret) to enable backups. Until then the weekly job is skipped and the buttons below will error.
                  </div>
                )}

                <div className="glass" style={{ borderRadius:14, padding:"18px 20px", marginBottom:20, display:"flex", gap:24, flexWrap:"wrap" }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>Last backup</div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#e2e8f0" }}>{bkData.lastBackupAt ? new Date(bkData.lastBackupAt).toLocaleString("en-GB") : "Never"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>Size</div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#e2e8f0", fontFamily:"JetBrains Mono,monospace" }}>{bkData.lastBackupSize ? `${(bkData.lastBackupSize / 1048576).toFixed(1)} MB` : "-"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>Schedule</div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#e2e8f0" }}>Weekly, Sun 03:00 UTC</div>
                  </div>
                </div>

                <div style={{ marginBottom:28 }}>
                  <button onClick={runBackupNow} disabled={bkBusy || !bkData.configured}
                    style={{ padding:"11px 24px", background:bkBusy?"#475569":"#22c55e", border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:700, cursor:bkBusy?"default":"pointer", fontFamily:"Sora,sans-serif", opacity:(!bkData.configured)?0.5:1 }}>
                    {bkBusy === "backup" ? "Backing up…" : "Back up now"}
                  </button>
                </div>

                <div style={{ background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:14, padding:"18px 20px", marginBottom:28 }}>
                  <h3 style={{ fontSize:15, fontWeight:800, color:"#f87171", margin:"0 0 6px" }}>⚠ Restore latest backup</h3>
                  <p style={{ fontSize:13, color:"#94a3b8", margin:"0 0 14px", lineHeight:1.6 }}>
                    This overwrites the live database with the most recent backup. A fresh safety backup is taken automatically first. To proceed, type <strong style={{ color:"#e2e8f0" }}>RESTORE LIVE DATABASE</strong> below.
                  </p>
                  <input value={restoreConfirm} onChange={e => setRestoreConfirm(e.target.value)} placeholder="Type the confirmation phrase"
                    style={{ width:"100%", maxWidth:320, padding:"10px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, color:"#e2e8f0", fontSize:13, fontFamily:"Sora,sans-serif", marginBottom:12 }} />
                  <div>
                    <button onClick={restoreBackup} disabled={bkBusy || restoreConfirm !== "RESTORE LIVE DATABASE" || !bkData.configured}
                      style={{ padding:"11px 24px", background:(restoreConfirm === "RESTORE LIVE DATABASE" && !bkBusy)?"#ef4444":"#475569", border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:700, cursor:(restoreConfirm === "RESTORE LIVE DATABASE" && !bkBusy)?"pointer":"default", fontFamily:"Sora,sans-serif", opacity:(restoreConfirm === "RESTORE LIVE DATABASE" && !bkBusy)?1:0.6 }}>
                      {bkBusy === "restore" ? "Restoring…" : "Restore now"}
                    </button>
                  </div>
                </div>

                {bkData.recent?.length > 0 && (
                  <div>
                    <h3 style={{ fontSize:14, fontWeight:700, color:"#94a3b8", margin:"0 0 12px" }}>Recent activity</h3>
                    <div className="glass" style={{ borderRadius:12, overflow:"hidden" }}>
                      {bkData.recent.map((r, i) => (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", borderBottom:i < bkData.recent.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", fontSize:13 }}>
                          <span style={{ color:"#e2e8f0" }}>
                            <span style={{ color: r.status === "success" ? "#4ade80" : "#f87171", marginRight:8 }}>{r.status === "success" ? "✓" : "✕"}</span>
                            {r.kind}{r.error ? <span style={{ color:"#f87171" }}> - {r.error}</span> : ""}
                          </span>
                          <span style={{ color:"#64748b", fontFamily:"JetBrains Mono,monospace" }}>{new Date(r.created_at).toLocaleString("en-GB")}</span>
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
