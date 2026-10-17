/* Runnable check for the media layer:  node test-media.mjs

   The class of failure this guards: an expensive, stateful element written
   into markup that render() rebuilds wholesale. A <video> in the markup is
   destroyed and recreated on every logged set — playback restarts, and WebKit
   rebuilds a decoder each time, six at once on a workout screen. The rule is
   that markup carries a placeholder and exactly one place constructs the
   element. These assertions fail if either half comes back. */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('./app.js', import.meta.url), 'utf8');

/* ---- the markup must never contain a media element ---- */
const i = src.indexOf('function renderMedia(ex){');
const j = src.indexOf('\n/* The coaching layer', i);
assert.ok(i > -1 && j > i, 'renderMedia not found');
const renderMedia = src.slice(i, j);
assert.doesNotMatch(renderMedia, /<video/,
  'renderMedia writes a <video> into markup again — render() will destroy and rebuild it on every set');
assert.match(renderMedia, /data-video="\$\{esc\(ex\.id\)\}"/,
  'renderMedia must emit a data-video placeholder for mountVideos to fill');

/* No other render path may smuggle one in either. Comments are stripped first:
   this file and app.js both discuss <video> in prose, and a guard that trips on
   its own documentation gets deleted rather than obeyed. */
const code = src
  .replace(/\/\*[\s\S]*?\*\//g, '')          // block comments
  .split('\n').filter(l => !/^\s*(\/\/|\*)/.test(l)).join('\n');
const tags = code.match(/<video[ >]/g) || [];
assert.equal(tags.length, 0, `${tags.length} <video> tag(s) in markup; the element is built in mountVideos only`);

/* ---- the element must survive the re-render ---- */
assert.match(src, /harvestVideos\(\);\s*\/\/[^\n]*\n\s*app\.innerHTML=/,
  'render() must harvest live videos immediately before replacing innerHTML');
assert.match(src, /app\.innerHTML=[^\n]*\n\s*mountVideos\(\);/,
  'render() must remount videos immediately after replacing innerHTML');

/* Opening a panel does not re-render, so that path has to mount too. */
const toggle = src.slice(src.indexOf("app.addEventListener('toggle'"), src.indexOf("app.addEventListener('change'"));
assert.match(toggle, /mountVideos\(\)/,
  'the toggle handler must mount, or a video never appears when its panel is opened');

/* ---- only what is on screen stays alive ---- */
const mount = src.slice(src.indexOf('function mountVideos(){'), src.indexOf('const openPanels'));
assert.match(mount, /if\(panel && !panel\.open\) continue/,
  'a shut panel must not hold a live video');
assert.match(mount, /removeAttribute\('src'\)/,
  'a video that leaves the screen must be released, not left to the collector');

/* ---- the wrapper must recover from a dead content process ---- */
const swift = readFileSync(new URL('./ios/BrunianLifts/AppDelegate.swift', import.meta.url), 'utf8');
assert.match(swift, /func webViewWebContentProcessDidTerminate/,
  'without this the app goes blank and has to be force-quit when the content process dies');
assert.match(swift, /"mp4":\s*"video\/mp4"/, 'mp4 must be served as video/mp4 or it will not play');
assert.match(swift, /statusCode: 206/, 'byte ranges must be answered or playback never starts');

console.log('ok — media is a placeholder in markup, built once, kept across renders, released off screen');
