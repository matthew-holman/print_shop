import { redirect } from "next/navigation"

// Product detail pages don't apply to a single-product shop — the order
// page IS the product page now. This layout redirects the whole
// /products/* subtree there instead of rendering the old PDP underneath it.
export default async function ProductsLayout({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  redirect(`/${countryCode}/order`)
}
