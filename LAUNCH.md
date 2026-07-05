# Brunian Lifts — Launch Manual

The single rule that keeps your data safe: **deploy once to a stable URL and only ever open that link.** Browser storage is tied to the exact URL, so a new URL = empty app. Everything below exists to give you one permanent URL and keep it that way.

## 0. Files to deploy

Put these five files in the repo root (all live in this folder):

| File | Purpose |
|------|---------|
| `index.html` | App shell + styles |
| `app.js` | The entire application |
| `sw.js` | Service worker — makes the app open offline |
| `manifest.webmanifest` | PWA metadata — enables "install as app" |
| `icon-192.png`, `icon-512.png` | Home-screen icons (you already have these) |

Do **not** deploy `design-language.html`, `harness.js`, `LAUNCH.md`, or `portfolio_proto.js` — they're references/tools, not part of the app. (Harmless if uploaded, just unused.)

---

## 1. Deploy to GitHub Pages (recommended, ~3 minutes)

1. On github.com, create a repository — e.g. `lifts`. Public is simplest (Pages is free on public repos).
2. Upload the five files above into the repo root (**Add file → Upload files → Commit**).
3. **Settings → Pages → Build and deployment → Source: Deploy from a branch.** Branch: `main`, folder: `/ (root)`. Save.
4. Wait ~1 minute. Your app is live, forever, at:
   ```
   https://<your-username>.github.io/lifts/
   ```
5. **Bookmark that exact URL on your laptop.** On iPhone, open it in **Safari → Share → Add to Home Screen** (this is what makes it a real installed app with offline support).

That URL never changes, so your data is permanent.

### Updating the app later
Replace `app.js` / `index.html` (or `sw.js`) in the repo with new versions and commit. Same URL, so **your data is untouched**. The service worker is network-first, so the next time you open the app online you get the update automatically; open it once more if a change doesn't show immediately (the worker refreshes in the background).

---

## 2. Alternative: Netlify (only with a *fixed* site)

Netlify **Drop** (drag-and-drop) creates a **new random URL every upload** — that was the original cause of data vanishing. Only use Netlify if you create a **named site** and always deploy to it:

1. Netlify → **Add new site → Deploy manually**, drop the folder. Note the generated site name.
2. **Site configuration → Change site name** → set a permanent name, e.g. `brunian-lifts`. Your URL becomes `https://brunian-lifts.netlify.app`.
3. For every future update, deploy to **that same site** (Deploys tab → drag files in), never via a fresh Drop.

GitHub Pages is safer because the URL is structurally fixed. Prefer it.

---

## 3. Install as an app (PWA)

- **iPhone/iPad:** Safari → open the URL → Share → **Add to Home Screen**. Launches full-screen, works offline (the app shell is cached; only the exercise demo GIFs need a connection).
- **Android:** Chrome → open the URL → menu → **Install app / Add to Home screen**.
- **Laptop (Chrome/Edge):** open the URL → the install icon in the address bar → **Install**.

Offline behaviour: the app itself (screens, scoring, history, portfolio, analyst) works with no connection. Only the demo clips load from the internet.

---

## 4. Cloud sync — phone ↔ laptop (optional but recommended)

This is what lets both devices share one history. It uses a private GitHub Gist; no server, and the token never leaves your device (it's stripped from the cloud file and every export).

1. Create a GitHub **fine-grained personal access token**: github.com → Settings → Developer settings → **Fine-grained tokens → Generate new token**. Permissions: **Gists → Read and write** (nothing else). Copy it.
2. In the app: **Home → Data center → Cloud sync**, follow the three on-screen steps, paste the token, tap **Save to cloud**. This creates the Gist and stores its id.
3. On your **other device**, open the *same URL*, go to Data center → Cloud sync, paste the *same token*, and it pulls your history.

From then on the app pulls on open and pushes automatically after changes. The cross-device merge is safe: it unions sessions by id and keeps the more recently edited program and every bodyweight entry, so neither device silently overwrites the other.

---

## 5. Backups & safety net (already built in)

You have four independent layers — nothing you log is one accident away from gone:

1. **Cloud sync** — cross-device, survives losing any single device.
2. **Snapshots** — automatic local restore points (per training day, and before every import/reset/restore). Restore from **Data center → Snapshots**.
3. **Export** — **Data center → Export** for a manual JSON (full backup) or CSV (spreadsheet). Do this occasionally and keep the file.
4. **Crash guard** — if the app ever hits an error it shows a recovery screen with a raw-data download instead of a blank page; corrupt saves are quarantined, never deleted.

To move to a new phone: install the app at the same URL, then either sign in to cloud sync or **Data center → Import** your JSON.

---

## 6. Troubleshooting

- **"My data disappeared."** You opened a *different* URL (a fresh Netlify Drop link, or `index.html` from the Files app). Always open your one bookmarked URL. Your data is tied to it.
- **App looks stale after an update.** Open it once more while online; the service worker updates in the background and serves the new version on the next load. Hard-refresh (or close and reopen the installed app) to force it.
- **GIF demos don't load.** They're the only online-only part. Check your connection; everything else still works offline.
- **Cloud sync says not configured.** You need both a token *and* to have pressed **Save to cloud** once (which creates the Gist). Do that on the first device before pulling on the second.
- **Nothing happens on GitHub Pages for a minute.** First deploy can take a moment to go live; refresh after ~60 seconds.

---

## 7. What's in this version (v2.1)

Complete and verified (28/28 core checks + 9/9 interface checks): A/B/C rotation with OVR scoring and S–F grades; 118-movement exercise bank (swap/add/remove without touching history); per-set logging with rest timer, plate math and warm-up ramp; weekly coach (volume bands, weak points, plateau watch, deload, projection); training heatmap, streaks, PR timeline, per-exercise trend + fitted **progression models** (forecast + statistical plateau); **Strength Portfolio** (returns, volatility, consistency, drawdown, ratings, allocation); **Analyst desk** (research note + what-if optimizer, Markdown export); a **Today** decision banner on Home; bodyweight log; achievements; local-first persistence with IndexedDB mirror, snapshots, quarantine, crash guard, and safe GitHub Gist sync; offline PWA install.

The visual language from `design-language.html` is now **built into the app**: a gold-stroke icon system across the nav and command centre, elevated gradient charts with a draw-in, a first-run home that invites rather than showing empty widgets, a depleting rest-timer ring, a 4-up portfolio position grid, semantic colour tokens, and a restrained motion layer (view fade, radar draw, press feedback) — all behind `prefers-reduced-motion`. `design-language.html` remains as the style reference; it is not deployed.
