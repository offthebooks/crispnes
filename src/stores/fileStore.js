import { ButtonStyle } from '../consts.js'
import {
  clamp,
  domCreate,
  domQueryAll,
  domQueryList,
  domQueryOne,
  elementFromTemplate
} from '../utils.js'
import { Store } from './store.js'

const fileInput = domQueryOne('input[type=file]')
const saveLink = domQueryOne('#saveLink')
const saveTemplate = domQueryOne('#saveFrame')
const exportSheetTemplate = domQueryOne('#exportSheet')

export class FileStore {
  #fileHandler

  constructor() {
    fileInput.addEventListener('change', () => this.#loadFile())
  }

  async openFile(handler) {
    if (typeof handler !== 'function') return

    this.#fileHandler = handler
    fileInput.click()
  }

  saveFile(filename, bytes) {
    saveLink.setAttribute('download', filename)
    const blob = new Blob([bytes], {
      type: 'application/octet-stream'
    })

    saveLink.href = URL.createObjectURL(blob)
    saveLink.click()
  }

  saveFrameDialog(canvas) {
    const {
      viewStore,
      animationStore: { animation }
    } = Store.context
    const saveForm = elementFromTemplate(saveTemplate)
    const form = domQueryOne('form', saveForm)
    const { name, width, height } = animation
    const dimension = Math.max(width, height)
    const defaultScale = Math.min(20, Math.floor(960 / dimension))
    const maxScale = Math.floor(3840 / dimension)

    const [nameInput, scaleInput, dimensionsDisplay] = domQueryList(
      ['[name="name"]', '[name="scale"]', '[name="dimensions"]'],
      form
    )

    const updateDimensions = () => {
      const scale = scaleInput.value || 1
      dimensionsDisplay.textContent = `${width * scale} x ${height * scale} pixels`
    }

    nameInput.value = name
    scaleInput.value = defaultScale
    updateDimensions()

    form.addEventListener('input', () => {
      const nameValue = nameInput.value.trim()
      if (scaleInput.value !== '')
        scaleInput.value = clamp(scaleInput.value, maxScale, 1)

      if (nameValue === '') {
        nameInput.setCustomValidity('Filename required')
      } else {
        nameInput.setCustomValidity('')
      }

      updateDimensions()
    })

    const button = viewStore.pushView({
      title: 'Save Frame',
      content: saveForm,
      buttons: [
        {
          label: 'Save Frame',
          style: ButtonStyle.Primary,
          handler: () => {
            if (!form.checkValidity()) {
              form.reportValidity()
              return
            }

            this.saveUpscaledCanvasImage(
              nameInput.value.trim(),
              canvas,
              scaleInput.value || 1
            )
            viewStore.dismiss()
          }
        }
      ]
    })
  }

  exportSpriteSheetDialog() {
    const {
      viewStore,
      animationStore: { animation }
    } = Store.context
    const exportForm = elementFromTemplate(exportSheetTemplate)
    const form = domQueryOne('form', exportForm)
    const canvas = domQueryOne('canvas', exportForm)
    const frames = domQueryAll('#frameItems canvas')
    const maxScale = 100
    const { name, width, height, length } = animation
    const [nameInput, paddingInput, scaleInput] = domQueryList(
      ['[name="name"]', '[name="padding"]', '[name="scale"]'],
      form
    )

    const updatePreview = () => {
      const padding = isNaN(paddingInput.valueAsNumber)
        ? 0
        : paddingInput.valueAsNumber
      const scale = isNaN(scaleInput.valueAsNumber)
        ? 1
        : scaleInput.valueAsNumber
      const sw = width * scale
      const sh = height * scale
      const sp = padding * scale
      const pw = sw + 2 * sp
      const ph = sh + 2 * sp

      canvas.width = pw * length
      canvas.height = ph
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false

      frames.forEach((c, idx) => {
        const top = sp
        const left = pw * idx + sp
        ctx.drawImage(c, left, top, sw, sh)
      })
    }

    nameInput.value = name
    scaleInput.value = 1
    updatePreview()

    form.addEventListener('input', () => {
      const nameValue = nameInput.value.trim()
      if (scaleInput.value !== '')
        scaleInput.value = clamp(scaleInput.value, maxScale, 1)

      if (nameValue === '') {
        nameInput.setCustomValidity('Filename required')
      } else {
        nameInput.setCustomValidity('')
      }

      updatePreview()
    })

    const button = viewStore.pushView({
      title: 'Export Sprite Sheet',
      content: exportForm,
      buttons: [
        {
          label: 'Export',
          style: ButtonStyle.Primary,
          handler: () => {
            if (!form.checkValidity()) {
              form.reportValidity()
              return
            }

            this.saveCanvasImage(nameInput.value.trim(), canvas)
            viewStore.dismiss()
          }
        }
      ]
    })
  }

  saveCanvasImage(filename, canvas) {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      saveLink.download = filename
      saveLink.href = url
      saveLink.click()
      URL.revokeObjectURL(url)
    })
  }

  saveUpscaledCanvasImage(filename, canvas, scale = 10) {
    if (Math.max(canvas.width, canvas.height) > 256)
      return this.saveCanvasImage(filename, canvas)

    const upscaledCanvas = domCreate({
      tag: 'canvas',
      w: canvas.width * scale,
      h: canvas.height * scale
    })
    const ctx = upscaledCanvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(canvas, 0, 0, upscaledCanvas.width, upscaledCanvas.height)

    this.saveCanvasImage(filename, upscaledCanvas)
  }

  #loadFile() {
    const [file] = fileInput.files
    if (!file) return

    const fr = new FileReader()
    fr.onload = () => {
      const bytes = this.#fileHandler(new Uint8Array(fr.result))
      this.#fileHandler = null
    }
    fr.readAsArrayBuffer(file)
  }
}
