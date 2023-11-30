import {findPlayers} from "../player";
import {Player} from "../traits/Player";
import { Font } from "../loaders/font";
import { EntityCollection, Level } from "../Level";
import { Entity } from "../Entity";

function getPlayer(entities: EntityCollection) {
    for (const entity of findPlayers(entities)) {
        return entity;
    }
}

export function createPlayerProgressLayer(font: Font, level: Level) {
    const size = font.size;

    const spriteBuffer = document.createElement('canvas');
    spriteBuffer.width = 32;
    spriteBuffer.height = 32;
    const spriteBufferContext = spriteBuffer.getContext('2d') as CanvasRenderingContext2D;

    return function drawPlayerProgress(context: CanvasRenderingContext2D) {
        const entity = getPlayer(level.entities);
        const player = entity.traits.get(Player);
        font.print('WORLD ' + level.name, context, size * 12, size * 12);

        font.print('×' + player.lives.toString().padStart(3, ' '),
            context, size * 16, size * 16);

        spriteBufferContext.clearRect(0, 0,
            spriteBuffer.width, spriteBuffer.height);
        entity.draw(spriteBufferContext);
        context.drawImage(spriteBuffer, size * 13, size * 15);
    };
}
