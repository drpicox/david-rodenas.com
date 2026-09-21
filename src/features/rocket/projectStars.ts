import type { NearStar } from "./nearStars";

export interface View {
  /** The turn about the vertical, and the tilt towards the viewer, in radians. */
  readonly yaw: number;
  readonly pitch: number;
  /** Pixels from the middle of the picture to a star `reach` light-years out and across the view. */
  readonly radius: number;
  readonly reach: number;
}

export interface Seen {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  /** Towards the eye is positive, in light-years. */
  readonly depth: number;
}

/**
 * Where each star falls on a picture of the neighbourhood with the Sun in
 * the middle. No perspective: at this scale it would only distort the
 * distances the picture is there to show. Depth is kept, to draw the far
 * stars first and fainter.
 */
export function projectStars(stars: readonly Pick<NearStar, "name" | "ra" | "dec" | "lightYears">[], view: View): Seen[] {
  const scale = view.radius / view.reach;
  return stars.map(({ name, ra, dec, lightYears }) => {
    const alpha = (ra / 24) * 2 * Math.PI;
    const delta = (dec / 180) * Math.PI;
    // The sky's own axes: x towards the first point of Aries, z towards the pole.
    const x = lightYears * Math.cos(delta) * Math.cos(alpha);
    const y = lightYears * Math.cos(delta) * Math.sin(alpha);
    const z = lightYears * Math.sin(delta);
    // Turn about the pole, then tilt about the horizontal of the picture.
    const across = y * Math.cos(view.yaw) - x * Math.sin(view.yaw);
    const away = x * Math.cos(view.yaw) + y * Math.sin(view.yaw);
    const up = z * Math.cos(view.pitch) - away * Math.sin(view.pitch);
    const depth = away * Math.cos(view.pitch) + z * Math.sin(view.pitch);
    return { name, x: across * scale, y: -up * scale, depth };
  });
}
