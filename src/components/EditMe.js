import React, { useMemo } from "react"
import { css } from "@emotion/core"
import { useLocation } from "react-use"

const linkCss = css`
  position: fixed;
  bottom: 0.5em;
  right: 0.5em;
`

const matchBlog = pn => pn.match(/^\/blog\/(\d+)\/(\d+)\/(\d+)\/([^.]+).html$/)
const matchTopic = pn => pn.match(/^\/([A-Z][\w\d]+)\/?$/)
const toEditBlog = ([, y, m, d, s]) => `/blog/${y}-${m}-${d}-${s}.mdx`
const toEditTopic = ([, t]) => `/wiki/${t}.mdx`
const toEdit = pn => {
  let m
  m = matchBlog(pn)
  if (m) return toEditBlog(m)
  m = matchTopic(pn)
  return toEditTopic(m)
}

function EditMe() {
  const { pathname } = useLocation() || {}
  const editPath = useMemo(() => pathname && toEdit(pathname), [pathname])

  return (
    <a
      href={`https://github.com/drpicox/david-rodenas.com/edit/master${editPath}`}
      css={linkCss}
      target="_blank"
      rel="nofollow noopener noreferrer"
    >
      π
    </a>
  )
}

export default EditMe
