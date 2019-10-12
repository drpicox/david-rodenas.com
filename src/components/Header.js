import React from "react"
import { Link } from "gatsby"
import { css } from "@emotion/core"
import Container from "./Container"
import DavidImage from "./DavidImage"
import Row from "./Row"

const headerCss = css`
  grid-area: header;
  padding: 1em 0;
  margin-bottom: 3em;
`
const indentCss = css`
  width: 5em;
`
const spaceCss = css`
  width: 1em;
`
const linkCss = css`
  padding-right: 0.5em;
  color: inherit;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`
const titleCss = css`
  font-size: 2em;
  font-weight: bolder;
  text-decoration: none;
`

export default function Header() {
  return (
    <div css={headerCss}>
      <Container>
        <Row>
          <span css={indentCss}></span>
          <DavidImage />
          <span css={spaceCss}></span>
          <div>
            <Row>
              <Link to="/" css={titleCss}>
                @drpicox
              </Link>
            </Row>
            <div>
              <Link to="/Home" css={linkCss}>
                HOME
              </Link>
              <Link to="/Blog" css={linkCss}>
                BLOG
              </Link>
            </div>
          </div>
        </Row>
      </Container>
    </div>
  )
}
