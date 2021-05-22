import React, { useEffect } from "react";
import { DeckContextProvider } from "./DeckContextProvider";
import { useDeck } from "./useDeck";
import { PresentationControls } from "./PresentationControls";
import { PresentationProgress } from "./PresentationProgress";
import { DeckLayouts } from "./DeckLayouts";

function makeOnKey(methods) {
  return (event) => {
    const { key } = event;
    switch (key) {
      case "ArrowRight":
        methods.nextSlide();
        break;
      case "ArrowLeft":
        methods.prevSlide();
        break;
      case "Escape":
      case "x":
      case "X":
        methods.toggleIsPresenting();
        break;
      default:
      // do nothing
    }
  };
}

function DeckVisualization({ children }) {
  const [{ isPresenting }, methods] = useDeck();

  useEffect(() => {
    document.body.style.overflow = isPresenting ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isPresenting]);

  useEffect(() => {
    if (!isPresenting) return;
    const onKey = makeOnKey(methods);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isPresenting, methods]);

  return children;
}

export function Deck({ children }) {
  return (
    <DeckContextProvider>
      <DeckVisualization>
        <PresentationControls />
        <DeckLayouts>{children}</DeckLayouts>
        <PresentationProgress />
      </DeckVisualization>
    </DeckContextProvider>
  );
}
