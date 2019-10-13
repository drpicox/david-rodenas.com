import React from "react"
import { css } from "@emotion/core"
import Container from "./Container"
import Row from "./Row"
import Col from "./Col"
import EditMe from "./EditMe"

const footerCss = css`
  grid-area: header;
  padding: 1em 0;
  color: gray;
  font-size: 0.8em;
  margin-top: 3em;

  a {
    color: inherit;
    text-decoration: none;
  }
`

export default function Footer() {
  return (
    <Container>
      <div css={footerCss}>
        <Row>
          Copyright © {new Date().getFullYear()} David Rodenas
          <Col></Col>
          <a
            href="https://github.com/drpicox"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            G
          </a>
          {" · "}
          <a
            href="https://twitter.com/drpicox"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            T
          </a>
          {" · "}
          <a
            href="https://medium.com/@drpicox"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            M
          </a>{" "}
          <EditMe />
        </Row>
      </div>
    </Container>
  )
}
