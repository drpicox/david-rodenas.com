/** Each series of 1999: how many frames, and how many beats each frame stays. */
const SERIES = {
  x: { frames: 1, pace: 1 },
  normal: { frames: 2, pace: 1 },
  normal1: { frames: 2, pace: 1 },
  normal2: { frames: 2, pace: 1 },
  est: { frames: 7, pace: 5 },
  zz: { frames: 2, pace: 5 },
  bt: { frames: 6, pace: 1 },
  http: { frames: 8, pace: 2 },
  pract: { frames: 5, pace: 1 },
  no: { frames: 4, pace: 3 },
} as const;

type Series = keyof typeof SERIES;

/**
 * The picture in the egg: a series of GIFs, `est0` to `est6`, turned a frame
 * every few beats. The file names are the ones of 1999, so the page shows the
 * same drawings. A shake of the head (`no`) is laid over whatever it was
 * doing, and when it ends that comes back.
 */
export class Sprite {
  private series: Series = "x";
  private frame = 0;
  private wait = 0;
  private after: Series | null = null;
  private shaking = -1;

  get image(): string {
    return `${this.series}${this.frame}`;
  }

  play(series: Series): void {
    if (this.shaking >= 0) {
      this.after = series;
      return;
    }
    // A new series turns on the next beat; the same one keeps the pace it had.
    if (series !== this.series) this.wait = 0;
    this.show(series);
  }

  shake(beats: number): void {
    if (this.shaking < 0) this.after = this.series;
    this.shaking = beats;
    this.show("no");
  }

  /** The cross: there is no Fibergochi any more. */
  stop(): void {
    this.shaking = -1;
    this.after = null;
    this.series = "x";
    this.frame = 0;
  }

  beat(): void {
    if (this.shaking === 0 && this.after) this.show(this.after);
    if (this.shaking >= 0) this.shaking -= 1;
    if (this.wait > 0) this.wait -= 1;
    if (this.wait > 0) return;
    const { frames, pace } = SERIES[this.series];
    this.frame = (this.frame + 1) % frames;
    this.wait = pace;
  }

  private show(series: Series): void {
    this.series = series;
    this.frame %= SERIES[series].frames;
  }
}
