export class EditTile extends Int16Array {
  constructor(tileIndex, x, y) {
    super([tileIndex, x, y])
  }
}
