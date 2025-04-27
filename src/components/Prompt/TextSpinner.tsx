import React, { useEffect, useState } from "react";

const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
// const frames = ["⋮", "⋰", "⋯", "⋱"];
export function TextSpinner() {
  const [frame, setFrame] = useState(-1);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prevFrame) => (prevFrame + 1) % frames.length);
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return <pre>{frames[frame] ?? ""}</pre>;
}
