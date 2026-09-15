import { STORE_NAME } from "@lib/constants"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-cream relative small:min-h-screen">
      <div className="h-16 bg-cream border-b border-line">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-ink flex items-center gap-x-2 flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus text-ink-soft hover:text-terracotta">
              Back to shopping cart
            </span>
            <span className="mt-px block small:hidden txt-compact-plus text-ink-soft hover:text-terracotta">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="font-serif italic text-xl text-ink hover:text-terracotta"
            data-testid="store-link"
          >
            {STORE_NAME}
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
    </div>
  )
}
