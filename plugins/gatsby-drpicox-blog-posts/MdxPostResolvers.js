exports.post = {
  type: "Post",
  description: "Corresponding Post for this markdown",
  resolve(source, args, context /*, info*/) {
    if (!source.fields || !source.fields.isPost) return
    const { path } = source.fields

    return context.nodeModel
      .getAllNodes({ type: "Post" })
      .find(t => t.path === path)
  },
}
