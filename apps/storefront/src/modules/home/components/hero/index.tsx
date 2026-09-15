import { Button } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="content-container flex flex-col small:flex-row items-center gap-12 small:gap-16 py-16 small:py-24">
      <div className="flex-1 flex flex-col gap-6">
        <span className="text-xs tracking-[0.14em] uppercase text-terracotta font-semibold">
          A0 Pattern Printing
        </span>
        <h1 className="font-serif font-medium text-4xl small:text-[52px] leading-[1.1] text-ink">
          Full-size sewing patterns, printed and on their way.
        </h1>
        <p className="text-base text-ink-soft leading-relaxed max-w-md">
          Upload your PDF pattern, tell us how many copies you need, and
          we&apos;ll print it full-scale on a single A0 sheet &mdash; no
          taping A4 pages at the kitchen table.
        </p>
        <div className="flex items-center gap-5 pt-2">
          <LocalizedClientLink href="/order">
            <Button variant="primary" size="large">
              Upload your pattern
            </Button>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/about"
            className="text-sm text-ink-soft border-b border-line hover:text-terracotta hover:border-terracotta pb-0.5"
          >
            How it works
          </LocalizedClientLink>
        </div>
      </div>
      <div className="flex-1 w-full">
        <div className="relative w-full h-[420px] bg-terracotta-tint rounded-lg flex items-center justify-center">
          <svg
            width="200"
            height="200"
            viewBox="0 0 220 220"
            fill="none"
            aria-hidden="true"
          >
            <ellipse cx="80" cy="150" rx="46" ry="14" stroke="#B85C38" strokeWidth="2" />
            <path d="M34 150 V60 A46 14 0 0 1 126 60 V150" stroke="#B85C38" strokeWidth="2" />
            <ellipse cx="80" cy="60" rx="46" ry="14" stroke="#B85C38" strokeWidth="2" />
            <path d="M120 46 L188 24" stroke="#2B2420" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 10" />
            <path
              d="M150 168 c14 8 26 4 34 -10 c8 -14 2 -24 -8 -22 c-8 2 -8 12 0 16 c10 5 24 -2 26 -16"
              stroke="#2B2420"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="178" cy="150" r="3" fill="#2B2420" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default Hero
