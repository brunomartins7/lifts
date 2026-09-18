#!/bin/sh
# Copies the web app into the iOS bundle. Run before building, and any time the
# web app changes — the wrapper serves these files, not the live site.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/.." && pwd)
dest="$here/BrunianLifts/www"
rm -rf "$dest"
mkdir -p "$dest"
for f in index.html app.js tokens.css manifest.webmanifest icon-192.png icon-512.png; do
  cp "$root/$f" "$dest/$f"
done
# The parity page is the app's own, not the website's. Reachable at
# brunianlifts://app/parity.html by editing the address in WebAppViewController,
# or just open ios/parity.html in Safari to compare the two environments.
cp "$here/parity.html" "$dest/parity.html"

# Demo videos, if there are any. These live outside the repo's tracked files on
# purpose — this repo is public and Pages serves it to anyone, so a video here
# would be published. Copying them into the app bundle is not publishing: the
# bundle is signed to one device and never distributed. The website therefore
# never gets them and keeps showing the animated clip, which is the correct
# behaviour rather than a compromise.
videos="$root/demos-local"
if [ -d "$videos" ]; then
  ids=""
  for v in "$videos"/*.mp4; do
    [ -e "$v" ] || continue
    mkdir -p "$dest/demos"
    cp "$v" "$dest/demos/"
    id=$(basename "$v" .mp4)
    ids="$ids\"$id\","
  done
  if [ -n "$ids" ]; then
    printf '[%s]\n' "${ids%,}" > "$dest/demos/have.json"
    echo "bundled $(ls -1 "$dest/demos"/*.mp4 2>/dev/null | wc -l | tr -d ' ') demo videos"
  fi
fi
# sw.js is deliberately not copied. A service worker exists to cache a site
# fetched over the network; these files are already on the device, and the
# custom scheme the wrapper serves them from cannot register one anyway.
echo "copied $(ls -1 "$dest" | wc -l | tr -d ' ') files into $dest"
