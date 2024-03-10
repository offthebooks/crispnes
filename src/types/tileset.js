import { tileSizeBytes } from './tile.js'

export const tilesPerTileset = 256
const tilesetSizeBytes = tilesPerTileset * tileSizeBytes
const tilesetSideLengthTiles = 16

export class Tileset {
  #bytes
  #tiles

  constructor() {
    this.#bytes = new Uint8Array(tilesetSizeBytes)
    this.#tiles = new Array(tilesPerTileset)

    for (let i = 0; i < tilesPerTileset; ++i) {
      const offset = i * tileSizeBytes
      const plane0 = this.#bytes.subarray(offset, offset + tileBytesPerPlane)
      const plane1 = this.#bytes.subarray(
        offset + tileBytesPerPlane,
        offset + tilesetSizeBytes
      )
      this.#tiles[i] = new Tile(plane0, plane1)
    }
  }

  tile(index) {
    return this.#tiles[index]
  }

  tileAt(x, y) {
    return this.tile(x + y * tilesetSideLengthTiles)
  }
}
