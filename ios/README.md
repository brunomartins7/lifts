# Lifts as an iOS app

Why this exists: iOS Screen Time **Downtime blocks web content outright**.
Adding Safari to Always Allowed does not help, and a home-screen web clip
inherits the block. An installed app *can* be added to Always Allowed. So this
is the same app, served from inside the bundle instead of over the network.

Everything here is free. No Apple Developer Program, no $99.

---

## Before you install anything: make the two ledgers one

The app gets its own storage, separate from the website in Safari. Log in one
and the other will not see it. **Turn on cloud sync in the web app first**, so
both read the same ledger:

1. Open the website → **Data** → cloud sync → create the gist and save the token.
2. Press **Save to cloud**. Check it says it worked.
3. Press **Export JSON** and keep that file somewhere safe.

Do not skip step 3. It is the only copy that does not live inside a browser.

---

## 1. Get Xcode

`xcodes` and `aria2` are already installed on this Mac. One command left:

```
xcodes install 26.6
```

It will ask for three things, in this order:

1. **Apple ID email**, then password, then the 6-digit code from your phone.
   An ordinary free Apple ID is enough — this is not the paid programme.
2. Nothing for a while. ~7GB down, then it expands to ~23GB. aria2 is
   installed so the download runs on 16 connections instead of one.
3. **Your Mac password**, to move Xcode into /Applications.

26.6 matches this Mac's macOS. `--latest` would also work — it skips betas —
but the explicit version cannot surprise you.

If the terminal login is being difficult, the same file is at
https://developer.apple.com/download/all (search "Xcode 26.6", take the .xip,
double-click it, drag the result into Applications). Same free Apple ID.

## 2. Build the web app into the wrapper

```
cd ~/Projects/lifts
./ios/sync-web.sh
open ios/BrunianLifts.xcodeproj
```

Re-run `sync-web.sh` any time the website changes — the app serves its own copy,
so a push to GitHub does **not** update it.

## 3. Sign it with your free Apple ID

In Xcode: select **BrunianLifts** in the file list → **Signing & Capabilities**.

- **Team**: pick your Apple ID (it will say *Personal Team*). Add the account
  under Xcode → Settings → Accounts if it is not listed.
- If it complains the bundle identifier is taken, change
  `com.brunomartins.brunianlifts` to anything unique and try again.

## 4. Put it on the phone

1. Plug the iPhone in, unlock it, tap **Trust**.
2. Pick it from the device menu at the top of the Xcode window.
3. Press **▶**.
4. First time only, on the phone: **Settings → General → VPN & Device
   Management → your Apple ID → Trust**.

## 5. Move your training log in

In the app: **Data** → cloud sync → paste the same gist ID and token → **Load
from cloud**. Check your last session is there before you trust it.

If sync is not set up, use **Import JSON** and pick the file from step 3 instead.

## 6. Allow it during Downtime

**Settings → Screen Time → Always Allowed → add Lifts.**

Then wait for a Downtime window and open it. This is the step that decides
whether the whole exercise worked — it is reasoned from how WebKit applies its
Screen Time controller to http(s) pages only, not from a test on your phone.

---

## The 7-day thing

A free Apple ID signs apps for **7 days**. After that the app refuses to launch
until you re-sign it: plug in, press **▶** again, about a minute.

- **Your data is not lost when it lapses.** It is still in the app container.
- **The website still works**, so you are never locked out of your log — you just
  lose Downtime access until you re-sign.
- To avoid the weekly cable: **SideStore** refreshes the signature from the phone
  itself, no computer, free.

## What is not solved yet

WebKit can evict a whole origin's storage under pressure, which would take the
ledger and its IndexedDB mirror together. Cloud sync and the JSON backup are the
defences. A native copy written outside WebKit would be better and is not built.
