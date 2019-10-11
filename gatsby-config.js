module.exports = {
  plugins: [
    `gatsby-plugin-emotion`,
    `gatsby-drpicox-wiki`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [`gatsby-remark-drpicox-wiki-link`],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `wiki`,
        path: `${__dirname}/wiki`,
      },
    },
  ],
}
