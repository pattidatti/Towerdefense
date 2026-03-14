import { useNavigate, useParams } from 'react-router-dom'
import './GameView.css'

export default function GameView() {
  const { levelId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="game-view">
      <div className="game-hud">
        <span>Level {levelId}</span>
        <button className="btn-back-small" onClick={() => navigate('/levels')}>
          Avslutt
        </button>
      </div>
      <canvas id="game-canvas" className="game-canvas" />
    </div>
  )
}
