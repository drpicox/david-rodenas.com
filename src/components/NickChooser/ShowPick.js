import React, { useRef, useEffect, useCallback } from "react"

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
    <div>
      <h3>Your Nickname:</h3>
      <input value={pick} ref={inputRef} />
      <button onClick={copy}>Copy to clipboard</button>
    </div>
  )
}
