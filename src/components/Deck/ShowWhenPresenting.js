import { useDeckState } from "./useDeckState"

export function ShowWhenPresenting({ children }) {
  const state = useDeckState()
  if (!state.isPresenting) return null
  return children
}
