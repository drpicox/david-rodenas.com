import React, { useState, useCallback } from "react"
import getRandomSequence from "./getRandomSequence"
import AddSequence from "./AddSequence"
import ProposeRule from "./ProposeRule"
import SequenceList from "./SequenceList"
import defaultSequences from "./sequences"

function SequenceGuesser() {
  const [dave, setDave] = useState("")
  const [{ rule, example }, setRule] = useState(getRandomSequence)
  const [sequences, setSequences] = useState([example])
  const goodMorningDave = useCallback(() => {
    setRule(defaultSequences[0])
    setSequences([[2, 4, 8, true]])
    setDave(" Dave")
  }, [])

  return (
    <div>
      <h3>Sequence numbers and their result:</h3>
      <SequenceList rule={rule} sequences={sequences} />
      <h3>Propose a new sequence{dave}:</h3>
      <AddSequence sequences={sequences} setSequences={setSequences} />
      <h3>Propose a rule{dave}:</h3>
      <ProposeRule
        rule={rule}
        maxGuesses={sequences.length}
        goodMorningDave={goodMorningDave}
      />
    </div>
  )
}

export default SequenceGuesser
