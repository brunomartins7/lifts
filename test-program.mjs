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
    assert.equal(sl.sets, 3, `a slot in day ${d.id} prescribes ${sl.sets} sets; he asked for three on every exercise`);
    assert.ok(sl.rir != null && sl.rir >= 0 && sl.rir <= 4, `a slot in day ${d.id} has no usable reps-in-reserve target`);
    assert.ok(sl.rest >= 30 && sl.rest <= 300, `a slot in day ${d.id} has no usable rest prescription`);
    for (const o of sl.options) {
      assert.ok(byId[o], `unknown exercise id ${o}`);
      assert.ok(!LEGS.includes(byId[o].muscle), `${o} is lower body — this programme is upper body only`);
      assert.notEqual(byId[o].muscle, 'core', `${o} is abdominal work — the owner removed it to fund the arms`);
      assert.ok(!/^(lever-|sled-)|smith-|^cable-(pulldown|lateral-pulldown|underhand-pulldown)/.test(o),
        `${o} needs a machine he does not have — no seated pulldown station, no lever or sled machines`);
    }
    const b = byId[sl.options[0]];
    tally[b.muscle] = (tally[b.muscle] || 0) + sl.sets;
  }
  /* One raise or fly a day, so the lateral raise is never done on a shoulder
     already fatigued by another one, and one curl a day. Both are his rules. */
  const kinds = d.groups.flatMap(g => g.slots.map(sl => patternOf(byId[sl.options[0]])));
  const raises = kinds.filter(k => ['lateral-raise', 'rear-delt', 'fly'].includes(k)).length;
  assert.ok(raises <= 1, `day ${d.id} has ${raises} raise or fly movements; one a day`);
  const curls = d.groups.flatMap(g => g.slots.map(sl => byId[sl.options[0]]))
                        .filter(b => b.muscle === 'biceps').length;
  assert.ok(curls <= 1, `day ${d.id} has ${curls} biceps movements; one a day`);

  /* His two original complaints, pinned so a later edit cannot quietly undo them. */
  const pats = d.groups.flatMap(g => g.slots.map(sl => patternOf(byId[sl.options[0]])));
  for (let i = 0; i < pats.length - 1; i++) {
    assert.ok(!(pats[i] === 'row' && pats[i + 1] === 'row'), `day ${d.id} runs two rows back to back`);
    assert.ok(!(pats[i] === 'horizontal-press' && pats[i + 1] === 'incline-press'),
      `day ${d.id} puts incline straight after bench`);
  }
}
/* The coached allocation. Constrained by the equipment he actually has: no
   pulldown station, no pec deck, no T-bar, so the back is built from rows and a
   chin-up is offered only as an option. Free-weight biased by design. */
const AGREED = { back: 12, shoulders: 12, chest: 9, triceps: 9, biceps: 6, forearms: 6 };

/* No exercise may fall on consecutive days. The rotation wraps, so C into A is a
   consecutive pair too — that is the one that is easy to miss. */
const byDay = Object.fromEntries(days.map(d => [d.id, d.groups.flatMap(g => g.slots.map(sl => sl.options[0]))]));
for (const [x, y] of [['A','B'], ['B','C'], ['C','A']])
  for (const e of byDay[x])
    assert.ok(!byDay[y].includes(e), `${e} is on both ${x} and ${y}, which are consecutive sessions`);
const everySlot = Object.values(byDay).flat();
assert.equal(new Set(everySlot).size, everySlot.length, 'an exercise is used twice in the week');

/* Every head he named has to be covered by something. */
const used = new Set(everySlot);
const covers = (label, ids) => assert.ok(ids.some(i => used.has(i)), `nothing covers ${label}`);
covers('upper chest',        ['dumbbell-incline-bench-press','barbell-incline-bench-press','dumbbell-incline-fly']);
covers('mid/lower chest',    ['barbell-bench-press','dumbbell-bench-press','dumbbell-fly','cable-standing-fly']);
covers('lats',               ['dumbbell-one-arm-bent-over-row','cable-seated-row','pull-up','chin-up']);
covers('mid-back',           ['dumbbell-incline-row','cable-rope-seated-row','cable-seated-wide-grip-row','cable-seated-row','barbell-bent-over-row']);
covers('front delts',        ['dumbbell-seated-shoulder-press','barbell-seated-overhead-press','dumbbell-standing-overhead-press']);
covers('lateral delts',      ['dumbbell-lateral-raise','cable-lateral-raise','cable-one-arm-lateral-raise','dumbbell-upright-row']);
covers('rear delts',         ['dumbbell-reverse-fly','cable-standing-rear-delt-row-with-rope','dumbbell-rear-lateral-raise','cable-cross-over-revers-fly']);
covers('biceps',             ['dumbbell-standing-biceps-curl','barbell-curl','dumbbell-incline-curl']);

covers('brachialis',         ['dumbbell-cross-body-hammer-curl','dumbbell-hammer-curl']);
covers('wrist flexors',      ['dumbbell-over-bench-wrist-curl','dumbbell-seated-palms-up-wrist-curl','barbell-wrist-curl']);
covers('forearms',           ['barbell-reverse-curl','dumbbell-standing-reverse-curl','cable-reverse-curl']);
covers('triceps long head',  ['dumbbell-seated-triceps-extension','cable-overhead-triceps-extension-rope-attachment','dumbbell-standing-triceps-extension']);
covers('triceps lat/medial', ['cable-pushdown-with-rope-attachment','cable-triceps-pushdown-v-bar','dumbbell-lying-triceps-extension']);
const defaults = days.flatMap(d => d.groups.flatMap(g => g.slots.map(sl => byId[sl.options[0]])));
const freeWeight = defaults.filter(b => b.equipment === 'barbell' || b.equipment === 'dumbbell').length;
assert.ok(freeWeight >= 11, `only ${freeWeight} of ${defaults.length} default exercises are free weights; he asked for a free-weight programme`);
assert.ok(!everySlot.some(i => byId[i].muscle === 'chest' && /fly/.test(i)),
  'a chest fly is back in the programme; he replaced it with an incline press');
assert.ok(everySlot.filter(i => byId[i].id.startsWith('dumbbell') && patternOf(byId[i]) === 'lateral-raise').length <= 1,
  'two dumbbell lateral raises in one week');
const rowCount = everySlot.filter(i => patternOf(byId[i]) === 'row').length;
assert.ok(rowCount <= 3, `${rowCount} rowing movements in the week; he said five was overboard`);
/* He wants to work towards pull-ups and has no bar, so the one overhead pulling
   pattern he can train must not quietly vanish in a later edit. */
assert.ok(everySlot.some(i => patternOf(byId[i]) === 'pulldown'),
  'no overhead pulling pattern in the week; he is working towards pull-ups');
assert.ok(everySlot.includes('barbell-lying-triceps-extension-skull-crusher'), 'skull crushers were asked for and are missing');
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
