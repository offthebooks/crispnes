const dbName = 'CrispnesDB'
const dbVersion = 1

const DBStore = Object.freeze({
  Animations: 'animations',
  Frames: 'frames',
  Palettes: 'palettes',
  State: 'state'
})

const DBStateKey = Object.freeze({
  Palette: 'palette',
  Animation: 'animation'
})

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

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion)

      request.onupgradeneeded = ({ target: { result } }) => {
        // Currently just creates the object stores on first run
        // This will need migration logic if bumping dbVersion
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

      request.onerror = ({ target: { error } }) => reject(error)
    })
  }

  // Monolithic save function, can save data for any or all object stores
  // depending on the scope of the change we need to serialize
  async save(appData) {
    const {
      remove,
      paletteState,
      animationState,
      palettes,
      animations,
      frames
    } = appData
    const db = await this.db()
    const transaction = db.transaction(Object.values(DBStore), 'readwrite')
    const stateStore = transaction.objectStore(DBStore.State)

    if (remove) {
      const { frames, animations, palettes } = remove

      if (frames) {
        const framesStore = transaction.objectStore(DBStore.Frames)
        for (const f of frames) framesStore.delete(f)
      }

      if (animations) {
        const animationsStore = transaction.objectStore(DBStore.Animations)
        for (const a of animations) animationsStore.delete(a)
      }

      if (palettes) {
        const palettesStore = transaction.objectStore(DBStore.Palettes)
        for (const name of palettes) palettesStore.delete(name)
      }
    }

    if (paletteState) {
      stateStore.put(paletteState, DBStateKey.Palette)
    }
    if (animationState) {
      stateStore.put(animationState, DBStateKey.Animation)
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

  async get(store, key, tx = null) {
    const db = await this.db()
    const transaction = tx || db.transaction([store], 'readonly')

    return new Promise((resolve, reject) => {
      const request = transaction.objectStore(store).get(key)
      request.onsuccess = ({ target: { result } }) => resolve(result)
      request.onerror = ({ target: { error } }) => reject(error)
    })
  }

  async put(store, value, key, tx = null) {
    const db = await this.db()
    const transaction = tx || db.transaction([store], 'readwrite')

    return new Promise((resolve, reject) => {
      const request = transaction.objectStore(store).put(value, key)
      request.onsuccess = ({ target: { result } }) => resolve(result)
      request.onerror = ({ target: { error } }) => reject(error)
    })
  }

  loadState(key) {
    return this.get(DBStore.State, key)
  }

  async loadPaletteData() {
    const paletteState = await this.loadState(DBStateKey.Palette)

    if (!paletteState) return null

    const palettes = await this.loadPalettesByNames(paletteState.paletteList)

    return {
      paletteState,
      palettes
    }
  }

  async loadPalettesByNames(names) {
    const db = await this.db()
    const transaction = db.transaction([DBStore.Palettes], 'readonly')
    return Promise.all(
      names.map((name) => this.get(DBStore.Palettes, name, transaction))
    )
  }

  async loadAnimationData() {
    const animationState = await this.loadState(DBStateKey.Animation)

    if (!animationState) return null

    const animations = await this.loadAnimationsByNames(
      animationState.animationList
    )

    return {
      animationState,
      animations
    }
  }

  async loadAnimationsByNames(names) {
    const db = await this.db()
    const transaction = db.transaction([DBStore.Animations], 'readonly')
    const animations = await Promise.all(
      names.map((name) => this.get(DBStore.Animations, name, transaction))
    )
    return Promise.all(
      animations.map(async (a) => {
        const frames = await this.loadAnimationFramesByName(a.name)
        return {
          ...a,
          frames
        }
      })
    )
  }

  async loadAnimationFramesByName(name) {
    const db = await this.db()
    const tx = db.transaction([DBStore.Frames], 'readonly')
    const store = tx.objectStore(DBStore.Frames)

    const range = IDBKeyRange.bound([name, 0], [name, Number.MAX_SAFE_INTEGER])

    return new Promise((resolve, reject) => {
      const request = store.getAll(range)
      request.onsuccess = ({ target: { result } }) => resolve(result)
      request.onerror = ({ target: { error } }) => reject(error)
    })
  }
}
