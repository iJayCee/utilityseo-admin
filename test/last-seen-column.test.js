// The column said "Last Seen" and showed last_login, which only moves when
// somebody authenticates. A customer using the app daily on a week-old token
// looked like a customer who had gone quiet.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');

describe('last seen', () => {
  test('the list reads the activity column, not the login one', () => {
    assert.match(app, /lastSeen: user\.last_seen_at \|\| null/);
  });

  test('and falls back to the last login for anyone not seen since this shipped', () => {
    // Nobody has a last_seen_at until they come back. Their last login is
    // still the best thing we know, and a dash would lose it.
    assert.match(app, /const seenAt = \(u\) => u\.lastSeen \|\| u\.lastLogin \|\| null;/);
  });

  test('sorting the column sorts by what the column shows', () => {
    assert.match(app, /sortCol === "lastSeen"/);
    assert.doesNotMatch(app, /sortCol === "lastLogin"/);
  });

  test('last login is still available, under the user', () => {
    // Two different facts, both worth having: when they last proved who they
    // were, and when they were last here.
    assert.match(app, /"Last Login"/);
    assert.match(app, /"Last Seen"/);
  });

  test('the export carries both, named for what they are', () => {
    assert.match(app, /"Last Seen","Last Login"/);
  });
});
