import React from "react"
import { css } from "@emotion/core"

const containerCss = css`
  margin: 0 auto;
  max-width: 20em;
`

export default function Container({ children }) {
  return <div css={containerCss}>{children}</div>
}
