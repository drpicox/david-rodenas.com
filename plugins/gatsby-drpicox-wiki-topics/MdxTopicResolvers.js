exports.topic = {
  type: "Topic",
  description: "Corresponding topic for this markdown",
  resolve(source, args, context /*, info*/) {
    if (!source.fields || !source.fields.isTopic) return
    const { name } = source.fields

    return context.nodeModel
      .getAllNodes({ type: "Topic" })
      .find(t => t.name === name)
  },
}
