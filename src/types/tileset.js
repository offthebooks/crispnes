import { Tile, tileBytesPerPlane, tileSizeBytes } from './tile.js'

export const tilesPerTileset = 256
export const tilesetSizeBytes = tilesPerTileset * tileSizeBytes
const tilesetSideLengthTiles = 16

// This makes a view on tileset data that is easier to operate edits on
export class Tileset {
  #tiles

  constructor(bytes) {
    this.#tiles = new Array(tilesPerTileset)

    for (let i = 0; i < tilesPerTileset; ++i) {
      const offset0 = i * tileSizeBytes
      const offset1 = offset0 + tileBytesPerPlane
      const plane0 = bytes.subarray(offset0, offset1)
      const plane1 = bytes.subarray(offset1, offset1 + tilesetSizeBytes)
      this.#tiles[i] = new Tile(plane0, plane1)
    }
  }

  tile(index) {
    return this.#tiles[index]
  }
}
