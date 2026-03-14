import type { GameState } from '../engine/Game'
import type { TowerDef } from '../data/towers'
import { ARROW_TOWER, MAGIC_TOWER } from '../data/towers'
import './HUD.css'

const TOWER_OPTIONS: TowerDef[] = [ARROW_TOWER, MAGIC_TOWER]

interface Props {
  state: GameState
  selected: TowerDef | null
  onSelectTower: (def: TowerDef | null) => void
  onStartWave: () => void
  onQuit: () => void
}

export default function HUD({ state, selected, onSelectTower, onStartWave, onQuit }: Props) {
  return (
    <div className="hud">
      {/* Top bar */}
      <div className="hud-top">
        <div className="hud-stat">
          <span className="hud-icon">❤️</span>
          <span className={state.lives <= 5 ? 'hud-value danger' : 'hud-value'}>{state.lives}</span>
        </div>
        <div className="hud-stat">
          <span className="hud-icon">💰</span>
          <span className="hud-value">{state.gold}</span>
        </div>
        <div className="hud-stat">
          <span className="hud-label">Wave</span>
          <span className="hud-value">{state.wave} / {state.totalWaves}</span>
        </div>

        {state.canStartWave && !state.gameOver && !state.victory && (
          <button className="hud-btn wave-btn" onClick={onStartWave}>
            Start Wave {state.wave + 1}
          </button>
        )}
        {state.waveActive && (
          <span className="hud-badge active">Wave pågår…</span>
        )}
        {state.victory && <span className="hud-badge victory">Seier! 🏆</span>}
        {state.gameOver && <span className="hud-badge gameover">Game Over 💀</span>}

        <button className="hud-btn quit-btn" onClick={onQuit}>Avslutt</button>
      </div>

      {/* Tower selection bar */}
      <div className="hud-towers">
        {TOWER_OPTIONS.map(def => (
          <button
            key={def.id}
            className={`tower-btn ${selected?.id === def.id ? 'active' : ''}`}
            onClick={() => onSelectTower(selected?.id === def.id ? null : def)}
            title={`${def.name} — Kost: ${def.cost}g | Rekkevidde: ${def.range}px | Skade: ${def.damage}`}
          >
            <span className="tower-icon" style={{ background: def.color }} />
            <span className="tower-name">{def.name}</span>
            <span className="tower-cost">{def.cost}g</span>
          </button>
        ))}
        {selected && (
          <span className="hud-hint">Klikk på kartet for å plassere</span>
        )}
      </div>
    </div>
  )
}
