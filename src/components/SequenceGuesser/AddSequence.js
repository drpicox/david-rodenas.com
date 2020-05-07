import React, { useRef, useState } from "react"
import { css } from "@emotion/core"

const myCss = css`
  input {
    width: 4em;
  }
  button {
    margin-top: 0;
  }
`

function AddSequence({ sequences, setSequences }) {
  const aRef = useRef()
  const bRef = useRef()
  const cRef = useRef()
  const [error, setError] = useState(false)
  const test = () => {
    const a = +aRef.current.value
    const b = +bRef.current.value
    const c = +cRef.current.value
    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setError("Invalid numbers")
      return
    }

    if (sequences.some(([oa, ob, oc]) => oa === a && ob === b && oc === c)) {
      setError("Sequence already present")
      return
    }

    aRef.current.focus()
    setSequences([...sequences, [a, b, c]])
    setError(false)
  }

  return (
    <div css={myCss}>
      a: <input defaultValue={2} type="number" ref={aRef} />, b:{" "}
      <input defaultValue={4} type="number" ref={bRef} />, c:{" "}
      <input defaultValue={8} type="number" ref={cRef} />{" "}
      <button onClick={test}>Test</button>
      {error && <h3 className="error">Ops! {error}.</h3>}
    </div>
  )
}

export default AddSequence
