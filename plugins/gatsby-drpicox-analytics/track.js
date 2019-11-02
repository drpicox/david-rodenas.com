function track(category, action, label, value) {
  if (!window.ga) return

  window.ga("send", "event", category, action, label, value)
}

export default track
