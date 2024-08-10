import { Animation } from "../animation";
import { AudioBoard } from "../AudioBoard";
import { Entity } from "../Entity";
import { loadAudioBoard } from "../loaders/audio";
import { loadSpriteSheet } from "../loaders/sprite";
import { SpriteSheet } from "../SpriteSheet";
import { Go } from "../traits/Go";
import { Jump } from "../traits/Jump";
import { Killable } from "../traits/Killable";
import { Physics } from "../traits/Physics";
import { PipeTraveller } from "../traits/PipeTraveller";
import { PoleTraveller } from "../traits/PoleTraveller";
import { Solid } from "../traits/Solid";
import { Stomper } from "../traits/Stomper";

const FAST_DRAG = 1 / 5000;
const SLOW_DRAG = 1 / 1000;

export class Mario extends Entity {
  jump = this.addTrait(new Jump());
  go = this.addTrait(new Go());
  stomper = this.addTrait(new Stomper());
  killable = this.addTrait(new Killable());
  solid = this.addTrait(new Solid());
  physics = this.addTrait(new Physics());
  poleTraveller = this.addTrait(new PoleTraveller());
  pipeTraveller = this.addTrait(new PipeTraveller());

  climbAnim: Animation;
  runAnim: Animation;
  constructor(
    private sprites: SpriteSheet,
    public audio: AudioBoard
  ) {
    super();

    this.size.set(14, 16);

    this.go.dragFactor = SLOW_DRAG;
    this.killable.removeAfter = Infinity;

    this.setTurboState(false);
    this.runAnim = this.sprites.getAnimation("run");
    this.climbAnim = this.sprites.getAnimation("climb");
  }

  getHeading(mario: Mario) {
    const poleTraveller = mario.getTrait(PoleTraveller);
    if (poleTraveller?.distance) {
      return false;
    }
    const heading = mario.getTrait(Go)?.heading || 0;
    return heading < 0;
  }

  resolveAnimationFrame() {
    const pipeTraveller = this.getTrait(PipeTraveller);
    if (pipeTraveller && pipeTraveller.movement.x != 0) {
      return this.runAnim(pipeTraveller.distance.x * 2);
    }
    if (pipeTraveller?.movement.y != 0) {
      return "idle";
    }

    const poleTraveller = this.getTrait(PoleTraveller);
    if (poleTraveller?.distance) {
      return this.climbAnim(poleTraveller.distance);
    }

    if (this.jump.falling) {
      return "jump";
    }

    if (this.go.distance > 0) {
      if (
        (this.vel.x > 0 && this.go.dir < 0) ||
        (this.vel.x < 0 && this.go.dir > 0)
      ) {
        return "brake";
      }

      return this.runAnim(this.go.distance);
    }
    return "idle";
  }

  draw(context: CanvasRenderingContext2D) {
    this.sprites.draw(
      this.resolveAnimationFrame(),
      context,
      0,
      0,
      this.go.heading < 0
    );
  }

  setTurboState(turboState: boolean) {
    this.go.dragFactor = turboState ? FAST_DRAG : SLOW_DRAG;
  }
}

export async function loadMario(audioContext: AudioContext) {
  const [marioSprites, audioBoard] = await Promise.all([
    loadSpriteSheet("mario"),
    loadAudioBoard("mario", audioContext),
  ]);

  return function createMario() {
    return new Mario(marioSprites, audioBoard);
  };
}
