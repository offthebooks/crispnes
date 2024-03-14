import { Store } from './stores/store.js'
import { Render } from './render.js'
import { Input } from './input.js'

Store.init()
Render.init()
Input.init()
window.store = Store.context
