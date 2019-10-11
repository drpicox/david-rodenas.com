import React from "react"
import { css } from "@emotion/core"

const mainCss = css`
  grid-area: main;
`

export default function Main({ children }) {
  return <div css={mainCss}>{children}</div>
}
