/*
Performance Benchmarking System:
- Measures and tracks performance metrics for optimization
- Identifies bottlenecks in rendering, physics, and game logic
- Provides targets and alerts for performance regression
- See: Game Engine Performance Optimization patterns
*/

interface PerformanceTarget {
  readonly name: string
  readonly targetFPS: number
  readonly maxFrameTime: number // ms
  readonly maxMemoryMB: number
  readonly maxEntities: number
}

interface BenchmarkResult {
  readonly name: string
  readonly averageFPS: number
  readonly minFPS: number
  readonly maxFPS: number
  readonly averageFrameTime: number
  readonly maxFrameTime: number
  readonly memoryUsedMB: number
  readonly entityCount: number
  readonly systemTimes: ReadonlyMap<string, number>
  readonly renderTime: number
  readonly physicsTime: number
  readonly passed: boolean
}

/*
Performance Targets for different game scenarios:
- Desktop: 60 FPS with hundreds of entities
- Mobile: 30 FPS with reduced entity count
- Multiplayer: Consistent timing for network sync
*/
export const PERFORMANCE_TARGETS: Record<string, PerformanceTarget> = {
  DESKTOP_HIGH: {
    name: 'Desktop High Performance',
    targetFPS: 60,
    maxFrameTime: 16.67, // 60 FPS
    maxMemoryMB: 512,
    maxEntities: 1000
  },
  DESKTOP_MEDIUM: {
    name: 'Desktop Medium Performance', 
    targetFPS: 30,
    maxFrameTime: 33.33, // 30 FPS
    maxMemoryMB: 256,
    maxEntities: 500
  },
  MOBILE_HIGH: {
    name: 'Mobile High Performance',
    targetFPS: 60,
    maxFrameTime: 16.67,
    maxMemoryMB: 128,
    maxEntities: 200
  },
  MOBILE_MEDIUM: {
    name: 'Mobile Medium Performance',
    targetFPS: 30,
    maxFrameTime: 33.33,
    maxMemoryMB: 64,
    maxEntities: 100
  }
} as const

export class PerformanceBenchmark {
  private frameTimes: number[] = []
  private systemTimes = new Map<string, number[]>()
  private startTime = 0
  private lastFrameTime = 0
  private frameCount = 0
  private isRunning = false
  
  // Pre-allocated arrays for performance
  private readonly maxSamples = 1000
  private readonly systemTimeBuffer = new Map<string, number>()

  start(): void {
    this.isRunning = true
    this.startTime = performance.now()
    this.lastFrameTime = this.startTime
    this.frameCount = 0
    this.frameTimes.length = 0
    this.systemTimes.clear()
  }

  markFrameStart(): void {
    if (!this.isRunning) return
    
    const now = performance.now()
    const frameTime = now - this.lastFrameTime
    
    // Circular buffer for frame times - avoid array growth
    if (this.frameTimes.length >= this.maxSamples) {
      this.frameTimes[this.frameCount % this.maxSamples] = frameTime
    } else {
      this.frameTimes.push(frameTime)
    }
    
    this.lastFrameTime = now
    this.frameCount++
  }

  markSystemStart(systemName: string): void {
    if (!this.isRunning) return
    this.systemTimeBuffer.set(systemName, performance.now())
  }

  markSystemEnd(systemName: string): void {
    if (!this.isRunning) return
    
    const startTime = this.systemTimeBuffer.get(systemName)
    if (startTime === undefined) return
    
    const systemTime = performance.now() - startTime
    
    if (!this.systemTimes.has(systemName)) {
      this.systemTimes.set(systemName, [])
    }
    
    const times = this.systemTimes.get(systemName)!
    if (times.length >= this.maxSamples) {
      times[this.frameCount % this.maxSamples] = systemTime
    } else {
      times.push(systemTime)
    }
  }

  stop(): BenchmarkResult {
    this.isRunning = false
    
    const totalTime = performance.now() - this.startTime
    const frameTimesActive = this.frameTimes.slice(0, Math.min(this.frameCount, this.maxSamples))
    
    // Use for loops instead of array methods for performance
    let minFrameTime = Number.MAX_VALUE
    let maxFrameTime = 0
    let totalFrameTime = 0
    
    for (let i = 0; i < frameTimesActive.length; i++) {
      const frameTime = frameTimesActive[i]
      totalFrameTime += frameTime
      if (frameTime < minFrameTime) minFrameTime = frameTime
      if (frameTime > maxFrameTime) maxFrameTime = frameTime
    }
    
    const averageFrameTime = totalFrameTime / frameTimesActive.length
    const averageFPS = 1000 / averageFrameTime
    const minFPS = 1000 / maxFrameTime
    const maxFPS = 1000 / minFrameTime
    
    // Calculate system times
    const systemTimesResult = new Map<string, number>()
    for (const [systemName, times] of this.systemTimes) {
      let total = 0
      for (let i = 0; i < times.length; i++) {
        total += times[i]
      }
      systemTimesResult.set(systemName, total / times.length)
    }
    
    return {
      name: 'Benchmark Result',
      averageFPS,
      minFPS,
      maxFPS,
      averageFrameTime,
      maxFrameTime,
      memoryUsedMB: this.getMemoryUsage(),
      entityCount: 0, // Would be injected from ECS world
      systemTimes: systemTimesResult,
      renderTime: systemTimesResult.get('render') ?? 0,
      physicsTime: systemTimesResult.get('physics') ?? 0,
      passed: false // Would be calculated against targets
    }
  }

  // Performance validation against targets
  static validatePerformance(result: BenchmarkResult, target: PerformanceTarget): boolean {
    return (
      result.averageFPS >= target.targetFPS * 0.9 && // 10% tolerance
      result.maxFrameTime <= target.maxFrameTime * 1.1 &&
      result.memoryUsedMB <= target.maxMemoryMB &&
      result.entityCount <= target.maxEntities
    )
  }

  // Memory usage tracking
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory
      return memInfo.usedJSHeapSize / (1024 * 1024) // Convert to MB
    }
    return 0
  }

  // Create performance report for optimization insights
  static createReport(results: BenchmarkResult[], target: PerformanceTarget): string {
    const report: string[] = []
    report.push(`Performance Report - Target: ${target.name}`)
    report.push('='.repeat(50))
    
    for (const result of results) {
      const passed = this.validatePerformance(result, target)
      report.push(`\n${result.name}: ${passed ? 'PASS' : 'FAIL'}`)
      report.push(`  FPS: ${result.averageFPS.toFixed(1)} (min: ${result.minFPS.toFixed(1)}, max: ${result.maxFPS.toFixed(1)})`)
      report.push(`  Frame Time: ${result.averageFrameTime.toFixed(2)}ms (max: ${result.maxFrameTime.toFixed(2)}ms)`)
      report.push(`  Memory: ${result.memoryUsedMB.toFixed(1)}MB`)
      report.push(`  Entities: ${result.entityCount}`)
      
      if (result.systemTimes.size > 0) {
        report.push('  System Times:')
        for (const [system, time] of result.systemTimes) {
          report.push(`    ${system}: ${time.toFixed(2)}ms`)
        }
      }
    }
    
    return report.join('\n')
  }
}

/*
AutoProfiler Class:
- Automatically profiles game performance during development
- Identifies performance regressions in CI/CD pipeline
- Provides continuous performance monitoring
*/
export class AutoProfiler {
  private benchmark = new PerformanceBenchmark()
  private isAutoRunning = false
  private profileInterval = 5000 // 5 seconds
  private results: BenchmarkResult[] = []

  startContinuousProfilering(target: PerformanceTarget): void {
    if (this.isAutoRunning) return
    
    this.isAutoRunning = true
    
    const profile = () => {
      if (!this.isAutoRunning) return
      
      this.benchmark.start()
      
      setTimeout(() => {
        const result = this.benchmark.stop()
        this.results.push(result)
        
        // Alert on performance issues
        if (!PerformanceBenchmark.validatePerformance(result, target)) {
          console.warn('Performance target not met:', {
            averageFPS: result.averageFPS,
            target: target.targetFPS,
            frameTime: result.averageFrameTime,
            maxAllowed: target.maxFrameTime
          })
        }
        
        // Continue profiling
        setTimeout(profile, this.profileInterval)
      }, this.profileInterval)
    }
    
    profile()
  }

  stopContinuousProfiler(): void {
    this.isAutoRunning = false
  }

  getLatestResults(): readonly BenchmarkResult[] {
    return Object.freeze(this.results.slice())
  }
}

// Decorator for automatic system profiling
export function profileSystem(systemName: string) {
  return function<T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value!
    
    descriptor.value = function(this: any, ...args: any[]) {
      const profiler = (globalThis as any).__js2dProfiler as PerformanceBenchmark
      if (profiler) {
        profiler.markSystemStart(systemName)
        const result = originalMethod.apply(this, args)
        profiler.markSystemEnd(systemName)
        return result
      }
      return originalMethod.apply(this, args)
    } as T
    
    return descriptor
  }
}