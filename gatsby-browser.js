import "prismjs/themes/prism-dark.css"
// import "prismjs/themes/prism-solarizedlight.css"
// import "prism-themes/themes/prism-hopscotch.css"
import "./src/styles.css"
import mermaid from "mermaid"

global.mermaid = mermaid
mermaid.mermaidAPI.initialize({
  startOnLoad: false,
  logLevel: 5,
  theme: "forest",
  // securityLevel: "loose",
  // htmlLabels: false,
})
