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
# sw.js is deliberately not copied. A service worker exists to cache a site
# fetched over the network; these files are already on the device, and the
# custom scheme the wrapper serves them from cannot register one anyway.
echo "copied $(ls -1 "$dest" | wc -l | tr -d ' ') files into $dest"
