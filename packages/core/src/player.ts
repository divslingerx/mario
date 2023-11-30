import {Player} from './traits/Player';
import LevelTimer from './traits/LevelTimer.js';
import { Entity } from './Entity.js';
import { EntityCollection, Level } from './Level';

export function makePlayer(entity: Entity, name: string) {
    const player = new Player();
    player.name = "MARIO";
    entity.addTrait(player);

    const timer = new LevelTimer();
    entity.addTrait(timer);
}

export function resetPlayer(entity: Entity, worldName: string) {
    entity.getTrait<LevelTimer>(LevelTimer)?.reset();
    const playerWorld = entity.getTrait<Player>(Player)
    playerWorld && (playerWorld.world = worldName);
}

export function bootstrapPlayer(entity: Entity, level: Level) {
    entity.getTrait<LevelTimer>(LevelTimer)?.reset();
    const worldLevelTimer = entity.getTrait<LevelTimer>(LevelTimer);
    worldLevelTimer && (worldLevelTimer.hurryEmitted  = null)
    entity.pos.copy(level.checkpoints[0]);
    level.entities.add(entity);
}

export function* findPlayers(entities: EntityCollection) {
    for (const entity of entities) {
        if (entity.traits.has(Player)) {
            yield entity;
        }
    }
}
