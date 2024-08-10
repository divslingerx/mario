import { Camera } from './Camera'
import { Entity } from './Entity'
import { EntityCollider } from './EntityCollider'
import { GameContext } from './GameContext'
import { MusicController } from './MusicController'
// Note: findPlayers will be provided by game implementation
import { Scene } from './Scene'
import { TileCollider } from './TileCollider'

export class Level extends Scene {
  static EVENT_TRIGGER = Symbol('trigger')

  name = ''

  entities = new Set<Entity>()
  entityCollider = new EntityCollider(this.entities)
  tileCollider = new TileCollider()
  music = new MusicController()
  camera = new Camera()

  gravity = 1500
  totalTime = 0

  update(gameContext: GameContext) {
    this.entities.forEach((entity) => {
      entity.update(gameContext, this)
    })

    this.entities.forEach((entity) => {
      this.entityCollider.check(entity)
    })

    this.entities.forEach((entity) => {
      entity.finalize()
    })

    this.totalTime += gameContext.deltaTime

    // Camera focus will be handled by game implementation
  }

  draw(gameContext: GameContext) {
    this.comp.draw(gameContext.videoContext, this.camera)
  }

  pause() {
    this.music.pause()
  }
}

