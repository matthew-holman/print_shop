import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateLineItemInCartWorkflow } from "@medusajs/medusa/core-flows";

type QuantityTier = {
  min_quantity: number;
  max_quantity: number | null;
  unit_price: number;
};

function resolveTierUnitPrice(
  tiers: QuantityTier[],
  totalQuantity: number
): number | undefined {
  return tiers.find(
    (tier) =>
      totalQuantity >= tier.min_quantity &&
      (tier.max_quantity == null || totalQuantity <= tier.max_quantity)
  )?.unit_price;
}

// Products can opt into cart-wide quantity tiers by setting
// metadata.quantity_tiers (see PRINT_PRODUCT_QUANTITY_TIERS in
// src/migration-scripts/seed-print-product.ts). Unlike Medusa's built-in
// min_quantity/max_quantity price rules, which only see one line item's own
// quantity, this sums quantity across every line item of the same product in
// the cart — needed here because each uploaded pattern file becomes its own
// line item (see addToCart in the storefront), so a single print order is
// often split across several line items.
export default async function quantityTierPricingHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [cart],
  } = await query.graph({
    entity: "cart",
    filters: { id: data.id },
    fields: ["id", "items.id", "items.product_id", "items.quantity", "items.unit_price"],
  });

  const cartItems = (cart?.items ?? []).filter(
    (item): item is NonNullable<typeof item> => item != null && !!item.product_id
  );
  if (!cartItems.length) {
    return;
  }

  const productIds = [...new Set(cartItems.map((item) => item.product_id as string))];

  const { data: products } = await query.graph({
    entity: "product",
    filters: { id: productIds },
    fields: ["id", "metadata"],
  });

  const tiersByProductId = new Map<string, QuantityTier[]>();
  for (const product of products) {
    const tiers = product.metadata?.quantity_tiers as QuantityTier[] | undefined;
    if (tiers?.length) {
      tiersByProductId.set(product.id, tiers);
    }
  }

  if (!tiersByProductId.size) {
    return;
  }

  const itemsByProductId = new Map<string, typeof cartItems>();
  for (const item of cartItems) {
    const productId = item.product_id as string;
    if (!tiersByProductId.has(productId)) {
      continue;
    }
    const items = itemsByProductId.get(productId) ?? [];
    items.push(item);
    itemsByProductId.set(productId, items);
  }

  for (const [productId, items] of itemsByProductId) {
    const tiers = tiersByProductId.get(productId)!;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const unitPrice = resolveTierUnitPrice(tiers, totalQuantity);
    if (unitPrice === undefined) {
      continue;
    }

    for (const item of items) {
      if (item.unit_price === unitPrice) {
        continue;
      }

      await updateLineItemInCartWorkflow(container).run({
        input: {
          cart_id: cart.id,
          item_id: item.id,
          update: {
            unit_price: unitPrice,
            is_custom_price: true,
          },
        },
      });
    }
  }
}

export const config: SubscriberConfig = {
  event: "cart.updated",
};
