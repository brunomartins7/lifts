/* Prints the id and name of every exercise in the programme, so a demo video
   can be named to match. Run: node ios/list-exercise-ids.mjs */
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const slice = (a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); return src.slice(i, j); };
const ctx = {};
new Function('ctx', [slice('const BANK=[', '\nconst MUSCLES'), 'Object.assign(ctx,{BANK,PRESETS});'].join('\n'))(ctx);
const byId = Object.fromEntries(ctx.BANK.map(b => [b.id, b]));
for (const d of ctx.PRESETS.upper.days) {
  console.log(`\nDay ${d.id} — ${d.name}`);
  for (const sl of d.groups.flatMap(g => g.slots)) {
    const b = byId[sl.options[0]];
    console.log(`  ${b.id}.mp4`.padEnd(52) + b.name);
  }
}
