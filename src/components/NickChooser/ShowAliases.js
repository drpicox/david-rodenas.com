import React, { useState } from "react"
import ShowPick from "./ShowPick"

function ShowAlias({ alias, enabled, setPick }) {
  return (
    <li>
      {alias} {enabled && <button onClick={() => setPick(alias)}>Pick</button>}
    </li>
  )
}

export default function ShowAliases({ aliases }) {
  const [pick, setPick] = useState(null)

  return (
    <div>
      <h3>Pick one nickname:</h3>
      <ul>
        {aliases.sort().map(alias => (
          <ShowAlias alias={alias} enabled={!pick} setPick={setPick}>
            {alias}
          </ShowAlias>
        ))}
      </ul>
      {pick && <ShowPick pick={pick} />}
    </div>
  )
}
