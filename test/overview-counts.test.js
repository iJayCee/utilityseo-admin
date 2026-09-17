// The overview said "12 paying" beside a Marketing tab saying 0 and an
// Upgrades tab saying 1. Three answers to one question, found by clicking
// through the panel. One rule now: paying is an active Stripe subscription.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { usable } from '../src/lib/promo-usable.js';

const here = dirname(fileURLToPath(import.meta.url));
const APP = readFileSync(join(here, '../src/App.jsx'), 'utf8');
const ADMIN = readFileSync(join(here, '../../backend/src/routes/admin.js'), 'utf8');

describe('one meaning of paying', () => {
  test('the overview counts Stripe subscriptions, not plans that are not free', () => {
    const overview = ADMIN.slice(ADMIN.indexOf("router.get('/overview'"));
    assert.match(overview, /FILTER \(WHERE stripe_subscription_id IS NOT NULL AND is_active IS NOT false\)::int paid/);
    // The old count is kept, under a name that says what it is.
    assert.match(overview, /plan <> 'free'\)::int on_paid_plan/);
  });

  test('the plans card says which of the two it is showing', () => {
    assert.match(APP, /\{countPaid\} on a paid plan of \{users\.length\} accounts/);
    assert.match(APP, /paying through Stripe/);
    assert.doesNotMatch(APP, /\{countPaid\} paying of/);
  });
});

describe('the trial-accounts item opens the accounts', () => {
  test('it goes to the users list, filtered to them, not to the buy list', () => {
    const item = APP.slice(APP.indexOf('on a trial or temporary plan`'), APP.indexOf('on a trial or temporary plan`') + 200);
    assert.match(item, /tab: "users"/);
    assert.match(item, /setFilterPlan\("trial"\)/);
    assert.match(item, /setShowFilters\(true\)/);
  });
});

describe('a prospect is only offered a code that still works', () => {
  const live = { is_active: true, expires_at: null, max_uses: null, uses_count: 0 };
  test('a live code is offered', () => assert.equal(usable(live), true));
  test('switched off is not', () => assert.equal(usable({ ...live, is_active: false }), false));
  test('expired is not', () => assert.equal(usable({ ...live, expires_at: '2026-05-01T00:00:00Z' }), false));
  test('not yet expired still is', () => assert.equal(usable({ ...live, expires_at: '2099-01-01T00:00:00Z' }), true));
  test('used up is not', () => assert.equal(usable({ ...live, max_uses: 2, uses_count: 2 }), false));
  test('one use left still is', () => assert.equal(usable({ ...live, max_uses: 2, uses_count: 1 }), true));
  test('unlimited uses is never used up', () => assert.equal(usable({ ...live, max_uses: null, uses_count: 500 }), true));
  test('nothing at all is not a code', () => assert.equal(usable(null), false));
});
