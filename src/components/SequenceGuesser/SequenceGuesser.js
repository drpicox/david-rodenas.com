import React, { useState } from "react"
import getRandomSequence from "./getRandomSequence"
import AddSequence from "./AddSequence"
import ProposeRule from "./ProposeRule"
import SequenceList from "./SequenceList"

function SequenceGuesser() {
  const [{ rule, example }] = useState(getRandomSequence)
  const [sequences, setSequences] = useState([example])
  return (
    <div>
      <h3>Sequence numbers and their result:</h3>
      <SequenceList rule={rule} sequences={sequences} />
      <h3>Propose a new sequence:</h3>
      <AddSequence sequences={sequences} setSequences={setSequences} />
      <h3>Propose a rule:</h3>
      <ProposeRule rule={rule} maxGuesses={sequences.length} />
    </div>
  )
}

export default SequenceGuesser
