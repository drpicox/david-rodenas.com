import React from "react"
import { Link } from "gatsby"
import { MDXProvider } from "@mdx-js/react"
import Container from "../components/Container"
import Main from "../components/Main"
import BasicLayout from "./BasicLayout"

const components = { Link }

export default function WikiPage({ children, pageContext }) {
  return (
    <BasicLayout>
      <MDXProvider components={components}>
        <Main>
          <Container>
            <h1>{pageContext.frontmatter.title}</h1>
            {children}
          </Container>
        </Main>
      </MDXProvider>
    </BasicLayout>
  )
}
