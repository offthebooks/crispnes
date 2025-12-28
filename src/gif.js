import { asciiForString, concatByteArrays } from './utils.js'

const frameCountToGifDelay = (f) => Math.max(2, Math.round((f * 100) / 60))

const HEADER = asciiForString('GIF89a')

// prettier-ignore
const LOOP_EXTENSION = Uint8Array.of(
  0x21, 0xff, 0x0b, 0x4e, 0x45, 0x54, 0x53, 0x43,
  0x41, 0x50, 0x45, 0x32, 0x2e, 0x30, 0x03, 0x01,
  0x00, 0x00, 0x00
)

export const encodeGif = ({ width, height, frames, palette }) => {
  const chunks = []

  chunks.push(HEADER)
  chunks.push(encodeLogicalScreenDescriptor(width, height))
  chunks.push(encodeColorTable(palette))
  chunks.push(LOOP_EXTENSION)

  for (const f of frames) {
    chunks.push(encodeGraphicControlExtension(f.duration))
    chunks.push(encodeImageDescriptor(width, height))
    chunks.push(encodeImageData(f.bytes))
  }

  chunks.push(Uint8Array.of(0x3b))

  return concatByteArrays(chunks)
}

const encodeLogicalScreenDescriptor = (width, height) => {
  const bytes = new Uint8Array(7)
  const view = new DataView(bytes.buffer)

  view.setUint16(0, width, true)
  view.setUint16(2, height, true)

  bytes[4] = 0xe7 // 256 color global palette
  bytes[5] = 0x00
  bytes[6] = 0x00

  return bytes
}

const encodeColorTable = (palette) => {
  const bytes = new Uint8Array(256 * 3)

  let p = 0
  for (let i = 0; i < 256; i++) {
    const c = palette.color(i) || { r: 0, g: 0, b: 0 }
    bytes[p++] = c.r
    bytes[p++] = c.g
    bytes[p++] = c.b
  }

  return bytes
}

const encodeGraphicControlExtension = (frameCount) => {
  const delay = frameCountToGifDelay(frameCount)
  const bytes = new Uint8Array(8)
  const view = new DataView(bytes.buffer)

  // Header bytes
  bytes[0] = 0x21
  bytes[1] = 0xf9
  bytes[2] = 0x04

  let packed = 0
  const disposal = 2
  packed |= disposal << 2 // Clear each frame
  packed |= 0x01 // Always using transparency

  bytes[3] = packed
  view.setUint16(4, delay, true)
  bytes[6] = 0 // Index 0 is transparent index
  bytes[7] = 0x00

  return bytes
}

const encodeImageDescriptor = (width, height) => {
  const bytes = new Uint8Array(10)
  const view = new DataView(bytes.buffer)

  bytes[0] = 0x2c
  view.setUint16(1, 0, true)
  view.setUint16(3, 0, true)
  view.setUint16(5, width, true)
  view.setUint16(7, height, true)
  bytes[9] = 0x00

  return bytes
}

const encodeImageData = (pixels) => {
  const minCodeSize = 8
  const compressed = lzwEncode(pixels, minCodeSize)

  const bytes = new Uint8Array(
    1 + compressed.length + Math.ceil(compressed.length / 255) + 1
  )

  let p = 0
  bytes[p++] = minCodeSize

  let i = 0
  while (i < compressed.length) {
    const blockSize = Math.min(255, compressed.length - i)
    bytes[p++] = blockSize
    for (let j = 0; j < blockSize; j++) {
      bytes[p++] = compressed[i++]
    }
  }

  bytes[p++] = 0x00

  return bytes.subarray(0, p)
}

const lzwEncode = (indices, minCodeSize) => {
  const clearCode = 1 << minCodeSize
  const endCode = clearCode + 1

  let nextCode = endCode + 1
  let codeSize = minCodeSize + 1
  const maxCode = 1 << 12 // GIF LZW max is 12 bits

  const dict = new Map()

  const resetDictionary = () => {
    dict.clear()
    for (let i = 0; i < clearCode; i++) {
      dict.set(String(i), i)
    }
    nextCode = endCode + 1
    codeSize = minCodeSize + 1
  }

  resetDictionary()

  const bytes = []
  let bitBuffer = 0
  let bitCount = 0

  const writeCode = (code) => {
    bitBuffer |= code << bitCount
    bitCount += codeSize

    while (bitCount >= 8) {
      bytes.push(bitBuffer & 0xff)
      bitBuffer >>= 8
      bitCount -= 8
    }
  }

  const flushBits = () => {
    if (bitCount > 0) {
      bytes.push(bitBuffer & 0xff)
      bitBuffer = 0
      bitCount = 0
    }
  }

  writeCode(clearCode)
  let current = String(indices[0])

  for (let i = 1; i < indices.length; i++) {
    const k = indices[i]
    const combined = current + ',' + k

    if (dict.has(combined)) {
      current = combined
    } else {
      writeCode(dict.get(current))

      if (nextCode < maxCode) {
        dict.set(combined, nextCode++)
        if (nextCode === 1 << codeSize && codeSize < 12) {
          codeSize++
        }
      } else {
        // Dictionary is full
        writeCode(clearCode)
        resetDictionary()
      }

      current = String(k)
    }
  }

  writeCode(dict.get(current))
  writeCode(endCode)
  flushBits()

  return Uint8Array.from(bytes)
}
