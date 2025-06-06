"use client";

import matter from "gray-matter";
import { createElement, useEffect, useMemo, useRef } from "react";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import "highlight.js/styles/github-dark.css";
import "./Markdown.css";
import type { Element } from "hast";
import dynamic from "next/dynamic";
import { createRoot } from "react-dom/client";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

// Dynamic imports for simulators
const TechnicalDebtSimulator = dynamic(
  () => import("../../features/simulators/TechnicalDebtSimulator"),
  {
    ssr: false,
    loading: () => <div className="text-center py-8">Loading simulator...</div>,
  },
);

const DeveloperProductivitySimulator = dynamic(
  () => import("../../features/simulators/DeveloperProductivitySimulator"),
  {
    ssr: false,
    loading: () => <div className="text-center py-8">Loading simulator...</div>,
  },
);

// Component registry for dynamic rendering
const componentRegistry = {
  TechnicalDebtSimulator,
  DeveloperProductivitySimulator,
} as const;

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

// Plugin to convert React component syntax to HTML placeholders
const rehypeReactComponents: Plugin = () => {
  return (tree) => {
    visit(tree, "element", (node: Element) => {
      // Check if this is our component element (it will be parsed as an HTML element)
      if (node.tagName && componentRegistry[node.tagName as keyof typeof componentRegistry]) {
        const componentName = node.tagName;
        // Replace with a placeholder div
        node.tagName = "div";
        node.properties = {
          className: ["react-component-placeholder"],
          "data-component": componentName,
        };
        node.children = [];
      }
      // Also check for text nodes in paragraphs (backup approach)
      else if (node.tagName === "p" && node.children?.length === 1) {
        const child = node.children[0];
        if (child?.type === "text") {
          const text = child.value;
          // Match syntax like <TechnicalDebtSimulator />
          const componentMatch = text.match(/^<(\w+)\s*\/>$/);
          if (componentMatch) {
            const componentName = componentMatch[1];
            // Replace with a placeholder div
            node.tagName = "div";
            node.properties = {
              className: ["react-component-placeholder"],
              "data-component": componentName,
            };
            node.children = [];
          }
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
        .use(rehypeReactComponents) // Convert React component syntax to placeholders
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

      let result = processedContent.toString();
      
      // Post-process to replace component syntax that wasn't caught by the rehype plugin
      result = result.replace(/<(\w+)\s*\/>/g, (match, componentName) => {
        if (componentRegistry[componentName as keyof typeof componentRegistry]) {
          return `<div class="react-component-placeholder" data-component="${componentName}"></div>`;
        }
        return match;
      });
      
      return result;
    } catch (error) {
      console.error("Error processing markdown:", error);
      return `<pre className="error">Error processing markdown: ${error}</pre>`;
    }
  }, [content]);

  // Process links after rendering to differentiate external links
  useEffect(() => {
    if (!markdownRef.current) return;

    // First pass: Process existing links
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

    // Mark all link text nodes so we can avoid processing them in the second pass
    const linkTextNodes = new Set();
    links.forEach((link) => {
      Array.from(link.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .forEach((node) => linkTextNodes.add(node));
    });

    // Second pass: Look for raw URLs in text nodes only (not inside links) and convert them
    const allElements = Array.from(markdownRef.current.querySelectorAll("*"));

    // Get text nodes that are not inside links
    const textNodes = allElements
      .filter((el) => el.childNodes.length > 0 && el.tagName !== "A") // Skip <a> elements entirely
      .flatMap((el) => Array.from(el.childNodes))
      .filter(
        (node) =>
          node.nodeType === Node.TEXT_NODE &&
          !linkTextNodes.has(node) && // Skip text nodes that are inside links
          !((node.parentNode as any)?.tagName === "A"), // Double-check parent is not a link
      );

    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s<>"']+)/g;

    textNodes.forEach((textNode) => {
      const text = textNode.textContent || "";
      if (!urlPattern.test(text)) return;

      // Reset the regex pattern
      urlPattern.lastIndex = 0;

      // Create a document fragment to hold the result
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      while ((match = urlPattern.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          fragment.appendChild(
            document.createTextNode(text.substring(lastIndex, match.index)),
          );
        }

        // Create link for the URL
        const url = match[0];
        const link = document.createElement("a");
        link.href = url;
        link.textContent = url;
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        link.classList.add("external-link");

        // Add external link icon
        const externalIcon = document.createElement("span");
        externalIcon.className = "external-link-icon";
        externalIcon.innerHTML = " ↗";
        link.appendChild(externalIcon);

        fragment.appendChild(link);
        lastIndex = match.index + url.length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        fragment.appendChild(
          document.createTextNode(text.substring(lastIndex)),
        );
      }

      // Replace the original text node with the fragment
      if (textNode.parentNode) {
        textNode.parentNode.replaceChild(fragment, textNode);
      }
    });

    // Third pass: Look for React component placeholders and render them
    const componentPlaceholders = markdownRef.current.querySelectorAll(
      ".react-component-placeholder",
    );
    componentPlaceholders.forEach((placeholder) => {
      const componentName = placeholder.getAttribute(
        "data-component",
      ) as keyof typeof componentRegistry;
      if (componentName && componentRegistry[componentName]) {
        const Component = componentRegistry[componentName];
        const root = createRoot(placeholder);
        root.render(createElement(Component));
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
