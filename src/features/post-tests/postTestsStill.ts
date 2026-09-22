import type { Still } from "../../platform/plugin/Feature";
import { compilePost } from "./compilePost";
import { examplePosts } from "./examplePosts";
import { renderCompiledPost } from "./renderCompiledPost";

/** The first post of the course, and what it compiles into, in the HTML before any script. */
export const postTestsStill: Still = () => {
  const first = examplePosts[0]!;
  return `<div class="post-tests"><pre class="post">${first.markdown.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>${renderCompiledPost(compilePost(first.markdown, first.file), first.file)}</div>`;
};
