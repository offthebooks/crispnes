import { Store } from './stores/store.js'
import { Input } from './input.js'

async function registerServiceWorker() {
  const sw = navigator.serviceWorker
  if (sw && sw.controller !== null) return
  const reg = await sw.register('./serviceWorker.js')
  reg.addEventListener('updatefound', () => {
    const regSW = reg.installing
    // Reload on first activating service worker so all files cache
    regSW?.addEventListener(
      'statechange',
      () => regSW.state === 'activated' && location.reload()
    )
  })
}

registerServiceWorker()
Store.init()
Input.init()
window.store = Store.context
