import type { GameMap, TilesetRef } from './MapLoader'

export class Renderer {
  private ctx: CanvasRenderingContext2D
  private images = new Map<string, HTMLImageElement>()

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  async loadTilesets(tilesets: TilesetRef[]): Promise<void> {
    await Promise.all(
      tilesets.map(
        ts =>
          new Promise<void>((resolve, reject) => {
            if (this.images.has(ts.imageSource)) { resolve(); return }
            const img = new Image()
            img.onload = () => { this.images.set(ts.imageSource, img); resolve() }
            img.onerror = reject
            img.src = ts.imageSource
          }),
      ),
    )
  }

  drawMap(map: GameMap): void {
    const { ctx } = this
    ctx.imageSmoothingEnabled = false

    for (const layer of map.layers) {
      for (let row = 0; row < layer.height; row++) {
        for (let col = 0; col < layer.width; col++) {
          const gid = layer.tiles[row][col]
          if (gid === 0) continue

          const ts = this.findTileset(map.tilesets, gid)
          if (!ts) continue
          const img = this.images.get(ts.imageSource)
          if (!img) continue

          const localId = gid - ts.firstGid
          const srcX = (localId % ts.columns) * ts.tileWidth
          const srcY = Math.floor(localId / ts.columns) * ts.tileHeight

          ctx.drawImage(
            img,
            srcX, srcY, ts.tileWidth, ts.tileHeight,
            col * map.tileWidth, row * map.tileHeight,
            map.tileWidth, map.tileHeight,
          )
        }
      }
    }
  }

  private findTileset(tilesets: TilesetRef[], gid: number): TilesetRef | null {
    for (let i = tilesets.length - 1; i >= 0; i--) {
      if (gid >= tilesets[i].firstGid) return tilesets[i]
    }
    return null
  }
}
