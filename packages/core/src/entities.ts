import {loadMario} from './entities/Mario.js';
import {loadGoombaBrown, loadGoombaBlue} from './entities/Goomba.js';
import {loadKoopaGreen, loadKoopaBlue} from './entities/Koopa';
import {loadPiranhaPlant} from './entities/PiranhaPlant';
import {loadBullet} from './entities/Bullet';
import {loadCannon} from './entities/Cannon';
import {loadBrickShrapnel} from './entities/BrickShrapnel';
import {loadPipePortal} from './entities/PipePortal';
import {loadFlagPole} from './entities/FlagPole';
import { Entity } from './Entity';
import { Dict } from './types.js';

export type EntityFactory<T extends Entity = Entity> = (props?: any) => T;

export type EntityFactoryDict = {
    [K: string]: EntityFactory<Entity>;
  };

function createPool(size: number) {
    const pool: any[] = [];

    return function createPooledFactory(factory: EntityFactory<Entity>) {
        for (let i = 0; i < size; i++) {
            pool.push(factory());
        }

        let count = 0;
        return function pooledFactory() {
            const entity = pool[count++ % pool.length];
            entity.lifetime = 0;
            return entity;
        }
    }
}




export async function loadEntities(audioContext: AudioContext): Promise<EntityFactoryDict> {
    const entityFactories: EntityFactoryDict  = {};

  

    function setup(
        loader: (audioContext: AudioContext) => Promise<EntityFactory> | Promise<() => Entity>
      ): Promise<EntityFactory> | Promise<() => Entity> {
        return loader(audioContext);
      }

      const addAs = (name: string) => (factory: EntityFactory) => {
        entityFactories[name] = factory;
      };

    await Promise.all([
        setup(loadMario)
            .then(addAs('mario')),
        setup(loadPiranhaPlant)
            .then(addAs('piranha-plant')),
        setup(loadGoombaBrown)
            .then(addAs('goomba-brown')),
        setup(loadGoombaBlue)
            .then(addAs('goomba-blue')),
        setup(loadKoopaGreen)
            .then(addAs('koopa-green')),
        setup(loadKoopaBlue)
            .then(addAs('koopa-blue')),
        setup(loadBullet)
            .then(addAs('bullet')),
        setup(loadCannon)
            .then(addAs('cannon')),
        setup(loadPipePortal)
            .then(addAs('pipe-portal')),
        setup(loadFlagPole)
            .then(addAs('flag-pole')),
        setup(loadBrickShrapnel)
            .then(createPool(8))
            .then(addAs('brickShrapnel')),
    ]);

    return entityFactories;
}
