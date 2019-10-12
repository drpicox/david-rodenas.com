const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
        """
        A post of the blog
        """
        type Post implements Node {
          "Title of the post"
          title: String!

          "Date"
          date: String!

          "Absolute url to that post"
          path: String!
    }
    `)
}

exports.onCreateNode = ({ node, actions, createNodeId }) => {
  if (node.internal.type !== "Mdx") return
  const match = node.fileAbsolutePath.match(
    /\/blog\/(\d+)-(\d+)-(\d+)-(.+).mdx$/
  )
  if (!match) return
  const [, year, month, day, slug] = match
  const path = `/blog/${year}/${month}/${day}/${slug}.html`
  const date = new Date(Date.UTC(+year, +month - 1, +day)).toJSON()

  const { createNodeField, createNode } = actions
  createNodeField({ node, name: "path", value: path })
  createNodeField({ node, name: "date", value: date })
  createNodeField({ node, name: "isPost", value: true })

  createNode({
    ...node.frontmatter,
    path,
    date,
    id: createNodeId(`${path} >>> Post`),
    children: [],
    internal: {
      contentDigest: node.internal.contentDigest,
      type: "Post",
    },
  })
}

exports.createResolvers = ({ createResolvers }) => {
  createResolvers({
    Post: require("./PostResolvers"),
    Mdx: require("./MdxPostResolvers"),
  })
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const result = await graphql(`
    {
      allMdx(filter: { fields: { isPost: { eq: true } } }) {
        nodes {
          fileAbsolutePath
          fields {
            path
          }
        }
      }
    }
  `)

  result.data.allMdx.nodes.forEach(node => {
    const path = node.fields.path
    createPage({
      path,
      component: node.fileAbsolutePath,
      context: {},
    })
  })
}
