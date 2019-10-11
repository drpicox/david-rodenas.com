const visit = require(`unist-util-visit`)

const IS_WIKI = /^([A-Z][\w\d]*)+$/

module.exports = ({ markdownAST, makrdownNode, files }) => {
  const existingTopics = files
    .filter(f => f.sourceInstanceName === "wiki")
    .map(f => f.name)

  visit(markdownAST, "linkReference", node => {
    const { label } = node
    if (IS_WIKI.test(label)) {
      node.type = "link"
      node.children[0].value = `[${label}]`

      if (existingTopics.includes(label)) {
        node.url = `./${label}`
      } else {
        console.log(node)
        node.url = `https://github.com/drpicox/drpicox.github.io/new/master?filename=_entries/${label}.md`
        node.properties = {
          target: "_blank",
          rel: "noopener noreferrer",
        }
      }
    }
  })
  return markdownAST
}
