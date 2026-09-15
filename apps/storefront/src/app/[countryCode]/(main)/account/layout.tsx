import { redirect } from "next/navigation"

// This shop runs guest-checkout only — no customer accounts. This layout
// redirects the whole /account/* subtree (login, addresses, order history,
// profile) to the homepage instead of rendering the account UI underneath it.
export default async function AccountPageLayout({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  redirect(`/${countryCode}`)
}
