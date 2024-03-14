const fileInput = document.querySelector('input[type=file]')

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
