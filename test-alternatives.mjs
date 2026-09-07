/* Runnable check for the exercise-swap logic: node test-alternatives.mjs
   Slices the self-contained pattern/alternatives code out of app.js and runs it
   against the whole bank. It fails loudly if a swap ever stops being a genuine
   like-for-like — the defect that first shipped here offered wrist curls as an
   alternative to reverse curls, and bench press as an alternative to itself. */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const slice = (start, end) => {
  const i = src.indexOf(start);
  assert.ok(i > -1, `could not find "${start}" in app.js — did it get renamed?`);
  const j = src.indexOf(end, i);
  assert.ok(j > -1, `could not find "${end}" after "${start}"`);
  return src.slice(i, j);
};

const ctx = {};
const code = [
  slice('const BANK=[', '\nconst MUSCLES'),   // carries COACHING and ALTERNATIVES with it
  slice('const PATTERNS = [', '\n/* The load he should use'),
  'ctx.BANK = BANK; ctx.patternOf = patternOf; ctx.alternativesFor = alternativesFor;'
].join('\n');
new Function('ctx', code)(ctx);
const { BANK, patternOf, alternativesFor } = ctx;

let checked = 0;
for (const ex of BANK) {
  const alts = alternativesFor(ex);
  const where = `${ex.id} (${patternOf(ex) || 'no pattern'})`;

  for (const a of alts) {
    assert.notEqual(a.id, ex.id, `${where}: offered as its own alternative`);
    assert.notEqual(a.clip, ex.clip, `${where}: alternative ${a.id} is the same movement under another id`);
    assert.equal(a.muscle, ex.muscle, `${where}: alternative ${a.id} trains ${a.muscle}, not ${ex.muscle}`);
    if (patternOf(ex)) {
      assert.equal(patternOf(a), patternOf(ex),
        `${where}: alternative ${a.id} is a ${patternOf(a)}, a different joint action`);
    }
  }
  assert.ok(new Set(alts.map(a => a.id)).size === alts.length, `${where}: duplicate alternatives`);
  assert.ok(alts.length <= 3, `${where}: returned ${alts.length} alternatives, max is 3`);
  checked++;
}

/* Classification assertions. The alternatives sweep above cannot catch a wrong
   label that every member of a group shares — both leg curls were classified as
   'curl' and the sweep still passed, because they agreed with each other. These
   pin the ordering-sensitive cases directly. */
const cls = id => patternOf(BANK.find(b => b.id === id));
for (const [id, want] of [
  ['lever-lying-leg-curl',            'leg-curl'],       // must beat the generic /curl/
  ['lever-kneeling-leg-curl',         'leg-curl'],
  ['barbell-reverse-curl',            'reverse-curl'],   // must beat /curl/
  ['dumbbell-seated-palms-up-wrist-curl', 'wrist-curl'],
  ['sled-calf-press',                 'calf'],           // clip path contains "leg-press"
  ['dumbbell-rear-lateral-raise',     'rear-delt'],      // name contains "lateral-raise"
  ['dumbbell-reverse-fly',            'rear-delt'],      // name contains "fly"
  ['cable-cross-over-revers-fly',     'rear-delt'],       // note the bank's "revers" spelling
  ['lever-leg-extension',             'leg-extension'],
  ['barbell-bench-press',             'horizontal-press'],
  ['barbell-incline-bench-press',     'incline-press']
]) {
  assert.equal(cls(id), want, `${id} classified as ${cls(id)}, expected ${want} — check PATTERNS ordering`);
}

/* The two the trainee specifically said he does not know: they must never be
   offered as substitutes for each other. */
const rc = BANK.find(b => b.id === 'barbell-reverse-curl');
const wc = BANK.find(b => b.id === 'barbell-wrist-curl');
assert.ok(!alternativesFor(rc).some(a => patternOf(a) === 'wrist-curl'), 'reverse curl offered a wrist curl');
assert.ok(!alternativesFor(wc).some(a => patternOf(a) === 'reverse-curl'), 'wrist curl offered a reverse curl');

const bare = BANK.filter(b => alternativesFor(b).length === 0).map(b => b.id);
console.log(`ok — 11 classifications pinned, ${checked} bank exercises checked, every alternative is a like-for-like swap`);
if (bare.length) console.log(`note — ${bare.length} with no alternative: ${bare.join(', ')}`);
