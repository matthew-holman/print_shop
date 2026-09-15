import { STORE_NAME } from "@lib/constants"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Footer() {
  return (
    <footer className="border-t border-line w-full bg-cream-deep">
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 py-16">
          <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
            <span className="font-serif italic text-xl text-ink">
              {STORE_NAME}
            </span>
            <span className="text-[13px] text-ink-muted leading-relaxed">
              Large-format A0 printing for PDF sewing patterns. Skip the
              tape, cut straight to sewing.
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs tracking-[0.08em] uppercase text-ink font-semibold">
              Shop
            </span>
            <LocalizedClientLink
              className="text-sm text-ink-soft hover:text-terracotta"
              href="/order"
            >
              Print a Pattern
            </LocalizedClientLink>
            <LocalizedClientLink
              className="text-sm text-ink-soft hover:text-terracotta"
              href="/cart"
            >
              Your Cart
            </LocalizedClientLink>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs tracking-[0.08em] uppercase text-ink font-semibold">
              Help
            </span>
            <LocalizedClientLink
              className="text-sm text-ink-soft hover:text-terracotta"
              href="/about"
            >
              About &amp; FAQ
            </LocalizedClientLink>
            <LocalizedClientLink
              className="text-sm text-ink-soft hover:text-terracotta"
              href="/about#faq"
            >
              Shipping &amp; Returns
            </LocalizedClientLink>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs tracking-[0.08em] uppercase text-ink font-semibold">
              Stay in the loop
            </span>
            <span className="text-[13px] text-ink-muted">
              Print tips and shop news, occasionally.
            </span>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-center sm:items-center justify-between gap-2 py-6 border-t border-line text-ink-muted">
          <span className="text-xs">
            &copy; {new Date().getFullYear()} {STORE_NAME}. All rights
            reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}
