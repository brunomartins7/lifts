#!/bin/bash
# Builds the wrapper, installs it on a simulator and proves the things that
# actually matter: that it launches, that the ledger survives a relaunch, and
# that the bundled code is the website's code. Run from the repo root:
#   ./ios/stress-test.sh
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/.." && pwd)
cd "$here"

BUNDLE=com.brunomartins.brunianlifts
pass=0; fail=0
ok(){ echo "  PASS  $1"; pass=$((pass+1)); }
no(){ echo "  FAIL  $1"; fail=$((fail+1)); }

echo "== 1. build =="
./sync-web.sh >/dev/null
xcodebuild -project BrunianLifts.xcodeproj -scheme BrunianLifts \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  -configuration Debug CODE_SIGNING_ALLOWED=NO build >/tmp/lifts-build.log 2>&1 \
  && ok "compiles" || { no "compiles — see /tmp/lifts-build.log"; tail -20 /tmp/lifts-build.log; exit 1; }

APP=$(find ~/Library/Developer/Xcode/DerivedData -name 'BrunianLifts.app' -type d -path '*Debug-iphonesimulator*' | head -1)
[ -d "$APP" ] && ok "app bundle produced" || { no "no app bundle"; exit 1; }

echo "== 2. the bundle is the website, byte for byte =="
for f in index.html app.js tokens.css manifest.webmanifest icon-192.png icon-512.png; do
  cmp -s "$root/$f" "$APP/www/$f" && ok "$f identical" || no "$f DIVERGED from the website"
done
[ ! -f "$APP/www/sw.js" ] && ok "no service worker bundled" || no "sw.js should not ship"

echo "== 3. boot a simulator and install =="
DEV=$(xcrun simctl list devices available | grep -m1 -oE 'iPhone [0-9]+[^(]*\([0-9A-F-]{36}\)' | grep -oE '[0-9A-F-]{36}') || true
[ -n "${DEV:-}" ] || { no "no iPhone simulator available"; exit 1; }
xcrun simctl boot "$DEV" 2>/dev/null || true
xcrun simctl bootstatus "$DEV" -b >/dev/null 2>&1 || true
ok "simulator booted"
xcrun simctl uninstall "$DEV" "$BUNDLE" >/dev/null 2>&1 || true
xcrun simctl install "$DEV" "$APP" && ok "installs" || { no "install failed"; exit 1; }

echo "== 4. it launches and stays up =="
PID=$(xcrun simctl launch "$DEV" "$BUNDLE" 2>/dev/null | awk -F': ' '{print $2}') || true
sleep 6
if [ -n "${PID:-}" ] && ps -p "$PID" >/dev/null 2>&1; then ok "still running after 6s (pid $PID)"
else no "launched and died — a crash on boot"; fi

echo "== 5. the ledger is written, and survives a relaunch =="
# The check that decides whether this approach is sound at all: if web storage
# does not persist on a custom scheme, his log would evaporate and the wrapper
# is worthless. Polled rather than slept on — WebKit writes through a
# write-ahead log and checkpoints it later, so an immediate read finds nothing
# and says so falsely.
CONTAINER=$(xcrun simctl get_app_container "$DEV" "$BUNDLE" data 2>/dev/null) || true
ledger_bytes(){
  local db c
  # Re-resolved every call on purpose: reinstalling the app moves the data to a
  # new container UUID, and a cached path would report an empty ledger and call
  # a working app broken. That false alarm cost an hour once.
  c=$(xcrun simctl get_app_container "$DEV" "$BUNDLE" data 2>/dev/null) || { echo 0; return; }
  db=$(find "$c/Library/WebKit" -name 'localstorage.sqlite3' 2>/dev/null | head -1)
  [ -n "$db" ] || { echo 0; return; }
  sqlite3 "$db" "select coalesce(sum(length(value)),0) from ItemTable where key='brunian-lifts-v50';" 2>/dev/null || echo 0
}
wait_for_ledger(){
  local i=0
  while [ "$i" -lt 30 ]; do
    [ "$(ledger_bytes)" -gt 100 ] 2>/dev/null && return 0
    sleep 1; i=$((i+1))
  done
  return 1
}
if [ -n "${CONTAINER:-}" ]; then
  if wait_for_ledger; then ok "localStorage persisted the ledger ($(ledger_bytes) bytes)"
  else no "no ledger in WebKit storage after 30s"; fi

  IDB=$(find "$(xcrun simctl get_app_container "$DEV" "$BUNDLE" data)/Library/WebKit" -name 'IndexedDB.sqlite3' 2>/dev/null | head -1)
  [ -n "$IDB" ] && ok "IndexedDB mirror created" || no "no IndexedDB mirror — the backup copy is missing"

  before=$(ledger_bytes)
  xcrun simctl terminate "$DEV" "$BUNDLE" >/dev/null 2>&1 || true
  sleep 2
  xcrun simctl launch "$DEV" "$BUNDLE" >/dev/null 2>&1 || true
  if wait_for_ledger; then
    after=$(ledger_bytes)
    ok "ledger survived a force-quit and relaunch ($before -> $after bytes)"
  else no "ledger lost across relaunch — do NOT move your log into this"; fi

  # Reinstalling over the top is what happens every 7 days when the free
  # signature is renewed. If that wipes the container the whole plan fails, so
  # this plants a sentinel first: a ledger of the same size could just as well
  # be a fresh one, and only a value written before the reinstall proves the
  # old data actually came through.
  xcrun simctl terminate "$DEV" "$BUNDLE" >/dev/null 2>&1 || true
  sleep 2
  SENT="sentinel-$(date +%s)"
  SDB=$(find "$(xcrun simctl get_app_container "$DEV" "$BUNDLE" data)/Library/WebKit" -name 'localstorage.sqlite3' 2>/dev/null | head -1)
  sqlite3 "$SDB" "insert or replace into ItemTable (key,value) values ('__sentinel', CAST('$SENT' AS BLOB));" 2>/dev/null || true
  xcrun simctl install "$DEV" "$APP" >/dev/null 2>&1 || true
  xcrun simctl launch "$DEV" "$BUNDLE" >/dev/null 2>&1 || true
  if wait_for_ledger; then
    SDB2=$(find "$(xcrun simctl get_app_container "$DEV" "$BUNDLE" data)/Library/WebKit" -name 'localstorage.sqlite3' 2>/dev/null | head -1)
    got=$(sqlite3 "$SDB2" "select cast(value as text) from ItemTable where key='__sentinel';" 2>/dev/null || true)
    if [ "$got" = "$SENT" ]; then ok "ledger survived reinstalling over itself — the weekly re-sign keeps his log"
    else no "reinstall produced a DIFFERENT ledger (sentinel lost) — the weekly re-sign would erase his log"; fi
  else no "reinstalling wiped the ledger — the weekly re-sign would erase his log"; fi
else no "could not locate the app container"; fi

echo
echo "== $pass passed, $fail failed =="
[ "$fail" -eq 0 ]
