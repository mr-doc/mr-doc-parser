export interface ILocation {
  position: {
    start: number,
    end: number,
  }
  location: {
    row: { start: number, end: number },
    column: { start: number, end: number }
  }
}