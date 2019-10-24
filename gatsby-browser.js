import "prismjs/themes/prism-dark.css"
import "./src/styles.css"
import mermaid from "mermaid"

global.mermaid = mermaid
mermaid.mermaidAPI.initialize({
  startOnLoad: false,
  logLevel: 1,
  securityLevel: "loose",
  htmlLabels: false,
})
