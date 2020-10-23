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

    const sequence = [a, b, c]
    if (isSequencePresent(sequences, sequence)) {
      setError("Sequence already present")
      setSequences(highlightSequence(sequences, sequence))
      return
    }

    aRef.current.focus()
    setSequences(addSequnce(sequences, sequence))
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

function areSameSequence([x0, x1, x2], [y0, y1, y2]) {
  return x0 === y0 && x1 === y1 && x2 === y2
}

function isSequencePresent(sequences, s) {
  return sequences.some((c) => areSameSequence(c, s))
}

function addSequnce(sequences, s) {
  return highlightSequence([...sequences, s], s)
}

function highlightSequence(sequences, h) {
  return sequences.map((c) => [c[0], c[1], c[2], areSameSequence(c, h)])
}

export default AddSequence
