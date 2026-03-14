import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { loadMap } from '../engine/MapLoader'
import { Renderer } from '../engine/Renderer'
import { Game, type GameState } from '../engine/Game'
import { getLevel } from '../data/levels'
import type { TowerDef } from '../data/towers'
import HUD from './HUD'
import EndScreen from './EndScreen'
import './GameView.css'

const HUD_HEIGHT = 88

export default function GameView() {
  const { levelId } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Game | null>(null)
  const scaleRef = useRef(1)

  const [gameState, setGameState] = useState<GameState | null>(null)
  const [selectedTower, setSelectedTower] = useState<TowerDef | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  // Sync selected tower to game
  useEffect(() => {
    if (gameRef.current) gameRef.current.selectedTowerDef = selectedTower
  }, [selectedTower])

  // ESC cancels tower selection
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTower(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Init / re-init game
  useEffect(() => {
    const level = getLevel(Number(levelId))
    if (!level) { navigate('/levels'); return }

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    setLoadError(false)
    setSelectedTower(null)

    let game: Game

    const resize = () => {
      if (!game) return
      const { pixelWidth, pixelHeight } = game['map']
      const availW = container.clientWidth
      const availH = container.clientHeight - HUD_HEIGHT
      const scale = Math.min(availW / pixelWidth, availH / pixelHeight)
      scaleRef.current = scale
      canvas.width = pixelWidth
      canvas.height = pixelHeight
      canvas.style.transform = `scale(${scale})`
      canvas.style.transformOrigin = 'top left'
      canvas.style.left = `${(availW - pixelWidth * scale) / 2}px`
      canvas.style.top = `${HUD_HEIGHT + (availH - pixelHeight * scale) / 2}px`
      ctx.imageSmoothingEnabled = false
    }

    const init = async () => {
      try {
        const mapUrl = `${import.meta.env.BASE_URL}${level.mapFile}`
        const map = await loadMap(mapUrl)
        const renderer = new Renderer(ctx)
        await renderer.loadTilesets(map.tilesets)
        game = new Game(ctx, map, renderer, level.path, level.waves, s => setGameState({ ...s }))
        gameRef.current = game
        resize()
        await game.loadSprites(import.meta.env.BASE_URL)
        game.start()
      } catch (e) {
        console.error('Failed to load game:', e)
        setLoadError(true)
      }
    }

    init()

    const ro = new ResizeObserver(resize)
    ro.observe(container)
    return () => {
      ro.disconnect()
      gameRef.current?.stop()
      gameRef.current = null
    }
  }, [levelId, navigate, resetKey])

  const toCanvas = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / scaleRef.current,
      y: (e.clientY - rect.top) / scaleRef.current,
    }
  }, [])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameRef.current) return
    const { x, y } = toCanvas(e)
    gameRef.current.tryPlaceTower(x, y)
  }, [toCanvas])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameRef.current) return
    const { x, y } = toCanvas(e)
    gameRef.current.setHover(x, y)
  }, [toCanvas])

  const gameOver = gameState?.gameOver || gameState?.victory

  return (
    <div ref={containerRef} className="game-view">
      {gameState && (
        <HUD
          state={gameState}
          selected={selectedTower}
          onSelectTower={setSelectedTower}
          onStartWave={() => gameRef.current?.startNextWave()}
          onToggleSpeed={() => gameRef.current?.toggleSpeed()}
          onQuit={() => navigate('/levels')}
        />
      )}

      {loadError && (
        <div className="game-error">
          Kunne ikke laste kartet.{' '}
          <button onClick={() => navigate('/levels')}>Tilbake</button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="game-canvas"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => gameRef.current?.setHover(-999, -999)}
        style={{ cursor: selectedTower ? 'crosshair' : 'default' }}
      />

      {gameState && gameOver && (
        <EndScreen
          victory={gameState.victory}
          wave={gameState.wave}
          totalWaves={gameState.totalWaves}
          enemiesKilled={gameState.enemiesKilled}
          onRetry={() => setResetKey(k => k + 1)}
          onLevels={() => navigate('/levels')}
        />
      )}
    </div>
  )
}
