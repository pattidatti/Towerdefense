import { useNavigate } from 'react-router-dom'
import TiledBackground from './TiledBackground'
import './LevelSelect.css'

const BASE = import.meta.env.BASE_URL

const LEVELS = [
  { id: 1, name: 'Level 1', unlocked: true },
  { id: 2, name: 'Level 2', unlocked: false },
  { id: 3, name: 'Level 3', unlocked: false },
]

const paperUrl = `url("${BASE}Assets/UI Elements/UI Elements/Papers/SpecialPaper.png")`
const bannerUrl = `url("${BASE}Assets/UI Elements/UI Elements/Banners/Banner.png")`
const btnRegular = `url("${BASE}Assets/UI Elements/UI Elements/Buttons/BigBlueButton_Regular.png")`
const btnPressed = `url("${BASE}Assets/UI Elements/UI Elements/Buttons/BigBlueButton_Pressed.png")`

export default function LevelSelect() {
  const navigate = useNavigate()

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
          {LEVELS.map((level) => (
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
