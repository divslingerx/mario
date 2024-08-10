import { Dict } from './types'

export type EntityFactory = () => any

export type GameContext = {
  audioContext: AudioContext
  deltaTime: number
  entityFactory: Dict<EntityFactory>
  videoContext: CanvasRenderingContext2D
}
