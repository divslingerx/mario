import { Entity } from '../Entity.js';
import { GameContext } from '../GameContext.js';
import {Trait} from '../Trait.js';
import {Jump} from './Jump.js';

export  class Go extends Trait {
    public dir = 0;
    public acceleration = 400;
    public deceleration = 300;
    public dragFactor = 1/5000;
    public distance = 0;
    public heading = 1;



    update(entity: Entity, {deltaTime}: GameContext) {
        const absX = Math.abs(entity.vel.x);

        if (this.dir !== 0) {
            entity.vel.x += this.acceleration * deltaTime * this.dir;

            const jumpTrait = entity.getTrait<Jump>(Jump)

            if (jumpTrait) {
                if (jumpTrait.falling === false) {
                    this.heading = this.dir;
                }
            } else {
                this.heading = this.dir;
            }

        } else if (entity.vel.x !== 0) {
            const decel = Math.min(absX, this.deceleration * deltaTime);
            entity.vel.x += entity.vel.x > 0 ? -decel : decel;
        } else {
            this.distance = 0;
        }

        const drag = this.dragFactor * entity.vel.x * absX;
        entity.vel.x -= drag;

        this.distance += absX * deltaTime;
    }
}
