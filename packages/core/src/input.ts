import Keyboard from "./KeyboardState.js";
import { InputRouter } from "./InputRouter.js";
import { Jump } from "./traits/Jump.js";
import { PipeTraveller } from "./traits/PipeTraveller";
import { Go } from "./traits/Go.js";
import type { Entity } from "./Entity.js";
import { TurboRun } from "./traits/TurboRun.js";

const KEYMAP = {
  UP: "KeyW",
  DOWN: "KeyS",
  LEFT: "KeyA",
  RIGHT: "KeyD",
  A: "KeyP",
  B: "KeyO",
};

export function setupKeyboard(window: Window) {
  const input = new Keyboard();
  const router = new InputRouter();

  input.listenTo(window);

  input.addMapping(KEYMAP.A, (keyState) => {
    if (keyState) {
      router.route((entity: Entity) => entity.getTrait(Jump)?.start());
    } else {
      router.route((entity: Entity) => entity.getTrait(Jump)?.cancel());
    }
  });

  input.addMapping(KEYMAP.B, (keyState) => {
    router.route((entity: Entity) => {
      const turboRunTrait = entity.getTrait(TurboRun);
      if (!turboRunTrait) return;
      turboRunTrait.isTurbo = true;
    });
  });

  input.addMapping(KEYMAP.UP, (keyState) => {
    router.route((entity: Entity) => {
      const pipeTraveller = entity.getTrait<PipeTraveller>(PipeTraveller);
      if (!pipeTraveller) return;
      pipeTraveller.direction.y += keyState ? -1 : 1;
    });
  });

  input.addMapping(KEYMAP.DOWN, (keyState) => {
    router.route((entity: Entity) => {
      const pipeTraveller = entity.getTrait<PipeTraveller>(PipeTraveller);
      if (!pipeTraveller) return;
      pipeTraveller.direction.y += keyState ? 1 : -1;
    });
  });

  input.addMapping(KEYMAP.RIGHT, (keyState) => {
    router.route((entity: Entity) => {
      const goTrait = entity.getTrait<Go>(Go);
      const pipeTraveller = entity.getTrait<PipeTraveller>(PipeTraveller);
      if (!goTrait || !pipeTraveller) return;
      goTrait.dir += keyState ? 1 : -1;
      pipeTraveller.direction.x += keyState ? 1 : -1;
    });
  });

  input.addMapping(KEYMAP.LEFT, (keyState) => {
    router.route((entity: Entity) => {
      const goTrait = entity.getTrait<Go>(Go);
      const pipeTraveller = entity.getTrait<PipeTraveller>(PipeTraveller);
      if (!goTrait || !pipeTraveller) return;

      goTrait.dir += keyState ? -1 : 1;
      pipeTraveller.direction.x += keyState ? -1 : 1;
    });
  });

  return router;
}
