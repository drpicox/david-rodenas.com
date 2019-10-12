module.exports = {
  plugins: [
    `gatsby-plugin-emotion`,
    `gatsby-drpicox-wiki-redirect-home`,
    `gatsby-drpicox-wiki-topics`,
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
          "gatsby-remark-external-links",
          "gatsby-remark-prismjs",
          require.resolve("./plugins/gatsby-remark-drpicox-wiki-link"),
        ],
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `@drpicox Home`,
        short_name: `starter`,
        start_url: `/Home`,
        background_color: `#ff6699`,
        theme_color: `#ff6699`,
        display: `minimal-ui`,
        icon: `src/images/david.jpg`, // This path is relative to the root of the site.
      },
    },
  ],
}
