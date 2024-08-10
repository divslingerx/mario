import { Entity } from "../Entity";
import { GameContext } from "../GameContext";
import { rainbowSpriteSheet, SpriteSheet } from "../SpriteSheet";
import { Trait } from "../Trait";
import { Killable } from "../traits/Killable";
import { PendulumMove } from "../traits/PendulumMove";
import { Physics } from "../traits/Physics";
import { Solid } from "../traits/Solid";
import { Stomper } from "../traits/Stomper";

enum HumanState {
  walking,
  hiding,
  panic,
}

class HumanBehavior extends Trait {
  state = HumanState.walking;
  hideTime = 0;
  hideDuration = 5;
  panicSpeed = 300;
  walkSpeed?: number;

  collides(us: Entity, them: Entity) {
    if (us.getTrait(Killable)?.dead) {
      return;
    }

    const stomper = them.getTrait(Stomper);
    if (stomper) {
      if (them.vel.y > us.vel.y) {
        this.handleStomp(us, them);
      } else {
        this.handleNudge(us, them);
      }
    }
  }

  handleStomp(us: Entity, _: Entity) {
    if (this.state === HumanState.walking) {
      this.hide(us);
    } else if (this.state === HumanState.hiding) {
      us.useTrait(Killable, (it) => it.kill());
      us.vel.set(100, -200);
      us.useTrait(Solid, (s) => (s.obstructs = false));
    } else if (this.state === HumanState.panic) {
      this.hide(us);
    }
  }

  handleNudge(us: Entity, them: Entity) {
    const kill = () => {
      const killable = them.getTrait(Killable);
      if (killable) {
        killable.kill();
      }
    };

    if (this.state === HumanState.walking) {
      kill();
    } else if (this.state === HumanState.hiding) {
      this.panic(us, them);
    } else if (this.state === HumanState.panic) {
      const travelDir = Math.sign(us.vel.x);
      const impactDir = Math.sign(us.pos.x - them.pos.x);
      if (travelDir !== 0 && travelDir !== impactDir) {
        kill();
      }
    }
  }

  hide(us: Entity) {
    us.useTrait(PendulumMove, (walk) => {
      us.vel.x = 0;
      walk.enabled = false;

      if (!this.walkSpeed) {
        this.walkSpeed = walk.speed;
      }

      this.state = HumanState.hiding;
      this.hideTime = 0;
    });
  }

  unhide(us: Entity) {
    us.useTrait(PendulumMove, (walk) => {
      walk.enabled = true;
      if (this.walkSpeed != null) walk.speed = this.walkSpeed;
      this.state = HumanState.walking;
    });
  }

  panic(us: Entity, them: Entity) {
    us.useTrait(PendulumMove, (pm) => {
      pm.speed = this.panicSpeed * Math.sign(them.vel.x);
      pm.enabled = true;
    });
    this.state = HumanState.panic;
  }

  update(us: Entity, { deltaTime }: GameContext) {
    if (this.state === HumanState.hiding) {
      this.hideTime += deltaTime;

      if (this.hideTime > this.hideDuration) {
        this.unhide(us);
      }
    }
  }
}

export class Human extends Entity {
  walk = this.addTrait(new PendulumMove());
  behavior = this.addTrait(new HumanBehavior());
  killable = this.addTrait(new Killable());
  solid = this.addTrait(new Solid());
  physics = this.addTrait(new Physics());

  walkAnim = this.sprites.getAnimation("walk");
  wakeAnim = this.sprites.getAnimation("wake");

  constructor(
    private sprites: SpriteSheet,
    private color: string
  ) {
    super();
    this.size.set(16, 16);
    this.offset.set(0, 8);
  }

  draw(context: CanvasRenderingContext2D) {
    this.sprites.drawTile(this.color, context, this.pos.x, this.pos.y);
  }
}

export async function loadHuman(color: string) {
  const sprites = rainbowSpriteSheet;

  return function createHuman() {
    return new Human(sprites, color);
  };
}
