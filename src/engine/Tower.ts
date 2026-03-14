import type { TowerDef } from '../data/towers'
import type { Enemy } from './Enemy'
import { Projectile } from './Projectile'

export class Tower {
  readonly col: number
  readonly row: number
  readonly x: number  // center px
  readonly y: number  // center px
  readonly def: TowerDef
  target: Enemy | null = null
  private cooldownTimer = 0

  constructor(col: number, row: number, tileSize: number, def: TowerDef) {
    this.col = col
    this.row = row
    this.def = def
    this.x = col * tileSize + tileSize / 2
    this.y = row * tileSize + tileSize / 2
  }

  update(dt: number, enemies: Enemy[]): Projectile | null {
    this.cooldownTimer = Math.max(0, this.cooldownTimer - dt)

    // Pick furthest-along enemy in range
    let best: Enemy | null = null
    let bestProgress = -1
    for (const e of enemies) {
      if (!e.alive) continue
      const dx = e.x - this.x
      const dy = e.y - this.y
      if (dx * dx + dy * dy <= this.def.range * this.def.range && e.progress > bestProgress) {
        bestProgress = e.progress
        best = e
      }
    }
    this.target = best

    if (this.target && this.cooldownTimer === 0) {
      this.cooldownTimer = this.def.cooldown
      return new Projectile(this.x, this.y, this.target, this.def.damage)
    }
    return null
  }
}
