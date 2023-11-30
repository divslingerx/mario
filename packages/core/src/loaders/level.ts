import {Matrix, Vec2} from '../math';
import {Entity} from '../Entity';
import {Trait} from '../Trait';
import LevelTimer from '../traits/LevelTimer';
import {Trigger} from '../traits/Trigger';
import {Level} from '../Level';
import {createSpriteLayer} from '../layers/sprites';
import {createBackgroundLayer} from '../layers/background';
import {loadMusicSheet} from './music';
import {loadSpriteSheet} from './sprite';
import {loadJSON} from '../loaders';

import { EntityFactoryDict } from '../entities'
import { SpriteSheet } from '../SpriteSheet'
import { TileResolverMatrix } from '../TileResolver'
import { LevelSpec, LevelSpecPatterns, LevelSpecTile, PatternSpec, RectRange, TileRange } from '../types'
import { GameContext } from '../GameContext';

function createSpawner() {
    class Spawner extends Trait {
        entities: Entity[] = [];
        offsetX = 64;

      

        addEntity(entity: Entity) {
            this.entities.push(entity);
            this.entities.sort((a, b) => a.pos.x < b.pos.x ? -1 : 1);
        }

        update(entity: Entity, gameContext: GameContext, level: Level) {
            const cameraMaxX = level.camera.pos.x + level.camera.size.x + this.offsetX;
            while (this.entities[0]) {
                if (cameraMaxX > this.entities[0].pos.x) {
                    level.entities.add(this.entities.shift());
                } else {
                    break;
                }
            }

        }
    }

    return new Spawner();
}

function loadPattern(name:string) {
    return loadJSON<LevelSpecPatterns>(`/sprites/patterns/${name}.json`);
}

function setupBehavior(level: Level) {
    level.events.listen(LevelTimer.EVENT_TIMER_OK, () => {
        level.music.playTheme();
    });
    level.events.listen(LevelTimer.EVENT_TIMER_HURRY, () => {
        level.music.playHurryTheme();
    });
}

function setupBackgrounds(levelSpec: LevelSpec, level: Level, patterns: LevelSpecPatterns) {
    levelSpec.layers.forEach(layer => {
        const grid = createGrid(layer.tiles, patterns);
        level.tileCollider.addGrid(grid);
    });
}

function setupCamera(level: Level) {
    let maxX = 0;
    let maxTileSize = 0;
    for (const resolver of level.tileCollider.resolvers) {
        if (resolver.tileSize > maxTileSize) {
            maxTileSize = resolver.tileSize;
        }
        resolver.matrix.forEach((tile, x, y) => {
            if (x > maxX) {
                maxX = x;
            }
        });
    }
    level.camera.max.x = (maxX + 1) * maxTileSize;
}

function setupCheckpoints(levelSpec: LevelSpec, level: Level) {
    if (!levelSpec.checkpoints) {
        level.checkpoints.push(new Vec2(0, 0));
        return;
    }

    levelSpec.checkpoints.forEach(([x, y]) => {
        level.checkpoints.push(new Vec2(x, y));
    });
}

function setupEntities(levelSpec: LevelSpec, level: Level, entityFactory: EntityFactoryDict) {
    const spawner = createSpawner();
    levelSpec.entities.forEach(({id, name, pos: [x, y], props}) => {
        const createEntity = entityFactory[name];
        if (!createEntity) {
            throw new Error(`No entity ${name}`);
        }

        const entity = createEntity(props);
        entity.pos.set(x, y);

        if (id) {
            entity.id = id;
            level.entities.add(entity);
        } else {
            spawner.addEntity(entity);
        }
    });

    const entityProxy = new Entity();
    entityProxy.addTrait(spawner);
    level.entities.add(entityProxy);
}

function setupTriggers(levelSpec: LevelSpec, level: Level) {
    if (!levelSpec.triggers) {
        return;
    }

    for (const triggerSpec of levelSpec.triggers) {
        const trigger = new Trigger();

        trigger.conditions.push((entity: Entity, touches: Entity, gc: GameContext, level: Level) => {
            level.events.emit(Level.EVENT_TRIGGER, triggerSpec, entity, touches);
        });

        const entity = new Entity();
        entity.addTrait(trigger);
        entity.size.set(64, 64);
        entity.pos.set(triggerSpec.pos[0], triggerSpec.pos[1]);
        level.entities.add(entity);
    }
}

export function createLevelLoader(entityFactory: EntityFactoryDict) {
    return async function loadLevel(name: string) {
        const levelSpec = await loadJSON<LevelSpec>(`/levels/${name}.json`);
        const [backgroundSprites, musicPlayer, patterns] = await Promise.all([
            loadSpriteSheet(levelSpec.spriteSheet),
            loadMusicSheet(levelSpec.musicSheet),
            loadPattern(levelSpec.patternSheet),
        ]);
        const level = new Level();
        level.name = name;
        level.music.setPlayer(musicPlayer);
        setupBackgrounds(levelSpec, level, patterns);
        setupEntities(levelSpec, level, entityFactory);
        setupTriggers(levelSpec, level);
        setupCheckpoints(levelSpec, level);
        setupBehavior(level);
        setupCamera(level);
        for (const resolver of level.tileCollider.resolvers) {
            const backgroundLayer = createBackgroundLayer(level, resolver.matrix, backgroundSprites);
            level.comp.layers.push(backgroundLayer);
        }
        const spriteLayer = createSpriteLayer(level.entities);
        level.comp.layers.splice(level.comp.layers.length - 1, 0, spriteLayer);
        return level;
    }
}

function createGrid(tiles: LevelSpecTile[], patterns: LevelSpecPatterns) {
    const grid = new Matrix();

    for (const {tile, x, y} of expandTiles(tiles, patterns)) {
        grid.set(x, y, tile);
    }

    return grid as TileResolverMatrix;
}


function* expandSpan(xStart: number, xLen: number, yStart: number, yLen: number) {
    const xEnd = xStart + xLen;
    const yEnd = yStart + yLen;
    for (let x = xStart; x < xEnd; ++x) {
        for (let y = yStart; y < yEnd; ++y) {
            yield {x, y};
        }
    }
}

function expandRange(range: TileRange) {
  if (range.length === 4) {
    const [xStart, xLength, yStart, yLength] = range
    return expandSpan(xStart, xLength, yStart, yLength)
  } else if (range.length === 3) {
    const [xStart, xLength, yStart] = range
    return expandSpan(xStart, xLength, yStart, 1)
  } else if (range.length === 2) {
    const [xStart, yStart] = range
    return expandSpan(xStart, 1, yStart, 1)
  } else {
    throw new Error(`Invalid range of length ${range.length}`)
  }
}


function* expandRanges(ranges: TileRange[]) {
    for (const range of ranges) {
        yield* expandRange(range);
    }
}

function* expandTiles(tiles: LevelSpecTile[], patterns: LevelSpecPatterns) {
    type TileCreatorResult = {
      tile: LevelSpecTile
      x: number
      y: number
    }
  
    function* walkTiles(
      tiles: LevelSpecTile[],
      offsetX: number,
      offsetY: number,
    ): IterableIterator<TileCreatorResult> {
      for (const tile of tiles) {
        if (tile.ranges) {
        for (const { x, y } of expandRanges(tile.ranges)) {

          const derivedX = x + offsetX
          const derivedY = y + offsetY
  
          if (tile.pattern) {
            if (!patterns[tile.pattern]) {
              throw new Error(`pattern ${tile.pattern} not found`)
            }
            const { tiles } = patterns[tile.pattern]
            yield* walkTiles(tiles, derivedX, derivedY)
          } else if (tile.name) {
            yield {
              tile,
              x: derivedX,
              y: derivedY,
            }
          } else {
            throw new Error(
              `Tile does not have a name or a pattern: ${JSON.stringify(tile)}`,
            )
          }
        }
    }
      }
    }
  
    yield* walkTiles(tiles, 0, 0)
  }
