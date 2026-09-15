import { redirect } from "next/navigation"

// This is a single-product shop — there's nothing to browse. Send anyone
// who lands here (old links, bookmarks) straight to the order page.
export default async function StorePage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  redirect(`/${countryCode}/order`)
}
