import React from "react";
import { MDXProvider } from "@mdx-js/react";
import Main from "../components/Main";
import { NavIndex } from "../components/NavIndex";
import { NavTopics } from "../components/NavTopics";
import * as shared from "../shared";
import BasicLayout from "./BasicLayout";

export default function WikiPage({ children, pageContext }) {
  const { title, index, prev, next } = pageContext.frontmatter;
  return (
    <BasicLayout title={title}>
      <MDXProvider components={shared}>
        <Main>
          <shared.Container>
            <NavIndex index={index} prev={prev} next={next} />
            {title && <h1>{title}</h1>}
            {children}
            <NavTopics index={index} prev={prev} next={next} />
          </shared.Container>
        </Main>
      </MDXProvider>
    </BasicLayout>
  );
}
