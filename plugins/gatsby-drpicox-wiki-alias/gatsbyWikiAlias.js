exports.createPages = async ({ graphql, actions }) => {
  const { data } = await graphql(`
    {
      allMdx(filter: { frontmatter: { alias: { ne: null } } }) {
        nodes {
          fields {
            path
          }
          frontmatter {
            alias
          }
        }
      }
    }
  `)

  const { createRedirect } = actions
  data.allMdx.nodes.forEach(n => {
    const toPath = n.fields.path
    n.frontmatter.alias.forEach(fromPath =>
      createRedirect({
        redirectInBrowser: true,
        fromPath,
        toPath,
      })
    )
  })
}
