export type Animation = (distance: number) => string;
import { createCanvas } from "./utils/helpers/createCanvasGetCtx";

export  class SpriteSheet {
  tiles = new Map<string, HTMLCanvasElement[]>();
  animations = new Map<string, Animation>();

  constructor(
    public image: HTMLImageElement,
    public width: number,
    public height: number
  ) {}

  defineAnim(name: string, animation: (distance: number) => any) {
    this.animations.set(name, animation);
  }

  define(name: string, x: number, y: number, width: number, height: number) {
    const buffers = [false, true].map((flip) => {
      const [buffer, context] = createCanvas(width, height);

      if (flip) {
        context.scale(-1, 1);
        context.translate(-width, 0);
      }

      context.drawImage(this.image, x, y, width, height, 0, 0, width, height);

      return buffer;
    });

    this.tiles.set(name, buffers);
  }

  defineTile(name: string, x: number, y: number) {
    this.define(name, x * this.width, y * this.height, this.width, this.height);
  }

  draw(
    name: string,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    flip = false
  ) {
    const buffers = this.tiles.get(name);
    if (!buffers) {
      throw new Error(`SpriteSheet.draw(): Sprite "${name}" not found`);
    }
    context.drawImage(buffers[flip ? 1 : 0], x, y);
  }

  drawAnim(
    name: string,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    distance: number
  ) {
    const animation = this.animations.get(name);
    if (!animation) {
      throw new Error(`Animation not found: ${name}`);
    }
    this.drawTile(animation(distance), context, x, y);
  }

  drawTile(
    name: string,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
  ) {
    this.draw(name, context, x * this.width, y * this.height)
  }
}
