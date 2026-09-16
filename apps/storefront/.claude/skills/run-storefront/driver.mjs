#!/usr/bin/env node
// Minimal chromium-cli-style REPL for driving the storefront dev server.
//
// Why this exists instead of chromium-cli: chromium-cli isn't available on
// this machine, and Playwright's own bundled Chromium has no build at all
// for macOS 13 (`npx playwright install` fails with "does not support
// chromium on mac13" - not a soft version check, there's just no download
// URL for that OS in the registry). This driver launches the *system*
// Google Chrome via Playwright's `channel: 'chrome'` instead, which needs
// no browser download at all - only the `playwright` npm package (already
// a devDependency of this app).
//
// Usage: pipe newline-delimited commands to stdin.
//
//   node .claude/skills/run-storefront/driver.mjs <<'EOF'
//   nav http://localhost:8000/dk
//   wait-for text=Print a Pattern
//   screenshot home
//   quit
//   EOF
//
// Commands:
//   nav <url>                          go to a URL
//   wait-for text=<text>               wait for text to appear
//   wait-for <selector>                wait for a CSS selector to appear
//   click <selector>                   click an element
//   fill <selector> <text...>          fill a form field (fires React onChange)
//   press <key>                        press a keyboard key (e.g. Enter, Tab)
//   upload <selector> <path>           set a file input's file
//   cookie <name> <value> [domain]     set a cookie (domain defaults to localhost)
//   resize <width> <height>            set the viewport size
//   screenshot [name]                  full-page screenshot -> screenshots/<name>.png
//   screenshot-element <sel> [name]    screenshot just one element
//   styles <selector> <p1,p2,...>      print computed style props for an element
//   eval <js>                          page.evaluate(js), prints JSON result
//   console --errors                   print collected console/page errors seen so far
//   quit                               close the browser and exit
//
// Screenshots land in .claude/skills/run-storefront/screenshots/, and the
// most recent one is always also copied to screenshots/screenshot.png.

import { chromium } from "playwright"
import { createInterface } from "node:readline"
import { mkdirSync, copyFileSync } from "node:fs"
import { dirname, join, isAbsolute } from "node:path"
import { fileURLToPath } from "node:url"

const SKILL_DIR = dirname(fileURLToPath(import.meta.url))
const SHOTS_DIR = join(SKILL_DIR, "screenshots")
mkdirSync(SHOTS_DIR, { recursive: true })

const consoleErrors = []
let shotCounter = 0

function log(...args) {
  console.log(...args)
}

function parseArgs(rest) {
  // splits on whitespace but keeps quoted "..." segments together
  const out = []
  const re = /"([^"]*)"|(\S+)/g
  let m
  while ((m = re.exec(rest))) out.push(m[1] ?? m[2])
  return out
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true })
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } })
  const page = await context.newPage()

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text())
  })
  page.on("pageerror", (err) => consoleErrors.push(String(err)))

  const rl = createInterface({ input: process.stdin, terminal: false })

  for await (const rawLine of rl) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const spaceIdx = line.indexOf(" ")
    const cmd = spaceIdx === -1 ? line : line.slice(0, spaceIdx)
    const rest = spaceIdx === -1 ? "" : line.slice(spaceIdx + 1).trim()

    try {
      switch (cmd) {
        case "nav": {
          await page.goto(rest, { waitUntil: "load", timeout: 30000 })
          log(`OK nav ${rest} -> ${page.url()}`)
          break
        }
        case "wait-for": {
          if (rest.startsWith("text=")) {
            await page.getByText(rest.slice(5), { exact: false }).first().waitFor({ timeout: 15000 })
          } else {
            await page.waitForSelector(rest, { timeout: 15000 })
          }
          log(`OK wait-for ${rest}`)
          break
        }
        case "click": {
          await page.click(rest, { timeout: 15000 })
          log(`OK click ${rest}`)
          break
        }
        case "fill": {
          const [selector, ...textParts] = parseArgs(rest)
          await page.fill(selector, textParts.join(" "), { timeout: 15000 })
          log(`OK fill ${selector}`)
          break
        }
        case "press": {
          await page.keyboard.press(rest)
          log(`OK press ${rest}`)
          break
        }
        case "upload": {
          const [selector, path] = parseArgs(rest)
          await page.setInputFiles(selector, path)
          log(`OK upload ${selector} ${path}`)
          break
        }
        case "cookie": {
          const [name, value, domain] = parseArgs(rest)
          await context.addCookies([
            { name, value, domain: domain || "localhost", path: "/" },
          ])
          log(`OK cookie ${name}`)
          break
        }
        case "resize": {
          const [width, height] = parseArgs(rest).map(Number)
          await page.setViewportSize({ width, height })
          log(`OK resize ${width}x${height}`)
          break
        }
        case "screenshot": {
          const name = rest || `shot-${++shotCounter}`
          const path = join(SHOTS_DIR, `${name}.png`)
          await page.screenshot({ path, fullPage: true })
          copyFileSync(path, join(SHOTS_DIR, "screenshot.png"))
          log(`OK screenshot -> ${path}`)
          break
        }
        case "screenshot-element": {
          const [selector, name] = parseArgs(rest)
          const shotName = name || `el-${++shotCounter}`
          const path = join(SHOTS_DIR, `${shotName}.png`)
          await page.locator(selector).first().screenshot({ path })
          copyFileSync(path, join(SHOTS_DIR, "screenshot.png"))
          log(`OK screenshot-element -> ${path}`)
          break
        }
        case "styles": {
          const [selector, propList] = parseArgs(rest)
          const props = propList.split(",")
          const result = await page.locator(selector).first().evaluate(
            (el, props) => {
              const cs = getComputedStyle(el)
              const out = {}
              for (const p of props) out[p] = cs.getPropertyValue(p)
              const rect = el.getBoundingClientRect()
              out._rect = { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
              return out
            },
            props
          )
          log(`STYLES ${selector} ${JSON.stringify(result)}`)
          break
        }
        case "eval": {
          const result = await page.evaluate(rest)
          log(`EVAL ${JSON.stringify(result)}`)
          break
        }
        case "console": {
          if (rest === "--errors") {
            log(`CONSOLE_ERRORS ${JSON.stringify(consoleErrors)}`)
          }
          break
        }
        case "quit": {
          await browser.close()
          process.exit(0)
        }
        default:
          log(`ERR unknown command: ${cmd}`)
      }
    } catch (err) {
      log(`ERR ${cmd}: ${err.message.split("\n")[0]}`)
    }
  }

  await browser.close()
}

main().catch((err) => {
  console.error("FATAL", err)
  process.exit(1)
})
