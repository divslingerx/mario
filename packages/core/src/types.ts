export type Dict<T> = { [_ in string]?: T };
export type TileRange = number[];
export type RectRange = [number, number, number, number];

export type FrameSpec = {
  name: string;
  rect: [number, number, number, number];
};

export interface PatternSpecItem {
  style: string;
  behavior: string;
  ranges: RectRange[];
}
export interface PatternSpec {
  [key: string]: PatternSpecItem[];
}

export type AnimationSpec = {
  name: string;
  frameLen: number;
  frames: Array<string>;
};

export type TileSpec = {
  name: string;
  index: [number, number];
};

export interface SpriteSheetSpec {
  imageURL: string;
  tileW: number;
  tileH: number;
  tiles: TileSpec[];
  frames: FrameSpec[];
  animations: AnimationSpec[];
}

export interface MusicSpec {
  [key: string]: {
    url: string;
  };
}

export type LevelSpecTile = {
  type: string;
  name?: string;
  pattern?: string;
  ranges: TileRange[];
  style: string;
};

export type CheckpointSpec = [number, number];

export type LevelSpec = {
  spriteSheet: string;
  musicSheet: string;
  patternSheet: string;
  patterns: LevelSpecPatterns;
  layers: LevelSpecLayer[];
  entities: LevelSpecEntity[];
  triggers?: LevelSpecTrigger[];
  checkpoints?: CheckpointSpec[];
};

export type LevelSpecPatterns = {
  [name: string]: {
    tiles: LevelSpecTile[];
  };
};

export type LevelSpecLayer = {
  tiles: LevelSpecTile[];
};

export type LevelSpecEntity = {
  id: string;
  name: string;
  pos: [number, number];
  props?: Dict<any>;
};

export type LevelSpecTrigger = {
  type: string;
  name: string;
  pos: [number, number];
};

export type Range = [number, number, number?, number?];

export interface SoundSpec {
  fx: {
    [key: string]: {
      url: string;
    };
  };
}
