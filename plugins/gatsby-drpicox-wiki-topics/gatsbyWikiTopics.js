exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
        """
        A topic of the wiki
        """
        type Topic implements Node {
            "Name of the topic, ex: \`HelloWorld\`"
            name: String!

            "Title of the topic"
            title: String!
        }
    `)
}

exports.onCreateNode = ({ node, actions, createNodeId }) => {
  if (node.internal.type !== "Mdx") return
  const match = node.fileAbsolutePath.match(/\/wiki\/([A-Z][\w\d]+).mdx$/)
  if (!match) return
  const [, name] = match

  const { createNodeField, createNode } = actions
  createNodeField({ node, name: "name", value: name })
  createNodeField({ node, name: "path", value: `/${name}` })
  createNodeField({ node, name: "isTopic", value: true })
  createNodeField({ node, name: "deck", value: !!node.frontmatter.deck })

  createNode({
    ...node.frontmatter,
    name,
    id: createNodeId(`${name} >>> Topic`),
    children: [],
    internal: {
      contentDigest: node.internal.contentDigest,
      type: "Topic",
    },
  })
}

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    Topic: require("./TopicResolvers"),
    Mdx: require("./MdxTopicResolvers"),
  })
}
