import { Level, TileResolver } from '@js2d/engine'
import { createSurvivor } from '../entities/Survivor'
import { createPawn } from '../entities/Pawn'
import { createSecurityDrone } from '../entities/SecurityDrone'
import { createPatrolBot } from '../entities/PatrolBot'
import { createWall } from '../entities/structures/Wall'
import { createDoor } from '../entities/structures/Door'
import { createWorkbench } from '../entities/structures/Workbench'

export class LevelSetup {
  static createGameLevel(): Level {
    const level = new Level()
    
    // Setup tile system (even if we don't use tiles, it's needed)
    const tileSize = 32
    const tileResolver = new TileResolver(tileSize)
    level.tileCollider.tiles = tileResolver
    
    return level
  }

  static spawnPlayer(level: Level, x: number, y: number) {
    const player = createSurvivor()
    player.pos.set(x, y)
    level.entities.add(player)
    console.log('Player created at', player.pos.x, player.pos.y)
    return player
  }

  static spawnPawns(level: Level, count: number, startX: number, startY: number, spacing: number = 60) {
    const pawns = []
    for (let i = 0; i < count; i++) {
      const pawn = createPawn()
      pawn.pos.set(startX + i * spacing, startY)
      level.entities.add(pawn)
      pawns.push(pawn)
    }
    return pawns
  }

  static buildBase(level: Level) {
    const structures = [
      // Walls forming a small base
      { entity: createWall(), x: 200, y: 200 },
      { entity: createWall(), x: 232, y: 200 },
      { entity: createWall(), x: 264, y: 200 },
      { entity: createDoor(), x: 296, y: 200 },
      { entity: createWall(), x: 328, y: 200 },
      { entity: createWall(), x: 360, y: 200 },
      { entity: createWall(), x: 392, y: 200 },
      
      // Side walls
      { entity: createWall(), x: 200, y: 232 },
      { entity: createWall(), x: 200, y: 264 },
      { entity: createWall(), x: 200, y: 296 },
      
      { entity: createWall(), x: 392, y: 232 },
      { entity: createWall(), x: 392, y: 264 },
      { entity: createWall(), x: 392, y: 296 },
      
      // Workbench inside
      { entity: createWorkbench(), x: 296, y: 250 }
    ]
    
    for (const { entity, x, y } of structures) {
      entity.pos.set(x, y)
      // Mark as built for demo
      if ('isBuilt' in entity) {
        entity.isBuilt = true
      }
      level.entities.add(entity)
    }
  }

  static spawnEnemies(level: Level) {
    const enemies = [
      { entity: createSecurityDrone(), x: 100, y: 100 },
      { entity: createSecurityDrone(), x: 600, y: 150 },
      { entity: createPatrolBot(), x: 300, y: 100 },
      { entity: createPatrolBot(), x: 500, y: 400 }
    ]
    
    for (const { entity, x, y } of enemies) {
      entity.pos.set(x, y)
      level.entities.add(entity)
    }
    
    return enemies.map(e => e.entity)
  }
}