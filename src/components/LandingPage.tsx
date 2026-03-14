import { useNavigate } from 'react-router-dom'
import TiledBackground from './TiledBackground'
import './LandingPage.css'

const BASE = import.meta.env.BASE_URL

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <TiledBackground />

      <div className="landing-card">
        <div
          className="landing-banner"
          style={{
            '--banner-url': `url("${BASE}Assets/UI Elements/UI Elements/Banners/Banner.png")`,
          } as React.CSSProperties}
        >
          <h1 className="landing-title">Tower Defense</h1>
        </div>

        <GameButton onClick={() => navigate('/levels')}>
          Start Spill
        </GameButton>
      </div>
    </div>
  )
}

function GameButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className="game-btn"
      onClick={onClick}
      onMouseDown={e => (e.currentTarget.dataset.pressed = '1')}
      onMouseUp={e => delete e.currentTarget.dataset.pressed}
      onMouseLeave={e => delete e.currentTarget.dataset.pressed}
      style={{
        '--btn-regular': `url("${BASE}Assets/UI Elements/UI Elements/Buttons/BigBlueButton_Regular.png")`,
        '--btn-pressed': `url("${BASE}Assets/UI Elements/UI Elements/Buttons/BigBlueButton_Pressed.png")`,
      } as React.CSSProperties}
    >
      {children}
    </button>
  )
}
