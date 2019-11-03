import React, { useMemo } from "react"
import { css } from "@emotion/core"

const mermaid = global.mermaid || { render: () => {} }

let num = 1
const mermaidCss = css`
  & > svg {
    max-width: 100%;
  }
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
