import { useContext } from "react"
import { DeckContextState } from "./DeckContext"

export function useDeckState() {
  return useContext(DeckContextState)
}
