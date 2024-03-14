export class EditTile extends Int16Array {
  constructor(tileIndex, x, y) {
    super([tileIndex, x, y])
  }

  get tileIndex() {
    return this[0]
  }

  get x() {
    return this[1]
  }

  get y() {
    return this[2]
  }
}
