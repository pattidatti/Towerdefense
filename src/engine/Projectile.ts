import type { Enemy } from './Enemy'

export class Projectile {
  x: number
  y: number
  readonly target: Enemy
  readonly damage: number
  readonly speed = 320  // px/s
  done = false

  constructor(x: number, y: number, target: Enemy, damage: number) {
    this.x = x
    this.y = y
    this.target = target
    this.damage = damage
  }

  update(dt: number): void {
    if (this.done) return
    if (!this.target.alive) { this.done = true; return }

    const dx = this.target.x - this.x
    const dy = this.target.y - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const step = this.speed * dt

    if (step >= dist) {
      this.target.takeDamage(this.damage)
      this.done = true
    } else {
      this.x += (dx / dist) * step
      this.y += (dy / dist) * step
    }
  }
}
