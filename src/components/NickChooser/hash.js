export default function hash(str) {
  let d = 0x811c9dc5
  for (var i = 0; i < str.length; i++) {
    // http://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
    // http://isthe.com/chongo/src/fnv/hash_32.c
    // multiply by the 32 bit FNV magic prime mod 2^32
    d += (d << 1) + (d << 4) + (d << 7) + (d << 8) + (d << 24)
    // xor the bottom with the current octet
    d ^= str.charCodeAt(i)
  }
  return (d & 0x7fffffff) % 3331
}
