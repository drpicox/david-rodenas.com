import React from "react"
import { useDeck } from "./useDeck"

export function StartPresentation() {
  const [, methods] = useDeck()

  return (
    <button onClick={methods.toggleIsPresenting}>Start Presentation</button>
  )
}
