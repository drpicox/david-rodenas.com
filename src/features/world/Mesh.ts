/** A solid made of triangles, each corner at its own distance from the centre: a world before anything has been decided about it. */
export interface Mesh {
  /** Unit direction of each vertex, three numbers per vertex. */
  readonly directions: Float32Array;
  /** Distance from the centre of each vertex. Relief lives here. */
  readonly radii: Float32Array;
  /** The original "tipus de superfície": a number in 0..1 per vertex that chooses and tints the colour. */
  readonly surface: Float32Array;
  /** Three vertex indices per face. */
  readonly faces: Uint32Array;
  readonly faceCount: number;
  readonly vertexCount: number;
}
