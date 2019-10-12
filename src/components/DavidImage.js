import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { css } from "@emotion/core"
import Img from "gatsby-image"

const imgCss = css`
  border-radius: 100em;
  height: 4.25em;
  width: 4.25em;
`

const DavidImage = () => {
  const data = useStaticQuery(graphql`
    query {
      placeholderImage: file(relativePath: { eq: "david.jpg" }) {
        childImageSharp {
          fluid(maxWidth: 300) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `)

  return (
    <Img css={imgCss} fluid={data.placeholderImage.childImageSharp.fluid} />
  )
}

export default DavidImage
