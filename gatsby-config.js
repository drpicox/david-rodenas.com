module.exports = {
  siteMetadata: {
    siteUrl: "http://david-rodenas.com",
  },

  plugins: [
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-41300908-1",
      },
    },
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-emotion`,
    `gatsby-drpicox-analytics`,
    `gatsby-drpicox-wiki-alias`,
    `gatsby-drpicox-wiki-redirect-home`,
    `gatsby-drpicox-wiki-topics`,
    `gatsby-drpicox-blog-posts`,
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
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog`,
        path: `${__dirname}/blog`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        defaultLayouts: {
          blog: require.resolve(`./src/layouts/PostLayout.js`),
          wiki: require.resolve(`./src/layouts/WikiLayout.js`),
          default: require.resolve(`./src/layouts/BasicLayout.js`),
        },
        gatsbyRemarkPlugins: [
          "gatsby-remark-external-links",
          "gatsby-remark-prismjs",
          require.resolve("./plugins/gatsby-remark-drpicox-wiki-link"),
          require.resolve("./plugins/gatsby-remark-drpicox-deck"),
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
    `gatsby-plugin-client-side-redirect`,
  ],
}
