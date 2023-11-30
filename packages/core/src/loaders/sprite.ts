import { loadJSON, loadImage } from "../loaders";
import {SpriteSheet} from "../SpriteSheet";
import { createAnim } from "../anim";
import {SpriteSheetSpec} from '../types';



export const loadSpriteSheet = async (name: string) => {
  const specSheet = await loadJSON<SpriteSheetSpec>(`/sprites/${name}.json`);
  const image = await loadImage(specSheet.imageURL);
  const sprites = new SpriteSheet(image, specSheet.tileW, specSheet.tileH);

  if (specSheet.tiles) {
    specSheet.tiles.forEach((tileSpec) => {
      sprites.defineTile(tileSpec.name, tileSpec.index[0], tileSpec.index[1]);
    });
  }

  if (specSheet.frames) {
    specSheet.frames.forEach((frameSpec) => {
      sprites.define(frameSpec.name, ...frameSpec.rect);
    });
  }

  if (specSheet.animations) {
    specSheet.animations.forEach((animSpec) => {
      const animation = createAnim(animSpec.frames, animSpec.frameLen);
      sprites.defineAnim(animSpec.name, animation);
    });
  }

  return sprites;
};
