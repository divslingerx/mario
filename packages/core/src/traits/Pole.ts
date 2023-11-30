import { Vec2, Direction } from '../math.js';
import { Sides, Align, Entity } from '../Entity.js';
import {Trait} from '../Trait.js';
import {PoleTraveller} from './PoleTraveller';
import { GameContext } from '../GameContext.js';
import { Level } from '../Level.js';

function createTravellerState() {
    return {
        current: new Vec2(0,0),
        goal: new Vec2(0,0),
        done: false,
    };
}

export class Pole extends Trait {
    public velocity = 100;
    public travellers = new Map();
    

    addTraveller(pole: Entity, traveller: Entity) {
        pole.sounds.add('ride');

        const poleTraveller = traveller.getTrait<PoleTraveller>(PoleTraveller);
        if(!poleTraveller) {
            return;
        }
        poleTraveller.distance = 0;

        const state = createTravellerState();
        state.current.x = pole.bounds.meridian;
        state.current.y = traveller.bounds.bottom;
        state.goal.x = state.current.x;
        state.goal.y = pole.bounds.bottom;
        this.travellers.set(traveller, state);
    }

    collides(pole: Entity, traveller: Entity) {
        if (!traveller.traits.has(PoleTraveller)) {
            return;
        }

        if (this.travellers.has(traveller)) {
            return;
        }

        this.addTraveller(pole, traveller);
    }

    update(pole:Entity, gameContext: GameContext, level: Level) {
        const {deltaTime} = gameContext;
        const distance = this.velocity * deltaTime;
        for (const [traveller, state] of this.travellers.entries()) {
            if (!state.done) {
                state.current.y += distance;
                traveller.bounds.right = state.current.x;
                traveller.bounds.bottom = state.current.y;

                const poleTraveller = traveller.traits.get(PoleTraveller);
                poleTraveller.distance += distance;

                if (traveller.bounds.bottom > state.goal.y) {
                    state.done = true;
                    traveller.bounds.bottom = state.goal.y;
                    poleTraveller.distance = 0;
                }
            } else if (!pole.bounds.overlaps(traveller.bounds)) {
                this.travellers.delete(traveller);
            }
        }
    }
}
