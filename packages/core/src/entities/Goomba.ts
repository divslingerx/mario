import {Entity} from '../Entity';
import {Trait} from '../Trait';
import {Killable} from '../traits/Killable';
import {PendulumMove} from '../traits/PendulumMove';
import {Physics} from '../traits/Physics';
import {Solid} from '../traits/Solid';
import {Stomper} from '../traits/Stomper';
import {loadSpriteSheet} from '../loaders/sprite';
import { SpriteSheet } from '../SpriteSheet';

export async function loadGoombaBrown() {
    const sprite = await loadSpriteSheet('goomba-brown');
    return createGoombaFactory(sprite);
}

export async function loadGoombaBlue() {
    const sprite = await loadSpriteSheet('goomba-blue');
    return createGoombaFactory(sprite);
    }


class Behavior extends Trait {
    collides(us: Entity, them: Entity) {
        if (us.getTrait(Killable)?.dead) {
            return;
        }

        if (them.traits.has(Stomper)) {
            if (them.vel.y > us.vel.y) {
                us.getTrait(Killable)?.kill();
                const pendulumMove = us.getTrait(PendulumMove);
                if (pendulumMove) {
                    pendulumMove.speed = 0;
                }
               
            } else {
                them.getTrait(Killable)?.kill();
            }
        }
    }
}


function createGoombaFactory(sprite: SpriteSheet) {
    const walkAnim = sprite.animations.get('walk');

    function routeAnim(goomba: Entity) {
        if (goomba.getTrait(Killable)?.dead) {
            return 'flat';
        }

        if(!walkAnim) {
            console.warn('walkAnim Animation not found')
            return false
        }

        return walkAnim(goomba.lifetime);
    }

    function drawGoomba(this: Entity, context: CanvasRenderingContext2D) {
        //todo fix type assertion
        sprite.draw(routeAnim(this) as string, context, 0, 0);
    }

    return function createGoomba() {
        const goomba = new Entity();
        goomba.size.set(16, 16);

        goomba.addTrait(new Physics());
        goomba.addTrait(new Solid());
        goomba.addTrait(new PendulumMove());
        goomba.addTrait(new Behavior());
        goomba.addTrait(new Killable());

        goomba.draw = drawGoomba;

        return goomba;
    };
}
