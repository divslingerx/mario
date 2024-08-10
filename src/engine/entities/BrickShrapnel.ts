import { Entity } from "../Entity.js";
import LifeLimit from "../traits/LifeLimit.js";
import { Gravity } from "../traits/Gravity.js";
import { Velocity } from "../traits/Velocity.js";
import { loadAudioBoard } from "../loaders/audio.js";
import { loadSpriteSheet } from "../loaders/sprite.js";
import { SpriteSheet } from "../SpriteSheet.js";
import { AudioBoard } from "../AudioBoard.js";
import { Animation } from "../animation";

export class BrickShrapnel extends Entity {
  lifetime = 0;

  spinBrick: Animation;
  constructor(
    private sprites: SpriteSheet,
    audio: AudioBoard
  ) {
    super();
    this.size.set(8, 8);
    this.addTrait(new LifeLimit());
    this.addTrait(new Gravity());
    this.addTrait(new Velocity());
    this.spinBrick = this.sprites.getAnimation("spinning-brick");
    this.audio = audio;
  }

  draw(context: CanvasRenderingContext2D) {
    this.sprites.draw(this.spinBrick(this.lifetime), context, 0, 0);
  }
}

export const loadBrickShrapnel = async (audioContext: AudioContext) => {
  const [spriteSheet, audioBoard] = await Promise.all([
    loadSpriteSheet("brick-shrapnel"),
    loadAudioBoard("brick-shrapnel", audioContext),
  ]);
  return () => new BrickShrapnel(spriteSheet, audioBoard);
};
