const visit = require(`unist-util-visit`)

const IS_WIKI = /^([A-Z][\w\d]*)+$/

function transformExistingTopicNode(node) {
  const { label } = node
  node.type = "jsx"
  node.value = `<Link to="/${label}">[${label}]</Link>`
  delete node.children
}

function transformNewTopicNode(node) {
  const { label } = node
  node.type = "link"
  node.children[0].value = `[${label}]`
  node.url = `https://github.com/drpicox/drpicox.github.io/new/master?filename=_entries/${label}.md`
}

module.exports = ({ markdownAST, makrdownNode, files }) => {
  const existingTopics = files
    .filter(f => f.sourceInstanceName === "wiki")
    .map(f => f.name)

  visit(markdownAST, "linkReference", node => {
    const { label } = node
    if (IS_WIKI.test(label)) {
      if (existingTopics.includes(label)) {
        transformExistingTopicNode(node)
      } else {
        transformNewTopicNode(node)
      }
    }
  })
  return markdownAST
}
