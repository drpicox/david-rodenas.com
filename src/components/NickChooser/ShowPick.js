import React, { useRef, useEffect, useCallback } from "react"
import { css } from "@emotion/core"

const myCss = css`
  input {
    display: inline;
    width: auto;
    height: 1.4em;
  }
`

export default function ShowAliases({ pick }) {
  const inputRef = useRef(null)
  const copy = useCallback(() => {
    inputRef.current.focus()
    inputRef.current.select()
    document.execCommand("copy")
  }, [])
  useEffect(() => {
    if (pick) copy()
  }, [copy, pick])

  return (
    <div css={myCss}>
      <h3>Your Alias:</h3>
      <input value={pick} ref={inputRef} />
      <button onClick={copy}>Copy to clipboard</button>
    </div>
  )
}
