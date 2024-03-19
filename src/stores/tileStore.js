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
  get #tilesKey() {
    const { bank } = Store.context.editStore
    return bank === Bank.Sprite ? 'spriteTileData' : 'backgroundTileData'
  }

  get tileset() {
    const { bank } = Store.context.editStore
    return bank === Bank.Sprite ? this.#sprTileset : this.#bgdTileset
  }

  get #tileData() {
    return this.#data[this.#tilesKey]
  }

  get tilesetBytes() {
    return new Uint8Array(this.#tileData)
  }

  get tilesetSlice() {
    return { [this.#tilesKey]: this.tilesetBytes }
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
    this.serialize(this.tilesetSlice)
    Render.setDirty()
  }

  // State persistence
  serialize(object = this.#data) {
    dataStoreObjectValuesForKeys(object)
  }

  #deserialize() {
    const data = dataFromStorageWithKeys(Object.keys(defaultData))
    const { spriteTileData, backgroundTileData } = data

    if (spriteTileData)
      data.spriteTileData = Object.assign(
        new Uint8Array(tilesetSizeBytes),
        spriteTileData
      )
    if (backgroundTileData)
      data.backgroundTileData = Object.assign(
        new Uint8Array(tilesetSizeBytes),
        backgroundTileData
      )

    return data
  }
}
