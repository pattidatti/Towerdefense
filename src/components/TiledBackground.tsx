import { useEffect, useRef } from 'react'

// Grass tiles from level1.tmx (GID-based, 1-indexed)
// Pattern: 2x2 block of 4 tiles that tiles seamlessly
const GRASS_TILES = [
  [20, 21],
  [38, 39],
]
const TILE_SIZE = 32
const TILESET_COLS = 18

function getTileXY(gid: number) {
  const idx = gid - 1
  const col = idx % TILESET_COLS
  const row = Math.floor(idx / TILESET_COLS)
  return { sx: col * TILE_SIZE, sy: row * TILE_SIZE }
}

interface Props {
  className?: string
}

export default function TiledBackground({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = import.meta.env.BASE_URL + 'Assets/Terrain/Tileset/Tilemap_color1.png'

    const draw = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      ctx.imageSmoothingEnabled = false

      const scale = 2
      const ts = TILE_SIZE * scale
      const patternW = GRASS_TILES[0].length * ts
      const patternH = GRASS_TILES.length * ts

      for (let y = 0; y < canvas.height + ts; y += patternH) {
        for (let x = 0; x < canvas.width + ts; x += patternW) {
          GRASS_TILES.forEach((row, ty) => {
            row.forEach((gid, tx) => {
              const { sx, sy } = getTileXY(gid)
              ctx.drawImage(img, sx, sy, TILE_SIZE, TILE_SIZE, x + tx * ts, y + ty * ts, ts, ts)
            })
          })
        }
      }
    }

    img.onload = draw

    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
      }}
    />
  )
}
