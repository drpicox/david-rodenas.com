"use client";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import matter from "gray-matter";
import { useEffect, useMemo, useRef } from "react";
import "highlight.js/styles/github-dark.css";
import "./Markdown.css";
import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { Element } from "hast";

// Extend the Element interface to include dataLanguage property
declare module "hast" {
  interface Properties {
    dataLanguage?: string;
  }
}

// Plugin to add data-language attribute to code blocks for styling
const rehypeAddLanguageAttribute: Plugin = () => {
  return (tree) => {
    visit(tree, "element", (node: Element) => {
      if (
        node.tagName === "code" &&
        node.properties &&
        typeof node.properties.className === "object" &&
        Array.isArray(node.properties.className)
      ) {
        const classes = node.properties.className as string[];
        const languageClass = classes.find((cls) =>
          cls.startsWith("language-"),
        );

        if (languageClass) {
          const language = languageClass.replace("language-", "");
          node.properties.dataLanguage = language;
        }
      }
    });
  };
};

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  const markdownRef = useRef<HTMLDivElement>(null);

  const htmlContent = useMemo(() => {
    try {
      // Extract content from frontmatter if present
      const { content: mdContent } = matter(content);

      // Process markdown with syntax highlighting using the unified pipeline
      const processedContent = unified()
        .use(remarkParse) // Parse markdown
        .use(remarkRehype, { allowDangerousHtml: true }) // Convert to rehype with HTML
        .use(rehypeHighlight, {
          detect: true, // Auto-detect language
          ignoreMissing: true, // Don't throw on missing languages
          subset: false, // Include all languages
          aliases: {
            js: "javascript",
            jsx: "javascript",
            ts: "typescript",
            tsx: "typescript",
          },
        } as any) // Add syntax highlighting
        .use(rehypeAddLanguageAttribute) // Add data-language attribute for CSS styling
        .use(rehypeStringify, { allowDangerousHtml: true }) // Convert to HTML string
        .processSync(mdContent);

      return processedContent.toString();
    } catch (error) {
      console.error("Error processing markdown:", error);
      return `<pre className="error">Error processing markdown: ${error}</pre>`;
    }
  }, [content]);

  // Process links after rendering to differentiate external links
  useEffect(() => {
    if (!markdownRef.current) return;

    const links = markdownRef.current.querySelectorAll("a");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      // Check if it's an external link
      if (href.startsWith("http://") || href.startsWith("https://")) {
        // Add external link indicator
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        link.classList.add("external-link");

        // Add external link icon if not already present
        if (!link.querySelector(".external-link-icon")) {
          const externalIcon = document.createElement("span");
          externalIcon.className = "external-link-icon";
          externalIcon.innerHTML = " ↗"; // Simple arrow, could be replaced with SVG
          link.appendChild(externalIcon);
        }
      }
    });
  }, [htmlContent]);

  return (
    <div
      ref={markdownRef}
      className="markdown-body"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown rendering requires it
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
