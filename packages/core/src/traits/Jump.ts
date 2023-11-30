import {Entity, Side, Sides} from '../Entity';
import { GameContext } from '../GameContext';
import { Level } from '../Level';
import {Trait} from '../Trait';

export  class Jump extends Trait {
    public ready = 0
    public duration = 0.3
    public engageTime = 0
    public requestTime = 0
    public gracePeriod = 0.1
    public speedBoost = 0.3
    public velocity = 200

 
    get falling() {
        return this.ready < 0;
    }

    start() {
        this.requestTime = this.gracePeriod;
    }

    cancel() {
        this.engageTime = 0;
        this.requestTime = 0;
    }

    obstruct(entity: Entity, side: Side) {
        if (side === Side.bottom) {
            this.ready = 1;
        } else if (side === Side.top) {
            this.cancel();
        }
    }

    update(entity: Entity, {deltaTime}: GameContext, level: Level) {
        if (this.requestTime > 0) {
            if (this.ready > 0) {
                entity.sounds.add('jump');
                this.engageTime = this.duration;
                this.requestTime = 0;
            }

            this.requestTime -= deltaTime;
        }

        if (this.engageTime > 0) {
            entity.vel.y = -(this.velocity + Math.abs(entity.vel.x) * this.speedBoost);
            this.engageTime -= deltaTime;
        }

        this.ready--;
    }
}
