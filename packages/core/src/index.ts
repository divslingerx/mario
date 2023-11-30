import {Level} from './Level';
import {Timer} from './Timer';
import {Pipe} from './traits/Pipe';
import {createLevelLoader} from './loaders/level';
import {loadFont} from './loaders/font';
import {loadEntities} from './entities';
import {makePlayer, bootstrapPlayer, resetPlayer, findPlayers} from './player';
import {setupKeyboard} from './input';
import {createColorLayer} from './layers/color';
import {createTextLayer} from './layers/text';
import {createCollisionLayer} from './layers/collision';
import {createDashboardLayer} from './layers/dashboard';
import { createPlayerProgressLayer } from './layers/player-progress';
import {SceneRunner} from './SceneRunner';
import {Scene} from './Scene';
import {TimedScene} from './TimedScene';
import { connectEntity } from './traits/Pipe';
import "css/main.css"
import { GameContext } from './GameContext';

async function main(canvas: HTMLCanvasElement) {
    const videoContext = canvas.getContext('2d') as CanvasRenderingContext2D;
    const audioContext = new AudioContext();

    const [entityFactory, font] = await Promise.all([
        loadEntities(audioContext),
        loadFont(),
    ]);


    const loadLevel = await createLevelLoader(entityFactory);

    const sceneRunner = new SceneRunner();

    const mario = entityFactory.mario();
    makePlayer(mario, "MARIO");

    // window.mario = mario;

    const inputRouter = setupKeyboard(window);
    inputRouter.addReceiver(mario);

    function createLoadingScreen(name: string) {
        const scene = new Scene();
        scene.comp.layers.push(createColorLayer('#000'));
        scene.comp.layers.push(createTextLayer(font, `Loading ${name}...`));
        return scene;
    }

    async function setupLevel(name: string) {
        const loadingScreen = createLoadingScreen(name);
        sceneRunner.addScene(loadingScreen);
        sceneRunner.runNext();

        const level = await loadLevel(name);
        bootstrapPlayer(mario, level);

        level.events.listen(Level.EVENT_TRIGGER, (spec, trigger, touches) => {
            if (spec.type === "goto") {
                for (const _players of findPlayers(touches)) {
                    startWorld(spec.name);
                    return;
                }
            }
        });

        level.events.listen(Pipe.EVENT_PIPE_COMPLETE, async pipe => {
            if (pipe.props.goesTo) {
                const nextLevel = await setupLevel(pipe.props.goesTo.name);
                sceneRunner.addScene(nextLevel);
                sceneRunner.runNext();
                if (pipe.props.backTo) {
                    console.log(pipe.props);
                    nextLevel.events.listen(Level.EVENT_COMPLETE, async () => {
                        const level = await setupLevel(name);
                        const exitPipe = level.entities.get(pipe.props.backTo);
                        connectEntity(exitPipe, mario);
                        sceneRunner.addScene(level);
                        sceneRunner.runNext();
                    });
                }
            } else {
                level.events.emit(Level.EVENT_COMPLETE);
            }
        });

        level.comp.layers.push(createCollisionLayer(level));

        const dashboardLayer = createDashboardLayer(font, mario);
        level.comp.layers.push(dashboardLayer);

        return level;
    }

    async function startWorld(name: string) {
        const level = await setupLevel(name);
        resetPlayer(mario, name);

        const playerProgressLayer = createPlayerProgressLayer(font, level);
        const dashboardLayer = createDashboardLayer(font, mario);

        const waitScreen = new TimedScene();
        waitScreen.countDown = 0;
        waitScreen.comp.layers.push(createColorLayer('#000'));
        waitScreen.comp.layers.push(dashboardLayer);
        waitScreen.comp.layers.push(playerProgressLayer);

        sceneRunner.addScene(waitScreen);
        sceneRunner.addScene(level);
        sceneRunner.runNext();
    }

    const gameContext: GameContext = {
        audioContext,
        deltaTime: 0,
        entityFactory,
        tick: 0,
        videoContext,
    };

    const timer = new Timer(1/60);
    timer.update = function update(deltaTime = 0) {
        //TODO - This will pause game if window is not focused. This should be congigurable.
        if (!document.hasFocus()) return

        gameContext.tick++;
        gameContext.deltaTime = deltaTime;
        sceneRunner.update(gameContext);
    }

    timer.start();

    startWorld('debug-pipe');
}

const canvas = document.getElementById('screen') as HTMLCanvasElement;

const start = () => {
    console.log("starting")
    window.removeEventListener('click', start);
    console.log("Starting game")
    if(!canvas) throw new Error("Canvas not found")
    main(canvas);
};


export const startGame = () => document.addEventListener("DOMContentLoaded", () => window.addEventListener('click', start))
