import { Bank } from '../enums.js'
import { Tileset, tilesPerTileset, tilesetSizeBytes } from '../types/tileset.js'
import {
  dataFromStorageWithKeys,
  dataStoreObjectValuesForKeys
} from '../utils.js'
import { Store } from './store.js'

const defaultData = Object.seal({
  selectedTiles: new Set([0, 1, 2, 3]),
  spriteTileset: new Uint8Array(tilesetSizeBytes),
  backgroundTileset: new Uint8Array(tilesetSizeBytes)
})

export class TileStore {
  #data
  #bgdTileset
  #sprTileset

  constructor() {
    this.#data = { ...defaultData, ...this.#deserialize() }
    this.#bgdTileset = new Tileset(this.#data.backgroundTileset)
    this.#sprTileset = new Tileset(this.#data.spriteTileset)
  }

  // Accessors
  get tileset() {
    const { bank } = Store.context.editStore
    return bank === Bank.Sprite ? this.#sprTileset : this.#bgdTileset
  }

  // State persistence
  serialize(object = this.#data) {
    dataStoreObjectValuesForKeys(object)
  }

  #deserialize() {
    const data = dataFromStorageWithKeys(Object.keys(defaultData))
    const { selectedTiles, spriteTileset, backgroundTileset } = data

    if (selectedTiles) data.selectedTiles = new Set(spritePalettes)
    if (spriteTileset && spriteTileset.length === tilesPerTileset)
      spriteTileset = new Uint8Array(spriteTileset)
    if (backgroundTileset && backgroundTileset.length === tilesPerTileset)
      backgroundTileset = new Uint8Array(backgroundTileset)

    return data
  }
}
