import map from "./generatedPublic"
import hash from "./hash"

export default function findAliases(code) {
  const key = hash(code.toUpperCase())
  return map[key]
}
