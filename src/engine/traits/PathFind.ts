import { Entity } from "../Entity";
import { GameContext } from "../GameContext";
import { Level } from "../Level";
import { Vec2 } from "../math";
import { Trait } from "../Trait";

export class PathFind extends Trait {
  destination = new Vec2(0, 0);
  dead = false;
  deadTime = 0;
  removeAfter = 2;

  kill() {
    this.queue(() => {
      this.dead = true;
    });
  }

  revive() {
    this.dead = false;
    this.deadTime = 0;
  }

  update(entity: Entity, { deltaTime }: GameContext, level: Level) {
    if (this.dead) {
      this.deadTime += deltaTime;
      if (this.deadTime > this.removeAfter) {
        this.queue(() => {
          level.entities.delete(entity);
        });
      }
    }
  }
}
