import {Entity} from '../Entity';
import {Trait} from '../Trait.js';
import {Killable} from '../traits/Killable';
import {Gravity} from '../traits/Gravity';
import {Stomper} from '../traits/Stomper';
import {Velocity} from '../traits/Velocity';
import {loadSpriteSheet} from '../loaders/sprite';
import { GameContext } from '../GameContext';
import { Level } from '../Level';
import {SpriteSheet} from '../SpriteSheet';

export async function loadBullet() {
    const sprite = await loadSpriteSheet('bullet');
    return createBulletFactory(sprite);
}


class Behavior extends Trait {
    gravity = new Gravity()
 

    collides(us: Entity, them: Entity) {
        if (us.getTrait(Killable)?.dead) {
            return;
        }

        console.log('Collision in Bullet', them.vel.y);
        if (them.traits.has(Stomper)) {
            if (them.vel.y > us.vel.y) {
                us.getTrait(Killable)?.kill();
                us.vel.set(100, -200);
            } else {
                them.getTrait(Killable)?.kill();
            }
        }
    }

    update(entity: Entity, gameContext: GameContext, level: Level) {
        if (entity.getTrait(Killable)?.dead) {
            this.gravity.update(entity, gameContext, level);
        }
    }
}


function createBulletFactory(sprite: SpriteSheet) {
    function drawBullet(this: any, context: CanvasRenderingContext2D) {
        sprite.draw('bullet', context, 0, 0, this.vel.x > 0);
    }

    return function createBullet() {
        const bullet = new Entity();
        bullet.size.set(16, 14);

        bullet.addTrait(new Velocity());
        bullet.addTrait(new Behavior());
        bullet.addTrait(new Killable());

        bullet.draw = drawBullet;

        return bullet;
    };
}
