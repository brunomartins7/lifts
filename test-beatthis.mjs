/* Runnable check for the "Beat this" line and the advice under it:
   node test-beatthis.mjs
   Everything on that line is derived — the number shown, the load it is read
   from, and the progression it recommends — so each step gets its own case.
   The cases are the shapes a real log actually produces: per-set weights, a
   short session, a drop set, a session logged out of order. */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const slice = (a, b) => {
  const i = src.indexOf(a); assert.ok(i > -1, `missing "${a}"`);
  const j = src.indexOf(b, i); assert.ok(j > -1, `missing "${b}" after "${a}"`);
  return src.slice(i, j);
};
const ctx = {};
new Function('ctx', [
  'const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));',
  'function fmtKg(v){const n=Number(v)||0;return (Math.round(n*10)/10)+"KG"}',
  slice('function fmtEntry(e){', '\nfunction '),
  slice('function representativeLoad(entry){', '\nfunction targetImpact(ex)'),
  slice('/* How the load is carried', 'function loadLabel(ex)'),
  "function loadLabel(ex){ return (ex.equipment==='dumbbell'&&loadStyle(ex)!=='single')?'Each dumbbell':'Work weight'; }",
  'Object.assign(ctx,{fmtEntry,representativeLoad,repsAtLoad,targetFromLast,beatItAdvice,loadStyle,loadLabel});'
].join('\n'))(ctx);
const { fmtEntry, representativeLoad, targetFromLast, beatItAdvice, loadStyle, loadLabel } = ctx;

const bench = { id:'barbell-bench-press', equipment:'barbell', min:6, max:10, inc:2.5, sets:3 };
const curl  = { id:'dumbbell-standing-biceps-curl', equipment:'dumbbell', min:10, max:15, inc:2.5, sets:3 };

/* ---- what the line shows ---- */
// a straight session reads back exactly as performed
assert.equal(fmtEntry({ weight:45, reps:[7,6,9] }), '45KG · 7, 6, 9');
// per-set loads are shown per set rather than flattened to one number
assert.equal(fmtEntry({ weight:45, weights:[45,40,40], reps:[7,6,6] }), '45KG×7 · 40KG×6 · 40KG×6');
// a drop set must not be read as the working load: two sets at 40 beat one at 45
assert.equal(representativeLoad({ weight:45, weights:[45,40,40], reps:[7,6,6] }), 40,
  'the working load is the one most sets used');
// a single logged set still has a working load
assert.equal(representativeLoad({ weight:50, weights:[50], reps:[5] }), 50);

/* ---- what it tells him to do next ---- */
// mid-range: hold the load, add one rep to the first set short of the ceiling
const mid = targetFromLast(bench, { weight:45, reps:[7,6,9] });
assert.equal(mid.weight, 45, 'mid-range holds the load');
assert.deepEqual(mid.reps, [8,6,9], 'mid-range adds one rep to the first set below the ceiling');
assert.match(beatItAdvice(bench, { weight:45, reps:[7,6,9] }, mid), /Stay at 45KG and take set 1 to 8/);

// topping the range everywhere: add one increment, reps restart at the floor
const up = targetFromLast(bench, { weight:45, reps:[10,10,10] });
assert.equal(up.weight, 47.5);
assert.deepEqual(up.reps, [6,6,6]);
assert.match(beatItAdvice(bench, { weight:45, reps:[10,10,10] }, up), /add the plate: 47.5KG for 6, 6, 6/);

// under the floor: the load comes down, and the advice says why
const down = targetFromLast(bench, { weight:60, reps:[4,3,3] });
assert.equal(down.backedOff, true);
assert.equal(down.weight, 57.5);
assert.match(beatItAdvice(bench, { weight:60, reps:[4,3,3] }, down), /Drop to 57.5KG.*fell under 6 reps/);

// a short session still gets a full three-set target
const short = targetFromLast(curl, { weight:12.5, reps:[12] });
assert.equal(short.reps.length, 3, 'a two-set session must not prescribe two sets forever');

// the advice never promises a rep above the ceiling
for (const reps of [[9,10,10],[10,9,10],[15,15,14]]) {
  const ex = reps[0] > 10 ? curl : bench;
  const t = targetFromLast(ex, { weight:30, reps });
  assert.ok(t.reps.every(r => r <= ex.max), `target ${t.reps} exceeds the ceiling of ${ex.max}`);
}

/* ---- how the load is carried, which decides the weight boxes ---- */
const style = id => loadStyle({ id, equipment: id.startsWith('barbell')||id.startsWith('ez-') ? 'barbell' : 'dumbbell' });
// one dumbbell in two hands is one weight — doubling it invents load
assert.equal(style('dumbbell-standing-triceps-extension'), 'single');
assert.equal(style('dumbbell-seated-triceps-extension'), 'single');
assert.equal(style('ez-bar-standing-french-press'), 'single');
// one arm at a time has no second hand to convert
assert.equal(style('dumbbell-one-arm-bent-over-row'), 'single');
assert.equal(style('dumbbell-cross-body-hammer-curl'), 'single');
assert.equal(style('dumbbell-over-bench-wrist-curl'), 'single');
// two dumbbells, but no barbell version of the movement exists
for (const id of ['dumbbell-fly','dumbbell-incline-fly','dumbbell-lateral-raise','dumbbell-rear-lateral-raise','dumbbell-incline-curl','dumbbell-hammer-curl','dumbbell-incline-row'])
  assert.equal(style(id), 'pair', `${id} should not offer a barbell equivalent`);
// the genuine two-way movements keep both boxes
for (const id of ['barbell-bench-press','dumbbell-bench-press','dumbbell-incline-bench-press','dumbbell-seated-shoulder-press','dumbbell-standing-biceps-curl','dumbbell-standing-reverse-curl','barbell-lying-triceps-extension-skull-crusher'])
  assert.equal(style(id), 'convertible', `${id} should offer both boxes`);
// and the label never claims two dumbbells when there is one
assert.equal(loadLabel({ id:'dumbbell-standing-triceps-extension', equipment:'dumbbell' }), 'Work weight');
assert.equal(loadLabel({ id:'dumbbell-lateral-raise', equipment:'dumbbell' }), 'Each dumbbell');

console.log('ok — beat-this reading, progression advice and weight-box rules all hold');
