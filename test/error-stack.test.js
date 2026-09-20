// The error log stores a stack for every row and the Monitoring panel never
// showed it, so an entry like "Cannot set headers after they are sent to the
// client" named no route and could not be traced from the screen it appeared
// on. The column is already in the table; it just was not being selected or
// rendered.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const panel = readFileSync(new URL('../src/sections/MonitoringSection.jsx', import.meta.url), 'utf8');
const admin = readFileSync(new URL('../../backend/src/routes/admin.js', import.meta.url), 'utf8');

describe('a logged error can be traced', () => {
  test('the API hands back the stack it has been storing all along', () => {
    const q = /SELECT id, created_at, level, source, message[^`]*FROM error_log/.exec(admin);
    assert.ok(q, 'the recent-errors query moved');
    assert.match(q[0], /\bstack\b/);
  });

  test('a row opens to show it, rather than a tooltip that cannot be copied', () => {
    assert.match(panel, /openError/);
    assert.match(panel, /<pre/);
  });

  test('a row with no stack says so instead of opening on nothing', () => {
    assert.match(panel, /No stack was recorded for this one/);
  });

  test('the stack is not injected as markup', () => {
    assert.doesNotMatch(panel, /dangerouslySetInnerHTML/);
  });
});
