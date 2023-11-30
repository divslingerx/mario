import { Entity } from '../Entity.js';
import { GameContext } from '../GameContext.js';
import { Level } from '../Level.js';
import {Trait} from '../Trait.js';

export  class Physics extends Trait {
    update(entity: Entity, gameContext: GameContext, level: Level) {
        const {deltaTime} = gameContext;
        entity.pos.x += entity.vel.x * deltaTime;
        level.tileCollider.checkX(entity, gameContext, level);

        entity.pos.y += entity.vel.y * deltaTime;
        level.tileCollider.checkY(entity, gameContext, level);

        entity.vel.y += level.gravity * deltaTime;
    }
}
