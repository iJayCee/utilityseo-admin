// Admin mobile-width harness. DEV ONLY - not a route, not a Vite entry, never
// reaches dist.
//
// The admin app needs a real login, and the browser that can emulate a phone has
// no admin session. ProspectFlowSection is fully prop-driven, so it can be
// mounted with fixtures and measured for real rather than eyeballed.
//
// Same metric as the customer-app harness: does the DOCUMENT scroll sideways,
// and how narrow is the narrowest text cell that is NOT inside a working
// scroller. The second is the failure that looks fine in a screenshot - the row
// is on screen and the email has been ellipsised to nothing.
import { createRoot } from 'react-dom/client';
import ProspectFlowSection from './sections/ProspectFlowSection.jsx';
import MarketingSection from './sections/MarketingSection.jsx';

const LONG_EMAIL = 'firstname.lastname@a-fairly-long-company-domain.co.uk';

const users = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  email: `${i}.${LONG_EMAIL}`,
  first_name: 'Firstname', last_name: 'Lastname',
  company_name: 'A Reasonably Long Company Name Ltd',
  promo_code_used: 'PARTNER2026',
  plan: ['entrepreneur', 'enterprise', 'free', 'entrepreneur'][i],
  joined: '2026-03-14T00:00:00Z',
  first_payment: i % 2 === 0 ? '2026-04-01T00:00:00Z' : null,
  // Field names matter: the section reads u.total_paid.toFixed(2). Calling it
  // "revenue" threw and rendered nothing, which measured as a clean pass while
  // testing zero.
  total_paid: 490 + i * 10,
}));

const pfData = { users, codes: [{ code: 'PARTNER2026', count: 4 }] };

// Marketing fixtures. MarketingSection fetches rather than taking props, so it
// gets a stub adminFetch - the alternative is a hand-copied approximation of
// the markup, which would not reproduce the thing being measured.
//
// The shape here is the SERVER's shape, not a convenient one. Getting a field
// name wrong renders an empty state, and an empty state measures as a clean
// pass while testing nothing - which has happened enough times on this project
// to be worth saying out loud.
const MKT = {
  platforms: [
    { id: 'google_ads', label: 'Google Ads' },
    { id: 'meta', label: 'Meta (Facebook/Instagram)' },
    { id: 'print', label: 'Print / offline' },
  ],
  campaigns: [
    {
      id: 1, name: 'Spring search push with a fairly long campaign name',
      platform: 'google_ads', platformLabel: 'Google Ads', status: 'running',
      utm_campaign: 'spring26', details: 'Exact match on the money terms, £20/day cap.',
      spendPence: 48000, spendRows: 3, firstSpendOn: '2026-03-01', lastSpendOn: '2026-05-01',
      signups: { tracked: 12, claimed: 31, manual: 0 },
      costPerSignup: { tracked: 4000, claimed: 1548, manual: null },
      best: 'tracked', archived: false,
    },
    {
      id: 2, name: 'Trade magazine half page', platform: 'print',
      platformLabel: 'Print / offline', status: 'ended', utm_campaign: null, details: null,
      spendPence: 90000, spendRows: 1, firstSpendOn: '2026-02-01', lastSpendOn: '2026-02-01',
      signups: { tracked: 0, claimed: 0, manual: 3 },
      costPerSignup: { tracked: null, claimed: null, manual: 30000 },
      best: 'manual', archived: false,
    },
  ],
  totals: {
    campaigns: 2, running: 1, spendPence: 138000, trackablePence: 48000,
    signups: { tracked: 12, claimed: 31, manual: 3 },
    costPerTrackedSignup: 4000, untrackablePence: 90000,
  },
  spendByMonth: [
    { month: '2026-02', pence: 90000 }, { month: '2026-03', pence: 20000 },
    { month: '2026-04', pence: 0 }, { month: '2026-05', pence: 28000 },
  ],
  orphanUtms: [{ utm: 'sprng26-typo', signups: 4 }],
  trackingNote: 'Tracked signups only exist for people who arrived with a utm_campaign after UTM capture shipped.',
};
const mktFetch = async (url) => ({
  ok: true,
  text: async () => JSON.stringify(url.includes('/signups') ? { campaign: MKT.campaigns[0], tracked: [], claimed: [] } : MKT),
});

const Case = ({ id, children }) => (
  <section data-case={id} style={{ marginBottom: 24, border: '1px dashed #444', padding: 6 }}>
    <h3 style={{ font: '700 12px Sora, sans-serif', margin: '0 0 6px', color: '#94a3b8' }}>{id}</h3>
    {children}
  </section>
);

createRoot(document.getElementById('root')).render(
  <div className="admin-body">
    <Case id="MarketingSection">
      <MarketingSection adminFetch={mktFetch} API_URL="/api" />
    </Case>
    <Case id="ProspectFlowSection">
      <ProspectFlowSection
        email="admin@utilityseo.com"
        users={users}
        stats={{ signups: 4, paying: 2, totalRevenue: 1960 }}
        pfData={pfData}
        pfError={null}
        pfLoading={false}
        pfSearch=""
        pfStatusFilter="all"
        pfCodeFilter="all"
        setPfSearch={() => {}}
        setPfStatusFilter={() => {}}
        setPfCodeFilter={() => {}}
        setPfData={() => {}}
        loadProspectFlow={() => {}}
        loadCodeRevenue={() => {}}
      />
    </Case>
  </div>
);

const READABLE_MIN = 90;
const TABLE_MIN_COLS = 4;
const colCount = (el) => getComputedStyle(el).gridTemplateColumns.split(/\s+/).filter(Boolean).length;
const scrollsX = (el) => {
  const cs = getComputedStyle(el);
  return /auto|scroll/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1;
};
const insideScroller = (el, root) => {
  for (let p = el.parentElement; p && p !== root.parentElement; p = p.parentElement) {
    if (scrollsX(p)) return true;
  }
  return false;
};

window.measure = () => {
  const vw = document.documentElement.clientWidth;
  const out = {
    viewport: vw,
    // html has overflow-x:hidden, so the document can never report a sideways
    // scroll here. Measure the body's real content width instead, or the check
    // passes for the wrong reason.
    bodyScrollWidth: document.body.scrollWidth,
    pageOverflows: document.body.scrollWidth > vw + 1,
    cases: [],
  };
  for (const sec of document.querySelectorAll('[data-case]')) {
    const grids = [...sec.querySelectorAll('*')].filter(d => getComputedStyle(d).display === 'grid');
    let narrowest = null, scrolled = false;
    for (const g of grids) {
      if (colCount(g) < TABLE_MIN_COLS) continue;
      if (insideScroller(g, sec)) { scrolled = true; continue; }
      for (const cell of g.children) {
        const r = cell.getBoundingClientRect();
        const txt = (cell.textContent || '').trim();
        if (!txt || r.width === 0) continue;
        if (!narrowest || r.width < narrowest.w) narrowest = { w: Math.round(r.width), txt: txt.slice(0, 30) };
      }
    }
    out.cases.push({
      id: sec.dataset.case,
      wideGridsInScroller: scrolled,
      narrowestUnwrappedCell: narrowest,
      unreadable: !!(narrowest && narrowest.w < READABLE_MIN),
    });
  }
  out.pass = !out.pageOverflows && out.cases.every(c => !c.unreadable);
  return out;
};
