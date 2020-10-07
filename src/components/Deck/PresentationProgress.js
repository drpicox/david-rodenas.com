import React from "react"
import { useDeckState } from "./useDeckState"
import { css } from "@emotion/core"

const progressCss = css`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 1003;
  height: 0.3em;
  background: var(--light-background-color);

  .bar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background: var(--primary-color);
    width: 10%;
  }
`

export function PresentationProgress() {
  const state = useDeckState()
  if (!state.isPresenting) return null

  const slideIdx = state.slides.indexOf(state.currentSlideId)
  const slideCount = state.slides.length
  const pct = (100 * (slideIdx + 1)) / slideCount

  return (
    <div css={progressCss}>
      <div className="bar" style={{ width: `${pct}%` }} />
    </div>
  )
}
