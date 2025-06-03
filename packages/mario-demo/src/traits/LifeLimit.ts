import { Entity } from "../Entity";
import { GameContext } from "../GameContext";
import { Level } from "../Level";
import { Trait } from "../Trait";

export default class LifeLimit extends Trait {
  time = 2;

  update(entity: Entity, _: GameContext, level: Level) {
    if (entity.lifetime > this.time) {
      this.queue(() => {
        level.entities.delete(entity);
      });
    }
  }
}
