export interface AnimDef {
  frameW: number
  frameH: number
  frames: number
  fps: number
}

export class SpriteSheet {
  private img: HTMLImageElement
  readonly anims: Record<string, AnimDef>
  loaded = false

  constructor(src: string, anims: Record<string, AnimDef>) {
    this.anims = anims
    this.img = new Image()
    this.img.onload = () => { this.loaded = true }
    this.img.src = src
  }

  waitForLoad(): Promise<void> {
    if (this.loaded) return Promise.resolve()
    return new Promise((res, rej) => {
      this.img.addEventListener('load', () => { this.loaded = true; res() }, { once: true })
      this.img.addEventListener('error', rej, { once: true })
    })
  }

  /** Draw a frame. x,y = top-left of destination. */
  draw(
    ctx: CanvasRenderingContext2D,
    anim: string,
    t: number,          // elapsed time (seconds)
    x: number,
    y: number,
    w: number,
    h: number,
    flipH = false,
  ): void {
    if (!this.loaded) return
    const a = this.anims[anim]
    if (!a) return
    const frame = Math.floor(t * a.fps) % a.frames
    const sx = frame * a.frameW

    ctx.save()
    ctx.imageSmoothingEnabled = false
    if (flipH) {
      ctx.translate(x + w, y)
      ctx.scale(-1, 1)
      ctx.drawImage(this.img, sx, 0, a.frameW, a.frameH, 0, 0, w, h)
    } else {
      ctx.drawImage(this.img, sx, 0, a.frameW, a.frameH, x, y, w, h)
    }
    ctx.restore()
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}
