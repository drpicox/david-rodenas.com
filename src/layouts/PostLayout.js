import React from "react"
import { MDXProvider } from "@mdx-js/react"
import Main from "../components/Main"
import BasicLayout from "./BasicLayout"
import * as shared from "../shared"

function computeSource(canonical) {
  if (canonical.startsWith("https://medium.com")) {
    return "at medium"
  }
  return "here"
}

export default function WikiPage({ children, pageContext }) {
  const { canonical } = pageContext.frontmatter

  return (
    <BasicLayout {...pageContext.frontmatter}>
      <MDXProvider components={shared}>
        <Main>
          <shared.Container>
            <h1>{pageContext.frontmatter.title}</h1>
            {canonical && (
              <p class="small">
                <a href={canonical} target="_blank" rel="noopener noreferrer">
                  This article was originally published{" "}
                  {computeSource(canonical)} ⬈
                </a>
              </p>
            )}
            {children}
          </shared.Container>
        </Main>
      </MDXProvider>
    </BasicLayout>
  )
}
