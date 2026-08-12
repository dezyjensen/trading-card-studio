#!/usr/bin/env node
/**
 * Rasterize hero samples into public/hero-samples/*.png
 *
 * Usage (with `npm run dev` already running on :3000):
 *   npm run capture:hero
 *
 * Or set CAPTURE_BASE to another origin:
 *   CAPTURE_BASE=http://127.0.0.1:3000 npm run capture:hero
 */
const fs = require("fs");
const path = require("path");
const http = require("http");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "hero-samples");
const BASE = (process.env.CAPTURE_BASE || "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);

function waitForServer(url, tries = 60) {
  return new Promise((resolve, reject) => {
    let n = 0;
    const tick = () => {
      n += 1;
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (n >= tries) {
          reject(
            new Error(
              `Server not ready: ${url}\nStart the app first: npm run dev`,
            ),
          );
        } else setTimeout(tick, 500);
      });
    };
    tick();
  });
}

async function main() {
  let playwright;
  try {
    playwright = require("playwright");
  } catch {
    console.error(
      "Playwright is required. Run: npm i -D playwright",
    );
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Waiting for ${BASE}/capture-hero ...`);
  await waitForServer(`${BASE}/capture-hero`);

  const browser = await playwright.chromium.launch({
    headless: true,
    channel: "chrome",
  });
  const page = await browser.newPage({
    deviceScaleFactor: 2,
    viewport: { width: 520, height: 920 },
  });

  await page.goto(`${BASE}/capture-hero`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });

  await page.waitForTimeout(1500);
  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = () => res();
              img.onerror = () => res();
            }),
      ),
    );
  });
  // Fonts / layout settle
  await page.waitForTimeout(500);

  const ids = await page.$$eval("[data-hero-card]", (nodes) =>
    nodes.map((n) => n.getAttribute("data-hero-card")),
  );

  console.log(`Capturing ${ids.length} samples → ${OUT_DIR}`);
  for (const id of ids) {
    const handle = await page.$(`[data-hero-card="${id}"]`);
    if (!handle) {
      console.warn("Missing card", id);
      continue;
    }
    const out = path.join(OUT_DIR, `${id}.png`);
    await handle.screenshot({ path: out, type: "png" });
    console.log("  wrote", path.relative(ROOT, out));
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    samples: ids.map((id) => ({
      id,
      src: `/hero-samples/${id}.png`,
    })),
  };
  fs.writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
