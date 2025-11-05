import { domCreate } from '../utils.js'

const fileInput = document.querySelector('input[type=file]')
const saveLink = document.getElementById('saveLink')

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
