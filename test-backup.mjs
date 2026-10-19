/* Runnable check for the folder backup:  node test-backup.mjs

   The class of failure this guards: a backup that reports success without the
   storage having confirmed it. A backup believed to be working and silently
   not is worse than no backup, because it is trusted — so every claim the UI
   makes must come from the native reply, and a failure must be visible rather
   than swallowed. */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const src   = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const swift = readFileSync(new URL('./ios/BrunianLifts/AppDelegate.swift', import.meta.url), 'utf8');

const fb = src.slice(src.indexOf('const FolderBackup = {'), src.indexOf('const openPanels'));
assert.ok(fb.length > 200, 'FolderBackup block not found');

/* ---- success is only ever reported from a reply ---- */
assert.match(fb, /lastWrite\s*=\s*r\.at/,
  'the last-backup time must come from the native reply, not from Date.now() on the way out');
assert.match(fb, /catch\(e\)\{[^}]*lastError[^}]*return false/,
  'a failed write must record the error and return false, never fall through as success');
/* The real property: success is returned only after the reply has been awaited,
   never on the way out. */
const write = fb.slice(fb.indexOf('async write()'), fb.indexOf('async restore()'));
assert.ok(write.indexOf("await this.call('write'") < write.indexOf('return true'),
  'write() must await the native reply before it can report success');

/* ---- the website must be untouched ---- */
assert.match(fb, /window\.webkit\?\.messageHandlers\?\.backup \|\| null/,
  'the bridge must be feature-detected so a browser simply has no backup folder');
const card = src.slice(src.indexOf('${FolderBackup.available?`<div class="card">'), src.indexOf('Cloud sync ${conf'));
assert.ok(card.includes('FolderBackup.available?'), 'the card must be gated on the bridge existing');

/* ---- a restore must not accept any old file ---- */
assert.match(fb, /Array\.isArray\(incoming\.sessions\)/,
  'restore must reject a file that is not a ledger rather than wiping the real one');
assert.match(fb, /snapshot\('pre-folder-restore'\)/,
  'restore must snapshot first so it can be undone');

/* ---- failure has to be visible ---- */
assert.match(src, /FolderBackup\.lastError\?`<div class="banner bad"/,
  'a failing backup must say so on screen, not just stop working');

/* ---- the native side ---- */
assert.match(swift, /WKScriptMessageHandlerWithReply/,
  'the bridge must reply, or the web side cannot know whether a write landed');
assert.match(swift, /options: \.atomic/,
  'the write must be atomic so a half-written ledger cannot replace a whole one');
assert.match(swift, /NSFileCoordinator\(\)/,
  'an iCloud Drive folder needs coordinated access');
assert.match(swift, /startAccessingSecurityScopedResource/,
  'a bookmarked folder needs its security scope started before use');
assert.match(swift, /bookmarkDataIsStale/,
  'a stale bookmark must be refreshed or access is lost after a reboot');

console.log('ok — backup reports only what the file system confirmed, and the website is untouched');
