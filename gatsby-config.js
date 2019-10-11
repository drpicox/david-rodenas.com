module.exports = {
  plugins: [
    `gatsby-plugin-emotion`,
    // `gatsby-drpicox-wiki`,
    {
      resolve: "gatsby-plugin-page-creator",
      options: {
        path: `${__dirname}/wiki`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `wiki`,
        path: `${__dirname}/wiki`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        defaultLayouts: {
          wiki: require.resolve(`./src/layouts/WikiLayout.js`),
          default: require.resolve(`./src/layouts/BasicLayout.js`),
        },
        gatsbyRemarkPlugins: [
          require.resolve("./plugins/gatsby-remark-drpicox-wiki-link"),
        ],
      },
    },
  ],
}
