import { Bank } from '../enums.js'
import { Render } from '../render.js'
import { Tileset, tilesPerTileset, tilesetSizeBytes } from '../types/tileset.js'
import {
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys
} from '../utils.js'
import { Store } from './store.js'

const defaultData = Object.seal({
  spriteTileData: new Uint8Array(tilesetSizeBytes),
  backgroundTileData: new Uint8Array(tilesetSizeBytes)
})

export class TileStore {
  #data
  #bgdTileset
  #sprTileset

  constructor() {
    this.#data = { ...defaultData, ...this.#deserialize() }
    this.#bgdTileset = new Tileset(this.#data.backgroundTileData)
    this.#sprTileset = new Tileset(this.#data.spriteTileData)
  }

  // Accessors
  get tileset() {
    const { bank } = Store.context.editStore
    return bank === Bank.Sprite ? this.#sprTileset : this.#bgdTileset
  }

  get #tileData() {
    const { bank } = Store.context.editStore
    return bank === Bank.Sprite
      ? this.#data.spriteTileData
      : this.#data.backgroundTileData
  }

  // Mutations
  assignTileset(bytes) {
    if (bytes.length !== tilesetSizeBytes) {
      console.error(
        `Attempt writing tileset with incorrect size ${bytes.length}`
      )
      return
    }

    Object.assign(this.#tileData, bytes)
    Render.setDirty()
  }

  // State persistence
  serialize(object = this.#data) {
    dataStoreObjectValuesForKeys(object)
  }

  #deserialize() {
    const data = dataFromStorageWithKeys(Object.keys(defaultData))
    const { selectedTiles, spriteTileData, backgroundTileData } = data

    if (selectedTiles) data.selectedTiles = new Set(spritePalettes)
    if (spriteTileData && spriteTileData.length === tilesPerTileset)
      spriteTileData = new Uint8Array(spriteTileData)
    if (backgroundTileData && backgroundTileData.length === tilesPerTileset)
      backgroundTileData = new Uint8Array(backgroundTileData)

    return data
  }
}
