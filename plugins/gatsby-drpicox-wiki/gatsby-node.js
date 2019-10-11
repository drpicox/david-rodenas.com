const path = require("path")
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, getNode, actions }) => {
  if (node.internal.type !== `MarkdownRemark`) return

  const { createNodeField } = actions
  const slug = createFilePath({ node, getNode, basePath: `pages` })
  createNodeField({
    node,
    name: `slug`,
    value: slug,
  })
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const result = await graphql(`
    query {
      allMarkdownRemark {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
    }
  `)

  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: node.fields.slug,
      component: path.resolve(`./src/templates/WikiPage.js`),
      context: {
        slug: node.fields.slug,
      },
    })
  })
}
