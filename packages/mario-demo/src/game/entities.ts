import { loadBullet } from "./entities/Bullet";
import { loadCannon } from "./entities/Cannon";
import { loadGoombaBlue, loadGoombaBrown } from "./entities/Goomba";
import { loadKoopa, loadKoopaBlue, loadKoopaGreen } from "./entities/Koopa";
import { loadMario } from "./entities/Mario";
import { Entity } from "./Entity";
import { Dict } from "./types";
import { loadPipePortal } from "./entities/PipePortal";
import { loadPiranhaPlant } from "./entities/PiranhaPlant";
import { loadFlagPole } from "./entities/FlagPole";
import { loadBrickShrapnel } from "./entities/BrickShrapnel";

// todo make this a generic somehow
export type EntityFactory = (props?: unknown) => Entity;

export type EntityFactoryDict = Dict<EntityFactory>;

function createPool(size: number) {
  const pool: Entity[] = [];

  return function createPooledFactory(factory: EntityFactory) {
    for (let i = 0; i < size; i++) {
      pool.push(factory());
    }

    let count = 0;
    return function pooledFactory() {
      const entity = pool[count++ % pool.length];
      entity.lifetime = 0;
      return entity;
    };
  };
}

export async function loadEntities(
  audioContext: AudioContext
): Promise<EntityFactoryDict> {
  const factories: EntityFactoryDict = {};

  type loaderFunc = (audioCtx: AudioContext) => Promise<EntityFactory>;

  function setup(loader: loaderFunc): Promise<EntityFactory> {
    return loader(audioContext);
  }

  const addAs = (name: string) => (factory: EntityFactory) => {
    factories[name] = factory;
  };

  await Promise.all([
    loadMario(audioContext).then(addAs("mario")),

    loadGoombaBlue().then(addAs("goomba-blue")),
    loadGoombaBrown().then(addAs("goomba-brown")),
    loadKoopa().then(addAs("koopa")),
    loadBullet().then(addAs("bullet")),
    loadCannon(audioContext).then(addAs("cannon")),
    loadKoopaGreen().then(addAs("koopa-green")),
    loadKoopaBlue().then(addAs("koopa-blue")),
    loadPiranhaPlant().then(addAs("piranha-plant")),
    // loadPipePortal(audioContext).then(addAs("pipe-portal")),
    loadFlagPole(audioContext).then(addAs("flag-pole")),
    loadBrickShrapnel(audioContext)
      .then(createPool(8))
      .then(addAs("brickShrapnel")),
  ]);

  return factories;
}
