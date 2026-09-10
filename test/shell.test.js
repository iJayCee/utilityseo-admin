// The shell renders, and every screen in the sidebar is a screen App.jsx has.
//
// Same class of check as screens.test.js: the admin ships build-green,
// runtime-blank crashes, and a shell that throws blanks every screen at once.
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
register(pathToFileURL(join(here, 'screens/hooks.mjs')));

globalThis.window = globalThis;
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};

let React, renderToStaticMarkup, Shell, nav;
before(async () => {
  React = (await import('react')).default;
  ({ renderToStaticMarkup } = await import('react-dom/server'));
  Shell = await import('../src/Shell.jsx');
  nav = await import('../src/nav.js');
});

describe('the shell', () => {
  test('renders the sidebar, the active screen and its content', () => {
    const html = renderToStaticMarkup(React.createElement(Shell.default, {
      activeTab: 'monitoring', onNav: () => {}, search: '', onSearch: () => {}, onSignOut: () => {}, adminEmail: 'a@b.example', appUrl: 'https://app.example',
    }, React.createElement('p', null, 'THE CONTENT')));
    assert.match(html, /THE CONTENT/);
    assert.match(html, /aria-current="page"[^>]*>(?:<span[^>]*><\/span>)?Monitoring/);
    assert.match(html, /<h1>Monitoring<\/h1>/);
    for (const g of nav.NAV) for (const i of g.items) assert.ok(html.includes(`>${i.label}<`) || html.includes(`${i.label}</button>`), `${i.label} missing from the sidebar`);
  });

  test('the parts render with nothing in them', () => {
    for (const P of [Shell.KpiSkeleton, Shell.SkeletonRows]) assert.ok(renderToStaticMarkup(React.createElement(P)).length > 50);
    assert.match(renderToStaticMarkup(React.createElement(Shell.Kpi, { label: 'Users', value: 5, sub: 'x' })), /Users/);
    assert.match(renderToStaticMarkup(React.createElement(Shell.EmptyState, { title: 'Nothing yet' })), /Nothing yet/);
  });
});

describe('the screen list is one list', () => {
  const app = readFileSync(join(here, '../src/App.jsx'), 'utf8');
  const rendered = new Set([...app.matchAll(/activeTab === "(\w+)"/g)].map(m => m[1]));

  test('every sidebar screen is rendered by App.jsx', () => {
    const missing = [...nav.TAB_IDS].filter(id => !rendered.has(id));
    assert.deepEqual(missing, [], 'in the sidebar but nothing renders for it');
  });

  test('every screen App.jsx renders is in the sidebar', () => {
    const orphan = [...rendered].filter(id => !nav.TAB_IDS.has(id));
    assert.deepEqual(orphan, [], 'rendered but unreachable');
  });

  test('the screen the URL asks for loads on start, not just Overview', () => {
    assert.match(app, /if \(activeTab !== 'overview'\) handleTabSwitch\(activeTab\)/);
  });

  test('every screen sits inside the error boundary', () => {
    const shell = readFileSync(join(here, '../src/Shell.jsx'), 'utf8');
    assert.match(shell, /<ScreenBoundary screen=\{activeTab\}><Screen render=\{children\} \/><\/ScreenBoundary>/);
    // App must hand the shell a FUNCTION. Ready elements are built in App's
    // own render, above the boundary, and a crash there blanks everything.
    assert.match(app, /appUrl=\{MAIN_APP_URL\}>\s*\{\(\) => \(<>/);
  });

  test('App.jsx no longer carries its own tab list, stylesheet or embedded logo', () => {
    assert.doesNotMatch(app, /new Set\(\[\s*'overview'/);
    assert.doesNotMatch(app, /LOGO_BASE64|GlobalStyles/);
  });
});
