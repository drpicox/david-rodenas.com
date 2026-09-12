import type { TextCell } from "./TextCell";
import { VGA_PALETTE } from "./vgaPalette";

/**
 * A block of cells as the markup of a text-mode screen: one span per cell,
 * one line per row, and only the two half-blocks, the full block and the
 * space — which is all a picture on such a screen was ever made of. The
 * colours are the card's own, written in, so the page's theme cannot touch them.
 */
export function textWorldHtml(rows: readonly (readonly TextCell[])[]): string {
  const cell = ({ top, bottom }: TextCell): string => {
    if (top < 0 && bottom < 0) return "<span> </span>";
    if (top < 0) return `<span style="color:${VGA_PALETTE[bottom]}">▄</span>`;
    if (bottom < 0) return `<span style="color:${VGA_PALETTE[top]}">▀</span>`;
    if (top === bottom) return `<span style="color:${VGA_PALETTE[top]}">█</span>`;
    return `<span style="color:${VGA_PALETTE[top]};background:${VGA_PALETTE[bottom]}">▀</span>`;
  };
  return rows.map((row) => row.map(cell).join("")).join("\n");
}
