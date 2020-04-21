import React, { useRef, useState } from "react"
import { css } from "@emotion/core"
import findAliases from "./findAliases"
import ShowAliases from "./ShowAliases"

const myCss = css`
  input {
    width: 100%;
    border: solid var(--text-color) 5px;
    font-size: inherit;
    font-family: inherit;
    color: inherit;
    background: inherit;
  }
  button {
    margin-top: 10px;
    border: solid var(--text-color) 5px;
    font-size: inherit;
    font-family: inherit;
    color: inherit;
    background: inherit;
  }
  .error {
    color: red;
  }
`

export default function NickChooser() {
  const codeRef = useRef(null)
  const buttonRef = useRef(null)
  const [aliases, setAliases] = useState(null)
  const [error, setError] = useState(false)

  const generate = () => {
    if (!codeRef.current.value) return
    codeRef.current.disabled = true
    buttonRef.current.disabled = true
    buttonRef.current.innerText = "...working..."
    setTimeout(() => {
      const aliases = findAliases(codeRef.current.value)
      if (aliases) setAliases(aliases)
      else setError(true)
      buttonRef.current.style.display = "none"
    }, 5000)
  }

  return (
    <div css={myCss}>
      <h3>Enter your code:</h3>
      <input ref={codeRef} />
      <button ref={buttonRef} onClick={generate}>
        Generate!
      </button>
      {aliases && <ShowAliases aliases={aliases} />}
      {error && (
        <h3 className="error">Ops! No aliases found. Check your code.</h3>
      )}
    </div>
  )
}
