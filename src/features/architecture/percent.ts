/** A part of a whole as a percentage: whole from ten up, to a tenth below it, where the tenth is much of what there is; a dash when there is no whole. */
export function percent(part: number, whole: number): string {
  if (whole === 0) return "–";
  const share = (part / whole) * 100;
  return `${share >= 10 ? Math.round(share) : Math.round(share * 10) / 10}%`;
}
