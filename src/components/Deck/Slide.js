import React, { useState, useEffect } from "react"
import { css } from "@emotion/core"
import { useDeck } from "./useDeck"

const fullDeckCss = css`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--background-color);
  z-index: 1000;
  overflow: auto;
  padding: 0.5em 1em;

  h1,
  h2,
  h3,
  h4 {
    margin-top: 0em;
  }

  h2,h3,h4 {
    font-size: 2rem;
    border-bottom: 0.12rem solid var(--title-color);
  }

  small {
    font-size: 75%;
    color: #888;
  }
  small p {
    margin: 0;
  }

  slide-row {
    display: flex;
  }

  slide-row > * {
    flex: 1;
  }
`

let nextSlideId = 0

export function Slide({ children }) {
  const [slideId] = useState(() => nextSlideId++)
  const [{ isPresenting, currentSlideId }, { addSlide }] = useDeck()
  useEffect(() => addSlide({ slideId }), [slideId, addSlide])

  if (!isPresenting) return children
  if (currentSlideId !== slideId) return null

  return <div css={fullDeckCss}>{children}</div>
}
