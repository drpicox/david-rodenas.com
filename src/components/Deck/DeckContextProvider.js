import React, { useReducer, useMemo } from "react"
import { set, update } from "object-path-immutable"
import { DeckContextState, DeckContextMethods } from "./DeckContext"

const initialState = {
  isPresenting: false,
  currentSlideId: -1,
  slides: [],
}

const reducers = {
  toggleIsPresenting(state) {
    return update(state, "isPresenting", (x) => !x)
  },
  addSlide(state, { slideId }) {
    if (state.currentSlideId < 0) state = set(state, "currentSlideId", slideId)
    return update(state, "slides", (a) => [...a, slideId])
  },
  removeSlide(state, { slideId }) {
    state = update(state, "slides", (a) => a.filter((id) => id !== slideId))
    if (state.currentSlideId === slideId)
      state = set(state, "currentSlideId", state.slides[0] || -1)
    return state
  },
  prevSlide(state) {
    const idx = state.slides.indexOf(state.currentSlideId)
    const prevIdx = Math.max(0, idx - 1)
    return set(state, "currentSlideId", state.slides[prevIdx])
  },
  nextSlide(state) {
    const idx = state.slides.indexOf(state.currentSlideId)
    const nextIdx = Math.min(state.slides.length - 1, idx + 1)
    return set(state, "currentSlideId", state.slides[nextIdx])
  },
  default(state, { type }) {
    throw new Error(`Unexpected action type "${type}"`)
  },
}

function reduceDeck(state, action) {
  state = (reducers[action.type] || reducers.default)(state, action)
  return state
}

export function DeckContextProvider({ children }) {
  const [state, dispatch] = useReducer(reduceDeck, initialState)
  const methods = useMemo(() => {
    const result = {}
    Object.keys(reducers).forEach((type) => {
      result[type] = (action) => {
        dispatch({ ...action, type })
      }
    })
    result.addSlide = ({ slideId }) => {
      dispatch({ type: "addSlide", slideId })
      return () => dispatch({ type: "removeSlide", slideId })
    }
    return result
  }, [dispatch])

  return (
    <DeckContextState.Provider value={state}>
      <DeckContextMethods.Provider value={methods}>
        {children}
      </DeckContextMethods.Provider>
    </DeckContextState.Provider>
  )
}
