import { Suspense } from "react"

import { STORE_NAME } from "@lib/constants"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-24 mx-auto border-b duration-200 bg-cream border-line">
        <nav className="content-container flex items-center justify-between w-full h-full">
          <div className="flex-1 basis-0 h-full flex items-center gap-4">
            <div className="h-full flex items-center small:hidden">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
            <div className="hidden small:flex items-center gap-8 h-full">
              <LocalizedClientLink
                className="text-[15px] text-ink hover:text-terracotta transition-colors"
                href="/order"
                data-testid="nav-print-link"
              >
                Print a Pattern
              </LocalizedClientLink>
              <LocalizedClientLink
                className="text-[15px] text-ink hover:text-terracotta transition-colors"
                href="/about"
                data-testid="nav-about-link"
              >
                About &amp; FAQ
              </LocalizedClientLink>
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="flex flex-col items-center leading-none"
              data-testid="nav-store-link"
            >
              <span className="font-serif italic text-2xl text-ink">
                {STORE_NAME}
              </span>
              <span className="text-[10px] tracking-[0.14em] text-ink-muted uppercase mt-0.5">
                A0 Sewing Pattern Prints
              </span>
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-ink hover:text-terracotta transition-colors flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
