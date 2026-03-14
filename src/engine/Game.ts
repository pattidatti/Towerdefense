import type { GameMap } from './MapLoader'
import { Renderer } from './Renderer'
import { Tower } from './Tower'
import { WaveManager, type WaveDef } from './Wave'
import type { Enemy, Waypoint } from './Enemy'
import type { Projectile } from './Projectile'
import type { TowerDef } from '../data/towers'
import { loadGameSprites, type GameSprites } from './Sprites'

export interface GameState {
  lives: number
  gold: number
  wave: number
  totalWaves: number
  waveActive: boolean
  canStartWave: boolean
  gameOver: boolean
  victory: boolean
  waveNotify: boolean
  speed: number
  enemiesKilled: number
}

export interface PathPoint { col: number; row: number }

interface Particle {
  x: number; y: number
  vx: number; vy: number
  life: number; maxLife: number
  color: string; r: number
}

function computePathTiles(points: PathPoint[]): Set<string> {
  const set = new Set<string>()
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1]
    if (a.row === b.row) {
      for (let c = Math.min(a.col, b.col); c <= Math.max(a.col, b.col); c++) set.add(`${c},${a.row}`)
    } else {
      for (let r = Math.min(a.row, b.row); r <= Math.max(a.row, b.row); r++) set.add(`${a.col},${r}`)
    }
  }
  return set
}

function toWaypoints(points: PathPoint[], tw: number, th: number): Waypoint[] {
  return points.map(p => ({ x: p.col * tw + tw / 2, y: p.row * th + th / 2 }))
}

export class Game {
  private ctx: CanvasRenderingContext2D
  private map: GameMap
  private renderer: Renderer
  private enemies: Enemy[] = []
  private towers: Tower[] = []
  private projectiles: Projectile[] = []
  private particles: Particle[] = []
  private waveManager: WaveManager
  private pathTiles: Set<string>
  private sprites: GameSprites | null = null
  private waveNotifyTimer = 0
  private timeScale = 1

  private readonly initWaypoints: Waypoint[]

  state: GameState
  selectedTowerDef: TowerDef | null = null
  hoverCol = -1
  hoverRow = -1

  private onStateChange: (s: GameState) => void
  private rafId = 0
  private lastTime = 0
  private started = false

  constructor(
    ctx: CanvasRenderingContext2D,
    map: GameMap,
    renderer: Renderer,
    pathPoints: PathPoint[],
    waves: WaveDef[],
    onStateChange: (s: GameState) => void,
  ) {
    this.ctx = ctx
    this.map = map
    this.renderer = renderer
    this.pathTiles = computePathTiles(pathPoints)
    this.initWaypoints = toWaypoints(pathPoints, map.tileWidth, map.tileHeight)
    this.waveManager = new WaveManager(waves, this.initWaypoints)
    this.onStateChange = onStateChange
    this.state = this.initialState(waves.length)
  }

  private initialState(totalWaves: number): GameState {
    return {
      lives: 20, gold: 150, wave: 0, totalWaves,
      waveActive: false, canStartWave: true,
      gameOver: false, victory: false,
      waveNotify: false, speed: 1, enemiesKilled: 0,
    }
  }

  async loadSprites(base: string): Promise<void> {
    this.sprites = await loadGameSprites(base)
  }

  start(): void {
    if (this.started) return
    this.started = true
    this.lastTime = performance.now()
    this.rafId = requestAnimationFrame(this.loop)
  }

  stop(): void {
    cancelAnimationFrame(this.rafId)
    this.started = false
  }

  toggleSpeed(): void {
    this.timeScale = this.timeScale === 1 ? 2 : 1
    this.state.speed = this.timeScale
    this.onStateChange({ ...this.state })
  }

  startNextWave(): void {
    if (this.state.waveActive || this.state.gameOver || this.state.victory) return
    if (!this.waveManager.hasNextWave) return
    this.waveManager.startNextWave()
    this.state.wave++
    this.state.waveActive = true
    this.state.canStartWave = false
    this.state.waveNotify = true
    this.waveNotifyTimer = 2.5
    this.onStateChange({ ...this.state })
  }

  tryPlaceTower(canvasX: number, canvasY: number): boolean {
    if (!this.selectedTowerDef) return false
    const col = Math.floor(canvasX / this.map.tileWidth)
    const row = Math.floor(canvasY / this.map.tileHeight)
    if (!this.canBuildAt(col, row)) return false
    if (this.state.gold < this.selectedTowerDef.cost) return false
    this.towers.push(new Tower(col, row, this.map.tileWidth, this.selectedTowerDef))
    this.state.gold -= this.selectedTowerDef.cost
    this.onStateChange({ ...this.state })
    return true
  }

  setHover(canvasX: number, canvasY: number): void {
    this.hoverCol = Math.floor(canvasX / this.map.tileWidth)
    this.hoverRow = Math.floor(canvasY / this.map.tileHeight)
  }

  canBuildAt(col: number, row: number): boolean {
    if (col < 0 || col >= this.map.width || row < 0 || row >= this.map.height) return false
    if (this.pathTiles.has(`${col},${row}`)) return false
    if (this.towers.some(t => t.col === col && t.row === row)) return false
    return true
  }

  // ── Loop ─────────────────────────────────────────────────────────────────

  private loop = (ts: number) => {
    const raw = Math.min((ts - this.lastTime) / 1000, 0.1)
    const dt = raw * this.timeScale
    this.lastTime = ts
    this.update(dt, raw)
    this.draw()
    this.rafId = requestAnimationFrame(this.loop)
  }

  private update(dt: number, rawDt: number): void {
    // Wave notify timer (real time, not scaled)
    if (this.waveNotifyTimer > 0) {
      this.waveNotifyTimer -= rawDt
      if (this.waveNotifyTimer <= 0) {
        this.state.waveNotify = false
        this.waveNotifyTimer = 0
      }
    }

    if (this.state.gameOver || this.state.victory) return

    this.enemies.push(...this.waveManager.update(dt))

    for (const e of this.enemies) {
      e.update(dt)
      if (e.reachedEnd) {
        this.state.lives = Math.max(0, this.state.lives - 1)
        if (this.state.lives === 0) this.state.gameOver = true
      }
    }

    for (const t of this.towers) {
      const proj = t.update(dt, this.enemies)
      if (proj) this.projectiles.push(proj)
    }

    for (const p of this.projectiles) p.update(dt)

    // Collect gold + spawn particles for killed enemies
    for (const e of this.enemies) {
      if (!e.alive && !e.goldCollected) {
        this.state.gold += e.reward
        this.state.enemiesKilled++
        e.goldCollected = true
        this.spawnDeathParticles(e.x, e.y, e.color)
      }
    }

    // Update particles
    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 80 * dt
      p.life -= dt
    }

    this.enemies = this.enemies.filter(e => e.alive)
    this.projectiles = this.projectiles.filter(p => !p.done)
    this.particles = this.particles.filter(p => p.life > 0)

    if (this.state.waveActive && !this.waveManager.spawning && this.enemies.length === 0) {
      this.state.waveActive = false
      if (!this.waveManager.hasNextWave) {
        this.state.victory = true
      } else {
        this.state.canStartWave = true
      }
    }

    this.onStateChange({ ...this.state })
  }

  private spawnDeathParticles(x: number, y: number, color: string): void {
    const count = 8
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
      const speed = 25 + Math.random() * 55
      const life = 0.35 + Math.random() * 0.3
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life, maxLife: life,
        color,
        r: 1.5 + Math.random() * 2.5,
      })
    }
  }

  // ── Draw ─────────────────────────────────────────────────────────────────

  private draw(): void {
    const { ctx, map } = this
    ctx.clearRect(0, 0, map.pixelWidth, map.pixelHeight)
    ctx.imageSmoothingEnabled = false
    this.renderer.drawMap(map)
    this.drawPath()
    this.drawPlacementPreview()
    this.drawTowers()
    this.drawEnemies()
    this.drawParticles()
    this.drawProjectiles()
  }

  private drawPath(): void {
    const { ctx, map } = this
    ctx.fillStyle = 'rgba(155, 95, 35, 0.42)'
    for (const key of this.pathTiles) {
      const [col, row] = key.split(',').map(Number)
      if (col >= 0 && col < map.width && row >= 0 && row < map.height) {
        ctx.fillRect(col * map.tileWidth, row * map.tileHeight, map.tileWidth, map.tileHeight)
      }
    }
  }

  private drawPlacementPreview(): void {
    if (!this.selectedTowerDef || this.hoverCol < 0) return
    const { ctx, map } = this
    const ok = this.canBuildAt(this.hoverCol, this.hoverRow) && this.state.gold >= this.selectedTowerDef.cost
    ctx.fillStyle = ok ? 'rgba(100,255,100,0.35)' : 'rgba(255,60,60,0.35)'
    ctx.fillRect(this.hoverCol * map.tileWidth, this.hoverRow * map.tileHeight, map.tileWidth, map.tileHeight)
    if (ok) {
      const cx = this.hoverCol * map.tileWidth + map.tileWidth / 2
      const cy = this.hoverRow * map.tileHeight + map.tileHeight / 2
      ctx.strokeStyle = 'rgba(100,200,255,0.4)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, this.selectedTowerDef.range, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  private drawTowers(): void {
    const { ctx, map, sprites } = this
    const ts = map.tileWidth

    for (const t of this.towers) {
      ctx.strokeStyle = 'rgba(100,200,255,0.12)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(t.x, t.y, t.def.range, 0, Math.PI * 2)
      ctx.stroke()

      if (sprites) {
        const img = t.def.id === 'arrow' ? sprites.arrowBuilding : sprites.magicBuilding
        const bw = ts * 1.6
        const bh = bw * (img.naturalHeight / img.naturalWidth)
        ctx.drawImage(img, t.x - bw / 2, t.y - bh + ts * 0.55, bw, bh)
      } else {
        const half = ts * 0.38
        ctx.fillStyle = t.def.color
        ctx.fillRect(t.x - half, t.y - half, half * 2, half * 2)
        ctx.strokeStyle = 'rgba(0,0,0,0.7)'
        ctx.lineWidth = 1.5
        ctx.strokeRect(t.x - half, t.y - half, half * 2, half * 2)
      }

      if (t.target) {
        const dx = t.target.x - t.x
        const dy = t.target.y - t.y
        const len = Math.sqrt(dx * dx + dy * dy)
        ctx.strokeStyle = 'rgba(60,60,60,0.8)'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(t.x, t.y - ts * 0.1)
        ctx.lineTo(t.x + (dx / len) * ts * 0.7, t.y - ts * 0.1 + (dy / len) * ts * 0.7)
        ctx.stroke()
      }
    }
  }

  private drawEnemies(): void {
    const { ctx, sprites } = this
    const SIZE = 72

    for (const e of this.enemies) {
      const flipH = e.vx < 0
      if (sprites) {
        const sheet = e.id === 'orc' ? sprites.orc : sprites.goblin
        sheet.draw(ctx, 'run', e.animTime, e.x - SIZE / 2, e.y - SIZE / 2, SIZE, SIZE, flipH)
      } else {
        ctx.fillStyle = e.color
        ctx.beginPath()
        ctx.arc(e.x, e.y, 9, 0, Math.PI * 2)
        ctx.fill()
      }

      const bw = 22, bh = 3
      const bx = e.x - bw / 2
      const by = e.y - SIZE / 2 - 5
      ctx.fillStyle = '#222'
      ctx.fillRect(bx, by, bw, bh)
      const ratio = e.hp / e.maxHp
      ctx.fillStyle = ratio > 0.5 ? '#2ecc71' : ratio > 0.25 ? '#f39c12' : '#e74c3c'
      ctx.fillRect(bx, by, bw * ratio, bh)
    }
  }

  private drawParticles(): void {
    const { ctx } = this
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife)
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private drawProjectiles(): void {
    const { ctx } = this
    for (const p of this.projectiles) {
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#c09000'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
  }
}
