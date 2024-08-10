import { Level } from "./engine/Level";
import { Timer } from "./engine/Timer";
import { Pipe } from "./engine/traits/Pipe";
import { createLevelLoader } from "./engine/loaders/level";
import { loadFont } from "./engine/loaders/font";
import { loadEntities } from "./engine/entities";
import {
  makePlayer,
  bootstrapPlayer,
  resetPlayer,
  findPlayers,
} from "./engine/player";
import { setupKeyboard } from "./engine/input";
import { createColorLayer } from "./engine/layers/color";
import { createTextLayer } from "./engine/layers/text";
import { createCollisionLayer } from "./engine/layers/collision";
import { createDashboardLayer } from "./engine/layers/dashboard";
import { createPlayerProgressLayer } from "./engine/layers/player-progress";
import { SceneRunner } from "./engine/SceneRunner";
import { Scene } from "./engine/Scene";
import { TimedScene } from "./engine/TimedScene";
import { connectEntity } from "./engine/traits/Pipe";
import { Entity } from "./engine/Entity";
import { GameContext } from "./engine/GameContext";
import { LevelSpecTrigger } from "./engine/loaders/types";
import { raise } from "./engine/raise";
import { Player } from "./engine/traits/Player";

// async function main(canvas: HTMLCanvasElement) {
//   const videoContext = canvas.getContext("2d") || raise("Canvas not supported");
//   // turning this off lets us save a lot of Math.floor calls when rendering
//   videoContext.imageSmoothingEnabled = false;

//   const audioContext = new AudioContext();

//   const [entityFactory, font] = await Promise.all([
//     loadEntities(audioContext),
//     loadFont(),
//   ]);

//   const loadLevel = createLevelLoader(entityFactory);

//   const sceneRunner = new SceneRunner();

//   const mario = entityFactory.mario?.() || raise("where art thou mario?");
//   makePlayer(mario, "MARIO");

//   const inputRouter = setupKeyboard(window);
//   inputRouter.addReceiver(mario);

//   function createLoadingScreen(name: string) {
//     const loadScreen = new Scene();
//     loadScreen.comp.layers.push(createColorLayer("#000"));
//     loadScreen.comp.layers.push(createTextLayer(font, `Loading ${name}...`));
//     sceneRunner.addScene(loadScreen);
//     return loadScreen;
//   }

//   async function setupLevel(name: string) {
//     const loadingScreen = createLoadingScreen(name);
//     sceneRunner.addScene(loadingScreen);
//     sceneRunner.runNext();

//     const level = await loadLevel(name);
//     bootstrapPlayer(mario, level);

//     level.events.listen(
//       Level.EVENT_TRIGGER,
//       (spec: LevelSpecTrigger, _: Entity, touches: Set<Entity>) => {
//         if (spec.type === "goto") {
//           for (const _ of findPlayers(touches)) {
//             startWorld(spec.name);
//             return;
//           }
//         }
//       }
//     );

//     level.events.listen(Pipe.EVENT_PIPE_COMPLETE, async (pipe) => {
//       if (pipe.props.goesTo) {
//         const nextLevel = await setupLevel(pipe.props.goesTo.name);
//         sceneRunner.addScene(nextLevel);
//         sceneRunner.runNext();
//         if (pipe.props.backTo) {
//           console.log(pipe.props);
//           nextLevel.events.listen(Level.EVENT_COMPLETE, async () => {
//             const level = await setupLevel(name);
//             const exitPipe = level.getEntity(pipe.props.backTo);
//             if (!exitPipe) {
//               throw new Error(
//                 `cannot find pipe exit ${pipe.props.backTo} from entrance <${pipe.name}> `
//               );
//             }
//             connectEntity(exitPipe, mario);
//             sceneRunner.addScene(level);
//             sceneRunner.runNext();
//           });
//         }
//       } else {
//         level.events.emit(Level.EVENT_COMPLETE);
//       }
//     });

//     level.comp.layers.push(createCollisionLayer(level));

//     const dashboardLayer = createDashboardLayer(font, level, mario);
//     level.comp.layers.push(dashboardLayer);

//     return level;
//   }

//   async function startWorld(name: string) {
//     const level = await setupLevel(name);
//     resetPlayer(mario, name);

//     const playerProgressLayer = createPlayerProgressLayer(font, level);
//     const dashboardLayer = createDashboardLayer(font, level);

//     const waitScreen = new TimedScene();
//     waitScreen.countDown = 0;
//     waitScreen.comp.layers.push(createColorLayer("#000"));
//     waitScreen.comp.layers.push(dashboardLayer);
//     waitScreen.comp.layers.push(playerProgressLayer);

//     sceneRunner.addScene(waitScreen);
//     sceneRunner.addScene(level);
//     sceneRunner.runNext();
//   }

//   const gameContext: GameContext = {
//     audioContext,
//     videoContext,
//     entityFactory,
//     deltaTime: 0,
//     tick: 0,
//   };

//   const timer = new Timer(1 / 60);
//   timer.update = function update(deltaTime: number) {
//     gameContext.tick++;
//     gameContext.deltaTime = deltaTime;
//     sceneRunner.update(gameContext);
//   };

//   timer.start();

//   startWorld("1-1");
// }

// const canvas = document.getElementById("screen");
// if (!(canvas instanceof HTMLCanvasElement)) {
//   throw new Error("Canvas not supported");
// }

// const start = () => {
//   window.removeEventListener("click", start);
//   main(canvas);
// };

// window.addEventListener("click", start);

const setupVideoContext = (canvas: HTMLCanvasElement) => {
  const videoContext = canvas.getContext("2d") || raise("Canvas not supported");
  // turning this off lets us save a lot of Math.floor calls when rendering
  videoContext.imageSmoothingEnabled = false;
  return videoContext;
};

async function main(canvas: HTMLCanvasElement) {
  const videoContext = setupVideoContext(canvas);
  const audioContext = new AudioContext();

  const [entityFactory, font] = await Promise.all([
    loadEntities(audioContext),
    loadFont(),
  ]);

  const loadLevel = createLevelLoader(entityFactory);

  const sceneRunner = new SceneRunner();

  const mario = entityFactory.mario?.() || raise("where mario tho");
  makePlayer(mario, "MARIO");

  const inputRouter = setupKeyboard(window);
  inputRouter.addReceiver(mario);
  console.log("mario", mario);
  console.log("mario traits", mario.traits);

  function createLoadingScreen(name: string) {
    const scene = new Scene();
    scene.comp.layers.push(createColorLayer("#000"));
    scene.comp.layers.push(createTextLayer(font, `Loading ${name}...`));
    return scene;
  }

  function setupTriggerListeners(level: Level) {
    level.events.listen(
      Level.EVENT_TRIGGER,
      (spec: LevelSpecTrigger, trigger: Entity, touches: Set<Entity>) => {
        if (spec.type === "goto") {
          for (const entity of touches) {
            if (entity.getTrait(Player)) {
              setupLevel(spec.name);
              return;
            }
          }
        }
      }
    );
  }

  function setupPipeListeners(level: Level, name: string) {
    level.events.listen(Pipe.EVENT_PIPE_COMPLETE, async (pipe) => {
      if (pipe.props.goesTo) {
        const nextLevel = await setupLevel(pipe.props.goesTo.name);
        sceneRunner.addScene(nextLevel);
        sceneRunner.runNext();
        if (pipe.props.backTo) {
          console.log(pipe.props);
          nextLevel.events.listen(Level.EVENT_COMPLETE, async () => {
            const level = await setupLevel(name);
            const exitPipe = level.getEntity(pipe.props.backTo);
            if (!exitPipe) {
              throw new Error(`Pipe ${pipe.props.backTo} not found`);
            }
            connectEntity(exitPipe, mario);
            sceneRunner.addScene(level);
            sceneRunner.runNext();
          });
        }
      } else {
        level.events.emit(Level.EVENT_COMPLETE);
      }
    });
  }

  async function setupLevel(name: string) {
    const loadScreen = createLoadingScreen(name);
    sceneRunner.addScene(loadScreen);
    sceneRunner.runNext();

    await new Promise((resolve) => setTimeout(resolve, 500));

    // todo: do we need this?
    const level = await loadLevel(name);

    bootstrapPlayer(mario, level);
    resetPlayer(mario, name);

    setupTriggerListeners(level);
    setupPipeListeners(level, name);

    level.comp.layers.push(createCollisionLayer(level));
    level.comp.layers.push(createDashboardLayer(font, level, mario));

    return level;
  }

  async function startWorld(name: string) {
    const level = await setupLevel(name);
    resetPlayer(mario, name);

    const playerProgressLayer = createPlayerProgressLayer(font, level);
    const dashboardLayer = createDashboardLayer(font, level, mario);

    const waitScreen = new TimedScene();
    waitScreen.countDown = 0;
    waitScreen.comp.layers.push(createColorLayer("#000"));
    waitScreen.comp.layers.push(dashboardLayer);
    waitScreen.comp.layers.push(playerProgressLayer);

    // sceneRunner.addScene(waitScreen);
    sceneRunner.addScene(level);
    sceneRunner.runNext();
  }

  const gameContext: GameContext = {
    deltaTime: 0,
    tick: 0,
    audioContext,
    entityFactory,
    videoContext,
  };

  const timer = new Timer(1 / 60);
  timer.update = function update(deltaTime) {
    if (!document.hasFocus()) return;

    sceneRunner.update(gameContext);
  };

  timer.start();
  startWorld("1-1");
}

const canvas = document.getElementById("screen");
const start = () => {
  window.removeEventListener("click", start);

  if (canvas instanceof HTMLCanvasElement) {
    main(canvas).catch(console.error);
  } else {
    console.warn("Canvas not found");
  }
};

window.addEventListener("click", start);
