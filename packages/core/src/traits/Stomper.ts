import { Entity } from '../Entity';
import {Trait} from '../Trait';
import {Killable} from './Killable';

export  class Stomper extends Trait {
    static EVENT_STOMP = Symbol('stomp');

    public bounceSpeed = 400;
   

    bounce(us: Entity, them: Entity) {
        us.bounds.bottom = them.bounds.top;
        us.vel.y = -this.bounceSpeed;
    }

    collides(us: Entity, them: Entity) {
        if (!them.traits.has(Killable) || them.getTrait<Killable>(Killable)?.dead) {
            return;
        }

        if (us.vel.y > them.vel.y) {
            this.queue(() => this.bounce(us, them));
            us.sounds.add('stomp');
            us.events.emit(Stomper.EVENT_STOMP, us, them);
        }
    }
}
