import { useNavigate } from 'react-router-dom'
import './LevelSelect.css'

const LEVELS = [
  { id: 1, name: 'Level 1', unlocked: true },
  { id: 2, name: 'Level 2', unlocked: false },
  { id: 3, name: 'Level 3', unlocked: false },
]

export default function LevelSelect() {
  const navigate = useNavigate()

  return (
    <div className="level-select">
      <h2 className="level-select-title">Velg Level</h2>
      <div className="level-grid">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            className={`level-card ${level.unlocked ? 'unlocked' : 'locked'}`}
            disabled={!level.unlocked}
            onClick={() => level.unlocked && navigate(`/game/${level.id}`)}
          >
            <span className="level-number">{level.id}</span>
            <span className="level-name">{level.name}</span>
            {!level.unlocked && <span className="lock-icon">🔒</span>}
          </button>
        ))}
      </div>
      <button className="btn-back" onClick={() => navigate('/')}>
        Tilbake
      </button>
    </div>
  )
}
