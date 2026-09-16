# apps/storefront/AGENTS.md

Read the root [AGENTS.md](../../AGENTS.md) first — this file only adds
storefront context specific to this print shop's customizations. This
started as the stock `medusajs/dtc-starter` Next.js storefront; most of the
account/order-history/collections machinery is still the unmodified
starter and behaves accordingly.

## UI review

Rendered-UI checks (screenshots, computed styles) go through the `playwright`
MCP server, not a source-only read. It's configured to drive the
system-installed Google Chrome (`--browser=chrome --headless`) rather than
Playwright's bundled Chromium — this dev machine runs macOS 13, and current
Playwright versions ship no Chromium build at all for macOS 13 (the download
map has no URL for it, not just a soft version check). If
`npx playwright install` ever fails with "does not support chromium on
mac13", that's this same issue — don't chase it by trying other Playwright
versions; the `chrome` channel is the fix. See also the `run` skill for
driving/screenshotting the app in general.

## Design system

- Palette (cream/ink/terracotta/sage) and font families live in
  `tailwind.config.js` (`theme.extend.colors`, `theme.extend.fontFamily`).
  Fonts (Newsreader serif, Work Sans sans) are loaded via `next/font/google`
  in `src/app/layout.tsx` as CSS variables (`--font-serif`, `--font-sans`) —
  don't add a `<link>` tag for them, and don't reintroduce "Inter" in the
  Tailwind config; it was never actually loaded before.
- The shared `Button` in `src/modules/common/components/ui/index.tsx` was
  recolored (primary = terracotta) — this cascades everywhere `Button` is
  used, including account/checkout pages that otherwise weren't touched.
  Don't recolor buttons ad hoc elsewhere; change it there.
- `[Your Shop Name]` is a literal placeholder string, scattered across Nav,
  Footer, Home, the About page, and the checkout header. It needs a
  find-and-replace (or ideally a single `NEXT_PUBLIC_SHOP_NAME` env var)
  once the actual brand name is decided — it is **not** meant to ship as-is.

## The print order flow (this is the core custom feature)

- `src/modules/products/components/product-actions/index.tsx` is no longer
  a generic variant picker. It's a PDF dropzone + copies stepper + Add to
  Cart, purpose-built for this shop's "upload a pattern, print it" flow.
  It uploads directly to the backend's `/store/pattern-uploads` route from
  the client (not through a Next.js server action — this is the one place
  in the app that calls the Medusa backend directly from the browser) and
  then calls `addToCart` with the returned file info as line item metadata.
- It still auto-selects the variant when a product has exactly one (as
  before), and falls back to the original `OptionSelect` dropdowns when a
  product has more than one variant — but that multi-variant path hasn't
  been tested together with the upload flow. If you add real product
  options (e.g. paper type), check that combination works.
- Dropped from the original starter's `ProductActions`: the mobile sticky
  action bar (`mobile-actions.tsx`, now unused/orphaned) and the `?v_id=`
  URL sync for the selected variant. Both were removed as unnecessary
  complexity for a single-variant product, not because they're broken —
  reintroduce if this becomes a genuinely multi-variant catalog.
- Cart line items read the uploaded filename from
  `item.metadata?.pattern_file_name` (see `src/modules/cart/components/item/index.tsx`),
  falling back to the normal variant-title display when that metadata isn't
  present (so any future non-pattern product still renders correctly).

## Pages

- `src/app/[countryCode]/(main)/page.tsx` (Home) no longer fetches
  collections/region data — it's a fully static marketing page (hero, how
  it works, trust strip). The old `FeaturedProducts` rail component still
  exists under `modules/home/components/featured-products` but is unused;
  delete it if it's not coming back.
- `src/app/[countryCode]/(main)/about/page.tsx` is new, and intentionally
  has **no** Medusa API calls — it's a static server component. The FAQ
  accordion uses native `<details>`/`<summary>` (no client JS, no Radix)
  on purpose. The about copy and several FAQ answers are placeholder text
  in brackets (e.g. `[Your Names]`, `[Your City]`, shipping regions) — swap
  in the real story and policies before launch.
- Checkout got a lighter pass than the rest: only
  `src/app/[countryCode]/(checkout)/layout.tsx` (header/branding) and
  `checkout-summary/index.tsx` (heading) were restyled. The address /
  shipping / payment step components still use the starter's original
  markup — they inherit the new palette from the root layout (body
  background/text/font) and the recolored `Button`, but weren't
  individually redesigned. Revisit if the checkout still looks
  inconsistent once you see it running.
