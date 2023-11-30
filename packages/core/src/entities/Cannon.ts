import {Entity} from '../Entity';
import {Emitter} from '../traits/Emitter';
import {findPlayers} from '../player';
import {loadAudioBoard} from '../loaders/audio';
import { AudioBoard } from '../AudioBoard';
import { GameContext } from '../GameContext';
import { Level } from '../Level';

const HOLD_FIRE_THRESHOLD = 30;

export async function loadCannon(audioContext: AudioContext) {
    const audio = await loadAudioBoard('cannon', audioContext);
    return createCannonFactory(audio);
}

function createCannonFactory(audio: AudioBoard) {

    function emitBullet(cannon: Entity, gameContext: GameContext, level: Level) {
        let dir = 1;
        for (const player of findPlayers(level.entities)) {
            if (player.pos.x > cannon.pos.x - HOLD_FIRE_THRESHOLD
            && player.pos.x < cannon.pos.x + HOLD_FIRE_THRESHOLD) {
                return;
            }

            if (player.pos.x < cannon.pos.x) {
                dir = -1;
            }
        }

        if(!gameContext.entityFactory.bullet) throw new Error('gameContext.entityFactory.bullet is undefined')
        const bullet =  gameContext.entityFactory.bullet();

        bullet.pos.copy(cannon.pos);
        bullet.vel.set(80 * dir, 0);

        cannon.sounds.add('shoot');
        level.entities.add(bullet);
    }

    return function createCannon() {
        const cannon = new Entity();
        cannon.audio = audio;

        const emitter = new Emitter();
        emitter.interval = 4;
        emitter.emitters.push(emitBullet);
        cannon.addTrait(emitter);
        return cannon;
    }
}
