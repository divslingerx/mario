import { Camera } from '../Camera.js';
import { Level } from '../Level.js';
import { SpriteSheet } from '../SpriteSheet.js';
import {TileResolver, TileResolverMatrix} from '../TileResolver.js';
import { createCanvas } from '../utils/helpers/createCanvasGetCtx.js';

export function createBackgroundLayer(level: Level, tiles: TileResolverMatrix, sprites: SpriteSheet) {
    const resolver = new TileResolver(tiles);

    const [buffer, context] = createCanvas(256 + 16, 240);

    

    function redraw(startIndex: number, endIndex: number)  {
        context.clearRect(0, 0, buffer.width, buffer.height);

        for (let x = startIndex; x <= endIndex; ++x) {
            const col = tiles.grid[x];
            if (col) {
                col.forEach((tile, y) => {
                    if (sprites.animations.has(tile.style)) {
                        sprites.drawAnim(tile.style, context, x - startIndex, y, level.totalTime);
                    } else {
                        sprites.drawTile(tile.style, context, x - startIndex, y);
                    }
                });
            }
        }
    }

    return function drawBackgroundLayer(context: CanvasRenderingContext2D, camera: Camera) {
        const drawWidth = resolver.toIndex(camera.size.x);
        const drawFrom = resolver.toIndex(camera.pos.x);
        const drawTo = drawFrom + drawWidth;
        redraw(drawFrom, drawTo);

        context.drawImage(buffer,
            Math.floor(-camera.pos.x % 16),
            Math.floor(-camera.pos.y));
    };
}
