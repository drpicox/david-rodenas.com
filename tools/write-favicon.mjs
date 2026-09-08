import { writeFileSync } from "node:fs";
import { createServer } from "vite";

/**
 * Writes the still favicon: one world, grown with the header's recipe and
 * rendered at the size the tab shows it. It is what a browser has before the
 * script runs — and all that Safari, bookmarks and the history ever see —
 * so it should be a planet too, only one that does not turn.
 *
 *   node tools/write-favicon.mjs        the seed below
 *   node tools/write-favicon.mjs 42     the one you name
 *
 * Vite loads the TypeScript so this tool needs no toolchain of its own.
 */
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "warn" });

try {
  const { growWorld } = await vite.ssrLoadModule("/src/features/world/growWorld.ts");
  const { HEADER_RECIPE } = await vite.ssrLoadModule("/src/features/world/WorldRecipe.ts");
  const { renderSphere } = await vite.ssrLoadModule("/src/features/world/renderSphere.ts");
  const { writePng } = await vite.ssrLoadModule("/tools/writePng.ts");

  const SIZE = 32;
  const ROTATION = 0.6;
  const seed = Number(process.argv[2] ?? 1999);
  const out = process.env.OUT ?? "public/favicon.png";

  const pixels = renderSphere(growWorld({ ...HEADER_RECIPE, seed }), SIZE, { rotation: ROTATION });
  writeFileSync(out, writePng(pixels, SIZE, SIZE));
  console.log(`world ${seed} -> ${out}`);
} finally {
  await vite.close();
}
