import React, { useState, useEffect } from "react"

const { mermaidAPI } = global.mermaid || {
  mermaidAPI: {
    render: () => {},
  },
}

export default function Mermaid({ name, children } = { name: "diagram" }) {
  console.log({ children })
  console.log({ childrenTS: children.toString() })
  const [html, setHtml] = useState("")
  console.log(children)
  useEffect(() => {
    children && mermaidAPI.render(name, children.toString(), setHtml)
  }, [children, setHtml, name])

  console.log(html)

  return (
    <div className="mermaid" id={name}>
      <svg dangerouslySetInnerHTML={{ __html: html }}></svg>
    </div>
  )
}
