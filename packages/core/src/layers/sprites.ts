import { Camera } from "../Camera";
import { Entity } from "../Entity";

export function createSpriteLayer(
  entities: Set<Entity>,
  width = 64,
  height = 64
) {
  const [spriteBuffer, spriteBufferContext] = createCanvasAndContext(
    width,
    height
  );

  return function drawSpriteLayer(
    context: CanvasRenderingContext2D,
    camera: Camera
  ) {
    entities.forEach((entity) => {
      if (!entity.draw) {
        return;
      }

      spriteBufferContext.clearRect(0, 0, width, height);

      entity.draw(spriteBufferContext);

      context.drawImage(
        spriteBuffer,
        Math.floor(entity.pos.x - camera.pos.x),
        Math.floor(entity.pos.y - camera.pos.y)
      );
    });
  };
}
function createCanvasAndContext(width: number, height: number): [any, any] {
  throw new Error("Function not implemented.");
}
