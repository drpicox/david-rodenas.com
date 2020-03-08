import React from "react"
import { MDXProvider } from "@mdx-js/react"
import Main from "../components/Main"
import * as shared from "../shared"
import BasicLayout from "./BasicLayout"

export default function WikiPage({ children, pageContext }) {
  const { title } = pageContext.frontmatter
  return (
    <BasicLayout title={title}>
      <MDXProvider components={shared}>
        <Main>
          <shared.Container>
            {title && <h1>{title}</h1>}
            {children}
          </shared.Container>
        </Main>
      </MDXProvider>
    </BasicLayout>
  )
}
