import React from "react"
import { css } from "@emotion/core"

const rowCss = css`
  display: flex;
`

export default function Row({ children }) {
  return <div css={rowCss}>{children}</div>
}
