import type { CSSProperties } from 'react'
import './EndScreen.css'

const BASE = import.meta.env.BASE_URL

const bannerUrl  = `url("${BASE}Assets/UI Elements/UI Elements/Banners/Banner.png")`
const btnBlue    = `url("${BASE}Assets/UI Elements/UI Elements/Buttons/BigBlueButton_Regular.png")`
const btnBluePr  = `url("${BASE}Assets/UI Elements/UI Elements/Buttons/BigBlueButton_Pressed.png")`
const btnRed     = `url("${BASE}Assets/UI Elements/UI Elements/Buttons/BigRedButton_Regular.png")`
const btnRedPr   = `url("${BASE}Assets/UI Elements/UI Elements/Buttons/BigRedButton_Pressed.png")`

interface Props {
  victory: boolean
  wave: number
  totalWaves: number
  enemiesKilled: number
  onRetry: () => void
  onLevels: () => void
}

export default function EndScreen({ victory, wave, totalWaves, enemiesKilled, onRetry, onLevels }: Props) {
  return (
    <div className="end-overlay">
      <div className="end-card" style={{ '--banner-url': bannerUrl } as CSSProperties}>
        <h2 className="end-title">{victory ? 'Seier!' : 'Game Over'}</h2>
        <p className="end-sub">
          {victory
            ? 'Du forsvarte borgen med glans!'
            : `Du nådde wave ${wave} av ${totalWaves}`}
        </p>

        <div className="end-stats">
          <div className="end-stat">
            <span className="stat-label">Wave</span>
            <span className="stat-val">{wave}/{totalWaves}</span>
          </div>
          <div className="end-stat">
            <span className="stat-label">Drept</span>
            <span className="stat-val">{enemiesKilled}</span>
          </div>
        </div>

        <div className="end-buttons">
          <button
            className="end-btn"
            onClick={onRetry}
            style={{
              '--btn': btnBlue,
              '--btn-p': btnBluePr,
            } as CSSProperties}
          >
            Prøv igjen
          </button>
          <button
            className="end-btn secondary"
            onClick={onLevels}
            style={{
              '--btn': btnRed,
              '--btn-p': btnRedPr,
            } as CSSProperties}
          >
            Tilbake
          </button>
        </div>
      </div>
    </div>
  )
}
