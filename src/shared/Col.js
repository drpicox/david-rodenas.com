import React from "react"
import { css } from "@emotion/core"

const rowCss = css`
  flex: 1;
`

export default function Col({ children }) {
  return <div css={rowCss}>{children}</div>
}
