// "What do we owe this partner this month" has to be answerable from the
// panel, without opening Stripe and without arithmetic on a napkin.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const promos = readFileSync(new URL('../src/sections/PromosSection.jsx', import.meta.url), 'utf8');

describe('the earnings modal', () => {
  test('leads with what is owed, not with gross revenue', () => {
    assert.match(app, /Owed to/);
    assert.match(app, /d\.owed/);
  });
  test('says what the owed figure is made of, so it can be checked', () => {
    // A number somebody is about to be paid has to show its working.
    assert.match(app, /d\.revenue_in_window/);
    assert.match(app, /share_pct/);
    assert.match(app, /share_months/);
  });
  test('a code with no partner shows revenue and no payout', () => {
    assert.match(app, /d\.partner\?\.name/);
  });
  test('a Stripe failure is shown, because a zero would read as "paid nothing"', () => {
    assert.match(app, /stripe_failed/);
  });
  test('mixed currencies are flagged rather than added together', () => {
    assert.match(app, /mixed_currency/);
  });
});

describe('getting to it', () => {
  test('a code in the Promos list opens its earnings', () => {
    assert.match(promos, /loadCodeRevenue/);
    assert.match(app, /loadCodeRevenue=\{loadCodeRevenue\}/);
  });
});
