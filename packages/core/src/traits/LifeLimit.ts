import { Entity } from '../Entity.js';
import { GameContext } from '../GameContext.js';
import { Level } from '../Level.js';
import {Trait} from '../Trait.js';

export  class LifeLimit extends Trait {
    public time = 2
   

    update(entity: Entity, context: GameContext, level: Level) {
        if (entity.lifetime > this.time) {
            this.queue(() => {
                level.entities.delete(entity);
            });
        }
    }
}
