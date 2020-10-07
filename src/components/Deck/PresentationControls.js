import React from "react"
import { useDeck } from "./useDeck"
import { css } from "@emotion/core"
import { StartPresentation } from "./StartPresentation"

const buttonsCss = css`
  position: fixed;
  top: 0.2em;
  right: 0.2em;
  z-index: 1001;

  button {
    opacity: 0.1;
    margin: 0;
  }
  button:hover {
    opacity: 1;
  }
`

export function PresentationControls() {
  const [state, methods] = useDeck()

  if (!state.isPresenting) return <StartPresentation />

  return (
    <div css={buttonsCss}>
      <button onClick={methods.prevSlide}>&lt;</button>
      <button onClick={methods.nextSlide}>&gt;</button>
      <button onClick={methods.toggleIsPresenting}>X</button>
    </div>
  )
}
