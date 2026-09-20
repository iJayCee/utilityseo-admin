// The form is where the bad values came from: it defaulted to 14 days, and
// after a successful create it reset the plan to 'pro', a legacy plan not in
// the current lineup. The public trial is 30 days on Entrepreneur, and signup
// prefers a code's values over the standard ones, so a partner's audience got
// half the trial of someone who ignored the link.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const section = readFileSync(new URL('../src/sections/PromosSection.jsx', import.meta.url), 'utf8');

describe('the promo form', () => {
  test('a blank code carries the standard trial', () => {
    const blank = /const BLANK_PROMO = \{[^}]*\}/.exec(app)[0];
    assert.match(blank, /trial_plan:"entrepreneur"/);
    assert.match(blank, /trial_days:"30"/);
  });

  test('the initial state and the reset cannot drift apart again', () => {
    assert.match(app, /const BLANK_PROMO =/);
    assert.equal((app.match(/const BLANK_PROMO =/g) || []).length, 1);
    assert.ok(!/setPromoForm\(\{ code:"", description:""/.test(app),
      'the reset should reuse BLANK_PROMO rather than writing the fields out again');
  });

  test('the form says what leaving the trial alone means', () => {
    assert.match(section, /standard 30-day trial/i);
  });
});
