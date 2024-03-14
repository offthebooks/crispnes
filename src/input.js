import { Store } from './stores/store.js'

export class Input {
  static init() {
    document.addEventListener('click', async ({ target }) => {
      const menuItem = target.closest('[data-menu-item]')

      if (menuItem) {
        const { fileStore, tileStore } = Store.context
        switch (menuItem.getAttribute('data-menu-item')) {
          case 'loadChr':
            fileStore.openFile((chrBytes) => {
              tileStore.assignTileset(chrBytes)
            })
            break
          case 'saveChr':
          default:
            break
        }
      }
    })
  }
}
