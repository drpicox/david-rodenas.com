import React from "react"
import { Link } from "gatsby"
import { useStaticQuery, graphql } from "gatsby"

const ListPosts = () => {
  const data = useStaticQuery(graphql`
    {
      allPost(sort: { fields: date, order: DESC }) {
        nodes {
          path
          title
          date
        }
      }
    }
  `)

  const posts = data.allPost.nodes
  return (
    <ul>
      {posts.map(p => (
        <li>
          <Link to={p.path}>{p.title}</Link>
          {" — "}
          <small>
            <emph>
              {new Date(p.date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </emph>
          </small>
        </li>
      ))}
    </ul>
  )
}

export default ListPosts
