import puppeteer from 'puppeteer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlFile  = path.resolve(__dirname, '../public/cta-card.html')
const outFile   = path.resolve(__dirname, '../public/storey-cta.jpg')

const browser = await puppeteer.launch({ headless: 'new' })
const page    = await browser.newPage()

await page.setViewport({ width: 640, height: 1200, deviceScaleFactor: 2 })
await page.goto(`file:///${htmlFile.replace(/\\/g,'/')}`, { waitUntil: 'networkidle0' })

// Wait for fonts
await new Promise(r => setTimeout(r, 1500))

// Get actual card height
const height = await page.evaluate(() => document.querySelector('.card').scrollHeight)
await page.setViewport({ width: 640, height: height + 10, deviceScaleFactor: 2 })

await page.screenshot({
  path:    outFile,
  type:    'jpeg',
  quality: 95,
  fullPage: false,
})

await browser.close()
console.log('Saved:', outFile)
