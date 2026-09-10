import { useState, useRef, useCallback } from 'react';
import { Kpi } from './Shell.jsx';

const API = import.meta.env.VITE_API_URL || 'https://utilityseo-production.up.railway.app/api';

// All testable actions - each hits a real backend endpoint
// Base URL - use env var so works in any environment
const BASE_URL = 'https://utilityseo-production.up.railway.app';
const ADMIN_API = import.meta.env.VITE_API_URL || 'https://utilityseo-production.up.railway.app/api';

// testable = no auth token needed, genuinely measurable from browser
// auth_required = will always return 401 from load tester (no user JWT available)
//   - included so you can see endpoint is alive and measure round-trip time
const ACTIONS = [
  { id: 'health',        label: 'Health check',               endpoint: '/health',            base: BASE_URL,  method: 'GET',  desc: 'No auth - true server liveness. Use this for high-RPS tests.',        testable: true  },
  { id: 'auth_login',    label: 'Auth: login (rate limiter)',  endpoint: '/auth/login',        base: ADMIN_API, method: 'POST', desc: 'Tests auth rate limiter (5 req/min). Expects 401 or 429.',             testable: true,  body: { email: 'loadtest@example.com', password: 'loadtest_invalid' } },
  { id: 'pagespeed',     label: 'PageSpeed proxy',            endpoint: '/pagespeed?url=https://utilityseo.com&strategy=mobile', base: ADMIN_API, method: 'GET', desc: 'No auth - tests Google API proxy latency.', testable: true  },
  { id: 'can_scan',      label: 'Usage: can scan?',           endpoint: '/usage/can-scan',    base: ADMIN_API, method: 'GET',  desc: 'Auth required - measures round-trip, expects 401.',                    testable: false },
  { id: 'scans_list',    label: 'Scans: list',                endpoint: '/scans/list?limit=10', base: ADMIN_API, method: 'GET', desc: 'Auth required - measures round-trip, expects 401.',                   testable: false },
  { id: 'todos',         label: 'Todos: fetch all',           endpoint: '/todos',             base: ADMIN_API, method: 'GET',  desc: 'Auth required - measures round-trip, expects 401.',                    testable: false },
  { id: 'workspaces',    label: 'Workspaces: list',           endpoint: '/workspaces/mine',   base: ADMIN_API, method: 'GET',  desc: 'Auth required - measures round-trip, expects 401.',                    testable: false },
  { id: 'competitors',   label: 'Competitors: fetch',         endpoint: '/competitors',       base: ADMIN_API, method: 'GET',  desc: 'Auth required - measures round-trip, expects 401.',                    testable: false },
  { id: 'monitoring',    label: 'Monitoring: settings',       endpoint: '/monitoring/settings', base: ADMIN_API, method: 'GET', desc: 'Auth required - measures round-trip, expects 401.',                   testable: false },
  { id: 'stripe_status', label: 'Stripe: sub status',         endpoint: '/stripe/subscription-status', base: ADMIN_API, method: 'GET', desc: 'Auth required - measures round-trip, expects 401.',            testable: false },
  { id: 'gsc_keywords',  label: 'GSC: keywords (external)',   endpoint: '/gsc/keywords?days=28', base: ADMIN_API, method: 'GET', desc: 'Auth required + Google API - measures round-trip, expects 401.',    testable: false },
];

const FREQ_OPTIONS = [
  { label: '1 req/s',  rps: 1 },
  { label: '2 req/s',  rps: 2 },
  { label: '5 req/s',  rps: 5 },
  { label: '10 req/s', rps: 10 },
  { label: '20 req/s', rps: 20 },
  { label: '50 req/s', rps: 50 },
];

const DURATION_OPTIONS = [
  { label: '10s',  secs: 10 },
  { label: '30s',  secs: 30 },
  { label: '60s',  secs: 60 },
  { label: '2 min', secs: 120 },
];

function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

export default function LoadTestPanel() {
  // Read creds from sessionStorage - same place admin app stores them on login
  const creds = (() => { try { return JSON.parse(sessionStorage.getItem('admin_creds') || 'null'); } catch { return null; } })();
  const adminEmail = creds?.email || '';
  const adminPassword = creds?.password || '';
  const [selectedActions, setSelectedActions] = useState(new Set(['health', 'scans_list', 'usage']));
  const [rps, setRps] = useState(5);
  const [duration, setDuration] = useState(30);
  const [status, setStatus] = useState('idle'); // idle | running | done
  const [log, setLog] = useState([]);
  const [results, setResults] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);

  const runningRef = useRef(false);
  const statsRef = useRef({});
  const logRef = useRef([]);
  const timerRef = useRef(null);

  const toggleAction = (id) => {
    setSelectedActions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addLog = useCallback((msg, type = 'info') => {
    const entry = { msg, type, t: Date.now() };
    logRef.current = [entry, ...logRef.current.slice(0, 199)];
    setLog([...logRef.current]);
  }, []);

  const runRequest = async (action) => {
    if (!action) return;
    const start = performance.now();
    const opts = {
      method: action.method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (action.body) opts.body = JSON.stringify(action.body);

    try {
      const url = action.base ? `${action.base}${action.endpoint}` : `${API}${action.endpoint}`;
      const res = await fetch(url, opts);
      const ms = Math.round(performance.now() - start);
      const s = statsRef.current[action.id];
      s.count++;
      s.times.push(ms);
      s.totalMs += ms;
      if (!res.ok) {
        if (res.status === 401) {
          // 401 on auth-required endpoint = healthy, expected behaviour
          addLog(`${action.label} → 401 (${ms}ms)`, 'ok');
        } else if (res.status === 429) {
          s.rateLimited++;
          addLog(`${action.label} → 429 Rate limited (${ms}ms)`, 'warn');
        } else {
          s.errors++;
          addLog(`${action.label} → ${res.status} (${ms}ms)`, 'error');
        }
      } else {
        addLog(`${action.label} → 200 OK (${ms}ms)`, ms > 2000 ? 'warn' : 'ok');
      }
    } catch (err) {
      const ms = Math.round(performance.now() - start);
      const s = statsRef.current[action.id];
      s.count++;
      s.times.push(ms);
      if (err.message === 'Failed to fetch' && !action.testable) {
        // Auth-required routes often fail at network level without a token - not a real error
        addLog(`${action.label} → no token (${ms}ms)`, 'ok');
      } else {
        s.errors++;
        addLog(`${action.label} → FAIL: ${err.message}`, 'error');
      }
    }
  };

  const startTest = async () => {
    if (selectedActions.size === 0) return;

    // Init stats
    const init = {};
    ACTIONS.forEach(a => {
      init[a.id] = { count: 0, errors: 0, rateLimited: 0, times: [], totalMs: 0 };
    });
    statsRef.current = init;
    logRef.current = [];
    setLog([]);
    setResults(null);
    setElapsed(0);
    setProgress(0);
    setStatus('running');
    runningRef.current = true;

    const actions = ACTIONS.filter(a => selectedActions.has(a.id));
    const intervalMs = 1000 / rps;
    const endTime = Date.now() + duration * 1000;
    let actionIdx = 0;
    const startTime = Date.now();

    addLog(`Starting load test - ${rps} req/s for ${duration}s across ${actions.length} action(s)`, 'info');

    // Poll /health every 2s during test to show queue depth live
    const healthPollRef = setInterval(async () => {
      try {
        const r = await fetch(`${BASE_URL}/health`);
        const d = await r.json();
        if (d.queue_waiting > 0 || d.queue_active > 30) {
          addLog(`[Queue] active=${d.queue_active}/${d.queue_capacity} waiting=${d.queue_waiting} pool_idle=${d.pool_idle}/${d.pool_total}`, d.queue_waiting > 20 ? 'warn' : 'info');
        }
      } catch {}
    }, 2000);
    // Store ref so we can clear it on stop
    timerRef._healthPoll = healthPollRef;

    // Elapsed timer
    timerRef.current = setInterval(() => {
      const el = Math.min(duration, Math.round((Date.now() - startTime) / 1000));
      setElapsed(el);
      setProgress(Math.round((el / duration) * 100));
    }, 250);

    // Fire requests
    const fire = async () => {
      while (runningRef.current && Date.now() < endTime) {
        const action = actions[actionIdx % actions.length];
        actionIdx++;
        runRequest(action); // fire and forget - don't await, keep rate
        await new Promise(r => setTimeout(r, intervalMs));
      }

      clearInterval(timerRef.current);
      clearInterval(timerRef._healthPoll);
      runningRef.current = false;
      setStatus('done');
      setProgress(100);
      setElapsed(duration);
      buildResults(startTime);
    };

    fire();
  };

  const stopTest = () => {
    runningRef.current = false;
    clearInterval(timerRef.current);
    clearInterval(timerRef._healthPoll);
    setStatus('done');
    buildResults(Date.now() - duration * 1000); // approximate
  };

  const buildResults = (startTime) => {
    const totalSecs = Math.max(1, (Date.now() - startTime) / 1000);
    const actions = ACTIONS.filter(a => statsRef.current[a.id]?.count > 0);
    const allTimes = actions.flatMap(a => statsRef.current[a.id].times);
    const totalReqs = actions.reduce((s, a) => s + statsRef.current[a.id].count, 0);
    const totalErrors = actions.reduce((s, a) => s + statsRef.current[a.id].errors, 0);
    const totalRateLimited = actions.reduce((s, a) => s + (statsRef.current[a.id].rateLimited || 0), 0);
    const errorRate = totalReqs > 0 ? ((totalErrors / totalReqs) * 100).toFixed(1) : 0;
    const actualRps = (totalReqs / totalSecs).toFixed(1);
    const avgMs = allTimes.length ? Math.round(allTimes.reduce((s, v) => s + v, 0) / allTimes.length) : 0;
    const p95 = percentile(allTimes, 95);
    const p99 = percentile(allTimes, 99);
    const maxMs = allTimes.length ? Math.max(...allTimes) : 0;

    // Efficiency insights
    const insights = [];
    const slowActions = actions.filter(a => {
      const times = statsRef.current[a.id].times;
      return times.length && (times.reduce((s,v)=>s+v,0)/times.length) > 1500;
    });
    const errorActions = actions.filter(a => statsRef.current[a.id].errors > 0);

    if (errorRate > 5) insights.push({ type: 'error', msg: `${errorRate}% error rate (excluding 401s) - backend is returning errors at ${rps} req/s. Check Railway logs for 5xx or unexpected 4xx responses.` });
    if (errorRate === '0.0' || errorRate === 0) insights.push({ type: 'ok', msg: `Zero errors at ${rps} req/s - backend handled this load cleanly.` });
    if (totalRateLimited > 0) {
      const rlPct = ((totalRateLimited / totalReqs) * 100).toFixed(0);
      insights.push({ type: 'warn', msg: `${totalRateLimited} requests (${rlPct}%) hit the rate limiter (429). Global limit is 120 req/min per IP - at ${rps} req/s a single IP hits the ceiling in ~${Math.floor(120/rps)}s. Normal users never approach this.` });
    }
    if (p95 > 2000) insights.push({ type: 'warn', msg: `P95 latency is ${p95}ms - 95% of requests took over 2s. Railway may be cold-starting or DB queries are slow.` });
    if (p95 < 500 && Number(errorRate) < 2) insights.push({ type: 'ok', msg: `P95 under 500ms - excellent response times. Backend is warm and healthy.` });
    slowActions.forEach(a => {
      const avg = Math.round(statsRef.current[a.id].times.reduce((s,v)=>s+v,0)/statsRef.current[a.id].times.length);
      insights.push({ type: 'warn', msg: `"${a.label}" averaged ${avg}ms - consider adding a cache layer or optimising the DB query.` });
    });
    errorActions.forEach(a => {
      const s = statsRef.current[a.id];
      insights.push({ type: 'error', msg: `"${a.label}" had ${s.errors}/${s.count} errors (${((s.errors/s.count)*100).toFixed(0)}%) - check this endpoint specifically.` });
    });

    // Capacity estimate: extrapolate at what RPS errors would start (rough)
    const capacityEst = Number(errorRate) < 2
      ? `Estimated safe capacity: >${rps * 3} req/s (no errors at ${rps} req/s - headroom appears good)`
      : `Estimated safe capacity: ~${Math.round(rps * (1 - Number(errorRate)/100))} req/s (errors detected at current rate)`;

    insights.push({ type: 'info', msg: capacityEst });

    // Note if any actions got 401s (expected behaviour, not errors)
    const authOnlyActions = actions.filter(a => {
      const s = statsRef.current[a.id];
      return s.count > 0 && s.errors === 0 && a.auth;
    });
    if (authOnlyActions.length > 0) {
      insights.push({ type: 'info', msg: `Note: auth-required endpoints (${authOnlyActions.map(a=>a.label).join(', ')}) returned 401 - this is correct behaviour. To test these properly, a user JWT token would be needed.` });
    }

    setResults({
      totalReqs, totalErrors, totalRateLimited, errorRate, actualRps,
      avgMs, p95, p99, maxMs,
      perAction: actions.map(a => ({
        ...a,
        ...statsRef.current[a.id],
        avgMs: statsRef.current[a.id].times.length
          ? Math.round(statsRef.current[a.id].totalMs / statsRef.current[a.id].times.length)
          : 0,
        p95: percentile(statsRef.current[a.id].times, 95),
      })),
      insights,
    });
  };

  const reset = () => {
    setStatus('idle');
    setResults(null);
    setLog([]);
    setElapsed(0);
    setProgress(0);
  };

  const c = {
    purple: 'var(--purple)',
    purpleLight: 'var(--purple-text)',
    gold: 'var(--gold)',
    green: 'var(--green)',
    red: 'var(--red)',
    amber: 'var(--gold)',
    text: 'var(--text)',
    muted: 'var(--muted)',
    dim: 'var(--dim)',
  };

  const logColor = (type) => ({
    ok: c.green, error: c.red, warn: c.amber, info: c.muted,
  })[type] || c.muted;

  const insightIcon = (type) => ({ ok: '✓', error: '✗', warn: '▲', info: '→' })[type] || '→';
  const insightColor = (type) => ({ ok: c.green, error: c.red, warn: c.amber, info: c.purpleLight })[type] || c.muted;
  // The tinted insight boxes need rgba, and CSS variables cannot take an alpha suffix.
  const insightBg = (type) => ({ ok: 'rgba(52,211,153,0.06)', error: 'rgba(248,113,113,0.06)', warn: 'rgba(245,158,11,0.06)', info: 'rgba(124,58,237,0.06)' })[type] || 'rgba(255,255,255,0.03)';
  const insightBorder = (type) => ({ ok: 'rgba(52,211,153,0.2)', error: 'rgba(248,113,113,0.2)', warn: 'rgba(245,158,11,0.2)', info: 'rgba(124,58,237,0.2)' })[type] || 'var(--border)';

  // Summary tiles: the tone names Kpi understands.
  const tone = (ok) => (ok ? 'green' : 'red');

  return (
    <div style={{ width: '100%' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>

        {/* Action selector */}
        <div className="card">
          <p className="label" style={{ marginBottom: 12 }}>Select actions to simulate</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ACTIONS.map(a => {
              const sel = selectedActions.has(a.id);
              return (
                <div key={a.id} onClick={() => toggleAction(a.id)} role="checkbox" aria-checked={sel} tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAction(a.id); } }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: `1px solid ${sel ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`, background: sel ? 'var(--purple-soft)' : 'transparent', cursor: 'pointer', transition: 'all 0.12s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? c.purple : c.dim}`, background: sel ? c.purple : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sel && <span style={{ fontSize: 10, color: '#fff', fontWeight: 900 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: sel ? c.text : c.muted, margin: 0 }}>{a.label}</p>
                      <span className={`pill ${a.testable ? 'pill-green' : 'pill-grey'}`} style={{ fontSize: 9, padding: '1px 6px' }}>
                        {a.testable ? 'TESTABLE' : '401 only'}
                      </span>
                    </div>
                    <p style={{ fontSize: 10.5, color: c.muted }}>{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Config + controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <p className="label" style={{ marginBottom: 12 }}>Request rate</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FREQ_OPTIONS.map(f => (
                <button key={f.rps} type="button" className={`btn btn-sm${rps === f.rps ? ' btn-active' : ''}`} onClick={() => setRps(f.rps)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <p className="label" style={{ marginBottom: 12 }}>Duration</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DURATION_OPTIONS.map(d => (
                <button key={d.secs} type="button" className={`btn btn-sm${duration === d.secs ? ' btn-active' : ''}`} onClick={() => setDuration(d.secs)}
                  style={duration === d.secs ? { color: c.gold, borderColor: c.gold, background: 'rgba(245,158,11,0.12)' } : undefined}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start / Stop */}
          <div className="card">
            {status === 'idle' && (
              <button type="button" className="btn btn-primary" onClick={startTest} disabled={selectedActions.size === 0} style={{ width: '100%', minHeight: 44 }}>
                Start Load Test
              </button>
            )}
            {status === 'running' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: c.green, fontWeight: 700 }}>● Running - {elapsed}s / {duration}s</span>
                  <span style={{ fontSize: 12, color: c.muted }}>{progress}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${c.purple}, ${c.purpleLight})`, borderRadius: 99, transition: 'width 0.25s' }} />
                </div>
                <button type="button" className="btn btn-danger" onClick={stopTest} style={{ width: '100%' }}>
                  ■ Stop Test
                </button>
              </div>
            )}
            {status === 'done' && (
              <button type="button" className="btn" onClick={reset} style={{ width: '100%', minHeight: 44 }}>
                ↺ Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live log */}
      {(status === 'running' || (status === 'done' && log.length > 0)) && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="label" style={{ marginBottom: 10 }}>
            Live log {status === 'running' && <span style={{ color: c.green }}>● live</span>}
          </p>
          <div className="mono" style={{ height: 180, overflowY: 'auto', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {log.slice(0, 80).map((entry, i) => (
              <div key={i} style={{ color: logColor(entry.type), lineHeight: 1.6, opacity: i > 40 ? 0.5 : 1 }}>
                {entry.msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <>
          {/* Summary stats */}
          <div className="kpi-grid" style={{ marginBottom: 16 }}>
            <Kpi label="Total requests" value={results.totalReqs} tone="purple" />
            <Kpi label="Errors" value={results.totalErrors} tone={tone(results.totalErrors === 0)} />
            <Kpi label="Rate limited" value={results.totalRateLimited || 0} tone={results.totalRateLimited > 0 ? 'gold' : 'green'} />
            <Kpi label="Error rate" value={results.errorRate + '%'} tone={tone(Number(results.errorRate) <= 5)} />
            <Kpi label="Actual RPS" value={results.actualRps} tone="gold" />
            <Kpi label="Avg latency" value={results.avgMs + 'ms'} tone={results.avgMs > 1000 ? 'gold' : 'green'} />
            <Kpi label="P95 latency" value={results.p95 + 'ms'} tone={results.p95 > 2000 ? 'red' : results.p95 > 1000 ? 'gold' : 'green'} />
            <Kpi label="P99 latency" value={results.p99 + 'ms'} tone={results.p99 > 3000 ? 'red' : 'gold'} />
            <Kpi label="Max latency" value={results.maxMs + 'ms'} tone="grey" />
          </div>

          {/* Per-action breakdown */}
          <div className="card" style={{ marginBottom: 16 }}>
            <p className="label" style={{ marginBottom: 12 }}>Per-action breakdown</p>
            <div className="scroll-x">
              <table className="tbl" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    {['Action', 'Requests', 'Errors', 'Rate Ltd', 'Avg ms', 'P95 ms', 'Status'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.perAction.map(a => {
                    const errPct = a.count > 0 ? ((a.errors / a.count) * 100).toFixed(0) : 0;
                    const ok = a.errors === 0 && a.avgMs < 1500;
                    return (
                      <tr key={a.id}>
                        <td style={{ color: c.text, fontWeight: 600 }}>{a.label}</td>
                        <td className="num" style={{ color: c.muted }}>{a.count}</td>
                        <td className="num" style={{ color: a.errors > 0 ? c.red : c.green }}>{a.errors} {a.errors > 0 ? `(${errPct}%)` : ''}</td>
                        <td className="num" style={{ color: (a.rateLimited||0) > 0 ? c.amber : c.muted }}>{a.rateLimited||0}</td>
                        <td className="num" style={{ color: a.avgMs > 1500 ? c.amber : c.text }}>{a.avgMs}ms</td>
                        <td className="num" style={{ color: a.p95 > 2000 ? c.red : c.text }}>{a.p95}ms</td>
                        <td>
                          <span className={`pill ${ok ? 'pill-green' : 'pill-red'}`}>
                            {ok ? '● Healthy' : 'Check'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights */}
          <div className="card" style={{ marginBottom: 16 }}>
            <p className="label" style={{ marginBottom: 12 }}>What we learned</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.insights.map((ins, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, background: insightBg(ins.type), border: `1px solid ${insightBorder(ins.type)}` }}>
                  <span style={{ fontSize: 14, color: insightColor(ins.type), fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{insightIcon(ins.type)}</span>
                  <p style={{ fontSize: 13, color: c.text, lineHeight: 1.6 }}>{ins.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
