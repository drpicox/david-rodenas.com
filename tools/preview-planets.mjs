import { writeFileSync } from "node:fs";
import { createServer } from "vite";

/**
 * Grows a handful of worlds and writes them out side by side, so a person can
 * judge them — which is the only way to tell whether a planet is any good.
 *
 *   npm run planets            six worlds
 *   npm run planets -- 42 7    the two you name
 *
 * Vite loads the TypeScript so this tool needs no toolchain of its own.
 */
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "warn" });

try {
  const { generateWorld } = await vite.ssrLoadModule("/src/core/planet/generateWorld.ts");
  const { renderSphere } = await vite.ssrLoadModule("/src/core/planet/renderSphere.ts");
  const { writePng } = await vite.ssrLoadModule("/tools/writePng.ts");

  const SIZE = Number(process.env.SIZE ?? 160);
  const GAP = 12;
  const asked = process.argv.slice(2).map(Number).filter(Number.isFinite);
  const seeds = asked.length ? asked : [1, 2, 3, 4, 5, 6];

  const width = seeds.length * SIZE + (seeds.length + 1) * GAP;
  const height = SIZE + GAP * 2;
  const sheet = new Uint8ClampedArray(width * height * 4);

  seeds.forEach((seed, column) => {
    const pixels = renderSphere(generateWorld(seed), SIZE, { rotation: 0.6 });
    const offsetX = GAP + column * (SIZE + GAP);
    for (let y = 0; y < SIZE; y += 1) {
      for (let x = 0; x < SIZE; x += 1) {
        const from = (y * SIZE + x) * 4;
        const to = ((y + GAP) * width + offsetX + x) * 4;
        sheet[to] = pixels[from];
        sheet[to + 1] = pixels[from + 1];
        sheet[to + 2] = pixels[from + 2];
        sheet[to + 3] = pixels[from + 3];
      }
    }
  });

  writeFileSync("tools/planets.png", writePng(sheet, width, height));
  console.log(`${seeds.length} worlds (${seeds.join(", ")}) -> tools/planets.png`);
} finally {
  await vite.close();
}
