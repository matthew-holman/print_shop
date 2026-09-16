---
name: run-storefront
description: Build, run, and drive the Sew Printy storefront (Next.js App Router). Use when asked to start the storefront, screenshot a page, click through the Home -> Order -> Cart -> Checkout flow, check computed styles (font-family, padding), test responsive layout, or otherwise interact with the running storefront UI.
---

Start the storefront dev server, then drive it via
`.claude/skills/run-storefront/driver.mjs` - a small chromium-cli-style REPL
built for this project because chromium-cli isn't installed here and
Playwright's bundled Chromium has no build for this machine's OS (see
Gotchas). It reads newline-delimited commands from stdin and drives the
**system Google Chrome** headlessly via Playwright's `channel: "chrome"`.

All paths below are relative to `apps/storefront/` (this app's root).

## Prerequisites

None beyond what's already in this app's `devDependencies` (`playwright`,
added for this driver — no browser download required, see Gotchas). A
system Google Chrome install is required; on this machine it's at
`/Applications/Google Chrome.app`.

## Setup

```bash
npm install   # from repo root, or `npm install` here — playwright is already
              # in apps/storefront/package.json devDependencies
```

The Medusa backend must also be running (`http://localhost:9000` by
default) for any page that fetches store data (Cart, Checkout, Order). Home
and About are fully static and work without it.

## Build

No separate build step for dev — this drives `next dev`, not a production
build.

## Run (agent path)

Start the dev server (from repo root or this dir — `storefront:dev` is a
root script; `npm run dev` works from here too):

```bash
npm run storefront:dev &
timeout 30 bash -c 'until curl -sf http://localhost:8000 >/dev/null; do sleep 1; done'
```

Then pipe commands to the driver:

```bash
node .claude/skills/run-storefront/driver.mjs <<'EOF'
nav http://localhost:8000/dk
wait-for text=Print a Pattern
screenshot home
quit
EOF
```

Screenshots land in `.claude/skills/run-storefront/screenshots/<name>.png`;
the most recent is always also copied to `screenshots/screenshot.png`.

| command | what it does |
|---|---|
| `nav <url>` | go to a URL |
| `wait-for text=<text>` | wait for visible text to appear |
| `wait-for <selector>` | wait for a CSS selector to appear |
| `click <selector>` | click an element |
| `fill <selector> <text...>` | fill a form field (goes through Playwright's input pipeline, so React `onChange` fires) |
| `press <key>` | press a keyboard key, e.g. `Enter` |
| `upload <selector> <path>` | set a `<input type=file>`'s file — tested with a real PDF against the Order page's dropzone |
| `cookie <name> <value> [domain]` | set a cookie (domain defaults to `localhost`) — use this to inject `_medusa_cart_id` for testing Cart/Checkout with items, since it's `httpOnly` and can't be set via page JS |
| `resize <width> <height>` | set the viewport size, for responsive checks |
| `screenshot [name]` | full-page screenshot |
| `screenshot-element <selector> [name]` | screenshot just one element |
| `styles <selector> <p1,p2,...>` | print computed style values + bounding rect for an element, e.g. `styles h2 font-family,padding-left` — use this to *confirm* typography/spacing fixes instead of eyeballing screenshots |
| `eval <js>` | `page.evaluate(js)`, prints the JSON result |
| `console --errors` | print console/page errors seen so far this session |
| `quit` | close the browser and exit |

Example: creating a cart with a real line item first (via the backend's
store API) so Cart/Checkout render non-empty, then checking a heading's
font and a row's left padding:

```bash
PK=$(grep NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY .env.local | cut -d= -f2)
CART_ID=$(curl -s http://localhost:9000/store/carts -H "x-publishable-api-key: $PK" \
  -H "Content-Type: application/json" -d '{"region_id":"<region_id>"}' \
  | python3 -c "import json,sys;print(json.load(sys.stdin)['cart']['id'])")
curl -s "http://localhost:9000/store/carts/$CART_ID/line-items" \
  -H "x-publishable-api-key: $PK" -H "Content-Type: application/json" \
  -d '{"variant_id":"<variant_id>","quantity":1}' >/dev/null

node .claude/skills/run-storefront/driver.mjs <<EOF
cookie _medusa_cart_id $CART_ID
nav http://localhost:8000/dk/cart
wait-for text=Cart
styles h2 font-family
screenshot cart-with-item
quit
EOF
```

## Run (human path)

```bash
npm run storefront:dev   # -> http://localhost:8000, Ctrl-C to stop
```

## Test

The storefront has no automated test suite (per the repo's `AGENTS.md`) —
this driver *is* the test path for UI changes.

---

## Gotchas

- **`npx playwright install` fails with `ERROR: Playwright does not support
  chromium on mac13`.** This isn't a soft version check — this Playwright
  build's browser-download registry literally has no URL mapped for
  `mac13`/`mac13-arm64` (checked the bundled registry source directly:
  `mac11` through `mac13` all map to `void 0`, only `mac14+` has a URL). No
  Playwright version currently ships a Chromium build for macOS 13. The fix
  isn't a different Playwright version — it's not using the bundled
  Chromium at all: `chromium.launch({ channel: "chrome" })` drives the
  system-installed Google Chrome instead, and needs no browser download.
  This is exactly what `driver.mjs` does.
- **`fill` vs `eval el.value = ...`**: this app's forms are React-controlled
  inputs (shipping address, discount code, etc.) — setting `.value` via
  `eval` does not fire React's `onChange` and the form won't see the
  update. Always use the driver's `fill` command, which goes through
  Playwright's real input pipeline.
- **The cart cookie (`_medusa_cart_id`) is `httpOnly`** (set server-side in
  `src/lib/data/cookies.ts`), so it can't be set via `eval
  document.cookie=...` from the page. Use the driver's `cookie` command
  (`context.addCookies`), which sets it at the browser-context level and
  bypasses the httpOnly-from-page restriction.
- **A Medusa MCP/plugin might exist for backend calls, but there's no
  storefront-facing MCP** for the store API — creating a test cart/line-item
  needs a plain `curl` to `http://localhost:9000/store/...` with the
  `x-publishable-api-key` header (value in `apps/storefront/.env.local`),
  as shown above.

## Troubleshooting

- **`Error: browserType.launch: Executable doesn't exist`**: means
  `channel: "chrome"` didn't resolve — confirm Google Chrome is actually
  installed at the standard macOS path
  (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`).
- **`wait-for` times out on a page that needs the backend**: check
  `curl -s http://localhost:9000/health` — Cart/Checkout/Order pages 500
  or hang if the Medusa backend isn't running.
