import { Tile, tileBytesPerPlane, tileSizeBytes } from './tile.js'

export const tilesPerTileset = 256
export const tilesetSizeBytes = tilesPerTileset * tileSizeBytes
const tilesetSideLengthTiles = 16

// This makes a view on tileset data that is easier to operate edits on
export class Tileset {
  #bytes
  #tiles

  constructor(bytes) {
    this.#bytes = bytes
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
