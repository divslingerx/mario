import { Entity } from '../Entity';
import { GameContext } from '../GameContext';
import { Level } from '../Level';
import {Trait} from '../Trait';

export  class Velocity extends Trait {
    update(entity: Entity, {deltaTime}: GameContext, level: Level) {
        entity.pos.x += entity.vel.x * deltaTime;
        entity.pos.y += entity.vel.y * deltaTime;
    }
}
