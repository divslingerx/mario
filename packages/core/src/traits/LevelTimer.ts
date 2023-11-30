import { Camera } from "../Camera";
import { Entity } from "../Entity";
import EntityCollider from "../EntityCollider";
import { GameContext } from "../GameContext";
import { EntityCollection, Level } from "../Level";
import MusicController from "../MusicController";
import { Scene } from "../Scene";
import TileCollider from "../TileCollider";
import { Trait } from "../Trait";

const MARK = Symbol("level timer earmark");

export default class LevelTimer extends Trait {
  static EVENT_TIMER_HURRY = Symbol("timer hurry");
  static EVENT_TIMER_OK = Symbol("timer ok");

  totalTime = 300;
  currentTime = this.totalTime;
  hurryTime = 100;
  hurryEmitted?: boolean | null;

  constructor() {
    super();
    this.totalTime = 400;
    this.currentTime = this.totalTime;
    this.hurryTime = 100;
    this.hurryEmitted = null;
  }

  reset() {
    this.currentTime = this.totalTime;
  }

  update(entity: Entity, { deltaTime }: GameContext, level: Level) {
    this.currentTime -= deltaTime * 2.5;

    // if (!level[MARK]) {
    //   this.hurryEmitted = null;
    // }

    if (this.hurryEmitted !== true && this.currentTime < this.hurryTime) {
      level.events.emit(LevelTimer.EVENT_TIMER_HURRY);
      this.hurryEmitted = true;
    }
    if (this.hurryEmitted !== false && this.currentTime > this.hurryTime) {
      level.events.emit(LevelTimer.EVENT_TIMER_OK);
      this.hurryEmitted = false;
    }

    // level[MARK] = true;
  }
}




