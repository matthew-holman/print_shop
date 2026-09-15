import { redirect } from "next/navigation"

// Collection browsing doesn't apply to a single-product shop. This layout
// redirects the whole /collections/* subtree to the order page instead of
// rendering the catalog UI underneath it.
export default async function CollectionsLayout({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  redirect(`/${countryCode}/order`)
}
