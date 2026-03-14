import { HashRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import LevelSelect from './components/LevelSelect'
import GameView from './components/GameView'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/levels" element={<LevelSelect />} />
        <Route path="/game/:levelId" element={<GameView />} />
      </Routes>
    </HashRouter>
  )
}
