class Cursor {
  constructor(children) {
    this.children = children
    this.position = 0
    this.headings = []
  }

  isDepleted() {
    return this.position >= this.children.length
  }

  getCurrent() {
    return this.children[this.position]
  }

  next() {
    this.position++
    return this
  }

  foundHeading() {
    const { depth, children } = this.getCurrent()
    this.headings[depth] = children
    return this
  }

  insertNode(node) {
    const current = this.getCurrent()
    this.children.splice(this.position, 0, {
      ...node,
      position: {
        start: current.position.start,
        end: current.position.start,
      },
      indent: [],
    })
    this.position++
  }
}

module.exports = (args) => {
  const { markdownAST, markdownNode } = args
  if (!markdownNode.frontmatter.deck) return

  const rootChildren = markdownAST.children
  prependImportDeck(rootChildren)
  let cursor = findNextHeading(new Cursor(rootChildren))
  insertJsx(cursor, "<Deck><Slide>")
  cursor = findNextHeading(cursor.next())
  while (cursor) {
    insertJsx(cursor, "</Slide><Slide>")
    insertSuperheadings(cursor)
    cursor.next()
    cursor = findNextHeading(cursor)
  }
  appendCloseDeckAndSlide(rootChildren, markdownAST.position.end)

  return markdownAST
}

function insertSuperheadings(cursor) {
  const { depth } = cursor.getCurrent()
  for (let i = 2; i < depth; i++) insertSuperheading(cursor, cursor.headings[i])
}

function insertSuperheading(cursor, children) {
  if (!children) return
  insertJsx(cursor, "<ShowWhenPresenting><small>")
  cursor.insertNode({ type: "paragraph", children })
  insertJsx(cursor, "</small></ShowWhenPresenting>")
}

function insertJsx(cursor, value) {
  cursor.insertNode({ type: "jsx", value })
}

function findNextHeading(cursor) {
  while (!cursor.isDepleted()) {
    var current = cursor.getCurrent()
    if (current.type === "heading") return cursor.foundHeading()
    cursor.next()
  }
  return null
}

function appendCloseDeckAndSlide(children, start) {
  children.push({
    type: "jsx",
    value: "</Slide></Deck>",
    position: {
      start,
      end: start,
    },
    indent: [],
  })
}
function prependImportDeck(children) {
  children.unshift({
    type: "import",
    value:
      'import { Deck, Slide, ShowWhenPresenting } from "../src/components/Deck"',
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 },
    },
    indent: [],
  })
}
