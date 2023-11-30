import {Camera} from "./Camera.js";
import MusicController from "./MusicController.js";
import EntityCollider from "./EntityCollider.js";
import {Scene} from "./Scene.js";
import TileCollider from "./TileCollider.js";
import { clamp } from "./math.js";
import { findPlayers } from "./player.js";
import { GameContext } from "./GameContext.js";

function focusPlayer(level: Level) {
  for (const player of findPlayers(level.entities)) {
    level.camera.pos.x = clamp(
      player.pos.x - 100,
      level.camera.min.x,
      level.camera.max.x - level.camera.size.x
    );
  }
}

export class EntityCollection extends Set {
  get(id: string) {
    for (const entity of this) {
      if (entity.id === id) {
        return entity;
      }
    }
  }
}

export class Level extends Scene {
  static EVENT_TRIGGER = Symbol("trigger");
  static EVENT_COMPLETE = Symbol("complete");

  name: string;
    checkpoints: any[];
    gravity: number;
    totalTime: number;
    camera: Camera;
    music: MusicController;
    entities: EntityCollection;
    entityCollider: EntityCollider;
    tileCollider: TileCollider;
  

  constructor() {
    super();

    this.name = "";

    this.checkpoints = [];

    this.gravity = 1500;
    this.totalTime = 0;

    this.camera = new Camera();

    this.music = new MusicController();

    this.entities = new EntityCollection();

    this.entityCollider = new EntityCollider(this.entities);
    this.tileCollider = new TileCollider();
  }

  draw(gameContext: GameContext) {
    this.comp.draw(gameContext.videoContext, this.camera);
  }

  update(gameContext: GameContext) {
    this.entities.forEach((entity) => {
      entity.update(gameContext, this);
    });

    this.entities.forEach((entity) => {
      this.entityCollider.check(entity);
    });

    this.entities.forEach((entity) => {
      entity.finalize();
    });

    focusPlayer(this);

    this.totalTime += gameContext.deltaTime;
  }

  pause() {
    this.music.pause();
  }
}
