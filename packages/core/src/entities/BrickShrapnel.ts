import {Entity} from '../Entity';
import {LifeLimit} from '../traits/LifeLimit';
import {Gravity} from '../traits/Gravity';
import {Velocity} from '../traits/Velocity';
import {loadAudioBoard} from '../loaders/audio';
import {loadSpriteSheet} from '../loaders/sprite';
import { SpriteSheet } from '../SpriteSheet';
import { AudioBoard } from '../AudioBoard';

export async function loadBrickShrapnel(audioContext: AudioContext) {
    const [sprite, audio] = await Promise.all([
        loadSpriteSheet('brick-shrapnel'),
        loadAudioBoard('brick-shrapnel', audioContext),
    ]);
    return createFactory(sprite, audio);
}

function createFactory(sprite: SpriteSheet, audio: AudioBoard) {
    const spinBrick = sprite.animations.get('spinning-brick');
    
    if(spinBrick === undefined) {
        throw new Error('spinBrick is undefined');
    }

    function draw(this: Entity, context: CanvasRenderingContext2D) {
        //todo fix type assertion
        sprite.draw(spinBrick!(this.lifetime), context, 0, 0);
    }

    return function createBrickShrapnel() {
        const entity = new Entity();
        entity.audio = audio;
        entity.size.set(8, 8);
        entity.addTrait(new LifeLimit());
        entity.addTrait(new Gravity());
        entity.addTrait(new Velocity());
        entity.draw = draw;
        return entity;
    };
}
