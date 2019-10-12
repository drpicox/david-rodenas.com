import React from "react"
import { css } from "@emotion/core"

const containerCss = css`
  margin: 0 auto;
  max-width: 40em;
  padding: 0 0.5em;
`

export default function Container({ children, className }) {
  return (
    <div css={containerCss} className={className}>
      {children}
    </div>
  )
}
