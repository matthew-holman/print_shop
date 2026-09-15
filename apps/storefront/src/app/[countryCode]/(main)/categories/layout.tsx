import { redirect } from "next/navigation"

// Category browsing doesn't apply to a single-product shop. This layout
// redirects the whole /categories/* subtree to the order page instead of
// rendering the catalog UI underneath it.
export default async function CategoriesLayout({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  redirect(`/${countryCode}/order`)
}
