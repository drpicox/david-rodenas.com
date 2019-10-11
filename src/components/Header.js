import React from "react"
import { Link } from "gatsby"
import { css } from "@emotion/core"

const headerCss = css`
  grid-area: header;
  display: flex;
  padding: 1em;
  border-bottom: solid 1px black;
`

const gapCss = css`
  flex: 1;
`

export default function Header() {
  return (
    <div css={headerCss}>
      <strong>
        <Link to="/">@drpicox</Link>
      </strong>
      <div css={gapCss}></div>
      <Link to="/Home">Home</Link>
    </div>
  )
}
