import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Photographs the programs running on their pages, for the pictures the
 * portfolio layout shows beside them. A picture of a program is only true of
 * the program as it runs, so it is taken from the running site and not drawn.
 *
 *   npm run dev                          in one terminal, then
 *   node tools/shoot-projects.mjs        every shot
 *   node tools/shoot-projects.mjs rocket the ones you name
 *   THEME=dark node tools/…              the same, as a reader with a dark
 *                                        screen sees them, into name-dark.jpg
 *
 * Chrome is driven over its DevTools protocol with the WebSocket node already
 * has, so this tool needs nothing installed.
 */
const SITE = process.env.SITE ?? "http://localhost:5173";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "public/projects/shots";
const PORT = 9333;
const WIDTH = 1200;
/** A dark screen is asked for as the reader's system would ask: the site follows it, as it does for them. */
const DARK = process.env.THEME === "dark";

/** What to photograph: the program's place on its page, from its top, at a card's proportions. */
const SHOTS = [
  { name: "architecture", route: "/projects/architecture/", selector: '.app[data-app="architecture"] canvas' },
  { name: "fish-market", route: "/projects/fish-market/", selector: '.app[data-app="fish-market"]' },
  { name: "letters", route: "/projects/first-network/", selector: '.app[data-app="letters"]' },
  { name: "fibergochi", route: "/projects/fibergochi/", selector: '.app[data-app="fibergochi"]' },
  { name: "adventure", route: "/teaching/adventure/", selector: '.app[data-app="adventure"]' },
  { name: "worlds", route: "/projects/worlds/", selector: '.app[data-app="worlds"]' },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Chrome writes to its profile until it has exited, so the profile goes after it does. */
async function quit(chrome, profile) {
  const exited = new Promise((resolve) => chrome.once("exit", resolve));
  chrome.kill();
  await exited;
  rmSync(profile, { recursive: true, force: true });
}

async function browser() {
  const profile = mkdtempSync(join(tmpdir(), "shoot-"));
  const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--hide-scrollbars", `--window-size=${WIDTH},900`, "about:blank"], { stdio: "ignore" });
  for (let tries = 0; tries < 50; tries += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = targets.find((target) => target.type === "page");
      if (page) return { url: page.webSocketDebuggerUrl, close: () => quit(chrome, profile) };
    } catch {
      // Not listening yet.
    }
    await wait(100);
  }
  chrome.kill();
  throw new Error("Chrome did not start");
}

function session(url) {
  const socket = new WebSocket(url);
  let next = 0;
  const waiting = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const reply = waiting.get(message.id);
    if (!reply) return;
    waiting.delete(message.id);
    if (message.error) reply.reject(new Error(message.error.message));
    else reply.resolve(message.result);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      next += 1;
      waiting.set(next, { resolve, reject });
      socket.send(JSON.stringify({ id: next, method, params }));
    });
  return new Promise((resolve) => socket.addEventListener("open", () => resolve({ send, close: () => socket.close() })));
}

const asked = process.argv.slice(2);
const shots = asked.length ? SHOTS.filter((shot) => asked.includes(shot.name)) : SHOTS;
mkdirSync(OUT, { recursive: true });

const chrome = await browser();
try {
  const page = await session(chrome.url);
  await page.send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: 900, deviceScaleFactor: 1, mobile: false });
  if (DARK) await page.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  for (const shot of shots) {
    await page.send("Page.navigate", { url: SITE + shot.route });
    // Long enough for the script to mount the program and for anything that moves to have moved a little.
    await wait(2500);
    const { result } = await page.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const element = document.querySelector(${JSON.stringify(shot.selector)});
        if (!element) return null;
        element.scrollIntoView({ block: "start" });
        const box = element.getBoundingClientRect();
        return { x: box.left + scrollX, y: box.top + scrollY, width: box.width, height: box.height };
      })()`,
    });
    const box = result.value;
    if (!box) {
      console.warn(`${shot.name}: nothing at ${shot.selector}`);
      continue;
    }
    await wait(500);
    const height = Math.min(box.height, Math.round(box.width * 0.6));
    const { data } = await page.send("Page.captureScreenshot", { format: "jpeg", quality: 80, captureBeyondViewport: true, clip: { x: box.x, y: box.y, width: box.width, height, scale: 800 / box.width } });
    const file = `${shot.name}${DARK ? "-dark" : ""}.jpg`;
    writeFileSync(join(OUT, file), Buffer.from(data, "base64"));
    console.log(`${shot.name}: ${OUT}/${file}`);
  }
  page.close();
} finally {
  await chrome.close();
}
