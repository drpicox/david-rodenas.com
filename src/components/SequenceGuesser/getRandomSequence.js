import sequences from "./sequences"

function getRandomSequence() {
  return sequences[Math.floor(sequences.length * Math.random())]
}

export default getRandomSequence
