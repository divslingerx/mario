import { Entity } from "./Entity";
import { Level } from "./Level";

import { LevelTimer } from "./traits/LevelTimer";
import { Player } from "./traits/Player";
import { PlayerController } from "./traits/PlayerController";

export function bootstrapPlayer(playerEntity: Entity, level: Level) {
  const playerEnv = new Entity();
  const playerControl = new PlayerController(playerEntity);
  const levelTimer = playerEntity.getTrait(LevelTimer);
  if (levelTimer) {
    levelTimer.hurryEmitted = false;
  }

  playerEntity.pos.copy(level.checkpoints[0]);
  playerEnv.addTrait(playerControl);
  level.entities.add(playerEntity);
  return playerEnv;
}

export function* findPlayers(entities: Iterable<Entity>) {
  for (const entity of entities) {
    if (entity.getTrait(Player)) yield entity;
  }
}

export function resetPlayer(entity: Entity, worldName: string) {
  const player = entity.getTrait(Player);
  const levelTimer = entity.getTrait(LevelTimer);

  levelTimer?.reset();
  if (player) {
    player.world = worldName;
  }
}

export function makePlayer(entity: Entity, name: string) {
  const player = new Player();
  player.name = name;
  entity.addTrait(player);

  const timer = new LevelTimer();
  entity.addTrait(timer);
}
