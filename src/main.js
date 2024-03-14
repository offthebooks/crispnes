import { Store } from './stores/store.js'
import { Render } from './render.js'

Store.init()
Render.init()
window.store = Store.context
