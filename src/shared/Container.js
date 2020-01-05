import React from "react"
import { css } from "@emotion/core"

const containerCss = css`
  margin: 0 auto;
  max-width: 37rem;
  padding: 0 0.5rem;
`

export default function Container({ children, className }) {
  return (
    <div css={containerCss} className={className}>
      {children}
    </div>
  )
}
