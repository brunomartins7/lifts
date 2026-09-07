/* ============================================================================
   BRUNIAN LIFTS v3.0 — personal strength ledger
   Single-user, offline-first, cloud-synced. No backend required.
   v3: advanced layer (RPE, ACWR readiness, training blocks), leg exercises in
   the optional bank, responsive redesign (mobile bottom nav, desktop sidebar).
   Sections: 1 Constants · 2 Utils · 3 Store · 4 Domain · 5 Sync · 6 Timers
             7 Views · 8 Controller/Boot
   ========================================================================== */
'use strict';

/* ========================== 1. CONSTANTS ================================== */
const CLIP_BASE = 'https://raw.githubusercontent.com/JahelCuadrado/ExerciseGymGifsDB/main/';

const DEFAULT_PLAN = [
 {id:'A',name:'Push',focus:'Chest Lead, Shoulders, Triceps',groups:[
  {id:'A1',name:'Primary Press Pair',rule:'3 rounds. One set of each exercise, then rest.',exercises:[
   {id:'bench',name:'Barbell Bench Press',clip:'pectorals/barbell-bench-press.gif',type:'compound',muscle:'chest',equipment:'barbell',sets:3,min:6,max:10,inc:2.5,startWeight:30,startReps:6,goalWeight:55,goalReps:8,averageWeight:42.5,averageReps:8,cues:['Set shoulder blades before the first rep.','Lower to the same touch point each rep.','Stop before form becomes inconsistent.']},
   {id:'inclineDb',name:'Incline Dumbbell Press',clip:'pectorals/dumbbell-incline-bench-press.gif',type:'compound',muscle:'chest',equipment:'dumbbell',sets:3,min:8,max:12,inc:2.5,startWeight:15,startReps:8,goalWeight:27.5,goalReps:10,averageWeight:22.5,averageReps:8,cues:['Use a moderate incline.','Control the bottom position.','Keep shoulders from rolling forward.']}
  ]},
  {id:'A2',name:'Shoulder And Chest Detail',rule:'3 rounds. One set of each exercise, then rest.',exercises:[
   {id:'shoulderPress',name:'Seated Dumbbell Shoulder Press',clip:'delts/dumbbell-seated-shoulder-press.gif',type:'compound',muscle:'shoulders',equipment:'dumbbell',sets:3,min:8,max:12,inc:2.5,startWeight:12.5,startReps:8,goalWeight:22.5,goalReps:10,averageWeight:17.5,averageReps:8,cues:['Brace before pressing.','Keep wrists stacked over elbows.','Do not chase reps after the press path breaks.']},
   {id:'cableFly',name:'Dumbbell Fly Or Cable Fly',clip:'pectorals/dumbbell-fly.gif',type:'isolation',muscle:'chest',equipment:'dumbbell',sets:3,min:12,max:15,inc:2.5,startWeight:10,startReps:12,goalWeight:17.5,goalReps:12,averageWeight:12.5,averageReps:12,cues:['Keep a fixed elbow angle.','Pause briefly in the stretch.','Keep shoulders controlled.']},
   {id:'pushdown',name:'Triceps Pushdown',clip:'triceps/cable-triceps-pushdown-v-bar.gif',type:'isolation',muscle:'triceps',equipment:'cable',sets:3,min:10,max:15,inc:2.5,startWeight:15,startReps:10,goalWeight:35,goalReps:12,averageWeight:25,averageReps:12,cues:['Lock elbows to your sides.','Reach full extension.','Control the return.']}
  ]},
  {id:'A3',name:'Arm Finisher',rule:'3 rounds. One set of each exercise, then rest.',exercises:[
   {id:'frenchPress',name:'Overhead Dumbbell French Press',clip:'triceps/dumbbell-standing-triceps-extension.gif',type:'isolation',muscle:'triceps',equipment:'dumbbell',sets:3,min:10,max:12,inc:2.5,startWeight:12.5,startReps:10,goalWeight:22.5,goalReps:10,averageWeight:17.5,averageReps:10,cues:['Keep elbows pointing forward.','Lower behind the head slowly.','Avoid turning it into a back extension.']},
   {id:'crossHammer',name:'Cross Body Hammer Curl',clip:'biceps/dumbbell-cross-body-hammer-curl.gif',type:'isolation',muscle:'biceps',equipment:'dumbbell',sets:3,min:10,max:15,inc:2.5,startWeight:10,startReps:10,goalWeight:17.5,goalReps:12,averageWeight:12.5,averageReps:12,cues:['Keep the shoulder still.','Curl across the body without swinging.','Lower slowly.']}
  ]}
 ]},
 {id:'B',name:'Pull',focus:'Back Lead, Rear Delts, Biceps',groups:[
  {id:'B1',name:'Core And Row Base',rule:'3 rounds. One set of each exercise, then rest.',exercises:[
   {id:'legRaise',name:'Hanging Leg Raise To Bar',clip:'abs/hanging-straight-leg-raise.gif',type:'isolation',muscle:'core',equipment:'bodyweight',sets:3,min:6,max:10,inc:1,startWeight:0,startReps:6,goalWeight:0,goalReps:15,averageWeight:0,averageReps:10,scoreMode:'reps',cues:['Start from a still hang.','Lift with control instead of momentum.','Control the lowering phase.']},
   {id:'dbRow',name:'One Arm Dumbbell Row',clip:'upper-back/dumbbell-one-arm-bent-over-row.gif',type:'compound',muscle:'back',equipment:'dumbbell',sets:3,min:8,max:12,inc:2.5,startWeight:17.5,startReps:8,goalWeight:35,goalReps:10,averageWeight:27.5,averageReps:10,cues:['Brace before pulling.','Pull elbow toward the hip.','Avoid twisting to finish the rep.']}
  ]},
  {id:'B2',name:'Upper Back Control',rule:'3 rounds. One set of each exercise, then rest.',exercises:[
   {id:'chestRow',name:'Chest Supported Incline Dumbbell Row',clip:'upper-back/dumbbell-incline-row.gif',type:'compound',muscle:'back',equipment:'dumbbell',sets:3,min:10,max:12,inc:2.5,startWeight:15,startReps:10,goalWeight:30,goalReps:10,averageWeight:25,averageReps:10,cues:['Keep chest on the bench.','Drive elbows back.','Pause briefly at the top.']},
   {id:'facePull',name:'Face Pulls',clip:'delts/cable-standing-rear-delt-row-with-rope.gif',type:'isolation',muscle:'shoulders',equipment:'cable',sets:3,min:15,max:20,inc:2.5,startWeight:10,startReps:15,goalWeight:30,goalReps:15,averageWeight:22.5,averageReps:15,cues:['Pull toward eye level.','Lead with elbows.','Keep traps relaxed.']}
  ]},
  {id:'B3',name:'Biceps And Forearms',rule:'3 rounds. One set of each exercise, then rest.',exercises:[
   {id:'hammer',name:'Dumbbell Hammer Curl',clip:'biceps/dumbbell-one-arm-standing-hammer-curl.gif',type:'isolation',muscle:'biceps',equipment:'dumbbell',sets:3,min:10,max:12,inc:2.5,startWeight:10,startReps:10,goalWeight:20,goalReps:10,averageWeight:15,averageReps:10,cues:['Keep palms facing each other.','Do not swing the dumbbells.','Lower fully.']},
   {id:'curl',name:'Cable Or Dumbbell Curl',clip:'biceps/dumbbell-standing-biceps-curl.gif',type:'isolation',muscle:'biceps',equipment:'dumbbell',sets:3,min:10,max:15,inc:2.5,startWeight:7.5,startReps:10,goalWeight:15,goalReps:12,averageWeight:12.5,averageReps:12,cues:['Keep elbows close.','Use a full range you can control.','Do not lean back to finish.']},
   {id:'wristCurl',name:'Dumbbell Wrist Curl',clip:'forearms/dumbbell-seated-palms-up-wrist-curl.gif',type:'isolation',muscle:'forearms',equipment:'dumbbell',sets:3,min:12,max:20,inc:2.5,startWeight:7.5,startReps:12,goalWeight:17.5,goalReps:15,averageWeight:12.5,averageReps:15,cues:['Use a controlled tempo.','Move through the wrist, not the elbow.','Keep reps smooth.']}
  ]}
 ]},
 {id:'C',name:'Shoulders And Arms',focus:'Delts, Arms, Upper Back Detail',groups:[
  {id:'C1',name:'Vertical Press And Width',rule:'3 rounds. One set of each exercise, then rest.',exercises:[
   {id:'ohp',name:'Standing Overhead Press',clip:'delts/barbell-standing-close-grip-military-press.gif',type:'compound',muscle:'shoulders',equipment:'barbell',sets:3,min:6,max:10,inc:2.5,startWeight:25,startReps:6,goalWeight:42.5,goalReps:8,averageWeight:32.5,averageReps:8,cues:['Brace glutes and abs before pressing.','Press in a straight path.','Finish with control overhead.']},
   {id:'lateral',name:'Lateral Raises',clip:'delts/dumbbell-lateral-raise.gif',type:'isolation',muscle:'shoulders',equipment:'dumbbell',sets:3,min:12,max:20,inc:2.5,startWeight:5,startReps:12,goalWeight:12.5,goalReps:15,averageWeight:8,averageReps:15,cues:['Lead with elbows.','Stop around shoulder height.','Use strict reps over momentum.']}
  ]},
  {id:'C2',name:'Pump Press And Rear Delts',rule:'3 rounds. One set of each exercise, then rest.',exercises:[
   {id:'inclinePump',name:'Incline Dumbbell Press Pump Set',clip:'pectorals/dumbbell-incline-bench-press.gif',type:'isolation',muscle:'chest',equipment:'dumbbell',sets:3,min:12,max:15,inc:2.5,startWeight:12.5,startReps:12,goalWeight:22.5,goalReps:12,averageWeight:17.5,averageReps:12,cues:['Use controlled pump reps.','Keep tension on chest.','Stop before form breaks.']},
   {id:'cableRow',name:'Face Pulls Or Cable Row',clip:'upper-back/cable-seated-row.gif',type:'isolation',muscle:'back',equipment:'cable',sets:3,min:12,max:15,inc:2.5,startWeight:12.5,startReps:12,goalWeight:32.5,goalReps:12,averageWeight:27.5,averageReps:12,cues:['Keep torso still.','Pull with upper back.','Control the eccentric.']}
  ]},
  {id:'C3',name:'Arm Superset',rule:'3 rounds. One set of each exercise, then rest.',exercises:[
   {id:'curlC',name:'Dumbbell Curl',clip:'biceps/dumbbell-standing-biceps-curl.gif',type:'isolation',muscle:'biceps',equipment:'dumbbell',sets:3,min:10,max:15,inc:2.5,startWeight:7.5,startReps:10,goalWeight:17.5,goalReps:12,averageWeight:12.5,averageReps:12,cues:['Keep elbows stable.','Squeeze without swinging.','Lower with control.']},
   {id:'tricepsWaist',name:'Overhead Cable Triceps Extension',clip:'triceps/cable-overhead-triceps-extension-rope-attachment.gif',type:'isolation',muscle:'triceps',equipment:'cable',sets:3,min:10,max:15,inc:2.5,startWeight:15,startReps:10,goalWeight:32.5,goalReps:12,averageWeight:25,averageReps:12,cues:['Keep elbows high.','Reach a full stretch.','Finish without flaring shoulders.']},
   {id:'reverseCurl',name:'Reverse Curl',clip:'forearms/barbell-reverse-curl.gif',type:'isolation',muscle:'forearms',equipment:'barbell',sets:3,min:12,max:15,inc:2.5,startWeight:7.5,startReps:12,goalWeight:15,goalReps:12,averageWeight:10,averageReps:12,cues:['Keep wrists neutral.','Lift without swinging.','Lower slowly.']}
  ]}
 ]}
];

const BANK=[{"id":"barbell-bench-press","name":"Barbell Bench Press","clip":"pectorals/barbell-bench-press.gif","muscle":"chest","equipment":"barbell","type":"compound","min":6,"max":10,"inc":2.5,"startWeight":30,"goalWeight":55},{"id":"barbell-incline-bench-press","name":"Barbell Incline Bench Press","clip":"pectorals/barbell-incline-bench-press.gif","muscle":"chest","equipment":"barbell","type":"compound","min":6,"max":10,"inc":2.5,"startWeight":30,"goalWeight":55},{"id":"dumbbell-bench-press","name":"Dumbbell Bench Press","clip":"pectorals/dumbbell-bench-press.gif","muscle":"chest","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":15,"goalWeight":27.5},{"id":"dumbbell-incline-bench-press","name":"Dumbbell Incline Bench Press","clip":"pectorals/dumbbell-incline-bench-press.gif","muscle":"chest","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":15,"goalWeight":27.5},{"id":"dumbbell-fly","name":"Dumbbell Fly","clip":"pectorals/dumbbell-fly.gif","muscle":"chest","equipment":"dumbbell","type":"isolation","min":8,"max":12,"inc":2.5,"startWeight":15,"goalWeight":27.5},{"id":"dumbbell-incline-fly","name":"Dumbbell Incline Fly","clip":"pectorals/dumbbell-incline-fly.gif","muscle":"chest","equipment":"dumbbell","type":"isolation","min":8,"max":12,"inc":2.5,"startWeight":15,"goalWeight":27.5},{"id":"dumbbell-pullover","name":"Dumbbell Pullover","clip":"pectorals/dumbbell-pullover.gif","muscle":"chest","equipment":"dumbbell","type":"isolation","min":8,"max":12,"inc":2.5,"startWeight":15,"goalWeight":27.5},{"id":"cable-standing-fly","name":"Cable Standing Fly","clip":"pectorals/cable-standing-fly.gif","muscle":"chest","equipment":"cable","type":"isolation","min":12,"max":15,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"cable-upper-chest-crossovers","name":"Cable Upper Chest Crossovers","clip":"pectorals/cable-upper-chest-crossovers.gif","muscle":"chest","equipment":"cable","type":"isolation","min":12,"max":15,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"cable-seated-chest-press","name":"Cable Seated Chest Press","clip":"pectorals/cable-seated-chest-press.gif","muscle":"chest","equipment":"cable","type":"isolation","min":12,"max":15,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"lever-chest-press","name":"Lever Chest Press","clip":"pectorals/lever-chest-press.gif","muscle":"chest","equipment":"machine","type":"isolation","min":10,"max":12,"inc":5,"startWeight":30,"goalWeight":55},{"id":"lever-incline-chest-press","name":"Lever Incline Chest Press","clip":"pectorals/lever-incline-chest-press.gif","muscle":"chest","equipment":"machine","type":"isolation","min":10,"max":12,"inc":5,"startWeight":30,"goalWeight":55},{"id":"lever-seated-fly","name":"Lever Seated Fly","clip":"pectorals/lever-seated-fly.gif","muscle":"chest","equipment":"machine","type":"isolation","min":10,"max":12,"inc":5,"startWeight":30,"goalWeight":55},{"id":"chest-dip","name":"Chest Dip","clip":"pectorals/chest-dip.gif","muscle":"chest","equipment":"bodyweight","type":"compound","min":6,"max":12,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"push-up","name":"Push Up","clip":"pectorals/push-up.gif","muscle":"chest","equipment":"bodyweight","type":"compound","min":6,"max":12,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"deep-push-up","name":"Deep Push Up","clip":"pectorals/deep-push-up.gif","muscle":"chest","equipment":"bodyweight","type":"compound","min":6,"max":12,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"dumbbell-one-arm-bent-over-row","name":"Dumbbell One Arm Bent Over Row","clip":"upper-back/dumbbell-one-arm-bent-over-row.gif","muscle":"back","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":17.5,"goalWeight":35},{"id":"dumbbell-incline-row","name":"Dumbbell Incline Row","clip":"upper-back/dumbbell-incline-row.gif","muscle":"back","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":17.5,"goalWeight":35},{"id":"barbell-bent-over-row","name":"Barbell Bent Over Row","clip":"upper-back/barbell-bent-over-row.gif","muscle":"back","equipment":"barbell","type":"compound","min":6,"max":10,"inc":2.5,"startWeight":30,"goalWeight":55},{"id":"barbell-pendlay-row","name":"Barbell Pendlay Row","clip":"upper-back/barbell-pendlay-row.gif","muscle":"back","equipment":"barbell","type":"compound","min":6,"max":10,"inc":2.5,"startWeight":30,"goalWeight":55},{"id":"cable-seated-row","name":"Cable Seated Row","clip":"upper-back/cable-seated-row.gif","muscle":"back","equipment":"cable","type":"compound","min":10,"max":12,"inc":2.5,"startWeight":25,"goalWeight":45},{"id":"cable-rope-seated-row","name":"Cable Rope Seated Row","clip":"upper-back/cable-rope-seated-row.gif","muscle":"back","equipment":"cable","type":"compound","min":10,"max":12,"inc":2.5,"startWeight":25,"goalWeight":45},{"id":"cable-seated-wide-grip-row","name":"Cable Seated Wide Grip Row","clip":"upper-back/cable-seated-wide-grip-row.gif","muscle":"back","equipment":"cable","type":"compound","min":10,"max":12,"inc":2.5,"startWeight":25,"goalWeight":45},{"id":"lever-seated-row","name":"Lever Seated Row","clip":"upper-back/lever-seated-row.gif","muscle":"back","equipment":"machine","type":"compound","min":10,"max":12,"inc":5,"startWeight":30,"goalWeight":55},{"id":"lever-t-bar-row","name":"Lever T Bar Row","clip":"upper-back/lever-t-bar-row.gif","muscle":"back","equipment":"machine","type":"compound","min":10,"max":12,"inc":5,"startWeight":30,"goalWeight":55},{"id":"lever-high-row","name":"Lever High Row","clip":"upper-back/lever-high-row.gif","muscle":"back","equipment":"machine","type":"compound","min":10,"max":12,"inc":5,"startWeight":30,"goalWeight":55},{"id":"inverted-row","name":"Inverted Row","clip":"upper-back/inverted-row.gif","muscle":"back","equipment":"bodyweight","type":"compound","min":6,"max":12,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"pull-up","name":"Pull Up","clip":"lats/pull-up.gif","muscle":"back","equipment":"bodyweight","type":"compound","min":6,"max":12,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"chin-up","name":"Chin Up","clip":"lats/chin-up.gif","muscle":"back","equipment":"bodyweight","type":"compound","min":6,"max":12,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"wide-grip-pull-up","name":"Wide Grip Pull Up","clip":"lats/wide-grip-pull-up.gif","muscle":"back","equipment":"bodyweight","type":"compound","min":6,"max":12,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"pull-up-neutral-grip","name":"Pull Up Neutral Grip","clip":"lats/pull-up-neutral-grip.gif","muscle":"back","equipment":"bodyweight","type":"compound","min":6,"max":12,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"cable-pulldown","name":"Cable Pulldown","clip":"lats/cable-pulldown.gif","muscle":"back","equipment":"cable","type":"compound","min":10,"max":12,"inc":2.5,"startWeight":25,"goalWeight":45},{"id":"cable-lateral-pulldown-with-v-bar","name":"Cable Lateral Pulldown With V Bar","clip":"lats/cable-lateral-pulldown-with-v-bar.gif","muscle":"back","equipment":"cable","type":"compound","min":10,"max":12,"inc":2.5,"startWeight":25,"goalWeight":45},{"id":"cable-underhand-pulldown","name":"Cable Underhand Pulldown","clip":"lats/cable-underhand-pulldown.gif","muscle":"back","equipment":"cable","type":"compound","min":10,"max":12,"inc":2.5,"startWeight":25,"goalWeight":45},{"id":"cable-straight-arm-pulldown","name":"Cable Straight Arm Pulldown","clip":"lats/cable-straight-arm-pulldown.gif","muscle":"back","equipment":"cable","type":"compound","min":10,"max":12,"inc":2.5,"startWeight":25,"goalWeight":45},{"id":"lever-front-pulldown","name":"Lever Front Pulldown","clip":"lats/lever-front-pulldown.gif","muscle":"back","equipment":"machine","type":"compound","min":10,"max":12,"inc":5,"startWeight":30,"goalWeight":55},{"id":"dumbbell-shrug","name":"Dumbbell Shrug","clip":"traps/dumbbell-shrug.gif","muscle":"back","equipment":"dumbbell","type":"isolation","min":8,"max":12,"inc":2.5,"startWeight":17.5,"goalWeight":35},{"id":"barbell-shrug","name":"Barbell Shrug","clip":"traps/barbell-shrug.gif","muscle":"back","equipment":"barbell","type":"isolation","min":6,"max":10,"inc":2.5,"startWeight":30,"goalWeight":55},{"id":"cable-shrug","name":"Cable Shrug","clip":"traps/cable-shrug.gif","muscle":"back","equipment":"cable","type":"isolation","min":10,"max":12,"inc":2.5,"startWeight":25,"goalWeight":45},{"id":"barbell-standing-close-grip-military-press","name":"Barbell Standing Close Grip Military Press","clip":"delts/barbell-standing-close-grip-military-press.gif","muscle":"shoulders","equipment":"barbell","type":"compound","min":6,"max":10,"inc":2.5,"startWeight":25,"goalWeight":42.5},{"id":"barbell-seated-overhead-press","name":"Barbell Seated Overhead Press","clip":"delts/barbell-seated-overhead-press.gif","muscle":"shoulders","equipment":"barbell","type":"compound","min":6,"max":10,"inc":2.5,"startWeight":25,"goalWeight":42.5},{"id":"dumbbell-seated-shoulder-press","name":"Dumbbell Seated Shoulder Press","clip":"delts/dumbbell-seated-shoulder-press.gif","muscle":"shoulders","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"dumbbell-standing-overhead-press","name":"Dumbbell Standing Overhead Press","clip":"delts/dumbbell-standing-overhead-press.gif","muscle":"shoulders","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"dumbbell-arnold-press","name":"Dumbbell Arnold Press","clip":"delts/dumbbell-arnold-press.gif","muscle":"shoulders","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"dumbbell-push-press","name":"Dumbbell Push Press","clip":"delts/dumbbell-push-press.gif","muscle":"shoulders","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"dumbbell-lateral-raise","name":"Dumbbell Lateral Raise","clip":"delts/dumbbell-lateral-raise.gif","muscle":"shoulders","equipment":"dumbbell","type":"isolation","min":8,"max":12,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"cable-lateral-raise","name":"Cable Lateral Raise","clip":"delts/cable-lateral-raise.gif","muscle":"shoulders","equipment":"cable","type":"isolation","min":12,"max":15,"inc":2.5,"startWeight":7.5,"goalWeight":15},{"id":"cable-one-arm-lateral-raise","name":"Cable One Arm Lateral Raise","clip":"delts/cable-one-arm-lateral-raise.gif","muscle":"shoulders","equipment":"cable","type":"isolation","min":12,"max":15,"inc":2.5,"startWeight":7.5,"goalWeight":15},{"id":"dumbbell-front-raise","name":"Dumbbell Front Raise","clip":"delts/dumbbell-front-raise.gif","muscle":"shoulders","equipment":"dumbbell","type":"isolation","min":8,"max":12,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"dumbbell-rear-lateral-raise","name":"Dumbbell Rear Lateral Raise","clip":"delts/dumbbell-rear-lateral-raise.gif","muscle":"shoulders","equipment":"dumbbell","type":"isolation","min":8,"max":12,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"dumbbell-reverse-fly","name":"Dumbbell Reverse Fly","clip":"delts/dumbbell-reverse-fly.gif","muscle":"shoulders","equipment":"dumbbell","type":"isolation","min":8,"max":12,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"cable-standing-rear-delt-row-with-rope","name":"Cable Standing Rear Delt Row With Rope","clip":"delts/cable-standing-rear-delt-row-with-rope.gif","muscle":"shoulders","equipment":"cable","type":"compound","min":12,"max":15,"inc":2.5,"startWeight":7.5,"goalWeight":15},{"id":"cable-cross-over-revers-fly","name":"Cable Cross Over Revers Fly","clip":"delts/cable-cross-over-revers-fly.gif","muscle":"shoulders","equipment":"cable","type":"isolation","min":12,"max":15,"inc":2.5,"startWeight":7.5,"goalWeight":15},{"id":"lever-shoulder-press","name":"Lever Shoulder Press","clip":"delts/lever-shoulder-press.gif","muscle":"shoulders","equipment":"machine","type":"compound","min":10,"max":12,"inc":5,"startWeight":25,"goalWeight":45},{"id":"lever-seated-reverse-fly","name":"Lever Seated Reverse Fly","clip":"delts/lever-seated-reverse-fly.gif","muscle":"shoulders","equipment":"machine","type":"isolation","min":10,"max":12,"inc":5,"startWeight":25,"goalWeight":45},{"id":"barbell-upright-row","name":"Barbell Upright Row","clip":"delts/barbell-upright-row.gif","muscle":"shoulders","equipment":"barbell","type":"compound","min":6,"max":10,"inc":2.5,"startWeight":25,"goalWeight":42.5},{"id":"dumbbell-upright-row","name":"Dumbbell Upright Row","clip":"delts/dumbbell-upright-row.gif","muscle":"shoulders","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"dumbbell-standing-biceps-curl","name":"Dumbbell Standing Biceps Curl","clip":"biceps/dumbbell-standing-biceps-curl.gif","muscle":"biceps","equipment":"dumbbell","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":17.5},{"id":"dumbbell-biceps-curl","name":"Dumbbell Biceps Curl","clip":"biceps/dumbbell-biceps-curl.gif","muscle":"biceps","equipment":"dumbbell","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":17.5},{"id":"dumbbell-hammer-curl","name":"Dumbbell Hammer Curl","clip":"biceps/dumbbell-hammer-curl.gif","muscle":"biceps","equipment":"dumbbell","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":17.5},{"id":"dumbbell-cross-body-hammer-curl","name":"Dumbbell Cross Body Hammer Curl","clip":"biceps/dumbbell-cross-body-hammer-curl.gif","muscle":"biceps","equipment":"dumbbell","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":17.5},{"id":"dumbbell-incline-curl","name":"Dumbbell Incline Curl","clip":"biceps/dumbbell-incline-curl.gif","muscle":"biceps","equipment":"dumbbell","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":17.5},{"id":"dumbbell-concentration-curl","name":"Dumbbell Concentration Curl","clip":"biceps/dumbbell-concentration-curl.gif","muscle":"biceps","equipment":"dumbbell","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":17.5},{"id":"dumbbell-preacher-curl","name":"Dumbbell Preacher Curl","clip":"biceps/dumbbell-preacher-curl.gif","muscle":"biceps","equipment":"dumbbell","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":17.5},{"id":"dumbbell-zottman-curl","name":"Dumbbell Zottman Curl","clip":"biceps/dumbbell-zottman-curl.gif","muscle":"biceps","equipment":"dumbbell","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":17.5},{"id":"barbell-curl","name":"Barbell Curl","clip":"biceps/barbell-curl.gif","muscle":"biceps","equipment":"barbell","type":"isolation","min":8,"max":12,"inc":2.5,"startWeight":15,"goalWeight":27.5},{"id":"ez-barbell-curl","name":"EZ Barbell Curl","clip":"biceps/ez-barbell-curl.gif","muscle":"biceps","equipment":"barbell","type":"isolation","min":8,"max":12,"inc":2.5,"startWeight":15,"goalWeight":27.5},{"id":"barbell-preacher-curl","name":"Barbell Preacher Curl","clip":"biceps/barbell-preacher-curl.gif","muscle":"biceps","equipment":"barbell","type":"isolation","min":8,"max":12,"inc":2.5,"startWeight":15,"goalWeight":27.5},{"id":"cable-curl","name":"Cable Curl","clip":"biceps/cable-curl.gif","muscle":"biceps","equipment":"cable","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":12.5,"goalWeight":25},{"id":"cable-hammer-curl-with-rope","name":"Cable Hammer Curl With Rope","clip":"biceps/cable-hammer-curl-with-rope.gif","muscle":"biceps","equipment":"cable","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":12.5,"goalWeight":25},{"id":"cable-one-arm-curl","name":"Cable One Arm Curl","clip":"biceps/cable-one-arm-curl.gif","muscle":"biceps","equipment":"cable","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":12.5,"goalWeight":25},{"id":"lever-preacher-curl","name":"Lever Preacher Curl","clip":"biceps/lever-preacher-curl.gif","muscle":"biceps","equipment":"machine","type":"isolation","min":10,"max":12,"inc":5,"startWeight":20,"goalWeight":35},{"id":"lever-bicep-curl","name":"Lever Bicep Curl","clip":"biceps/lever-bicep-curl.gif","muscle":"biceps","equipment":"machine","type":"isolation","min":10,"max":12,"inc":5,"startWeight":20,"goalWeight":35},{"id":"cable-triceps-pushdown-v-bar","name":"Cable Triceps Pushdown V Bar","clip":"triceps/cable-triceps-pushdown-v-bar.gif","muscle":"triceps","equipment":"cable","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":15,"goalWeight":32.5},{"id":"cable-pushdown-with-rope-attachment","name":"Cable Pushdown With Rope Attachment","clip":"triceps/cable-pushdown-with-rope-attachment.gif","muscle":"triceps","equipment":"cable","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":15,"goalWeight":32.5},{"id":"cable-overhead-triceps-extension-rope-attachment","name":"Cable Overhead Triceps Extension Rope Attachment","clip":"triceps/cable-overhead-triceps-extension-rope-attachment.gif","muscle":"triceps","equipment":"cable","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":15,"goalWeight":32.5},{"id":"cable-one-arm-tricep-pushdown","name":"Cable One Arm Tricep Pushdown","clip":"triceps/cable-one-arm-tricep-pushdown.gif","muscle":"triceps","equipment":"cable","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":15,"goalWeight":32.5},{"id":"cable-kickback","name":"Cable Kickback","clip":"triceps/cable-kickback.gif","muscle":"triceps","equipment":"cable","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":15,"goalWeight":32.5},{"id":"dumbbell-standing-triceps-extension","name":"Dumbbell Standing Triceps Extension","clip":"triceps/dumbbell-standing-triceps-extension.gif","muscle":"triceps","equipment":"dumbbell","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"dumbbell-seated-triceps-extension","name":"Dumbbell Seated Triceps Extension","clip":"triceps/dumbbell-seated-triceps-extension.gif","muscle":"triceps","equipment":"dumbbell","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"dumbbell-lying-triceps-extension","name":"Dumbbell Lying Triceps Extension","clip":"triceps/dumbbell-lying-triceps-extension.gif","muscle":"triceps","equipment":"dumbbell","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"dumbbell-kickback","name":"Dumbbell Kickback","clip":"triceps/dumbbell-kickback.gif","muscle":"triceps","equipment":"dumbbell","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"barbell-lying-triceps-extension-skull-crusher","name":"Barbell Lying Triceps Extension Skull Crusher","clip":"triceps/barbell-lying-triceps-extension-skull-crusher.gif","muscle":"triceps","equipment":"barbell","type":"isolation","min":8,"max":12,"inc":2.5,"startWeight":15,"goalWeight":30},{"id":"barbell-close-grip-bench-press","name":"Barbell Close Grip Bench Press","clip":"triceps/barbell-close-grip-bench-press.gif","muscle":"triceps","equipment":"barbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":15,"goalWeight":30},{"id":"ez-bar-standing-french-press","name":"EZ Bar Standing French Press","clip":"triceps/ez-bar-standing-french-press.gif","muscle":"triceps","equipment":"barbell","type":"isolation","min":8,"max":12,"inc":2.5,"startWeight":15,"goalWeight":30},{"id":"lever-triceps-extension","name":"Lever Triceps Extension","clip":"triceps/lever-triceps-extension.gif","muscle":"triceps","equipment":"machine","type":"isolation","min":10,"max":12,"inc":5,"startWeight":25,"goalWeight":45},{"id":"lever-seated-dip","name":"Lever Seated Dip","clip":"triceps/lever-seated-dip.gif","muscle":"triceps","equipment":"machine","type":"compound","min":10,"max":12,"inc":5,"startWeight":25,"goalWeight":45},{"id":"triceps-dip","name":"Triceps Dip","clip":"triceps/triceps-dip.gif","muscle":"triceps","equipment":"bodyweight","type":"compound","min":6,"max":12,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"bench-dip-knees-bent","name":"Bench Dip Knees Bent","clip":"triceps/bench-dip-knees-bent.gif","muscle":"triceps","equipment":"bodyweight","type":"compound","min":6,"max":12,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"diamond-push-up","name":"Diamond Push Up","clip":"triceps/diamond-push-up.gif","muscle":"triceps","equipment":"bodyweight","type":"compound","min":6,"max":12,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"dumbbell-seated-palms-up-wrist-curl","name":"Dumbbell Seated Palms Up Wrist Curl","clip":"forearms/dumbbell-seated-palms-up-wrist-curl.gif","muscle":"forearms","equipment":"dumbbell","type":"isolation","min":12,"max":20,"inc":2.5,"startWeight":7.5,"goalWeight":15},{"id":"dumbbell-reverse-wrist-curl","name":"Dumbbell Reverse Wrist Curl","clip":"forearms/dumbbell-reverse-wrist-curl.gif","muscle":"forearms","equipment":"dumbbell","type":"isolation","min":12,"max":20,"inc":2.5,"startWeight":7.5,"goalWeight":15},{"id":"dumbbell-over-bench-wrist-curl","name":"Dumbbell Over Bench Wrist Curl","clip":"forearms/dumbbell-over-bench-wrist-curl.gif","muscle":"forearms","equipment":"dumbbell","type":"isolation","min":12,"max":20,"inc":2.5,"startWeight":7.5,"goalWeight":15},{"id":"barbell-wrist-curl","name":"Barbell Wrist Curl","clip":"forearms/barbell-wrist-curl.gif","muscle":"forearms","equipment":"barbell","type":"isolation","min":12,"max":20,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"barbell-reverse-wrist-curl","name":"Barbell Reverse Wrist Curl","clip":"forearms/barbell-reverse-wrist-curl.gif","muscle":"forearms","equipment":"barbell","type":"isolation","min":12,"max":20,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"cable-wrist-curl","name":"Cable Wrist Curl","clip":"forearms/cable-wrist-curl.gif","muscle":"forearms","equipment":"cable","type":"isolation","min":12,"max":20,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"cable-reverse-wrist-curl","name":"Cable Reverse Wrist Curl","clip":"forearms/cable-reverse-wrist-curl.gif","muscle":"forearms","equipment":"cable","type":"isolation","min":12,"max":20,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"finger-curls","name":"Finger Curls","clip":"forearms/finger-curls.gif","muscle":"forearms","equipment":"bodyweight","type":"isolation","min":6,"max":12,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"wrist-rollerer","name":"Wrist Rollerer","clip":"forearms/wrist-rollerer.gif","muscle":"forearms","equipment":"bodyweight","type":"isolation","min":6,"max":12,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"barbell-reverse-curl","name":"Barbell Reverse Curl","clip":"biceps/barbell-reverse-curl.gif","muscle":"forearms","equipment":"barbell","type":"isolation","min":12,"max":20,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"dumbbell-standing-reverse-curl","name":"Dumbbell Standing Reverse Curl","clip":"biceps/dumbbell-standing-reverse-curl.gif","muscle":"forearms","equipment":"dumbbell","type":"isolation","min":12,"max":20,"inc":2.5,"startWeight":7.5,"goalWeight":15},{"id":"cable-reverse-curl","name":"Cable Reverse Curl","clip":"biceps/cable-reverse-curl.gif","muscle":"forearms","equipment":"cable","type":"isolation","min":12,"max":20,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"hanging-leg-raise","name":"Hanging Leg Raise","clip":"abs/hanging-leg-raise.gif","muscle":"core","equipment":"bodyweight","type":"isolation","min":8,"max":15,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"hanging-straight-leg-raise","name":"Hanging Straight Leg Raise","clip":"abs/hanging-straight-leg-raise.gif","muscle":"core","equipment":"bodyweight","type":"isolation","min":8,"max":15,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"assisted-hanging-knee-raise","name":"Assisted Hanging Knee Raise","clip":"abs/assisted-hanging-knee-raise.gif","muscle":"core","equipment":"bodyweight","type":"isolation","min":8,"max":15,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"captains-chair-straight-leg-raise","name":"Captains Chair Straight Leg Raise","clip":"abs/captains-chair-straight-leg-raise.gif","muscle":"core","equipment":"bodyweight","type":"isolation","min":8,"max":15,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"lying-leg-raise-flat-bench","name":"Lying Leg Raise Flat Bench","clip":"abs/lying-leg-raise-flat-bench.gif","muscle":"core","equipment":"bodyweight","type":"isolation","min":8,"max":15,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"crunch-floor","name":"Crunch Floor","clip":"abs/crunch-floor.gif","muscle":"core","equipment":"bodyweight","type":"isolation","min":8,"max":15,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"decline-crunch","name":"Decline Crunch","clip":"abs/decline-crunch.gif","muscle":"core","equipment":"bodyweight","type":"isolation","min":8,"max":15,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"weighted-crunch","name":"Weighted Crunch","clip":"abs/weighted-crunch.gif","muscle":"core","equipment":"bodyweight","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"cable-kneeling-crunch","name":"Cable Kneeling Crunch","clip":"abs/cable-kneeling-crunch.gif","muscle":"core","equipment":"cable","type":"isolation","min":12,"max":15,"inc":2.5,"startWeight":15,"goalWeight":30},{"id":"cable-seated-crunch","name":"Cable Seated Crunch","clip":"abs/cable-seated-crunch.gif","muscle":"core","equipment":"cable","type":"isolation","min":12,"max":15,"inc":2.5,"startWeight":15,"goalWeight":30},{"id":"russian-twist","name":"Russian Twist","clip":"abs/russian-twist.gif","muscle":"core","equipment":"bodyweight","type":"isolation","min":8,"max":15,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"weighted-russian-twist","name":"Weighted Russian Twist","clip":"abs/weighted-russian-twist.gif","muscle":"core","equipment":"bodyweight","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":10,"goalWeight":20},{"id":"dead-bug","name":"Dead Bug","clip":"abs/dead-bug.gif","muscle":"core","equipment":"bodyweight","type":"isolation","min":8,"max":15,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"air-bike","name":"Air Bike","clip":"abs/air-bike.gif","muscle":"core","equipment":"bodyweight","type":"isolation","min":8,"max":15,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},{"id":"lever-seated-crunch","name":"Lever Seated Crunch","clip":"abs/lever-seated-crunch.gif","muscle":"core","equipment":"machine","type":"isolation","min":12,"max":15,"inc":5,"startWeight":25,"goalWeight":45},{"id":"wheel-rollerout","name":"Wheel Rollerout","clip":"abs/wheel-rollerout.gif","muscle":"core","equipment":"bodyweight","type":"isolation","min":8,"max":15,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"},
{"id":"barbell-back-squat","name":"Barbell Back Squat","clip":"glutes/barbell-full-squat.gif","muscle":"quads","equipment":"barbell","type":"compound","min":6,"max":10,"inc":2.5,"startWeight":40,"goalWeight":80},
{"id":"barbell-front-squat","name":"Barbell Front Squat","clip":"glutes/barbell-front-squat.gif","muscle":"quads","equipment":"barbell","type":"compound","min":6,"max":10,"inc":2.5,"startWeight":30,"goalWeight":60},
{"id":"dumbbell-goblet-squat","name":"Dumbbell Goblet Squat","clip":"quads/dumbbell-goblet-squat.gif","muscle":"quads","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":15,"goalWeight":30},
{"id":"sled-45-leg-press","name":"45° Leg Press","clip":"glutes/sled-45-leg-press.gif","muscle":"quads","equipment":"machine","type":"compound","min":8,"max":12,"inc":5,"startWeight":80,"goalWeight":160},
{"id":"sled-hack-squat","name":"Hack Squat Machine","clip":"glutes/sled-hack-squat.gif","muscle":"quads","equipment":"machine","type":"compound","min":8,"max":12,"inc":5,"startWeight":50,"goalWeight":100},
{"id":"smith-squat","name":"Smith Machine Squat","clip":"glutes/smith-squat.gif","muscle":"quads","equipment":"machine","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":30,"goalWeight":70},
{"id":"lever-leg-extension","name":"Leg Extension","clip":"quads/lever-leg-extension.gif","muscle":"quads","equipment":"machine","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":25,"goalWeight":50},
{"id":"barbell-lunge","name":"Barbell Lunge","clip":"glutes/barbell-lunge.gif","muscle":"quads","equipment":"barbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":20,"goalWeight":40},
{"id":"dumbbell-lunge","name":"Dumbbell Lunge","clip":"glutes/dumbbell-lunge.gif","muscle":"quads","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":10,"goalWeight":22.5},
{"id":"barbell-split-squat","name":"Barbell Split Squat","clip":"quads/barbell-split-squat-v-2.gif","muscle":"quads","equipment":"barbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":20,"goalWeight":40},
{"id":"dumbbell-step-up","name":"Dumbbell Step Up","clip":"glutes/dumbbell-step-up.gif","muscle":"quads","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":10,"goalWeight":22.5},
{"id":"barbell-romanian-deadlift","name":"Barbell Romanian Deadlift","clip":"glutes/barbell-romanian-deadlift.gif","muscle":"hamstrings","equipment":"barbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":40,"goalWeight":80},
{"id":"dumbbell-romanian-deadlift","name":"Dumbbell Romanian Deadlift","clip":"glutes/dumbbell-romanian-deadlift.gif","muscle":"hamstrings","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":17.5,"goalWeight":35},
{"id":"lever-lying-leg-curl","name":"Lying Leg Curl","clip":"hamstrings/lever-lying-leg-curl.gif","muscle":"hamstrings","equipment":"machine","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":20,"goalWeight":40},
{"id":"lever-kneeling-leg-curl","name":"Kneeling Leg Curl","clip":"hamstrings/lever-kneeling-leg-curl.gif","muscle":"hamstrings","equipment":"machine","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":15,"goalWeight":32.5},
{"id":"barbell-good-morning","name":"Barbell Good Morning","clip":"hamstrings/barbell-good-morning.gif","muscle":"hamstrings","equipment":"barbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":25,"goalWeight":45},
{"id":"dumbbell-stiff-leg-deadlift","name":"Dumbbell Stiff Leg Deadlift","clip":"glutes/dumbbell-stiff-leg-deadlift.gif","muscle":"hamstrings","equipment":"dumbbell","type":"compound","min":8,"max":12,"inc":2.5,"startWeight":15,"goalWeight":30},
{"id":"barbell-deadlift","name":"Barbell Deadlift","clip":"glutes/barbell-deadlift.gif","muscle":"glutes","equipment":"barbell","type":"compound","min":5,"max":8,"inc":5,"startWeight":60,"goalWeight":120},
{"id":"barbell-sumo-deadlift","name":"Barbell Sumo Deadlift","clip":"glutes/barbell-sumo-deadlift.gif","muscle":"glutes","equipment":"barbell","type":"compound","min":5,"max":8,"inc":5,"startWeight":60,"goalWeight":110},
{"id":"barbell-glute-bridge","name":"Barbell Glute Bridge","clip":"glutes/barbell-glute-bridge.gif","muscle":"glutes","equipment":"barbell","type":"compound","min":8,"max":12,"inc":5,"startWeight":40,"goalWeight":90},
{"id":"cable-pull-through","name":"Cable Pull Through","clip":"glutes/cable-pull-through-with-rope.gif","muscle":"glutes","equipment":"cable","type":"isolation","min":12,"max":15,"inc":2.5,"startWeight":20,"goalWeight":40},
{"id":"barbell-standing-calf-raise","name":"Barbell Standing Calf Raise","clip":"calves/barbell-standing-calf-raise.gif","muscle":"calves","equipment":"barbell","type":"isolation","min":10,"max":15,"inc":2.5,"startWeight":40,"goalWeight":80},
{"id":"dumbbell-standing-calf-raise","name":"Dumbbell Standing Calf Raise","clip":"calves/dumbbell-standing-calf-raise.gif","muscle":"calves","equipment":"dumbbell","type":"isolation","min":12,"max":20,"inc":2.5,"startWeight":15,"goalWeight":30},
{"id":"lever-seated-calf-raise","name":"Seated Calf Raise Machine","clip":"calves/lever-seated-calf-raise.gif","muscle":"calves","equipment":"machine","type":"isolation","min":12,"max":20,"inc":2.5,"startWeight":30,"goalWeight":60},
{"id":"sled-calf-press","name":"Calf Press On Leg Press","clip":"calves/sled-calf-press-on-leg-press.gif","muscle":"calves","equipment":"machine","type":"isolation","min":12,"max":20,"inc":5,"startWeight":60,"goalWeight":120},
{"id":"bodyweight-calf-raise","name":"Bodyweight Calf Raise","clip":"calves/bodyweight-standing-calf-raise.gif","muscle":"calves","equipment":"bodyweight","type":"isolation","min":15,"max":25,"inc":1,"startWeight":0,"goalWeight":0,"scoreMode":"reps"}];

/* Coaching content, keyed by bank id. Anything absent falls back to the short
   cue list on the exercise itself, so a missing entry degrades rather than
   breaks. Populated in COACHING_DATA below. */
const COACHING = {};

/* Curated same-stimulus alternatives, keyed by bank id. When an id is missing,
   alternativesFor() derives a set from the bank instead. */
const ALTERNATIVES = {};

Object.assign(COACHING, {"barbell-bench-press":{"setup":["Lie with eyes under the bar, feet flat, and five points supported: head, upper back, both feet and pelvis.","Grip just outside shoulder width with the thumb wrapped around the bar and the wrist stacked over the forearm.","Pull the shoulder blades down and together; create a small natural arch without lifting the pelvis."],"execute":["Unrack with straight arms and move the bar over the shoulder joint.","Lower towards the lower chest with elbows roughly 45-70 degrees from the torso.","Touch lightly or stop just above the chest, then press the bar back over the shoulders.","Use a controlled 2-second descent and do not bounce."],"grow":["Keep the upper back fixed so the chest, not the front shoulder, does most of the work.","Use the deepest pain-free position that keeps the forearms near vertical.","Add reps first; add 2.5 kg when every set reaches the top of the range with the same technique."],"mistakes":["Flared elbows turn the lift into a shoulder-dominant press; tuck them slightly.","A loose shoulder blade makes the bar path unstable; pin the upper back before unracking.","Bouncing off the chest removes control; pause briefly or reverse smoothly."],"demo":"Filmed from high behind the head, which hides the two things that decide a bench press: where the bar touches your chest and how far your elbows flare. Do not try to copy the bar path from this angle — set the touch point yourself, just below the nipple line, and keep the forearms vertical at the bottom. The clip also never pauses on the chest; it shows a continuous rep."},"dumbbell-bench-press":{"setup":["Set the bench flat and place the dumbbells on your thighs before lying back.","Use a neutral-to-pronated grip with wrists directly above the elbows.","Plant both feet and pull the shoulder blades down into the bench."],"execute":["Kick the dumbbells into position as you lie back, then start over the chest.","Lower until the upper arms are slightly below the torso if the shoulders remain comfortable.","Press up and slightly in without banging the dumbbells together.","Lower for about 2 seconds and keep both arms moving evenly."],"grow":["The loaded bottom position is the main chest stimulus; do not shorten it to chase heavier dumbbells.","Keep the ribcage and shoulder blades still while the upper arms move.","Add reps across all sets before moving to the next dumbbell pair."],"mistakes":["Letting the shoulders roll forward at the bottom reduces chest loading; keep the chest lifted.","Using a huge kick or dropping the dumbbells wastes the first part of the rep; control the setup.","Pressing with bent wrists leaks force; keep knuckles above forearms."]},"lever-chest-press":{"setup":["Adjust the seat so the handles start around mid-chest height.","Sit with your back and head against the pad and feet flat.","Grip firmly, keep wrists straight and draw the shoulder blades down."],"execute":["Press the handles forward until the elbows are almost straight.","Pause without locking aggressively, then let the handles return until the chest is stretched.","Keep the pelvis and upper back against the pad throughout."],"grow":["Use the machine's full pain-free range, especially the controlled return.","Do not turn the last reps into shoulder shrugging; keep the chest high.","Add one rep per set before increasing the machine pin."],"mistakes":["Seat too low places the handles near the neck; raise it until they meet the mid-chest.","Bouncing off the rear stop removes tension; reverse under control.","Shoulders leaving the pad means the range or load is excessive; reduce one."]},"cable-pulldown":{"setup":["Set the thigh pad firmly across the tops of the thighs and sit tall.","Use an overhand grip slightly wider than shoulder width.","Brace the abdomen and lean back only slightly."],"execute":["Start by pulling the shoulders down, then drive the elbows towards the ribs.","Bring the bar to the upper chest without swinging.","Let the arms straighten under control until the lats are lengthened.","Use a 2-second return and keep the torso angle nearly unchanged."],"grow":["The long-arm stretch at the top matters; do not stop when the elbows are still bent.","Think elbows down rather than hands down to keep the lats involved.","Add reps before increasing the stack."],"mistakes":["Leaning far back turns the lift into a row; keep only a small fixed lean.","Pulling behind the neck adds shoulder stress without a useful benefit; pull to the chest.","Shrugging at the bottom means the lats have lost position; depress the shoulders first."]},"cable-lateral-pulldown-with-v-bar":{"setup":["Lock the thighs under the pad and hold the V-bar with palms facing each other.","Sit tall with ribs down and a small fixed torso lean.","Allow the shoulders to rise slightly at the start without losing the brace."],"execute":["Pull the elbows down and slightly forward towards the sides of the torso.","Bring the handle to the upper chest, then pause briefly.","Return until the elbows straighten and the lats lengthen."],"grow":["The neutral grip lets many trainees reach a comfortable full stretch.","Keep the elbows moving down rather than pulling the handle with the biceps.","Progress by adding reps, then the smallest available stack increment."],"mistakes":["Curling the handle towards the body uses the arms first; initiate with shoulder depression.","Rocking backwards changes the exercise into a row; keep the torso fixed.","Cutting off the top half removes the stretched position; return farther."]},"lever-front-pulldown":{"setup":["Adjust the seat and thigh pad so the handles begin above the head.","Grip the handles with the prescribed neutral or pronated hand position.","Keep the chest against the pad or upright as the machine requires."],"execute":["Pull the elbows down towards the sides until the handles reach upper-chest level.","Pause with the shoulders down, then return slowly.","Allow a full overhead stretch without lifting the pelvis from the seat."],"grow":["Use the machine's longest comfortable range rather than shortening the top.","Keep the shoulder blades moving naturally but do not shrug through the whole rep.","Add reps before moving the pin."],"mistakes":["Pulling with bent wrists makes the grip the limiting factor; keep wrists straight.","Lifting the chest off the pad creates momentum; reduce load.","Stopping with half-bent elbows leaves the lats underloaded in the stretch."]},"dumbbell-incline-bench-press":{"setup":["Set the bench to roughly 30 degrees and place the dumbbells on your thighs.","Lie back with feet planted, shoulder blades pulled down and wrists stacked.","Start with the dumbbells above the upper chest, not over the face."],"execute":["Lower the dumbbells towards the upper chest with elbows slightly below the wrists.","Reach a deep pain-free stretch while keeping the shoulder heads from rolling forward.","Press up and slightly in, then repeat with a controlled descent."],"grow":["A modest incline gives upper-chest work without making the front delts dominant.","Keep the bottom controlled; the stretched position is where poor technique usually appears.","Add reps first, then increase each dumbbell by the smallest useful step."],"mistakes":["Using a steep bench turns the movement into an overhead press; lower the angle.","Letting the dumbbells drift towards the shoulders reduces chest loading; keep them over the upper chest.","Arching excessively to finish reps removes the intended incline position."]},"barbell-incline-bench-press":{"setup":["Set the bench to about 30 degrees and position the eyes just behind the bar.","Grip slightly outside shoulder width with thumbs wrapped and wrists stacked.","Set the feet firmly and pull the shoulder blades down into the bench."],"execute":["Unrack the bar over the upper chest.","Lower towards the upper chest with elbows moderately tucked.","Press back up without letting the bar drift towards the face.","Use a 2-second eccentric and stop the set when the bar path changes."],"grow":["Keep the incline modest so the clavicular chest receives the work.","Use a consistent touch point and full pain-free depth.","Add reps before load, using 2.5 kg increases."],"mistakes":["A high bench angle makes the lift mostly shoulder press; reduce it.","Flaring the elbows at the bottom irritates the shoulder; bring them slightly in.","Bouncing off the upper chest removes the controlled stretch."]},"lever-incline-chest-press":{"setup":["Adjust the seat so the handles begin just below shoulder level.","Keep the head, upper back and pelvis against the pad.","Use a grip that keeps the wrists above the elbows."],"execute":["Press the handles up and forwards without shrugging.","Lower until the upper chest is stretched and the elbows are behind the torso.","Pause briefly at the bottom, then press smoothly."],"grow":["Use the complete machine range while keeping the shoulder joint comfortable.","Keep the chest lifted instead of chasing lockout with the shoulders.","Add reps before moving the pin."],"mistakes":["Seat too high places the handles near the neck; lower it.","Shortening the return avoids the useful stretched position.","Arching off the pad turns the lift into a flatter press."]},"cable-one-arm-lateral-raise":{"setup":["Set the pulley at the lowest position and stand side-on with the working arm farthest from the stack.","Hold the handle across the body with a soft elbow and the cable passing behind the legs.","Brace the free hand on the machine and keep the ribs down."],"execute":["Sweep the arm out and slightly forward in the scapular plane.","Raise until the hand is around shoulder height, then lower slowly.","Keep the shoulder away from the ear and the torso still."],"grow":["The cable keeps tension near the bottom; do not rush the first half of the lift.","Use a modest load and chase a clean lateral-delt contraction.","Add reps before increasing the stack."],"mistakes":["Shrugging the shoulder takes tension from the lateral delt; keep the neck long.","Swinging the torso makes the load momentum-driven; brace harder.","Raising far above shoulder height is unnecessary if it causes pain."]},"cable-lateral-raise":{"setup":["Set the pulley low and stand facing slightly away from it.","Hold the handle with the cable crossing in front of the body.","Use a soft elbow and plant the feet shoulder width apart."],"execute":["Lift the arm out and slightly forward until the hand reaches shoulder height.","Pause briefly, then lower for 2 seconds.","Keep the wrist neutral and the torso motionless."],"grow":["Keep tension on the delt through the bottom instead of resting on the stack.","Use the largest pain-free arc you can control.","Add reps before load."],"mistakes":["Turning it into a front raise moves the arm straight ahead; use the side-forward arc.","Bent elbows shorten the lever and make the load easier; keep the elbow softly extended.","Body swing hides failure; reduce the weight."]},"dumbbell-lateral-raise":{"setup":["Stand tall with dumbbells at the sides, palms facing the thighs and elbows softly bent.","Brace the abdomen and keep the ribs stacked over the pelvis.","Use light dumbbells that can be controlled without momentum."],"execute":["Raise both arms out and slightly forward until the hands reach shoulder height.","Pause briefly, then lower for 2-3 seconds.","Keep the wrists level with or slightly below the elbows."],"grow":["The lateral delt responds to controlled shoulder abduction, not heavy swinging.","Keep the bottom under control even though the dumbbell has little tension there.","Add reps before increasing weight."],"mistakes":["Shrugging makes the upper traps dominant; lower the load and keep the shoulders down.","Leaning back turns it into a partial front raise; stand against a stable ribcage.","Using a bent elbow shortens the lever; maintain the same soft bend."]},"cable-pushdown-with-rope-attachment":{"setup":["Set the pulley high and hold both rope ends with thumbs around the rope.","Stand with one foot slightly forward, ribs down and elbows close to the sides.","Start with the hands near the lower chest and the elbows bent."],"execute":["Drive the hands down by extending the elbows.","At the bottom, separate the rope ends slightly without rolling the shoulders forward.","Return until the triceps are stretched while the elbows stay near the ribs."],"grow":["Use a full stretch and a hard lockout without leaning over the rope.","Keep the upper arm fixed so the triceps, not the shoulder, moves the forearm.","Add reps before moving the stack."],"mistakes":["Elbows drifting forwards turns it into a press; pin the upper arms.","Using bodyweight to push the rope down hides triceps fatigue; reduce the load.","Cutting off the top removes the lengthened position."]},"cable-triceps-pushdown-v-bar":{"setup":["Attach the V-bar high and grip it with palms facing each other.","Stand tall with a small split stance and elbows tucked.","Keep the wrists straight and the shoulders relaxed."],"execute":["Extend the elbows until the arms are nearly straight.","Pause at the bottom, then return the handle until the forearms approach the upper arms.","Keep the torso fixed throughout."],"grow":["Use the full elbow-flexion range without letting the elbows travel.","The final third of the press gives a strong shortened-position contraction.","Progress with reps, then the smallest stack increase."],"mistakes":["Leaning over the bar uses bodyweight; stand upright.","Flaring the elbows reduces triceps leverage; keep them beside the ribs.","Bending the wrists changes the line of force; keep them stacked."]},"cable-one-arm-tricep-pushdown":{"setup":["Set the pulley high and take a single handle with a neutral grip.","Stand square or slightly staggered with the working elbow beside the ribcage.","Use the free hand on the machine for balance."],"execute":["Extend the elbow until the arm is straight without twisting the torso.","Squeeze the triceps, then return slowly to a full comfortable bend.","Complete one side before matching it on the other."],"grow":["The single-arm setup exposes side-to-side differences and permits a clean lockout.","Keep the shoulder still and load the full elbow range.","Add reps equally on both sides before increasing load."],"mistakes":["Rotating away from the stack creates momentum; keep the ribs facing forward.","Letting the elbow move behind the body changes the line; keep it beside the torso.","Using a heavy handle forces wrist deviation; lower the load."]},"cable-curl":{"setup":["Set the pulley low and hold the bar or handle with palms up.","Stand tall with elbows close to the sides and wrists straight.","Brace the abdomen so the upper arm can remain still."],"execute":["Curl by bending the elbows while keeping the upper arms fixed.","Squeeze near the top without bringing the elbows forwards.","Lower until the elbows are almost straight and the biceps are stretched."],"grow":["The cable keeps tension through the bottom; do not rush the return.","Supinate hard enough to keep the palms facing up through the rep.","Add reps before increasing the stack."],"mistakes":["Swinging the torso makes the load momentum-driven; use a lighter weight.","Shoulders rolling forwards shorten the biceps; keep the chest quiet.","Stopping short of elbow extension removes the useful stretch."]},"dumbbell-standing-biceps-curl":{"setup":["Stand with feet hip width apart, dumbbells at the sides and palms facing forwards.","Keep the upper arms beside the torso and wrists straight.","Brace the abdomen and keep the shoulders down."],"execute":["Curl one or both dumbbells by bending the elbows.","Keep the palm supinated and stop when the forearm meets the upper arm without moving the shoulder.","Lower for 2 seconds to near full elbow extension."],"grow":["The bottom half provides the loaded biceps stretch; keep it controlled.","Do not lean back to finish a rep.","Add reps before moving up in dumbbell weight."],"mistakes":["Elbows drifting forwards reduce the biceps' shoulder contribution; keep them behind the dumbbell.","Wrist extension wastes force; keep the knuckles in line with the forearm.","Alternating with torso rotation creates uneven work; face forwards."]},"ez-barbell-curl":{"setup":["Stand with feet stable and grip the angled sections of the EZ bar with palms up.","Keep elbows just in front of the ribs and wrists neutral.","Brace the abdomen and avoid leaning backwards."],"execute":["Curl the bar towards the upper chest without moving the upper arms.","Squeeze briefly, then lower until the elbows are nearly straight.","Use a controlled 2-second eccentric."],"grow":["The EZ grip often allows a comfortable supinated position while loading the biceps heavily.","Keep the bottom range rather than chasing a heavier partial.","Add reps across all sets before adding the smallest plate increment."],"mistakes":["Hip drive turns the curl into a swing; lower the load.","Letting the elbows shoot forwards shortens the biceps; keep them still.","Bending the wrists back causes forearm discomfort; keep them neutral."]},"dumbbell-incline-row":{"setup":["Set an incline bench around 30-45 degrees and lie chest-down with feet planted.","Let the dumbbells hang below the shoulders with a neutral or slightly pronated grip.","Keep the forehead or chest supported and ribs against the pad."],"execute":["Pull the elbows back and slightly out until the handles reach the lower ribs.","Pause with the shoulder blades moving towards the spine.","Lower until the arms are long and the upper back is stretched."],"grow":["The support removes cheating so the back can be loaded through a repeatable range.","Use the bottom stretch without letting the shoulders dump forwards violently.","Add reps before increasing the dumbbells."],"mistakes":["Shrugging towards the ears shifts work to the upper traps; keep the neck long.","Bouncing the chest off the pad creates momentum; keep contact.","Pulling only with the hands limits the back; drive the elbows."]},"cable-seated-row":{"setup":["Sit with feet on the platform, knees softly bent and the spine tall.","Hold the handle with a neutral or overhand grip.","Brace the abdomen and begin with straight arms and shoulders reaching forwards."],"execute":["Pull the elbows behind the torso while keeping the chest lifted.","Bring the handle towards the lower ribs and pause.","Return until the arms are straight and the shoulder blades reach forwards under control."],"grow":["The controlled forward reach loads the back in a lengthened position.","Use the same torso angle every rep so load progression remains honest.","Add reps before increasing the stack."],"mistakes":["Rocking backwards turns the row into a swing; use a smaller load.","Rounding the lower back under load loses the brace; keep the pelvis neutral.","Pulling the handle to the stomach with shrugged shoulders reduces lat and mid-back quality."]},"lever-seated-row":{"setup":["Adjust the seat so the handles begin with the arms almost straight.","Place the chest against the pad and feet firmly on the floor or platform.","Grip the handles with wrists straight and shoulders reaching slightly forwards."],"execute":["Pull the handles towards the lower ribs by driving the elbows back.","Pause with the chest on the pad, then return slowly to the stretched position.","Keep the head and pelvis still."],"grow":["The pad lets you use a stable back range without lower-back fatigue.","Reach forwards under control rather than stopping when the arms are half-bent.","Add reps before moving the pin."],"mistakes":["Shrugging at the top means the shoulders are doing the movement; depress them first.","Bouncing off the chest pad removes control; use a lighter pin.","Pulling with bent wrists makes grip the limiter; keep wrists straight."]},"lever-seated-reverse-fly":{"setup":["Set the seat so the handles are around shoulder height.","Sit facing the pad with chest supported and hands gripping the handles.","Keep a small bend in the elbows and shoulders relaxed."],"execute":["Move the arms out and back in a wide arc.","Stop when the upper arms are roughly level with the torso or slightly behind it.","Return slowly until the rear delts are stretched."],"grow":["Use the rear-delt range rather than squeezing the shoulder blades hard together.","Keep the load light enough that the arms, not the torso, control the arc.","Add reps before moving the pin."],"mistakes":["Turning it into a row by bending the elbows excessively shifts work to the back.","Shrugging raises the upper traps; keep the shoulders away from the ears.","Short partials remove the lengthened position; return farther."]},"cable-cross-over-revers-fly":{"setup":["Set both pulleys around shoulder height and stand between them.","Cross the cables and hold the opposite handle in each hand.","Use a soft knee bend, neutral wrists and a braced torso."],"execute":["Open the arms out and slightly back until the hands reach beside the shoulders.","Pause without thrusting the chest forwards.","Return under control until the rear delts are lengthened."],"grow":["The cables keep useful tension through more of the arc than dumbbells.","Think upper arms moving sideways, not hands pulling backwards.","Add reps before increasing both stacks."],"mistakes":["Bending the elbows into a row changes the joint action; keep the elbow angle almost fixed.","Leaning forwards creates momentum; stand tall.","Letting the cables pull the shoulders forwards violently loses control of the stretch."]},"dumbbell-reverse-fly":{"setup":["Hinge at the hips or sit on the end of a bench with the chest close to the thighs.","Hold light dumbbells below the shoulders with neutral wrists.","Keep the back flat and the elbows softly bent."],"execute":["Raise the arms out and slightly back until the upper arms are level with the torso.","Pause briefly, then lower slowly.","Keep the shoulder blades quiet enough that the rear delts move the arms."],"grow":["Light dumbbells are appropriate because the rear delts have a poor leverage position.","Use a long controlled bottom range rather than swinging through the top.","Add reps before load."],"mistakes":["Jerking the torso turns the lift into momentum; brace and reduce weight.","Shrugging makes the upper traps dominant; keep the neck relaxed.","Straightening the elbows excessively increases joint stress; keep a soft bend."]},"cable-overhead-triceps-extension-rope-attachment":{"setup":["Set the pulley low, face away from the stack and hold the rope behind the head.","Stagger the feet and brace the abdomen so the ribs do not flare.","Point the elbows forwards and keep them close enough to control."],"execute":["Extend the elbows until the hands reach above and slightly forwards.","Pause at lockout, then lower the rope behind the head.","Allow the upper arm to stay angled overhead while the forearm moves."],"grow":["This position loads the long head in a lengthened shoulder-flexed position.","Use a deep pain-free bend behind the head rather than a short press.","Add reps before increasing the stack."],"mistakes":["Flaring the ribs turns the lift into a backbend; brace and lower the load.","Elbows drifting wide removes control; point them forwards.","Moving the shoulder instead of the elbow changes the exercise; keep the upper arm fixed."]},"dumbbell-seated-triceps-extension":{"setup":["Sit upright on a bench with feet flat and hold one dumbbell by the inner plate with both hands.","Start with the dumbbell overhead and elbows pointing forwards.","Brace the ribs down and keep the upper arms close to the head."],"execute":["Lower the dumbbell behind the head by bending the elbows.","Stop at the deepest pain-free stretch, then extend the elbows back overhead.","Keep the upper arms mostly still."],"grow":["The overhead position lengthens the triceps long head.","Use a controlled 2-3 second descent; the bottom is more important than a violent lockout.","Add reps before increasing the dumbbell."],"mistakes":["Elbows flaring widely reduces the target's leverage; bring them forwards.","Rib flare creates a back arch; keep the abdomen tight.","Dropping too low when the shoulder hurts is not productive; shorten the pain-free range."]},"lever-triceps-extension":{"setup":["Adjust the seat so the machine pivot aligns with the elbow joint.","Set the upper-arm pad firmly and grip the handles with straight wrists.","Keep the chest and upper arms against the pad."],"execute":["Extend the elbows until the arms are nearly straight.","Pause, then return until the triceps are stretched.","Keep the upper arms fixed against the pad."],"grow":["The pad prevents shoulder movement and makes elbow extension the limiting action.","Use the complete pain-free range at a controlled speed.","Add reps before moving the pin."],"mistakes":["Lifting the upper arms off the pad changes the resistance profile; reduce the load.","Bending the wrists makes the handle unstable; keep them straight.","Bouncing at the bottom removes the stretch; reverse smoothly."]},"dumbbell-incline-curl":{"setup":["Set the bench around 45 degrees and sit back with dumbbells hanging beside the hips.","Keep the shoulders against the pad and palms facing forwards or slightly in.","Let the arms hang long without forcing the shoulder into pain."],"execute":["Curl by bending the elbows while keeping the upper arms behind the torso.","Squeeze near the top without lifting the shoulders.","Lower slowly to near full elbow extension."],"grow":["The shoulder-behind-the-body position loads the biceps in a long lengthened state.","Use a lighter load than for standing curls and keep the bottom controlled.","Add reps before increasing the dumbbells."],"mistakes":["Letting the shoulders roll forwards removes the intended stretch; keep them on the bench.","Shortening the bottom makes the exercise easier; reach near full extension.","Using momentum from the bench wastes the long-length stimulus."]},"cable-one-arm-curl":{"setup":["Set the pulley low and stand or kneel with one hand on the handle, palm up.","Keep the working elbow beside the torso and the wrist straight.","Brace the abdomen and keep the opposite side still."],"execute":["Curl the handle towards the shoulder without moving the upper arm.","Squeeze with the palm fully supinated.","Lower until the elbow is almost straight and the biceps is stretched."],"grow":["The cable keeps tension through the bottom and makes side-to-side loading easy to control.","Use a full elbow range with no torso rotation.","Add reps on the weaker side first, then match it."],"mistakes":["Rotating the body towards the stack creates momentum; square the hips.","Letting the elbow drift forwards shortens the biceps; keep it beside the ribs.","Wrist bending hides forearm weakness; keep the hand in line with the forearm."]},"lever-bicep-curl":{"setup":["Adjust the seat so the elbow joint lines up with the machine pivot.","Place the upper arms on the pad and grip the handles with palms up.","Keep the chest against the support and wrists straight."],"execute":["Curl the handles by bending the elbows until the forearms approach the upper arms.","Squeeze briefly, then lower under control.","Reach the machine's full comfortable elbow-extension position."],"grow":["The pad removes shoulder movement and makes the biceps do the work.","Control the bottom stretch instead of bouncing off the pad.","Add reps before moving the pin."],"mistakes":["Lifting the elbows off the pad turns it into a shoulder movement; lower the load.","Stopping well before extension removes the lengthened position.","Bending the wrists reduces force transfer; keep them neutral."]},"dumbbell-seated-palms-up-wrist-curl":{"setup":["Sit with forearms resting on the thighs or a bench, palms facing up and wrists just beyond the knees.","Hold light dumbbells with the fingers wrapped but not clenched.","Keep the elbows and forearms completely still."],"execute":["Let the dumbbells roll slightly towards the fingers at the bottom without losing control.","Curl the palms towards the forearms by flexing only the wrists.","Pause at the top, then lower slowly through the full range."],"grow":["The forearm flexors respond to repeated loaded wrist flexion and a controlled stretch.","Use small deliberate movements; the wrist range is short.","Add reps before increasing load, because grip fatigue rises quickly."],"mistakes":["Lifting the forearms turns it into a curl; pin them to the thighs.","Using a fist and no finger opening shortens the bottom; allow a controlled finger roll.","Dropping the dumbbells into wrist extension loses the stretch under control; slow the descent."],"demo":"The angle hides the part that matters. You cannot see the fingers opening at the bottom, which is where the stretch comes from. Let the dumbbell roll down to the fingertips under control, then close the hand and curl the wrist up. Judge this one by feel in the forearm, not by matching the picture."},"barbell-wrist-curl":{"setup":["Kneel or sit behind a bench with forearms supported and palms facing up.","Use a narrow-to-medium grip with the wrists just beyond the bench edge.","Keep the bar secure and the elbows fixed."],"execute":["Allow the fingers to open slightly as the wrists extend under control.","Curl the bar upwards by flexing the wrists, not the elbows.","Pause at the top and lower slowly."],"grow":["The bottom stretch and full wrist-flexion range provide the useful forearm work.","Use light weight because the wrist has a short lever and the exercise is easy to cheat.","Add reps before plates."],"mistakes":["Rolling the elbows or forearms off the bench turns it into a biceps movement; keep contact.","Bouncing at the bottom can strain the wrist; reverse smoothly.","Gripping maximally throughout prevents the finger-assisted bottom; loosen only slightly."]},"cable-wrist-curl":{"setup":["Set the pulley low and kneel or sit with forearms supported on a bench.","Hold the handle with palms up and wrists beyond the edge.","Keep the cable pulling directly through the hands and the elbows fixed."],"execute":["Allow the wrists to extend slowly against the cable.","Flex the wrists until the palms come towards the forearms.","Pause, then return through the full controlled range."],"grow":["The cable gives continuous tension through the short wrist range.","Use a slow return and do not let the stack slam.","Add reps before increasing the pin."],"mistakes":["Moving the forearms makes the load easier; anchor them.","Using a heavy stack forces wrist movement to stop early; reduce it.","Bending the elbows changes the exercise; keep the elbow angle fixed."]},"barbell-reverse-curl":{"setup":["Stand with feet hip width apart and grip the bar overhand, hands about shoulder width.","Keep wrists straight, elbows close to the ribs and shoulders down.","Brace the abdomen before lifting."],"execute":["Curl the bar by bending the elbows while keeping the overhand grip.","Raise until the forearms approach the upper arms without moving the shoulders.","Lower slowly to near full elbow extension."],"grow":["The pronated grip shifts work towards the brachioradialis and forearm extensors while still training the biceps.","Use a lighter load than a normal curl and control the bottom.","Add reps before adding weight."],"mistakes":["Swinging the bar with the hips removes forearm tension; lower the load.","Letting the wrists bend down changes the line of force; keep them straight.","Elbows drifting forwards shortens the working range; keep them beside the body."],"demo":"An accurate model. Copy it closely: the elbows stay pinned beside the ribs and do not swing forward as the bar rises. What it does not show is the bottom — lower until the arms are almost straight and pause there, rather than bouncing straight into the next rep."},"dumbbell-standing-reverse-curl":{"setup":["Stand tall with dumbbells at the sides and palms facing the thighs.","Keep elbows close to the torso and wrists straight.","Brace the abdomen and keep the shoulders relaxed."],"execute":["Curl the dumbbells with the palms staying down throughout.","Stop when the forearms approach the upper arms without lifting the shoulders.","Lower for 2 seconds to near full elbow extension."],"grow":["The overhand grip biases the brachioradialis and forearm extensors.","Use a strict short-range curl rather than chasing normal-curl loads.","Add reps before increasing either dumbbell."],"mistakes":["Rotating into a palms-up curl removes the intended grip; keep the knuckles facing up.","Leaning back creates momentum; stand tall and reduce weight.","Wrist extension makes the grip fail early; keep wrists aligned."]},"cable-reverse-curl":{"setup":["Set the pulley low and attach a straight bar or handle.","Grip overhand with elbows close to the sides and wrists straight.","Stand far enough away to keep cable tension at the bottom."],"execute":["Curl the handle while maintaining the pronated grip.","Squeeze near the top without moving the upper arms.","Lower under control until the elbows are nearly straight."],"grow":["Constant cable tension makes the forearm extensors work through the whole rep.","Keep the load modest and the wrist position fixed.","Add reps before increasing the stack."],"mistakes":["Supinating during the curl changes the target; keep the back of the hands up.","Pulling with the shoulders creates a shrug; keep them down.","Rocking away from the stack creates momentum; use a fixed stance."]},"cable-kneeling-crunch":{"setup":["Set the pulley high and kneel far enough away that the cable is taut.","Hold the rope beside the temples or lightly behind the head.","Keep the hips over the knees and brace the pelvis."],"execute":["Curl the ribs towards the pelvis by flexing the spine.","Keep the hips mostly still rather than sitting backwards.","Pause in the shortened position, then extend slowly until the abs are stretched."],"grow":["The abs shorten through spinal flexion; simply hinging at the hips is not enough.","Use a controlled stretch and add load only when the pelvis stays fixed.","Add reps before moving the stack."],"mistakes":["Pulling the rope with the arms makes it an upper-body movement; keep the hands only as anchors.","Sitting the hips back removes spinal flexion; keep the knees and hips planted.","Moving too quickly loses the loaded stretch."]},"weighted-crunch":{"setup":["Lie on a mat or bench with knees bent and feet planted.","Hold the plate or dumbbell against the chest with both hands.","Keep the lower back gently connected to the floor and chin slightly tucked."],"execute":["Curl the ribs towards the pelvis by lifting the upper back.","Stop when the shoulder blades leave the floor and the abs are fully shortened.","Lower slowly until the upper back returns to the floor."],"grow":["The useful movement is spinal flexion, not a full sit-up.","Hold the load against the chest and increase it only when the range stays consistent.","Add reps before load."],"mistakes":["Pulling the neck forwards does not train the abs; keep the head moving with the ribs.","Turning it into a sit-up uses the hip flexors; stop at shoulder-blade lift.","Letting the lower back arch reduces abdominal tension; brace before each rep."]},"lever-seated-crunch":{"setup":["Adjust the seat and chest pad so the pivot sits around the upper torso.","Place the feet firmly and hold the handles or pad as designed.","Start tall with the abdomen lengthened and hips fixed."],"execute":["Curl the ribcage down towards the pelvis against the pad.","Pause in the shortened position without lifting the hips.","Return slowly until the abs are stretched."],"grow":["Use spinal flexion through the machine's full comfortable range.","The controlled return is important because the abs are loaded while lengthening.","Add reps before moving the pin."],"mistakes":["Hinging at the hips instead of curling the spine reduces abdominal work; keep the pelvis still.","Pushing with the legs changes the movement; keep the feet passive.","Bouncing off the stretched position removes control."]},"sled-hack-squat":{"setup":["Set the shoulder pads so the back and pelvis remain against the sled.","Place feet around shoulder width with toes slightly out.","Brace the abdomen and unlock the safety handles before the first rep."],"execute":["Descend by bending the knees and hips until the thighs are at least near parallel if comfortable.","Keep the knees tracking over the toes and the heels planted.","Drive through the whole foot to stand without locking the knees violently."],"grow":["Use a deep controlled knee bend to load the quads, especially near the bottom.","Keep the pelvis against the pad; depth that causes butt-wink or pain is not useful.","Add reps before moving the sled."],"mistakes":["Knees collapsing inward reduces stability; track them over the second and third toes.","Heels lifting shifts force forwards; adjust foot position or depth.","Short quarter reps reduce quad stimulus; use a lighter load."],"demo":"The machine in the clip will not be the one in your gym; the pad angle and foot platform differ between models. Copy the depth and the flat back, not the machine. It bottoms out around parallel — for quad growth go deeper than the clip, as far as you can without the pelvis tucking under."},"sled-45-leg-press":{"setup":["Set the seat so the bottom position does not force the pelvis to roll under.","Place feet shoulder width apart in the middle of the platform.","Release the safety handles only after the back and pelvis are firmly supported."],"execute":["Lower the platform by bending the knees and hips under control.","Stop before the lower back or pelvis rounds off the pad.","Press through the whole foot until the knees are almost straight."],"grow":["Use a deep pain-free knee bend rather than adding load to shallow reps.","Keep the stance consistent so progression reflects stronger quads.","Add reps before increasing the plates."],"mistakes":["Letting the pelvis tuck at the bottom reduces control; shorten the range slightly.","Locking the knees aggressively transfers stress to the joint; stop just short.","Placing the feet too high shifts work away from the quads; use a moderate platform position."]},"barbell-back-squat":{"setup":["Place the bar across the upper back, not on the neck, and grip it evenly.","Set feet around shoulder width with toes slightly out.","Brace hard, unrack with both feet balanced and take only a few steps back."],"execute":["Sit down and slightly back while the knees travel in line with the toes.","Descend as far as the pelvis stays controlled and the heels stay down.","Drive up through the mid-foot while keeping the chest and hips rising together."],"grow":["Use a repeatable depth and controlled descent; deeper is useful only while position remains stable.","Keep the bar over the mid-foot throughout.","Add reps before load, using small increases while learning the movement."],"mistakes":["Knees collapsing inward reduces force transfer; push them out in line with the toes.","Heels lifting moves the centre of mass forwards; adjust stance and depth.","Bending forwards sharply out of the bottom means the load is too high or the brace is lost."]},"barbell-romanian-deadlift":{"setup":["Stand with feet hip width apart and hold the bar against the thighs.","Use a double-overhand grip, soft knees and a neutral spine.","Brace the abdomen and pull the shoulders down without shrugging."],"execute":["Push the hips backwards while keeping the bar close to the legs.","Lower until the hamstrings are strongly stretched and the back remains neutral.","Drive the hips forwards to stand tall without leaning backwards."],"grow":["The hamstrings grow from controlled hip flexion under load, not from touching the floor.","Keep the bar close and use a 2-3 second descent.","Add reps before load; stop the set when the lumbar position changes."],"mistakes":["Squatting the bar down reduces the hip hinge; keep the shins nearly vertical.","Letting the bar drift forwards increases back stress; drag it along the legs.","Hyperextending at the top does not add glute work; finish tall and neutral."],"demo":"A rear view, so you cannot see how close the bar stays to the legs — that is the whole exercise. Keep it in contact with your thighs and shins the entire way. The clip descends to a fixed depth; yours should stop where your hamstrings stop letting the hips travel back, which will be higher than this at first."},"dumbbell-romanian-deadlift":{"setup":["Stand with dumbbells against the front of the thighs and feet hip width apart.","Keep palms facing the legs, knees softly bent and ribs braced.","Set the shoulders down and back without over-arching."],"execute":["Push the hips back while the dumbbells travel close to the thighs and shins.","Descend until the hamstrings are fully stretched without rounding the back.","Drive the hips forwards to stand tall."],"grow":["Use the deepest controlled stretch available rather than chasing the floor.","Keep the dumbbells close so the hamstrings, not the lower back, control the rep.","Add reps before increasing each dumbbell."],"mistakes":["Bending the knees too much turns it into a squat; keep the shin angle mostly fixed.","Allowing the dumbbells to swing forwards reduces hamstring loading; keep them close.","Stopping when the dumbbells reach the knees wastes the lengthened range."]},"dumbbell-stiff-leg-deadlift":{"setup":["Stand with feet hip width apart and dumbbells hanging in front of the thighs.","Keep the knees only slightly bent and the spine neutral.","Brace the abdomen before pushing the hips back."],"execute":["Hinge at the hips while keeping the legs nearly straight but not locked.","Lower until the hamstrings reach a strong controlled stretch.","Return by squeezing the glutes and bringing the hips under the torso."],"grow":["The exercise uses a long hamstring position; the bottom range matters more than extra load.","Move slowly and stop before the back rounds.","Add reps before dumbbell weight."],"mistakes":["Locking the knees makes the movement uncomfortable; retain a small bend.","Rounding the back to reach lower is not extra hamstring range; stop earlier.","Raising the shoulders at the top adds no useful work; finish tall."]},"barbell-glute-bridge":{"setup":["Sit on the floor with the upper back against a bench and place the padded bar across the hips.","Set feet roughly hip width apart with shins near vertical at the top.","Brace the abdomen and tuck the chin slightly."],"execute":["Drive through the whole foot and extend the hips until the torso and thighs form a straight line.","Pause while squeezing the glutes without arching the lower back.","Lower under control until the hips approach the floor."],"grow":["The top contraction and controlled bottom provide the glute stimulus.","Keep the pelvis slightly tucked so the glutes, not lumbar extension, finish the rep.","Add reps before increasing the bar weight."],"mistakes":["Overarching at the top shifts work to the lower back; stop at a straight line.","Feet too far away turn the movement into a hamstring curl; bring them closer.","Bouncing off the floor removes tension; pause briefly at the bottom."]},"cable-pull-through":{"setup":["Set the pulley low and stand facing away with the rope passing between the legs.","Hold the rope ends beside the hips and take enough steps forward to create tension.","Use a soft knee bend and brace the abdomen."],"execute":["Hinge by pushing the hips backwards while the rope moves between the legs.","Drive the hips forwards until the glutes are contracted and the torso is upright.","Do not lean backwards at lockout."],"grow":["The glutes work through hip extension while the cable keeps tension in the hinge.","Reach a clear hamstring stretch at the back of the rep.","Add reps before increasing the stack."],"mistakes":["Squatting down bends the knees too much; push the hips backwards instead.","Rounding the spine loses the brace; keep the ribcage stacked.","Leaning backwards at the top is lumbar extension, not extra glute work."]},"barbell-sumo-deadlift":{"setup":["Take a wide stance with toes turned out and grip the bar inside the knees.","Set the hips low enough to keep the spine neutral, but not like a squat.","Brace, pull the slack out of the bar and keep the shoulders over it."],"execute":["Push the floor away and extend the knees and hips together.","Keep the bar close to the body as it passes the knees.","Stand tall by squeezing the glutes, then lower by sending the hips back."],"grow":["Use a controlled start and full hip extension rather than maximal loading.","The glutes work hard as the hips finish the rep; do not lean back.","Add reps before load while the start position remains identical."],"mistakes":["Knees collapsing inward reduces the wide-stance leverage; push them towards the toes.","Bar drifting forwards increases back demand; keep it close.","Jerking the bar from the floor loses brace; pull the slack out first."]},"lever-seated-calf-raise":{"setup":["Place the balls of the feet on the platform with heels hanging freely.","Set the knee pad firmly across the thighs and keep the knees bent.","Hold the handles and keep the ankles pointing straight."],"execute":["Lower the heels into a controlled stretch.","Drive through the balls of the feet and rise as high as possible.","Pause at the top, then lower for 2 seconds."],"grow":["The deep bottom stretch and full top contraction matter more than load.","Keep the movement at the ankle; do not bounce the knees.","Add reps before moving the pin."],"mistakes":["Bouncing out of the bottom removes control; pause or slow the descent.","Rolling the ankles outward changes foot pressure; keep the big toe and little toe connected.","Using partial reps hides calf fatigue; use the full pain-free range."]},"sled-calf-press":{"setup":["Place the balls of both feet low on the leg-press platform with heels free.","Keep the knees almost straight but not locked.","Set the sled safety position before loading the calves."],"execute":["Drop the heels slowly below the platform edge.","Press through the balls of the feet until the ankles are fully pointed.","Pause at the top and return under control."],"grow":["Use a long loaded stretch and a complete plantar-flexion contraction.","Keep the knees fixed so the ankle, not the leg press, moves.","Add reps before adding plates."],"mistakes":["Bending the knees turns the lift into a press; keep the knee angle fixed.","Short bouncing reps lose the bottom stretch; slow down.","Letting the feet slide changes the leverage; keep the balls of the feet planted."]},"dumbbell-standing-calf-raise":{"setup":["Hold dumbbells at the sides and stand with the balls of the feet on a stable raised edge if available.","Keep the knees softly unlocked and feet parallel.","Use one hand for balance if needed."],"execute":["Lower the heels below the forefoot under control.","Rise as high as possible by pointing the ankles.","Pause at the top and lower for 2 seconds."],"grow":["A full bottom stretch and top contraction are the main targets.","Keep the movement slow because the calf can tolerate easy bouncing.","Add reps before increasing the dumbbells."],"mistakes":["Bouncing through the bottom reduces the loaded stretch; pause briefly.","Rolling onto the outside of the feet shifts force; keep pressure through the big toe.","Bending and straightening the knees turns it into a leg movement; keep them fixed."]},"dumbbell-seated-shoulder-press":{"setup":["Set a bench upright or just short of vertical and sit with feet flat.","Start the dumbbells beside the shoulders with wrists stacked over elbows.","Keep the ribs down and upper back against the pad."],"execute":["Press the dumbbells overhead while keeping the forearms vertical.","Stop just before the shoulders shrug or the elbows lock aggressively.","Lower until the dumbbells reach a comfortable deep shoulder stretch."],"grow":["Use a stable seated position so the delts, not the legs, drive the press.","Keep the bottom range consistent and pain-free.","Add reps before increasing each dumbbell."],"mistakes":["Rib flare turns the movement into an incline press; brace and keep the back against the pad.","Elbows drifting far behind the body irritate the shoulder; keep them slightly forward.","Using leg drive changes the exercise; keep the feet planted."]},"lever-shoulder-press":{"setup":["Adjust the seat so the handles start around ear or shoulder height.","Keep the head, upper back and pelvis supported.","Grip firmly with wrists straight and elbows slightly forward."],"execute":["Press the handles overhead until the elbows are nearly straight.","Pause without shrugging, then lower until the delts are stretched.","Keep the torso against the pad."],"grow":["The machine gives a stable path for progressive shoulder loading.","Use a full comfortable bottom range instead of shortening it for heavier weight.","Add reps before moving the pin."],"mistakes":["Seat too low places the handles behind the neck; raise it.","Shrugging at lockout shifts work to the traps; keep the shoulders down.","Arching away from the pad means the load is too high."]},"barbell-seated-overhead-press":{"setup":["Sit on a bench with back support, feet flat and the bar at upper-chest height.","Grip just outside the shoulders with thumbs wrapped and wrists stacked.","Brace the abdomen and keep the glutes against the seat."],"execute":["Press the bar upward while moving the head slightly back, then bring it under the bar.","Finish with the bar over the middle of the head, not in front of the face.","Lower to the upper chest under control."],"grow":["A vertical bar path lets the delts produce force efficiently.","Use the deepest comfortable bottom position without bouncing off the chest.","Add reps before small load increases."],"mistakes":["Leaning back turns it into a high-incline press; brace and lower the load.","Bar travelling around the face wastes force; move the head briefly, not the bar.","Wrists bent backwards reduce pressing strength; stack them over the forearms."]},"cable-standing-fly":{"setup":["Set both pulleys around chest height and stand in the middle with one foot forward.","Hold the handles with palms facing forwards and elbows softly bent.","Brace the ribs down and allow the arms to begin slightly behind the torso."],"execute":["Bring the hands together in a wide arc without bending the elbows further.","Squeeze the chest when the hands meet in front of the sternum.","Return slowly until the chest is stretched."],"grow":["The cable maintains tension through the shortened position.","Use a controlled stretch rather than forcing the hands far behind the body.","Add reps before increasing both stacks."],"mistakes":["Turning it into a press by straightening the elbows changes the exercise; keep the elbow angle fixed.","Rounding the shoulders forwards at the finish loses chest position; keep the sternum lifted.","Using body swing makes the cable move faster than the chest can control."]},"cable-upper-chest-crossovers":{"setup":["Set the pulleys low and stand between them with one foot forward.","Take the handles with palms facing up or forwards and elbows softly bent.","Start with the arms low and slightly behind the hips."],"execute":["Sweep the hands up and in towards the upper chest.","Finish with the hands crossing slightly if comfortable.","Return slowly to the low stretched position."],"grow":["The upward arc biases the clavicular fibres while keeping cable tension.","Keep the torso still and use a large pain-free arc.","Add reps before increasing the stack."],"mistakes":["Shrugging the shoulders changes the target; keep them down.","Bending and straightening the elbows turns it into a press; keep a fixed soft bend.","Stopping before the arms travel behind the body removes the loaded stretch."]},"lever-seated-fly":{"setup":["Adjust the seat so the handles begin around mid-chest height.","Place the forearms or hands on the machine pads as designed and keep the back supported.","Allow the elbows to start behind the torso only as far as the shoulders tolerate."],"execute":["Bring the handles together by squeezing the chest.","Pause briefly when the hands meet, then open the arms slowly.","Keep the elbows at a consistent height."],"grow":["Use the complete pain-free opening and a deliberate squeeze.","Do not turn the movement into a press by extending the elbows.","Add reps before moving the pin."],"mistakes":["Seat too high or low changes the chest angle; align the handles with mid-chest.","Bouncing off the rear stop removes control; slow the return.","Letting the shoulders roll forwards at the finish reduces chest tension."]}});
Object.assign(ALTERNATIVES, {"barbell-bench-press":["dumbbell-bench-press","lever-chest-press"],"dumbbell-bench-press":["barbell-bench-press","lever-chest-press"],"lever-chest-press":["barbell-bench-press","dumbbell-bench-press"],"sled-hack-squat":["sled-45-leg-press","barbell-back-squat"],"sled-45-leg-press":["sled-hack-squat","barbell-back-squat"],"barbell-back-squat":["sled-hack-squat","sled-45-leg-press"],"cable-pulldown":["cable-lateral-pulldown-with-v-bar","lever-front-pulldown"],"cable-lateral-pulldown-with-v-bar":["cable-pulldown","lever-front-pulldown"],"lever-front-pulldown":["cable-pulldown","cable-lateral-pulldown-with-v-bar"],"cable-one-arm-lateral-raise":["cable-lateral-raise","dumbbell-lateral-raise"],"cable-lateral-raise":["cable-one-arm-lateral-raise","dumbbell-lateral-raise"],"dumbbell-lateral-raise":["cable-one-arm-lateral-raise","cable-lateral-raise"],"cable-pushdown-with-rope-attachment":["cable-triceps-pushdown-v-bar","cable-one-arm-tricep-pushdown"],"cable-triceps-pushdown-v-bar":["cable-pushdown-with-rope-attachment","cable-one-arm-tricep-pushdown"],"cable-one-arm-tricep-pushdown":["cable-pushdown-with-rope-attachment","cable-triceps-pushdown-v-bar"],"lever-seated-calf-raise":["sled-calf-press","dumbbell-standing-calf-raise"],"sled-calf-press":["lever-seated-calf-raise","dumbbell-standing-calf-raise"],"dumbbell-standing-calf-raise":["lever-seated-calf-raise","sled-calf-press"],"barbell-romanian-deadlift":["dumbbell-romanian-deadlift","dumbbell-stiff-leg-deadlift"],"dumbbell-romanian-deadlift":["barbell-romanian-deadlift","dumbbell-stiff-leg-deadlift"],"dumbbell-stiff-leg-deadlift":["barbell-romanian-deadlift","dumbbell-romanian-deadlift"],"dumbbell-incline-row":["cable-seated-row","lever-seated-row"],"cable-seated-row":["dumbbell-incline-row","lever-seated-row"],"lever-seated-row":["dumbbell-incline-row","cable-seated-row"],"dumbbell-incline-bench-press":["barbell-incline-bench-press","lever-incline-chest-press"],"barbell-incline-bench-press":["dumbbell-incline-bench-press","lever-incline-chest-press"],"lever-incline-chest-press":["dumbbell-incline-bench-press","barbell-incline-bench-press"],"cable-curl":["dumbbell-standing-biceps-curl","ez-barbell-curl"],"dumbbell-standing-biceps-curl":["cable-curl","ez-barbell-curl"],"ez-barbell-curl":["cable-curl","dumbbell-standing-biceps-curl"],"lever-seated-reverse-fly":["cable-cross-over-revers-fly","dumbbell-reverse-fly"],"cable-cross-over-revers-fly":["lever-seated-reverse-fly","dumbbell-reverse-fly"],"dumbbell-reverse-fly":["lever-seated-reverse-fly","cable-cross-over-revers-fly"],"cable-kneeling-crunch":["weighted-crunch","lever-seated-crunch"],"weighted-crunch":["cable-kneeling-crunch","lever-seated-crunch"],"lever-seated-crunch":["cable-kneeling-crunch","weighted-crunch"],"barbell-glute-bridge":["cable-pull-through","barbell-sumo-deadlift"],"cable-pull-through":["barbell-glute-bridge","barbell-sumo-deadlift"],"barbell-sumo-deadlift":["barbell-glute-bridge","cable-pull-through"],"dumbbell-seated-shoulder-press":["lever-shoulder-press","barbell-seated-overhead-press"],"lever-shoulder-press":["dumbbell-seated-shoulder-press","barbell-seated-overhead-press"],"barbell-seated-overhead-press":["dumbbell-seated-shoulder-press","lever-shoulder-press"],"cable-overhead-triceps-extension-rope-attachment":["dumbbell-seated-triceps-extension","lever-triceps-extension"],"dumbbell-seated-triceps-extension":["cable-overhead-triceps-extension-rope-attachment","lever-triceps-extension"],"lever-triceps-extension":["cable-overhead-triceps-extension-rope-attachment","dumbbell-seated-triceps-extension"],"dumbbell-incline-curl":["cable-one-arm-curl","lever-bicep-curl"],"cable-one-arm-curl":["dumbbell-incline-curl","lever-bicep-curl"],"lever-bicep-curl":["dumbbell-incline-curl","cable-one-arm-curl"],"dumbbell-seated-palms-up-wrist-curl":["barbell-wrist-curl","cable-wrist-curl"],"barbell-wrist-curl":["dumbbell-seated-palms-up-wrist-curl","cable-wrist-curl"],"cable-wrist-curl":["dumbbell-seated-palms-up-wrist-curl","barbell-wrist-curl"],"cable-standing-fly":["cable-upper-chest-crossovers","lever-seated-fly"],"cable-upper-chest-crossovers":["cable-standing-fly","lever-seated-fly"],"lever-seated-fly":["cable-standing-fly","cable-upper-chest-crossovers"],"barbell-reverse-curl":["dumbbell-standing-reverse-curl","cable-reverse-curl"],"dumbbell-standing-reverse-curl":["barbell-reverse-curl","cable-reverse-curl"],"cable-reverse-curl":["barbell-reverse-curl","dumbbell-standing-reverse-curl"]});
/* The two programmes, as slot lists. Each slot names three interchangeable
   options; the first is the default pick. Applied by tap, never silently. */
const PRESETS = {"upperOnly":{"name":"upperOnly","days":[{"id":"A","name":"Chest and vertical pull","focus":"Heavy chest work, vertical pulling and moderate direct arm work.","groups":[{"id":"A1","name":"Primary push and pull","rule":"Alternate the first two slots; stop with 1-3 RIR and rest 2-3 minutes.","slots":[{"options":["barbell-bench-press","dumbbell-bench-press","lever-chest-press"],"sets":3,"min":8,"max":10,"note":"Stable horizontal press for chest, with triceps and anterior delts assisting."},{"options":["cable-pulldown","cable-lateral-pulldown-with-v-bar","lever-front-pulldown"],"sets":3,"min":10,"max":12,"note":"Vertical pull for the lats without adding another row."},{"options":["dumbbell-incline-bench-press","barbell-incline-bench-press","lever-incline-chest-press"],"sets":3,"min":8,"max":10,"note":"Second chest angle, separated from the first press by pulling work."}]},{"id":"A2","name":"Delts and arms","rule":"Use controlled isolation work; rest 90-120 seconds.","slots":[{"options":["cable-one-arm-lateral-raise","cable-lateral-raise","dumbbell-lateral-raise"],"sets":3,"min":10,"max":12,"note":"Direct lateral-delt work with low systemic fatigue."},{"options":["cable-pushdown-with-rope-attachment","cable-triceps-pushdown-v-bar","cable-one-arm-tricep-pushdown"],"sets":2,"min":10,"max":15,"note":"Shortened-position triceps work after pressing."},{"options":["cable-curl","dumbbell-standing-biceps-curl","ez-barbell-curl"],"sets":2,"min":10,"max":12,"note":"Stable elbow-flexion work without excessive shoulder fatigue."}]}]},{"id":"B","name":"Back, chest and arms","focus":"One horizontal row, one chest press and long-muscle-length arm work.","groups":[{"id":"B1","name":"Back and chest","rule":"Perform the row first if back quality is the priority; use 1-3 RIR.","slots":[{"options":["dumbbell-incline-row","cable-seated-row","lever-seated-row"],"sets":3,"min":10,"max":12,"note":"Horizontal pull with chest or torso support to limit lower-back fatigue."},{"options":["lever-chest-press","dumbbell-bench-press","barbell-bench-press"],"sets":3,"min":8,"max":10,"note":"Additional chest volume without another incline press."}]},{"id":"B2","name":"Rear delts, arms and forearms","rule":"Keep the eccentric controlled; rest 90-120 seconds.","slots":[{"options":["lever-seated-reverse-fly","cable-cross-over-revers-fly","dumbbell-reverse-fly"],"sets":3,"min":10,"max":12,"note":"Direct rear-delt work with little biceps or spinal loading."},{"options":["cable-overhead-triceps-extension-rope-attachment","dumbbell-seated-triceps-extension","lever-triceps-extension"],"sets":3,"min":10,"max":12,"note":"Lengthened-position triceps work for the long head."},{"options":["dumbbell-incline-curl","cable-one-arm-curl","lever-bicep-curl"],"sets":3,"min":10,"max":12,"note":"Biceps work with the upper arm behind or fixed in front of the body."},{"options":["dumbbell-seated-palms-up-wrist-curl","barbell-wrist-curl","cable-wrist-curl"],"sets":2,"min":12,"max":20,"note":"Direct wrist-flexor work."}]}]},{"id":"C","name":"Shoulders, chest isolation and arms","focus":"Shoulder pressing, chest isolation, one vertical pull and forearm work.","groups":[{"id":"C1","name":"Shoulders and chest","rule":"Press first, then use the fly with a strict range and 1-3 RIR.","slots":[{"options":["dumbbell-seated-shoulder-press","lever-shoulder-press","barbell-seated-overhead-press"],"sets":3,"min":8,"max":10,"note":"Direct anterior-delt and triceps work with a stable press."},{"options":["cable-standing-fly","cable-upper-chest-crossovers","lever-seated-fly"],"sets":3,"min":12,"max":15,"note":"Chest adduction without repeating another heavy press."}]},{"id":"C2","name":"Pull, arms and core","rule":"Use a full stretch and stop each set before technique changes.","slots":[{"options":["cable-pulldown","cable-lateral-pulldown-with-v-bar","lever-front-pulldown"],"sets":3,"min":10,"max":12,"note":"Second weekly vertical-pull exposure."},{"options":["cable-curl","dumbbell-standing-biceps-curl","ez-barbell-curl"],"sets":2,"min":10,"max":12,"note":"Additional biceps volume with simple progression."},{"options":["barbell-reverse-curl","dumbbell-standing-reverse-curl","cable-reverse-curl"],"sets":2,"min":12,"max":15,"note":"Brachioradialis and forearm-extensor work with a pronated grip."},{"options":["cable-kneeling-crunch","weighted-crunch","lever-seated-crunch"],"sets":2,"min":12,"max":15,"note":"Progressive spinal-flexion work for the abs."}]}]}]},"withLegs":{"name":"withLegs","days":[{"id":"A","name":"Chest, quads and vertical pull","focus":"Heavy upper push, quad compound, vertical pull and calves.","groups":[{"id":"A1","name":"Primary work","rule":"Use 1-3 RIR and 2-3 minutes’ rest on the first three slots.","slots":[{"options":["barbell-bench-press","dumbbell-bench-press","lever-chest-press"],"sets":3,"min":8,"max":10,"note":"Primary chest press."},{"options":["sled-hack-squat","sled-45-leg-press","barbell-back-squat"],"sets":3,"min":8,"max":10,"note":"Quad-dominant lower-body compound."},{"options":["cable-pulldown","cable-lateral-pulldown-with-v-bar","lever-front-pulldown"],"sets":3,"min":10,"max":12,"note":"Vertical pull with low lower-back fatigue."}]},{"id":"A2","name":"Delts, triceps and calves","rule":"Use 1-2 RIR on isolations and 90-120 seconds’ rest.","slots":[{"options":["cable-one-arm-lateral-raise","cable-lateral-raise","dumbbell-lateral-raise"],"sets":2,"min":10,"max":12,"note":"Direct lateral-delt work."},{"options":["cable-pushdown-with-rope-attachment","cable-triceps-pushdown-v-bar","cable-one-arm-tricep-pushdown"],"sets":2,"min":10,"max":15,"note":"Direct triceps work."},{"options":["lever-seated-calf-raise","sled-calf-press","dumbbell-standing-calf-raise"],"sets":3,"min":12,"max":20,"note":"Calf work through a deep stretch and hard contraction."}]}]},{"id":"B","name":"Posterior chain, back and incline chest","focus":"Hamstrings, one row, incline chest work, biceps, rear delts and abs.","groups":[{"id":"B1","name":"Posterior chain and upper body","rule":"Keep the hinge controlled; rest 2-3 minutes on the first three slots.","slots":[{"options":["barbell-romanian-deadlift","dumbbell-romanian-deadlift","dumbbell-stiff-leg-deadlift"],"sets":3,"min":8,"max":12,"note":"Lengthened-position hamstring and glute work."},{"options":["dumbbell-incline-row","cable-seated-row","lever-seated-row"],"sets":3,"min":10,"max":12,"note":"Horizontal back work without a second row immediately afterwards."},{"options":["dumbbell-incline-bench-press","barbell-incline-bench-press","lever-incline-chest-press"],"sets":3,"min":8,"max":10,"note":"Upper-chest-biased press."}]},{"id":"B2","name":"Arms, rear delts and core","rule":"Use 1-2 RIR and control the stretched position.","slots":[{"options":["cable-curl","dumbbell-standing-biceps-curl","ez-barbell-curl"],"sets":2,"min":10,"max":12,"note":"Direct biceps work."},{"options":["lever-seated-reverse-fly","cable-cross-over-revers-fly","dumbbell-reverse-fly"],"sets":2,"min":10,"max":12,"note":"Rear-delt work with minimal spinal loading."},{"options":["cable-kneeling-crunch","weighted-crunch","lever-seated-crunch"],"sets":2,"min":12,"max":15,"note":"Direct abdominal work."}]}]},{"id":"C","name":"Quads, glutes and shoulders","focus":"Second quad exposure, direct hip extension, shoulders, calves and arms.","groups":[{"id":"C1","name":"Lower body and shoulder press","rule":"Perform lower-body compounds first; use 1-3 RIR.","slots":[{"options":["sled-hack-squat","sled-45-leg-press","barbell-back-squat"],"sets":3,"min":8,"max":10,"note":"Second weekly quad exposure."},{"options":["barbell-glute-bridge","cable-pull-through","barbell-sumo-deadlift"],"sets":3,"min":8,"max":12,"note":"Direct hip-extension work for the glutes."},{"options":["dumbbell-seated-shoulder-press","lever-shoulder-press","barbell-seated-overhead-press"],"sets":3,"min":8,"max":10,"note":"Direct shoulder pressing."}]},{"id":"C2","name":"Calves, arms and rear delts","rule":"Use controlled isolations and finish 1-2 reps shy of failure.","slots":[{"options":["lever-seated-calf-raise","sled-calf-press","dumbbell-standing-calf-raise"],"sets":3,"min":12,"max":20,"note":"Second weekly calf exposure."},{"options":["cable-overhead-triceps-extension-rope-attachment","dumbbell-seated-triceps-extension","lever-triceps-extension"],"sets":2,"min":10,"max":12,"note":"Lengthened-position triceps work."},{"options":["cable-curl","dumbbell-standing-biceps-curl","ez-barbell-curl"],"sets":2,"min":10,"max":12,"note":"Direct biceps work."},{"options":["lever-seated-reverse-fly","cable-cross-over-revers-fly","dumbbell-reverse-fly"],"sets":2,"min":10,"max":12,"note":"Rear-delt volume without another row."}]}]}]}};
/* Bank starting loads that were set for a stronger trainee than this one.
   Starting too heavy on a near-novice buries the first weeks in failed reps. */
const NOVICE_STARTS = {"barbell-bench-press":20,"barbell-incline-bench-press":20,"dumbbell-bench-press":7.5,"dumbbell-incline-bench-press":7.5,"dumbbell-lateral-raise":2.5,"dumbbell-reverse-fly":2.5,"dumbbell-incline-curl":5,"dumbbell-seated-palms-up-wrist-curl":2.5,"barbell-wrist-curl":5,"barbell-reverse-curl":5,"barbell-back-squat":20,"barbell-romanian-deadlift":30,"dumbbell-romanian-deadlift":10,"dumbbell-stiff-leg-deadlift":10};

for(const b of BANK){ if(NOVICE_STARTS[b.id]!=null) b.startWeight=NOVICE_STARTS[b.id]; }

const MUSCLES = ['chest','back','shoulders','biceps','triceps','forearms','core','quads','hamstrings','glutes','calves'];
const LEG_MUSCLES = ['quads','hamstrings','glutes','calves'];
const MUSCLE_LABEL = {chest:'Chest',back:'Back',shoulders:'Delts',biceps:'Biceps',triceps:'Triceps',forearms:'Forearms',core:'Core',quads:'Quads',hamstrings:'Hams',glutes:'Glutes',calves:'Calves'};
const EQUIPMENT = ['barbell','dumbbell','cable','machine','bodyweight'];
const RADAR = [{key:'chest',label:'CHEST'},{key:'back',label:'BACK'},{key:'shoulders',label:'DELTS'},{key:'arms',label:'ARMS'},{key:'push',label:'PUSH'},{key:'pull',label:'PULL'}];
/* LEGS axis exists only when the user's own program includes leg work — the
   default A/B/C program never shows it. */
function programHasLegs(){return allExercises().some(ex=>LEG_MUSCLES.includes(ex.muscle))}
function radarAxes(){return programHasLegs()?[...RADAR.slice(0,4),{key:'legs',label:'LEGS'},...RADAR.slice(4)]:RADAR}

/* Secondary muscle credit for legacy program ids (kept verbatim from v1). */
const SECONDARY = {bench:[['triceps',.30],['shoulders',.22]],inclineDb:[['triceps',.25],['shoulders',.22]],inclinePump:[['triceps',.18],['shoulders',.18]],shoulderPress:[['triceps',.30]],ohp:[['triceps',.30]],dbRow:[['biceps',.35],['forearms',.18]],chestRow:[['biceps',.32]],cableRow:[['biceps',.22],['shoulders',.18]],facePull:[['back',.28]],hammer:[['forearms',.35]],crossHammer:[['forearms',.35]],reverseCurl:[['biceps',.18]]};

/* Pattern-based secondary credit for bank exercises without an explicit map. */
function secondaryFor(ex){
  if (SECONDARY[ex.id]) return SECONDARY[ex.id];
  const s = ex.id;
  if (ex.muscle==='chest' && /press|push-up|dip/.test(s)) return [['triceps',.3],['shoulders',.2]];
  if (ex.muscle==='shoulders' && /press/.test(s)) return [['triceps',.3]];
  if (ex.muscle==='back' && /row|pull-up|chin|pulldown/.test(s)) return [['biceps',.3],['forearms',.15]];
  if (ex.muscle==='biceps' && /hammer|reverse|zottman/.test(s)) return [['forearms',.3]];
  if (ex.muscle==='triceps' && /close-grip-bench/.test(s)) return [['chest',.25]];
  if (ex.muscle==='quads' && /squat|leg-press|lunge|step-up|hack/.test(s)) return [['glutes',.35],['hamstrings',.15]];
  if (ex.muscle==='hamstrings' && /deadlift|good-morning/.test(s)) return [['glutes',.4]];
  if (ex.muscle==='glutes' && /deadlift/.test(s)) return [['hamstrings',.35],['back',.2],['forearms',.15]];
  if (ex.muscle==='glutes' && /bridge|thrust|pull-through/.test(s)) return [['hamstrings',.25]];
  return [];
}

const KEY = 'brunian-lifts-v50';
const LEGACY = ['brunian-lifts-release-v41','progress-log-abc-realistic-v15','progress-log-abc-realistic-v14','progress-log-abc-realistic-v13','progress-log-abc-realistic-v12'];
const SNAP_PREFIX = 'brunian-lifts-snap-';
const QUARANTINE_KEY = 'brunian-lifts-quarantine';
const SCHEMA = 50;

/* ========================== 2. UTILS ====================================== */
const app = document.getElementById('app');

const STORAGE = (() => {
  const memory = {};
  try {
    const t='__bl_test__'; localStorage.setItem(t,'1'); localStorage.removeItem(t);
    return {ok:true, getItem:k=>localStorage.getItem(k), setItem:(k,v)=>localStorage.setItem(k,v), removeItem:k=>localStorage.removeItem(k), keys:()=>Object.keys(localStorage)};
  } catch(_) {
    return {ok:false, getItem:k=>memory[k]||null, setItem:(k,v)=>memory[k]=String(v), removeItem:k=>delete memory[k], keys:()=>Object.keys(memory)};
  }
})();

function clone(x){return JSON.parse(JSON.stringify(x))}
function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}
/* ---- icon system (single stroke weight, gold on panel) ---- */
const ICONS={
  home:'<path d="M4 11l8-6 8 6M6 10v9h12v-9"/>',
  chart:'<path d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6"/>',
  coach:'<path d="M4 6h9M4 12h16M4 18h6"/><circle cx="17" cy="6" r="2"/><circle cx="13" cy="18" r="2"/>',
  log:'<path d="M6 4h11l3 3v13H6zM9 9h7M9 13h7M9 17h4"/>',
  data:'<path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  portfolio:'<path d="M5 20V9M12 20V4M19 20v-8M3 20h18"/>',
  analyst:'<path d="M3 17l5-5 4 3 8-9M15 6h5v5"/>',
  pr:'<path d="M8 21h8M12 17v4M6 4h12v4a6 6 0 0 1-12 0zM6 6H4v1a3 3 0 0 0 2 3M18 6h2v1a3 3 0 0 1-2 3"/>',
  star:'<path d="M12 3l2.6 5.2 5.7.8-4.1 4 .97 5.7L12 21l-5.2 2.7.97-5.7-4.1-4 5.7-.8z"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>'
};
function icon(name){return`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]||ICONS.chart}</svg>`}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function today(){return localDateKey(new Date())}
function localDateKey(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${dd}`}
function fmtKg(n){return Number(n)===0?'BW':`${Number.isInteger(Number(n))?Number(n):Number(n).toFixed(1)}KG`}
function fmtEntry(e){return `${fmtKg(e.weight)} · ${(e.reps||[]).join(', ')}`}
function uid(){return 's'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function now(){return Date.now()}
function dateDaysAgo(n){const d=new Date();d.setDate(d.getDate()-n);return localDateKey(d)}
function relTime(ts){const s=Math.max(0,(Date.now()-ts)/1000);if(s<60)return'just now';if(s<3600)return`${Math.floor(s/60)}m ago`;if(s<86400)return`${Math.floor(s/3600)}h ago`;return`${Math.floor(s/86400)}d ago`}
function round25(x){return Math.round(x/2.5)*2.5}
function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}

/* ========================== 3. STORE ====================================== */
function freshState(){return{
  schema:SCHEMA, version:50,
  program:clone(DEFAULT_PLAN),
  exerciseIndex:{},                 // snapshot of every exercise ever seen, so history always renders
  currentDayIndex:0,
  settings:{bodyweight:75,restSec:60,autoRest:true,soundOn:true,barWeight:20,
            advancedMode:false,
            lastExportAt:null,lastDataChangeAt:null,programUpdatedAt:null,
            gistId:'',gistToken:'',autoSync:true,lastSyncAt:null,updatedAt:0},
  block:null,                       // {startDate, weeks} — advanced training block
  bodyLog:[],                       // [{date, kg}]
  session:null,
  sessions:[],
  lastReport:null,
  trash:null                        // last deleted session for undo
}}

function indexExercises(state){
  state.exerciseIndex = state.exerciseIndex || {};
  for (const ex of state.program.flatMap(d=>d.groups).flatMap(g=>g.exercises)){
    state.exerciseIndex[ex.id] = {id:ex.id,name:ex.name,clip:ex.clip,muscle:ex.muscle,type:ex.type,equipment:ex.equipment||guessEquipment(ex),min:ex.min,max:ex.max,inc:ex.inc,startWeight:ex.startWeight,startReps:ex.startReps,goalWeight:ex.goalWeight,goalReps:ex.goalReps,averageWeight:ex.averageWeight,averageReps:ex.averageReps,scoreMode:ex.scoreMode,sets:ex.sets};
  }
}
function guessEquipment(ex){
  const s=(ex.clip||ex.id||'').toLowerCase();
  if(/barbell|ez-bar/.test(s))return'barbell';
  if(/dumbbell/.test(s))return'dumbbell';
  if(/cable/.test(s))return'cable';
  if(/lever|smith|machine/.test(s))return'machine';
  return'bodyweight';
}

/* v2 migration: the USER'S program is authoritative. Defaults only fill gaps.
   This replaces v1 mergeProgram, which rebuilt from DEFAULT_PLAN on every load,
   forced sets:3 and silently deleted custom exercises. */
function repairProgram(p){
  const base = clone(DEFAULT_PLAN);
  if (!Array.isArray(p) || !p.length) return base;
  const defaults = {};
  base.flatMap(d=>d.groups).flatMap(g=>g.exercises).forEach(ex=>defaults[ex.id]=ex);
  const bankById = {}; BANK.forEach(b=>bankById[b.id]=b);
  const out = p.map((day,di)=>({
    id: day.id || base[di]?.id || String.fromCharCode(65+di),
    name: day.name || base[di]?.name || 'Day',
    focus: day.focus || base[di]?.focus || '',
    groups: (Array.isArray(day.groups)&&day.groups.length?day.groups:base[di]?.groups||[]).map((g,gi)=>({
      id: g.id || `${day.id||'D'}${gi+1}`,
      name: g.name || 'Group',
      rule: g.rule || '3 rounds. One set of each exercise, then rest.',
      exercises: (g.exercises||[]).filter(ex=>ex&&ex.id).map(ex=>{
        const seed = defaults[ex.id] || bankById[ex.id] || {};
        const merged = {...seed, ...ex};
        merged.sets = clamp(Number(merged.sets)||3,1,6);
        merged.min = Number(merged.min)||seed.min||8;
        merged.max = Math.max(merged.min, Number(merged.max)||seed.max||12);
        merged.inc = Number(merged.inc)||seed.inc||2.5;
        merged.equipment = merged.equipment || guessEquipment(merged);
        merged.cues = Array.isArray(merged.cues)&&merged.cues.length?merged.cues:(seed.cues||[]);
        return merged;
      })
    })).filter(g=>g.exercises.length)
  })).filter(d=>d.groups.length);
  return out.length ? out : base;
}

function migrate(raw){
  const f = freshState();
  let n = {...f, ...(raw||{})};
  n.schema = SCHEMA; n.version = 50;
  n.settings = {...f.settings, ...(raw?.settings||{})};
  n.program = repairProgram(n.program);
  n.block = (n.block && n.block.startDate) ? {startDate:String(n.block.startDate), weeks:clamp(Number(n.block.weeks)||4,2,8)} : null;
  n.bodyLog = Array.isArray(n.bodyLog)?n.bodyLog.filter(x=>x&&x.date):[];
  n.sessions = Array.isArray(n.sessions)?n.sessions:[];
  if (Array.isArray(n.sessionsLog) && !n.sessions.length){ // very old shape
    n.sessions = n.sessionsLog.map(s=>({id:s.id||uid(),date:s.date||today(),timestamp:s.timestamp||now(),day:s.day||'A',dayIndex:s.dayIndex||0,durationMin:s.durationMin||0,note:s.note||'',grade:s.grade||'BASE',overall:s.overall||null,entries:s.entries||{},prs:s.prs||[]}));
  }
  delete n.sessionsLog; delete n.roundDone;
  delete n.__recoveredFrom; delete n.__quarantined; delete n.__fresh;   // transient flags — set per-load by loadState, never persisted
  n.sessions = n.sessions.filter(s=>s&&s.entries).map(s=>normalizeSession(s,n));
  n.currentDayIndex = Number.isInteger(n.currentDayIndex)?clamp(n.currentDayIndex,0,n.program.length-1):0;
  if (n.session && n.session.dayIndex==null) n.session=null;
  if (n.session) n.session = normalizeDraft(n.session, n);      // pass state explicitly — v1 read the
  indexExercises(n);                                            // global mid-load and could throw
  return n;
}

function loadState(){
  let raw = null, srcKey = null;
  try {
    for (const k of [KEY,...LEGACY]){ const v=STORAGE.getItem(k); if(v){raw=v;srcKey=k;break;} }
    if (!raw){ const st=freshState(); indexExercises(st); st.__fresh=true; return st; }
    return migrate(JSON.parse(raw));
  } catch(err){
    // NEVER silently wipe. Quarantine the unreadable payload, then try snapshots.
    try{ if(raw) STORAGE.setItem(QUARANTINE_KEY, raw); }catch(_){}
    const snap = latestSnapshot();
    if (snap){ try{ const st=migrate(snap.data); st.__recoveredFrom=snap.key; return st; }catch(_){}}
    const st = freshState(); st.__quarantined = Boolean(raw); return st;
  }
}

const pushSoon = debounce(()=>Sync.push('auto'), 20000);
function save(){
  state.settings.updatedAt = now();
  saveFailed = !writeMain(JSON.stringify(state));
  IDB.mirror(state);
  if (state.settings.autoSync && state.settings.gistToken && state.settings.gistId) pushSoon();
}
/* The live ledger outranks a snapshot, but not the last one. Free space only for
   a genuine quota rejection, oldest first by the timestamp inside each snapshot
   rather than by key order, and stop while one restore point still stands —
   spending the final backup during a storage failure is how a bad day becomes an
   unrecoverable one. */
function isQuotaError(e){
  return Boolean(e) && (e.name==='QuotaExceededError' || e.name==='NS_ERROR_DOM_QUOTA_REACHED' || e.code===22 || e.code===1014);
}
function snapshotsOldestFirst(){
  return STORAGE.keys().filter(k=>k.startsWith(SNAP_PREFIX))
    .map(k=>{let at=0;try{at=JSON.parse(STORAGE.getItem(k)).at||0}catch(_){}return{k,at}})
    .sort((a,b)=>a.at-b.at);
}
function writeMain(json){
  try{ STORAGE.setItem(KEY, json); return true; }
  catch(err){ if(!isQuotaError(err)) return false; }
  const snaps = snapshotsOldestFirst();
  while(snaps.length > 1){                       // never drop below one restore point
    STORAGE.removeItem(snaps.shift().k);
    try{ STORAGE.setItem(KEY, json); return true; }
    catch(err){ if(!isQuotaError(err)) return false; }
  }
  return false;
}
function markDataChanged(){ state.settings.lastDataChangeAt = new Date().toISOString(); }

/* Rolling snapshots: one per day plus event snapshots, newest 10 kept. */
function snapshot(tag){
  try{
    const key = SNAP_PREFIX + (tag || today());
    STORAGE.setItem(key, JSON.stringify({at:now(), data:state}));
    const snaps = STORAGE.keys().filter(k=>k.startsWith(SNAP_PREFIX))
      .map(k=>{let at=0;try{at=JSON.parse(STORAGE.getItem(k)).at||0}catch(_){}return{k,at}})
      .sort((a,b)=>a.at-b.at);                       // oldest first
    while (snaps.length > 10) STORAGE.removeItem(snaps.shift().k);
  }catch(_){}
}
function listSnapshots(){
  return STORAGE.keys().filter(k=>k.startsWith(SNAP_PREFIX)).sort().reverse().map(k=>{
    try{ const p=JSON.parse(STORAGE.getItem(k)); return {key:k,label:k.slice(SNAP_PREFIX.length),at:p.at,sessions:(p.data.sessions||[]).length}; }
    catch(_){ return null; }
  }).filter(Boolean);
}
function latestSnapshot(){
  const s = listSnapshots()[0];
  if(!s) return null;
  try{ return {key:s.key, data:JSON.parse(STORAGE.getItem(s.key)).data}; }catch(_){ return null; }
}
function restoreSnapshot(key){
  try{
    const p = JSON.parse(STORAGE.getItem(key));
    snapshot('pre-restore');
    state = migrate(p.data);
    openDay = state.session?state.session.dayIndex:state.currentDayIndex;
    view = state.session?'workout':'home';
    save(); flash('Snapshot restored.'); render();
  }catch(_){ flash('Could not read that snapshot.'); }
}

/* IndexedDB mirror — second copy that survives some localStorage clearing. */
const IDB = (()=>{
  let db=null;
  /* indexedDB.open() is asynchronous. Both methods used to test `db` immediately,
     so every call before the open resolved silently did nothing — the early
     saves never mirrored, and a boot-time read always saw null. That is why this
     second copy has never once been used to recover anything. Both now wait. */
  const ready = new Promise(res=>{
    try{
      const req = indexedDB.open('brunian-lifts',1);
      req.onupgradeneeded = e=>e.target.result.createObjectStore('kv');
      req.onsuccess = e=>{ db=e.target.result; res(); };
      req.onerror = ()=>res();
    }catch(_){ res(); }
  });
  return {
    mirror(st){ ready.then(()=>{ try{ if(!db)return; db.transaction('kv','readwrite').objectStore('kv').put(JSON.stringify(st),'state'); }catch(_){} }); },
    read(){ return ready.then(()=>new Promise(res=>{
      try{
        if(!db) return res(null);
        const r=db.transaction('kv').objectStore('kv').get('state');
        r.onsuccess=()=>{ try{ res(r.result?JSON.parse(r.result):null); }catch(_){ res(null); } };
        r.onerror=()=>res(null);
      }catch(_){ res(null); }
    })); }
  };
})();

/* ---- Durability: the three ways this ledger used to disappear ----
   1. iOS Safari evicts script-writable storage after 7 idle days unless the
      origin holds a persistence grant, which Safari only issues to a
      home-screen web app. That is the "it reset itself again this week" bug.
   2. Private browsing makes localStorage throw, so STORAGE silently falls back
      to an in-memory object that dies with the tab: reset on every close.
   3. A quota rejection in save() used to be swallowed, so every later write was
      dropped and the next load returned the last payload that still fit.
   Each is handled below, and none of them is allowed to fail quietly again. */
let persistGranted = null;                 // null = unknown, true/false = answered
let saveFailed = false;                    // last main write rejected (quota)
async function requestPersistence(){
  try{
    if(!navigator.storage || !navigator.storage.persist) return;
    persistGranted = await navigator.storage.persisted();
    if(!persistGranted) persistGranted = await navigator.storage.persist();
  }catch(_){ persistGranted = false; }
  /* An unanswered question is not a yes. A browser with no Storage API gets no
     eviction protection either, so it belongs in the warning, not in limbo. */
  if(persistGranted !== true) persistGranted = false;
}

/* Recovery link — #k=<base64 gistId:token>. The home-screen shortcut keeps the
   URL it was created with, so the credentials survive a storage wipe that the
   ledger itself does not. Boot then pulls the ledger straight back. The hash is
   stripped from the address bar immediately so the token is never left on screen. */
function recoveryLink(){
  const {gistId,gistToken} = state.settings;
  if(!gistId||!gistToken) return '';
  try{ return `${location.origin}${location.pathname}#k=${btoa(`${gistId}:${gistToken}`)}`; }
  catch(_){ return ''; }
}
function adoptRecoveryLink(){
  const m = /[#&]k=([A-Za-z0-9+/=]+)/.exec(location.hash||'');
  if(!m) return false;
  let adopted = false;
  try{
    const [gistId,token] = atob(m[1]).split(':');
    if(gistId && token && (state.settings.gistId!==gistId || state.settings.gistToken!==token)){
      state.settings.gistId = gistId;
      state.settings.gistToken = token;
      state.settings.autoSync = true;
      save();
      adopted = true;
    }
  }catch(_){}
  try{ history.replaceState(null,'',location.pathname+location.search); }catch(_){}
  return adopted;
}

/* ========================== 4. DOMAIN (scoring preserved verbatim) ======== */
function bodyweight(){return clamp(Number(state.settings.bodyweight||75),35,180)}
function allExercises(plan=state.program){return plan.flatMap((day,di)=>day.groups.flatMap((group,gi)=>group.exercises.map((ex,ei)=>({...ex,dayIndex:di,dayId:day.id,dayName:day.name,groupId:group.id,groupName:group.name,groupIndex:gi,exerciseIndex:ei}))))}
/* A good program can train the same lift twice a week, so the same id can hold
   two slots. Anything that counts, scores or lists a lift must see it once —
   otherwise a twice-weekly lift gets double weight in the overall score. */
function uniqueExercises(plan=state.program){const seen=new Set();return allExercises(plan).filter(ex=>seen.has(ex.id)?false:(seen.add(ex.id),true))}
function exById(id){
  const inPlan = allExercises().find(x=>x.id===id); if(inPlan) return inPlan;
  if (state.exerciseIndex && state.exerciseIndex[id]) return {...state.exerciseIndex[id]};
  const b = BANK.find(x=>x.id===id); if(b) return {...b, sets:b.sets||3, startReps:b.min, goalReps:b.max, cues:b.cues||[]};
  return allExercises()[0];
}
function planDay(i){return state.program[clamp(i,0,state.program.length-1)]}
function epley(w,r){return w>0&&r>0?w*(1+r/30):0}
function bestReps(arr){return Math.max(0,...(arr||[]).map(Number).filter(x=>x>0))}
function volumeEntry(e){return Math.max(0,Number(e.weight)||0)*(e.reps||[]).reduce((s,r)=>s+Math.max(0,Number(r)||0),0)}
function entryEst(ex,e){return ex.scoreMode==='reps'?bestReps(e.reps):epley(Number(e.weight)||0,bestReps(e.reps))}
function baselineEntry(ex){return{weight:Number(ex.startWeight)||0,reps:Array.from({length:Number(ex.sets)||3},()=>Number(ex.startReps)||ex.min)}}
function goalEntry(ex){return{weight:Number(ex.goalWeight)||0,reps:Array.from({length:Number(ex.sets)||3},()=>Number(ex.goalReps)||ex.max)}}
function averageEntry(ex){return{weight:Number(ex.averageWeight??ex.startWeight)||0,reps:Array.from({length:Number(ex.sets)||3},()=>Number(ex.averageReps??ex.startReps)||ex.min)}}
function goalEst(ex){return Math.max(1,entryEst(ex,goalEntry(ex)))}
function scoreFromEntry(ex,e){const ratio=clamp(entryEst(ex,e)/goalEst(ex),0,1.35);return Math.round(clamp(100*Math.pow(ratio,1.42),5,100))}
function volScore(ex,e){if(ex.scoreMode==='reps')return scoreFromEntry(ex,e);const g=volumeEntry(goalEntry(ex));const r=clamp(volumeEntry(e)/Math.max(1,g),0,1.35);return Math.round(clamp(100*Math.pow(r,.78),5,100))}
function scoreColor(s){if(s>=90)return'var(--m5)';if(s>=75)return'var(--m4)';if(s>=60)return'var(--m3)';if(s>=45)return'var(--m2)';if(s>=30)return'var(--m1)';return'var(--m0)'}
function rank(s){if(s>=90)return'Goal Range';if(s>=75)return'Advanced Track';if(s>=60)return'Intermediate Base';if(s>=45)return'Developing';if(s>=30)return'Beginner Base';return'Foundation Needed'}
function daysBetween(a,b){return Math.round((new Date(b)-new Date(a))/86400000)}

function normalizeEntry(ex,e){const b=baselineEntry(ex);const raw=(e&&Array.isArray(e.reps)&&e.reps.length)?e.reps:b.reps;const reps=raw.slice(0,6).map(r=>clamp(Number(r)||0,0,100));while(reps.length<1)reps.push(Number(ex.min)||1);const warmups=Array.isArray(e&&e.warmups)?e.warmups.slice(0,3).map(w=>({weight:clamp(Number(w.weight)||0,0,500),reps:clamp(Number(w.reps)||0,0,100),done:Boolean(w.done)})):[];const out={weight:Number((e&&e.weight)??b.weight)||0,reps,warmups};if(e&&Array.isArray(e.rpe)&&e.rpe.some(x=>x>0)){out.rpe=reps.map((_,i)=>{const v=Number(e.rpe[i])||0;return v?clamp(v,5,10):0});}return out}
/* Mean logged RPE for a finished entries map (0 = none logged). */
function entriesAvgRPE(entries){let s=0,n=0;for(const id in entries)for(const v of (entries[id].rpe||[]))if(v>0){s+=v;n++}return n?Math.round(s/n*10)/10:0}
function normalizeSession(s,st){
  const entries={};
  const known = new Set();
  (st||state).program.flatMap(d=>d.groups).flatMap(g=>g.exercises).forEach(ex=>known.add(ex.id));
  for (const id in (s.entries||{})){
    const meta = ((st||state).exerciseIndex||{})[id] || BANK.find(b=>b.id===id) || {min:8,sets:3,startWeight:0,startReps:8};
    entries[id]=normalizeEntry(meta, s.entries[id]);
  }
  return {...s,id:s.id||uid(),date:s.date||today(),timestamp:Number(s.timestamp)||now(),entries};
}
function normalizeDraft(session, st){
  const S = st || state;
  const day = S.program[session.dayIndex] || S.program[0];
  const draft={};
  const swaps=session.exerciseSwaps||{};
  for (const base of day.groups.flatMap(g=>g.exercises)){
    const ex=swaps[base.id]||base;
    draft[ex.id]=normalizeEntry(ex,(session.draft||{})[ex.id]||targetEntryIn(ex,S));
  }
  const setDone={...(session.setDone||{})};
  for (const base of day.groups.flatMap(g=>g.exercises)){
    const ex=swaps[base.id]||base;
    const reps=draft[ex.id].reps||[];
    setDone[ex.id]=Array.from({length:reps.length},(_,i)=>Boolean(setDone[ex.id]?.[i]));
  }
  return {...session,draft,setDone,exerciseSwaps:swaps,removedExercises:session.removedExercises||[],note:session.note||'',startedAt:session.startedAt||now()};
}

function sortedSessions(){return(state.sessions||[]).slice().sort((a,b)=>(a.timestamp||0)-(b.timestamp||0))}
function sessionsForEx(ex){return sortedSessions().filter(s=>s.entries&&s.entries[ex.id]).map(s=>({session:s,entry:s.entries[ex.id]}))}
function latestEntryFor(ex){const arr=sessionsForEx(ex);return arr.length?arr[arr.length-1].entry:baselineEntry(ex)}
function bestEntryFor(ex){let best=baselineEntry(ex),date='Baseline';for(const {session,entry} of sessionsForEx(ex)){if(entryEst(ex,entry)>entryEst(ex,best)){best=entry;date=session.date}}return{entry:best,date}}
function previousSameDay(dayIndex){const logs=sortedSessions().filter(s=>s.dayIndex===dayIndex);return logs.length?logs[logs.length-1]:null}

function profileFromEntries(latest){const bucket={};for(const m of MUSCLES)bucket[m]=[];const exScores=[];const out={exercises:{}};for(const ex of uniqueExercises()){const e=latest[ex.id]||baselineEntry(ex);const sc=scoreFromEntry(ex,e);const bestEnt=bestEntryFor(ex).entry;const best=scoreFromEntry(ex,bestEnt);const vs=volScore(ex,e);out.exercises[ex.id]={score:sc,best,vol:vs,entry:e,bestEntry:bestEnt};exScores.push({score:sc,w:ex.type==='compound'?1.15:1});bucket[ex.muscle]?.push({score:sc,w:1});for(const [m,w] of secondaryFor(ex))bucket[m]?.push({score:sc,w})}for(const m of MUSCLES){const a=bucket[m].filter(x=>x.score>0);out[m]=a.length?Math.round(a.reduce((s,x)=>s+x.score*x.w,0)/a.reduce((s,x)=>s+x.w,0)):35}out.arms=Math.round((out.biceps+out.triceps+out.forearms)/3);out.legs=Math.round((out.quads*1.1+out.hamstrings+out.glutes+out.calves*.6)/3.7);out.push=Math.round((out.chest*1.15+out.shoulders+out.triceps*.85)/(3));out.pull=Math.round((out.back*1.15+out.biceps*.85+out.forearms*.55)/(2.55));out.overall=Math.round(exScores.reduce((s,x)=>s+x.score*x.w,0)/exScores.reduce((s,x)=>s+x.w,0));return out}
function currentEntries(){const o={};for(const ex of allExercises())o[ex.id]=latestEntryFor(ex);return o}
function computeProfile(){return profileFromEntries(currentEntries())}
function bestProfile(){const o={};for(const ex of allExercises())o[ex.id]=bestEntryFor(ex).entry;return profileFromEntries(o)}
function profileUpTo(timestamp){const latest={};for(const ex of allExercises())latest[ex.id]=baselineEntry(ex);for(const s of sortedSessions().filter(x=>(x.timestamp||0)<=timestamp)){for(const id in s.entries)latest[id]=s.entries[id]}return profileFromEntries(latest)}
function scoreTimeline(){const latest={};for(const ex of allExercises())latest[ex.id]=baselineEntry(ex);return sortedSessions().map(s=>{for(const id in s.entries)latest[id]=s.entries[id];return{date:s.date,timestamp:s.timestamp,overall:profileFromEntries(latest).overall}})}

function targetEntryIn(ex,S){
  const arr=(S.sessions||[]).slice().sort((a,b)=>(a.timestamp||0)-(b.timestamp||0)).filter(s=>s.entries&&s.entries[ex.id]);
  const last=arr.length?arr[arr.length-1].entries[ex.id]:baselineEntry(ex);
  return targetFromLast(ex,last);
}
function targetEntry(ex){return targetFromLast(ex, latestEntryFor(ex))}
/* A new movement should not start from a generic number when the athlete has
   history on the same muscle. Transfer the average progress between each
   movement's start and goal, preferring matching equipment. */
function hasExerciseHistory(ex){return sessionsForEx(ex).length>0}
function muscleBasedTarget(ex){
  if(hasExerciseHistory(ex))return targetEntry(ex);
  if(ex.scoreMode==='reps')return baselineEntry(ex);
  const peers=[...new Map([...allExercises(),...BANK].map(x=>[x.id,x])).values()].filter(p=>p.id!==ex.id&&p.muscle===ex.muscle&&hasExerciseHistory(p)&&p.scoreMode!=='reps');
  if(!peers.length)return baselineEntry(ex);
  const ranked=peers.map(p=>{const e=latestEntryFor(p),span=Math.max(Number(p.inc)||2.5,(Number(p.goalWeight)||0)-(Number(p.startWeight)||0));return{p,progress:clamp(((Number(e.weight)||0)-(Number(p.startWeight)||0))/span,0,1),match:p.equipment===ex.equipment?1:0}}).sort((a,b)=>b.match-a.match);
  const use=ranked.slice(0,3),progress=use.reduce((s,x)=>s+x.progress*(x.match?1.5:1),0)/use.reduce((s,x)=>s+(x.match?1.5:1),0);
  const inc=Number(ex.inc)||2.5,start=Number(ex.startWeight)||0,goal=Math.max(start,Number(ex.goalWeight)||start);
  const weight=Math.round((start+(goal-start)*progress)/inc)*inc;
  return{weight:Number(weight.toFixed(1)),reps:Array.from({length:Number(ex.sets)||3},()=>Number(ex.min)||8),estimatedFromMuscle:true};
}
function targetFromLast(ex,last){
  let weight=Number(last.weight)||0;
  const targetSets=Math.max(Number(ex.sets)||3,(last.reps||[]).length||0);
  let reps=(last.reps||[]).slice(0,Math.min(6,targetSets));
  while(reps.length<targetSets&&reps.length<6)reps.push(ex.min);
  const allTop=reps.every(r=>r>=ex.max);
  if(allTop&&ex.scoreMode!=='reps'){weight=Number((weight+Number(ex.inc||2.5)).toFixed(1));reps=Array.from({length:Number(ex.sets)||3},()=>ex.min)}
  else{const i=reps.findIndex(r=>r<ex.max);if(i>=0)reps[i]=Math.min(ex.max,reps[i]+1);else reps[reps.length-1]=Math.min(ex.max,reps[reps.length-1]+1)}
  return{weight,reps};
}
/* Three interchangeable options for a slot: same primary muscle and same joint
   action, spread across equipment so a busy rack never costs a session. Curated
   lists win; otherwise take the best bank match per distinct equipment type. */
/* "Same muscle" is not the same stimulus: a reverse curl and a wrist curl are
   both isolation work tagged forearms, but one is elbow flexion and the other is
   wrist flexion. Matching on the movement pattern is what keeps a swap honest. */
const PATTERNS = [
  ['wrist-curl',       /wrist-curl|finger-curl|wrist-roller/],
  ['reverse-curl',     /reverse-curl|zottman/],
  ['leg-curl',         /leg-curl/],
  ['curl',             /curl/],
  ['pushdown',         /pushdown|kickback/],
  ['overhead-ext',     /overhead-triceps|french-press|triceps-extension|skull-crusher/],
  ['dip',              /dip|close-grip-bench/],
  ['incline-press',    /incline.*(press)|incline-bench/],
  ['horizontal-press', /bench-press|chest-press|push-up|lever-chest/],
  ['overhead-press',   /military-press|overhead-press|shoulder-press|arnold|push-press/],
  ['rear-delt',        /rear-delt|revers\w*-fly|face-pull|rear-lateral/],
  ['fly',              /fly|crossover|pec-deck|pullover/],
  ['lateral-raise',    /lateral-raise|front-raise|upright-row/],
  ['row',              /row/],
  ['pulldown',         /pulldown|pull-up|chin-up/],
  ['shrug',            /shrug/],
  ['hinge',            /deadlift|romanian|good-morning|glute-bridge|pull-through|hip-thrust/],
  ['leg-extension',    /leg-extension/],
  ['calf',             /calf/],
  ['squat',            /squat|leg-press|lunge|step-up|hack/],
  ['crunch',           /crunch|russian-twist|dead-bug|air-bike|roll(er)?out/],
  ['leg-raise',        /leg-raise|knee-raise/]
];
function patternOf(ex){
  const s=`${ex.id||''} ${ex.clip||''}`.toLowerCase();
  for(const [name,re] of PATTERNS) if(re.test(s)) return name;
  return '';
}
/* Three interchangeable options for a slot: same primary muscle and the same
   joint action, spread across equipment so a busy rack never costs a session.
   Curated lists win; otherwise derive from the bank on muscle plus pattern. */
function alternativesFor(ex){
  const curated=(ALTERNATIVES[ex.id]||[]).map(id=>BANK.find(b=>b.id===id)).filter(Boolean);
  if(curated.length) return curated.slice(0,3);
  const pat=patternOf(ex);
  const same=b=>b.id!==ex.id
    && b.clip!==ex.clip                       // the same movement under another id
    && b.muscle===ex.muscle
    && (pat?patternOf(b)===pat:b.type===ex.type);
  const out=[], seen=new Set([ex.equipment]);
  for(const b of BANK){ if(!same(b)||seen.has(b.equipment)) continue; seen.add(b.equipment); out.push(b); if(out.length===3) break; }
  for(const b of BANK){ if(out.length===3) break; if(!same(b)||out.some(x=>x.id===b.id)) continue; out.push(b); }
  return out;
}

/* The load he should use on a movement he has never performed, shown before he
   commits to the swap. */
function altPreview(b,sets){
  const t=muscleBasedTarget({...b,sets:sets||3,startReps:b.min,goalReps:b.max});
  return t.scoreMode==='reps'||b.scoreMode==='reps'?`${t.reps[0]} reps`:fmtKg(t.weight);
}
function targetImpact(ex){const current=computeProfile().overall;const latest=currentEntries();latest[ex.id]=targetEntry(ex);const next=profileFromEntries(latest).overall;return Math.round((next-current)*10)/10}
function nextScoreAdvice(){const prof=computeProfile();const base=prof.overall;const candidates=uniqueExercises().map(ex=>{const t=targetEntry(ex);const e=currentEntries();e[ex.id]=t;const next=profileFromEntries(e).overall;return{ex,t,delta:next-base,score:scoreFromEntry(ex,latestEntryFor(ex))}}).sort((a,b)=>b.delta-a.delta||a.score-b.score);return candidates.slice(0,3).map(c=>`${c.ex.name}: move toward ${fmtKg(c.t.weight)} · ${c.t.reps.join(', ')}. Estimated score impact: +${Math.max(.1,Math.round(c.delta*10)/10)} OVR.`)}

function weeklyWindow(){const cutoff=Date.now()-7*86400000;return sortedSessions().filter(s=>(s.timestamp||0)>=cutoff)}
function totalVolumeForSessions(list){let v=0;for(const s of list)for(const id in s.entries){const ex=exById(id);if(ex.scoreMode!=='reps')v+=volumeEntry(s.entries[id])}return Math.round(v)}
function trainingSummary(){const logs=sortedSessions();const setDates=new Set(logs.map(s=>s.date));let missed=0,lastMiss='None';for(let i=1;i<=14;i++){const d=dateDaysAgo(i);if(!setDates.has(d)){missed++;if(lastMiss==='None')lastMiss=d}}return{total:logs.length,weekly:weeklyWindow().length,prs:logs.reduce((s,x)=>s+(x.prs?x.prs.length:0),0),missed,lastMiss,last:logs.length?logs[logs.length-1]:null}}

/* NEW: hard sets per muscle over the last 7 days (secondary counts at credit weight). */
function weeklyMuscleSets(){
  const out={}; MUSCLES.forEach(m=>out[m]=0);
  for (const s of weeklyWindow()){
    for (const id in s.entries){
      const ex=exById(id); const sets=(s.entries[id].reps||[]).filter(r=>Number(r)>0).length;
      if(out[ex.muscle]!=null) out[ex.muscle]+=sets;
      for (const [m,w] of secondaryFor(ex)) if(out[m]!=null) out[m]+=sets*Math.min(.5,w);
    }
  }
  MUSCLES.forEach(m=>out[m]=Math.round(out[m]*10)/10);
  return out;
}
/* NEW: week streak — consecutive weeks (ending this week) with 3+ sessions. */
function weekStreak(){
  const logs=sortedSessions(); if(!logs.length) return 0;
  const weekOf=ts=>{const d=new Date(ts);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);d.setHours(0,0,0,0);return d.getTime()};
  const counts={}; logs.forEach(s=>{const w=weekOf(s.timestamp);counts[w]=(counts[w]||0)+1});
  let streak=0, w=weekOf(Date.now());
  if((counts[w]||0)>=3){streak=1;w-=7*86400000} else {w-=7*86400000}
  while((counts[w]||0)>=3){streak++;w-=7*86400000}
  return streak;
}
/* ============ ADVANCED LAYER (v3) — readiness + training blocks ============ */
/* Readiness: acute (7-day) vs chronic (28-day avg weekly) training load, the
   acute:chronic workload ratio used in sports science. Volume is weight×reps;
   rep-scored moves count bodyweight-equivalent via reps×bodyweight×0.25. */
function sessionLoad(s){
  let v=0;
  for(const id in s.entries){const ex=exById(id);const e=s.entries[id];
    if(ex.scoreMode==='reps')v+=(e.reps||[]).reduce((a,r)=>a+Math.max(0,Number(r)||0),0)*bodyweight()*.25;
    else v+=volumeEntry(e);}
  return v;
}
function readinessInfo(){
  const logs=sortedSessions();
  if(!logs.length)return{ready:false,msg:'Log sessions to activate load tracking.'};
  const span=(Date.now()-(logs[0].timestamp||Date.now()))/864e5;
  if(span<14||logs.length<4)return{ready:false,msg:`Calibrating — needs about two weeks of history (${logs.length} session${logs.length===1?'':'s'} so far).`};
  const volSince=days=>logs.filter(s=>(s.timestamp||0)>=Date.now()-days*864e5).reduce((a,s)=>a+sessionLoad(s),0);
  const acute=volSince(7);
  const chronic=volSince(28)/4;
  if(chronic<1)return{ready:false,msg:'No recent training volume — start with an easy session.'};
  const ratio=acute/chronic;
  const rpes=logs.slice(-3).map(s=>Number(s.rpe)||0).filter(Boolean);
  const avgRpe=rpes.length?Math.round(rpes.reduce((a,b)=>a+b,0)/rpes.length*10)/10:null;
  let status,label,advice;
  if(ratio<0.8){status='fresh';label='Undertrained';advice='Load is well below your recent normal. You have room to push — add a session or extra sets this week.';}
  else if(ratio<=1.3){status='optimal';label='In the zone';advice='This week\'s load sits in the sweet spot against your monthly base. Keep executing the plan.';}
  else if(ratio<=1.5){status='elevated';label='Ramping fast';advice='Load is climbing faster than your base. Fine for a push week — watch sleep and rep quality.';}
  else{status='high';label='High strain';advice='Acute load far exceeds your chronic base — injury-risk territory. Favour maintenance weights or a lighter session next.';}
  if(avgRpe&&avgRpe>=9&&(status==='optimal'||status==='elevated')){status='elevated';label='Grinding';advice=`Recent sessions averaged RPE ${avgRpe} — effort is near maximal. Bank an easier session before pushing loads again.`;}
  return{ready:true,ratio:Math.round(ratio*100)/100,acute:Math.round(acute),chronic:Math.round(chronic),status,label,advice,avgRpe};
}
function readinessColor(st){return st==='optimal'?'var(--ok)':st==='fresh'?'var(--series2)':st==='elevated'?'var(--gold2)':'var(--risk)'}
/* Training block: a dated mesocycle — build weeks then a deload week. During
   the deload week the session prefill drops loads 10% and resets to floor reps. */
function blockInfo(){
  if(!state.block)return null;
  const start=new Date(state.block.startDate+'T00:00:00');
  const days=Math.max(0,Math.floor((Date.now()-start.getTime())/864e5));
  const weeks=state.block.weeks||4;
  const week=Math.floor(days/7)+1;
  if(week>weeks)return{done:true,weeks};
  return{done:false,week,weeks,deload:week===weeks,phase:week===weeks?'Deload':`Build ${week}`};
}
function inDeload(){const b=blockInfo();return Boolean(b&&!b.done&&b.deload)}
function deloadEntry(ex,t){
  if(ex.scoreMode==='reps')return t;
  const inc=Number(ex.inc)||2.5;
  const w=Math.max(0,Math.round((Number(t.weight)||0)*0.9/inc)*inc);
  return{weight:w,reps:Array.from({length:(t.reps||[]).length||Number(ex.sets)||3},()=>Number(ex.min)||8)};
}
function startBlock(weeks){state.block={startDate:today(),weeks:clamp(Number(weeks)||4,2,8)};markDataChanged();save();flash(`Training block started — ${state.block.weeks} weeks, deload in week ${state.block.weeks}.`);render()}
function endBlock(){state.block=null;markDataChanged();save();flash('Training block cleared.');render()}

/* NEW: PR feed, newest first. */
function prFeed(){
  const out=[];
  for (const s of sortedSessions()) for (const p of (s.prs||[])) out.push({date:s.date,timestamp:s.timestamp,day:s.day,...p});
  return out.reverse();
}
/* NEW: plateau flag — sessions logged since the best e1RM was set. */
function plateauInfo(ex){
  const arr=sessionsForEx(ex); if(arr.length<3) return {stuck:false,since:0};
  let bestVal=entryEst(ex,baselineEntry(ex)), bestIdx=-1;
  arr.forEach((x,i)=>{const v=entryEst(ex,x.entry); if(v>bestVal+.1){bestVal=v;bestIdx=i}});
  const since=arr.length-1-bestIdx;
  return {stuck: bestIdx>=0 ? since>=5 : arr.length>=6, since};
}
/* NEW: deload advice — two consecutive D/F grades on the same day type. */
function deloadAdvice(){
  const out=[];
  state.program.forEach((d,di)=>{
    const logs=sortedSessions().filter(s=>s.dayIndex===di).slice(-2);
    if(logs.length===2 && logs.every(s=>['D','F'].includes(s.grade))){
      out.push(`Day ${d.id} has graded D or F twice in a row. Take 10% off every load next Day ${d.id}, hit clean top-range reps, then rebuild.`);
    }
  });
  return out;
}
function weakPoint(){const prof=computeProfile();const arr=radarAxes().map(a=>({key:a.key,label:a.label,score:prof[a.key]})).sort((a,b)=>a.score-b.score);const weak=arr[0];const exs=uniqueExercises().filter(ex=>{if(weak.key==='arms')return['biceps','triceps','forearms'].includes(ex.muscle);if(weak.key==='push')return['chest','shoulders','triceps'].includes(ex.muscle);if(weak.key==='pull')return['back','biceps','forearms'].includes(ex.muscle);if(weak.key==='legs')return LEG_MUSCLES.includes(ex.muscle);return ex.muscle===weak.key}).map(ex=>({ex,score:scoreFromEntry(ex,latestEntryFor(ex))})).sort((a,b)=>a.score-b.score);return{area:weak,exercises:exs.slice(0,2),target:exs[0]?targetEntry(exs[0].ex):null}}
function projection(){const tl=scoreTimeline();if(tl.length<2)return{message:'Log at least two sessions to generate a projection.',target:null,weeks:null};const recent=tl.slice(-6);const first=recent[0],last=recent[recent.length-1];const weeks=Math.max(.2,(last.timestamp-first.timestamp)/604800000);const rate=(last.overall-first.overall)/weeks;if(rate<=.2)return{message:'Current trend is flat. Hit the next session targets for two weeks to restart projection.',target:null,weeks:null};const targets=[50,60,70,80,90,100].filter(x=>x>last.overall);const target=targets[0]||100;const w=Math.ceil((target-last.overall)/rate);return{message:`At the current pace, ${target} OVR is roughly ${w} week${w===1?'':'s'} away.`,target,weeks:w}}
function plateFor(weight){
  const bar=Number(state.settings.barWeight)||20;
  let side=Math.max(0,(Number(weight)-bar)/2);
  const plates=[20,15,10,5,2.5,1.25], out=[];
  for(const p of plates){ while(side>=p-.01){out.push(p);side-=p} }
  return {bar,perSide:out,rem:Math.round(side*100)/100};
}
function achievementPointsForThreshold(t){return t>=70?60:t>=60?40:t>=50?25:t>=40?15:10}

/* ============ PORTFOLIO ANALYTICS (v2.1) — weight×reps only, no new inputs ============ */
const WK_MS = 6048e5;                                 // one week in ms
function e1rmSeries(ex){return sessionsForEx(ex).map(x=>({t:x.session.timestamp||0,date:x.session.date,v:entryEst(ex,x.entry)})).filter(p=>p.v>0);}
function linFit(vals){const n=vals.length;if(n<2)return null;const mx=(n-1)/2,my=vals.reduce((a,b)=>a+b,0)/n;let sxy=0,sxx=0;for(let i=0;i<n;i++){sxy+=(i-mx)*(vals[i]-my);sxx+=(i-mx)*(i-mx)}const slope=sxx?sxy/sxx:0,intercept=my-slope*mx;const resid=vals.map((y,i)=>y-(slope*i+intercept));const rsd=Math.sqrt(resid.reduce((a,r)=>a+r*r,0)/n)||1e-9;return{slope,intercept,resid,rsd};}
/* Per-lift "position": valuation (e1RM), return, volatility, consistency, drawdown, rating. */
function liftStats(ex){
  const p=e1rmSeries(ex);
  if(p.length<2)return{ex,n:p.length,ready:false,series:p,cur:p.length?p[0].v:entryEst(ex,latestEntryFor(ex)),rating:'NEW'};
  const v=p.map(x=>x.v);
  const rets=[];for(let i=1;i<v.length;i++){const dw=Math.max(.15,(p[i].t-p[i-1].t)/WK_MS);if(v[i-1]>0)rets.push(((v[i]-v[i-1])/v[i-1])/dw);}
  const rawMean=rets.length?rets.reduce((a,b)=>a+b,0)/rets.length:0;const mean=clamp(rawMean,-1.5,1.5);
  const sd=rets.length?(Math.sqrt(rets.reduce((a,b)=>a+(b-mean)*(b-mean),0)/rets.length)||1e-9):1e-9;
  const sharpe=rets.length>=2?clamp(mean/sd,-9.99,9.99):0; // consistency, bounded + needs ≥3 sessions
  const peak=Math.max(...v),cur=v[v.length-1],dd=peak>0?(cur-peak)/peak:0;
  const weeks=Math.max(.3,(p[p.length-1].t-p[0].t)/WK_MS);
  const cagr=v[0]>0?Math.pow(cur/v[0],1/(weeks/4))-1:0; // compounding per 4-week block
  const fit=linFit(v);const z=fit?fit.resid[v.length-1]/fit.rsd:0; // last point vs its own trend, in SDs
  const spw=fit?fit.slope*((v.length-1)/weeks):0;const goal=goalEst(ex);
  const wksToGoal=(spw>1e-6&&goal>cur)?Math.ceil((goal-cur)/spw):null;
  let rating='HOLD';
  if(dd<=-0.05)rating='REDUCE';else if(z<=-1&&p.length>=4)rating='SWAP';else if(mean>0.01)rating='BUY';
  return{ex,n:p.length,ready:true,series:p,v,cur,peak,dd,mean,sd,sharpe,cagr,weeks,fit,z,goal,wksToGoal,spw,rating};
}
function plateauStat(ex){const st=liftStats(ex);if(!st.ready||st.n<4)return{flag:false,z:st.ready?st.z:0,n:st.n};return{flag:st.z<=-1,z:st.z,n:st.n};}
/* BUY/SWAP/REDUCE all ask for an action; HOLD is the only rating that means
   nothing to do, so it takes the green. BUY is strength, so it takes gold. */
function ratingColor(r){return r==='BUY'?'var(--series)':r==='HOLD'?'var(--ok)':r==='REDUCE'?'var(--risk)':r==='SWAP'?'var(--series2)':'var(--faint)';}
function pctStr(x,dp){return (x>=0?'+':'')+(x*100).toFixed(dp==null?1:dp)+'%';}
/* Portfolio-level: net-worth (OVR) curve, drawdown, CAGR, and volume allocation vs target. */
function portfolioSummary(){
  const tl=scoreTimeline();
  const lifts=uniqueExercises().map(ex=>liftStats(ex));
  let nw=null,peak=null,dd=null,cagr=null,weeks=null;
  if(tl.length>=2){const v=tl.map(x=>x.overall);nw=v[v.length-1];peak=Math.max(...v);dd=peak>0?(nw-peak)/peak:0;weeks=Math.max(.3,(tl[tl.length-1].timestamp-tl[0].timestamp)/WK_MS);cagr=Math.pow(Math.max(1,nw)/Math.max(1,v[0]),1/(weeks/4))-1;}
  const cutoff=Date.now()-28*864e5;const ton={};MUSCLES.forEach(m=>ton[m]=0);
  for(const s of sortedSessions())if((s.timestamp||0)>=cutoff)for(const id in s.entries){const ex=exById(id);if(ex.scoreMode==='reps')continue;ton[ex.muscle]=(ton[ex.muscle]||0)+volumeEntry(s.entries[id]);}
  const total=Object.values(ton).reduce((a,b)=>a+b,0)||1;
  const activeN=MUSCLES.filter(m=>ton[m]>0).length||1;const target=1/activeN;
  const alloc=MUSCLES.map(m=>({m,ton:ton[m],share:ton[m]/total,drift:ton[m]/total-(ton[m]>0?target:0)}));
  return{tl,lifts,nw,peak,dd,cagr,weeks,alloc,total,target};
}
/* What-if optimizer: rank each lift's next target by its leverage on OVR (efficient frontier). */
function whatIf(){
  const base=computeProfile().overall;const cur=currentEntries();
  return uniqueExercises().map(ex=>{const t=targetEntry(ex);const e={...cur};e[ex.id]=t;const next=profileFromEntries(e).overall;return{ex,t,delta:Math.round((next-base)*10)/10};}).filter(x=>x.delta>0).sort((a,b)=>b.delta-a.delta);
}
/* Analyst note: generated equity-research view of the body. */
function analystNote(){
  const ps=portfolioSummary();const ready=ps.lifts.filter(l=>l.ready);
  const movers=ready.filter(l=>l.mean>0).slice().sort((a,b)=>b.mean-a.mean).slice(0,3);
  const laggards=ready.slice().sort((a,b)=>a.mean-b.mean).slice(0,3);
  const risks=ready.filter(l=>l.dd<=-0.05||(l.z<=-1&&l.n>=4));
  const wi=whatIf().slice(0,3);
  const ovr=computeProfile().overall;
  const dd=ps.dd!=null?Math.round(ps.dd*1000)/10:0;
  const cagr=ps.cagr!=null?Math.round(ps.cagr*1000)/10:null;
  const underAlloc=ps.alloc.filter(a=>a.share>0).slice().sort((a,b)=>a.drift-b.drift)[0];
  let headline;
  if(!ready.length)headline='Not enough history to open coverage. Log a few sessions to rate your lifts.';
  else if(dd<=-3)headline=`Portfolio in a ${Math.abs(dd)}% drawdown from peak — run a defensive block.`;
  else if(cagr!=null&&cagr>0)headline=`Net strength compounding ${cagr}%/4wk${movers[0]?', led by '+movers[0].ex.name:''}.`;
  else headline='Flat tape. Push the highest-leverage lift to restart the trend.';
  const thesis=wi[0]?`Highest-leverage move: ${wi[0].ex.name} → ${fmtEntry(wi[0].t)} for +${wi[0].delta} OVR.${underAlloc&&underAlloc.drift<-0.02?' Rebalance volume toward '+(MUSCLE_LABEL[underAlloc.m]||underAlloc.m)+'.':''}`:'Log more sessions to generate a next-block thesis.';
  return{headline,movers,laggards,risks,wi,ovr,dd,cagr,ps,thesis,underAlloc,ready};
}
function hasMeaningfulUnsavedData(){if((state.sessions||[]).length<2&&!state.settings.programUpdatedAt)return false;const lastChange=latestSignificantChange();if(!lastChange)return false;const anchor=Math.max(state.settings.lastExportAt?new Date(state.settings.lastExportAt).getTime():0,state.settings.lastSyncAt?new Date(state.settings.lastSyncAt).getTime():0);if(!anchor)return true;return lastChange>anchor}
function latestSignificantChange(){const sessionTime=Math.max(0,...(state.sessions||[]).map(s=>Number(s.timestamp)||0));const dataChange=state.settings.lastDataChangeAt?new Date(state.settings.lastDataChangeAt).getTime():0;const programChange=state.settings.programUpdatedAt?new Date(state.settings.programUpdatedAt).getTime():0;return Math.max(sessionTime,dataChange,programChange)}

function achievements(){const p=computeProfile(),sum=trainingSummary(),ach=[];const add=(g,n,d,ok,need,pts)=>ach.push({g,n,d,ok,need,pts});const sessions=sum.total;[1,2,3,5,8,12,16,20,24,28,32,36,40,44,48].forEach((n,i)=>add('Consistency',`${n} Session${n===1?'':'s'}`,`Log ${n} completed workout${n===1?'':'s'}.`,sessions>=n,`${sessions}/${n}`,i<4?10:i<9?20:35));[1,3,6].forEach((r,i)=>{const count=Math.min(...state.program.map((d,di)=>state.sessions.filter(s=>s.dayIndex===di).length));add('Consistency',`${r} Full Rotation${r===1?'':'s'}`,`Complete every day of the cycle ${r} time${r===1?'':'s'}.`,count>=r,`${count}/${r}`,i===0?20:i===1?35:55)});const ws=weekStreak();[2,4,8,12].forEach((n,i)=>add('Consistency',`${n} Week Streak`,`Hold a streak of ${n} consecutive weeks with 3+ sessions.`,ws>=n,`${ws}/${n}`,i<2?25:50));[36,38,40,42,45,48,50,55,60,65,70,75].forEach(t=>add('Overall',`${t} OVR`,`Reach ${t} overall.`,p.overall>=t,`${p.overall}/${t}`,achievementPointsForThreshold(t)));radarAxes().forEach(a=>[40,45,50,55,60].forEach(t=>add('Muscle Profile',`${a.label} ${t}`,`Reach ${t} score for ${a.label.toLowerCase()}.`,(p[a.key]||0)>=t,`${p[a.key]||0}/${t}`,achievementPointsForThreshold(t))));uniqueExercises().forEach(ex=>{const sc=scoreFromEntry(ex,latestEntryFor(ex));add('Exercise Scores',`${ex.name} 45`,`Reach 45 score on ${ex.name}.`,sc>=45,`${sc}/45`,20)});const prCount=sum.prs;[1,3,5,8,12,16,20,25,30,40].forEach((n,i)=>add('PRs',`${n} PR${n===1?'':'s'}`,`Record ${n} personal record${n===1?'':'s'}.`,prCount>=n,`${prCount}/${n}`,i<3?15:i<7?30:50));const week=weeklyWindow(),weeklyVol=totalVolumeForSessions(week),completeDays=new Set(week.map(s=>s.dayIndex)).size;[[2,'Two Session Week'],[3,'Three Session Week'],[4,'Four Session Week']].forEach(([n,label],i)=>add('Discipline',label,`Log ${n} sessions in the last 7 days.`,week.length>=n,`${week.length}/${n}`,15+i*10));add('Discipline','Balanced Week','Train all three days in the last 7 days.',completeDays>=3,`${completeDays}/3`,35);add('Discipline','Volume Base','Lift 3000KG total volume in the last 7 days.',weeklyVol>=3000,`${weeklyVol}/3000`,20);add('Discipline','Volume Push','Lift 5000KG total volume in the last 7 days.',weeklyVol>=5000,`${weeklyVol}/5000`,35);add('Discipline','Volume Surge','Lift 7500KG total volume in the last 7 days.',weeklyVol>=7500,`${weeklyVol}/7500`,55);add('Discipline','Clean Data','Back up after meaningful logged progress.',!hasMeaningfulUnsavedData()&&sessions>=2,hasMeaningfulUnsavedData()?'Backup Needed':'Saved',20);add('Discipline','Program Owner','Customize the editable program at least once.',Boolean(state.settings.programUpdatedAt),state.settings.programUpdatedAt?'Done':'Not Yet',20);add('Discipline','Two Device Sync','Set up cloud sync so phone and laptop share one ledger.',Boolean(state.settings.gistId&&state.settings.gistToken),state.settings.gistId?'Done':'Not Yet',25);return ach.slice(0,120)}

function compareToPrevious(dayIndex,entries){const prev=previousSameDay(dayIndex);const day=planDay(dayIndex);const active=state.session?sessionExercises(day):day.groups.flatMap(g=>g.exercises);const removed=(state.session?.removedExercises||[]).map(exById);const exercises=[...active,...removed];const lines=[];let up=0,down=0,held=0,total=0;for(const ex of exercises){const nowE=entries[ex.id]||baselineEntry(ex);const prevE=prev?.entries?.[ex.id]||baselineEntry(ex);const strength=(entryEst(ex,nowE)-entryEst(ex,prevE))/Math.max(1,entryEst(ex,prevE));const vol=(volumeEntry(nowE)-volumeEntry(prevE))/Math.max(1,volumeEntry(prevE));const index=strength*.72+vol*.28;const dir=index>.015?'up':index<-.015?'down':'held';if(dir==='up')up++;else if(dir==='down')down++;else held++;total+=index;lines.push({id:ex.id,name:ex.name,strength,vol,index,dir})}const avg=total/Math.max(1,lines.length);let grade='C';if(!prev&&Math.abs(avg)<.012)grade='BASE';else if(avg>=.08)grade='S';else if(avg>=.045)grade='A';else if(avg>=.018)grade='B';else if(avg>=-.015)grade='C';else if(avg>=-.045)grade='D';else grade='F';return{prev,first:!prev,lines,up,down,held,avg,grade}}
function detectPRs(entries){const prs=[];for(const id in entries){const ex=exById(id);const before=bestEntryFor(ex).entry;const curr=entries[id];if(entryEst(ex,curr)>entryEst(ex,before)+.1)prs.push({id,name:ex.name,kind:'Estimated Max',old:Math.round(entryEst(ex,before)*10)/10,now:Math.round(entryEst(ex,curr)*10)/10});if(volumeEntry(curr)>volumeEntry(before)+.1&&ex.scoreMode!=='reps')prs.push({id,name:ex.name,kind:'Volume',old:Math.round(volumeEntry(before)),now:Math.round(volumeEntry(curr))})}return prs}
function fatigueWarnings(entries){const out=[];for(const id in entries){const ex=exById(id),r=entries[id].reps||[];if(r.length>=2&&r[0]>0){const drop=(r[0]-r[r.length-1])/r[0];if(drop>=.30)out.push(`${ex.name} dropped from ${r[0]} reps to ${r[r.length-1]}. Rest longer, lower the load slightly, or stop one rep earlier on set one.`)}}return out}
function gradeIndex(g){return ['F','D','C','B','A','S'].indexOf(g)}
function gradeFromIndexNum(i){return ['F','D','C','B','A','S'][clamp(i,0,5)]||'C'}
function adjustGradeForSession(grade,completionPct,entries){let i=gradeIndex(grade);if(i<0)return grade;const warmups=Object.values(entries).flatMap(e=>e.warmups||[]);const warmDone=warmups.filter(w=>w.done).length;if(completionPct<100)i--;if(completionPct<85)i--;if(warmups.length&&warmDone===warmups.length)i++;if(warmups.length&&warmDone<warmups.length)i--;return gradeFromIndexNum(i)}
function workoutFeedback(dayIndex,entries,comp,prs){const tips=[];const warnings=fatigueWarnings(entries);tips.push(...warnings.slice(0,2));const low=Object.keys(entries).map(id=>({ex:exById(id),e:entries[id]})).filter(x=>Math.min(...x.e.reps)<x.ex.min).sort((a,b)=>Math.min(...a.e.reps)-Math.min(...b.e.reps))[0];if(low)tips.push(`${low.ex.name} fell below the programmed rep floor. Use ${fmtKg(low.e.weight)} until every set reaches at least ${low.ex.min} reps.`);const ready=Object.keys(entries).map(id=>({ex:exById(id),e:entries[id]})).find(x=>x.e.reps.every(r=>r>=x.ex.max)&&x.ex.scoreMode!=='reps');if(ready)tips.push(`${ready.ex.name} is ready for a load increase next time. Move from ${fmtKg(ready.e.weight)} to ${fmtKg(Number(ready.e.weight)+Number(ready.ex.inc||2.5))} and restart near ${ready.ex.min} reps.`);const weak=Object.keys(entries).map(id=>({ex:exById(id),score:scoreFromEntry(exById(id),entries[id])})).sort((a,b)=>a.score-b.score)[0];if(weak)tips.push(`Lowest session score was ${weak.ex.name}. Next target: ${fmtEntry(targetEntry(weak.ex))}.`);const warmups=Object.values(entries).flatMap(e=>e.warmups||[]);if(warmups.length&&warmups.some(w=>!w.done))tips.push('You added warmup sets but did not log all of them. Warmup completion affects the final grade because it improves data quality and session execution.');const extra=Object.keys(entries).map(id=>({ex:exById(id),e:entries[id]})).find(x=>(x.e.reps||[]).length>x.ex.sets);if(extra)tips.push(`${extra.ex.name} included extra work sets. That can help volume score, but only keep it if recovery stays consistent next session.`);if(prs&&prs.length)tips.push(`Keep the same technique on new PR lifts. Do not raise load again until the next session confirms the performance.`);while(tips.length<3)tips.push('Complete every set before finishing. Missing sets reduce data quality and make scores less trustworthy.');return tips.slice(0,4)}
function gradeReason(comp,first,completionPct){if(first)return'Baseline session. Future grades compare this day against the previous matching day.';return`${comp.up} lifts improved, ${comp.held} held steady and ${comp.down} regressed. Completion was ${completionPct}%. ${comp.grade!==comp.rawGrade&&comp.rawGrade?'Final grade adjusted for completion, added work sets or warmup execution.':''}`}

/* ========================== 5. SYNC (GitHub Gist, auto) =================== */
const Sync = {
  status: 'idle', // idle | syncing | synced | offline | error | off
  detail: '',
  configured(){ return Boolean(state.settings.gistToken && state.settings.gistId); },
  setStatus(s,d){ this.status=s; this.detail=d||''; const el=document.getElementById('sync-chip'); if(el){ el.outerHTML=renderSyncChip(); } },
  stripLocal(st){ const c=clone(st); c.settings={...c.settings,gistToken:''}; c.trash=null; return c; },
  /* Merge remote into local without ever losing a logged session. */
  merge(remote){
    try{
      const r = migrate(remote);
      const localNewer = (state.settings.updatedAt||0) >= (r.settings.updatedAt||0);
      const merged = localNewer ? state : r;
      const older  = localNewer ? r : state;
      // sessions: union by id, newest timestamp wins — never drop a logged session
      const byId = {};
      for (const s of [...r.sessions, ...state.sessions]) {
        const prev = byId[s.id];
        if (!prev || (s.timestamp||0) >= (prev.timestamp||0)) byId[s.id] = s;
      }
      merged.sessions = Object.values(byId).sort((a,b)=>(a.timestamp||0)-(b.timestamp||0));
      // bodyLog: union by date so a weigh-in on one device is never overwritten by the other
      const bl = {};
      for (const e of [...(older.bodyLog||[]), ...(merged.bodyLog||[])]) if (e && e.date) bl[e.date] = e;
      merged.bodyLog = Object.values(bl).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
      // program: keep whichever side was edited most recently, independent of session recency
      const lp = state.settings.programUpdatedAt ? new Date(state.settings.programUpdatedAt).getTime() : 0;
      const rp = r.settings.programUpdatedAt ? new Date(r.settings.programUpdatedAt).getTime() : 0;
      if (rp > lp){ merged.program = r.program; merged.settings = {...merged.settings, programUpdatedAt: r.settings.programUpdatedAt}; }
      else if (lp > rp){ merged.program = state.program; merged.settings = {...merged.settings, programUpdatedAt: state.settings.programUpdatedAt}; }
      merged.settings = {...merged.settings, gistToken: state.settings.gistToken, gistId: state.settings.gistId, autoSync: state.settings.autoSync};
      if (state.session && !merged.session) merged.session = state.session;   // never lose an active draft
      merged.exerciseIndex = {...r.exerciseIndex, ...state.exerciseIndex};
      state = migrate(merged);
    }catch(_){/* keep local on any merge issue */}
  },
  async pull(reason){
    const {gistToken:token, gistId} = state.settings;
    if(!token||!gistId) return false;
    if(!navigator.onLine){ this.setStatus('offline'); return false; }
    this.setStatus('syncing');
    try{
      const res = await fetch(`https://api.github.com/gists/${gistId}`,{headers:{Authorization:`Bearer ${token}`}});
      if(!res.ok) throw new Error('HTTP '+res.status);
      const json = await res.json();
      const file = json.files['brunian-lifts.json'] || json.files['progress-log.json'] || Object.values(json.files)[0];
      const parsed = JSON.parse(file.content);
      this.merge(parsed.data||parsed);
      state.settings.lastSyncAt = new Date().toISOString();
      save(); this.setStatus('synced');
      return true;
    }catch(e){ this.setStatus('error', String(e.message||e)); return false; }
  },
  async push(reason){
    const {gistToken:token} = state.settings; let gistId = state.settings.gistId;
    if(!token) return false;
    if(!navigator.onLine){ this.setStatus('offline'); return false; }
    this.setStatus('syncing');
    const body = {description:'Brunian Lifts ledger', public:false,
      files:{'brunian-lifts.json':{content:JSON.stringify({app:'Brunian Lifts',version:state.version,updatedAt:new Date().toISOString(),data:this.stripLocal(state)},null,1)}}};
    try{
      const res = await fetch(gistId?`https://api.github.com/gists/${gistId}`:'https://api.github.com/gists',
        {method:gistId?'PATCH':'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:reason==='unload'});
      if(!res.ok) throw new Error('HTTP '+res.status);
      const json = await res.json();
      state.settings.gistId = json.id;
      state.settings.lastSyncAt = new Date().toISOString();
      try{STORAGE.setItem(KEY,JSON.stringify(state))}catch(_){}
      this.setStatus('synced');
      return true;
    }catch(e){ this.setStatus('error', String(e.message||e)); return false; }
  }
};

/* ========================== 6. TIMERS / DEVICE ============================ */
let restUntil=null, restTotal=60, restTimer=null, sessionClock=null, wakeLock=null;

function restLabel(){ // v1 called this but never defined it — the session-freeze bug
  if(!restUntil) return '0:00';
  const s=Math.max(0,Math.ceil((restUntil-Date.now())/1000));
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
}
function tickRest(){
  if(!restUntil){clearInterval(restTimer);restTimer=null;return}
  if(Date.now()>=restUntil){
    restUntil=null;clearInterval(restTimer);restTimer=null;
    beep(); vibrate([120,60,120]);
    const bar=document.getElementById('restbar'); if(bar) bar.outerHTML=renderRestBar();
    flash('Rest complete. Next round.');
    return;
  }
  const t=document.getElementById('rest-time'); if(t) t.textContent=restLabel();  // partial update, no full re-render
  const rg=document.getElementById('rest-ring'); if(rg) rg.setAttribute('stroke-dashoffset',((1-restFrac())*138.2).toFixed(1));
}
function startRest(sec){restTotal=sec;restUntil=Date.now()+sec*1000;clearInterval(restTimer);restTimer=setInterval(tickRest,500);const bar=document.getElementById('restbar');if(bar)bar.outerHTML=renderRestBar();else render()}
function changeRest(d){if(!restUntil)restUntil=Date.now();restUntil=Math.max(Date.now(),restUntil+d*1000);restTotal=Math.max(1,restTotal+d);const t=document.getElementById('rest-time');if(t)t.textContent=restLabel();const rg=document.getElementById('rest-ring');if(rg)rg.setAttribute('stroke-dashoffset',((1-restFrac())*138.2).toFixed(1))}
function clearRest(){restUntil=null;clearInterval(restTimer);restTimer=null;const bar=document.getElementById('restbar');if(bar)bar.outerHTML=renderRestBar()}
function beep(){try{if(!state.settings.soundOn)return;const ctx=new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.setValueAtTime(.001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.18,ctx.currentTime+.02);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.5);o.start();o.stop(ctx.currentTime+.55)}catch(_){}}
function vibrate(pat){try{navigator.vibrate&&navigator.vibrate(pat)}catch(_){}}
async function holdWake(on){
  try{
    if(on && 'wakeLock' in navigator){ wakeLock=await navigator.wakeLock.request('screen'); }
    else if(!on && wakeLock){ await wakeLock.release(); wakeLock=null; }
  }catch(_){}
}
function tickSessionClock(){const el=document.getElementById('sess-clock');if(el&&state.session){const m=Math.floor((Date.now()-state.session.startedAt)/60000);el.textContent=`${m} min`}}

/* ========================== ACTIONS ======================================= */
let state = loadState();
let view = state.session ? 'workout' : 'home';
let openDay = state.session ? state.session.dayIndex : state.currentDayIndex;
let toast='', toastTimer=null, confirmBox=null, editingSessionId=null, selectedExId=null;
let calendarOffset=0;
let bankTarget=null;        // {dayIndex, groupId, replaceId|null}
let bankFilter={muscle:'',equipment:'',q:''};
let historyQuery='';

function flash(msg){toast=msg;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast='';const t=document.getElementById('toast-slot');if(t)t.innerHTML='';},2600);const t=document.getElementById('toast-slot');if(t)t.innerHTML=renderToast();else render()}
function jumpTop(){try{window.scrollTo(0,0)}catch(_){}}
function go(v){view=v;jumpTop();render()}

function buildDraft(dayIndex){const day=planDay(dayIndex);const draft={};const done={};const deload=inDeload();for(const ex of day.groups.flatMap(g=>g.exercises)){const t=targetEntry(ex);draft[ex.id]=deload?deloadEntry(ex,t):t;done[ex.id]=Array.from({length:Number(ex.sets)||3},()=>false)}return{dayIndex,draft,setDone:done,startedAt:now(),note:'',exerciseSwaps:{},removedExercises:[]}}
function sessionExercise(ex){return state.session?.exerciseSwaps?.[ex.id]||ex}
function sessionExercises(day=planDay(state.session?.dayIndex||0)){return day.groups.flatMap(g=>g.exercises.map(sessionExercise)).filter(ex=>!state.session?.removedExercises?.includes(ex.id))}
function cycleRPE(exId,index){
  const d=draftFor(exId); if(!d)return;
  d.rpe=Array.isArray(d.rpe)?d.rpe:(d.reps||[]).map(()=>0);
  while(d.rpe.length<(d.reps||[]).length)d.rpe.push(0);
  const seq=[0,8,9,10,6,7];                      // tap: unset → 8 → 9 → 10 → 6 → 7 → unset
  const cur=seq.indexOf(Number(d.rpe[index])||0);
  d.rpe[index]=seq[(cur+1)%seq.length];
  save();render();
}
function startSession(dayIndex){
  if(state.session&&state.session.dayIndex!==dayIndex){
    confirmBox={title:'Replace active workout?',text:'Starting another day discards the current unfinished draft. Completed sessions are safe.',ok:'Replace draft',danger:false,onYes:()=>{state.session=buildDraft(dayIndex);openDay=dayIndex;view='workout';save();jumpTop();render()}};
    render();return;
  }
  state.session=state.session?normalizeDraft(state.session):buildDraft(dayIndex);
  openDay=dayIndex;view='workout';save();jumpTop();render();
}
function switchDay(dayIndex){if(dayIndex===openDay)return;startSession(dayIndex)}

function draftFor(exId){if(!state.session)return null;const ex=exById(exId);const d=state.session.draft[exId]||targetEntry(ex);if(!Array.isArray(d.reps))d.reps=baselineEntry(ex).reps;if(!Array.isArray(d.warmups))d.warmups=[];state.session.draft[exId]=d;return d}
function step(exId,kind,index,dir){
  const d=draftFor(exId); if(!d)return; const ex=exById(exId);
  if(kind==='weight')d.weight=clamp(Number((Number(d.weight)+dir*Number(ex.inc||2.5)).toFixed(1)),0,500);
  if(kind==='reps'){d.reps[index]=clamp(Number(d.reps[index]||0)+dir,0,100);state.session.setDone[exId][index]=false}
  if(kind==='warmWeight'&&d.warmups[index])d.warmups[index].weight=clamp(Number((Number(d.warmups[index].weight)+dir*Number(ex.inc||2.5)).toFixed(1)),0,500);
  if(kind==='warmReps'&&d.warmups[index]){d.warmups[index].reps=clamp(Number(d.warmups[index].reps||0)+dir,0,100);d.warmups[index].done=false}
  save();render();
}
function setDirect(exId,kind,index,value){ // direct numeric typing, no re-render (keeps focus)
  const d=draftFor(exId); if(!d)return;
  const v=Number(value);
  if(kind==='weight'&&isFinite(v))d.weight=clamp(v,0,500);
  if(kind==='reps'&&isFinite(v)){d.reps[index]=clamp(Math.round(v),0,100);state.session.setDone[exId][index]=false}
  save();
}
function logSet(exId,index){
  if(!state.session)return;
  const was=state.session.setDone[exId][index];
  state.session.setDone[exId][index]=!was;
  save();
  if(!was && state.settings.autoRest) startRest(state.settings.restSec||60);
  render();
}
function logWarmup(exId,index){if(!state.session)return;const d=state.session.draft[exId];if(!d||!d.warmups||!d.warmups[index])return;d.warmups[index].done=!d.warmups[index].done;save();render()}
function addWorkSet(exId){const d=draftFor(exId);if(!d)return;const ex=exById(exId);if(d.reps.length>=6){flash('Maximum 6 work sets per exercise.');return}d.reps.push(d.reps.length?d.reps[d.reps.length-1]:ex.min);state.session.setDone[exId]=state.session.setDone[exId]||[];state.session.setDone[exId].push(false);save();render()}
function removeWorkSet(exId){if(!state.session)return;const d=state.session.draft[exId];if(!d||!Array.isArray(d.reps)||d.reps.length<=1){flash('Keep at least 1 work set.');return}d.reps.pop();if(state.session.setDone[exId])state.session.setDone[exId].pop();save();render()}
/* Smarter warm-up: 40/60/80% ramp toward the work weight (v1 added a single 55% guess). */
function addWarmup(exId){
  const d=draftFor(exId); if(!d)return; const ex=exById(exId);
  if(d.warmups.length>=3){flash('Maximum 3 warmup sets per exercise.');return}
  const base=Number(d.weight)||Number(ex.startWeight)||0;
  const pct=[.4,.6,.8][d.warmups.length];
  const reps=[10,6,3][d.warmups.length];
  d.warmups.push({weight:Math.max(0,round25(base*pct)),reps,done:false});
  save();render();
}
function removeWarmup(exId){if(!state.session)return;const d=state.session.draft[exId];if(!d||!Array.isArray(d.warmups)||!d.warmups.length){flash('No warmup set to remove.');return}d.warmups.pop();save();render()}
function fillFromLast(exId){const d=draftFor(exId);if(!d)return;const ex=exById(exId);const last=latestEntryFor(ex);d.weight=Number(last.weight)||0;d.reps=(last.reps||[]).slice(0,6).map(Number);state.session.setDone[exId]=d.reps.map(()=>false);save();render();flash('Filled with your last logged numbers.')}
function fillFromTarget(exId){const d=draftFor(exId);if(!d)return;const ex=exById(exId);const t=targetEntry(ex);d.weight=t.weight;d.reps=t.reps.slice();state.session.setDone[exId]=d.reps.map(()=>false);save();render();flash('Filled with today\'s target.')}
function completion(){if(!state.session)return{done:0,total:0,pct:0};let done=0,total=0;for(const id in state.session.setDone){for(const v of state.session.setDone[id]){total++;if(v)done++}}for(const id in state.session.draft){for(const w of (state.session.draft[id].warmups||[])){total++;if(w.done)done++}}for(const id of (state.session.removedExercises||[])){const ex=exById(id);total+=Number(ex.sets)||3}return{done,total,pct:total?Math.round(done/total*100):0}}

function finishSession(force=false){
  if(!state.session)return;
  const c=completion();
  if(c.done<c.total&&!force){confirmBox={title:'Finish with unlogged sets?',text:`${c.total-c.done} set${c.total-c.done===1?'':'s'} are not marked complete. Finish only if this is accurate.`,ok:'Finish anyway',danger:false,onYes:()=>finishSession(true)};render();return}
  const day=planDay(state.session.dayIndex);
  const entries={};
  for(const ex of sessionExercises(day))entries[ex.id]=normalizeEntry(ex,state.session.draft[ex.id]);
  const comp=compareToPrevious(state.session.dayIndex,entries);
  const prs=detectPRs(entries);
  comp.rawGrade=comp.grade;comp.grade=adjustGradeForSession(comp.grade,c.pct,entries);
  const before=computeProfile().overall;
  const timestamp=now();const date=today();const id=uid();
  markDataChanged();
  state.sessions.push({id,date,timestamp,day:day.id,dayIndex:state.session.dayIndex,durationMin:Math.max(1,Math.round((timestamp-state.session.startedAt)/60000)),note:state.session.note||'',entries,prs,completion:c.pct,grade:comp.grade,overall:null,volume:totalVolumeForSessions([{entries}]),rpe:entriesAvgRPE(entries)||null});
  const overall=computeProfile().overall;
  state.sessions[state.sessions.length-1].overall=overall;
  state.currentDayIndex=(state.session.dayIndex+1)%state.program.length;
  state.lastReport={id,dayId:day.id,grade:comp.grade,overall,delta:overall-before,comp,prs,first:comp.first,completion:c.pct,durationMin:state.sessions[state.sessions.length-1].durationMin,volume:state.sessions[state.sessions.length-1].volume,rpe:state.sessions[state.sessions.length-1].rpe,narrative:comp.first?'Baseline saved. The next matching day will be graded against this workout.':overall>=before?'Workout saved. Your current profile improved or held after this session.':'Workout saved. Some performance dropped, so the current profile adjusted downward.',reason:gradeReason(comp,comp.first,c.pct),feedback:workoutFeedback(state.session.dayIndex,entries,comp,prs)};
  state.session=null;openDay=state.currentDayIndex;view='report';confirmBox=null;
  clearRest(); holdWake(false); snapshot();
  save(); if(Sync.configured()&&state.settings.autoSync)Sync.push('finish');
  jumpTop();render();
}
function deleteSession(id){
  confirmBox={title:'Delete logged session?',text:'The session is removed and all scores recompute from the remaining history. You can undo for a few seconds afterward.',ok:'Delete session',danger:true,onYes:()=>{
    const s=state.sessions.find(x=>x.id===id);
    state.trash={session:s,at:now()};
    state.sessions=state.sessions.filter(x=>x.id!==id);
    markDataChanged();save();confirmBox=null;render();
    flash('Session deleted.');
    const slot=document.getElementById('toast-slot');
    if(slot)slot.innerHTML=`<div class="toast" role="status">Session deleted. <button class="toast-undo" data-action="undo-delete">Undo</button></div>`;
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>{state.trash=null;save();const t=document.getElementById('toast-slot');if(t)t.innerHTML=''},8000);
  }};
  render();
}
function undoDelete(){if(!state.trash||!state.trash.session)return;state.sessions.push(state.trash.session);state.sessions.sort((a,b)=>(a.timestamp||0)-(b.timestamp||0));state.trash=null;markDataChanged();save();render();flash('Session restored.')}
function startEditSession(id){editingSessionId=id;view='editSession';jumpTop();render()}
function saveEditSession(){
  const s=state.sessions.find(x=>x.id===editingSessionId);if(!s)return;
  for(const id of Object.keys(s.entries)){
    const ex=exById(id);
    const w=document.querySelector(`[data-edit-weight="${id}"]`);if(!w)continue;
    const reps=[...document.querySelectorAll(`[data-edit-rep^="${id}-"]`)].map(r=>clamp(Number(r.value||0),0,100));
    s.entries[id]={weight:clamp(Number(w.value||0),0,500),reps:reps.length?reps:baselineEntry(ex).reps,warmups:(s.entries[id]?.warmups||[])};
  }
  const note=document.querySelector('[data-edit-note]');if(note)s.note=note.value;
  s.timestamp=s.timestamp||now();s.date=s.date||today();
  markDataChanged();
  s.overall=profileUpTo(s.timestamp).overall;
  save();view='history';editingSessionId=null;render();flash('Session updated. Scores recomputed.');
}

/* Program editing — no re-render on keystroke (v1 destroyed input focus). */
const programSaveSoon = debounce(()=>{save()},400);
function updateProgramField(id,field,value){
  for(const ex of state.program.flatMap(d=>d.groups).flatMap(g=>g.exercises)){
    if(ex.id===id){
      if(['name','clip'].includes(field))ex[field]=value;
      else ex[field]=clamp(Number(value)||0,0,field==='sets'?6:999);
      if(field==='sets')ex.sets=clamp(Math.round(Number(value)||3),1,6);
      state.settings.programUpdatedAt=new Date().toISOString();
      markDataChanged();indexExercises(state);
      break;
    }
  }
  programSaveSoon();
}
/* Turn a preset's slot list into the program shape. The first option in each
   slot is the default pick; the other two stay available as swaps. */
function presetToProgram(preset){
  return preset.days.map(d=>({
    id:d.id, name:d.name, focus:d.focus,
    groups:d.groups.map(g=>({
      id:g.id, name:g.name, rule:g.rule,
      exercises:g.slots.map(sl=>{
        const b=BANK.find(x=>x.id===sl.options[0]); if(!b) return null;
        const min=Number(sl.min)||b.min, max=Math.max(min,Number(sl.max)||b.max);
        const ex={id:b.id,name:b.name,clip:b.clip,type:b.type,muscle:b.muscle,equipment:b.equipment,
          sets:clamp(Number(sl.sets)||3,1,6),min,max,inc:b.inc,
          startWeight:b.startWeight,startReps:min,goalWeight:b.goalWeight,goalReps:max,cues:[]};
        if(b.scoreMode) ex.scoreMode=b.scoreMode;
        return ex;
      }).filter(Boolean)
    })).filter(g=>g.exercises.length)
  }));
}
function applyPreset(name){
  const preset=PRESETS[name]; if(!preset) return;
  const legs=name==='withLegs';
  confirmBox={
    title:legs?'Switch to the full-body program?':'Switch to the upper-only program?',
    text:`Your logged sessions, scores and PRs are untouched. This DOES replace the program itself: any exercise you added, renamed or retuned, and any sets, rep ranges or start and goal loads you edited, revert to the coached values. A snapshot is saved first so you can undo it in Data.${state.session?' The workout you have open will be discarded.':''}`,
    ok:'Apply program', danger:false,
    onYes:()=>{
      snapshot('pre-program-switch-'+new Date().toISOString().slice(0,16).replace(/[:T]/g,''));
      state.program=presetToProgram(preset);
      state.currentDayIndex=0; state.session=null; openDay=0;
      state.settings.programPreset=name;
      state.settings.programUpdatedAt=new Date().toISOString();
      markDataChanged(); indexExercises(state);
      confirmBox=null; view='program'; save(); jumpTop(); render();
      flash(legs?'Full-body program applied.':'Upper-only program applied.');
    }};
  render();
}
function resetProgram(){confirmBox={title:'Reset program?',text:'This restores the default A, B and C program. Your logged sessions stay saved.',ok:'Reset program',danger:false,onYes:()=>{snapshot('pre-program-reset');state.program=clone(DEFAULT_PLAN);state.settings.programUpdatedAt=new Date().toISOString();markDataChanged();indexExercises(state);save();confirmBox=null;render();flash('Program reset.')}};render()}

/* Exercise bank: swap / add / remove. */
function openBank(dayIndex,groupId,replaceId){bankTarget={dayIndex,groupId,replaceId:replaceId||null};const cur=replaceId?exById(replaceId):null;bankFilter={muscle:cur?cur.muscle:'',equipment:'',q:''};view='bank';jumpTop();render()}
function openSessionSwap(groupId,baseId){const base=planDay(state.session.dayIndex).groups.find(g=>g.id===groupId)?.exercises.find(x=>x.id===baseId);if(!base)return;bankTarget={dayIndex:state.session.dayIndex,groupId,replaceId:baseId,sessionOnly:true};bankFilter={muscle:base.muscle,equipment:'',q:''};view='bank';jumpTop();render()}
function removeSessionExercise(exId){
  if(!state.session)return;
  if((state.session.removedExercises||[]).length>=1){flash('You can remove at most one exercise per workout.');return}
  const ex=exById(exId);
  confirmBox={title:`Remove ${ex.name} from this workout?`,text:'You can remove one exercise per session. Its planned sets stay incomplete, so your completion percentage and session grade will fall.',ok:'Remove for today',danger:false,onYes:()=>{state.session.removedExercises=[exId];save();confirmBox=null;render();flash(`${ex.name} removed for today — grade impact applied.`)}};
  render();
}
function bankResults(){
  return BANK.filter(b=>{
    if(bankFilter.muscle&&b.muscle!==bankFilter.muscle)return false;
    if(bankFilter.equipment&&b.equipment!==bankFilter.equipment)return false;
    if(bankFilter.q&&!b.name.toLowerCase().includes(bankFilter.q.toLowerCase()))return false;
    return true;
  });
}
function chooseFromBank(bankId){
  if(!bankTarget)return;
  const b=BANK.find(x=>x.id===bankId);if(!b)return;
  if(bankTarget.sessionOnly){
    const base=planDay(state.session.dayIndex).groups.find(g=>g.id===bankTarget.groupId)?.exercises.find(x=>x.id===bankTarget.replaceId);if(!base)return;
    if(sessionExercises().some(x=>x.id===b.id)){flash('That exercise is already in this workout.');return}
    const fresh={...b,sets:base.sets||3,startReps:b.min,goalReps:b.max,cues:b.cues||[]};
    const suggestion=muscleBasedTarget(fresh);state.exerciseIndex[fresh.id]={...fresh};
    delete state.session.draft[base.id];delete state.session.setDone[base.id];
    state.session.exerciseSwaps=state.session.exerciseSwaps||{};state.session.exerciseSwaps[base.id]=fresh;
    state.session.draft[fresh.id]=suggestion;state.session.setDone[fresh.id]=suggestion.reps.map(()=>false);
    save();bankTarget=null;view='workout';jumpTop();render();
    flash(suggestion.estimatedFromMuscle?`${fresh.name} ready — load estimated from your ${MUSCLE_LABEL[fresh.muscle].toLowerCase()} training.`:`${fresh.name} ready with your own history.`);return;
  }
  const day=state.program[bankTarget.dayIndex];const group=day?.groups.find(g=>g.id===bankTarget.groupId);if(!group)return;
  const inPlan=allExercises().some(x=>x.id===b.id);
  if(inPlan&&(!bankTarget.replaceId||bankTarget.replaceId!==b.id)){flash('That exercise is already in the program.');return}
  indexExercises(state);
  const fresh={id:b.id,name:b.name,clip:b.clip,type:b.type,muscle:b.muscle,equipment:b.equipment,sets:3,min:b.min,max:b.max,inc:b.inc,startWeight:b.startWeight,startReps:b.min,goalWeight:b.goalWeight,goalReps:b.max,cues:[]};if(b.scoreMode)fresh.scoreMode=b.scoreMode;
  const prior=sessionsForEx(fresh).length;  // returning to an old lift picks its history back up
  if(bankTarget.replaceId){
    const i=group.exercises.findIndex(x=>x.id===bankTarget.replaceId);
    if(i>=0){fresh.sets=group.exercises[i].sets||3;group.exercises[i]=fresh}
  }else{
    group.exercises.push(fresh);
  }
  state.settings.programUpdatedAt=new Date().toISOString();
  markDataChanged();indexExercises(state);
  if(state.session&&state.session.dayIndex===bankTarget.dayIndex)state.session=normalizeDraft(state.session,state);
  save();
  view='program';bankTarget=null;jumpTop();render();
  flash(prior?`${b.name} added. Its previous history is active again.`:`${b.name} added. History for the old lift stays in your log.`);
}
function removeExercise(dayIndex,groupId,exId){
  const day=state.program[dayIndex];const group=day?.groups.find(g=>g.id===groupId);if(!group)return;
  if(group.exercises.length<=1){flash('Keep at least one exercise per group.');return}
  const ex=group.exercises.find(x=>x.id===exId);
  indexExercises(state);
  confirmBox={title:`Remove ${ex?ex.name:'exercise'}?`,text:'The slot is removed from the program. Every logged session that includes it stays in your history.',ok:'Remove from program',danger:true,onYes:()=>{
    group.exercises=group.exercises.filter(x=>x.id!==exId);
    state.settings.programUpdatedAt=new Date().toISOString();
    markDataChanged();indexExercises(state);
    if(state.session&&state.session.dayIndex===dayIndex)state.session=normalizeDraft(state.session,state);
    save();confirmBox=null;render();flash('Exercise removed from the program.');
  }};
  render();
}

/* Data: export / import / reset / CSV. */
function download(name,text,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),250)}
function exportData(){state.settings.lastExportAt=new Date().toISOString();save();const payload=JSON.stringify({app:'Brunian Lifts',version:state.version,exportedAt:new Date().toISOString(),data:Sync.stripLocal(state)},null,2);download(`brunian-lifts-export-${today()}.json`,payload,'application/json');flash('Export file downloaded.')}
function exportCSV(){
  const rows=[['date','day','exercise','muscle','set','weight_kg','reps','rpe','est_1rm']];
  for(const s of sortedSessions())for(const id in s.entries){const ex=exById(id);const e=s.entries[id];(e.reps||[]).forEach((r,i)=>rows.push([s.date,s.day,ex.name,ex.muscle,i+1,e.weight,r,(e.rpe&&e.rpe[i])||'',Math.round(epley(e.weight,r)*10)/10]))}
  download(`brunian-lifts-sessions-${today()}.csv`,rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n'),'text/csv');
  flash('CSV downloaded.');
}
function importData(){const input=document.createElement('input');input.type='file';input.accept='application/json,.json';input.onchange=()=>{const file=input.files&&input.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(String(reader.result||'{}'));snapshot('pre-import');const keepToken=state.settings.gistToken,keepId=state.settings.gistId;state=migrate(parsed.data||parsed);state.settings.gistToken=state.settings.gistToken||keepToken;state.settings.gistId=state.settings.gistId||keepId;openDay=state.session?state.session.dayIndex:state.currentDayIndex;view=state.session?'workout':'home';save();jumpTop();render();flash('Import complete.')}catch(_){flash('Import failed. Use a Brunian Lifts JSON export file.')}};reader.readAsText(file)};input.click()}
function resetAll(){confirmBox={title:'Reset all local data?',text:'This clears sessions, draft, scores and settings from this device. A pre-reset snapshot is kept and export is recommended first.',ok:'Reset everything',danger:true,onYes:()=>{snapshot('pre-reset');try{[KEY,...LEGACY].forEach(k=>STORAGE.removeItem(k))}catch(_){}state=freshState();openDay=0;view='home';confirmBox=null;save();render();flash('Local data reset. A pre-reset snapshot was kept.')}};render()}

/* Storage health — tells the truth about the current origin. */
function storageHealth(){
  const proto=location.protocol, host=location.hostname;
  if(!STORAGE.ok)return{level:'bad',msg:'This browser is blocking storage. Data lives only in memory for this tab. Set up cloud sync or export before closing.'};
  if(saveFailed)return{level:'bad',msg:'The last save was rejected — this device is out of storage. Export now, then delete old snapshots in this screen.'};
  if(persistGranted===false)return{level:'warn',msg:'This browser has not granted persistent storage, so it may clear your ledger after about a week idle. Add the app to your home screen and set up cloud sync — both are in this screen.'};
  if(proto==='file:')return{level:'warn',msg:'Running from a local file. Some phones clear file-based storage. Use one stable hosted URL (see the guide in Data) and set up cloud sync.'};
  if(/netlify\.app$/.test(host)&&(state.sessions||[]).length===0)return{level:'warn',msg:'Every new Netlify Drop upload is a brand-new site with empty storage. Deploy once to a stable URL and keep using that link.'};
  return{level:'ok',msg:''};
}

/* ========================== 7. VIEWS ====================================== */
function renderSyncChip(){
  const s=Sync.status, conf=Boolean(state.settings.gistToken&&state.settings.gistId);
  const label=!conf?'Local only':s==='syncing'?'Syncing':s==='synced'?'Synced':s==='offline'?'Offline':s==='error'?'Sync error':state.settings.lastSyncAt?'Synced '+relTime(new Date(state.settings.lastSyncAt).getTime()):'Synced';
  const cls=!conf?'off':s==='error'?'err':s==='syncing'?'busy':'ok';
  return `<button id="sync-chip" class="sync-chip ${cls}" data-action="sync-now" title="${esc(Sync.detail||'Cloud sync status')}">${esc(label)}</button>`;
}
function renderFirstRun(){
  return `<div class="firstrun"><div class="eyebrow" style="position:relative">First session</div><div class="fr-title">Open your ledger</div><p>Your first session sets the baseline every score is measured against. Log a full rotation and the portfolio, models and coach come alive.</p></div>`;
}
function renderHead(active){
  let ovr=0;try{ovr=computeProfile().overall}catch(_){ovr=0}
  const tabs=[['home','Home','home'],['summary','Summary','chart'],['weekly','Coach','coach'],['history','Log','log'],['data','Data','data']];
  const b=blockInfo();
  const blockChip=(state.settings.advancedMode&&b&&!b.done)?`<button class="sync-chip blk" data-action="weekly" title="Training block">${esc(b.phase)} · wk ${b.week}/${b.weeks}</button>`:'';
  return `<div class="head"><div class="appbar"><div class="brand"><div class="mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2.5 12h2M19.5 12h2M6.5 12h11" stroke-width="1.8" stroke-linecap="round"/><rect x="4.5" y="7.5" width="2" height="9" rx="1"/><rect x="17.5" y="7.5" width="2" height="9" rx="1"/><rect x="8" y="5.5" width="2.2" height="13" rx="1.1"/><rect x="13.8" y="5.5" width="2.2" height="13" rx="1.1"/></svg></div><div class="brand-copy"><div class="bt">Brunian <span>Lifts</span></div><div class="bs">${renderSyncChip()}${blockChip}</div></div></div><div class="ovr-mini" title="Overall score"><span>OVR</span><b style="color:${scoreColor(ovr)}">${ovr}</b></div></div></div>
  <nav class="nav ${active==='workout'?'nav--session':''}" aria-label="Main navigation">${tabs.map(([k,l,ic])=>`<button class="${active===k?'active':''}" role="tab" aria-selected="${active===k}" data-action="${k}">${icon(ic)}<span class="nav-l">${l}</span></button>`).join('')}</nav>`;
}
function renderToast(){return toast?`<div class="toast" role="status">${esc(toast)}</div>`:''}
function renderHealthBanner(){
  const h=storageHealth();
  if(h.level==='ok')return'';
  return `<div class="banner ${h.level}"><strong>${h.level==='bad'?'Storage blocked':'Storage warning'}</strong><div>${esc(h.msg)}</div></div>`;
}
function renderRecoveryBanner(){
  if(state.__recoveredFrom)return `<div class="banner warn"><strong>Recovered from snapshot</strong><div>The main save was unreadable, so the latest snapshot was loaded (${esc(String(state.__recoveredFrom).replace(SNAP_PREFIX,''))}). Check Data → Snapshots.</div></div>`;
  if(state.__quarantined)return `<div class="banner bad"><strong>Save file was unreadable</strong><div>The raw data was quarantined, nothing was deleted. Open Data → Snapshots to restore, or export the quarantined payload.</div></div>`;
  return'';
}

function renderRadar(profile,best){const axes=radarAxes(),n=axes.length,cx=170,cy=155,maxR=108,pts=[];for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n;pts.push({x:cx+Math.cos(a)*maxR,y:cy+Math.sin(a)*maxR,a})}const poly=vals=>vals.map((v,i)=>`${cx+Math.cos(pts[i].a)*maxR*v/100},${cy+Math.sin(pts[i].a)*maxR*v/100}`).join(' ');return`<div class="radar-wrap"><svg class="radar" viewBox="0 0 340 310" aria-label="Score radar">${[25,50,75,100].map(r=>`<polygon points="${pts.map(p=>`${cx+(p.x-cx)*r/100},${cy+(p.y-cy)*r/100}`).join(' ')}" fill="none" stroke="var(--gridline)"/>`).join('')}${pts.map(p=>`<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="var(--gridline2)"/>`).join('')}<polygon points="${poly(axes.map(a=>best[a.key]||0))}" fill="none" stroke="var(--series2)" stroke-width="1.25" stroke-dasharray="3 4" opacity=".55"/><polygon class="radar-cur" points="${poly(axes.map(a=>profile[a.key]||0))}" fill="rgba(var(--gold-rgb),.22)" stroke="var(--gold2)" stroke-width="2.5"/>${pts.map((p,i)=>{const lx=cx+Math.cos(p.a)*(maxR+34),ly=cy+Math.sin(p.a)*(maxR+24);return`<text x="${lx}" y="${ly}" text-anchor="middle" font-size="11">${axes[i].label}</text><text class="num" x="${lx}" y="${ly+14}" text-anchor="middle">${profile[axes[i].key]}</text>`}).join('')}</svg><div class="legend"><span><i class="dot" style="background:var(--gold2)"></i>Current</span><span><i class="dot" style="background:var(--series2)"></i>Best</span></div></div>`}

/* Signature element: session progress rendered as a barbell loading plates. */
function renderBarbell(pct){
  const plates=Math.round(clamp(pct,0,100)/100*10); // 5 per side
  const side=(n,flip)=>Array.from({length:5},(_,i)=>{const on=(flip?i>=5-n:i<n);return`<span class="plate p${flip?5-i:i+1} ${on?'on':''}"></span>`}).join('');
  const L=Math.min(5,Math.ceil(plates/2)), R=Math.min(5,Math.floor(plates/2));
  return `<div class="barload" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Session completion ${pct}%"><span class="collar"></span>${side(L,true)}<span class="bar"></span>${side(R,false)}<span class="collar"></span></div>`;
}

function renderHeatmap(){
  const counts={};sortedSessions().forEach(s=>counts[s.date]=(counts[s.date]||0)+1);
  const month=new Date();month.setDate(1);month.setHours(0,0,0,0);month.setMonth(month.getMonth()+calendarOffset);
  const year=month.getFullYear(),monthIndex=month.getMonth(),days=new Date(year,monthIndex+1,0).getDate(),lead=(month.getDay()+6)%7;
  const cells=[];for(let i=0;i<lead;i++)cells.push('<span class="cal-day outside" aria-hidden="true"></span>');
  for(let n=1;n<=days;n++){const d=new Date(year,monthIndex,n),k=localDateKey(d),sessions=counts[k]||0,isFuture=d>new Date();cells.push(`<span class="cal-day ${sessions?'trained':''} ${sessions>1?'double':''} ${k===today()?'today':''} ${isFuture?'future':''}" title="${k}${sessions?` · ${sessions} session${sessions>1?'s':''}`:' · Rest day'}"><b>${n}</b>${sessions?`<i>${sessions>1?sessions:'✓'}</i>`:''}</span>`)}
  while(cells.length%7)cells.push('<span class="cal-day outside" aria-hidden="true"></span>');
  const label=month.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  return `<div class="card calendar-card"><div class="row calendar-title" style="padding-top:0"><div><strong>Training calendar</strong><div class="small faint">Completed workout dates · ${weekStreak()} week streak</div></div><div class="calendar-nav"><button class="cal-nav" data-action="calendar-prev" aria-label="Previous month">‹</button><span>${esc(label)}</span><button class="cal-nav" data-action="calendar-next" aria-label="Next month" ${calendarOffset>=0?'disabled':''}>›</button></div></div><div class="calendar-weekdays">${['M','T','W','T','F','S','S'].map(x=>`<span>${x}</span>`).join('')}</div><div class="training-calendar">${cells.join('')}</div><div class="calendar-key small faint"><span><i class="key-dot trained"></i>Trained</span><button data-action="calendar-current" ${calendarOffset===0?'disabled':''}>Current month</button></div></div>`;
}

function renderMuscleVolume(){
  const v=weeklyMuscleSets();
  const inPlan=new Set(allExercises().map(ex=>ex.muscle));
  const rows=MUSCLES.filter(m=>!LEG_MUSCLES.includes(m)||inPlan.has(m)||v[m]>0).map(m=>{
    const sets=v[m],lo=10,hi=20,pct=clamp(sets/hi*100,0,100);
    const tone=sets>=lo?(sets<=hi?'good':'high'):'low';
    return `<div class="mv-row"><span class="mv-name">${MUSCLE_LABEL[m]}</span><span class="mv-bar"><i class="mv-band"></i><i class="mv-fill ${tone}" style="width:${pct}%"></i></span><span class="mv-num mono">${sets}</span></div>`;
  }).join('');
  return `<div class="card"><div class="row" style="padding-top:0"><div><strong>Weekly muscle volume</strong><div class="small faint">Hard sets, last 7 days. Band marks the 10–20 set range.</div></div></div><div class="mv">${rows}</div></div>`;
}

function renderTrainingTracker(){const set=new Set(state.sessions.map(s=>s.date));let dots='';for(let i=13;i>=0;i--){const d=dateDaysAgo(i);const done=set.has(d);const cls=done?'done':(i>0?'missed':'today');dots+=`<div class="tracker-dot ${cls}" title="${d}"></div>`}const s=trainingSummary();return`<div class="card"><div class="row" style="padding-top:0"><div><strong>Training tracker</strong><div class="small faint">Last session: ${s.last?`${s.last.date} · Day ${s.last.day}`:'None yet'}</div></div><div class="mono">Missed ${s.missed}</div></div><div class="tracker-days">${dots}</div></div>`}

function renderTodayTargets(dayIndex){const day=planDay(dayIndex);const cards=day.groups.flatMap(g=>g.exercises).map(ex=>{const last=latestEntryFor(ex),target=targetEntry(ex),impact=targetImpact(ex);return`<div class="row"><div><strong>${esc(ex.name)}</strong><div class="small faint">Last: ${esc(fmtEntry(last))}</div><div class="small muted">Target: ${esc(fmtEntry(target))}</div></div><div class="mono" style="color:var(--gold2)">+${impact}</div></div>`}).join('');return`<div class="card"><div class="eyebrow">Today's target</div><div class="small muted" style="margin-top:7px">Beat these numbers to move the score. Targets come from your latest logged performance.</div>${cards}</div>`}

/* Readiness gauge — acute:chronic ratio on a zoned band. */
function renderReadiness(detail){
  const r=readinessInfo();
  if(!r.ready)return detail?`<div class="card"><div class="row" style="padding-top:0"><div><strong>Load management</strong><div class="small faint">Acute vs chronic training load</div></div></div><div class="small muted" style="margin-top:6px">${esc(r.msg)}</div></div>`:'';
  const pos=clamp(r.ratio/2,0,1)*100;
  const gauge=`<div class="ready-band" role="img" aria-label="Load ratio ${r.ratio}"><i class="rb-zone z1"></i><i class="rb-zone z2"></i><i class="rb-zone z3"></i><i class="rb-zone z4"></i><i class="rb-marker" style="left:${pos}%"></i></div><div class="bar-labs"><span>0.8</span><span>1.3</span><span>1.5</span></div>`;
  const chip=`<div class="rank" style="color:${readinessColor(r.status)}">${esc(r.label)}</div>`;
  if(!detail)return`<div class="card"><div class="row" style="padding-top:0"><div><strong>Training load</strong><div class="small faint">This week vs your 4-week base · ratio ${r.ratio}</div></div>${chip}</div>${gauge}<div class="small muted" style="margin-top:9px">${esc(r.advice)}</div></div>`;
  return`<div class="card"><div class="row" style="padding-top:0"><div><strong>Load management</strong><div class="small faint">Acute:chronic workload ratio</div></div>${chip}</div>${gauge}
  <div class="grid3" style="margin-top:13px"><div class="metric"><div class="num">${r.ratio}</div><div class="lab">Ratio</div></div><div class="metric"><div class="num">${Math.round(r.acute/1000*10)/10}t</div><div class="lab">7-day load</div></div><div class="metric"><div class="num">${r.avgRpe!=null?('@'+r.avgRpe):(Math.round(r.chronic/1000*10)/10+'t')}</div><div class="lab">${r.avgRpe!=null?'Avg effort':'Weekly base'}</div></div></div>
  <div class="small muted" style="margin-top:9px">${esc(r.advice)}</div></div>`;
}
/* Training block manager — advanced mode, lives in the Coach view. */
function renderBlockCard(){
  if(!state.settings.advancedMode)return'';
  const b=blockInfo();
  if(!b)return`<div class="card"><div class="row" style="padding-top:0"><div><strong>Training block</strong><div class="small faint">Plan a mesocycle: build weeks, then a deload week with loads prefilled 10% lighter.</div></div></div><div class="session-actions" style="margin-top:10px"><button class="secondary gold" data-action="block-start" data-weeks="4">Start 4-week block</button><button class="secondary" data-action="block-start" data-weeks="6">6-week</button></div></div>`;
  if(b.done)return`<div class="card"><div class="row" style="padding-top:0"><div><strong>Training block complete</strong><div class="small faint">${b.weeks} weeks finished — nice work. Start the next one when ready.</div></div></div><div class="session-actions" style="margin-top:10px"><button class="secondary gold" data-action="block-start" data-weeks="4">Start new 4-week block</button><button class="secondary" data-action="block-end">Clear</button></div></div>`;
  const dots=Array.from({length:b.weeks},(_,i)=>{const wk=i+1;const cls=wk<b.week?'past':wk===b.week?'now':'';const dl=wk===b.weeks?' dl':'';return`<span class="blk-dot ${cls}${dl}" title="Week ${wk}${wk===b.weeks?' · deload':''}"></span>`}).join('');
  return`<div class="card"><div class="row" style="padding-top:0"><div><strong>Training block · ${esc(b.phase)}</strong><div class="small faint">Week ${b.week} of ${b.weeks}${b.deload?' — session prefill is 10% lighter at floor reps':''}</div></div><div class="pill">${b.week}/${b.weeks}</div></div><div class="blk-dots">${dots}</div>${b.deload?'<div class="banner warn" style="margin-top:11px"><strong>Deload week</strong><div>Move well, keep reps crisp, leave the gym fresh. Loads rebuild next block.</div></div>':''}<div class="session-actions" style="margin-top:10px"><button class="secondary danger" data-action="block-end">End block</button></div></div>`;
}
function renderHome(){
  const p=computeProfile(),b=bestProfile(),sum=trainingSummary(),next=planDay(state.session?state.session.dayIndex:state.currentDayIndex);
  const deload=deloadAdvice();
  let todayBanner='';
  if(state.session){todayBanner=`<button class="today-cta" data-action="workout"><strong>Session in progress · Day ${planDay(state.session.dayIndex).id}</strong><div>Tap to resume logging your sets.</div></button>`;}
  else if(!state.sessions.length){todayBanner=`<div class="today-cta"><strong>Open your ledger</strong><div>Log Day ${next.id} · ${esc(next.name)} to set the baseline every score is measured against.</div></div>`;}
  else{const _m=state.sessions.length>=2?whatIf()[0]:null;todayBanner=`<button class="today-cta" data-action="start" data-day="${state.currentDayIndex}"><strong>Today · Day ${next.id} — ${esc(next.name)}</strong><div>${_m?`Highest-leverage move: ${esc(_m.ex.name)} → ${esc(fmtEntry(_m.t))} for +${_m.delta} OVR.`:'Beat your targets to move the score.'}</div></button>`;}
  const fresh=!state.sessions.length&&!state.session;
  return `<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('home')}${renderRecoveryBanner()}${renderHealthBanner()}${todayBanner}
  <div class="home-grid"><div class="hg-main">
  <section class="hero"><div class="eyebrow">Strength ledger</div><div class="level-head"><div><div class="level" style="color:${scoreColor(p.overall)}">${p.overall}</div><div class="sub">100 is your goal standard. The score updates only from logged performance.</div></div><div class="rank" style="color:${scoreColor(p.overall)}">${rank(p.overall)}</div></div>${fresh?renderFirstRun(next):renderRadar(p,b)}<button class="primary" data-action="start" data-day="${state.session?state.session.dayIndex:state.currentDayIndex}">${state.session?'Resume workout':'Start Day '+next.id+' · '+esc(next.name)}</button></section>
  ${fresh?'':renderTodayTargets(state.currentDayIndex)}
  </div><div class="hg-side">
  ${deload.map(d=>`<div class="banner warn"><strong>Deload advised</strong><div>${esc(d)}</div></div>`).join('')}
  ${fresh?'':`<div class="grid3"><div class="metric"><div class="num">${sum.weekly}</div><div class="lab">This week</div></div><div class="metric"><div class="num">${sum.total}</div><div class="lab">Sessions</div></div><div class="metric"><div class="num">${sum.prs}</div><div class="lab">PRs</div></div></div>`}
  ${fresh?'':renderReadiness(false)}
  ${fresh?'':renderHeatmap()}
  ${fresh?'':renderMuscleVolume()}
  </div></div>
  <div class="section"><h2>Rotation</h2><span>Next: Day ${next.id}</span></div>
  <div class="grid3 rot-grid">${state.program.map((d,i)=>`<button class="day ${i===state.currentDayIndex?'active':''}" data-action="start" data-day="${i}"><div class="daytop">DAY ${d.id}</div><div class="dayname">${esc(d.name)}</div><div class="small faint" style="margin-top:4px">${esc(d.focus)}</div></button>`).join('')}</div>
  <div class="duo">
  <div class="card body"><div><strong>Bodyweight</strong><div class="small faint">${state.bodyLog.length?`Logged ${state.bodyLog.length} times · last ${esc(state.bodyLog[state.bodyLog.length-1].date)}`:'Tap + / − then Log to build a trend.'}</div></div><div class="body-controls"><button class="secondary" data-action="bw" data-dir="-1" aria-label="Decrease bodyweight">−</button><div class="pill">${bodyweight()}KG</div><button class="secondary" data-action="bw" data-dir="1" aria-label="Increase bodyweight">+</button><button class="secondary gold" data-action="bw-log">Log</button></div></div>
  ${state.bodyLog.length>1?`<div class="card">${renderTrendSvgRaw(state.bodyLog.map(x=>({value:x.kg,date:x.date})),null,'KG')}</div>`:''}
  </div>
  <div class="section"><h2>Command center</h2><span>Tools</span></div>
  <div class="tool-grid">
    <button class="tool" data-action="weekly"><span class="tool-ic">${icon('coach')}</span><strong>Coach & tracker</strong><span>Weekly review, weak points, deload and projection.</span></button>
    <button class="tool" data-action="prs"><span class="tool-ic">${icon('pr')}</span><strong>PR timeline</strong><span>Every personal record in order, with values.</span></button>
    <button class="tool" data-action="achievements"><span class="tool-ic">${icon('star')}</span><strong>Achievements</strong><span>Points and long-term milestones.</span></button>
    <button class="tool" data-action="program"><span class="tool-ic">${icon('edit')}</span><strong>Edit program</strong><span>Swap exercises from the bank, change sets, reps and loads.</span></button>
    <button class="tool" data-action="portfolio"><span class="tool-ic">${icon('portfolio')}</span><strong>Strength portfolio</strong><span>Lifts as positions: returns, volatility, drawdown, ratings.</span></button>
    <button class="tool" data-action="analyst"><span class="tool-ic">${icon('analyst')}</span><strong>Analyst desk</strong><span>Research note on your body + highest-leverage next move.</span></button>
    <button class="tool" data-action="data"><span class="tool-ic">${icon('data')}</span><strong>Data center</strong><span>Cloud sync, snapshots, export, import.</span></button>
  </div></div>`;
}

function renderRestBar(){
  if(!restUntil)return'<div id="restbar"></div>';
  const C=138.2, off=(1-restFrac())*C;
  return `<div id="restbar" class="restbar"><div class="rest-left"><svg class="rest-ring" width="48" height="48" viewBox="0 0 48 48"><circle class="rt" cx="24" cy="24" r="22"/><circle class="rp" id="rest-ring" cx="24" cy="24" r="22" stroke-dasharray="${C}" stroke-dashoffset="${off}"/></svg><div><div class="eyebrow">Rest</div><div class="resttime mono" id="rest-time">${restLabel()}</div></div></div><div class="rest-actions"><button class="restbtn" data-action="rest-sub">−15</button><button class="restbtn" data-action="rest-add">+15</button><button class="restbtn skip" data-action="clear-rest">Skip</button></div></div>`;
}
function restFrac(){if(!restUntil||!restTotal)return 0;return Math.max(0,Math.min(1,(restUntil-Date.now())/(restTotal*1000)))}

function renderWorkout(){
  const day=planDay(openDay),c=completion();
  const prevNote=previousSameDay(openDay)?.note;
  return `<div class="shell has-finish"><div id="toast-slot">${renderToast()}</div>${renderHead('workout')}
  <button class="back" data-action="home">‹ Home</button>
  <div class="level-head" style="margin-top:8px"><div><div class="eyebrow">In session · <span id="sess-clock">${Math.floor((Date.now()-(state.session?.startedAt||Date.now()))/60000)} min</span></div><div class="title">Day ${day.id} <em>${esc(day.name)}</em></div></div><div class="pill">${c.done}/${c.total}</div></div>
  <div class="switcher">${state.program.map((d,i)=>`<button class="switch ${i===openDay?'active':''}" data-action="switch-day" data-day="${i}">${d.id}</button>`).join('')}</div>
  ${inDeload()?'<div class="banner warn"><strong>Deload week</strong><div>Loads are prefilled 10% lighter at floor reps. Keep every rep crisp and leave fresh — the block restarts next week.</div></div>':''}
  ${(state.session?.removedExercises||[]).length?'<div class="banner warn"><strong>Exercise removed for today</strong><div>Its planned sets remain incomplete and will reduce this session’s completion grade.</div></div>':''}
  ${prevNote?`<div class="card flat note-echo"><span class="eyebrow">Last time you wrote</span><div class="small muted" style="margin-top:5px">${esc(prevNote)}</div></div>`:''}
  <div class="prog">${renderBarbell(c.pct)}<div class="mono small muted" style="text-align:right">${c.pct}%</div></div>
  <div class="groups-grid">${day.groups.map(g=>renderGroup(g,openDay)).join('')}</div>
  <div class="section"><h2>Session notes</h2><span>Optional</span></div>
  <textarea class="notes" data-action="note" placeholder="Energy, sleep, pain, technique notes">${esc(state.session?.note||'')}</textarea>
  ${renderRestBar()}
  <div class="finish-bar"><div class="finish-inner"><button class="finish" data-action="finish">Finish session</button></div></div></div>`;
}
function renderGroup(g,dayIndex){return`<section class="group"><div class="group-head"><div><div class="group-name">${esc(g.id)} · ${esc(g.name)}</div><div class="group-rule">${esc(g.rule)}</div></div><button class="round-btn" data-action="round">Round done</button></div>${g.exercises.map(base=>({base,ex:sessionExercise(base)})).filter(x=>!state.session?.removedExercises?.includes(x.ex.id)).map(x=>renderExercise(x.ex,dayIndex,g.id,x.base.id)).join('')}</section>`}
function renderMedia(ex){return`<div class="media"><img src="${CLIP_BASE+esc(ex.clip||'')}" alt="${esc(ex.name)} demo" loading="lazy" onerror="this.parentElement.classList.add('failed');this.remove()"><span class="media-fallback">Demo unavailable offline — logging still works.</span></div>`}
/* The coaching layer. Four blocks in the order you need them at the rack: set
   up, perform, what actually drives growth, and the mistake to avoid. Falls back
   to the exercise's own cue list when no coaching entry exists. */
function renderTechnique(ex){
  const c=COACHING[ex.id];
  if(!c) return renderMedia(ex)+((ex.cues||[]).length?`<div class="cues"><ul>${(ex.cues||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:'<div class="small faint">No written guide for this movement yet — follow the demo above.</div>');
  const bl=(title,items,cls)=>items&&items.length?`<div class="coach-block ${cls}"><div class="coach-h">${title}</div><ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:'';
  /* The clips are anatomical renders, so the form in them is idealised rather
     than sloppy. What they get wrong is what they leave out: camera angles that
     hide the decisive cue, no pauses, and a fixed depth. Where that has been
     checked frame by frame, the panel says so instead of implying the clip is
     a model to copy exactly. */
  const demo=c.demo?`<div class="demo-note"><div class="coach-h">About this demo</div><p>${esc(c.demo)}</p></div>`:'';
  return renderMedia(ex)+demo
    +`<div class="coach">${bl('Set up',c.setup,'')}${bl('Perform the rep',c.execute,'')}${bl('What drives growth',c.grow,'grow')}${bl('Common mistakes',c.mistakes,'warn')}</div>`;
}
/* Three same-stimulus options, each with the load he should start on, swapped
   for today only through the existing session-swap path. */
function renderAlternatives(ex,groupId,baseId){
  const alts=alternativesFor(ex);
  if(!alts.length) return '<div class="small faint">No close match in the bank for this movement.</div>';
  const active=new Set(sessionExercises().map(x=>x.id));
  return `<div class="small muted" style="margin-bottom:9px">Same muscle, same joint action. Swapping keeps your score — the load below is estimated from your own training.</div>
  <div class="alt-list">${alts.map(b=>{
    const taken=active.has(b.id);
    return `<button class="alt-card" data-action="alt-pick" data-alt="${esc(b.id)}" data-group="${esc(groupId)}" data-base="${esc(baseId)}" ${taken?'disabled':''}>
      <span class="alt-media"><img src="${CLIP_BASE+esc(b.clip)}" alt="" loading="lazy" onerror="this.style.display='none'"></span>
      <span class="alt-copy"><span class="alt-name">${esc(b.name)}</span><span class="alt-meta">${esc(b.equipment)} · ${b.min}–${b.max} reps · ${taken?'already in today':'start '+esc(altPreview(b,ex.sets))}</span></span>
    </button>`;
  }).join('')}</div>`;
}
function renderExercise(ex,dayIndex,groupId,baseId=ex.id){
  const d=state.session?.draft?.[ex.id]||targetEntry(ex),done=state.session?.setDone?.[ex.id]||[],last=latestEntryFor(ex),target=targetEntry(ex),score=scoreFromEntry(ex,last),earned=(d.reps||[]).every(r=>r>=ex.max),weakR=Math.min(...(d.reps||[ex.min])),fill=clamp((weakR-ex.min)/Math.max(1,ex.max-ex.min),0,1),warmups=Array.isArray(d.warmups)?d.warmups:[];
  const plates=ex.equipment==='barbell'&&Number(d.weight)>Number(state.settings.barWeight||20)?plateFor(d.weight):null;
  /* Order is the design: identity, load, then the set log. Everything you
     only occasionally need — adjustments, the demo, the cues — sits behind a
     disclosure so the card ends at the thing you actually came to tap. */
  return `<article class="exercise" id="ex-${esc(ex.id)}">
  <div class="ex-head"><div><div class="ex-name">${esc(ex.name)}</div><div class="ex-meta">${d.estimatedFromMuscle?'Estimated from similar '+esc(MUSCLE_LABEL[ex.muscle].toLowerCase())+' lifts · ':''}Last: ${esc(fmtEntry(last))} · Target: ${esc(fmtEntry(target))}</div></div><button class="tag" data-action="exercise" data-ex="${ex.id}">Score ${score}</button></div>
  <div class="range"><div class="bar"><div class="fill ${earned?'earned':''}" style="width:${fill*100}%"></div></div><div class="bar-labs"><span>${ex.min} reps</span><span>${earned&&ex.scoreMode!=='reps'?'Next load +'+ex.inc+'KG':'Top '+ex.max}</span></div></div>
  <div class="step-grid"><div><div class="step-label">Work weight</div><div class="step-controls"><button class="step-btn" data-action="step" data-ex="${ex.id}" data-kind="weight" data-dir="-1" aria-label="Decrease weight">−</button><input class="step-val num-in" inputmode="decimal" type="number" step="0.5" min="0" max="500" value="${d.weight}" data-num="weight" data-ex="${ex.id}" aria-label="Work weight in KG"><button class="step-btn" data-action="step" data-ex="${ex.id}" data-kind="weight" data-dir="1" aria-label="Increase weight">+</button></div>${plates?`<div class="plates small faint">Per side: ${plates.perSide.join(' + ')||'bar only'}${plates.rem?` (+${plates.rem} short)`:''} · bar ${plates.bar}KG</div>`:''}</div></div>
  ${warmups.length?renderWarmups(ex,warmups):''}
  <div class="setlog-head"><span>Work set log</span><span>${done.filter(Boolean).length}/${(d.reps||[]).length} done</span></div>
  <div class="setlog">${(d.reps||[]).map((r,i)=>renderSetRow(ex,i,r,last.reps?.[i]??last.reps?.[0]??ex.min,Boolean(done[i]))).join('')}</div>
  ${panel(ex.id+':adjust','Adjust',`<div class="set-actions"><button class="mini-btn" data-action="fill-last" data-ex="${ex.id}">Same as last</button><button class="mini-btn" data-action="fill-target" data-ex="${ex.id}">Fill target</button><button class="mini-btn" data-action="add-set" data-ex="${ex.id}">Add set</button><button class="mini-btn" data-action="remove-set" data-ex="${ex.id}">Remove set</button><button class="mini-btn gold" data-action="add-warmup" data-ex="${ex.id}">Add warmup</button>${warmups.length?`<button class="mini-btn" data-action="remove-warmup" data-ex="${ex.id}">Remove warmup</button>`:''}<button class="mini-btn gold" data-action="session-swap" data-group="${groupId}" data-base="${baseId}">Swap similar</button><button class="mini-btn danger" data-action="session-remove" data-ex="${ex.id}">Remove today</button></div>`)}
  ${panel(ex.id+':tech','How to do this properly',renderTechnique(ex))}
  ${panel(ex.id+':alts','Swap this exercise',renderAlternatives(ex,groupId,baseId))}
  </article>`;
}
/* Collapsible section. Native <details> does the work; the open set survives
   the full re-render that follows every logged set. */
const openPanels = new Set();
function panel(key,label,body){return`<details class="ex-panel" data-panel="${esc(key)}"${openPanels.has(key)?' open':''}><summary>${esc(label)}</summary><div class="ex-panel-body">${body}</div></details>`}
function renderWarmups(ex,warmups){return`<div class="warmup-box"><div class="warmup-title">Warmup ramp</div>${warmups.map((w,i)=>`<div class="warmrow"><div class="prev">WU ${i+1}</div><div class="warm-step"><button data-action="step" data-ex="${ex.id}" data-kind="warmWeight" data-index="${i}" data-dir="-1" aria-label="Decrease warmup weight">−</button><div class="warm-val mono">${fmtKg(w.weight)}</div><button data-action="step" data-ex="${ex.id}" data-kind="warmWeight" data-index="${i}" data-dir="1" aria-label="Increase warmup weight">+</button></div><div class="warm-step"><button data-action="step" data-ex="${ex.id}" data-kind="warmReps" data-index="${i}" data-dir="-1" aria-label="Decrease warmup reps">−</button><div class="warm-val mono">${w.reps}</div><button data-action="step" data-ex="${ex.id}" data-kind="warmReps" data-index="${i}" data-dir="1" aria-label="Increase warmup reps">+</button></div><button class="warm-log ${w.done?'is-done':''}" data-action="log-warmup" data-ex="${ex.id}" data-index="${i}">${w.done?'✓':'Log'}</button></div>`).join('')}</div>`}
function renderSetRow(ex,i,r,prev,done){
  const adv=Boolean(state.settings.advancedMode);
  const rpe=adv?(Number(state.session?.draft?.[ex.id]?.rpe?.[i])||0):0;
  const rpeBtn=adv?`<button class="rpe-btn ${rpe?'on':''}" data-action="rpe" data-ex="${ex.id}" data-index="${i}" title="Tap to cycle effort (RPE)" aria-label="Set ${i+1} RPE">${rpe?('@'+rpe):'RPE'}</button>`:'';
  return`<div class="setrow ${done?'done':''} ${adv?'adv':''}"><div class="setn">SET ${i+1}</div><div class="prev">PREV<br>${prev}</div><div class="rep-step"><button class="step-btn" data-action="step" data-ex="${ex.id}" data-kind="reps" data-index="${i}" data-dir="-1" aria-label="Decrease reps">−</button><input class="rep-val num-in" inputmode="numeric" type="number" step="1" min="0" max="100" value="${r}" data-num="reps" data-index="${i}" data-ex="${ex.id}" aria-label="Set ${i+1} reps"><button class="step-btn" data-action="step" data-ex="${ex.id}" data-kind="reps" data-index="${i}" data-dir="1" aria-label="Increase reps">+</button></div>${rpeBtn}<button class="set-log ${done?'is-done':''}" data-action="logset" data-ex="${ex.id}" data-index="${i}">${done?'✓ Done':'Log'}</button></div>`}

function renderMaxChart(){const rows=uniqueExercises().map(ex=>{const curr=entryEst(ex,latestEntryFor(ex)),avg=entryEst(ex,averageEntry(ex)),goal=goalEst(ex),scale=Math.max(goal,avg,curr,1)*1.1;return`<div class="stat-row" data-action="exercise" data-ex="${ex.id}"><div class="stat-top"><div><div class="stat-name">${esc(ex.name)}</div><div class="small faint">Current ${Math.round(curr)} · Reference ${Math.round(avg)} · Goal ${Math.round(goal)}</div></div><div class="stat-num" style="color:${scoreColor(scoreFromEntry(ex,latestEntryFor(ex)))}">${scoreFromEntry(ex,latestEntryFor(ex))}</div></div><div class="stat-bar"><span class="stat-average" style="width:${clamp(avg/scale*100,0,100)}%"></span><span class="stat-current" style="width:${clamp(curr/scale*100,0,100)}%"></span><span class="stat-goal" style="left:${clamp(goal/scale*100,0,100)}%"></span></div></div>`}).join('');return`<div class="card"><div class="legend"><span><i class="dot" style="background:var(--series)"></i>Current est max</span><span><i class="dot" style="background:rgba(var(--ink-rgb),.14)"></i>Reference</span><span><i class="dot" style="background:var(--ink2)"></i>Goal</span></div>${rows}</div>`}

function renderSummary(){const p=computeProfile(),b=bestProfile(),sum=trainingSummary();const advice=nextScoreAdvice();return`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('summary')}<section class="hero"><div class="eyebrow">Summary sheet</div><div class="level-head"><div><div class="title" style="color:${scoreColor(p.overall)}">Overall ${p.overall}</div><div class="sub">Current performance against your 100-score goal standards.</div></div><div class="rank" style="color:${scoreColor(p.overall)}">${rank(p.overall)}</div></div></section><div class="grid3"><div class="metric"><div class="num">${sum.total}</div><div class="lab">Sessions</div></div><div class="metric"><div class="num">${sum.prs}</div><div class="lab">PRs</div></div><div class="metric"><div class="num">${bodyweight()}</div><div class="lab">Body KG</div></div></div><div class="section"><h2>Next score increase</h2><span>Actionable</span></div><div class="card"><ol class="feedback-list">${advice.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div><div class="section"><h2>Strength ledger</h2><span>Tap a lift</span></div>${renderMaxChart()}<div class="section"><h2>Category sheet</h2><span>Current vs best</span></div><div class="card">${radarAxes().map(a=>`<div class="row"><div><strong>${a.label}</strong><div class="small faint">Best ${b[a.key]}</div></div><div class="mono" style="color:${scoreColor(p[a.key])}">${p[a.key]}</div></div>`).join('')}</div></div>`}

function renderWeekly(){const list=weeklyWindow(),weak=weakPoint(),proj=projection();let best='None yet',bestScore=-1;for(const ex of uniqueExercises()){const sc=scoreFromEntry(ex,latestEntryFor(ex));if(sc>bestScore){bestScore=sc;best=ex.name}}const worst=weak.exercises[0]?.ex.name||'None yet';const stuck=uniqueExercises().map(ex=>({ex,p:plateauInfo(ex)})).filter(x=>x.p.stuck);const deload=deloadAdvice();return`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('weekly')}<section class="hero"><div class="eyebrow">Weekly review</div><div class="title">${list.length} session${list.length===1?'':'s'}</div><div class="sub">A coaching summary for the last seven days.</div></section><div class="grid2"><div class="metric"><div class="num">${totalVolumeForSessions(list)}</div><div class="lab">KG volume</div></div><div class="metric"><div class="num">${list.reduce((s,x)=>s+(x.prs?x.prs.length:0),0)}</div><div class="lab">PRs</div></div><div class="metric"><div class="num">${trainingSummary().missed}</div><div class="lab">Missed days</div></div><div class="metric"><div class="num">${computeProfile().overall}</div><div class="lab">OVR</div></div></div>${deload.map(d=>`<div class="banner warn"><strong>Deload advised</strong><div>${esc(d)}</div></div>`).join('')}${renderReadiness(true)}${renderBlockCard()}${renderMuscleVolume()}<div class="section"><h2>Coach recommendation</h2><span>Next 7 days</span></div><div class="card"><div class="row"><div><strong>Weakest area: ${weak.area.label}</strong><div class="small faint">Best focus: ${weak.exercises.map(x=>x.ex.name).join(' and ')||'Log more data'}</div></div><div class="mono" style="color:${scoreColor(weak.area.score)}">${weak.area.score}</div></div><ol class="feedback-list">${(weak.exercises.length?weak.exercises.map(x=>`Add 1 to 2 total reps on ${x.ex.name}, aiming for ${fmtEntry(targetEntry(x.ex))}.`):['Complete two more sessions to generate a target.']).map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>${stuck.length?`<div class="section"><h2>Plateau watch</h2><span>${stuck.length} lift${stuck.length===1?'':'s'}</span></div><div class="card">${stuck.map(x=>`<div class="row"><div><strong>${esc(x.ex.name)}</strong><div class="small faint">${x.p.since} sessions since the last estimated-max PR.</div></div><button class="secondary" data-action="exercise" data-ex="${x.ex.id}">Open</button></div>`).join('')}</div>`:''}<div class="section"><h2>Weekly facts</h2><span>Summary</span></div><div class="card"><div class="row"><span>Best exercise</span><strong>${esc(best)}</strong></div><div class="row"><span>Weakest exercise</span><strong>${esc(worst)}</strong></div><div class="row"><span>Projection</span><strong>${esc(proj.message)}</strong></div></div>${renderTrainingTracker()}</div>`}

function trendPoints(ex){return sessionsForEx(ex).map(x=>({date:x.session.date,value:entryEst(ex,x.entry),session:x.session,entry:x.entry}))}
/* ============ CHART ENGINE ================================================
   Charts are declared as specs during render and painted afterwards, once the
   host element's real width is known, so every SVG is drawn 1:1 in device
   pixels. The old charts used a fixed viewBox="0 0 330 140" stretched to a
   1400px column, which scaled 10px axis type up to ~40px on a laptop.
   ========================================================================== */
const CHARTS = new Map();
let chartSeq = 0;
function chartHost(spec,cls){const id='ch'+(++chartSeq);CHARTS.set(id,spec);return`<div class="chart-host ${cls||''}" id="${id}"></div>`}
function paintCharts(){
  for (const [id,spec] of CHARTS){
    const host=document.getElementById(id); if(!host) continue;
    const w=Math.max(220,host.clientWidth), h=Math.max(110,host.clientHeight);
    try{ host.innerHTML = spec.type==='model'?drawModel(spec,w,h):drawTrend(spec,w,h); }
    catch(_){ host.innerHTML=''; }
  }
}
/* Round an axis to human numbers so gridlines land on 5s and 10s, not 37.4. */
function niceBounds(lo,hi){
  if(!(hi>lo)){hi=lo+1}
  const span=hi-lo, mag=Math.pow(10,Math.floor(Math.log10(span/2||1)));
  const step=[1,2,2.5,5,10].map(m=>m*mag).find(x=>span/x<=4)||mag*10;
  return {lo:Math.floor(lo/step)*step, hi:Math.ceil(hi/step)*step, step};
}
/* A narrow range produces a sub-unit step, and rounding every tick to an
   integer then printed the same label repeatedly (a flat bodyweight week read
   "78 78 79 79 79"). Precision follows the step. */
function tickLabel(v,step){return step>=1?String(Math.round(v)):v.toFixed(step>=.5?1:2)}
function shortDate(d){try{return new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})}catch(_){return''}}
const PAD={l:40,r:16,t:16,b:24};
function drawTrend(spec,w,h){
  const pts=spec.points;
  if(!pts||pts.length<2)return`<div class="chart-empty">Two logged sessions draw the first line.</div>`;
  const vals=pts.map(p=>Number(p.value)||0);
  const pool=spec.goal!=null?[...vals,spec.goal]:vals;
  const b=niceBounds(Math.min(...pool),Math.max(...pool));
  const X=i=>PAD.l+i*(w-PAD.l-PAD.r)/Math.max(1,pts.length-1);
  const Y=v=>h-PAD.b-(v-b.lo)/(b.hi-b.lo)*(h-PAD.t-PAD.b);
  const poly=vals.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const area=`${X(0).toFixed(1)},${h-PAD.b} ${poly} ${X(pts.length-1).toFixed(1)},${h-PAD.b}`;
  const ticks=[];for(let v=b.lo;v<=b.hi+1e-9;v+=b.step)ticks.push(v);
  /* The unit rides on the top tick instead of getting its own label, which
     used to collide with it. */
  const grid=ticks.map((v,i)=>`<line class="grid" x1="${PAD.l}" y1="${Y(v).toFixed(1)}" x2="${w-PAD.r}" y2="${Y(v).toFixed(1)}"/><text class="ax" x="${PAD.l-8}" y="${(Y(v)+3.5).toFixed(1)}" text-anchor="end">${tickLabel(v,b.step)}${i===ticks.length-1&&spec.unit?' '+esc(spec.unit):''}</text>`).join('');
  const goalY=spec.goal!=null?Y(spec.goal):null;
  const first=pts[0].date?shortDate(pts[0].date):'', last=pts[pts.length-1].date?shortDate(pts[pts.length-1].date):'';
  /* Only the last point gets a dot: the line is the story, the dot is "you are here". */
  return`<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(spec.label||'Trend')}">
  ${grid}
  ${goalY!=null&&goalY>=PAD.t&&goalY<=h-PAD.b?`<line class="goal-line" x1="${PAD.l}" y1="${goalY.toFixed(1)}" x2="${w-PAD.r}" y2="${goalY.toFixed(1)}"/><text class="ax gold" x="${w-PAD.r}" y="${(goalY-6).toFixed(1)}" text-anchor="end">GOAL</text>`:''}
  <polygon class="area" points="${area}"/>
  <polyline class="line" points="${poly}" pathLength="1"/>
  <circle class="dotp" cx="${X(pts.length-1).toFixed(1)}" cy="${Y(vals[vals.length-1]).toFixed(1)}" r="3.5"/>
  ${first?`<text class="ax" x="${PAD.l}" y="${h-6}">${esc(first)}</text>`:''}
  ${last?`<text class="ax" x="${w-PAD.r}" y="${h-6}" text-anchor="end">${esc(last)}</text>`:''}
  </svg>`;
}
function drawModel(spec,w,h){
  const {v,fit,goal,fc}=spec, n=v.length, xmax=n-1+fc;
  const fitAt=i=>fit.slope*i+fit.intercept;
  const b=niceBounds(Math.min(...v,fitAt(xmax)-fit.rsd,goal),Math.max(...v,fitAt(xmax)+fit.rsd,goal));
  const X=i=>PAD.l+i*(w-PAD.l-PAD.r)/Math.max(1,xmax);
  const Y=val=>h-PAD.b-(val-b.lo)/(b.hi-b.lo)*(h-PAD.t-PAD.b);
  const ticks=[];for(let t=b.lo;t<=b.hi+1e-9;t+=b.step)ticks.push(t);
  const grid=ticks.map(t=>`<line class="grid" x1="${PAD.l}" y1="${Y(t).toFixed(1)}" x2="${w-PAD.r}" y2="${Y(t).toFixed(1)}"/><text class="ax" x="${PAD.l-8}" y="${(Y(t)+3.5).toFixed(1)}" text-anchor="end">${tickLabel(t,b.step)}</text>`).join('');
  const band=`${X(n-1)},${Y(fitAt(n-1)+fit.rsd)} ${X(xmax)},${Y(fitAt(xmax)+fit.rsd)} ${X(xmax)},${Y(fitAt(xmax)-fit.rsd)} ${X(n-1)},${Y(fitAt(n-1)-fit.rsd)}`;
  const goalY=Y(goal);
  return`<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(spec.label||'Progression model')}">
  ${grid}
  ${goalY>=PAD.t&&goalY<=h-PAD.b?`<line class="goal-line" x1="${PAD.l}" y1="${goalY.toFixed(1)}" x2="${w-PAD.r}" y2="${goalY.toFixed(1)}"/><text class="ax gold" x="${w-PAD.r}" y="${(goalY-6).toFixed(1)}" text-anchor="end">GOAL</text>`:''}
  <polygon class="fband" points="${band}"/>
  <polyline class="fit" points="${X(0)},${Y(fitAt(0))} ${X(n-1)},${Y(fitAt(n-1))}"/>
  <polyline class="fcast" points="${X(n-1)},${Y(fitAt(n-1))} ${X(xmax)},${Y(fitAt(xmax))}"/>
  <polyline class="line thin" points="${v.map((val,i)=>`${X(i).toFixed(1)},${Y(val).toFixed(1)}`).join(' ')}" pathLength="1"/>
  ${v.map((val,i)=>`<circle class="dotp" cx="${X(i).toFixed(1)}" cy="${Y(val).toFixed(1)}" r="2.5"/>`).join('')}
  <text class="ax" x="${X(n-1).toFixed(1)}" y="${h-6}" text-anchor="middle">NOW</text>
  <text class="ax" x="${w-PAD.r}" y="${h-6}" text-anchor="end">+${fc}</text>
  </svg>`;
}
/* Kept as the one entry point every view uses to ask for a trend line. */
function renderTrendSvgRaw(points,goal,unit,cls){return chartHost({type:'trend',points,goal,unit,label:unit?`Trend in ${unit}`:'Trend'},cls)}
function renderExerciseDetail(){const ex=exById(selectedExId),pts=trendPoints(ex),best=bestEntryFor(ex),latest=latestEntryFor(ex),target=targetEntry(ex);const sameWeight=pts.filter(p=>Number(p.entry.weight)===Number(latest.weight)).map(p=>bestReps(p.entry.reps));const plat=plateauInfo(ex);return`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('summary')}<button class="back" data-action="summary">‹ Summary</button><section class="hero"><div class="eyebrow">${esc(MUSCLE_LABEL[ex.muscle]||ex.muscle)} · ${esc(ex.equipment||'')}</div><div class="title">${esc(ex.name)}</div><div class="sub">Trend, PR history and the exact next number to beat.</div></section>${plat.stuck?`<div class="banner warn"><strong>Plateau</strong><div>${plat.since} sessions without an estimated-max PR. Options: hold the load and add one rep per set, add a back-off set, or swap the movement for 4 weeks in Edit program.</div></div>`:''}<div class="card">${renderTrendSvgRaw(pts,goalEst(ex),'')}</div><div class="grid2"><div class="metric"><div class="num">${Math.round(entryEst(ex,latest))}</div><div class="lab">Current est max</div></div><div class="metric"><div class="num">${Math.round(entryEst(ex,best.entry))}</div><div class="lab">Best est max</div></div><div class="metric"><div class="num">${Math.round(Math.max(0,...pts.map(p=>volumeEntry(p.entry))))}</div><div class="lab">Best volume</div></div><div class="metric"><div class="num">${sameWeight.length?Math.max(...sameWeight):bestReps(latest.reps)}</div><div class="lab">Best reps at load</div></div></div><div class="card"><div class="row"><span>Best date</span><strong>${esc(best.date)}</strong></div><div class="row"><span>Current target</span><strong>${esc(fmtEntry(target))}</strong></div><div class="row"><span>Goal standard</span><strong>${esc(fmtEntry(goalEntry(ex)))}</strong></div></div>${renderProgressionModel(ex)}${renderMedia(ex)}</div>`}

function renderPRs(){const feed=prFeed();return`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('home')}<button class="back" data-action="home">‹ Home</button><section class="hero"><div class="eyebrow">PR timeline</div><div class="title">${feed.length} record${feed.length===1?'':'s'}</div><div class="sub">Every personal record, newest first.</div></section><div class="card flat">${feed.length?feed.map(p=>`<div class="row"><div><strong>${esc(p.name)}</strong><div class="small faint">${esc(p.date)} · Day ${esc(p.day)} · ${esc(p.kind)}</div></div><div class="mono" style="color:var(--gold2)">${p.old}→${p.now}</div></div>`).join(''):'<div class="small faint">No PRs yet. They appear automatically when a logged session beats your best.</div>'}</div></div>`}

function renderAchievements(){const ach=achievements(),groups=[...new Set(ach.map(a=>a.g))],earned=ach.filter(a=>a.ok).reduce((s,a)=>s+a.pts,0),total=ach.reduce((s,a)=>s+a.pts,0),unlocked=ach.filter(a=>a.ok).length;return`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('home')}<button class="back" data-action="home">‹ Home</button><section class="hero"><div class="eyebrow">Achievement layer</div><div class="title">${unlocked}/${ach.length}</div><div class="sub">${earned}/${total} points unlocked. Milestones span 3 to 4 months of consistent training; harder goals are worth more.</div></section>${groups.map(g=>`<div class="section"><h2>${esc(g)}</h2><span>${ach.filter(a=>a.g===g&&a.ok).length}/${ach.filter(a=>a.g===g).length}</span></div>${ach.filter(a=>a.g===g).map(a=>`<div class="ach ${a.ok?'unlocked':''}"><div><div class="ach-title">${esc(a.n)}</div><div class="ach-sub">${esc(a.d)}</div></div><div class="ach-side"><div class="ach-pts">${a.pts} pts</div><div class="ach-badge">${a.ok?'Unlocked':esc(a.need)}</div></div></div>`).join('')}`).join('')}</div>`}

function renderHistory(){
  const q=historyQuery.trim().toLowerCase();
  const list=sortedSessions().slice().reverse().filter(s=>{if(!q)return true;const day=planDay(s.dayIndex);const names=Object.keys(s.entries).map(id=>exById(id).name).join(' ').toLowerCase();return s.date.includes(q)||String(s.day).toLowerCase().includes(q)||(day?.name||'').toLowerCase().includes(q)||names.includes(q)||(s.note||'').toLowerCase().includes(q)});
  let lastMonth='';
  const rows=list.map(s=>{const m=s.date.slice(0,7);const head=m!==lastMonth?`<div class="month-head">${new Date(m+'-02').toLocaleString('en-GB',{month:'long',year:'numeric'})}</div>`:'';lastMonth=m;return head+`<div class="row"><div><strong>Day ${esc(s.day)} · ${esc(planDay(s.dayIndex)?.name||'')}</strong><div class="small faint">${esc(s.date)} · ${s.durationMin||0} min · ${s.completion||100}% · grade ${esc(s.grade||'—')}${s.volume?` · ${s.volume}KG vol`:''}${s.rpe?` · @${s.rpe}`:''}</div>${s.note?`<div class="small muted">“${esc(s.note)}”</div>`:''}</div><div class="session-actions"><button class="secondary" data-action="edit-session" data-id="${s.id}">Edit</button><button class="secondary danger" data-action="delete-session" data-id="${s.id}">Delete</button></div></div>`}).join('');
  return `<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('history')}<section class="hero"><div class="eyebrow">Session history</div><div class="title">Edit or delete logs</div><div class="sub">Deleting is confirmed and undoable for a few seconds. Scores always recompute from the remaining history.</div></section><input class="search" type="search" placeholder="Search by date, day, exercise or note" value="${esc(historyQuery)}" data-search="history"><div class="card flat">${rows||'<div class="small faint">No sessions match.</div>'}</div></div>`;
}
function renderEditSession(){const s=state.sessions.find(x=>x.id===editingSessionId);if(!s){view='history';return renderHistory()}const ids=Object.keys(s.entries);return`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('history')}<button class="back" data-action="history">‹ History</button><section class="hero"><div class="eyebrow">Edit session</div><div class="title">Day ${esc(s.day)} · ${esc(s.date)}</div><div class="sub">Saving recomputes all current scores from the corrected history.</div></section>${ids.map(id=>{const ex=exById(id);const e=s.entries[id];return`<div class="card"><strong>${esc(ex.name)}</strong><div class="formgrid"><div class="field"><label>Weight</label><input type="number" step="0.5" data-edit-weight="${id}" value="${e.weight}"></div>${e.reps.map((r,i)=>`<div class="field"><label>Set ${i+1} reps</label><input type="number" step="1" data-edit-rep="${id}-${i}" value="${r}"></div>`).join('')}</div></div>`}).join('')}<div class="card"><div class="field"><label>Notes</label><textarea data-edit-note>${esc(s.note||'')}</textarea></div><button class="primary" data-action="save-edit-session">Save changes</button></div></div>`}

/* The two coached programmes, with the trade-off stated rather than implied.
   Neither is applied without a tap: silently rewriting somebody's training is
   not a migration. */
function renderPresetCard(){
  const cur=state.settings.programPreset||'';
  const row=(key,title,sub,sets,rec)=>`<div class="card flat preset ${cur===key?'is-on':''}">
    <div class="row" style="padding-top:0"><div><strong>${esc(title)}</strong>${rec?'<span class="pill gold" style="margin-left:7px">Recommended</span>':''}<div class="small faint">${esc(sub)}</div></div>
    <button class="secondary ${cur===key?'':'gold'}" data-action="apply-preset" data-preset="${key}"${cur===key?' disabled':''}>${cur===key?'Active':'Apply'}</button></div>
    <div class="small muted" style="margin-top:2px">${esc(sets)}</div></div>`;
  return `<div class="section"><h2>Coached programs</h2><span>Pick one</span></div>
  <div class="card"><div class="small muted" style="margin-top:0">Both fix the problems in the old routine: no two rows back to back, the chest-adduction slot moved to cables, and each session built around one clear job. Applying a program never touches your logged history.</div>
  ${row('withLegs','Full body over three days','Trains everything you have, including the legs you currently skip.','Chest 6 · Back 6 · Delts 8 · Quads 6 · Calves 6 · Arms 4 each direct sets per week',true)}
  ${row('upperOnly','Upper body only','More upper-body volume, no lower body at all.','Chest 12 · Back 9 · Delts 9 · Biceps 7 · Triceps 7 direct sets per week',false)}
  <div class="small faint" style="margin-top:11px">The full-body version is the better program for growth: it trades some upper-body volume for the muscle you are not training at all. The upper-only version is the better version of what you already do.</div></div>`;
}
function renderProgram(){return`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('home')}<button class="back" data-action="home">‹ Home</button><section class="hero"><div class="eyebrow">Editable program</div><div class="title">Customize routine</div><div class="sub">Swap any exercise from the bank of ${BANK.length} movements, add or remove slots, and tune sets, reps, loads and GIFs. Changes never touch logged history.</div></section>${renderPresetCard()}${state.program.map((day,di)=>`<div class="section"><h2>Day ${day.id}: ${esc(day.name)}</h2><span>${day.groups.reduce((s,g)=>s+g.exercises.length,0)} exercises</span></div>${day.groups.map(g=>`<div class="card"><div class="row" style="padding-top:0"><strong>${esc(g.id)} · ${esc(g.name)}</strong><button class="secondary gold" data-action="bank-add" data-day="${di}" data-group="${g.id}">+ Add from bank</button></div>${g.exercises.map(ex=>`<div class="card flat program-slot"><div class="slot-head"><div><strong>${esc(ex.name)}</strong><div class="small faint">${esc(MUSCLE_LABEL[ex.muscle]||ex.muscle)} · ${esc(ex.equipment||'')} · ${ex.sets}×${ex.min}–${ex.max}</div></div><div class="session-actions"><button class="secondary" data-action="bank-swap" data-day="${di}" data-group="${g.id}" data-ex="${ex.id}">Swap</button><button class="secondary danger" data-action="remove-ex" data-day="${di}" data-group="${g.id}" data-ex="${ex.id}">Remove</button></div></div><div class="formgrid"><div class="field"><label>Sets</label><input type="number" step="1" min="1" max="6" value="${ex.sets}" data-program-field="sets" data-ex="${ex.id}"></div><div class="field"><label>Min reps</label><input type="number" step="1" value="${ex.min}" data-program-field="min" data-ex="${ex.id}"></div><div class="field"><label>Max reps</label><input type="number" step="1" value="${ex.max}" data-program-field="max" data-ex="${ex.id}"></div><div class="field"><label>Increment</label><input type="number" step="0.5" value="${ex.inc}" data-program-field="inc" data-ex="${ex.id}"></div><div class="field"><label>Start KG</label><input type="number" step="0.5" value="${ex.startWeight}" data-program-field="startWeight" data-ex="${ex.id}"></div><div class="field"><label>Goal KG</label><input type="number" step="0.5" value="${ex.goalWeight}" data-program-field="goalWeight" data-ex="${ex.id}"></div></div><div class="formgrid full"><div class="field"><label>Name</label><input value="${esc(ex.name)}" data-program-field="name" data-ex="${ex.id}"></div><div class="field"><label>GIF path</label><input value="${esc(ex.clip||'')}" data-program-field="clip" data-ex="${ex.id}"></div></div></div>`).join('')}</div>`).join('')}`).join('')}<div class="card"><button class="secondary danger" data-action="reset-program">Reset program to default</button></div></div>`}

function renderBank(){
  const res=bankResults();
  const target=bankTarget?exById(bankTarget.replaceId||''):null;
  const sessionMode=Boolean(bankTarget?.sessionOnly);
  return `<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('home')}<button class="back" data-action="${sessionMode?'workout':'program'}">‹ ${sessionMode?'Workout':'Program'}</button>
  <section class="hero"><div class="eyebrow">${sessionMode?'In-session substitution':'Exercise bank'}</div><div class="title">${bankTarget?.replaceId?`Swap ${esc(target?.name||'')}`:'Add exercise'}</div><div class="sub">${sessionMode?'Showing movements for the same primary muscle. This changes today only; your program stays intact.':BANK.length+' movements with verified demo clips, filtered by muscle and equipment.'}</div></section>
  <input class="search" type="search" placeholder="Search movements" value="${esc(bankFilter.q)}" data-search="bank">
  <div class="chips">${['',...MUSCLES].map(m=>`<button class="chip ${bankFilter.muscle===m?'on':''}" data-bank-muscle="${m}">${m?MUSCLE_LABEL[m]:'All muscles'}</button>`).join('')}</div>
  <div class="chips">${['',...EQUIPMENT].map(e=>`<button class="chip ${bankFilter.equipment===e?'on':''}" data-bank-equip="${e}">${e?e[0].toUpperCase()+e.slice(1):'All equipment'}</button>`).join('')}</div>
  <div class="bank-grid">${res.slice(0,60).map(b=>{const unavailable=sessionMode?sessionExercises().some(x=>x.id===b.id):allExercises().some(x=>x.id===b.id);const hist=sessionsForEx({id:b.id}).length;const estimate=!hist?muscleBasedTarget({...b,sets:target?.sets||3,startReps:b.min,goalReps:b.max}):null;return`<button class="bank-card ${unavailable?'in-plan':''}" data-action="bank-pick" data-bank="${b.id}" ${unavailable?'disabled':''}><span class="bank-media"><img src="${CLIP_BASE+esc(b.clip)}" alt="" loading="lazy" onerror="this.style.display='none'"></span><span class="bank-name">${esc(b.name)}</span><span class="bank-meta">${esc(MUSCLE_LABEL[b.muscle])} · ${esc(b.equipment)}${b.scoreMode==='reps'?' · reps':''}${hist?` · ${hist} logged`:estimate?.estimatedFromMuscle?` · est. ${fmtKg(estimate.weight)}`:''}${unavailable?' · already active':''}</span></button>`}).join('')||'<div class="small faint">No movements match those filters.</div>'}</div>
  ${res.length>60?`<div class="small faint" style="margin-top:10px">Showing 60 of ${res.length} — narrow the filters.</div>`:''}</div>`;
}

function renderData(){
  const unsaved=hasMeaningfulUnsavedData();
  const last=state.settings.lastExportAt?new Date(state.settings.lastExportAt).toLocaleDateString():'Never';
  const snaps=listSnapshots();
  const conf=Boolean(state.settings.gistToken&&state.settings.gistId);
  const link=recoveryLink();
  return `<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('data')}
  <section class="hero"><div class="eyebrow">Data center</div><div class="title">One ledger, every device</div><div class="sub">Cloud sync keeps phone and laptop identical. Snapshots and exports protect against everything else.</div></section>
  ${renderRecoveryBanner()}${renderHealthBanner()}
  <div class="card"><div class="row" style="padding-top:0"><div><strong>Cloud sync ${conf?'· on':'· not set up'}</strong><div class="small faint">${conf?`Auto-sync ${state.settings.autoSync?'enabled':'paused'} · last sync ${state.settings.lastSyncAt?relTime(new Date(state.settings.lastSyncAt).getTime()):'never'}`:'Two minutes, once: your data then follows you to any device and any URL.'}</div></div>${renderSyncChip()}</div>
    ${conf?'':`<ol class="feedback-list"><li>On github.com → Settings → Developer settings → Fine-grained tokens, create a token whose only permission is Gists: read and write. Give it nothing else — the recovery link below carries this token, so its permissions are the blast radius if the link ever leaks.</li><li>Paste it below and press Save to cloud — a private gist is created and its ID fills in automatically.</li><li>On your other device, paste the same token and gist ID, then press Load from cloud once.</li></ol>`}
    <div class="field" style="margin-top:10px"><label>GitHub token</label><input type="password" data-sync-field="gistToken" value="${esc(state.settings.gistToken||'')}" placeholder="Fine-grained token with gist access" autocomplete="off"></div>
    <div class="field" style="margin-top:10px"><label>Gist ID</label><input data-sync-field="gistId" value="${esc(state.settings.gistId||'')}" placeholder="Leave blank to create a new private gist"></div>
    <div class="session-actions" style="margin-top:12px"><button class="secondary gold" data-action="gist-save">Save to cloud</button><button class="secondary" data-action="gist-load">Load from cloud</button><button class="secondary" data-action="toggle-autosync">${state.settings.autoSync?'Pause auto-sync':'Enable auto-sync'}</button></div>
    <div class="small faint" style="margin-top:10px">The token stays on this device only — it is never included in the cloud file or in exports.</div>
  </div>
  <div class="card"><div class="row" style="padding-top:0"><div><strong>Durability</strong><div class="small faint">Whether this browser is allowed to keep your ledger between visits.</div></div><div class="pill">${persistGranted===true?'Persistent':persistGranted===false?'At risk':'Checking'}</div></div>
    <div class="row"><span>Eviction protection</span><strong>${persistGranted===true?'Granted':persistGranted===false?'Not granted':'Checking'}</strong></div>
    <div class="row"><span>Local writes</span><strong>${STORAGE.ok?(saveFailed?'Failing — out of space':'Working'):'Blocked by browser'}</strong></div>
    ${persistGranted===true?'':`<ol class="feedback-list"><li>Open this page in Safari, press Share, then Add to Home Screen. A home-screen app is the only kind iOS exempts from clearing storage after a week.</li><li>Open the app from that icon from now on, not from a Safari tab.</li></ol>`}
    ${link?`<div class="field" style="margin-top:10px"><label>Recovery link — bookmark this, it restores everything</label><input readonly value="${esc(link)}" onfocus="this.select()"></div><div class="session-actions" style="margin-top:10px"><button class="secondary gold" data-action="copy-link">Copy recovery link</button></div><div class="small faint" style="margin-top:9px">Add the app to your home screen using this link and the ledger rebuilds itself even after a storage wipe. The trade-off is real: the link <em>is</em> your GitHub token, only base64'd, so it lands anywhere a URL lands — browser history, synced bookmarks, screenshots, anything you paste it into. Use a fine-grained token whose only permission is Gists, so a leak costs you your gists and nothing else, and revoke it on GitHub if the link ever escapes.</div>`:'<div class="small faint" style="margin-top:10px">Set up cloud sync above to generate a recovery link.</div>'}
  </div>
  <div class="card ${unsaved?'backup-warn':'backup-ok'}"><div class="row" style="padding-top:0"><div><strong>${unsaved?'Backup recommended':'Backups clear'}</strong><div class="small faint">Last export: ${esc(last)}.</div></div><div class="pill">${unsaved?'Unsaved':'Safe'}</div></div><div class="session-actions"><button class="secondary gold" data-action="export">Export JSON</button><button class="secondary" data-action="export-csv">Export CSV</button><button class="secondary" data-action="import">Import JSON</button></div></div>
  <div class="card"><div class="row" style="padding-top:0"><div><strong>Snapshots</strong><div class="small faint">Automatic local restore points — one per training day plus pre-import, pre-reset and pre-restore.</div></div><button class="secondary" data-action="snap-now">Snapshot now</button></div>${snaps.length?snaps.map(s=>`<div class="row"><div><strong>${esc(s.label)}</strong><div class="small faint">${s.sessions} sessions · ${relTime(s.at)}</div></div><button class="secondary" data-action="snap-restore" data-key="${esc(s.key)}">Restore</button></div>`).join(''):'<div class="small faint">No snapshots yet. One is taken automatically after every finished session.</div>'}</div>
  <div class="card"><div class="row" style="padding-top:0"><div><strong>Workout settings</strong><div class="small faint">Rest, sound and the plate calculator bar.</div></div></div>
    <div class="formgrid"><div class="field"><label>Rest seconds</label><input type="number" step="5" min="15" max="600" value="${state.settings.restSec}" data-setting="restSec"></div><div class="field"><label>Bar weight KG</label><input type="number" step="2.5" min="0" max="30" value="${state.settings.barWeight}" data-setting="barWeight"></div></div>
    <div class="session-actions" style="margin-top:10px"><button class="secondary" data-action="toggle-autorest">${state.settings.autoRest?'Auto rest: on':'Auto rest: off'}</button><button class="secondary" data-action="toggle-sound">${state.settings.soundOn?'Sound: on':'Sound: off'}</button><button class="secondary ${state.settings.advancedMode?'gold':''}" data-action="toggle-advanced">${state.settings.advancedMode?'Advanced mode: on':'Advanced mode: off'}</button></div>
    <div class="small faint" style="margin-top:9px">Advanced mode adds per-set effort logging (RPE) in workouts and the training-block planner in Coach.</div></div>
  <div class="card"><div class="row" style="padding-top:0"><div><strong>Danger zone</strong><div class="small faint">Reset is double-confirmed and leaves a pre-reset snapshot.</div></div><button class="secondary danger" data-action="reset">Reset local data</button></div></div></div>`;
}

function renderReport(){const r=state.lastReport;if(!r){view='home';return renderHome()}const good=['S','A'].includes(r.grade);return`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('report')}<section class="hero report-hero"><div class="eyebrow">Workout report</div><div class="report-grade ${good?'good':''}">${esc(r.grade)}</div><div class="report-narr">${esc(r.narrative)}</div><div class="report-sub mono">OVR ${r.overall} (${r.delta>=0?'+':''}${r.delta}) · ${r.comp.up}↑ ${r.comp.held}→ ${r.comp.down}↓ · ${r.completion}% · ${r.durationMin} min · ${r.volume||0}KG${r.rpe?` · @${r.rpe} RPE`:''}</div>${r.prs?.length?`<div class="pr"><strong>New PRs:</strong> ${r.prs.slice(0,5).map(p=>`${esc(p.name)} ${esc(p.kind)} ${p.old}→${p.now}`).join(' · ')}</div>`:''}<div class="feedback"><div class="feedback-title">What to improve next time</div><ol class="feedback-list">${r.feedback.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div><button class="primary" data-action="summary">Open summary sheet</button><button class="secondary block" data-action="home">Back home</button></section><div class="section"><h2>Movement deltas</h2><span>Vs ${r.first?'baseline':'last same day'}</span></div><div class="card flat">${r.comp.lines.map(l=>`<div class="row"><div><strong>${esc(l.name)}</strong><div class="small faint">Strength ${Math.round(l.strength*1000)/10}% · Volume ${Math.round(l.vol*1000)/10}%</div></div><div class="mono" style="color:${l.dir==='up'?'var(--series)':l.dir==='down'?'var(--risk)':'var(--muted)'}">${l.index>=0?'+':''}${Math.round(l.index*1000)/10}%</div></div>`).join('')}</div></div>`}

/* ---- Original 1: Strength Portfolio ---- */
function renderPortfolio(){
  const ps=portfolioSummary();
  const ready=ps.lifts.filter(l=>l.ready);
  const head=`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('summary')}<button class="back" data-action="home">‹ Home</button>`;
  if(ready.length<1){
    return head+`<section class="hero"><div class="eyebrow">Strength portfolio</div><div class="title">Coverage opens soon</div><div class="sub">Every lift becomes a rated position after two logged sessions. Log a full rotation to open the book.</div></section><div class="card"><div class="small faint">No positions yet. Start a session from Home — returns, volatility, drawdown and ratings appear here automatically.</div></div></div>`;
  }
  const sorted=ready.slice().sort((a,b)=>b.mean-a.mean);
  const rows=sorted.map(l=>`<button class="pos-row" data-action="exercise" data-ex="${l.ex.id}"><div class="pos-top"><div class="pos-name">${esc(l.ex.name)}</div><div class="rating" style="color:${ratingColor(l.rating)}">${l.rating}</div></div><div class="pos-stats"><div class="pstat"><div class="v">${Math.round(l.cur)}</div><div class="k">e1RM</div></div><div class="pstat"><div class="v" style="color:${l.mean>=0?'var(--series)':'var(--risk)'}">${pctStr(Math.max(-0.99,Math.min(0.99,l.mean)))}</div><div class="k">ret/wk</div></div><div class="pstat"><div class="v">${l.sharpe.toFixed(2)}</div><div class="k">consist</div></div><div class="pstat"><div class="v" style="color:${l.dd<=-.02?'var(--risk)':'var(--muted)'}">${(l.dd*100).toFixed(1)}%</div><div class="k">draw</div></div></div></button>`).join('');
  const nwCard=ps.tl.length>=2?`<div class="card">${renderTrendSvgRaw(ps.tl.map(x=>({value:x.overall,date:x.date})),null,'OVR','tall')}</div>`:'';
  const alloc=ps.alloc.filter(a=>a.share>0).sort((a,b)=>b.share-a.share);
  const allocRows=alloc.map(a=>`<div class="alloc-row"><span class="alloc-name">${MUSCLE_LABEL[a.m]||a.m}</span><span class="alloc-bar"><i class="alloc-fill ${a.drift<-0.02?'under':''}" style="width:${clamp(a.share*100,0,100)}%"></i><i class="alloc-target" style="left:${clamp(ps.target*100,0,100)}%"></i></span><span class="alloc-num">${Math.round(a.share*100)}% · ${a.drift>=0?'+':''}${Math.round(a.drift*100)}%</span></div>`).join('');
  const under=alloc.slice().sort((a,b)=>a.drift-b.drift)[0];
  return head+`
  <section class="hero"><div class="eyebrow">Strength portfolio</div><div class="level-head"><div><div class="title" style="color:${scoreColor(ps.nw||0)}">Net worth ${ps.nw!=null?ps.nw:'—'}</div><div class="sub">Your lifts as a book of positions. Valuation is estimated 1RM; return is its weekly rate of change.</div></div>${ps.dd!=null?`<div class="rank" style="color:${ps.dd<=-.02?'var(--risk)':'var(--ok)'}">${(ps.dd*100).toFixed(1)}% DD</div>`:''}</div></section>
  <div class="grid3"><div class="metric"><div class="num">${ready.length}</div><div class="lab">Positions</div></div><div class="metric"><div class="num" style="color:${(ps.cagr||0)>=0?'var(--series)':'var(--risk)'}">${ps.cagr!=null?pctStr(ps.cagr,0):'—'}</div><div class="lab">CAGR / 4wk</div></div><div class="metric"><div class="num">${ps.peak!=null?ps.peak:'—'}</div><div class="lab">Peak OVR</div></div></div>
  ${nwCard}
  <div class="section"><h2>Positions</h2><span>Tap a lift</span></div>
  <div class="card flat">${rows}</div>
  <div class="section"><h2>Allocation</h2><span>Vol share vs even target</span></div>
  <div class="card"><div class="small faint" style="margin-bottom:4px">Marker = balanced target. Grey bars are under-allocated.</div>${allocRows}${under&&under.drift<-0.03?`<div class="banner warn" style="margin-top:12px"><strong>Rebalance</strong><div>${MUSCLE_LABEL[under.m]||under.m} is ${Math.abs(Math.round(under.drift*100))}% under target. Add a set or shift a slot toward it in Edit program.</div></div>`:''}</div>
  <button class="primary" data-action="analyst">Open analyst desk</button></div>`;
}

/* ---- Original 2: fitted progression model (used inside exercise detail) ---- */
function renderProgressionModel(ex){
  const st=liftStats(ex);
  if(!st.ready)return `<div class="card"><strong>Progression model</strong><div class="small faint" style="margin-top:6px">Log this lift at least twice to fit a trend and forecast the path to your goal.</div></div>`;
  const svg=chartHost({type:'model',v:st.v,fit:st.fit,goal:st.goal,fc:3,label:`${ex.name} progression model`},'tall');
  const trend=st.spw>0.05?`+${st.spw.toFixed(1)}/wk`:st.spw<-0.05?`${st.spw.toFixed(1)}/wk`:'flat';
  const plat=st.z<=-1&&st.n>=4;
  return `<div class="card"><div class="row" style="padding-top:0"><div><strong>Progression model</strong><div class="small faint">Ink line = fitted trend. Gold dashed = forecast, shaded by its noise. GOAL is your standard.</div></div><div class="rating" style="color:${ratingColor(st.rating)}">${st.rating}</div></div>${svg}<div class="grid3"><div class="metric"><div class="num">${trend}</div><div class="lab">Trend slope</div></div><div class="metric"><div class="num" style="color:${plat?'var(--risk)':'var(--muted)'}">${st.z.toFixed(2)}</div><div class="lab">Plateau z</div></div><div class="metric"><div class="num">${st.wksToGoal!=null?st.wksToGoal:'—'}</div><div class="lab">Weeks to goal</div></div></div>${plat?`<div class="banner warn" style="margin-top:10px"><strong>Statistical plateau</strong><div>Last session sits ${Math.abs(st.z).toFixed(1)} SD below this lift's own trend. Hold load and add a rep, add a back-off set, or swap for 4 weeks.</div></div>`:''}</div>`;
}

/* ---- Original 3: Analyst desk (research note + what-if optimizer) ---- */
function renderAnalyst(){
  const a=analystNote();
  const head=`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('summary')}<button class="back" data-action="portfolio">‹ Portfolio</button>`;
  if(!a.ready.length){
    return head+`<section class="hero"><div class="eyebrow">Analyst desk</div><div class="title">No coverage yet</div><div class="sub">${esc(a.headline)}</div></section></div>`;
  }
  const liftLine=l=>`<div class="row"><div><strong>${esc(l.ex.name)}</strong><div class="small faint">e1RM ${Math.round(l.cur)} · consistency ${l.sharpe.toFixed(2)}</div></div><div class="mono" style="color:${l.mean>=0?'var(--series)':'var(--risk)'}">${pctStr(l.mean)}/wk</div></div>`;
  const risk=l=>`<div class="row"><div><strong>${esc(l.ex.name)}</strong><div class="small faint">${l.dd<=-0.05?`${(l.dd*100).toFixed(0)}% off peak`:`plateau ${l.z.toFixed(1)} SD`}</div></div><button class="secondary" data-action="exercise" data-ex="${l.ex.id}">Open</button></div>`;
  const wi=a.wi.map(x=>`<div class="row"><div><strong>${esc(x.ex.name)}</strong><div class="small faint">→ ${esc(fmtEntry(x.t))}</div></div><div class="mono" style="color:var(--gold2)">+${x.delta} OVR</div></div>`).join('');
  return head+`
  <section class="hero report-hero"><div class="eyebrow">Research note · ${esc(today())}</div><div class="note-head">Coverage: your strength book</div><div class="report-narr">${esc(a.headline)}</div><div class="report-sub mono">OVR ${a.ovr} · drawdown ${a.dd}% · CAGR ${a.cagr!=null?a.cagr+'%/4wk':'—'}</div></section>
  <div class="section"><h2>Top movers</h2><span>Weekly return</span></div><div class="card flat">${a.movers.length?a.movers.map(liftLine).join(''):'<div class="small faint">No positive movers this window.</div>'}</div>
  <div class="section"><h2>Laggards</h2><span>Weakest return</span></div><div class="card flat">${a.laggards.map(liftLine).join('')}</div>
  ${a.risks.length?`<div class="section"><h2>Risk flags</h2><span>${a.risks.length}</span></div><div class="card flat">${a.risks.map(risk).join('')}</div>`:''}
  <div class="section"><h2>What-if · highest leverage</h2><span>Next session</span></div><div class="card flat">${wi||'<div class="small faint">Log more sessions to rank moves.</div>'}</div>
  <div class="card"><div class="note-head">Thesis</div><div class="small muted" style="margin-top:4px">${esc(a.thesis)}</div></div>
  <button class="secondary gold block" data-action="export-note">Export research note</button></div>`;
}
function exportNote(){
  const a=analystNote();
  const L=[`# Brunian Lifts — research note (${today()})`,'',a.headline,'',`OVR ${a.ovr} · drawdown ${a.dd}% · CAGR ${a.cagr!=null?a.cagr+'%/4wk':'—'}`,'','## Top movers'];
  a.movers.forEach(l=>L.push(`- ${l.ex.name}: ${pctStr(l.mean)}/wk, e1RM ${Math.round(l.cur)}, consistency ${l.sharpe.toFixed(2)}`));
  L.push('','## Laggards');a.laggards.forEach(l=>L.push(`- ${l.ex.name}: ${pctStr(l.mean)}/wk`));
  if(a.risks.length){L.push('','## Risk flags');a.risks.forEach(l=>L.push(`- ${l.ex.name}: ${l.dd<=-0.05?(l.dd*100).toFixed(0)+'% off peak':'plateau '+l.z.toFixed(1)+' SD'}`));}
  L.push('','## What-if (highest leverage)');a.wi.forEach(x=>L.push(`- ${x.ex.name} -> ${fmtEntry(x.t)}: +${x.delta} OVR`));
  L.push('','## Thesis',a.thesis);
  download(`brunian-lifts-note-${today()}.md`,L.join('\n'),'text/markdown');flash('Research note exported.');
}

function renderConfirm(){if(!confirmBox)return'';return`<div class="confirm-overlay"><div class="confirm-box"><div class="eyebrow">Confirm</div><div class="confirm-title">${esc(confirmBox.title)}</div><div class="confirm-text">${esc(confirmBox.text)}</div><div class="confirm-actions"><button class="secondary" data-action="confirm-cancel">Cancel</button><button class="${confirmBox.danger?'danger-solid':'primary'} tight" data-action="confirm-ok">${esc(confirmBox.ok)}</button></div></div></div>`}

let crashed=false;
function renderCrash(err){return`<div class="shell"><div class="card banner bad" style="margin-top:40px"><strong>Something broke — your data is safe</strong><div class="small muted" style="margin:8px 0">${esc(String(err))}</div><div class="session-actions"><button class="secondary gold" data-action="crash-export">Download raw data</button><button class="secondary" data-action="crash-reload">Reload app</button></div></div></div>`}
function render(){
  try{
    const keepPosition=view==='workout';const scrollY=keepPosition?window.scrollY:0;
    CHARTS.clear();
    const pages={home:renderHome,summary:renderSummary,weekly:renderWeekly,workout:renderWorkout,achievements:renderAchievements,history:renderHistory,editSession:renderEditSession,program:renderProgram,bank:renderBank,data:renderData,exercise:renderExerciseDetail,report:renderReport,prs:renderPRs,portfolio:renderPortfolio,analyst:renderAnalyst};
    app.innerHTML=(pages[view]||renderHome)()+renderConfirm();
    paintCharts();
    if(keepPosition&&scrollY)requestAnimationFrame(()=>window.scrollTo(0,scrollY));
    crashed=false;
    if(view==='workout'){holdWake(true);if(!sessionClock)sessionClock=setInterval(tickSessionClock,15000)}
    else{holdWake(false);if(sessionClock){clearInterval(sessionClock);sessionClock=null}}
  }catch(err){
    crashed=true;
    try{app.innerHTML=renderCrash(err)}catch(_){}
  }
}

/* ========================== 8. CONTROLLER / BOOT ========================== */
app.addEventListener('click',e=>{
  const t=e.target.closest('[data-action],[data-bank-muscle],[data-bank-equip]');if(!t)return;
  if(t.dataset.bankMuscle!==undefined){bankFilter.muscle=t.dataset.bankMuscle;render();return}
  if(t.dataset.bankEquip!==undefined){bankFilter.equipment=t.dataset.bankEquip;render();return}
  const a=t.dataset.action;
  const nav={home:'home',summary:'summary',weekly:'weekly',history:'history',achievements:'achievements',program:'program',data:'data',prs:'prs',portfolio:'portfolio',analyst:'analyst',workout:'workout'};
  if(nav[a]){go(nav[a]);return}
  if(a==='exercise'){selectedExId=t.dataset.ex;go('exercise')}
  else if(a==='start')startSession(Number(t.dataset.day||state.currentDayIndex));
  else if(a==='switch-day')switchDay(Number(t.dataset.day));
  else if(a==='step')step(t.dataset.ex,t.dataset.kind,Number(t.dataset.index||0),Number(t.dataset.dir||0));
  else if(a==='logset')logSet(t.dataset.ex,Number(t.dataset.index||0));
  else if(a==='rpe')cycleRPE(t.dataset.ex,Number(t.dataset.index||0));
  else if(a==='block-start')startBlock(Number(t.dataset.weeks||4));
  else if(a==='block-end')endBlock();
  else if(a==='toggle-advanced'){state.settings.advancedMode=!state.settings.advancedMode;save();render();flash(state.settings.advancedMode?'Advanced mode on — RPE logging and block planning unlocked.':'Advanced mode off.')}
  else if(a==='log-warmup')logWarmup(t.dataset.ex,Number(t.dataset.index||0));
  else if(a==='add-set')addWorkSet(t.dataset.ex);
  else if(a==='remove-set')removeWorkSet(t.dataset.ex);
  else if(a==='add-warmup')addWarmup(t.dataset.ex);
  else if(a==='remove-warmup')removeWarmup(t.dataset.ex);
  else if(a==='session-swap')openSessionSwap(t.dataset.group,t.dataset.base);
  else if(a==='alt-pick'){bankTarget={dayIndex:state.session?.dayIndex,groupId:t.dataset.group,replaceId:t.dataset.base,sessionOnly:true};chooseFromBank(t.dataset.alt)}
  else if(a==='session-remove')removeSessionExercise(t.dataset.ex);
  else if(a==='calendar-prev'){calendarOffset--;render()}
  else if(a==='calendar-next'){calendarOffset=Math.min(0,calendarOffset+1);render()}
  else if(a==='calendar-current'){calendarOffset=0;render()}
  else if(a==='fill-last')fillFromLast(t.dataset.ex);
  else if(a==='fill-target')fillFromTarget(t.dataset.ex);
  else if(a==='round')startRest(state.settings.restSec||60);
  else if(a==='rest-add')changeRest(15);
  else if(a==='rest-sub')changeRest(-15);
  else if(a==='clear-rest')clearRest();
  else if(a==='finish')finishSession(false);
  else if(a==='bw'){state.settings.bodyweight=clamp(bodyweight()+Number(t.dataset.dir||0)*0.5,35,180);save();render()}
  else if(a==='bw-log'){const k=today();state.bodyLog=state.bodyLog.filter(x=>x.date!==k);state.bodyLog.push({date:k,kg:bodyweight()});markDataChanged();save();render();flash(`Bodyweight ${bodyweight()}KG logged.`)}
  else if(a==='export')exportData();
  else if(a==='export-note')exportNote();
  else if(a==='export-csv')exportCSV();
  else if(a==='import')importData();
  else if(a==='reset')resetAll();
  else if(a==='delete-session')deleteSession(t.dataset.id);
  else if(a==='undo-delete')undoDelete();
  else if(a==='edit-session')startEditSession(t.dataset.id);
  else if(a==='save-edit-session')saveEditSession();
  else if(a==='apply-preset')applyPreset(t.dataset.preset);
  else if(a==='reset-program')resetProgram();
  else if(a==='bank-add')openBank(Number(t.dataset.day),t.dataset.group,null);
  else if(a==='bank-swap')openBank(Number(t.dataset.day),t.dataset.group,t.dataset.ex);
  else if(a==='bank-pick')chooseFromBank(t.dataset.bank);
  else if(a==='remove-ex')removeExercise(Number(t.dataset.day),t.dataset.group,t.dataset.ex);
  else if(a==='gist-save')Sync.push('manual').then(ok=>{flash(ok?'Saved to cloud.':'Cloud save failed — check the token and connection.');render()});
  else if(a==='gist-load')Sync.pull('manual').then(ok=>{if(ok){openDay=state.session?state.session.dayIndex:state.currentDayIndex;render();flash('Loaded from cloud and merged.')}else{flash('Cloud load failed — check token, gist ID and connection.')}});
  else if(a==='sync-now'){if(Sync.configured()&&state.settings.gistId)Sync.pull('chip').then(()=>Sync.push('chip')).then(()=>render());else go('data')}
  else if(a==='toggle-autosync'){state.settings.autoSync=!state.settings.autoSync;save();render()}
  else if(a==='toggle-autorest'){state.settings.autoRest=!state.settings.autoRest;save();render()}
  else if(a==='toggle-sound'){state.settings.soundOn=!state.settings.soundOn;save();render()}
  else if(a==='copy-link'){const l=recoveryLink();if(!l){flash('Set up cloud sync first.');}else{try{navigator.clipboard.writeText(l).then(()=>flash('Recovery link copied. Keep it private.'),()=>flash('Copy failed — long-press the field above instead.'))}catch(_){flash('Copy failed — long-press the field above instead.')}}}
  else if(a==='snap-now'){snapshot();render();flash('Snapshot saved.')}
  else if(a==='snap-restore'){const key=t.dataset.key;confirmBox={title:'Restore this snapshot?',text:'Current data is snapshotted first as pre-restore, then replaced by the selected snapshot.',ok:'Restore snapshot',danger:false,onYes:()=>{confirmBox=null;restoreSnapshot(key)}};render()}
  else if(a==='crash-export'){try{download(`brunian-lifts-raw-${today()}.json`,STORAGE.getItem(KEY)||STORAGE.getItem(QUARANTINE_KEY)||JSON.stringify(state),'application/json')}catch(_){}}
  else if(a==='crash-reload')location.reload();
  else if(a==='confirm-cancel'){confirmBox=null;render()}
  else if(a==='confirm-ok'){const fn=confirmBox&&confirmBox.onYes;confirmBox=null;if(fn)fn();else render()}
});

app.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.action==='note'&&state.session){state.session.note=t.value;programSaveSoon()}
  else if(t.dataset.num){setDirect(t.dataset.ex,t.dataset.num,Number(t.dataset.index||0),t.value)}   // no re-render: keeps focus
  else if(t.dataset.programField){updateProgramField(t.dataset.ex,t.dataset.programField,t.value)}    // no re-render: keeps focus
  else if(t.dataset.syncField){state.settings[t.dataset.syncField]=t.value.trim();programSaveSoon()}
  else if(t.dataset.setting){state.settings[t.dataset.setting]=clamp(Number(t.value)||0,0,600);programSaveSoon()}
  else if(t.dataset.search==='history'){historyQuery=t.value;const card=document.querySelector('.card.flat');if(card){const scroll=window.scrollY;render();window.scrollTo(0,scroll);const inp=document.querySelector('[data-search="history"]');if(inp){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length)}}}
  else if(t.dataset.search==='bank'){bankFilter.q=t.value;const scroll=window.scrollY;render();window.scrollTo(0,scroll);const inp=document.querySelector('[data-search="bank"]');if(inp){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length)}}
});
/* toggle does not bubble, so capture it on the way down. */
app.addEventListener('toggle',e=>{
  const d=e.target; if(!d||!d.dataset||!d.dataset.panel)return;
  d.open?openPanels.add(d.dataset.panel):openPanels.delete(d.dataset.panel);
},true);
app.addEventListener('change',e=>{const t=e.target;if(t.dataset.num){setDirect(t.dataset.ex,t.dataset.num,Number(t.dataset.index||0),t.value);render()}});

window.addEventListener('beforeunload',e=>{
  if(state.session){e.preventDefault();e.returnValue=''}
});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){try{STORAGE.setItem(KEY,JSON.stringify(state))}catch(_){}if(Sync.configured()&&state.settings.autoSync&&state.settings.gistId)Sync.push('unload')}
  else if(document.visibilityState==='visible'&&view==='workout')holdWake(true);
});
window.addEventListener('resize',debounce(paintCharts,120));
window.addEventListener('error',ev=>{if(!crashed){crashed=true;try{app.innerHTML=renderCrash(ev.message||'Unknown error')}catch(_){}}});

/* Boot: adopt any recovery link first so a wiped device knows where its ledger
   lives, render immediately from local, then pull cloud in the background. */
adoptRecoveryLink();
render();
snapshot();
requestPersistence().then(()=>render());   // the answer changes what Data and the health banner say

/* localStorage can be cleared while the IndexedDB mirror survives — that is the
   whole point of keeping a second copy, and until now nothing ever read it. */
if(state.__fresh){
  IDB.read().then(mirror=>{
    if(!mirror || !Array.isArray(mirror.sessions) || !mirror.sessions.length) return;
    if(state.sessions.length) return;                 // cloud sync got there first
    const n=mirror.sessions.length;
    confirmBox={title:'Restore your ledger?',
      text:`The main save on this device is empty, but a backup copy holding ${n} logged session${n===1?'':'s'} survived. This is what a browser storage wipe looks like. Restore it?`,
      ok:'Restore '+n+' session'+(n===1?'':'s'), danger:false,
      onYes:()=>{ state=migrate(mirror); openDay=state.session?state.session.dayIndex:state.currentDayIndex;
        view=state.session?'workout':'home'; confirmBox=null; save(); render(); flash('Ledger restored from the local backup copy.'); }};
    render();
  });
}
if(state.settings.autoSync&&state.settings.gistToken&&state.settings.gistId){
  Sync.pull('boot').then(changed=>{if(changed){openDay=state.session?state.session.dayIndex:state.currentDayIndex;render()}});
}

/* Offline shell: register the service worker. No-op on file:// or unsupported browsers. */
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})});
}
