/** A coordinate to a tenth of a pixel: finer than a screen shows, shorter than the float it came from. */
export const fixed = (value: number): string => value.toFixed(1);
