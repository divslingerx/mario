// Core Engine Classes
export { Entity, Side } from './Entity'
export { Scene } from './Scene'
export { Level } from './Level'
export { Trait } from './Trait'
export type { GameContext, EntityFactory } from './GameContext'

// Systems
export { AudioBoard } from './AudioBoard'
export { BoundingBox } from './BoundingBox'
export { Camera } from './Camera'
export { Compositor } from './Compositor'
export { EntityCollider } from './EntityCollider'
export { EventBuffer } from './EventBuffer'
export { EventEmitter } from './EventEmitter'
export { InputRouter } from './InputRouter'
export { Keyboard } from './Keyboard'
export { MusicController } from './MusicController'
export { MusicPlayer } from './MusicPlayer'
export { SceneRunner } from './SceneRunner'
export { SpriteSheet } from './SpriteSheet'
export { TileCollider } from './TileCollider'
export { TileResolver } from './TileResolver'
export { TimedScene } from './TimedScene'
export { Timer } from './Timer'

// Utilities
export type { Vec2 } from './math'
export { createAnimation } from './animation'
export type { Animation } from './animation'
export { raise } from './raise'
export { setupMouseControl } from './debug'

// Traits
export { Emitter } from './traits/Emitter'
export { Go } from './traits/Go'
export { Gravity } from './traits/Gravity'
export { Jump } from './traits/Jump'
export { Killable } from './traits/Killable'
export { PendulumMove } from './traits/PendulumMove'
export { Physics } from './traits/Physics'
export { Solid } from './traits/Solid'
export { Stomper } from './traits/Stomper'
export { Trigger } from './traits/Trigger'
export { Velocity } from './traits/Velocity'
export { Pathfinding } from './traits/Pathfinding'

// Systems
export { PathfindingSystem } from './systems/PathfindingSystem'

// Input System
export * from './input'
export { InputManager } from './input/InputSource'

// Layers
export { createBackgroundLayer } from './layers/background'
export { createCameraLayer } from './layers/camera'
export { createCollisionLayer } from './layers/collision'
export { createColorLayer } from './layers/color'
export { createSpriteLayer } from './layers/sprites'
export { createTextLayer } from './layers/text'

// Loaders
export { loadImage, loadJSON } from './loaders'
export { loadAudioBoard } from './loaders/audio'
export { loadFont } from './loaders/font'
export { loadMusicSheet } from './loaders/music'
export { loadSpriteSheet } from './loaders/sprite'

// Types
export type { Dict } from './types'
// export type { AudioSpec, MusicSpec } from './loaders/types'