import { SpriteSheet, loadImage, type AnimDef } from './SpriteSheet'

const UNIT_ANIMS: Record<string, AnimDef> = {
  idle: { frameW: 192, frameH: 192, frames: 8, fps: 7 },
  run:  { frameW: 192, frameH: 192, frames: 6, fps: 9 },
}

export interface GameSprites {
  goblin: SpriteSheet        // Blue Pawn
  orc: SpriteSheet           // Red Warrior
  arrowBuilding: HTMLImageElement   // Blue Archery
  magicBuilding: HTMLImageElement   // Purple Monastery
}

function loadImageWithError(url: string): Promise<HTMLImageElement> {
  return loadImage(url).catch(() => {
    throw new Error(`Kunne ikke laste bilde: ${url}`)
  })
}

export async function loadGameSprites(base: string): Promise<GameSprites> {
  const p = (path: string) => `${base}${path}`

  const goblin = new SpriteSheet(p('Assets/Units/Blue Units/Pawn/Pawn_Run.png'), UNIT_ANIMS)
  const orc    = new SpriteSheet(p('Assets/Units/Red Units/Warrior/Warrior_Run.png'), UNIT_ANIMS)

  const [arrowBuilding, magicBuilding] = await Promise.all([
    loadImageWithError(p('Assets/Buildings/Blue Buildings/Archery.png')),
    loadImageWithError(p('Assets/Buildings/Purple Buildings/Monastery.png')),
    goblin.waitForLoad(),
    orc.waitForLoad(),
  ])

  return { goblin, orc, arrowBuilding, magicBuilding }
}
