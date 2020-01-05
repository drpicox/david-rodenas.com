import React from "react"
import { css } from "@emotion/core"
import DavidImage from "./DavidImage"
import { Container, Row, Link } from "../shared"

const hideSmallCss = css`
  @media (max-width: 30rem) {
    display: none;
  }
`

const headerCss = css`
  grid-area: header;
  padding: 1rem 0;
  margin-bottom: 3rem;
`
const indentCss = css`
  width: 5rem;
  @media (max-width: 35rem) {
    width: 0em;
  }
`
const spaceCss = css`
  width: 1em;
`
const linkCss = css`
  padding-right: 0.5rem;
  color: inherit;
  text-decoration: none;
  &:visited {
    color: inherit;
  }
  &:hover {
    text-decoration: underline;
  }
  &[aria-current] {
    color: gray;
    text-decoration: none;
  }
`
const titleCss = css`
  font-size: 2rem;
  font-weight: bolder;
  text-decoration: none;
  &:visited {
    color: inherit;
    color: var(--link-color);
  }
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
              <Link to="/Testing" css={linkCss}>
                TEST<span css={hideSmallCss}>ING</span>
              </Link>
              <Link to="/Teaching" css={linkCss}>
                TEACH<span css={hideSmallCss}>ING</span>
              </Link>
            </div>
          </div>
        </Row>
      </Container>
    </div>
  )
}
