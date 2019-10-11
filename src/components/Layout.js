import React from "react"
import { css } from "@emotion/core"
import Header from "./Header"

const layoutCss = css`
  display: grid;
  grid-template-areas:
    "header header header"
    "left   main   right"
    "footer footer footer";
`

export default function Layout({ children }) {
  return (
    <div css={layoutCss}>
      <Header />
      {children}
    </div>
  )
}
