import React from "react";
import { useDeck } from "./useDeck";
import { css } from "@emotion/core";

const layoutsCss = css`
  .Deck-Row {
    display: flex;
    gap: 0.5em;
  }
  .Deck-Cell {
    flex: 1;
  }
`;

export function DeckLayouts({ children }) {
  const [{ isPresenting }] = useDeck();

  if (!isPresenting) return children;

  return <div css={layoutsCss}>{children}</div>;
}
