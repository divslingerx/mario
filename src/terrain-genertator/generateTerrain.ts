import seedrandom from "seedrandom";
import { makeNoise2D } from "perlin-simplex";

// Function to generate terrain
export function generateTerrain(
  seed: string,
  width: number,
  height: number,
  partialMatrix?: number[][]
): number[][] {
  // Create a seeded random number generator using the provided seed
  const rng = seedrandom(seed);
  // Initialize the 2D noise function with a random seed
  const noise2D = makeNoise2D(() => rng());

  // Initialize an empty 2D array to store the terrain
  const terrain: number[][] = [];

  // Loop through each cell in the grid
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      // Normalize the coordinates to be between -0.5 and 0.5
      const nx = x / width - 0.5,
        ny = y / height - 0.5;
      // Generate noise value for the current cell
      const elevation = (noise2D(nx, ny) + 1) / 2; // Normalize the noise value to be between 0 and 1
      // Add the elevation value to the current row
      row.push(elevation);
    }
    // Add the row to the terrain array
    terrain.push(row);
  }

  // If a partial matrix is provided, merge it with the generated terrain
  if (partialMatrix) {
    for (let y = 0; y < partialMatrix.length; y++) {
      for (let x = 0; x < partialMatrix[y].length; x++) {
        // Replace the terrain value with the partial matrix value
        terrain[y][x] = partialMatrix[y][x];
      }
    }
  }

  // Return the generated terrain
  return terrain;
}

// Example usage
const seed = "my-seed";
const width = 16;
const height = 16;
const partialMatrix: number[][] = [
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
];

// Generate the terrain using the provided seed, dimensions, and partial matrix
const terrain = generateTerrain(seed, width, height, partialMatrix);
console.log(terrain);

abstract class TerrainPlacer(){
  abstract placeTerrain(terrain: number[][]): void;
}

class TerrainBuilder(){
    private terrain: number[][] = [];
    
    constructor(private seed: string, private width: number, private height: number, private terrainPlacer: TerrainPlacer){
        this.terrain = generateTerrain(seed, width, height);
    }
    
    buildTerrain(){
        this.terrainPlacer.placeTerrain(this.terrain);
    }
}
