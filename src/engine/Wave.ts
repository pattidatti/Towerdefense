import { Enemy, type Waypoint } from './Enemy'
import type { EnemyDef } from '../data/enemies'

export interface SpawnGroup {
  def: EnemyDef
  count: number
  interval: number  // seconds between each in group
}

export interface WaveDef {
  groups: SpawnGroup[]
}

interface QueueEntry {
  def: EnemyDef
  spawnAt: number  // seconds from wave start
}

export class WaveManager {
  private waves: WaveDef[]
  private waypoints: Waypoint[]
  private currentWave = 0
  private queue: QueueEntry[] = []
  private timer = 0
  spawning = false
  get totalWaves() { return this.waves.length }
  get waveNumber() { return this.currentWave }  // 0-based index of wave that last started

  constructor(waves: WaveDef[], waypoints: Waypoint[]) {
    this.waves = waves
    this.waypoints = waypoints
  }

  get hasNextWave(): boolean {
    return this.currentWave < this.waves.length
  }

  startNextWave(): void {
    if (!this.hasNextWave) return
    const wave = this.waves[this.currentWave]
    this.currentWave++
    this.queue = []
    this.timer = 0
    let t = 0
    for (const group of wave.groups) {
      for (let i = 0; i < group.count; i++) {
        this.queue.push({ def: group.def, spawnAt: t })
        t += group.interval
      }
    }
    this.spawning = this.queue.length > 0
  }

  update(dt: number): Enemy[] {
    if (!this.spawning) return []
    this.timer += dt
    const spawned: Enemy[] = []
    while (this.queue.length > 0 && this.timer >= this.queue[0].spawnAt) {
      spawned.push(new Enemy(this.queue.shift()!.def, this.waypoints))
    }
    if (this.queue.length === 0) this.spawning = false
    return spawned
  }
}
