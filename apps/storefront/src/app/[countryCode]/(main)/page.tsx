import { Metadata } from "next"

import { STORE_NAME } from "@lib/constants"
import Hero from "@modules/home/components/hero"

export const metadata: Metadata = {
  title: `${STORE_NAME} | A0 Sewing Pattern Printing`,
  description:
    "Upload your PDF sewing pattern and we'll print it full-scale on A0 paper and ship it to you.",
}

const steps = [
  {
    title: "1. Upload your PDF",
    body: "Add the pattern file straight from your pattern shop or designer — tiled or full-page, we lay it out for you.",
    icon: (
      <path d="M12 16V4M12 4 7 9M12 4l5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    ),
  },
  {
    title: "2. Choose your copies",
    body: "Printing two sizes, or one for a friend? Set the quantity and add it to your cart.",
    icon: (
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
    ),
  },
  {
    title: "3. We print & ship",
    body: "Printed on sturdy 120gsm paper and rolled — not folded — so it lies flat when it arrives.",
    icon: <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 18a1.8 1.8 0 1 0 0-.01M17.5 18a1.8 1.8 0 1 0 0-.01" />,
  },
]

export default function Home() {
  return (
    <>
      <Hero />

      <div className="content-container pb-16 small:pb-24">
        <h2 className="font-serif font-medium text-2xl text-ink mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 small:grid-cols-3 gap-10">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col gap-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#B85C38"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {step.icon}
              </svg>
              <h3 className="text-base font-semibold text-ink">{step.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-cream-deep py-10">
        <div className="content-container grid grid-cols-1 small:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B2420" strokeWidth="1.6" aria-hidden="true">
              <rect x="3" y="4" width="18" height="14" rx="1" /><path d="M3 9h18" />
            </svg>
            <span className="text-sm text-ink">120gsm matte paper, true 1:1 scale</span>
          </div>
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B2420" strokeWidth="1.6" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
            <span className="text-sm text-ink">Printed and shipped within [X] business days</span>
          </div>
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B2420" strokeWidth="1.6" aria-hidden="true">
              <path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" />
            </svg>
            <span className="text-sm text-ink">Rolled shipping, ready to trace and cut</span>
          </div>
        </div>
      </div>
    </>
  )
}
