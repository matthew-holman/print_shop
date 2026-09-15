import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Newsreader, Work_Sans } from "next/font/google"
import "styles/globals.css"

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${workSans.variable} ${newsreader.variable}`}
    >
      <body className="font-sans bg-cream text-ink">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
