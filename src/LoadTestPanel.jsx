import { useState, useRef, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'https://utilityseo-production.up.railway.app/api';

// All testable actions — each hits a real backend endpoint
// Base URL — use env var so works in any environment
const BASE_URL = 'https://utilityseo-production.up.railway.app';
const ADMIN_API = import.meta.env.VITE_API_URL || 'https://utilityseo-production.up.railway.app/api';

const ACTIONS = [
  { id: 'health',        label: 'Health check',              endpoint: '/health',                       base: BASE_URL,  method: 'GET',  desc: 'GET /health — server liveness, no auth, no rate limit' },
  { id: 'can_scan',      label: 'Usage: can scan?',          endpoint: '/usage/can-scan',               base: ADMIN_API, method: 'GET',  desc: 'GET /usage/can-scan — credit check', auth: true },
  { id: 'scans_list',    label: 'Scans: list',               endpoint: '/scans/list?limit=10',          base: ADMIN_API, method: 'GET',  desc: 'GET /scans/list — fetch scan history', auth: true },
  { id: 'todos',         label: 'Todos: fetch all',          endpoint: '/todos',                        base: ADMIN_API, method: 'GET',  desc: 'GET /todos — progress todos', auth: true },
  { id: 'workspaces',    label: 'Workspaces: list',          endpoint: '/workspaces/mine',              base: ADMIN_API, method: 'GET',  desc: 'GET /workspaces/mine — user workspaces', auth: true },
  { id: 'competitors',   label: 'Competitors: fetch',        endpoint: '/competitors',                  base: ADMIN_API, method: 'GET',  desc: 'GET /competitors — competitor list', auth: true },
  { id: 'monitoring',    label: 'Monitoring: settings',      endpoint: '/monitoring/settings',          base: ADMIN_API, method: 'GET',  desc: 'GET /monitoring/settings — alert config', auth: true },
  { id: 'analytics',     label: 'GSC: analytics status',     endpoint: '/gsc/analytics/status',        base: ADMIN_API, method: 'GET',  desc: 'GET /gsc/analytics/status — GA4 connection', auth: true },
  { id: 'stripe_status', label: 'Stripe: sub status',        endpoint: '/stripe/subscription-status',  base: ADMIN_API, method: 'GET',  desc: 'GET /stripe/subscription-status — billing', auth: true },
  { id: 'auth_login',    label: 'Auth: login (rate limiter)', endpoint: '/auth/login',                  base: ADMIN_API, method: 'POST', desc: 'POST /auth/login — specifically tests the auth rate limiter (20 req/15min)', body: { email: 'loadtest@example.com', password: 'loadtest_invalid' } },
  { id: 'gsc_keywords',  label: 'GSC: keywords (external)',  endpoint: '/gsc/keywords?days=28',        base: ADMIN_API, method: 'GET',  desc: 'GET /gsc/keywords — hits Google API, expect higher latency', auth: true },
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
  // Read creds from sessionStorage — same place admin app stores them on login
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
          // 401 = auth required — endpoint healthy, just needs a token
          addLog(`${action.label} → 401 Auth required (${ms}ms)`, 'ok');
        } else if (res.status === 429) {
          // 429 = rate limited — this is the ceiling, track separately
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
      statsRef.current[action.id].errors++;
      statsRef.current[action.id].count++;
      statsRef.current[action.id].times.push(ms);
      addLog(`${action.label} → FAIL: ${err.message}`, 'error');
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

    addLog(`Starting load test — ${rps} req/s for ${duration}s across ${actions.length} action(s)`, 'info');

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
        runRequest(action); // fire and forget — don't await, keep rate
        await new Promise(r => setTimeout(r, intervalMs));
      }

      clearInterval(timerRef.current);
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

    if (errorRate > 5) insights.push({ type: 'error', msg: `${errorRate}% error rate (excluding 401s) — backend is returning errors at ${rps} req/s. Check Railway logs for 5xx or unexpected 4xx responses.` });
    if (errorRate === '0.0' || errorRate === 0) insights.push({ type: 'ok', msg: `Zero errors at ${rps} req/s — backend handled this load cleanly.` });
    if (totalRateLimited > 0) {
      const rlPct = ((totalRateLimited / totalReqs) * 100).toFixed(0);
      insights.push({ type: 'warn', msg: `${totalRateLimited} requests (${rlPct}%) were rate limited (429). Your global limiter allows 200 req/15min per IP — at ${rps} req/s you exceed this in ~${Math.floor(200/rps)}s. This is your hard ceiling for single-IP traffic.` });
    }
    if (p95 > 2000) insights.push({ type: 'warn', msg: `P95 latency is ${p95}ms — 95% of requests took over 2s. Railway may be cold-starting or DB queries are slow.` });
    if (p95 < 500 && Number(errorRate) < 2) insights.push({ type: 'ok', msg: `P95 under 500ms — excellent response times. Backend is warm and healthy.` });
    slowActions.forEach(a => {
      const avg = Math.round(statsRef.current[a.id].times.reduce((s,v)=>s+v,0)/statsRef.current[a.id].times.length);
      insights.push({ type: 'warn', msg: `"${a.label}" averaged ${avg}ms — consider adding a cache layer or optimising the DB query.` });
    });
    errorActions.forEach(a => {
      const s = statsRef.current[a.id];
      insights.push({ type: 'error', msg: `"${a.label}" had ${s.errors}/${s.count} errors (${((s.errors/s.count)*100).toFixed(0)}%) — check this endpoint specifically.` });
    });

    // Capacity estimate: extrapolate at what RPS errors would start (rough)
    const capacityEst = Number(errorRate) < 2
      ? `Estimated safe capacity: >${rps * 3} req/s (no errors at ${rps} req/s — headroom appears good)`
      : `Estimated safe capacity: ~${Math.round(rps * (1 - Number(errorRate)/100))} req/s (errors detected at current rate)`;

    insights.push({ type: 'info', msg: capacityEst });

    // Note if any actions got 401s (expected behaviour, not errors)
    const authOnlyActions = actions.filter(a => {
      const s = statsRef.current[a.id];
      return s.count > 0 && s.errors === 0 && a.auth;
    });
    if (authOnlyActions.length > 0) {
      insights.push({ type: 'info', msg: `Note: auth-required endpoints (${authOnlyActions.map(a=>a.label).join(', ')}) returned 401 — this is correct behaviour. To test these properly, a user JWT token would be needed.` });
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
    bg: '#0D0D14',
    card: '#13131F',
    border: 'rgba(255,255,255,0.07)',
    purple: '#7C3AED',
    purpleLight: '#a78bfa',
    gold: '#F59E0B',
    green: '#22c55e',
    red: '#f87171',
    amber: '#fbbf24',
    text: '#e2e8f0',
    muted: '#64748b',
    dim: '#334155',
  };

  const cardStyle = {
    background: c.card,
    border: `1px solid ${c.border}`,
    borderRadius: 14,
    padding: '18px 20px',
    marginBottom: 16,
  };

  const logColor = (type) => ({
    ok: c.green, error: c.red, warn: c.amber, info: c.muted,
  })[type] || c.muted;

  const insightIcon = (type) => ({ ok: '✓', error: '✗', warn: '⚠', info: '→' })[type] || '→';
  const insightColor = (type) => ({ ok: c.green, error: c.red, warn: c.amber, info: c.purpleLight })[type] || c.muted;

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: 'Sora, sans-serif', padding: '28px 24px', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
          ⚡ Load Test
        </h1>
        <p style={{ fontSize: 13, color: c.muted }}>Simulate traffic against the production backend. Measures latency, error rates and capacity headroom.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Action selector */}
        <div style={cardStyle}>
          <p style={{ fontSize: 12, fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Select actions to simulate</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ACTIONS.map(a => {
              const sel = selectedActions.has(a.id);
              return (
                <div key={a.id} onClick={() => toggleAction(a.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: `1px solid ${sel ? c.purple + '60' : c.border}`, background: sel ? 'rgba(124,58,237,0.08)' : 'transparent', cursor: 'pointer', transition: 'all 0.12s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? c.purple : c.dim}`, background: sel ? c.purple : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sel && <span style={{ fontSize: 10, color: '#fff', fontWeight: 900 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: sel ? c.text : c.muted }}>{a.label}</p>
                    <p style={{ fontSize: 10, color: c.dim }}>{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Config + controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={cardStyle}>
            <p style={{ fontSize: 12, fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Request rate</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FREQ_OPTIONS.map(f => (
                <button key={f.rps} onClick={() => setRps(f.rps)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${rps === f.rps ? c.purple : c.border}`, background: rps === f.rps ? 'rgba(124,58,237,0.15)' : 'transparent', color: rps === f.rps ? c.purpleLight : c.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora,sans-serif' }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize: 12, fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Duration</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DURATION_OPTIONS.map(d => (
                <button key={d.secs} onClick={() => setDuration(d.secs)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${duration === d.secs ? c.gold : c.border}`, background: duration === d.secs ? 'rgba(245,158,11,0.12)' : 'transparent', color: duration === d.secs ? c.gold : c.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora,sans-serif' }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start / Stop */}
          <div style={{ ...cardStyle, marginBottom: 0 }}>
            {status === 'idle' && (
              <button onClick={startTest} disabled={selectedActions.size === 0}
                style={{ width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', background: selectedActions.size === 0 ? 'rgba(124,58,237,0.3)' : c.purple, color: '#fff', fontSize: 14, fontWeight: 800, cursor: selectedActions.size === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Sora,sans-serif', letterSpacing: '-0.01em' }}>
                ⚡ Start Load Test
              </button>
            )}
            {status === 'running' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: c.green, fontWeight: 700 }}>● Running — {elapsed}s / {duration}s</span>
                  <span style={{ fontSize: 12, color: c.muted }}>{progress}%</span>
                </div>
                <div style={{ height: 6, background: c.border, borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${c.purple}, ${c.purpleLight})`, borderRadius: 99, transition: 'width 0.25s' }} />
                </div>
                <button onClick={stopTest}
                  style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: `1px solid rgba(248,113,113,0.4)`, background: 'rgba(248,113,113,0.1)', color: c.red, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora,sans-serif' }}>
                  ■ Stop Test
                </button>
              </div>
            )}
            {status === 'done' && (
              <button onClick={reset}
                style={{ width: '100%', padding: '13px 0', borderRadius: 10, border: `1px solid ${c.border}`, background: 'transparent', color: c.muted, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora,sans-serif' }}>
                ↺ Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live log */}
      {(status === 'running' || (status === 'done' && log.length > 0)) && (
        <div style={cardStyle}>
          <p style={{ fontSize: 12, fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Live log {status === 'running' && <span style={{ color: c.green }}>● live</span>}
          </p>
          <div style={{ height: 180, overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Total requests', value: results.totalReqs, color: c.purpleLight },
              { label: 'Errors', value: results.totalErrors, color: results.totalErrors > 0 ? c.red : c.green },
              { label: 'Rate limited', value: results.totalRateLimited || 0, color: results.totalRateLimited > 0 ? c.amber : c.green },
              { label: 'Error rate', value: results.errorRate + '%', color: Number(results.errorRate) > 5 ? c.red : c.green },
              { label: 'Actual RPS', value: results.actualRps, color: c.gold },
              { label: 'Avg latency', value: results.avgMs + 'ms', color: results.avgMs > 1000 ? c.amber : c.green },
              { label: 'P95 latency', value: results.p95 + 'ms', color: results.p95 > 2000 ? c.red : results.p95 > 1000 ? c.amber : c.green },
              { label: 'P99 latency', value: results.p99 + 'ms', color: results.p99 > 3000 ? c.red : c.amber },
              { label: 'Max latency', value: results.maxMs + 'ms', color: c.muted },
            ].map(s => (
              <div key={s.label} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 10, color: c.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Per-action breakdown */}
          <div style={cardStyle}>
            <p style={{ fontSize: 12, fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Per-action breakdown</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                    {['Action', 'Requests', 'Errors', 'Rate Ltd', 'Avg ms', 'P95 ms', 'Status'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: c.dim, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.perAction.map(a => {
                    const errPct = a.count > 0 ? ((a.errors / a.count) * 100).toFixed(0) : 0;
                    const ok = a.errors === 0 && a.avgMs < 1500;
                    return (
                      <tr key={a.id} style={{ borderBottom: `1px solid ${c.border}` }}>
                        <td style={{ padding: '8px 10px', color: c.text, fontWeight: 600 }}>{a.label}</td>
                        <td style={{ padding: '8px 10px', color: c.muted }}>{a.count}</td>
                        <td style={{ padding: '8px 10px', color: a.errors > 0 ? c.red : c.green }}>{a.errors} {a.errors > 0 ? `(${errPct}%)` : ''}</td>
                        <td style={{ padding: '8px 10px', color: (a.rateLimited||0) > 0 ? c.amber : c.muted }}>{a.rateLimited||0}</td>
                        <td style={{ padding: '8px 10px', color: a.avgMs > 1500 ? c.amber : c.text }}>{a.avgMs}ms</td>
                        <td style={{ padding: '8px 10px', color: a.p95 > 2000 ? c.red : c.text }}>{a.p95}ms</td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: ok ? 'rgba(34,197,94,0.12)' : 'rgba(248,113,113,0.12)', color: ok ? c.green : c.red }}>
                            {ok ? '● Healthy' : '⚠ Check'}
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
          <div style={cardStyle}>
            <p style={{ fontSize: 12, fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>What we learned</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.insights.map((ins, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, background: `${insightColor(ins.type)}0f`, border: `1px solid ${insightColor(ins.type)}30` }}>
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
