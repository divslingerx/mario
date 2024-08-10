import { Entity } from "../Entity";
import { Trait } from "../Trait";
import { loadSpriteSheet } from "../loaders/sprite";
import { findPlayers } from "../player";
import { GameContext } from "../GameContext";
import { Level } from "../Level";
import { SpriteSheet } from "../SpriteSheet";
import { Animation } from "../animation";

class PiranhaPlantBehavior extends Trait {
  graceDistance = 32;

  idleTime = 4;
  idleCounter = 0 as number | null;
  attackTime = 2;
  attackCounter = null as number | null;
  holdTime = 2;
  holdCounter = null as number | null;
  retreatTime = 2;
  retreatCounter = null as number | null;

  velocity = 30;
  deltaMove = 0;
  constructor() {
    super();
  }

  update(entity: Entity, gameContext: GameContext, level: Level) {
    const { deltaTime } = gameContext;

    if (this.idleCounter !== null) {
      for (const player of findPlayers(level.entities)) {
        const distance = player.bounds
          .getCenter()
          .distance(entity.bounds.getCenter());
        if (distance < this.graceDistance) {
          this.idleCounter = 0;
          return;
        }
      }

      this.idleCounter += deltaTime;
      if (this.idleCounter >= this.idleTime) {
        this.attackCounter = 0;
        this.idleCounter = null;
      }
    } else if (this.attackCounter !== null) {
      this.attackCounter += deltaTime;
      const movement = this.velocity * deltaTime;
      this.deltaMove += movement;
      entity.pos.y -= movement;
      if (this.deltaMove >= entity.size.y) {
        entity.pos.y += entity.size.y - this.deltaMove;
        this.attackCounter = null;
        this.holdCounter = 0;
      }
    } else if (this.holdCounter !== null) {
      this.holdCounter += deltaTime;
      if (this.holdCounter >= this.holdTime) {
        this.retreatCounter = 0;
        this.holdCounter = null;
      }
    } else if (this.retreatCounter !== null) {
      this.retreatCounter += deltaTime;
      const movement = this.velocity * deltaTime;
      this.deltaMove -= movement;
      entity.pos.y += movement;
      if (this.deltaMove <= 0) {
        entity.pos.y -= this.deltaMove;
        this.retreatCounter = null;
        this.idleCounter = 0;
      }
    }
  }
}

export class PiranhaPlant extends Entity {
  lifetime = 0;
  behaviour = this.addTrait(new PiranhaPlantBehavior());

  chewAnim: Animation;
  constructor(private sprites: SpriteSheet) {
    super();
    this.size.set(16, 24);
    this.chewAnim = this.sprites.getAnimation("chew");
  }

  private routeAnim(entity: Entity) {
    return this.chewAnim(entity.lifetime);
  }

  draw(context: CanvasRenderingContext2D) {
    this.sprites.draw(this.routeAnim(this), context, 0, 0);
  }
}

export const loadPiranhaPlant = async () => {
  const sprites = await loadSpriteSheet("piranha-plant");
  return () => new PiranhaPlant(sprites);
};
