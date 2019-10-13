import React from "react"
import { MDXProvider } from "@mdx-js/react"
import Main from "../components/Main"
import BasicLayout from "./BasicLayout"
import * as shared from "../shared"

export default function WikiPage({ children, pageContext }) {
  return (
    <BasicLayout>
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
