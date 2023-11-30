import {Entity} from '../Entity';
import { GameContext } from '../GameContext';
import { Level } from '../Level';
import { SpriteSheet } from '../SpriteSheet';
import {Trait} from '../Trait';
import {loadSpriteSheet} from '../loaders/sprite';
import {findPlayers} from '../player';

export async function loadPiranhaPlant() {
    const sprite = await loadSpriteSheet('piranha-plant');
    return createPiranhaPlantFactory(sprite);
}

class Behavior extends Trait {
    public graceDistance = 32;
    public idleTime = 4;
    public idleCounter: number | null = 0;
    public attackTime = 2;
    public attackCounter: number | null = null;
    public holdTime = 2;
    public holdCounter: number | null = null;
    public retreatTime = 2;
    public retreatCounter: number | null = null;
    public velocity = 30;
    public deltaMove = 0;

  

    update(entity: Entity, gameContext: GameContext, level: Level) {
        const {deltaTime} = gameContext;

        if (this.idleCounter !== null) {
            for (const player of findPlayers(level.entities)) {
                const distance = player.bounds.getCenter().distance(entity.bounds.getCenter());
                if (distance < this.graceDistance) {
                    this.idleCounter = 0;
                    return;
                }
            }

            this.idleCounter += deltaTime;
            if (this.idleCounter >= this.idleTime) {
                this.attackCounter = 0;
                this.idleCounter = null;
            }
        }
        else if (this.attackCounter !== null) {
            this.attackCounter += deltaTime;
            const movement = this.velocity * deltaTime;
            this.deltaMove += movement;
            entity.pos.y -= movement;
            if (this.deltaMove >= entity.size.y) {
                entity.pos.y += entity.size.y - this.deltaMove;
                this.attackCounter = null;
                this.holdCounter = 0;
            }
        }
        else if (this.holdCounter !== null) {
            this.holdCounter += deltaTime;
            if (this.holdCounter >= this.holdTime) {
                this.retreatCounter = 0;
                this.holdCounter = null;
            }
        }
        else if (this.retreatCounter !== null) {
            this.retreatCounter += deltaTime;
            const movement = this.velocity * deltaTime;
            this.deltaMove -= movement;
            entity.pos.y += movement;
            if (this.deltaMove <= 0) {
                entity.pos.y -= this.deltaMove;
                this.retreatCounter = null;
                this.idleCounter = 0;
            }
        }
    }
}


function createPiranhaPlantFactory(sprite: SpriteSheet) {
    const chewAnim = sprite.animations.get('chew');

    if(chewAnim === undefined) {
        throw new Error(('chew anim is not defined')) 
    }

    function routeAnim(entity:Entity) {
        if(chewAnim === undefined) {
            console.warn('chew anim is not defined')
            return null;  
        }
        return chewAnim(entity.lifetime);
    }

    function drawPiranhaPlant(this: Entity, context: CanvasRenderingContext2D) {
        sprite.draw(routeAnim(this) as string, context, 0, 0);
    }

    return function createPiranhaPlant() {
        const entity = new Entity();
        entity.size.set(16, 24);

        entity.addTrait(new Behavior());

        entity.draw = drawPiranhaPlant;

        return entity;
    };
}
