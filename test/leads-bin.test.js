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

  test('the bin is a tab, always there, carrying its own count', () => {
    // It used to be a button that appeared only when the bin had something in
    // it, so the normal view was not carrying a button to an empty room. It is
    // a tray now, alongside New and Folders, and a tray you cannot see is
    // worse than an empty one: the count on the tab is what says it is empty,
    // without having to go and look.
    assert.match(SRC, /id:"bin", label:"Bin", count:c\.binned \|\| 0/);
    assert.match(SRC, /\{t\.label\}\{data \? ` \(\$\{t\.count\}\)` : ""\}/);
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

// Three trays, the way a mail client has three.
//
// This replaced a dropdown that filtered one list. The difference matters:
// a filter reads as a temporary narrowing of what you are looking at, and a
// tab reads as a place things are. Moving a lead somewhere only makes sense
// if there is a somewhere.
describe('New, Folders and Bin are places, not filters', () => {
  test('there is one source of truth for which tray is open', () => {
    // Held as a separate `bin` boolean and `folder` string, the two can
    // disagree - the bin showing a folder filter, a folder showing deleted
    // rows - and a screen with two answers to "where am I" eventually shows
    // both at once.
    assert.match(SRC, /const \[view, setView\] = useState\("new"\)/);
    assert.match(SRC, /const bin = view === "bin";/);
    assert.match(SRC, /const folder = view === "new" \? "none"/);
    assert.doesNotMatch(SRC, /const \[bin, setBin\]/);
    assert.doesNotMatch(SRC, /const \[folder, setFolder\]/);
  });

  test('changing tab always loads what that tab shows', () => {
    // Setting the view without loading leaves the old tray's rows under the
    // new tray's name, which is the worst of both.
    const go = SRC.slice(SRC.indexOf('const go = (nextView'), SRC.indexOf('const removeFolder'));
    assert.match(go, /setView\(nextView\)/);
    assert.match(go, /setOpenFolder\(nextFolder\)/);
    assert.match(go, /load\(nextView === "bin", asFolder\)/);
    // And the ticks go: they were ticks on rows that are no longer on screen.
    assert.match(go, /setPicked\(new Set\(\)\)/);
  });

  test('all three tabs are always offered, each with its count', () => {
    for (const id of ['"new"', '"folders"', '"bin"']) {
      assert.ok(SRC.includes(`id:${id}`), `no ${id} tab`);
    }
    assert.match(SRC, /\{t\.label\}\{data \? ` \(\$\{t\.count\}\)` : ""\}/);
  });

  test('the counts come from one place, so tab and chips agree', () => {
    // Filed is summed from the folder list rather than counted separately on
    // the server. Two counts of the same thing eventually differ, and the tab
    // saying 12 above chips adding to 11 is the kind of thing that makes a
    // screen untrustworthy.
    assert.match(SRC, /const filedCount = folders\.reduce\(\(n, f\) => n \+ \(f\.leads \|\| 0\), 0\)/);
    assert.match(SRC, /const newCount = Math\.max\(0, \(data\?\.counts\?\.total \|\| 0\) - filedCount\)/);
  });
});

describe('inside Folders', () => {
  test('it opens on everything filed, before asking you to pick one', () => {
    // The tab answers "what have I moved" first. Landing on an empty folder
    // picker would be a question where an answer was wanted.
    assert.match(SRC, /view === "folders" \? \(openFolder \? String\(openFolder\.id\) : "any"\)/);
    assert.match(SRC, /All folders/);
  });

  test('each folder is a chip that opens it', () => {
    assert.match(SRC, /onClick=\{\(\) => go\("folders", f\)\}/);
    assert.match(SRC, /\{f\.name\} \(\{f\.leads\}\)/);
  });

  test('a lead shows which folder it is in, but only where that is not obvious', () => {
    // Inside one folder every row is in that folder, so the pill would be
    // noise. Across all of them it is the only thing that says where a row
    // lives. Keyed to the old dropdown value this stopped rendering at all.
    assert.match(SRC, /l\.folder_name && view === "folders" && !openFolder/);
  });

  test('no folders yet says what to do about it', () => {
    // Two ways in now: make an empty one, or fill one by moving leads into it.
    assert.match(SRC, /No folders yet\. Make one, or tick leads on New and press Move to folder\./);
  });

  test('deleting a folder keeps the leads, and says so before it does it', () => {
    // Deleting a tray must never be a way to lose what was in it.
    const fn = SRC.slice(SRC.indexOf('const removeFolder'), SRC.indexOf('// The header line') + 1 || undefined);
    assert.match(SRC, /are not deleted\. They go back to New\./);
    assert.match(SRC, /method: "DELETE"/);
  });

  test('the move button flips to putting things back', () => {
    // On Folders the useful action is the opposite one, and offering "move to
    // folder" on something already in a folder is a button with no meaning.
    assert.match(SRC, /Move \$\{picked\.size\} back to New/);
    assert.match(SRC, /view === "folders"\s*\n\s*\? <button[^>]*onClick=\{\(\) => file\(null\)\}/);
  });
});

describe('the export follows the tab', () => {
  test('whatever tray is open is what the file holds', () => {
    const exp = SRC.slice(SRC.indexOf('const exportCsv'), SRC.indexOf('const downloadCsv'));
    assert.match(exp, /qs\.set\("folder", folder\)/);
    assert.doesNotMatch(exp, /"all"/, 'the old dropdown value is gone');
  });
});

describe('making a folder before there is anything to put in it', () => {
  test('there is a button for it, on the tab where folders live', () => {
    // A folder used to exist only once a lead had been moved into it, so you
    // could not set up where things go before starting to sort - which is the
    // order anybody actually works in.
    assert.match(SRC, /const addFolder = async \(\) => \{/);
    assert.match(SRC, /New folder/);
    assert.match(SRC, /method: "POST",\s*\n\s*headers: \{ "Content-Type": "application\/json" \},\s*\n\s*body: JSON\.stringify\(\{ name: name\.trim\(\) \}\)/);
  });

  test('an empty name is not a folder, and cancelling is not an error', () => {
    // window.prompt returns null on Cancel and "" on an empty OK. Both mean
    // no, and neither should reach the server.
    assert.match(SRC, /if \(name == null \|\| !name\.trim\(\)\) return;/);
  });

  test('it opens the folder it just made', () => {
    // Naming a folder is something you do in order to use it.
    assert.match(SRC, /go\("folders", \{ \.\.\.d\.folder, leads: 0 \}\)/);
    assert.match(SRC, /await loadFolders\(\);/);
  });

  test('the empty state now offers both ways in', () => {
    assert.match(SRC, /No folders yet\. Make one, or tick leads on New and press Move to folder\./);
  });
});
