import { useNavigate } from 'react-router-dom'
import TiledBackground from './TiledBackground'
import './LevelSelect.css'

const BASE = import.meta.env.BASE_URL

function getUnlockedLevels(): number[] {
  try {
    const stored = localStorage.getItem('unlockedLevels')
    return stored ? JSON.parse(stored) : [1]
  } catch {
    return [1]
  }
}

export function unlockLevel(levelId: number): void {
  const unlocked = getUnlockedLevels()
  if (!unlocked.includes(levelId)) {
    unlocked.push(levelId)
    localStorage.setItem('unlockedLevels', JSON.stringify(unlocked))
  }
}

function buildLevels() {
  const unlocked = getUnlockedLevels()
  return [
    { id: 1, name: 'Level 1', unlocked: true },
    { id: 2, name: 'Level 2', unlocked: unlocked.includes(2) },
    { id: 3, name: 'Level 3', unlocked: unlocked.includes(3) },
  ]
}

const paperUrl = `url("${BASE}Assets/UI Elements/UI Elements/Papers/SpecialPaper.png")`
const bannerUrl = `url("${BASE}Assets/UI Elements/UI Elements/Banners/Banner.png")`
const btnRegular = `url("${BASE}Assets/UI Elements/UI Elements/Buttons/BigBlueButton_Regular.png")`
const btnPressed = `url("${BASE}Assets/UI Elements/UI Elements/Buttons/BigBlueButton_Pressed.png")`

export default function LevelSelect() {
  const navigate = useNavigate()
  const levels = buildLevels()

  return (
    <div className="level-select">
      <TiledBackground />
      <div className="level-overlay" />

      <div className="level-content">
        <div
          className="level-heading"
          style={{ '--banner-url': bannerUrl } as React.CSSProperties}
        >
          <h2>Velg Level</h2>
        </div>

        <div className="level-grid">
          {levels.map((level) => (
            <button
              key={level.id}
              className={`level-card ${level.unlocked ? 'unlocked' : 'locked'}`}
              disabled={!level.unlocked}
              onClick={() => level.unlocked && navigate(`/game/${level.id}`)}
              style={{ '--paper-url': paperUrl } as React.CSSProperties}
            >
              <span className="level-number">{level.id}</span>
              <span className="level-name">{level.name}</span>
              {!level.unlocked && <span className="lock-icon">🔒</span>}
            </button>
          ))}
        </div>

        <button
          className="btn-back"
          onClick={() => navigate('/')}
          style={{
            '--btn-regular': btnRegular,
            '--btn-pressed': btnPressed,
          } as React.CSSProperties}
        >
          Tilbake
        </button>
      </div>
    </div>
  )
}
