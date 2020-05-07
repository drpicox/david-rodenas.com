function compileProposal(proposal) {
  // eslint-disable-next-line no-new-func
  return new Function(`'use strict';return (a,b,c) => ${proposal}`)()
}

export default compileProposal
