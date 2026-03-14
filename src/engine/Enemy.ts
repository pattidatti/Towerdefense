import type { EnemyDef } from '../data/enemies'

export type Waypoint = { x: number; y: number }

export class Enemy {
  x: number
  y: number
  hp: number
  readonly maxHp: number
  readonly speed: number
  reward: number
  readonly color: string
  readonly id: string
  alive = true
  reachedEnd = false
  goldCollected = false
  animTime = 0
  /** Last horizontal velocity — positive = moving right */
  vx = 0

  private waypoints: Waypoint[]
  private wpIndex: number

  constructor(def: EnemyDef, waypoints: Waypoint[]) {
    this.waypoints = waypoints
    this.x = waypoints[0].x
    this.y = waypoints[0].y
    this.wpIndex = 1
    this.hp = def.hp
    this.maxHp = def.hp
    this.speed = def.speed
    this.reward = def.reward
    this.color = def.color
    this.id = def.id
  }

  update(dt: number): void {
    if (!this.alive || this.reachedEnd) return
    if (this.wpIndex >= this.waypoints.length) {
      this.reachedEnd = true
      this.alive = false
      return
    }

    const target = this.waypoints[this.wpIndex]
    const dx = target.x - this.x
    const dy = target.y - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const step = this.speed * dt

    if (step >= dist) {
      this.vx = dx
      this.x = target.x
      this.y = target.y
      this.wpIndex++
    } else {
      this.vx = dx
      this.x += (dx / dist) * step
      this.y += (dy / dist) * step
    }
    this.animTime += dt
  }

  takeDamage(amount: number): void {
    this.hp -= amount
    if (this.hp <= 0) {
      this.hp = 0
      this.alive = false
    }
  }

  /** 0–1 progress along path */
  get progress(): number {
    return this.wpIndex / this.waypoints.length
  }
}
