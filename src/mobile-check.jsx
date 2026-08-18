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
  within_commission_window: i % 2 === 0,
  // Field names matter: the section reads u.total_paid.toFixed(2) and
  // u.commission_amount. Calling them revenue/commission threw and rendered
  // nothing, which measured as a clean pass while testing zero.
  total_paid: 490 + i * 10,
  commission_amount: 73.5,
}));

const pfData = { users, codes: [{ code: 'PARTNER2026', count: 4 }] };

const Case = ({ id, children }) => (
  <section data-case={id} style={{ marginBottom: 24, border: '1px dashed #444', padding: 6 }}>
    <h3 style={{ font: '700 12px Sora, sans-serif', margin: '0 0 6px', color: '#94a3b8' }}>{id}</h3>
    {children}
  </section>
);

createRoot(document.getElementById('root')).render(
  <div className="admin-body">
    <Case id="ProspectFlowSection">
      <ProspectFlowSection
        email="admin@utilityseo.com"
        users={users}
        stats={{ signups: 4, paying: 2, eligible: 2, totalRevenue: 1960, commission: 294 }}
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
