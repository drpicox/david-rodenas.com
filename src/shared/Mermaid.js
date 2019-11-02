import React, { useMemo } from "react"

const mermaid = global.mermaid || { render: () => {} }

let num = 1

export default function Mermaid({ name, children } = { name: "diagram" }) {
  const html = useMemo(
    () => mermaid.render(name || "mermaid-svg-" + num++, "" + children),
    [children, name]
  )

  return (
    <div className="mermaid" dangerouslySetInnerHTML={{ __html: html }}></div>
  )
}
