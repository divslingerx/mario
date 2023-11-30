import { AudioBoard } from "./AudioBoard";
import { BoundingBox } from "./BoundingBox";
import { EventBuffer } from "./EventBuffer";
import { GameContext } from "./GameContext";
import { Level } from "./Level";
import { Vec2 } from "./math";
import { TileResolverMatch } from "./TileResolver";
import { Trait } from "./Trait";

type TraitConstructor<T extends Trait> = new (...args: unknown[]) => T;

export enum Side {
  top,
  bottom,
  left,
  right,
}

export const Sides = {
  TOP: Symbol("top"),
  BOTTOM: Symbol("bottom"),
  LEFT: Symbol("left"),
  RIGHT: Symbol("right"),
};

type AlignFunction = (target: Entity, subject: Entity) => void;

interface AlignFunctions {
  center: AlignFunction;
  top: AlignFunction;
  bottom: AlignFunction;
  left: AlignFunction;
  right: AlignFunction;
}
export const Align: AlignFunctions = {
  center(target, subject) {
    subject.bounds.setCenter(target.bounds.getCenter());
  },

  bottom(target, subject) {
    subject.bounds.bottom = target.bounds.bottom;
  },

  top(target, subject) {
    subject.bounds.top = target.bounds.top;
  },

  left(target, subject) {
    subject.bounds.left = target.bounds.left;
  },

  right(target, subject) {
    subject.bounds.right = target.bounds.right;
  },
};





export class Entity {
  static get NAME() {
    return "entity";
  }
  id: string | number | null;
  audio: AudioBoard;
  bounds: BoundingBox;
  events: EventBuffer;
  lifetime: number;
  offset: Vec2;
  pos: Vec2;
  vel: Vec2;
  size: Vec2;
  traits: Map<typeof Trait.constructor, Trait>;
  sounds = new Set<string>();

  constructor() {
    this.id = null;
    this.audio = new AudioBoard();
    this.events = new EventBuffer();
    this.sounds = new Set();

    this.pos = new Vec2(0, 0);
    this.vel = new Vec2(0, 0);
    this.size = new Vec2(0, 0);
    this.offset = new Vec2(0, 0);
    this.bounds = new BoundingBox(this.pos, this.size, this.offset);
    this.lifetime = 0;

    this.traits = new Map<typeof Trait.constructor, Trait>();
  }

  addTrait<T extends Trait>(trait: T) {
    this.traits.set(trait.constructor, trait);
    return trait;
  }

  getTrait<T extends Trait>(TraitClass: TraitConstructor<T>): T | undefined {
    const trait = this.traits.get(TraitClass);
    if (trait instanceof TraitClass) {
      return trait;
    }
  }

  useTrait<T extends Trait>(
    TraitClass: TraitConstructor<T>,
    fn: (trait: T) => void
  ): void {
    const trait = this.getTrait(TraitClass);
    if (trait) fn(trait);
  }

  collides(candidate: Entity) {
    this.traits.forEach((trait) => {
      trait.collides(this, candidate);
    });
  }

  obstruct(side: Side, match: TileResolverMatch) {
    this.traits.forEach((trait) => {
      trait.obstruct(this, side, match);
    });
  }

  draw(context: CanvasRenderingContext2D) {}

  finalize() {
    this.events.emit(Trait.EVENT_TASK, this);

    this.traits.forEach((trait) => {
      trait.finalize(this);
    });

    this.events.clear();
  }

  private playSounds(audioBoard: AudioBoard, audioContext: AudioContext) {
    this.sounds.forEach((name) => {
      audioBoard.playAudio(name, audioContext);
    });

    this.sounds.clear();
  }

  update(gameContext: GameContext, level: Level) {
    this.traits.forEach((trait) => {
      trait.update(this, gameContext, level);
    });

    this.playSounds(this.audio, gameContext.audioContext);

    this.lifetime += gameContext.deltaTime;
  }
}
