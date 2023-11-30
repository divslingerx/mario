export class PoissonDiskSampling {
    private readonly width: number;
    private readonly height: number;
    private readonly cellSize: number;
    private readonly radius: number;
    private readonly k: number;
    private readonly grid: number[][];
    private readonly activePoints: { x: number; y: number }[];
    private readonly points: { x: number; y: number }[];
  
    constructor(width: number, height: number, radius: number) {
      this.width = width;
      this.height = height;
      this.radius = radius;
      this.cellSize = radius / Math.sqrt(2);
      this.k = 30; // Adjust this value based on the size of your tiles and desired point density
  
      this.grid = new Array(Math.ceil(width / this.cellSize))
        .fill(0)
        .map(() => new Array(Math.ceil(height / this.cellSize)).fill(-1));
  
      const initialPoint = {
        x: Math.random() * width,
        y: Math.random() * height,
      };
  
      this.activePoints = [initialPoint];
      this.points = [initialPoint];
  
      const initialGridX = Math.floor(initialPoint.x / this.cellSize);
      const initialGridY = Math.floor(initialPoint.y / this.cellSize);
      this.grid[initialGridX][initialGridY] = 0;
    }
  
    private generateRandomPointAround(point: { x: number; y: number }): { x: number; y: number } {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * (2 * this.radius) + this.radius;
      const x = point.x + distance * Math.cos(angle);
      const y = point.y + distance * Math.sin(angle);
      return { x, y };
    }
  
    private isValidPoint(point: { x: number; y: number }): boolean {
      if (point.x < 0 || point.x >= this.width || point.y < 0 || point.y >= this.height) {
        return false;
      }
  
      const cellX = Math.floor(point.x / this.cellSize);
      const cellY = Math.floor(point.y / this.cellSize);
  
      const startX = Math.max(0, cellX - 2);
      const endX = Math.min(this.grid.length - 1, cellX + 2);
      const startY = Math.max(0, cellY - 2);
      const endY = Math.min(this.grid[0].length - 1, cellY + 2);
  
      for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
          const existingPoint = this.grid[x][y];
          if (existingPoint !== -1) {
            const dx = point.x - this.points[existingPoint].x;
            const dy = point.y - this.points[existingPoint].y;
            const distanceSquared = dx * dx + dy * dy;
            if (distanceSquared < this.radius * this.radius) {
              return false;
            }
          }
        }
      }
  
      return true;
    }
  
    public generatePoints(): { x: number; y: number }[] {
      while (this.activePoints.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.activePoints.length);
        const currentPoint = this.activePoints[randomIndex];
        let found = false;
  
        for (let i = 0; i < this.k; i++) {
          const newPoint = this.generateRandomPointAround(currentPoint);
  
          if (this.isValidPoint(newPoint)) {
            this.points.push(newPoint);
            this.activePoints.push(newPoint);
            const gridX = Math.floor(newPoint.x / this.cellSize);
            const gridY = Math.floor(newPoint.y / this.cellSize);
            this.grid[gridX][gridY] = this.points.length - 1;
            found = true;
            break;
          }
        }
  
        if (!found) {
          this.activePoints.splice(randomIndex, 1);
        }
      }
  
      return this.points;
    }
  }
  
  // Example usage:
  const width = 800; // Width of your game world
  const height = 600; // Height of your game world
  const radius = 20; // Minimum distance between points
  const poissonDiskSampler = new PoissonDiskSampling(width, height, radius);
  const points = poissonDiskSampler.generatePoints();