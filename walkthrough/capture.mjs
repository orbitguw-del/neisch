/**
 * Storey App — Full Walkthrough Capture
 * Captures every screen as PNG frames, then compiles to MP4 with ffmpeg.
 *
 * Auth: opens the login page in a visible window so you can sign in yourself.
 * The script detects when you're logged in and continues automatically.
 */

import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const CHROME   = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5174';
const FRAMES   = path.join(process.cwd(), 'frames');
const OUT_MP4  = path.join(process.cwd(), '..', 'storey-walkthrough.mp4');

let frameIdx = 0;

// Clean previous frames
if (fs.existsSync(FRAMES)) fs.rmSync(FRAMES, { recursive: true });
fs.mkdirSync(FRAMES, { recursive: true });

async function shot(page, label) {
  const num  = String(++frameIdx).padStart(4, '0');
  const file = path.join(FRAMES, `${num}_${label}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📸 [${num}] ${label}`);
}

async function pause(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Hold a frame by duplicating it `count` times (makes it linger in the video)
async function hold(page, label, count = 5) {
  for (let i = 0; i < count; i++) await shot(page, `${label}_f${i}`);
}

// Wait for Supabase auth session to appear in localStorage
async function waitForAuth(page, timeoutMs = 120_000) {
  console.log('\n⏳  Waiting for you to sign in… (up to 2 min)');
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const hasSession = await page.evaluate(() => {
      try {
        const keys = Object.keys(localStorage);
        return keys.some(k => k.includes('supabase') && k.includes('auth'));
      } catch { return false; }
    }).catch(() => false);
    if (hasSession) return true;
    await pause(1000);
  }
  return false;
}

async function main() {
  console.log('\n🎬  Storey Walkthrough Capture\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--window-size=1300,870'],
  });

  const [page] = await browser.pages();
  await page.setViewport({ width: 1280, height: 800 });

  // ── 1. LANDING PAGE ──────────────────────────────────────────────────────────
  console.log('📄  Landing Page');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await pause(800);
  await hold(page, 'landing', 7);

  // Scroll down the landing page
  for (let y = 100; y <= 700; y += 100) {
    await page.evaluate(s => window.scrollTo({ top: s }), y);
    await pause(120);
    await shot(page, `landing_scroll_${y}`);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await pause(400);

  // ── 2. LOGIN PAGE ─────────────────────────────────────────────────────────────
  console.log('\n📄  Login Page');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await pause(600);
  await hold(page, 'login_main', 6);

  // Email & Password tab
  try {
    const [ep] = await page.$x('//*[contains(@class,"group") and .//*[contains(text(),"Email")]]');
    if (ep) { await ep.click(); await pause(500); await hold(page, 'login_email_form', 5); }
    const [back] = await page.$x('//button[contains(text(),"Back")]');
    if (back) { await back.click(); await pause(300); }
  } catch {}

  // Phone OTP tab
  try {
    const [ph] = await page.$x('//*[contains(@class,"group") and .//*[contains(text(),"Phone OTP")]]');
    if (ph) { await ph.click(); await pause(500); await hold(page, 'login_phone', 5); }
    const [back] = await page.$x('//button[contains(text(),"Back")]');
    if (back) { await back.click(); await pause(300); }
  } catch {}

  // Accept Invite tab
  try {
    const [inv] = await page.$x('//*[contains(@class,"group") and .//*[contains(text(),"Accept Team")]]');
    if (inv) { await inv.click(); await pause(500); await hold(page, 'login_invite', 5); }
    const [back] = await page.$x('//button[contains(text(),"Back")]');
    if (back) { await back.click(); await pause(300); }
  } catch {}

  // ── 3. REGISTER PAGE ──────────────────────────────────────────────────────────
  console.log('\n📄  Register Page');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
  await pause(600);
  await hold(page, 'register', 6);

  // ── 4. SIGN IN (user does it manually) ───────────────────────────────────────
  console.log('\n🔐  Please sign in using the browser window that just opened.');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await pause(400);

  const loggedIn = await waitForAuth(page);
  if (!loggedIn) {
    console.log('  ⚠️  Timed out waiting for sign-in. Exiting.');
    await browser.close();
    return;
  }

  // Navigate to dashboard to confirm session
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
  await pause(1200);

  // Check we landed on dashboard (not redirected back to login)
  const url = page.url();
  if (url.includes('/login')) {
    console.log('  ⚠️  Still on login page — sign-in may have failed.');
    await browser.close();
    return;
  }

  console.log('  ✅  Signed in! Starting authenticated screens…');

  // ── 5. DASHBOARD ─────────────────────────────────────────────────────────────
  console.log('\n📄  Dashboard');
  await hold(page, 'dashboard', 9);

  // Scroll to show full dashboard
  await page.evaluate(() => window.scrollTo(0, 300));
  await pause(300);
  await hold(page, 'dashboard_scroll', 5);
  await page.evaluate(() => window.scrollTo(0, 0));

  // ── 6. SITES LIST ─────────────────────────────────────────────────────────────
  console.log('\n📄  Sites');
  await page.goto(`${BASE_URL}/sites`, { waitUntil: 'networkidle2' });
  await pause(900);
  await hold(page, 'sites_list', 8);

  // Click into the first site
  try {
    const firstSiteLink = await page.$('a[href*="/sites/"]');
    if (firstSiteLink) {
      await firstSiteLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 });
      await pause(700);
      await hold(page, 'site_detail', 8);

      // Try tabs inside the site (Overview / Workers / Materials)
      const tabs = await page.$$('[role="tab"], button');
      for (const tab of tabs.slice(0, 6)) {
        try {
          const txt = await page.evaluate(el => el.textContent.trim(), tab);
          if (/workers|attendance|material|progress/i.test(txt)) {
            await tab.click();
            await pause(600);
            await hold(page, `site_tab_${txt.toLowerCase().replace(/\s+/g, '_')}`, 5);
          }
        } catch {}
      }
    }
  } catch {}

  // ── 7. INVENTORY ──────────────────────────────────────────────────────────────
  console.log('\n📄  Inventory');
  await page.goto(`${BASE_URL}/inventory`, { waitUntil: 'networkidle2' });
  await pause(900);
  await hold(page, 'inventory', 8);

  await page.evaluate(() => window.scrollTo(0, 400));
  await pause(300);
  await hold(page, 'inventory_scroll', 4);
  await page.evaluate(() => window.scrollTo(0, 0));

  // ── 8. WORKERS ────────────────────────────────────────────────────────────────
  console.log('\n📄  Workers');
  const workerUrls = [`${BASE_URL}/workers`, `${BASE_URL}/attendance`];
  for (const wu of workerUrls) {
    try {
      await page.goto(wu, { waitUntil: 'networkidle2', timeout: 6000 });
      const cur = page.url();
      if (!cur.includes('/login')) {
        await pause(800);
        await hold(page, `workers_${wu.split('/').pop()}`, 7);
        break;
      }
    } catch {}
  }

  // ── 9. REPORTS ────────────────────────────────────────────────────────────────
  console.log('\n📄  Reports');
  await page.goto(`${BASE_URL}/reports`, { waitUntil: 'networkidle2' });
  await pause(900);
  await hold(page, 'reports', 8);

  // Switch to Budget tab if exists
  try {
    const [budgetTab] = await page.$x('//button[contains(text(),"Budget")] | //a[contains(text(),"Budget")]');
    if (budgetTab) { await budgetTab.click(); await pause(600); await hold(page, 'reports_budget', 7); }
  } catch {}

  // ── 10. TEAM ──────────────────────────────────────────────────────────────────
  console.log('\n📄  Team');
  const teamUrls = [`${BASE_URL}/team`, `${BASE_URL}/members`];
  for (const tu of teamUrls) {
    try {
      await page.goto(tu, { waitUntil: 'networkidle2', timeout: 6000 });
      if (!page.url().includes('/login')) {
        await pause(800);
        await hold(page, 'team', 7);
        break;
      }
    } catch {}
  }

  // ── 11. SETTINGS ──────────────────────────────────────────────────────────────
  console.log('\n📄  Settings');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
  await pause(800);
  await hold(page, 'settings', 7);

  await browser.close();

  // ── COMPILE ────────────────────────────────────────────────────────────────────
  const files = fs.readdirSync(FRAMES).filter(f => f.endsWith('.png')).sort();
  console.log(`\n🎞️  Compiling ${files.length} frames into MP4…`);

  // Write frame list for ffmpeg concat demuxer
  const listFile = path.join(FRAMES, 'frames.txt');
  const listContent = files.map(f =>
    `file '${path.join(FRAMES, f).replace(/\\/g, '/')}'\nduration 0.18`
  ).join('\n');
  fs.writeFileSync(listFile, listContent);

  const ffmpegPath = `"${process.env.LOCALAPPDATA}\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-full_build\\bin\\ffmpeg.exe"`;
  const cmd = [
    ffmpegPath,
    '-y',
    '-f concat -safe 0',
    `-i "${listFile.replace(/\\/g, '/')}"`,
    '-vf "scale=1280:800:force_original_aspect_ratio=decrease,pad=1280:800:(ow-iw)/2:(oh-ih)/2:white,format=yuv420p"',
    '-c:v libx264 -crf 20 -preset fast',
    `-movflags +faststart`,
    `"${OUT_MP4.replace(/\\/g, '/')}"`
  ].join(' ');

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`\n✅  Done! Video saved to:\n   ${OUT_MP4}\n`);
  } catch (e) {
    console.error('\nffmpeg failed:', e.message);
    console.log('Frames are in:', FRAMES);
  }
}

main().catch(console.error);
