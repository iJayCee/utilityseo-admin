// The frame every admin screen sits in: a sidebar of screens grouped by job,
// a top bar with the page name and the one search that matters (find a
// customer), and the content. Plus the small parts screens are built from.
//
// Before this, every screen opened under a full dashboard of stats and an
// eighteen-button strip, so the thing you came for started a screen down.
import { Component, useEffect, useState } from 'react';
import { NAV, navItem } from './nav.js';

// One screen failing must not blank the whole admin. Before this, a section
// that threw on an unexpected payload took the sidebar down with it, and the
// only way out was a reload. The boundary resets when you change screen.
export class ScreenBoundary extends Component {
  // Remembers WHICH screen failed, so a crash on the very render that
  // switched screens is not mistaken for an old failure and cleared.
  state = { failedOn: null };
  static getDerivedStateFromError() { return { failedOn: 'pending' }; }
  componentDidCatch(err) { console.error('[admin] screen failed:', err); this.setState({ failedOn: this.props.screen }); }
  componentDidUpdate(prev) {
    if (prev.screen !== this.props.screen && this.state.failedOn && this.state.failedOn !== 'pending' && this.state.failedOn !== this.props.screen) {
      this.setState({ failedOn: null });
    }
  }
  render() {
    if (!this.state.failedOn) return this.props.children;
    return (
      <div className="card">
        <p className="card-title">This screen hit a problem</p>
        <p className="card-sub">Something in the data it was given did not fit. The other screens still work. The details are in the browser console.</p>
        <button type="button" className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => this.setState({ failedOn: null })}>Try again</button>
      </div>
    );
  }
}

// The brand mark, from the customer app's logo. Replaces a 13 KB embedded
// JPEG that was scaled down to 32px.
export const LogoMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 232 187" fill="#7C3AED" aria-hidden="true">
    <path d="M72.89,19.22c24.75-24.75,65.07-25.93,90.26-1.63,25.73,24.81,26,65.94.85,91.11l-25.39,25.39c-6.24,6.23-16.35,6.22-22.59,0-3.11-3.13-4.67-7.21-4.66-11.3,0-4.08,1.55-8.15,4.66-11.27l24.83-24.81c13.28-13.3,13.12-34.92-1.06-47.26-12.52-10.9-31.6-10.38-43.51,1.52L22.56,114.67v-15.29c-.01-4.01-3.26-7.26-7.27-7.26H0S72.89,19.22,72.89,19.22Z" />
    <path d="M217.64,122.76v-15.31c-.01-4-3.27-7.25-7.28-7.25h-15.32l12.92-12.91c1.59-1.59,3.75-2.48,5.99-2.48h15.43c2.01,0,3.63,1.63,3.63,3.63v15.42c0,2.25-.89,4.4-2.48,5.99l-12.89,12.91Z" />
    <path d="M204.56,116.9v18.94l-32.78,32.77c-25.16,25.18-66.29,24.9-91.11-.84-24.29-25.18-23.12-65.5,1.62-90.24l24.12-24.12c6.39-6.39,17.17-6.7,23.37-.13,2.9,3.08,4.35,7,4.35,10.95s-1.56,8.17-4.68,11.28l-24.75,24.75c-12.14,12.14-13.28,31.9-1.75,44.62,12.33,13.59,33.43,13.99,46.25,1.16l32.77-32.77h18.95c2.01,0,3.63,1.63,3.63,3.63Z" />
  </svg>
);

const Screen = ({ render }) => (typeof render === 'function' ? render() : render);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
  </svg>
);

export default function Shell({ activeTab, onNav, search, onSearch, onSignOut, adminEmail, appUrl, children }) {
  const [open, setOpen] = useState(false);
  const item = navItem(activeTab);
  useEffect(() => { setOpen(false); }, [activeTab]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="shell">
      {open && <div className="drawer-backdrop" onClick={() => setOpen(false)} />}
      <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label="Admin sections">
        <div className="sidebar-brand">
          <LogoMark />
          <strong>UtilitySEO</strong>
          <span className="pill pill-red" style={{ marginLeft: 'auto', fontSize: 10 }}>Admin</span>
        </div>
        <nav>
          {NAV.map(g => (
            <div key={g.name || 'home'} className={g.name ? 'nav-group' : ''}>
              {g.name && <p className="label" style={{ padding: '0 10px 6px' }}>{g.name}</p>}
              {g.items.map(i => (
                <button key={i.id} type="button" className={`nav-item${activeTab === i.id ? ' is-active' : ''}`}
                  aria-current={activeTab === i.id ? 'page' : undefined} onClick={() => onNav(i.id)}>
                  <span className="dot" />{i.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          {adminEmail && <span className="who" title={adminEmail}>{adminEmail}</span>}
          {appUrl && <a className="btn btn-sm" href={appUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>Open the app</a>}
          <button type="button" className="btn btn-sm btn-danger" onClick={onSignOut}>Sign out</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button type="button" className="btn btn-sm hamburger" aria-label="Open sections" aria-expanded={open} onClick={() => setOpen(o => !o)}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <line x1="3.5" y1="6" x2="16.5" y2="6" /><line x1="3.5" y1="10" x2="16.5" y2="10" /><line x1="3.5" y1="14" x2="16.5" y2="14" />
            </svg>
          </button>
          <div style={{ minWidth: 0 }}>
            {item.group && <div className="crumb">{item.group}</div>}
            <h1>{item.label}</h1>
          </div>
          <div className="topbar-search">
            <SearchIcon />
            <input className="field" value={search} onChange={e => onSearch(e.target.value)}
              placeholder="Find a customer by email, name or company" aria-label="Find a customer" />
          </div>
        </header>
        <main className="content">
          {item.blurb && <div className="page-head"><p>{item.blurb}</p></div>}
          {/* The screen is built HERE, inside the boundary. Given as ready
              elements it would be built in App's render, above the boundary,
              and a crash there blanks everything. */}
          <ScreenBoundary screen={activeTab}><Screen render={children} /></ScreenBoundary>
        </main>
      </div>
    </div>
  );
}

// ── Parts ───────────────────────────────────────────────────────────────

const TONE = { purple: 'var(--purple-text)', green: 'var(--green)', gold: 'var(--gold)', red: 'var(--red)', sky: 'var(--sky)', grey: '#94a3b8', text: 'var(--text)' };

export const Kpi = ({ label, value, sub, tone = 'text', onClick, title }) => (
  <div className={`kpi${onClick ? ' is-link' : ''}`} onClick={onClick} title={title || (onClick ? 'Open the detailed view' : undefined)}
    role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }) : undefined}>
    <p className="label">{label}</p>
    <p className="kpi-value" style={{ color: TONE[tone] || TONE.text }}>{value ?? '-'}</p>
    {sub && <p className="kpi-sub">{sub}</p>}
  </div>
);

export const Skeleton = ({ h = 14, w = '100%', style }) => <div className="skeleton" style={{ height: h, width: w, ...style }} aria-hidden="true" />;

export const SkeletonRows = ({ rows = 6 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {Array.from({ length: rows }, (_, i) => <Skeleton key={i} h={38} w={`${100 - (i % 3) * 6}%`} />)}
  </div>
);

export const KpiSkeleton = ({ n = 6 }) => (
  <div className="kpi-grid">
    {Array.from({ length: n }, (_, i) => (
      <div key={i} className="kpi"><Skeleton h={10} w="40%" /><Skeleton h={28} w="55%" style={{ marginTop: 10 }} /><Skeleton h={10} w="70%" style={{ marginTop: 8 }} /></div>
    ))}
  </div>
);

export const EmptyState = ({ title, text, action }) => (
  <div className="empty">
    {title && <p className="empty-title">{title}</p>}
    {text && <p>{text}</p>}
    {action && <div style={{ marginTop: 12 }}>{action}</div>}
  </div>
);
