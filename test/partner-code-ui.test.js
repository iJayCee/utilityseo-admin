// The link is the thing James actually sends a partner, so it should be one
// click rather than assembled by hand each time. And the terms of the deal
// belong on the code: in six months nobody remembers whether a given code was
// a 50% partner arrangement or a one-off launch discount.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const section = readFileSync(new URL('../src/sections/PromosSection.jsx', import.meta.url), 'utf8');

describe('the shareable link', () => {
  test('each code shows its signup URL with a copy button', () => {
    assert.match(section, /^\s*<CopyLink/m);
    assert.match(section, /\/auth\/signup\?code=/);
  });
  test('the URL is built from the app address the panel already knows', () => {
    assert.match(section, /mainAppUrl/);
    assert.match(app, /mainAppUrl=\{MAIN_APP_URL\}/);
  });
  test('copying falls back when the clipboard is refused', () => {
    // An admin panel on http, or a browser that blocks it, should not leave
    // a button that silently does nothing.
    assert.match(section, /catch/);
    assert.match(section, /select\(\)|setCopied\(false\)|Copy failed/i);
  });
});

describe('the partner terms on the form', () => {
  const FIELDS = ['partner_name', 'partner_email', 'partner_share_pct', 'partner_share_months', 'partner_notes'];
  test('every field is on the create form', () => {
    for (const f of FIELDS) assert.match(section, new RegExp('promoForm\.' + f), f);
  });
  test('a blank new code already carries the programme terms', () => {
    const blank = /const BLANK_PROMO = \{[^}]*\}/.exec(app)[0];
    assert.match(blank, /partner_share_pct:"50"/);
    assert.match(blank, /partner_share_months:"6"/);
  });
  test('and the create call sends them', () => {
    for (const f of FIELDS) assert.match(app, new RegExp(f + ':'), f);
  });
  test('a code with a partner on it says so in the list', () => {
    assert.match(section, /partner_name/);
  });
});
