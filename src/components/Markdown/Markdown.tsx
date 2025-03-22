"use client";

import { remark } from "remark";
import html from "remark-html";
import matter from "gray-matter";
import { useEffect, useMemo, useRef } from "react";

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  const markdownRef = useRef<HTMLDivElement>(null);

  const htmlContent = useMemo(() => {
    try {
      // Extract content from frontmatter if present
      const { content: mdContent } = matter(content);
      
      // Process markdown
      const processedContent = remark().use(html).processSync(mdContent);
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