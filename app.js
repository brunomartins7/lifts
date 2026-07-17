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
  delete n.__recoveredFrom; delete n.__quarantined;   // transient flags — set per-load by loadState, never persisted
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
    if (!raw){ const st=freshState(); indexExercises(st); return st; }
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
  try{
    state.settings.updatedAt = now();
    STORAGE.setItem(KEY, JSON.stringify(state));
  }catch(_){/* quota — snapshots pruned below will free space next pass */}
  IDB.mirror(state);
  if (state.settings.autoSync && state.settings.gistToken && state.settings.gistId) pushSoon();
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
  try{
    const req = indexedDB.open('brunian-lifts',1);
    req.onupgradeneeded = e=>e.target.result.createObjectStore('kv');
    req.onsuccess = e=>{ db=e.target.result; };
  }catch(_){}
  return {
    mirror(st){ try{ if(!db)return; db.transaction('kv','readwrite').objectStore('kv').put(JSON.stringify(st),'state'); }catch(_){} },
    read(){ return new Promise(res=>{ try{ if(!db)return res(null); const r=db.transaction('kv').objectStore('kv').get('state'); r.onsuccess=()=>res(r.result?JSON.parse(r.result):null); r.onerror=()=>res(null);}catch(_){res(null)} }); }
  };
})();

/* ========================== 4. DOMAIN (scoring preserved verbatim) ======== */
function bodyweight(){return clamp(Number(state.settings.bodyweight||75),35,180)}
function allExercises(plan=state.program){return plan.flatMap((day,di)=>day.groups.flatMap((group,gi)=>group.exercises.map((ex,ei)=>({...ex,dayIndex:di,dayId:day.id,dayName:day.name,groupId:group.id,groupName:group.name,groupIndex:gi,exerciseIndex:ei}))))}
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
function scoreColor(s){if(s>=90)return'var(--green)';if(s>=75)return'var(--gold2)';if(s>=60)return'var(--gold)';if(s>=45)return'var(--blue)';if(s>=30)return'var(--muted)';return'var(--red)'}
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

function profileFromEntries(latest){const bucket={};for(const m of MUSCLES)bucket[m]=[];const exScores=[];const out={exercises:{}};for(const ex of allExercises()){const e=latest[ex.id]||baselineEntry(ex);const sc=scoreFromEntry(ex,e);const bestEnt=bestEntryFor(ex).entry;const best=scoreFromEntry(ex,bestEnt);const vs=volScore(ex,e);out.exercises[ex.id]={score:sc,best,vol:vs,entry:e,bestEntry:bestEnt};exScores.push({score:sc,w:ex.type==='compound'?1.15:1});bucket[ex.muscle]?.push({score:sc,w:1});for(const [m,w] of secondaryFor(ex))bucket[m]?.push({score:sc,w})}for(const m of MUSCLES){const a=bucket[m].filter(x=>x.score>0);out[m]=a.length?Math.round(a.reduce((s,x)=>s+x.score*x.w,0)/a.reduce((s,x)=>s+x.w,0)):35}out.arms=Math.round((out.biceps+out.triceps+out.forearms)/3);out.legs=Math.round((out.quads*1.1+out.hamstrings+out.glutes+out.calves*.6)/3.7);out.push=Math.round((out.chest*1.15+out.shoulders+out.triceps*.85)/(3));out.pull=Math.round((out.back*1.15+out.biceps*.85+out.forearms*.55)/(2.55));out.overall=Math.round(exScores.reduce((s,x)=>s+x.score*x.w,0)/exScores.reduce((s,x)=>s+x.w,0));return out}
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
function targetImpact(ex){const current=computeProfile().overall;const latest=currentEntries();latest[ex.id]=targetEntry(ex);const next=profileFromEntries(latest).overall;return Math.round((next-current)*10)/10}
function nextScoreAdvice(){const prof=computeProfile();const base=prof.overall;const candidates=allExercises().map(ex=>{const t=targetEntry(ex);const e=currentEntries();e[ex.id]=t;const next=profileFromEntries(e).overall;return{ex,t,delta:next-base,score:scoreFromEntry(ex,latestEntryFor(ex))}}).sort((a,b)=>b.delta-a.delta||a.score-b.score);return candidates.slice(0,3).map(c=>`${c.ex.name}: move toward ${fmtKg(c.t.weight)} · ${c.t.reps.join(', ')}. Estimated score impact: +${Math.max(.1,Math.round(c.delta*10)/10)} OVR.`)}

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
function readinessColor(st){return st==='optimal'?'var(--green)':st==='fresh'?'var(--blue)':st==='elevated'?'var(--gold2)':'var(--red)'}
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
function weakPoint(){const prof=computeProfile();const arr=radarAxes().map(a=>({key:a.key,label:a.label,score:prof[a.key]})).sort((a,b)=>a.score-b.score);const weak=arr[0];const exs=allExercises().filter(ex=>{if(weak.key==='arms')return['biceps','triceps','forearms'].includes(ex.muscle);if(weak.key==='push')return['chest','shoulders','triceps'].includes(ex.muscle);if(weak.key==='pull')return['back','biceps','forearms'].includes(ex.muscle);if(weak.key==='legs')return LEG_MUSCLES.includes(ex.muscle);return ex.muscle===weak.key}).map(ex=>({ex,score:scoreFromEntry(ex,latestEntryFor(ex))})).sort((a,b)=>a.score-b.score);return{area:weak,exercises:exs.slice(0,2),target:exs[0]?targetEntry(exs[0].ex):null}}
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
function ratingColor(r){return r==='BUY'?'var(--green)':r==='REDUCE'?'var(--red)':r==='SWAP'?'var(--blue)':r==='NEW'?'var(--faint)':'var(--gold2)';}
function pctStr(x,dp){return (x>=0?'+':'')+(x*100).toFixed(dp==null?1:dp)+'%';}
/* Portfolio-level: net-worth (OVR) curve, drawdown, CAGR, and volume allocation vs target. */
function portfolioSummary(){
  const tl=scoreTimeline();
  const lifts=allExercises().map(ex=>liftStats(ex));
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
  return allExercises().map(ex=>{const t=targetEntry(ex);const e={...cur};e[ex.id]=t;const next=profileFromEntries(e).overall;return{ex,t,delta:Math.round((next-base)*10)/10};}).filter(x=>x.delta>0).sort((a,b)=>b.delta-a.delta);
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

function achievements(){const p=computeProfile(),sum=trainingSummary(),ach=[];const add=(g,n,d,ok,need,pts)=>ach.push({g,n,d,ok,need,pts});const sessions=sum.total;[1,2,3,5,8,12,16,20,24,28,32,36,40,44,48].forEach((n,i)=>add('Consistency',`${n} Session${n===1?'':'s'}`,`Log ${n} completed workout${n===1?'':'s'}.`,sessions>=n,`${sessions}/${n}`,i<4?10:i<9?20:35));[1,3,6].forEach((r,i)=>{const count=Math.min(...state.program.map((d,di)=>state.sessions.filter(s=>s.dayIndex===di).length));add('Consistency',`${r} Full Rotation${r===1?'':'s'}`,`Complete every day of the cycle ${r} time${r===1?'':'s'}.`,count>=r,`${count}/${r}`,i===0?20:i===1?35:55)});const ws=weekStreak();[2,4,8,12].forEach((n,i)=>add('Consistency',`${n} Week Streak`,`Hold a streak of ${n} consecutive weeks with 3+ sessions.`,ws>=n,`${ws}/${n}`,i<2?25:50));[36,38,40,42,45,48,50,55,60,65,70,75].forEach(t=>add('Overall',`${t} OVR`,`Reach ${t} overall.`,p.overall>=t,`${p.overall}/${t}`,achievementPointsForThreshold(t)));radarAxes().forEach(a=>[40,45,50,55,60].forEach(t=>add('Muscle Profile',`${a.label} ${t}`,`Reach ${t} score for ${a.label.toLowerCase()}.`,(p[a.key]||0)>=t,`${p[a.key]||0}/${t}`,achievementPointsForThreshold(t))));allExercises().forEach(ex=>{const sc=scoreFromEntry(ex,latestEntryFor(ex));add('Exercise Scores',`${ex.name} 45`,`Reach 45 score on ${ex.name}.`,sc>=45,`${sc}/45`,20)});const prCount=sum.prs;[1,3,5,8,12,16,20,25,30,40].forEach((n,i)=>add('PRs',`${n} PR${n===1?'':'s'}`,`Record ${n} personal record${n===1?'':'s'}.`,prCount>=n,`${prCount}/${n}`,i<3?15:i<7?30:50));const week=weeklyWindow(),weeklyVol=totalVolumeForSessions(week),completeDays=new Set(week.map(s=>s.dayIndex)).size;[[2,'Two Session Week'],[3,'Three Session Week'],[4,'Four Session Week']].forEach(([n,label],i)=>add('Discipline',label,`Log ${n} sessions in the last 7 days.`,week.length>=n,`${week.length}/${n}`,15+i*10));add('Discipline','Balanced Week','Train all three days in the last 7 days.',completeDays>=3,`${completeDays}/3`,35);add('Discipline','Volume Base','Lift 3000KG total volume in the last 7 days.',weeklyVol>=3000,`${weeklyVol}/3000`,20);add('Discipline','Volume Push','Lift 5000KG total volume in the last 7 days.',weeklyVol>=5000,`${weeklyVol}/5000`,35);add('Discipline','Volume Surge','Lift 7500KG total volume in the last 7 days.',weeklyVol>=7500,`${weeklyVol}/7500`,55);add('Discipline','Clean Data','Back up after meaningful logged progress.',!hasMeaningfulUnsavedData()&&sessions>=2,hasMeaningfulUnsavedData()?'Backup Needed':'Saved',20);add('Discipline','Program Owner','Customize the editable program at least once.',Boolean(state.settings.programUpdatedAt),state.settings.programUpdatedAt?'Done':'Not Yet',20);add('Discipline','Two Device Sync','Set up cloud sync so phone and laptop share one ledger.',Boolean(state.settings.gistId&&state.settings.gistToken),state.settings.gistId?'Done':'Not Yet',25);return ach.slice(0,120)}

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

function renderRadar(profile,best){const axes=radarAxes(),n=axes.length,cx=170,cy=155,maxR=108,pts=[];for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n;pts.push({x:cx+Math.cos(a)*maxR,y:cy+Math.sin(a)*maxR,a})}const poly=vals=>vals.map((v,i)=>`${cx+Math.cos(pts[i].a)*maxR*v/100},${cy+Math.sin(pts[i].a)*maxR*v/100}`).join(' ');return`<div class="radar-wrap"><svg class="radar" viewBox="0 0 340 310" aria-label="Score radar">${[25,50,75,100].map(r=>`<polygon points="${pts.map(p=>`${cx+(p.x-cx)*r/100},${cy+(p.y-cy)*r/100}`).join(' ')}" fill="none" stroke="var(--gridline)"/>`).join('')}${pts.map(p=>`<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="var(--gridline2)"/>`).join('')}<polygon points="${poly(axes.map(a=>best[a.key]||0))}" fill="rgba(127,207,155,.13)" stroke="rgba(127,207,155,.5)" stroke-width="2"/><polygon class="radar-cur" points="${poly(axes.map(a=>profile[a.key]||0))}" fill="rgba(217,169,78,.22)" stroke="var(--gold2)" stroke-width="2.5"/>${pts.map((p,i)=>{const lx=cx+Math.cos(p.a)*(maxR+34),ly=cy+Math.sin(p.a)*(maxR+24);return`<text x="${lx}" y="${ly}" text-anchor="middle" font-size="11">${axes[i].label}</text><text class="num" x="${lx}" y="${ly+14}" text-anchor="middle">${profile[axes[i].key]}</text>`}).join('')}</svg><div class="legend"><span><i class="dot" style="background:var(--gold2)"></i>Current</span><span><i class="dot" style="background:var(--green)"></i>Best</span></div></div>`}

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
  ${state.bodyLog.length>1?`<div class="card">${renderTrendSvgRaw(state.bodyLog.map(x=>({value:x.kg})),null,'KG')}</div>`:''}
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
function renderExercise(ex,dayIndex,groupId,baseId=ex.id){
  const d=state.session?.draft?.[ex.id]||targetEntry(ex),done=state.session?.setDone?.[ex.id]||[],last=latestEntryFor(ex),target=targetEntry(ex),score=scoreFromEntry(ex,last),earned=(d.reps||[]).every(r=>r>=ex.max),weakR=Math.min(...(d.reps||[ex.min])),fill=clamp((weakR-ex.min)/Math.max(1,ex.max-ex.min),0,1),warmups=Array.isArray(d.warmups)?d.warmups:[];
  const plates=ex.equipment==='barbell'&&Number(d.weight)>Number(state.settings.barWeight||20)?plateFor(d.weight):null;
  return `<article class="exercise" id="ex-${esc(ex.id)}">
  <div class="ex-head"><div><div class="ex-name">${esc(ex.name)}</div><div class="ex-meta">${d.estimatedFromMuscle?'Estimated from similar '+esc(MUSCLE_LABEL[ex.muscle].toLowerCase())+' lifts · ':''}Last: ${esc(fmtEntry(last))} · Target: ${esc(fmtEntry(target))}</div></div><button class="tag" data-action="exercise" data-ex="${ex.id}">Score ${score}</button></div>
  ${renderMedia(ex)}
  <div class="range"><div class="bar"><div class="fill ${earned?'earned':''}" style="width:${fill*100}%"></div></div><div class="bar-labs"><span>${ex.min} reps</span><span>${earned&&ex.scoreMode!=='reps'?'Next load +'+ex.inc+'KG':'Top '+ex.max}</span></div></div>
  <div class="step-grid"><div><div class="step-label">Work weight</div><div class="step-controls"><button class="step-btn" data-action="step" data-ex="${ex.id}" data-kind="weight" data-dir="-1" aria-label="Decrease weight">−</button><input class="step-val num-in" inputmode="decimal" type="number" step="0.5" min="0" max="500" value="${d.weight}" data-num="weight" data-ex="${ex.id}" aria-label="Work weight in KG"><button class="step-btn" data-action="step" data-ex="${ex.id}" data-kind="weight" data-dir="1" aria-label="Increase weight">+</button></div>${plates?`<div class="plates small faint">Per side: ${plates.perSide.join(' + ')||'bar only'}${plates.rem?` (+${plates.rem} short)`:''} · bar ${plates.bar}KG</div>`:''}</div></div>
  <div class="set-actions"><button class="mini-btn" data-action="fill-last" data-ex="${ex.id}">Same as last</button><button class="mini-btn" data-action="fill-target" data-ex="${ex.id}">Fill target</button><button class="mini-btn gold" data-action="session-swap" data-group="${groupId}" data-base="${baseId}">Swap similar</button><button class="mini-btn danger" data-action="session-remove" data-ex="${ex.id}">Remove today</button><button class="mini-btn gold" data-action="add-warmup" data-ex="${ex.id}">+ Warmup</button><button class="mini-btn" data-action="add-set" data-ex="${ex.id}">+ Set</button><button class="mini-btn danger" data-action="remove-set" data-ex="${ex.id}">− Set</button>${warmups.length?`<button class="mini-btn danger" data-action="remove-warmup" data-ex="${ex.id}">− Warmup</button>`:''}</div>
  ${warmups.length?renderWarmups(ex,warmups):''}
  <div class="setlog-head"><span>Work set log</span><span>${done.filter(Boolean).length}/${(d.reps||[]).length} done</span></div>
  <div class="setlog">${(d.reps||[]).map((r,i)=>renderSetRow(ex,i,r,last.reps?.[i]??last.reps?.[0]??ex.min,Boolean(done[i]))).join('')}</div>
  ${(ex.cues||[]).length?`<div class="cues"><strong>Form cues</strong><ul>${(ex.cues||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
  </article>`;
}
function renderWarmups(ex,warmups){return`<div class="warmup-box"><div class="warmup-title">Warmup ramp</div>${warmups.map((w,i)=>`<div class="warmrow"><div class="prev">WU ${i+1}</div><div class="warm-step"><button data-action="step" data-ex="${ex.id}" data-kind="warmWeight" data-index="${i}" data-dir="-1" aria-label="Decrease warmup weight">−</button><div class="warm-val mono">${fmtKg(w.weight)}</div><button data-action="step" data-ex="${ex.id}" data-kind="warmWeight" data-index="${i}" data-dir="1" aria-label="Increase warmup weight">+</button></div><div class="warm-step"><button data-action="step" data-ex="${ex.id}" data-kind="warmReps" data-index="${i}" data-dir="-1" aria-label="Decrease warmup reps">−</button><div class="warm-val mono">${w.reps}</div><button data-action="step" data-ex="${ex.id}" data-kind="warmReps" data-index="${i}" data-dir="1" aria-label="Increase warmup reps">+</button></div><button class="warm-log ${w.done?'is-done':''}" data-action="log-warmup" data-ex="${ex.id}" data-index="${i}">${w.done?'✓':'Log'}</button></div>`).join('')}</div>`}
function renderSetRow(ex,i,r,prev,done){
  const adv=Boolean(state.settings.advancedMode);
  const rpe=adv?(Number(state.session?.draft?.[ex.id]?.rpe?.[i])||0):0;
  const rpeBtn=adv?`<button class="rpe-btn ${rpe?'on':''}" data-action="rpe" data-ex="${ex.id}" data-index="${i}" title="Tap to cycle effort (RPE)" aria-label="Set ${i+1} RPE">${rpe?('@'+rpe):'RPE'}</button>`:'';
  return`<div class="setrow ${done?'done':''} ${adv?'adv':''}"><div class="setn">SET ${i+1}</div><div class="prev">PREV<br>${prev}</div><div class="rep-step"><button class="step-btn" data-action="step" data-ex="${ex.id}" data-kind="reps" data-index="${i}" data-dir="-1" aria-label="Decrease reps">−</button><input class="rep-val num-in" inputmode="numeric" type="number" step="1" min="0" max="100" value="${r}" data-num="reps" data-index="${i}" data-ex="${ex.id}" aria-label="Set ${i+1} reps"><button class="step-btn" data-action="step" data-ex="${ex.id}" data-kind="reps" data-index="${i}" data-dir="1" aria-label="Increase reps">+</button></div>${rpeBtn}<button class="set-log ${done?'is-done':''}" data-action="logset" data-ex="${ex.id}" data-index="${i}">${done?'✓ Done':'Log'}</button></div>`}

function renderMaxChart(){const rows=allExercises().map(ex=>{const curr=entryEst(ex,latestEntryFor(ex)),avg=entryEst(ex,averageEntry(ex)),goal=goalEst(ex),scale=Math.max(goal,avg,curr,1)*1.1;return`<div class="stat-row" data-action="exercise" data-ex="${ex.id}"><div class="stat-top"><div><div class="stat-name">${esc(ex.name)}</div><div class="small faint">Current ${Math.round(curr)} · Reference ${Math.round(avg)} · Goal ${Math.round(goal)}</div></div><div class="stat-num" style="color:${scoreColor(scoreFromEntry(ex,latestEntryFor(ex)))}">${scoreFromEntry(ex,latestEntryFor(ex))}</div></div><div class="stat-bar"><span class="stat-average" style="width:${clamp(avg/scale*100,0,100)}%"></span><span class="stat-current" style="width:${clamp(curr/scale*100,0,100)}%"></span><span class="stat-goal" style="left:${clamp(goal/scale*100,0,100)}%"></span></div></div>`}).join('');return`<div class="card"><div class="legend"><span><i class="dot" style="background:var(--blue)"></i>Current est max</span><span><i class="dot" style="background:var(--green)"></i>Reference</span><span><i class="dot" style="background:var(--ink2)"></i>Goal</span></div>${rows}</div>`}

function renderSummary(){const p=computeProfile(),b=bestProfile(),sum=trainingSummary();const advice=nextScoreAdvice();return`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('summary')}<section class="hero"><div class="eyebrow">Summary sheet</div><div class="level-head"><div><div class="title" style="color:${scoreColor(p.overall)}">Overall ${p.overall}</div><div class="sub">Current performance against your 100-score goal standards.</div></div><div class="rank" style="color:${scoreColor(p.overall)}">${rank(p.overall)}</div></div></section><div class="grid3"><div class="metric"><div class="num">${sum.total}</div><div class="lab">Sessions</div></div><div class="metric"><div class="num">${sum.prs}</div><div class="lab">PRs</div></div><div class="metric"><div class="num">${bodyweight()}</div><div class="lab">Body KG</div></div></div><div class="section"><h2>Next score increase</h2><span>Actionable</span></div><div class="card"><ol class="feedback-list">${advice.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div><div class="section"><h2>Strength ledger</h2><span>Tap a lift</span></div>${renderMaxChart()}<div class="section"><h2>Category sheet</h2><span>Current vs best</span></div><div class="card">${radarAxes().map(a=>`<div class="row"><div><strong>${a.label}</strong><div class="small faint">Best ${b[a.key]}</div></div><div class="mono" style="color:${scoreColor(p[a.key])}">${p[a.key]}</div></div>`).join('')}</div></div>`}

function renderWeekly(){const list=weeklyWindow(),weak=weakPoint(),proj=projection();let best='None yet',bestScore=-1;for(const ex of allExercises()){const sc=scoreFromEntry(ex,latestEntryFor(ex));if(sc>bestScore){bestScore=sc;best=ex.name}}const worst=weak.exercises[0]?.ex.name||'None yet';const stuck=allExercises().map(ex=>({ex,p:plateauInfo(ex)})).filter(x=>x.p.stuck);const deload=deloadAdvice();return`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('weekly')}<section class="hero"><div class="eyebrow">Weekly review</div><div class="title">${list.length} session${list.length===1?'':'s'}</div><div class="sub">A coaching summary for the last seven days.</div></section><div class="grid2"><div class="metric"><div class="num">${totalVolumeForSessions(list)}</div><div class="lab">KG volume</div></div><div class="metric"><div class="num">${list.reduce((s,x)=>s+(x.prs?x.prs.length:0),0)}</div><div class="lab">PRs</div></div><div class="metric"><div class="num">${trainingSummary().missed}</div><div class="lab">Missed days</div></div><div class="metric"><div class="num">${computeProfile().overall}</div><div class="lab">OVR</div></div></div>${deload.map(d=>`<div class="banner warn"><strong>Deload advised</strong><div>${esc(d)}</div></div>`).join('')}${renderReadiness(true)}${renderBlockCard()}${renderMuscleVolume()}<div class="section"><h2>Coach recommendation</h2><span>Next 7 days</span></div><div class="card"><div class="row"><div><strong>Weakest area: ${weak.area.label}</strong><div class="small faint">Best focus: ${weak.exercises.map(x=>x.ex.name).join(' and ')||'Log more data'}</div></div><div class="mono" style="color:${scoreColor(weak.area.score)}">${weak.area.score}</div></div><ol class="feedback-list">${(weak.exercises.length?weak.exercises.map(x=>`Add 1 to 2 total reps on ${x.ex.name}, aiming for ${fmtEntry(targetEntry(x.ex))}.`):['Complete two more sessions to generate a target.']).map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>${stuck.length?`<div class="section"><h2>Plateau watch</h2><span>${stuck.length} lift${stuck.length===1?'':'s'}</span></div><div class="card">${stuck.map(x=>`<div class="row"><div><strong>${esc(x.ex.name)}</strong><div class="small faint">${x.p.since} sessions since the last estimated-max PR.</div></div><button class="secondary" data-action="exercise" data-ex="${x.ex.id}">Open</button></div>`).join('')}</div>`:''}<div class="section"><h2>Weekly facts</h2><span>Summary</span></div><div class="card"><div class="row"><span>Best exercise</span><strong>${esc(best)}</strong></div><div class="row"><span>Weakest exercise</span><strong>${esc(worst)}</strong></div><div class="row"><span>Projection</span><strong>${esc(proj.message)}</strong></div></div>${renderTrainingTracker()}</div>`}

function trendPoints(ex){return sessionsForEx(ex).map(x=>({date:x.session.date,value:entryEst(ex,x.entry),session:x.session,entry:x.entry}))}
function renderTrendSvgRaw(points,goal,unit){if(points.length<2)return`<div class="small faint">Log twice to generate a trend line.</div>`;const w=330,h=140,pad=22;const vals=points.map(p=>p.value);const lo=Math.min(...vals,goal??Infinity)*0.98,hi=Math.max(...vals,goal??1,1)*1.02;const xs=points.map((p,i)=>pad+i*(w-2*pad)/Math.max(1,points.length-1));const ys=vals.map(v=>h-pad-(v-lo)/Math.max(.0001,hi-lo)*(h-2*pad));const poly=xs.map((x,i)=>`${x},${ys[i]}`).join(' ');const area=`${pad},${h-pad} ${poly} ${xs[xs.length-1]},${h-pad}`;const goalY=goal!=null?h-pad-(goal-lo)/Math.max(.0001,hi-lo)*(h-2*pad):null;return`<svg class="chart" viewBox="0 0 ${w} ${h}"><line class="grid" x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}"/>${goalY!=null&&goalY>pad?`<line class="goal-line" x1="${pad}" y1="${goalY}" x2="${w-pad}" y2="${goalY}"/>`:''}<polygon class="area" points="${area}"/><polyline class="line" points="${poly}"/>${xs.map((x,i)=>`<circle class="dotp" cx="${x}" cy="${ys[i]}" r="3"/>`).join('')}<text x="${pad}" y="14">${Math.round(hi)}${unit?' '+unit:''}</text><text x="${pad}" y="${h-5}">${Math.round(lo)}</text></svg>`}
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

function renderProgram(){return`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('home')}<button class="back" data-action="home">‹ Home</button><section class="hero"><div class="eyebrow">Editable program</div><div class="title">Customize routine</div><div class="sub">Swap any exercise from the bank of ${BANK.length} movements, add or remove slots, and tune sets, reps, loads and GIFs. Changes never touch logged history.</div></section>${state.program.map((day,di)=>`<div class="section"><h2>Day ${day.id}: ${esc(day.name)}</h2><span>${day.groups.reduce((s,g)=>s+g.exercises.length,0)} exercises</span></div>${day.groups.map(g=>`<div class="card"><div class="row" style="padding-top:0"><strong>${esc(g.id)} · ${esc(g.name)}</strong><button class="secondary gold" data-action="bank-add" data-day="${di}" data-group="${g.id}">+ Add from bank</button></div>${g.exercises.map(ex=>`<div class="card flat program-slot"><div class="slot-head"><div><strong>${esc(ex.name)}</strong><div class="small faint">${esc(MUSCLE_LABEL[ex.muscle]||ex.muscle)} · ${esc(ex.equipment||'')} · ${ex.sets}×${ex.min}–${ex.max}</div></div><div class="session-actions"><button class="secondary" data-action="bank-swap" data-day="${di}" data-group="${g.id}" data-ex="${ex.id}">Swap</button><button class="secondary danger" data-action="remove-ex" data-day="${di}" data-group="${g.id}" data-ex="${ex.id}">Remove</button></div></div><div class="formgrid"><div class="field"><label>Sets</label><input type="number" step="1" min="1" max="6" value="${ex.sets}" data-program-field="sets" data-ex="${ex.id}"></div><div class="field"><label>Min reps</label><input type="number" step="1" value="${ex.min}" data-program-field="min" data-ex="${ex.id}"></div><div class="field"><label>Max reps</label><input type="number" step="1" value="${ex.max}" data-program-field="max" data-ex="${ex.id}"></div><div class="field"><label>Increment</label><input type="number" step="0.5" value="${ex.inc}" data-program-field="inc" data-ex="${ex.id}"></div><div class="field"><label>Start KG</label><input type="number" step="0.5" value="${ex.startWeight}" data-program-field="startWeight" data-ex="${ex.id}"></div><div class="field"><label>Goal KG</label><input type="number" step="0.5" value="${ex.goalWeight}" data-program-field="goalWeight" data-ex="${ex.id}"></div></div><div class="formgrid full"><div class="field"><label>Name</label><input value="${esc(ex.name)}" data-program-field="name" data-ex="${ex.id}"></div><div class="field"><label>GIF path</label><input value="${esc(ex.clip||'')}" data-program-field="clip" data-ex="${ex.id}"></div></div></div>`).join('')}</div>`).join('')}`).join('')}<div class="card"><button class="secondary danger" data-action="reset-program">Reset program to default</button></div></div>`}

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
  return `<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('data')}
  <section class="hero"><div class="eyebrow">Data center</div><div class="title">One ledger, every device</div><div class="sub">Cloud sync keeps phone and laptop identical. Snapshots and exports protect against everything else.</div></section>
  ${renderRecoveryBanner()}${renderHealthBanner()}
  <div class="card"><div class="row" style="padding-top:0"><div><strong>Cloud sync ${conf?'· on':'· not set up'}</strong><div class="small faint">${conf?`Auto-sync ${state.settings.autoSync?'enabled':'paused'} · last sync ${state.settings.lastSyncAt?relTime(new Date(state.settings.lastSyncAt).getTime()):'never'}`:'Two minutes, once: your data then follows you to any device and any URL.'}</div></div>${renderSyncChip()}</div>
    ${conf?'':`<ol class="feedback-list"><li>On github.com → Settings → Developer settings → Fine-grained tokens, create a token whose only permission is Gists: read and write.</li><li>Paste it below and press Save to cloud — a private gist is created and its ID fills in automatically.</li><li>On your other device, paste the same token and gist ID, then press Load from cloud once.</li></ol>`}
    <div class="field" style="margin-top:10px"><label>GitHub token</label><input type="password" data-sync-field="gistToken" value="${esc(state.settings.gistToken||'')}" placeholder="Fine-grained token with gist access" autocomplete="off"></div>
    <div class="field" style="margin-top:10px"><label>Gist ID</label><input data-sync-field="gistId" value="${esc(state.settings.gistId||'')}" placeholder="Leave blank to create a new private gist"></div>
    <div class="session-actions" style="margin-top:12px"><button class="secondary gold" data-action="gist-save">Save to cloud</button><button class="secondary" data-action="gist-load">Load from cloud</button><button class="secondary" data-action="toggle-autosync">${state.settings.autoSync?'Pause auto-sync':'Enable auto-sync'}</button></div>
    <div class="small faint" style="margin-top:10px">The token stays on this device only — it is never included in the cloud file or in exports.</div>
  </div>
  <div class="card ${unsaved?'backup-warn':'backup-ok'}"><div class="row" style="padding-top:0"><div><strong>${unsaved?'Backup recommended':'Backups clear'}</strong><div class="small faint">Last export: ${esc(last)}.</div></div><div class="pill">${unsaved?'Unsaved':'Safe'}</div></div><div class="session-actions"><button class="secondary gold" data-action="export">Export JSON</button><button class="secondary" data-action="export-csv">Export CSV</button><button class="secondary" data-action="import">Import JSON</button></div></div>
  <div class="card"><div class="row" style="padding-top:0"><div><strong>Snapshots</strong><div class="small faint">Automatic local restore points — one per training day plus pre-import, pre-reset and pre-restore.</div></div><button class="secondary" data-action="snap-now">Snapshot now</button></div>${snaps.length?snaps.map(s=>`<div class="row"><div><strong>${esc(s.label)}</strong><div class="small faint">${s.sessions} sessions · ${relTime(s.at)}</div></div><button class="secondary" data-action="snap-restore" data-key="${esc(s.key)}">Restore</button></div>`).join(''):'<div class="small faint">No snapshots yet. One is taken automatically after every finished session.</div>'}</div>
  <div class="card"><div class="row" style="padding-top:0"><div><strong>Workout settings</strong><div class="small faint">Rest, sound and the plate calculator bar.</div></div></div>
    <div class="formgrid"><div class="field"><label>Rest seconds</label><input type="number" step="5" min="15" max="600" value="${state.settings.restSec}" data-setting="restSec"></div><div class="field"><label>Bar weight KG</label><input type="number" step="2.5" min="0" max="30" value="${state.settings.barWeight}" data-setting="barWeight"></div></div>
    <div class="session-actions" style="margin-top:10px"><button class="secondary" data-action="toggle-autorest">${state.settings.autoRest?'Auto rest: on':'Auto rest: off'}</button><button class="secondary" data-action="toggle-sound">${state.settings.soundOn?'Sound: on':'Sound: off'}</button><button class="secondary ${state.settings.advancedMode?'gold':''}" data-action="toggle-advanced">${state.settings.advancedMode?'Advanced mode: on':'Advanced mode: off'}</button></div>
    <div class="small faint" style="margin-top:9px">Advanced mode adds per-set effort logging (RPE) in workouts and the training-block planner in Coach.</div></div>
  <div class="card"><div class="row" style="padding-top:0"><div><strong>Danger zone</strong><div class="small faint">Reset is double-confirmed and leaves a pre-reset snapshot.</div></div><button class="secondary danger" data-action="reset">Reset local data</button></div></div></div>`;
}

function renderReport(){const r=state.lastReport;if(!r){view='home';return renderHome()}const good=['S','A'].includes(r.grade);return`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('report')}<section class="hero report-hero"><div class="eyebrow">Workout report</div><div class="report-grade ${good?'good':''}">${esc(r.grade)}</div><div class="report-narr">${esc(r.narrative)}</div><div class="report-sub mono">OVR ${r.overall} (${r.delta>=0?'+':''}${r.delta}) · ${r.comp.up}↑ ${r.comp.held}→ ${r.comp.down}↓ · ${r.completion}% · ${r.durationMin} min · ${r.volume||0}KG${r.rpe?` · @${r.rpe} RPE`:''}</div>${r.prs?.length?`<div class="pr"><strong>New PRs:</strong> ${r.prs.slice(0,5).map(p=>`${esc(p.name)} ${esc(p.kind)} ${p.old}→${p.now}`).join(' · ')}</div>`:''}<div class="feedback"><div class="feedback-title">What to improve next time</div><ol class="feedback-list">${r.feedback.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div><button class="primary" data-action="summary">Open summary sheet</button><button class="secondary block" data-action="home">Back home</button></section><div class="section"><h2>Movement deltas</h2><span>Vs ${r.first?'baseline':'last same day'}</span></div><div class="card flat">${r.comp.lines.map(l=>`<div class="row"><div><strong>${esc(l.name)}</strong><div class="small faint">Strength ${Math.round(l.strength*1000)/10}% · Volume ${Math.round(l.vol*1000)/10}%</div></div><div class="mono" style="color:${l.dir==='up'?'var(--green)':l.dir==='down'?'var(--red)':'var(--muted)'}">${l.index>=0?'+':''}${Math.round(l.index*1000)/10}%</div></div>`).join('')}</div></div>`}

/* ---- Original 1: Strength Portfolio ---- */
function renderPortfolio(){
  const ps=portfolioSummary();
  const ready=ps.lifts.filter(l=>l.ready);
  const head=`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('summary')}<button class="back" data-action="home">‹ Home</button>`;
  if(ready.length<1){
    return head+`<section class="hero"><div class="eyebrow">Strength portfolio</div><div class="title">Coverage opens soon</div><div class="sub">Every lift becomes a rated position after two logged sessions. Log a full rotation to open the book.</div></section><div class="card"><div class="small faint">No positions yet. Start a session from Home — returns, volatility, drawdown and ratings appear here automatically.</div></div></div>`;
  }
  const sorted=ready.slice().sort((a,b)=>b.mean-a.mean);
  const rows=sorted.map(l=>`<button class="pos-row" data-action="exercise" data-ex="${l.ex.id}"><div class="pos-top"><div class="pos-name">${esc(l.ex.name)}</div><div class="rating" style="color:${ratingColor(l.rating)}">${l.rating}</div></div><div class="pos-stats"><div class="pstat"><div class="v">${Math.round(l.cur)}</div><div class="k">e1RM</div></div><div class="pstat"><div class="v" style="color:${l.mean>=0?'var(--pos)':'var(--neg)'}">${pctStr(Math.max(-0.99,Math.min(0.99,l.mean)))}</div><div class="k">ret/wk</div></div><div class="pstat"><div class="v">${l.sharpe.toFixed(2)}</div><div class="k">consist</div></div><div class="pstat"><div class="v" style="color:${l.dd<=-.02?'var(--neg)':'var(--muted)'}">${(l.dd*100).toFixed(1)}%</div><div class="k">draw</div></div></div></button>`).join('');
  const nwCard=ps.tl.length>=2?`<div class="card">${renderTrendSvgRaw(ps.tl.map(x=>({value:x.overall})),null,'')}</div>`:'';
  const alloc=ps.alloc.filter(a=>a.share>0).sort((a,b)=>b.share-a.share);
  const allocRows=alloc.map(a=>`<div class="alloc-row"><span class="alloc-name">${MUSCLE_LABEL[a.m]||a.m}</span><span class="alloc-bar"><i class="alloc-fill ${a.drift<-0.02?'under':''}" style="width:${clamp(a.share*100,0,100)}%"></i><i class="alloc-target" style="left:${clamp(ps.target*100,0,100)}%"></i></span><span class="alloc-num">${Math.round(a.share*100)}% · ${a.drift>=0?'+':''}${Math.round(a.drift*100)}%</span></div>`).join('');
  const under=alloc.slice().sort((a,b)=>a.drift-b.drift)[0];
  return head+`
  <section class="hero"><div class="eyebrow">Strength portfolio</div><div class="level-head"><div><div class="title" style="color:${scoreColor(ps.nw||0)}">Net worth ${ps.nw!=null?ps.nw:'—'}</div><div class="sub">Your lifts as a book of positions. Valuation is estimated 1RM; return is its weekly rate of change.</div></div>${ps.dd!=null?`<div class="rank" style="color:${ps.dd<=-.02?'var(--red)':'var(--green)'}">${(ps.dd*100).toFixed(1)}% DD</div>`:''}</div></section>
  <div class="grid3"><div class="metric"><div class="num">${ready.length}</div><div class="lab">Positions</div></div><div class="metric"><div class="num" style="color:${(ps.cagr||0)>=0?'var(--green)':'var(--red)'}">${ps.cagr!=null?pctStr(ps.cagr,0):'—'}</div><div class="lab">CAGR / 4wk</div></div><div class="metric"><div class="num">${ps.peak!=null?ps.peak:'—'}</div><div class="lab">Peak OVR</div></div></div>
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
  const v=st.v,n=v.length,fc=3,fit=st.fit,goal=st.goal;
  const w=330,h=150,pad=24,xmax=n-1+fc;
  const fitAt=i=>fit.slope*i+fit.intercept;
  const allY=[...v,fitAt(xmax)+fit.rsd,fitAt(xmax)-fit.rsd,goal];
  const lo=Math.min(...allY)*0.98,hi=Math.max(...allY)*1.02;
  const X=i=>pad+i*(w-2*pad)/Math.max(1,xmax);
  const Y=val=>h-pad-(val-lo)/Math.max(.0001,hi-lo)*(h-2*pad);
  const fitLine=`${X(0)},${Y(fitAt(0))} ${X(n-1)},${Y(fitAt(n-1))}`;
  const fcLine=`${X(n-1)},${Y(fitAt(n-1))} ${X(xmax)},${Y(fitAt(xmax))}`;
  const band=`${X(n-1)},${Y(fitAt(n-1)+fit.rsd)} ${X(xmax)},${Y(fitAt(xmax)+fit.rsd)} ${X(xmax)},${Y(fitAt(xmax)-fit.rsd)} ${X(n-1)},${Y(fitAt(n-1)-fit.rsd)}`;
  const goalY=Y(goal);
  const svg=`<svg class="chart" viewBox="0 0 ${w} ${h}" aria-label="${esc(ex.name)} progression model"><line class="grid" x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}"/>${goalY>pad&&goalY<h-pad?`<line class="goal-line" x1="${pad}" y1="${goalY}" x2="${w-pad}" y2="${goalY}"/>`:''}<polygon class="fband" points="${band}"/><polyline class="fit" points="${fitLine}"/><polyline class="fcast" points="${fcLine}"/>${v.map((val,i)=>`<circle class="dotp" cx="${X(i)}" cy="${Y(val)}" r="3"/>`).join('')}<text x="${pad}" y="14">${Math.round(hi)}</text><text x="${pad}" y="${h-6}">${Math.round(lo)}</text></svg>`;
  const trend=st.spw>0.05?`+${st.spw.toFixed(1)}/wk`:st.spw<-0.05?`${st.spw.toFixed(1)}/wk`:'flat';
  const plat=st.z<=-1&&st.n>=4;
  return `<div class="card"><div class="row" style="padding-top:0"><div><strong>Progression model</strong><div class="small faint">Blue = fitted trend · gold dashed = forecast ± noise · line = goal</div></div><div class="rating" style="color:${ratingColor(st.rating)}">${st.rating}</div></div>${svg}<div class="grid3"><div class="metric"><div class="num">${trend}</div><div class="lab">Trend slope</div></div><div class="metric"><div class="num" style="color:${plat?'var(--red)':'var(--muted)'}">${st.z.toFixed(2)}</div><div class="lab">Plateau z</div></div><div class="metric"><div class="num">${st.wksToGoal!=null?st.wksToGoal:'—'}</div><div class="lab">Weeks to goal</div></div></div>${plat?`<div class="banner warn" style="margin-top:10px"><strong>Statistical plateau</strong><div>Last session sits ${Math.abs(st.z).toFixed(1)} SD below this lift's own trend. Hold load and add a rep, add a back-off set, or swap for 4 weeks.</div></div>`:''}</div>`;
}

/* ---- Original 3: Analyst desk (research note + what-if optimizer) ---- */
function renderAnalyst(){
  const a=analystNote();
  const head=`<div class="shell"><div id="toast-slot">${renderToast()}</div>${renderHead('summary')}<button class="back" data-action="portfolio">‹ Portfolio</button>`;
  if(!a.ready.length){
    return head+`<section class="hero"><div class="eyebrow">Analyst desk</div><div class="title">No coverage yet</div><div class="sub">${esc(a.headline)}</div></section></div>`;
  }
  const liftLine=l=>`<div class="row"><div><strong>${esc(l.ex.name)}</strong><div class="small faint">e1RM ${Math.round(l.cur)} · consistency ${l.sharpe.toFixed(2)}</div></div><div class="mono" style="color:${l.mean>=0?'var(--green)':'var(--red)'}">${pctStr(l.mean)}/wk</div></div>`;
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
    const pages={home:renderHome,summary:renderSummary,weekly:renderWeekly,workout:renderWorkout,achievements:renderAchievements,history:renderHistory,editSession:renderEditSession,program:renderProgram,bank:renderBank,data:renderData,exercise:renderExerciseDetail,report:renderReport,prs:renderPRs,portfolio:renderPortfolio,analyst:renderAnalyst};
    app.innerHTML=(pages[view]||renderHome)()+renderConfirm();
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
app.addEventListener('change',e=>{const t=e.target;if(t.dataset.num){setDirect(t.dataset.ex,t.dataset.num,Number(t.dataset.index||0),t.value);render()}});

window.addEventListener('beforeunload',e=>{
  if(state.session){e.preventDefault();e.returnValue=''}
});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){try{STORAGE.setItem(KEY,JSON.stringify(state))}catch(_){}if(Sync.configured()&&state.settings.autoSync&&state.settings.gistId)Sync.push('unload')}
  else if(document.visibilityState==='visible'&&view==='workout')holdWake(true);
});
window.addEventListener('error',ev=>{if(!crashed){crashed=true;try{app.innerHTML=renderCrash(ev.message||'Unknown error')}catch(_){}}});

/* Boot: render immediately from local, then pull cloud in the background. */
render();
snapshot();
if(state.settings.autoSync&&state.settings.gistToken&&state.settings.gistId){
  Sync.pull('boot').then(changed=>{if(changed){openDay=state.session?state.session.dayIndex:state.currentDayIndex;render()}});
}

/* Offline shell: register the service worker. No-op on file:// or unsupported browsers. */
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})});
}
