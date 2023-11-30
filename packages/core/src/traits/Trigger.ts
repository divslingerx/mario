import { Entity } from '../Entity';
import { GameContext } from '../GameContext';
import { Level } from '../Level';
import {Trait} from '../Trait';

type TriggerCondition = (
    entity: Entity,
    touches: Set<Entity>,
    gameContext: GameContext,
    level: Level,
  ) => void
  

export  class Trigger extends Trait {
    public touches: Set<any>;
    public conditions: any[];
    constructor() {
        super();
        this.touches = new Set();
        this.conditions = [];
    }

    collides(_: Entity, them: Entity) {
        this.touches.add(them);
    }

    update(entity: Entity, gameContext: GameContext, level: Level) {
        if (this.touches.size > 0) {
            for (const condition of this.conditions) {
                condition(entity, this.touches, gameContext, level);
            }
            this.touches.clear();
        }
    }
}
