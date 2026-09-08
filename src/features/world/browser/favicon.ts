import { SphereRaster } from "../SphereRaster";
import type { World } from "../World";

const SIZE = 32;
let scratch: HTMLCanvasElement | null = null;
let raster: SphereRaster | null = null;
let image: ImageData | null = null;

/**
 * The world in the tab, too: the same sphere, 32 pixels wide, as the page's icon.
 *
 * `toDataURL` encodes the PNG on the thread that is drawing, which sounds like
 * something to get off it, and for a while this did — `toBlob`, an object URL,
 * a guard against overlapping encodes. Then it was measured: the encode is
 * 0.8 ms and happens once every 400, which is a fifth of one per cent of the
 * thread, and `toBlob` only moves a quarter of that off it. So the three
 * moving parts went back out and the one line came back. The buffers are still
 * kept, because that costs nothing to keep.
 */
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
