import { Store } from './_stores/store.js'
import { State } from './state.js'

Store.init()
window.store = Store.context
