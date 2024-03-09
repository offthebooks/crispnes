import { tileSizeBytes } from './tile.js'

export const tilesPerTileset = 256
const tilesetSizeBytes = tilesPerTileset * tileSizeBytes

export class Tileset {
  #bytes

  constructor(bytes) {
    this.#bytes = new Uint8Array(tilesetSizeBytes)
  }

  tile(index) {
    if (index < 0 || index >= tilesPerTileset) throw `Tile index out of range`

    const offset = index * tileSizeBytes
    const plane0 = this.#bytes.subarray(offset, offset + tileBytesPerPlane)
    const plane1 = this.#bytes.subarray(
      offset + tileBytesPerPlane,
      offset + tilesetSizeBytes
    )

    return new Tile(plane0, plane1)
  }
}
