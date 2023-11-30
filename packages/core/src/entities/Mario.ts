import {Entity} from '../Entity';
import {Go} from '../traits/Go';
import {Jump} from '../traits/Jump';
import {Killable} from '../traits/Killable';
import {Physics} from '../traits/Physics';
import {PipeTraveller} from '../traits/PipeTraveller';
import {PoleTraveller} from '../traits/PoleTraveller';
import {Solid} from '../traits/Solid';
import {Stomper} from '../traits/Stomper';
import {loadAudioBoard} from '../loaders/audio';
import {loadSpriteSheet} from '../loaders/sprite';
import {SpriteSheet} from '../SpriteSheet';
import { AudioBoard } from '../AudioBoard';
import { TurboRun } from '../traits/TurboRun';



export async function loadMario(audioContext: AudioContext) {
    const [sprite, audio] = await Promise.all([
        loadSpriteSheet('mario'),
        loadAudioBoard('mario', audioContext),
    ]);
    return createMarioFactory(sprite, audio);
}

function createMarioFactory(sprite: SpriteSheet, audio: AudioBoard) {
    const runAnim = sprite.animations.get('run');
    const climbAnim = sprite.animations.get('climb');

    if(!runAnim || !climbAnim) throw new Error('Animation not found');

    function getHeading(mario: Entity) {
        const poleTraveller = mario.getTrait(PoleTraveller);
        const goTrait = mario.getTrait(Go);

        if (poleTraveller?.distance) {
            return false;
        }
        return goTrait && goTrait.heading < 0;
    }

    function routeFrame(mario: Entity) {
        const pipeTraveller = mario.getTrait(PipeTraveller);
        const poleTraveller = mario.getTrait(PoleTraveller);

        if(!pipeTraveller) return 

        if (pipeTraveller.movement.x != 0) {
            if(!runAnim) throw new Error('runAnim not found');
            return runAnim(pipeTraveller.distance.x * 2);
        }
        if (pipeTraveller.movement.y != 0) {
            return 'idle';
        }

        
        if (poleTraveller?.distance) {
            
            return climbAnim && climbAnim(poleTraveller.distance);
        }

        const jumpTrait = mario.getTrait(Jump);
        if(!jumpTrait) throw new Error('Go trait is undefined');
        if (jumpTrait.falling) {
            return 'jump';
        }

        const goTrait = mario.getTrait(Go);
        if(!goTrait) throw new Error('Go trait is undefined');

        if (goTrait.distance > 0) {
            if ((mario.vel.x > 0 && goTrait.dir < 0) || (mario.vel.x < 0 && goTrait.dir > 0)) {
                return 'break';
            }

            if (!runAnim) throw new Error('runAnim not found');
            
            return runAnim(goTrait.distance);
        }

        return 'idle';
    }

    

    function drawMario(this: Entity, context: CanvasRenderingContext2D) {
        // todo fix type assertion
        sprite.draw(routeFrame(this) as string, context, 0, 0, getHeading(this));
    }

    return function createMario() {
        const mario = new Entity();
        mario.audio = audio;
        mario.size.set(14, 16);

        mario.addTrait(new Physics());
        mario.addTrait(new Solid());
        mario.addTrait(new Go());
        mario.addTrait(new TurboRun())
        mario.addTrait(new Jump());
        mario.addTrait(new Killable());
        mario.addTrait(new Stomper());
        mario.addTrait(new PipeTraveller());
        mario.addTrait(new PoleTraveller());

        const KillableTrait = mario.getTrait(Killable);
        const jumpTrait = mario.getTrait(Jump);
        if(KillableTrait === undefined) throw new Error('Killable trait is undefined');
        if(jumpTrait === undefined) throw new Error('Jump trait is undefined');


        KillableTrait.removeAfter = Infinity;
        jumpTrait.velocity = 175;

        mario.draw = drawMario;

        return mario;
    }
}
