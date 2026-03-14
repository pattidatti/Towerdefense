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
  onToggleSpeed: () => void
  onQuit: () => void
}

export default function HUD({ state, selected, onSelectTower, onStartWave, onToggleSpeed, onQuit }: Props) {
  return (
    <div className="hud">
      {/* Wave notification banner */}
      {state.waveNotify && (
        <div className="wave-banner">
          Wave {state.wave} angriper!
        </div>
      )}

      {/* Top bar */}
      <div className="hud-top">
        <div className="hud-stat">
          <span className="hud-icon">❤️</span>
          <span className={`hud-value ${state.lives <= 5 ? 'danger' : ''}`}>{state.lives}</span>
        </div>

        <div className="hud-stat">
          <span className="hud-icon">💰</span>
          <span className="hud-value">{state.gold}</span>
        </div>

        <div className="hud-stat">
          <span className="hud-label">Wave</span>
          <span className="hud-value">{state.wave}/{state.totalWaves}</span>
        </div>

        <div className="hud-right">
          {state.canStartWave && !state.gameOver && !state.victory && (
            <button className="hud-btn wave-btn" onClick={onStartWave}>
              ▶ Wave {state.wave + 1}
            </button>
          )}
          {state.waveActive && (
            <span className="hud-badge active">Angrep pågår</span>
          )}

          <button
            className={`hud-btn speed-btn ${state.speed === 2 ? 'fast' : ''}`}
            onClick={onToggleSpeed}
            title="Bytt hastighet"
          >
            {state.speed === 1 ? '▶▶ 2x' : '▶ 1x'}
          </button>

          <button className="hud-btn quit-btn" onClick={onQuit}>Avslutt</button>
        </div>
      </div>

      {/* Tower selection bar */}
      <div className="hud-towers">
        <span className="hud-label towers-label">Tårn:</span>
        {TOWER_OPTIONS.map(def => {
          const canAfford = state.gold >= def.cost
          return (
            <button
              key={def.id}
              className={`tower-btn ${selected?.id === def.id ? 'active' : ''} ${!canAfford ? 'broke' : ''}`}
              onClick={() => onSelectTower(selected?.id === def.id ? null : def)}
              title={`${def.name} — Kost: ${def.cost}g | Rekkevidde: ${def.range} | Skade: ${def.damage} | CD: ${def.cooldown}s`}
            >
              <span className="tower-icon" style={{ background: def.color }} />
              <span className="tower-name">{def.name}</span>
              <span className={`tower-cost ${!canAfford ? 'cant-afford' : ''}`}>{def.cost}g</span>
            </button>
          )
        })}
        {selected && (
          <span className="hud-hint">Klikk kart for å plassere · ESC for å avbryte</span>
        )}
      </div>
    </div>
  )
}
