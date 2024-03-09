const tilePixelDimension = 8
const tileBytesPerPlane = 8
const tilePlanes = 2
export const tileSizeBytes = tileBytesPerPlane * tilePlanes

export class Tile {
  #plane0
  #plane1

  constructor(plane0, plane1) {
    this.#plane0 = plane0
    this.#plane1 = plane1
  }
}
