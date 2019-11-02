import track from "./track"

let prevPath = ""
let prevScroll = 0
let prevIsEnd = false
const SCROLL_STEP = 250

window.addEventListener("scroll", () => {
  const path = document.location.pathname
  const scrollY = window.scrollY
  const isEnd =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 50

  if (prevPath !== path) {
    prevScroll = 0
    prevIsEnd = false
    prevPath = path
  }

  while (prevScroll + SCROLL_STEP < scrollY) {
    prevScroll += SCROLL_STEP
    track("Page", "ScrollMove", path, prevScroll)
  }

  if (isEnd && !prevIsEnd) {
    prevIsEnd = true
    track("Page", "ScrollEnd", path, prevScroll)
  }
})
