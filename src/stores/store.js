import { dataStoreObjectValuesForKeys } from '../utils.js'
import { EditStore } from './editStore.js'
import { FileStore } from './fileStore.js'
import { PaletteStore } from './paletteStore.js'
import { TileStore } from './tileStore.js'

export class Store {
  static #context = {}
  static #data = {
    edit: {},
    palette: {},
    tile: {}
  }
  static #undoStack = []
  static #redoStack = []

  static init() {
    const ctxt = this.context
    const { edit, palette, tile } = this.#data

    Object.assign(ctxt, {
      editStore: new EditStore(edit),
      fileStore: new FileStore(),
      paletteStore: new PaletteStore(palette),
      tileStore: new TileStore(tile),

      getDataForKeyPath: (keyPath) => {
        const [data, index] = this.#resolveKeyPath(keyPath)
        return data[index]
      },

      perform: (operation, mutations) => {
        const op = {
          name: operation
        }

        op.mutations = Object.entries(mutations).map(([keyPath, value]) => {
          const [data, index] = this.#resolveKeyPath(keyPath)
          const mutation = {
            data,
            index,
            prev: data[index],
            next: value
          }
          data[index] = value
          return mutation
        })

        this.#undoStack.push(op)
        this.#redoStack = []
      },

      undo: () => {
        if (!this.#undoStack.length) return

        const op = this.#undoStack.pop()
        const { data, index, prev } = op
        data[index] = prev
        this.#redoStack.push(op)
      },

      redo: () => {
        if (!this.#redoStack.length) return

        const op = this.#redoStack.pop()
        const { data, index, next } = op
        data[index] = next
        this.#undoStack.push(op)
      }
    })
  }

  static #resolveKeyPath(keyPath) {
    const keys = keyPath.split('.')
    let data = this.#data
    while (keys.length > 1) {
      try {
        data = data[keys.shift()]
      } catch {
        console.error(`Could not find data for key path: ${keyPath}`)
        return undefined
      }
    }

    return [data, keys[0]]
  }

  static #serializeForKeyPath(keyPath) {
    const [subStore, objectKey] = keyPath.split('.')
    if (!subStore || !objectKey) return

    const object = this.#data[subStore][objectKey]

    window.localStorage.setItem(objectKey, JSON.stringify(object))
  }

  static get context() {
    return this.#context
  }
}
