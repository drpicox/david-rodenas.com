import React, { useMemo } from "react"
import { css } from "@emotion/core"

const mermaid = global.mermaid || { render: () => {},initialize: () => {} }
mermaid.initialize({sequence: { showSequenceNumbers: true },})

let num = 1
const mermaidCss = css`
  text-align: center;
  & > svg {
    max-width: 100%;
  }
  background: white;
`

export default function Mermaid({ name, children } = { name: "diagram" }) {
  const html = useMemo(
    () => mermaid.render(name || "mermaid-svg-" + num++, "" + children),
    [children, name]
  )

  return (
    <div
      css={mermaidCss}
      className="mermaid"
      dangerouslySetInnerHTML={{ __html: html }}
    ></div>
  )
}
