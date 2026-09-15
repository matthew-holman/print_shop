import { redirect } from "next/navigation"

// No customer accounts in this shop (guest checkout only), so there's
// nothing to verify. Send anyone who lands here to the homepage.
export default async function VerifyAccountPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  redirect(`/${countryCode}`)
}
