import React, { useRef, useState } from "react"
import { css } from "@emotion/core"
import compileProposal from "./compileProposal"
import evaluateProposal from "./evaluateProposal"

const myCss = css`
  input {
    width: 100%;
    font-family: Consolas, monospace;
  }
  .success {
    color: green;
  }
  h3 {
    margin-top: 1em;
  }
`

function ProposeRule({ rule, maxGuesses, goodMorningDave }) {
  const proposalRef = useRef()
  const [lastGuess, setLastGuess] = useState()
  const [error, setError] = useState()
  const [count, setCount] = useState(0)
  const success = !error && lastGuess

  const propose = () => {
    if (count >= maxGuesses) {
      setError("Add another sequence test before a guess")
      return
    }

    const guess = proposalRef.current.value
    if (/goodMorningDave/.test(guess)) {
      proposalRef.current.value = "true"
      goodMorningDave()
      return
    }

    let proposedRule
    try {
      proposedRule = compileProposal(guess)
    } catch (e) {
      setError(
        "Cannot compile rule, please check your javascript rule or console for more information"
      )
      console.error(e)
      return
    }

    setCount(count + 1)
    setLastGuess(guess)
    if (!evaluateProposal(proposedRule, rule)) {
      setError("This is not the rule. Test more sequences and guess again")
      return
    }

    setError(null)
  }

  return (
    <div css={myCss}>
      <input defaultValue={"true"} type="string" ref={proposalRef} />
      <button onClick={propose}>Guess</button>
      {lastGuess && !success && (
        <p>
          Last guess: "<code>{lastGuess}</code>"
        </p>
      )}
      {success && (
        <h3 className="success">
          Good!
          <br />"<code>{lastGuess}</code>" is the rule.
        </h3>
      )}
      {error && <h3 className="error">Ops! {error}.</h3>}
      <p>
        <small>
          Write any valid javascript expression that evaluates true or false.
          <br />
          Use variables <code>a</code>, <code>b</code> and <code>c</code> in the
          expression.
        </small>
      </p>
    </div>
  )
}

export default ProposeRule
