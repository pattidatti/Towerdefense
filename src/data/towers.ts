export interface TowerDef {
  id: string
  name: string
  range: number    // pixels
  damage: number
  cooldown: number // seconds between shots
  cost: number
  color: string
}

export const ARROW_TOWER: TowerDef = {
  id: 'arrow',
  name: 'Bueskytter',
  range: 120,
  damage: 15,
  cooldown: 1.0,
  cost: 50,
  color: '#5b8dd9',
}

export const MAGIC_TOWER: TowerDef = {
  id: 'magic',
  name: 'Magitårn',
  range: 90,
  damage: 35,
  cooldown: 1.8,
  cost: 80,
  color: '#9b59b6',
}
