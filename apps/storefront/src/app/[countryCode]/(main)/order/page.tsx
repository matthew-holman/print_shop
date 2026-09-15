import { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"

import { STORE_NAME } from "@lib/constants"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductActions from "@modules/products/components/product-actions"
import ProductActionsWrapper from "@modules/products/templates/product-actions-wrapper"

export const metadata: Metadata = {
  title: `Order a Print | ${STORE_NAME}`,
  description:
    "Upload your PDF pattern and choose how many copies to print.",
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    return notFound()
  }

  const {
    response: { products },
  } = await listProducts({
    queryParams: { limit: 1 },
    countryCode,
  })

  const product = products[0]

  if (!product) {
    return notFound()
  }

  return (
    <div className="content-container py-12 small:py-16">
      <div className="grid grid-cols-1 small:grid-cols-2 gap-12 small:gap-16 max-w-4xl mx-auto">
        <div className="flex flex-col gap-4">
          <span className="text-xs tracking-[0.14em] uppercase text-terracotta font-semibold">
            Print an A0 Pattern
          </span>
          <h1 className="font-serif font-medium text-3xl text-ink">
            {product.title}
          </h1>
          <p className="text-[15px] text-ink-soft leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        <Suspense
          fallback={
            <ProductActions disabled product={product} region={region} />
          }
        >
          <ProductActionsWrapper id={product.id} region={region} />
        </Suspense>
      </div>
    </div>
  )
}
