// The lead bin, from the admin screen's side.
//
// Deleting a lead is the one destructive thing on this panel, and it sits one
// cell away from a link that opens somebody's website. So what is checked
// here is mostly about the slip: that it asks first, that it says the delete
// can be undone, and that the way back exists and is only offered when there
// is something to go back for.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(join(here, '../src/sections/MarketingSection.jsx'), 'utf8');

describe('deleting a lead', () => {
  test('it asks first, and says where the lead goes', () => {
    assert.match(SRC, /window\.confirm\(/, 'a one-click delete in a long list needs a confirm');
    // The number of days comes from the server, so the screen cannot promise
    // a week while the job deletes after three days.
    assert.match(SRC, /after \$\{binDays\} days/);
    assert.match(SRC, /You can put it back until then/);
  });

  test('it goes through DELETE, not a hard-delete endpoint of its own', () => {
    assert.match(SRC, /marketing\/leads\/\$\{l\.id\}`, \{ method: "DELETE" \}/);
  });

  test('the list and its counts are reloaded afterwards', () => {
    // Splicing the row out locally would leave the totals above the table
    // counting the lead that was just deleted, which reads as a failed click.
    const fn = SRC.slice(SRC.indexOf('const remove = async'), SRC.indexOf('const restore = async'));
    assert.match(fn, /await load\(\)/);
  });

  test('a failure says so rather than looking like it worked', () => {
    const fn = SRC.slice(SRC.indexOf('const remove = async'), SRC.indexOf('const restore = async'));
    assert.match(fn, /setErr\(/);
    assert.match(SRC, /role="alert"/);
  });
});

describe('the bin itself', () => {
  test('restoring exists and posts to restore', () => {
    assert.match(SRC, /marketing\/leads\/\$\{l\.id\}\/restore`, \{ method: "POST" \}/);
  });

  test('it is only offered when there is something in it', () => {
    // Or the normal view carries a button to an empty room.
    assert.match(SRC, /\(bin \|\| c\.binned > 0\) &&/);
  });

  test('the bin view says when each lead goes, from the server count', () => {
    // Not worked out in the browser: the screen and the nightly job must not
    // be able to disagree about which day a lead disappears.
    assert.match(SRC, /l\.bin_days_left/);
    assert.doesNotMatch(SRC, /deleted_at[\s\S]{0,80}86400000/, 'do not recompute the countdown here');
  });

  test('a deleted lead is not offered to Prospects', () => {
    // It would scan a site for a lead that is on its way out.
    assert.match(SRC, /\{!bin && <button type="button" className="btn btn-sm btn-active" onClick=\{\(\) => addProspect/);
  });

  test('who deleted it is shown', () => {
    assert.match(SRC, /by \{l\.deleted_by\}/);
  });

  test('no em-dashes in any of the new copy', () => {
    const shown = SRC.replace(/\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
    assert.doesNotMatch(shown, /[–—]/);
  });
});

describe('exporting leads', () => {
  test('the button says what it will actually do', () => {
    // "Export" alone is ambiguous next to a filter and a set of ticks, and
    // guessing wrong means a file with the wrong rows in it that nobody
    // checks.
    assert.match(SRC, /Export \$\{picked\.size\} selected/);
    assert.match(SRC, /Export the bin/);
    assert.match(SRC, /Export these \$\{rows\.length\}/);
    assert.match(SRC, /Export all \$\{c\.total/);
  });

  test('ticked rows win over the filters', () => {
    const fn = SRC.slice(SRC.indexOf('const exportCsv'), SRC.indexOf('const downloadCsv'));
    assert.match(fn, /if \(picked\.size\) \{[\s\S]{0,120}qs\.set\("ids"/);
    // The filters only go on when nothing is ticked.
    assert.match(fn, /\} else \{[\s\S]{0,300}consented[\s\S]{0,120}bin/);
  });

  test('it goes through adminFetch, so the password stays in a header', () => {
    // A plain link or window.open would be simpler and cannot carry the
    // admin headers. Moving them to the query string to make a link work
    // would write the password into every log on the way.
    const fn = SRC.slice(SRC.indexOf('const downloadCsv'), SRC.indexOf('const rows ='));
    assert.match(fn, /await adminFetch\(url\)/);
    // Comments stripped first: the comment above this code names the header
    // in order to explain why it must not move, and a test that reads that as
    // code fails on its own explanation.
    const code = SRC.replace(/\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
    assert.doesNotMatch(code, /window\.open\(/);
    assert.doesNotMatch(code, /x-admin-password/);
  });

  test('the object URL is released, but not before the download starts', () => {
    assert.match(SRC, /setTimeout\(\(\) => URL\.revokeObjectURL\(href\), 1000\)/);
  });

  test('a reload clears the ticks, because the rows have changed', () => {
    const fn = SRC.slice(SRC.indexOf('const load = async'), SRC.indexOf('const binDays'));
    assert.match(fn, /setPicked\(new Set\(\)\)/);
  });

  test('tick all covers the rows on screen and can be undone', () => {
    assert.match(SRC, /const allPicked = rows\.length > 0 && rows\.every/);
    assert.match(SRC, /setPicked\(allPicked \? new Set\(\) : new Set\(rows\.map/);
  });

  test('every checkbox is labelled for a screen reader', () => {
    assert.match(SRC, /aria-label="Tick all"/);
    assert.match(SRC, /aria-label=\{`Select \$\{l\.email \|\| l\.url\}`\}/);
  });
});

describe('deleting what is ticked', () => {
  test('the button says how many, and only appears when something is ticked', () => {
    assert.match(SRC, /picked\.size > 0 && \(/);
    assert.match(SRC, /`Delete \$\{picked\.size\}`/);
    assert.match(SRC, /`Restore \$\{picked\.size\}`/);
  });

  test('deleting asks first and says where they go', () => {
    const fn = SRC.slice(SRC.indexOf('const bulk = async'), SRC.indexOf('// The buttons sit') + 1 || undefined);
    assert.match(SRC, /window\.confirm\([\s\S]{0,200}Delete \$\{picked\.size\}/);
    assert.match(SRC, /deleted for good after \$\{binDays\} days/);
    assert.ok(fn.length, 'the bulk function is missing');
  });

  test('restoring does not ask, because it is the undo', () => {
    // Confirming an undo makes it feel as risky as the thing it undoes.
    assert.match(SRC, /if \(action === "delete" && !window\.confirm/);
  });

  test('it is one request, not one per row', () => {
    // Forty single deletes means forty half-finished decisions when the tenth
    // one fails.
    assert.match(SRC, /leads\/bulk`, \{\s*\n?\s*method: "POST"/);
    assert.match(SRC, /ids: \[\.\.\.picked\], action/);
  });

  test('a partial result is reported rather than smoothed over', () => {
    assert.match(SRC, /d\.moved < d\.asked/);
    assert.match(SRC, /already \$\{action === "restore" \? "back on the list" : "in the bin"\}/);
  });

  test('the bin view offers restore and the list view offers delete, never both', () => {
    const block = SRC.slice(SRC.indexOf('{picked.size > 0 && ('), SRC.indexOf('onClick={exportCsv}'));
    assert.match(block, /bin\s*\n?\s*\?/, 'it has to branch on which view is showing');
    assert.ok(block.indexOf('Restore') < block.indexOf('Delete'), 'bin branch first');
  });
});
