import { Animation } from "./animation";
import { raise } from "./raise";

export class SpriteSheet {
  tiles = new Map<string, HTMLCanvasElement[]>();
  animations = new Map<string, Animation>();

  constructor(
    public image: HTMLImageElement,
    public tileWidth: number,
    public tileHeight: number
  ) {}

  define(name: string, x: number, y: number, width: number, height: number) {
    const buffers = [false, true].map((flipped) => {
      const buffer = document.createElement("canvas");
      buffer.width = width;
      buffer.height = height;

      const context = buffer.getContext("2d") || raise("Canvas not supported");

      if (flipped) {
        context.scale(-1, 1);
        context.translate(-width, 0);
      }

      context.drawImage(this.image, x, y, width, height, 0, 0, width, height);

      return buffer;
    });

    this.tiles.set(name, buffers);
  }

  defineTile(name: string, x: number, y: number) {
    this.define(
      name,
      x * this.tileWidth,
      y * this.tileHeight,
      this.tileWidth,
      this.tileHeight
    );
  }

  defineAnimation(name: string, animation: Animation) {
    this.animations.set(name, animation);
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

  drawTile(
    name: string,
    context: CanvasRenderingContext2D,
    x: number,
    y: number
  ) {
    this.draw(name, context, x * this.tileWidth, y * this.tileHeight);
  }

  drawAnimation(
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

  getAnimation(name: string) {
    const anim = this.animations.get(name);
    if (!anim) {
      throw new Error(`Animation not found: ${name}`);
    }
    return anim;
  }
}

const createOffscreenCanvasBuffer = (width: number, height: number) => {
  const buffer = document.createElement("canvas");
  buffer.width = width;
  buffer.height = height;
  return buffer;
};

const imageFromBuffer = (buffer: HTMLCanvasElement) => {
  const image = new Image();
  image.src = buffer.toDataURL();
  return image;
};

const createColorPalletSpriteSheet = (
  width: number,
  height: number,
  colorPallet = {
    red: "#ff0000",
    orange: "#ffa500",
    yellow: "#ffff00",
    green: "#008000",
    blue: "#0000ff",
    indigo: "#4b0082",
    violet: "#ee82ee",
    black: "#000000",
    white: "#ffffff",
  }
) => {
  //create a strip of colors
  const buffer = createOffscreenCanvasBuffer(
    width * Object.keys(colorPallet).length,
    height
  );

  const bufferImage = imageFromBuffer(buffer);

  const context = buffer.getContext("2d") || raise("Canvas not supported");

  const colors = Object.values(colorPallet);
  const keys = Object.keys(colorPallet);

  colors.forEach((color, index) => {
    context.fillStyle = color;
    context.fillRect(index * width, 0, width, height);
  });

  const spriteSheet = new SpriteSheet(bufferImage, width, height);

  keys.forEach((key, index) => {
    spriteSheet.defineTile(key, index, 0);
  });

  return spriteSheet;
};

export const rainbowSpriteSheet = createColorPalletSpriteSheet(16, 16);
