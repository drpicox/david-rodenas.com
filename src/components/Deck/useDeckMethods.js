import { useContext } from "react"
import { DeckContextMethods } from "./DeckContext"

export function useDeckMethods() {
  return useContext(DeckContextMethods)
}
