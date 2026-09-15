import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils";
import {
  createProductOptionsWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

export const PRINT_PRODUCT_HANDLE = "a0-sewing-pattern-print";

// Placeholder pricing — replace with real per-sheet rates before launch.
// Read by src/subscribers/quantity-tier-pricing.ts to reprice cart line
// items based on the total sheet count across the whole cart.
export const PRINT_PRODUCT_QUANTITY_TIERS = [
  { min_quantity: 1, max_quantity: 3, unit_price: 5 },
  { min_quantity: 4, max_quantity: 6, unit_price: 4.5 },
  { min_quantity: 7, max_quantity: 10, unit_price: 4 },
  { min_quantity: 11, max_quantity: null, unit_price: 3.5 },
];

export async function seedPrintProduct({
  container,
  shippingProfileId,
  salesChannelId,
}: {
  container: MedusaContainer;
  shippingProfileId: string;
  salesChannelId: string;
}) {
  const {
    result: [defaultOption],
  } = await createProductOptionsWorkflow(container).run({
    input: {
      product_options: [
        {
          title: "Default option",
          values: ["Default option value"],
        },
      ],
    },
  });

  const basePrice = PRINT_PRODUCT_QUANTITY_TIERS[0].unit_price;

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "A0 Sewing Pattern Print",
          handle: PRINT_PRODUCT_HANDLE,
          description:
            "Print your uploaded PDF sewing pattern as an A0 sheet. Price per sheet drops automatically based on the total number of sheets in your order.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfileId,
          options: [{ id: defaultOption.id }],
          metadata: {
            quantity_tiers: PRINT_PRODUCT_QUANTITY_TIERS,
          },
          variants: [
            {
              title: "A0 Sewing Pattern Print",
              sku: "A0-PRINT",
              manage_inventory: false,
              options: {
                "Default option": "Default option value",
              },
              prices: [
                { amount: basePrice, currency_code: "eur" },
                { amount: basePrice, currency_code: "usd" },
              ],
            },
          ],
          sales_channels: [{ id: salesChannelId }],
        },
      ],
    },
  });
}

// Standalone entry point for re-seeding just the print product against an
// already-set-up store, e.g. after deleting it in Admin:
//   npx medusa exec ./src/migration-scripts/seed-print-product.ts
export default async function seed_print_product({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [shippingProfile],
  } = await query.graph({ entity: "shipping_profile", fields: ["id"] });
  const {
    data: [salesChannel],
  } = await query.graph({ entity: "sales_channel", fields: ["id"] });

  logger.info("Seeding print product...");
  await seedPrintProduct({
    container,
    shippingProfileId: shippingProfile.id,
    salesChannelId: salesChannel.id,
  });
  logger.info("Finished seeding print product.");
}
