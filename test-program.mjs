/* Runnable check for the programme and the progression rules:
   node test-program.mjs
   Slices the self-contained pieces out of app.js. It fails if the allocation
   drifts from what was agreed — three days, six upper-body exercises each — or
   if progression starts prescribing work that was never performed. */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const slice = (a, b) => {
  const i = src.indexOf(a); assert.ok(i > -1, `missing "${a}" in app.js`);
  const j = src.indexOf(b, i); assert.ok(j > -1, `missing "${b}" after "${a}"`);
  return src.slice(i, j);
};

const ctx = {};
new Function('ctx', [
  slice('const BANK=[', '\nconst MUSCLES'),   // carries COACHING, ALTERNATIVES and PRESETS
  'const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));',
  slice('function representativeLoad(entry){', '\nfunction targetImpact(ex)'),   // carries PATTERNS and patternOf
  'Object.assign(ctx,{BANK,PATTERNS,patternOf,PRESETS,targetFromLast,representativeLoad,repsAtLoad});'
].join('\n'))(ctx);
const { BANK, patternOf, PRESETS, targetFromLast, representativeLoad } = ctx;
const byId = Object.fromEntries(BANK.map(b => [b.id, b]));

/* ---- the programme ---- */
const names = Object.keys(PRESETS);
assert.deepEqual(names, ['upper'], `expected one upper-body programme, found: ${names.join(', ')}`);
const days = PRESETS.upper.days;
assert.equal(days.length, 3, 'the programme is three days');

const LEGS = ['quads', 'hamstrings', 'glutes', 'calves'];
const tally = {};
for (const d of days) {
  const slots = d.groups.flatMap(g => g.slots);
  assert.equal(slots.length, 6, `day ${d.id} has ${slots.length} exercises, expected 6`);
  for (const sl of slots) {
    assert.equal(sl.options.length, 3, `a slot in day ${d.id} offers ${sl.options.length} options, expected 3`);
    assert.ok(sl.rir != null && sl.rir >= 0 && sl.rir <= 4, `a slot in day ${d.id} has no usable reps-in-reserve target`);
    assert.ok(sl.rest >= 30 && sl.rest <= 300, `a slot in day ${d.id} has no usable rest prescription`);
    for (const o of sl.options) {
      assert.ok(byId[o], `unknown exercise id ${o}`);
      assert.ok(!LEGS.includes(byId[o].muscle), `${o} is lower body — this programme is upper body only`);
      assert.notEqual(byId[o].muscle, 'core', `${o} is abdominal work — the owner removed it to fund the arms`);
    }
    const b = byId[sl.options[0]];
    tally[b.muscle] = (tally[b.muscle] || 0) + sl.sets;
  }
  /* His two original complaints, pinned so a later edit cannot quietly undo them. */
  const pats = d.groups.flatMap(g => g.slots.map(sl => patternOf(byId[sl.options[0]])));
  for (let i = 0; i < pats.length - 1; i++) {
    assert.ok(!(pats[i] === 'row' && pats[i + 1] === 'row'), `day ${d.id} runs two rows back to back`);
    assert.ok(!(pats[i] === 'horizontal-press' && pats[i + 1] === 'incline-press'),
      `day ${d.id} puts incline straight after bench`);
  }
}
/* The coached allocation. Sessions are never on back-to-back days, so every
   muscle gets at least 48 hours and the volume is higher than the version that
   had to survive three days running. No abdominal work: the owner removed it and
   those slots went to the arms and forearms. */
const AGREED = { shoulders: 19, back: 16, forearms: 9, chest: 8, biceps: 8, triceps: 8 };
assert.deepEqual(tally, AGREED, `weekly direct sets drifted:\n  got ${JSON.stringify(tally)}\n  want ${JSON.stringify(AGREED)}`);

/* ---- progression ---- */
const ex = { min: 8, max: 12, inc: 2.5, sets: 3 };

// the working load is the one most sets used, not the heaviest single set
assert.equal(representativeLoad({ weight: 30, weights: [30, 25, 25], reps: [10, 8, 8] }), 25,
  'a top set plus two back-offs should progress from the back-off load');
const backoff = targetFromLast(ex, { weight: 30, weights: [30, 25, 25], reps: [10, 8, 8] });
assert.equal(backoff.weight, 25, `next target should be 25kg, got ${backoff.weight}`);

// falling under the rep floor must reduce the load, not repeat it
const failed = targetFromLast(ex, { weight: 40, reps: [6, 6, 5] });
assert.equal(failed.weight, 37.5, `a failed session should back off to 37.5kg, got ${failed.weight}`);
assert.deepEqual(failed.reps, [8, 8, 8], 'a back-off resets to the rep floor');
assert.ok(failed.backedOff, 'a back-off is flagged so the workout screen can say why');

// topping the range adds load and resets reps
const up = targetFromLast(ex, { weight: 40, reps: [12, 12, 12] });
assert.equal(up.weight, 42.5, `topping the range should add one increment, got ${up.weight}`);
assert.deepEqual(up.reps, [8, 8, 8], 'a load increase restarts at the rep floor');

// mid-range adds a rep and holds the load
const mid = targetFromLast(ex, { weight: 40, reps: [10, 9, 9] });
assert.equal(mid.weight, 40, 'mid-range progression holds the load');
assert.deepEqual(mid.reps, [11, 9, 9], 'mid-range progression adds one rep');

console.log(`ok — 3 days x 6 upper-body exercises, ${Object.values(AGREED).reduce((a, b) => a + b, 0)} weekly sets pinned, progression rules hold`);
