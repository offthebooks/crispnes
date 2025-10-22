import { DBStore } from '../consts.js'

const dbName = 'CrispnesDB'
const dbVersion = 1

const dataStoreKeyPaths = {
  [DBStore.Animations]: { keyPath: 'name' },
  [DBStore.Frames]: { keyPath: ['animation', 'index'] },
  [DBStore.Palettes]: { keyPath: 'name' },
  [DBStore.State]: undefined
}

export class DataStore {
  #db
  constructor() {
    this.#db = null
  }

  async db() {
    if (this.#db) return this.#db

    return new Promise((resolve) => {
      const request = indexedDB.open(dbName, dbVersion)

      request.onupgradeneeded = ({ target: { result } }) => {
        const db = result
        Object.entries(dataStoreKeyPaths).forEach(([store, keyPath]) => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, keyPath)
          }
        })
      }

      request.onsuccess = ({ target: { result } }) => {
        this.#db = result
        resolve(this.#db)
      }

      request.onerror = ({ target: { error } }) => {
        console.error('Failed to open IndexedDB: ' + error)
      }
    })
  }

  async save(appData) {
    const { paletteState, animationState, palettes, animations, frames } =
      appData
    const db = await this.db()
    const transaction = db.transaction(Object.values(DBStore), 'readwrite')
    const stateStore = transaction.objectStore(DBStore.State)

    if (paletteState) {
      stateStore.put(paletteState, 'palette')
    }
    if (animationState) {
      stateStore.put(animationState, 'animation')
    }
    if (palettes) {
      const palettesStore = transaction.objectStore(DBStore.Palettes)
      for (const p of palettes) palettesStore.put(p)
    }
    if (animations) {
      const animationsStore = transaction.objectStore(DBStore.Animations)
      for (const a of animations) animationsStore.put(a)
    }
    if (frames) {
      const framesStore = transaction.objectStore(DBStore.Frames)
      for (const f of frames) framesStore.put(f)
    }

    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = ({ target: { error } }) => reject(error)
      transaction.onabort = ({ target: { error } }) => reject(error)
    })
  }
}
