import { Entity } from '../Entity';
import { GameContext } from '../GameContext';
import {Trait} from '../Trait';
import { Go } from './Go';
import {Jump} from './Jump';

export  class TurboRun extends Trait {
    public isTurbo = false;
    private readonly SLOW_DRAG = 1/1000;
    private readonly  FAST_DRAG = 1/5000;

    

    update(entity: Entity, {deltaTime}: GameContext) {
        const goTrait = entity.getTrait(Go);
        if(goTrait === undefined) throw new Error('Go trait is undefined');
        goTrait.dragFactor = this.isTurbo ? this.FAST_DRAG : this.SLOW_DRAG;
    }
}
