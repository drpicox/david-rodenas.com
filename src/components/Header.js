import React from "react"
import { css } from "@emotion/core"
import DavidImage from "./DavidImage"
import { Container, Row, Link } from "../shared"

const headerCss = css`
  grid-area: header;
  padding: 1em 0;
  margin-bottom: 3em;
`
const indentCss = css`
  width: 5em;
  @media (max-width: 40em) {
    width: 0em;
  }
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
              <Link to="/Teaching" css={linkCss}>
                TEACHING
              </Link>
            </div>
          </div>
        </Row>
      </Container>
    </div>
  )
}
