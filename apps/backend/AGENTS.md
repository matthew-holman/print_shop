# apps/backend/AGENTS.md

Read the root [AGENTS.md](../../AGENTS.md) first — this file only adds
backend context specific to this print shop's customizations.

## Custom store routes

- `POST /store/pattern-uploads` (`src/api/store/pattern-uploads/route.ts`,
  middleware in `src/api/middlewares.ts`) — accepts one PDF (`multipart/form-data`,
  field name `file`) from the storefront, up to 50MB, rejects anything whose
  mimetype isn't `application/pdf`. Uses the core `uploadFilesWorkflow` from
  `@medusajs/medusa/core-flows` (the same workflow the admin `/admin/uploads`
  route uses) to store the file via whatever File Module provider is
  configured, and returns `{ file: { id, url, filename } }`.
- This is the **only** custom route/middleware in the project so far. If you
  add more multipart routes, follow the same pattern: register the multer
  middleware in `src/api/middlewares.ts` (there's only one root file for all
  custom middleware — Medusa doesn't auto-load colocated `middlewares.ts`
  files the way its own core packages do internally).

## File storage

No explicit `modules` / file provider config exists yet in
`medusa-config.ts`, so uploads currently go to Medusa's default local-disk
File Module provider — fine for local dev, **not durable for production**.
The storefront's `.env.local` already has placeholder
`MEDUSA_CLOUD_S3_HOSTNAME` / `MEDUSA_CLOUD_S3_PATHNAME` vars suggesting a
Medusa Cloud + S3 deployment target — configure the S3 file provider in
`medusa-config.ts` before shipping, or uploaded pattern files won't survive
a redeploy.

## Cart line item metadata — why it's used, and why not to change the pattern

The storefront's `addToCart` (`apps/storefront/src/lib/data/cart.ts`) sends
`metadata: { pattern_file_id, pattern_file_url, pattern_file_name }` directly
on `POST /store/carts/:id/line-items`. This was verified against the actual
`@medusajs/medusa` v2 source (not just docs) rather than assumed:

- `StoreAddCartLineItem` (`packages/medusa/src/api/store/carts/validators.ts`)
  accepts `metadata` on line-item **creation**, not just update.
- `findMatchingLineItem` (`packages/core/core-flows/src/cart/utils/find-matching-line-item.ts`)
  only merges two line items of the same `variant_id` when their `metadata`
  also deep-equals. Different metadata → separate line items, quantities
  never silently combined.

This is why the single print product can be added to the cart repeatedly
with different uploaded files and each stays its own line — **don't**
"simplify" `addToCart` back to a two-step create-then-update-metadata call;
it isn't necessary and reintroduces a window where a second upload of the
same variant could merge into the first before its metadata is set.

## The print product itself

Set up as an ordinary Medusa product/variant (SKUs already created via
admin). Keep it to a single variant (or one per real option like paper
type) — `ProductActions` on the storefront auto-selects when there's only
one variant and only shows the option picker when there's more than one.
Leave inventory management **off** on the variant unless you actually want
to cap print capacity — it's a print-on-demand item, not stocked goods.
