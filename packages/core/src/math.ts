type MatrixCellCallback = (value: any, x: number, y: number) => void;

export class Matrix<T> {
  public grid: T[][];
  constructor() {
    this.grid = [];
  }

  forEach(callback: MatrixCellCallback) {
    this.grid.forEach((column, x) => {
      column.forEach((value, y) => {
        callback(value, x, y);
      });
    });
  }

  delete(x: number, y: number) {
    const col = this.grid[x];
    if (col) {
      delete col[y];
    }
  }

  get(x: number, y: number) {
    const col = this.grid[x];
    if (col) {
      return col[y];
    }
    return undefined;
  }

  set(x: number, y: number, value: T) {
    if (!this.grid[x]) {
      this.grid[x] = [];
    }

    this.grid[x][y] = value;
  }

  *forItemsInRange(left: number, top: number, right: number, bottom: number) {
    for (let x = left; x <= right; x++) {
      for (let y = top; y <= bottom; y++) {
        const value = this.get(x, y);
        if (value) yield [value, x, y] as const;
      }
    }
  }
}

export class Vec2 {
  constructor(public x: number, public y: number) {
    this.set(x, y);
  }

  static from(vec2: Vec2) {
    return new Vec2(vec2.x, vec2.y);
  }

  static UP = new Vec2(0, -1);
  static DOWN = new Vec2(0, 1);
  static RIGHT = new Vec2(1, 0);
  static LEFT = new Vec2(-1, 0);

  copy(vec2: Vec2) {
    this.x = vec2.x;
    this.y = vec2.y;
  }

  equals(vec2: Vec2) {
    return this.x === vec2.x && this.y === vec2.y;
  }

  distance(v: Vec2) {
    const dx = this.x - v.x,
      dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
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

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const Direction = {
  UP: new Vec2(0, -1),
  DOWN: new Vec2(0, 1),
  RIGHT: new Vec2(1, 0),
  LEFT: new Vec2(-1, 0),
};
