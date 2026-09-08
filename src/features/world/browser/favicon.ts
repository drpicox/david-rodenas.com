import { SphereRaster } from "../SphereRaster";
import type { World } from "../World";

const SIZE = 32;
let scratch: HTMLCanvasElement | null = null;
let raster: SphereRaster | null = null;
let image: ImageData | null = null;
/** One encode at a time: a second would only overtake the first. */
let encoding = false;
/** The URL the tab is showing, kept only so the one before it can be let go. */
let showing = "";

/**
 * The world in the tab, too: the same sphere, 32 pixels wide, as the page's icon.
 *
 * The PNG is made with `toBlob` rather than `toDataURL`. A data URL is encoded
 * on the very thread that is trying to draw the next frame, and then handed
 * over as a string of some thousands of characters — several times a second,
 * while a planet is turning. It showed. A blob is encoded off that thread, and
 * the URL naming it arrives later, by which time the frame that asked for it
 * has long been drawn.
 */
export function paintFavicon(world: World, rotation: number): void {
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link || encoding) return;
  scratch ??= Object.assign(document.createElement("canvas"), { width: SIZE, height: SIZE });
  const context = scratch.getContext("2d");
  if (!context) return;
  image ??= context.createImageData(SIZE, SIZE);
  raster ??= new SphereRaster(SIZE, image.data);
  raster.paint(world, { rotation });
  context.putImageData(image, 0, 0);

  encoding = true;
  scratch.toBlob((blob) => {
    encoding = false;
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    link.type = "image/png";
    link.href = url;
    // The one before it has been on the tab for a while; nothing is waiting on it now.
    if (showing) URL.revokeObjectURL(showing);
    showing = url;
  }, "image/png");
}
