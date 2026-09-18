Drop exercise demo videos here, named after the exercise id, e.g.

    barbell-bench-press.mp4
    dumbbell-standing-triceps-extension.mp4

Run ./ios/sync-web.sh (or just build in Xcode) and they are bundled into the
iOS app. They are NOT committed and NOT deployed to the website — this folder
is gitignored, because the repo is public.

Get the exact id list with:   node ios/list-exercise-ids.mjs

Keep them short and small: 10-20 seconds, 720p, H.264. To compress one:
    ffmpeg -i in.mov -vf scale=-2:720 -c:v h264 -crf 28 -an -movflags +faststart out.mp4
