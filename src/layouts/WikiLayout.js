import React from "react"
import { MDXProvider } from "@mdx-js/react"
import Main from "../components/Main"
import * as shared from "../shared"
import BasicLayout from "./BasicLayout"

export default function WikiPage({ children, pageContext }) {
  return (
    <BasicLayout title={pageContext.frontmatter.title}>
      <MDXProvider components={shared}>
        <Main>
          <shared.Container>
            <h1>{pageContext.frontmatter.title}</h1>
            {children}
          </shared.Container>
        </Main>
      </MDXProvider>
    </BasicLayout>
  )
}
