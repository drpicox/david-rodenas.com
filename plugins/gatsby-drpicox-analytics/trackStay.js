import track from "./track"

const EVERY = 30 * 1000

setInterval(() => {
  const path = document.location.pathname
  track("Page", "Stay", path)
}, EVERY)
