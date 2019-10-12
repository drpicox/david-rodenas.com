exports.createPages = ({ actions }) => {
  const { createRedirect } = actions
  createRedirect({
    redirectInBrowser: true,
    fromPath: "/",
    toPath: "/Home",
    isPermanent: true,
  })
}
