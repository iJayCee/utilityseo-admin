// Every admin section renders, on every test run.
//
// The admin app had no tests at all, and it is where the two worst bugs of
// the week lived: a click handler defined in the wrong component, which
// builds clean and throws the moment the button renders, and a panel reading
// a link key that no service provides, so the link silently never appeared.
// Both are invisible to a build and obvious to a render.
//
// This renders each section to static markup with the props App.jsx hands
// it, in the state it is in immediately after mount, which is where those
// crashes live. Effects never run, so this proves the first paint and not
// what happens once data arrives.
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync, readFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
register(pathToFileURL(join(here, 'screens/hooks.mjs')));

// ── Just enough browser ───────────────────────────────────────────────────
globalThis.__VITE_ENV__ = { VITE_API_URL: 'http://harness/api', MODE: 'test' };
const storage = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), clear: () => m.clear() }; };
globalThis.localStorage = storage();
globalThis.sessionStorage = storage();
globalThis.window = globalThis;
globalThis.location = { href: 'http://harness/', pathname: '/', search: '', hash: '', origin: 'http://harness' };
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node', clipboard: {} }, configurable: true });
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.innerWidth = 1440;
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
globalThis.document = {
  body: { classList: { add() {}, remove() {}, contains: () => false } , style: {} },
  documentElement: { style: {}, classList: { add() {}, remove() {}, contains: () => false } },
  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {}, click() {} }),
  getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
  addEventListener() {}, removeEventListener() {}, head: { appendChild() {} },
};
globalThis.fetch = async () => new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });

const noop = () => {};
const adminFetch = async () => new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
const API_URL = 'http://harness/api';
const selfContained = { adminFetch, API_URL };

// The props App.jsx passes, in the state they are in right after mount:
// nothing loaded, no error, handlers that do nothing. A section that cannot
// render that state is broken for the first second of every visit.
const PROPS = {
  // annForm carries a type from the moment App creates it, and the section
  // indexes its TYPES table by it. A fixture without one is not a state the
  // app can be in.
  AnnounceSection:        { annBusy: false, annData: null, annError: null, annForm: { type: 'update', title: '', body: '' }, annLoading: false, deleteAnnouncement: noop, loadAnnouncements: noop, sendAnnouncement: noop, setAnnForm: noop, toggleAnnouncement: noop, users: [] },
  AuditSection:           selfContained,
  BackupsSection:         { bkBusy: false, bkData: null, bkError: null, bkLoading: false, bkMsg: '', loadBackups: noop, restoreBackup: noop, restoreConfirm: null, runBackupNow: noop, setRestoreConfirm: noop },
  BalancesPanel:          selfContained,
  CapacitySection:        { capData: null, capError: null, capLoading: false, loadCapacity: noop },
  CollectionToggleSection: selfContained,
  CostsSection:           { costData: null, costError: null, costInputs: {}, costLoading: false, loadCostForecast: noop, search: '', setCostInputs: noop, users: [] },
  DemoAccessSection:      selfContained,
  ExternalDataSection:    selfContained,
  MarketingSection:       selfContained,
  MonitoringSection:      { loadMonitoring: noop, monData: null, monError: null, monLoading: false, stats: {} },
  PrivacySection:         selfContained,
  ProspectsSection:       selfContained,
  UpgradesSection:        { loadUpgrades: noop, upgData: null, upgError: null, upgLoading: false, users: [] },
};

// These take a large bag of App state and are covered by the drift test
// below rather than rendered, because inventing forty props would test the
// fixture rather than the section.
const NOT_RENDERED = new Set(['PromosSection', 'ProspectFlowSection']);

let React, renderToStaticMarkup;
before(async () => {
  React = (await import('react')).default;
  ({ renderToStaticMarkup } = await import('react-dom/server'));
});

describe('every admin section renders its first paint', () => {
  for (const [name, props] of Object.entries(PROPS)) {
    test(name, async () => {
      const mod = await import(`../src/sections/${name}.jsx`);
      const Section = mod.default;
      assert.equal(typeof Section, 'function', `${name} has no default export`);
      const errors = [];
      const origError = console.error;
      console.error = (...a) => errors.push(a.map(String).join(' '));
      let html;
      try {
        html = renderToStaticMarkup(React.createElement(Section, props));
      } finally {
        console.error = origError;
      }
      // Not just "it rendered something". Two sections used to return a bare
      // "Loading…" before their own heading, so this test passed while
      // proving nothing about them: a deliberately broken render still went
      // green. A section has to get as far as its own title.
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      assert.ok(html.length > 400, `${name} rendered only ${html.length} characters: ${text.slice(0, 60)}`);
      assert.ok(!/^Loading/i.test(text), `${name} renders nothing but a loading placeholder, so this test cannot see its markup`);
      const nesting = errors.filter(e => /cannot be a child of|validateDOMNesting|whitespace text nodes/.test(e));
      assert.deepEqual(nesting, [], `${name} renders invalid HTML`);
    });
  }
});

describe('the list stays in step with the folder', () => {
  test('every section file is either rendered here or deliberately excluded', () => {
    const files = readdirSync(join(here, '../src/sections')).filter(f => f.endsWith('.jsx')).map(f => f.replace('.jsx', ''));
    const missing = files.filter(f => !PROPS[f] && !NOT_RENDERED.has(f));
    assert.deepEqual(missing, [], 'a new admin section has no render test');
  });

  test('every section the app mounts exists', () => {
    const app = readFileSync(join(here, '../src/App.jsx'), 'utf8');
    for (const m of app.matchAll(/from "\.\/sections\/(\w+)"/g)) {
      assert.ok(PROPS[m[1]] || NOT_RENDERED.has(m[1]), `App.jsx mounts ${m[1]} and this test does not know about it`);
    }
  });
});
