import React from "react"
import Container from "../components/Container"
import Main from "../components/Main"
import BasicLayout from "./BasicLayout"

export default function WikiPage({ children, pageContext }) {
  return (
    <BasicLayout>
      <Main>
        <Container>
          <h1>{pageContext.frontmatter.title}</h1>
          {children}
        </Container>
      </Main>
    </BasicLayout>
  )
}
