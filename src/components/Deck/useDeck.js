import { useDeckState } from "./useDeckState"
import { useDeckMethods } from "./useDeckMethods"

export function useDeck() {
  return [useDeckState(), useDeckMethods()]
}
