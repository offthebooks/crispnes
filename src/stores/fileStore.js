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
    saveLink.setAttribute('download', filename)
    saveLink.setAttribute(
      'href',
      canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
    )
    saveLink.click()
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
