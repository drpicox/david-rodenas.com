/** Two elements are the same one drawn again when they are of one tag and, if either is keyed, of one key. */
const same = (a: Node, b: Node) =>
  a.nodeType === b.nodeType && a.nodeName === b.nodeName && (a.nodeType !== Node.ELEMENT_NODE || (a as Element).getAttribute("data-key") === (b as Element).getAttribute("data-key"));

/** One element made to look like another, attributes and all, without being replaced. */
function morphElement(from: Element, to: Element): void {
  for (const { name } of [...from.attributes]) if (!to.hasAttribute(name)) from.removeAttribute(name);
  for (const { name, value } of [...to.attributes]) if (from.getAttribute(name) !== value) from.setAttribute(name, value);
  morphChildren(from, to);
}

/** A list of children made to look like another: those that are the same, by key where there is one, kept and changed; the rest added or taken away. */
function morphChildren(from: Node, to: Node): void {
  const keyed = new Map<string, Element>();
  for (const child of [...from.childNodes]) if (child instanceof Element && child.hasAttribute("data-key")) keyed.set(child.getAttribute("data-key") ?? "", child);
  const wanted = [...to.childNodes];
  wanted.forEach((target, at) => {
    const key = target instanceof Element ? target.getAttribute("data-key") : null;
    const current = from.childNodes[at];
    const match = key !== null ? keyed.get(key) : current && same(current, target) ? current : undefined;
    if (match && same(match, target)) {
      if (match !== current) from.insertBefore(match, current ?? null);
      if (match instanceof Element) morphElement(match, target as Element);
      else if (match.textContent !== target.textContent) match.textContent = target.textContent;
    } else from.insertBefore(target.cloneNode(true), current ?? null);
  });
  while (from.childNodes.length > wanted.length) from.lastChild?.remove();
}

/**
 * An element's insides made to look like some markup, changing what is there
 * rather than replacing it: a bar that grows is the same bar, so the
 * stylesheet can let it grow, and a dot that moves glides. Keyed elements
 * are matched by key, wherever they stand; the rest by place and tag.
 */
export function morphInto(element: Element, html: string): void {
  const template = element.ownerDocument.createElement("template");
  template.innerHTML = html;
  morphChildren(element, template.content);
}
