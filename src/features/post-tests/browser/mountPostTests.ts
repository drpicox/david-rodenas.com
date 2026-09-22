import { el } from "../../../platform/browser/el";
import { compilePost } from "../compilePost";
import { examplePosts } from "../examplePosts";
import { renderCompiledPost } from "../renderCompiledPost";

/**
 * The post on the left, editable; the test it compiles into on the right,
 * following every keystroke, and the compiler's refusals when it will not.
 * The quickest way to learn what a step has to look like is to break one.
 */
export function mountPostTests(host: HTMLElement): void {
  const out = el("div");
  const post = el("textarea", { class: "post", spellcheck: false, rows: 28, oninput: () => draw() });
  const file = el("input", { type: "text", value: examplePosts[0]!.file, oninput: () => draw() });
  const choose = el(
    "select",
    { onchange: () => load(Number(choose.value)) },
    ...examplePosts.map((example, index) => el("option", { value: index }, example.label)),
  );

  function load(index: number): void {
    const example = examplePosts[index] ?? examplePosts[0]!;
    post.value = example.markdown;
    file.value = example.file;
    draw();
  }

  function draw(): void {
    out.innerHTML = renderCompiledPost(compilePost(post.value, file.value), file.value);
  }

  host.replaceChildren(
    el("div", { class: "row" }, el("label", {}, "Post ", choose), el("label", {}, "File ", file)),
    el("div", { class: "post-tests" }, post, out),
  );
  load(0);
}
