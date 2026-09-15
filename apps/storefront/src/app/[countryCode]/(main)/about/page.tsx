import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About & FAQ | [Your Shop Name]",
  description:
    "Who we are, and answers to common questions about printing A0 sewing patterns.",
}

const faqs = [
  {
    q: "What file format do you need?",
    a: "A single PDF, either as one full-size sheet or tiled across A4/Letter pages — most PDF sewing patterns work as they are. If you're not sure yours will, send it over and we'll check before printing.",
  },
  {
    q: "Will it print at true scale?",
    a: "Yes — we print at 1:1 scale and check every file against its included test square before it goes to press, so your pattern pieces come out exactly the size they're meant to be.",
  },
  {
    q: "How long does printing and shipping take?",
    a: "Most orders are printed and shipped within [X] business days. You'll get a shipping confirmation email once it's on its way.",
  },
  {
    q: "What paper do you print on?",
    a: "120gsm matte paper — sturdy enough to trace and cut directly, and thin enough to fold or roll for storage.",
  },
  {
    q: "Do you ship outside [Your Country]?",
    a: "[Placeholder — list the regions you ship to here, and any shipping costs or timelines that differ by region.]",
  },
  {
    q: "Something printed wrong — can I get a reprint?",
    a: "If your print arrived damaged, misprinted, or the wrong scale, contact us with your order number and we'll sort out a reprint or refund.",
  },
]

export default function AboutPage() {
  return (
    <div className="content-container py-16 small:py-24">
      {/* About */}
      <div className="flex flex-col small:flex-row items-center gap-12 small:gap-16 pb-20 small:pb-28">
        <div className="flex-1 flex flex-col gap-5">
          <span className="text-xs tracking-[0.14em] uppercase text-terracotta font-semibold">
            About Us
          </span>
          <h1 className="font-serif font-medium text-3xl small:text-4xl leading-tight text-ink">
            Started at our own kitchen table, over a lot of taped-together
            A4 pages.
          </h1>
          <p className="text-[15px] text-ink-soft leading-relaxed max-w-md">
            [Placeholder about-us copy — replace with your real story.]
            We&apos;re [Your Names], and we started [Your Shop Name] in
            [Your City] after one too many evenings spent taping together
            dozens of printer pages just to cut a single pattern piece. So
            we picked up a wide-format printer and started printing
            patterns for ourselves, then for friends, then for anyone
            tired of the tape.
          </p>
          <p className="text-[15px] text-ink-soft leading-relaxed max-w-md">
            Every order is still printed and packed by the two of us, by
            hand.
          </p>
        </div>
        <div className="flex-1 w-full">
          <div className="h-[300px] small:h-[360px] w-full bg-terracotta-tint rounded-lg flex items-center justify-center">
            <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="#B85C38" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 3a6 6 0 0 0-6 6c0 4 3 5.5 6 9 3-3.5 6-5 6-9a6 6 0 0 0-6-6Z" />
              <path d="M12.5 9.5c3 3 3 6 0 8" />
              <circle cx="7" cy="9" r="1.4" />
            </svg>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq">
        <h2 className="font-serif font-medium text-2xl text-ink mb-2">
          Frequently asked questions
        </h2>
        <p className="text-sm text-ink-muted mb-10">
          Still stuck? Reach out any time — we usually answer within a day.
        </p>

        <div className="flex flex-col max-w-2xl">
          {faqs.map((faq, i) => (
            <details
              key={faq.q}
              className="group border-b border-line py-5"
              open={i < 2}
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                <span className="text-[15px] font-medium text-ink">
                  {faq.q}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8A7F72"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="shrink-0 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path d="M5 9l7 7 7-7" />
                </svg>
              </summary>
              <p className="text-sm text-ink-soft leading-relaxed mt-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
