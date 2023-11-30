import {Entity} from '../Entity';
import {Trait} from '../Trait';
import {Killable} from '../traits/Killable';
import {PendulumMove} from '../traits/PendulumMove';
import {Physics} from '../traits/Physics';
import {Solid} from '../traits/Solid';
import {Stomper} from '../traits/Stomper';
import {loadSpriteSheet} from '../loaders/sprite';
import { GameContext } from '../GameContext';
import { SpriteSheet } from '../SpriteSheet';

export async function loadKoopaGreen() {
    const sprite = await loadSpriteSheet('koopa-green');
    return createKoopaFactory(sprite);
}

export async function loadKoopaBlue() {
    const sprite = await loadSpriteSheet('koopa-blue');
    return createKoopaFactory(sprite);
    }


const STATE_WALKING = Symbol('walking');
const STATE_HIDING = Symbol('hiding');
const STATE_PANIC = Symbol('panic');

class Behavior extends Trait {
    public hideTime = 0
    public hideDuration = 5
    public walkSpeed = 0
    public panicSpeed = 300
    public state: symbol | null = null


    collides(us: Entity, them: Entity) {
        if (us.getTrait(Killable)?.dead) {
            return;
        }

        if (them.traits.has(Stomper)) {
            if (them.vel.y > us.vel.y) {
                this.handleStomp(us, them);
            } else {
                this.handleNudge(us, them);
            }
        }
    }

    handleNudge(us: Entity, them: Entity) {
        if (this.state === STATE_WALKING) {
            them.getTrait(Killable)?.kill();
        } else if (this.state === STATE_HIDING) {
            this.panic(us, them);
        } else if (this.state === STATE_PANIC) {
            const travelDir = Math.sign(us.vel.x);
            const impactDir = Math.sign(us.pos.x - them.pos.x);
            if (travelDir !== 0 && travelDir !== impactDir) {
                them.getTrait(Killable)?.kill();
            }
        }
    }

    handleStomp(us: Entity, them: Entity) {
        if (this.state === STATE_WALKING) {
            this.hide(us);
        } else if (this.state === STATE_HIDING) {
            us.getTrait(Killable)?.kill();
            us.vel.set(100, -200);
            const solidTrait = us.getTrait(Solid);
            if (solidTrait) {
                solidTrait.obstructs = false;
            }
           
        } else if (this.state === STATE_PANIC) {
            this.hide(us);
        }
    }

    hide(us: Entity) {
        us.vel.x = 0;
        const PendulumMoveTrait = us.getTrait(PendulumMove);
        if (!PendulumMoveTrait) {
           return 
        }

        PendulumMoveTrait.enabled = false;
        
        if (this.walkSpeed === null) {
            this.walkSpeed = PendulumMoveTrait.speed;
        }
        this.hideTime = 0;
        this.state = STATE_HIDING
    }

    unhide(us: Entity) {
        const PendulumMoveTrait = us.getTrait(PendulumMove);
        if (!PendulumMoveTrait) {
           return 
        }

        PendulumMoveTrait.enabled = true;
        PendulumMoveTrait.speed = this.walkSpeed;
        this.state = STATE_WALKING;
    }

    panic(us: Entity, them: Entity) {
        const PendulumMoveTrait = us.getTrait(PendulumMove);
        if (!PendulumMoveTrait) {
           return 
        }
        PendulumMoveTrait.enabled = true;
        PendulumMoveTrait.speed = this.panicSpeed * Math.sign(them.vel.x);
        this.state = STATE_PANIC;
    }

    update(us: Entity, gameContext: GameContext) {
        const deltaTime = gameContext.deltaTime;
        if (this.state === STATE_HIDING) {
            this.hideTime += deltaTime;
            if (this.hideTime > this.hideDuration) {
                this.unhide(us);
            }
        }
    }
}


function createKoopaFactory(sprite: SpriteSheet) {
    const walkAnim = sprite.animations.get('walk');
    const wakeAnim = sprite.animations.get('wake');

    if(!walkAnim || !wakeAnim) {
        throw new Error('Animation not found for koopa');
    }

    function routeAnim(koopa: Entity) {
        const koopaBehavior = koopa.traits.get(Behavior) as Behavior;
        if (koopaBehavior === undefined) {
            console.warn('koopaBehavior is undefined');
            return null;
        }

        if (koopaBehavior.state === STATE_HIDING) {
            if (koopaBehavior.hideTime > 3 && wakeAnim) {
                return wakeAnim(koopaBehavior.hideTime);
            }
            return 'hiding';
        }

        if (koopa.getTrait(Behavior)?.state === STATE_PANIC) {
            return 'hiding';
        }

        return walkAnim && walkAnim(koopa.lifetime);
    }

    function drawKoopa(this: Entity, context: CanvasRenderingContext2D) {
        //todo fix type assertion
        sprite.draw(routeAnim(this) as string, context, 0, 0, this.vel.x < 0);
    }

    return function createKoopa() {
        const koopa = new Entity();
        koopa.size.set(16, 16);
        koopa.offset.y = 8;

        koopa.addTrait(new Physics());
        koopa.addTrait(new Solid());
        koopa.addTrait(new PendulumMove());
        koopa.addTrait(new Killable());
        koopa.addTrait(new Behavior());

        koopa.draw = drawKoopa;

        return koopa;
    };
}
