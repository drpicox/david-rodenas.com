/**
 * The feature-size dial is straight up to 500 hours, then coarser, so that
 * both a task and an epic fit on one slider. Both ways, because the dial is
 * set from a size as well as read as one.
 */
export const featureSizeScale = {
  sizeAt(position: number): number {
    if (position <= 500) return position;
    if (position <= 750) return 500 + (position - 500) * 2;
    if (position < 1000) return 1000 + (position - 750) * 35;
    return 10000;
  },

  positionOf(size: number): number {
    if (size <= 500) return size;
    if (size <= 1000) return 500 + (size - 500) / 2;
    if (size < 10000) return 750 + (size - 1000) / 35;
    return 1000;
  },
};
