import { GOBLIN, ORC } from './enemies'
import type { WaveDef } from '../engine/Wave'
import type { PathPoint } from '../engine/Game'

export interface LevelData {
  id: number
  name: string
  mapFile: string
  path: PathPoint[]
  waves: WaveDef[]
}

export const LEVELS: LevelData[] = [
  {
    id: 1,
    name: 'Level 1',
    mapFile: 'Maps/level1.tmx',
    // S-curve path across 30x20 map
    path: [
      { col: -1, row: 3 },
      { col: 9,  row: 3 },
      { col: 9,  row: 9 },
      { col: 20, row: 9 },
      { col: 20, row: 16 },
      { col: 30, row: 16 },
    ],
    waves: [
      { groups: [{ def: GOBLIN, count: 8, interval: 1.2 }] },
      { groups: [{ def: GOBLIN, count: 6, interval: 1.0 }, { def: ORC, count: 2, interval: 2.0 }] },
      { groups: [{ def: ORC, count: 5, interval: 1.5 }, { def: GOBLIN, count: 4, interval: 0.8 }] },
    ],
  },
]

export function getLevel(id: number): LevelData | undefined {
  return LEVELS.find(l => l.id === id)
}
