import { describe, expect, it } from "vitest";
import { highlight } from "./highlight";

describe("highlight", () => {
  it("leaves a language it does not know as plain, escaped text", () => {
    expect(highlight("a < b && c", "")).toBe("a &lt; b &amp;&amp; c");
    expect(highlight("┌──┴──┐", "")).toBe("┌──┴──┐");
    expect(highlight("if x", "cobol")).toBe("if x");
  });

  describe("javascript", () => {
    it("marks keywords, and only whole words", () => {
      expect(highlight("return iffy", "js")).toBe('<span class="hl-k">return</span> iffy');
    });

    it("marks a string with its quotes, and reads no markup inside it", () => {
      expect(highlight('x = "if <b>"', "js")).toBe('x = <span class="hl-s">&quot;if &lt;b&gt;&quot;</span>');
      expect(highlight("y = 'a'", "js")).toBe("y = <span class=\"hl-s\">'a'</span>");
      expect(highlight("z = `no ${x} here`", "js")).toBe('z = <span class="hl-s">`no ${x} here`</span>');
    });

    it("marks a comment to the end of the line, and a block comment to its end", () => {
      expect(highlight("a; // b if c\nd", "js")).toBe('a; <span class="hl-c">// b if c</span>\nd');
      expect(highlight("a /* if\nb */ c", "js")).toBe('a <span class="hl-c">/* if\nb */</span> c');
    });

    it("marks a number, but not a digit inside a name", () => {
      expect(highlight("x1 = 42", "js")).toBe('x1 = <span class="hl-n">42</span>');
      expect(highlight("0.5", "js")).toBe('<span class="hl-n">0.5</span>');
    });

    it("keeps a string's escape from ending it early", () => {
      expect(highlight('"a\\"b"', "js")).toBe('<span class="hl-s">&quot;a\\&quot;b&quot;</span>');
    });

    it("reads a whole line the way the site writes them", () => {
      expect(highlight("  $compileProvider.commentDirectivesEnabled(false);", "js")).toBe(
        '  $compileProvider.commentDirectivesEnabled(<span class="hl-k">false</span>);',
      );
    });
  });

  describe("html", () => {
    it("marks a tag name, an attribute and its value", () => {
      expect(highlight('<li ng-class="x">', "html")).toBe(
        '&lt;<span class="hl-t">li</span> <span class="hl-a">ng-class</span>=<span class="hl-s">&quot;x&quot;</span>&gt;',
      );
    });

    it("marks a closing tag", () => {
      expect(highlight("</li>", "html")).toBe('&lt;/<span class="hl-t">li</span>&gt;');
    });

    it("marks a comment, and reads no tag inside it", () => {
      expect(highlight("<!-- <b> -->", "html")).toBe('<span class="hl-c">&lt;!-- &lt;b&gt; --&gt;</span>');
    });

    it("leaves the words between tags alone", () => {
      expect(highlight("<p>{{ todos.remaining() }} left</p>", "html")).toBe(
        '&lt;<span class="hl-t">p</span>&gt;{{ todos.remaining() }} left&lt;/<span class="hl-t">p</span>&gt;',
      );
    });

    it("reads an attribute value with braces and quotes inside, as the site writes them", () => {
      expect(highlight('<li ng-class="{ lent: !!book.lendTo }">', "html")).toBe(
        '&lt;<span class="hl-t">li</span> <span class="hl-a">ng-class</span>=<span class="hl-s">&quot;{ lent: !!book.lendTo }&quot;</span>&gt;',
      );
    });
  });
});
