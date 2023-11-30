import { Entity } from '../Entity';
import { GameContext } from '../GameContext';
import { Level } from '../Level';
import {Trait} from '../Trait';

type EmitterFn = (
    entity: Entity,
    gameContext: GameContext,
    level: Level,
  ) => void

export  class Emitter extends Trait {
    public interval = 2;
    public coolDown = this.interval;
    public emitters: EmitterFn[] = [];

    constructor() {
        super();
        this.interval = 2;
        this.coolDown = this.interval;
        this.emitters = [];
    }

    emit(entity: Entity, gameContext: GameContext, level: Level) {
        for (const emitter of this.emitters) {
            emitter(entity, gameContext, level);
        }
    }

    update(entity: Entity, gameContext: GameContext, level: Level) {
        const {deltaTime} = gameContext;
        this.coolDown -= deltaTime;
        if (this.coolDown <= 0) {
            this.emit(entity, gameContext, level);
            this.coolDown = this.interval;
        }
    }
}
