import { SphereRaster } from "../core/planet/SphereRaster";
import type { World } from "../core/planet/World";

const SIZE = 32;
let scratch: HTMLCanvasElement | null = null;
let raster: SphereRaster | null = null;
let image: ImageData | null = null;

/** The world in the tab, too: the same sphere, 32 pixels wide, as the page's icon. */
export function paintFavicon(world: World, rotation: number): void {
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) return;
  scratch ??= Object.assign(document.createElement("canvas"), { width: SIZE, height: SIZE });
  const context = scratch.getContext("2d");
  if (!context) return;
  image ??= context.createImageData(SIZE, SIZE);
  raster ??= new SphereRaster(SIZE, image.data);
  raster.paint(world, { rotation });
  context.putImageData(image, 0, 0);
  link.type = "image/png";
  link.href = scratch.toDataURL("image/png");
}
