export interface EnemyDef {
  id: string
  label: string
  hp: number
  speed: number   // pixels per second
  reward: number  // gold on kill
  color: string
}

export const GOBLIN: EnemyDef = {
  id: 'goblin',
  label: 'Goblin',
  hp: 60,
  speed: 80,
  reward: 10,
  color: '#6abf40',
}

export const ORC: EnemyDef = {
  id: 'orc',
  label: 'Orc',
  hp: 180,
  speed: 48,
  reward: 25,
  color: '#a83232',
}
