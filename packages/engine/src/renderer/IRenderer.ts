/*
Renderer Abstraction - 2D/3D Compatible Architecture:
- Unified interface supports PixiJS (2D) and Three.js (3D) backends
- Enables seamless transition between 2D and 3D rendering
- Performance optimized for batch rendering and GPU acceleration
- See: Graphics Programming Patterns for rendering architecture
*/

export interface IVector2 {
  x: number
  y: number
}

export interface IVector3 extends IVector2 {
  z: number
}

export interface ITransform2D {
  position: IVector2
  rotation: number
  scale: IVector2
  pivot?: IVector2
}

export interface ITransform3D {
  position: IVector3
  rotation: IVector3
  scale: IVector3
}

export interface IBounds2D {
  x: number
  y: number
  width: number
  height: number
}

export interface ITexture {
  id: string
  width: number
  height: number
  url?: string
}

export interface ISprite {
  texture: ITexture
  transform: ITransform2D
  tint?: number
  alpha?: number
  visible?: boolean
  blendMode?: string
}

export interface ICamera2D {
  position: IVector2
  zoom: number
  rotation: number
  bounds?: IBounds2D
}

export interface ICamera3D {
  position: IVector3
  target: IVector3
  up: IVector3
  fov: number
  near: number
  far: number
}

/*
IRenderer Interface:
- Abstraction over PixiJS/Three.js for future 3D expansion
- Batch rendering for performance with many sprites
- Plugin system for custom rendering effects
*/
export interface IRenderer {
  // Renderer lifecycle
  initialize(canvas: HTMLCanvasElement): Promise<void>
  resize(width: number, height: number): void
  destroy(): void
  
  // Frame rendering
  clear(color?: number): void
  render(): void
  
  // Texture management - enables atlas optimization
  loadTexture(url: string, id?: string): Promise<ITexture>
  createTextureAtlas(textures: ITexture[]): Promise<ITexture>
  
  // Sprite rendering - batched for performance
  drawSprite(sprite: ISprite): void
  drawSprites(sprites: ISprite[]): void
  
  // Primitive rendering for debug/UI
  drawRect(bounds: IBounds2D, color: number, alpha?: number): void
  drawCircle(center: IVector2, radius: number, color: number, alpha?: number): void
  drawLine(from: IVector2, to: IVector2, color: number, width?: number): void
  
  // Camera system
  setCamera(camera: ICamera2D): void
  getCamera(): ICamera2D
  
  // Performance optimization
  enableBatching(enabled: boolean): void
  getStats(): {
    drawCalls: number
    triangles: number
    textures: number
    fps: number
  }
  
  // Future 3D support
  supports3D?(): boolean
  setCamera3D?(camera: ICamera3D): void
}

/*
IRenderPlugin Interface:
- Enables custom rendering effects (shaders, post-processing)
- Modular architecture for rendering enhancements
- Examples: bloom, particle systems, lighting
*/
export interface IRenderPlugin {
  name: string
  initialize(renderer: IRenderer): Promise<void>
  beforeRender?(renderer: IRenderer): void
  afterRender?(renderer: IRenderer): void
  destroy(): void
}

/*
IRendererFactory Interface:
- Creates appropriate renderer based on capabilities
- Enables graceful fallback from WebGL to Canvas
- Future expansion to WebGPU when available
*/
export interface IRendererFactory {
  createRenderer(options?: {
    preferredBackend?: 'webgl' | 'canvas' | 'webgpu'
    antialias?: boolean
    transparent?: boolean
    powerPreference?: 'default' | 'high-performance' | 'low-power'
  }): Promise<IRenderer>
  
  getCapabilities(): {
    supportsWebGL: boolean
    supportsWebGL2: boolean
    supportsWebGPU: boolean
    maxTextureSize: number
    maxTextures: number
  }
}