exports.mdx = {
  type: "Mdx!",
  description: "Markdown corresponding to the contents of this topic",
  resolve(source, args, context /*, info*/) {
    return context.nodeModel
      .getAllNodes({ type: "Mdx" })
      .find(m => m.fields && m.fields.isTopic && m.fields.name === source.name)
  },
}
