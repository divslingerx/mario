import {
  Entity,
  GameContext,
  Level,
  Scene,
  SceneRunner,
  TimedScene,
  Timer,
  raise,
  createCollisionLayer,
  createColorLayer,
  createTextLayer,
  loadFont
} from '@js2d/engine'

import { loadEntities } from './game/entities'
import { setupKeyboard } from './game/input'
import { createDashboardLayer } from './layers/dashboard'
import { createPlayerProgressLayer } from './layers/player-progress'
import { createLevelLoader } from './loaders/level'
import { LevelSpecTrigger } from '@js2d/engine'
import { createPlayerEnv, makePlayer } from './game/player'
import { Player } from './traits/Player'

async function main(canvas: HTMLCanvasElement) {
  const videoContext = canvas.getContext('2d') || raise('Canvas not supported')

  // turning this off lets us save a lot of Math.floor calls when rendering
  videoContext.imageSmoothingEnabled = false

  const audioContext = new AudioContext()

  const [entityFactory, font] = await Promise.all([
    loadEntities(audioContext),
    loadFont(),
  ])

  const loadLevel = createLevelLoader(entityFactory)

  const sceneRunner = new SceneRunner()

  const jumpguy = entityFactory.jumpguy?.() || raise('where jumpguy tho')
  makePlayer(jumpguy, 'JUMPGUY')

  const inputRouter = setupKeyboard(window)
  inputRouter.addReceiver(jumpguy)

  async function runLevel(name: string) {
    const loadScreen = new Scene()
    loadScreen.comp.layers.push(createColorLayer('black'))
    loadScreen.comp.layers.push(createTextLayer(font, `LOADING ${name}...`))
    sceneRunner.addScene(loadScreen)
    sceneRunner.runNext()

    await new Promise((resolve) => setTimeout(resolve, 500))

    const level = await loadLevel(name)

    level.events.listen(
      Level.EVENT_TRIGGER,
      (spec: LevelSpecTrigger, trigger: Entity, touches: Set<Entity>) => {
        if (spec.type === 'goto') {
          for (const entity of touches) {
            if (entity.getTrait(Player)) {
              runLevel(spec.name)
              return
            }
          }
        }
      },
    )

    const playerProgressLayer = createPlayerProgressLayer(font, level)
    const dashboardLayer = createDashboardLayer(font, level)

    jumpguy.pos.set(0, 0)
    jumpguy.vel.set(0, 0)
    level.entities.add(jumpguy)

    const playerEnv = createPlayerEnv(jumpguy)
    level.entities.add(playerEnv)

    const waitScreen = new TimedScene()
    waitScreen.comp.layers.push(createColorLayer('black'))
    waitScreen.comp.layers.push(dashboardLayer)
    waitScreen.comp.layers.push(playerProgressLayer)
    sceneRunner.addScene(waitScreen)

    level.comp.layers.push(createCollisionLayer(level))
    level.comp.layers.push(dashboardLayer)
    sceneRunner.addScene(level)

    sceneRunner.runNext()
  }

  const timer = new Timer()

  timer.update = function update(deltaTime) {
    if (!document.hasFocus()) return

    const gameContext: GameContext = {
      deltaTime,
      audioContext,
      entityFactory,
      videoContext,
    }

    sceneRunner.update(gameContext)
  }

  timer.start()
  runLevel('debug-progression')
}

const canvas = document.getElementById('screen')
if (canvas instanceof HTMLCanvasElement) {
  main(canvas).catch(console.error)
} else {
  console.warn('Canvas not found')
}