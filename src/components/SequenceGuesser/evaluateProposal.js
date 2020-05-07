const MIN = -100
const MAX = 100

function evaluateProposal(proposal, rule) {
  for (let a = MIN; a <= MAX; a += 1)
    for (let b = MIN; b <= MAX; b += 1)
      for (let c = MIN; c <= MAX; c += 1)
        if (proposal(a, b, c) !== rule(a, b, c)) return false

  return true
}

export default evaluateProposal
