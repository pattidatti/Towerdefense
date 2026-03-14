import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <div className="landing-content">
        <h1 className="landing-title">Tower Defense</h1>
        <button
          className="btn-primary"
          onClick={() => navigate('/levels')}
        >
          Start Spill
        </button>
      </div>
    </div>
  )
}
