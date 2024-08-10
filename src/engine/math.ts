export class Vec2 {
  constructor(
    public x = 0,
    public y = 0
  ) {}

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  copy(other: Vec2) {
    this.set(other.x, other.y);
  }

  equals(vec2: Vec2) {
    return this.x === vec2.x && this.y === vec2.y;
  }

  distance(vec2: Vec2) {
    const dx = this.x - vec2.x,
      dy = this.y - vec2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

export class Matrix<T> {
  // TODO: implement iterator

  private grid: T[][] = [];

  set(x: number, y: number, value: T) {
    if (!this.grid[x]) {
      this.grid[x] = [];
    }
    this.grid[x][y] = value;
  }

  get(x: number, y: number): T | undefined {
    const col = this.grid[x];
    if (col) return col[y];
  }

  delete(x: number, y: number) {
    const col = this.grid[x];
    if (col) delete col[y];
  }

  *itemsInRange(left: number, top: number, right: number, bottom: number) {
    for (let x = left; x <= right; x++) {
      for (let y = top; y <= bottom; y++) {
        const value = this.get(x, y);
        if (value) yield [value, x, y] as const;
      }
    }
  }

  // Using forEach instead of entries() to avoid errors when the grid is missing a row.
  // The entries() method requires the grid and its rows to be properly initialized as arrays,
  // and will throw an error if any row is undefined or missing. The forEach method handles
  // undefined or missing rows more gracefully, ensuring that the callback is only called for
  // existing elements.
  forEach(callback: (value: T, x: number, y: number) => void) {
    this.grid.forEach((column, x) => {
      column.forEach((value, y) => {
        callback(value, x, y);
      });
    });
  }
}

export function clamp(value: number, min: number, max: number) {
  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }
  return value;
}

export const Direction = {
  UP: new Vec2(0, -1),
  DOWN: new Vec2(0, 1),
  RIGHT: new Vec2(1, 0),
  LEFT: new Vec2(-1, 0),
};
