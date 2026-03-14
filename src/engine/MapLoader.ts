export interface TileLayer {
  id: number
  name: string
  width: number
  height: number
  tiles: number[][] // [row][col] = GID (0 = empty)
}

export interface TilesetRef {
  firstGid: number
  imageSource: string
  tileWidth: number
  tileHeight: number
  columns: number
}

export interface GameMap {
  width: number
  height: number
  tileWidth: number
  tileHeight: number
  pixelWidth: number
  pixelHeight: number
  layers: TileLayer[]
  tilesets: TilesetRef[]
}

function resolveUrl(relativePath: string, fromUrl: string): string {
  return new URL(relativePath, fromUrl).href
}

export async function loadMap(mapUrl: string): Promise<GameMap> {
  const parser = new DOMParser()

  // Fetch and parse .tmx
  const tmxText = await fetch(mapUrl).then(r => r.text())
  const tmxDoc = parser.parseFromString(tmxText, 'text/xml')
  const mapEl = tmxDoc.querySelector('map')!

  const width = parseInt(mapEl.getAttribute('width')!)
  const height = parseInt(mapEl.getAttribute('height')!)
  const tileWidth = parseInt(mapEl.getAttribute('tilewidth')!)
  const tileHeight = parseInt(mapEl.getAttribute('tileheight')!)

  // Parse tilesets (may reference external .tsx files)
  const tilesets: TilesetRef[] = []
  for (const el of tmxDoc.querySelectorAll('tileset')) {
    const firstGid = parseInt(el.getAttribute('firstgid')!)
    const source = el.getAttribute('source')

    if (source) {
      const tsxUrl = resolveUrl(source, mapUrl)
      const tsxText = await fetch(tsxUrl).then(r => r.text())
      const tsxDoc = parser.parseFromString(tsxText, 'text/xml')
      const tsxEl = tsxDoc.querySelector('tileset')!
      const imgEl = tsxDoc.querySelector('image')!

      tilesets.push({
        firstGid,
        imageSource: resolveUrl(imgEl.getAttribute('source')!, tsxUrl),
        tileWidth: parseInt(tsxEl.getAttribute('tilewidth')!),
        tileHeight: parseInt(tsxEl.getAttribute('tileheight')!),
        columns: parseInt(tsxEl.getAttribute('columns')!),
      })
    }
  }

  // Parse tile layers
  const layers: TileLayer[] = []
  for (const layerEl of tmxDoc.querySelectorAll('layer')) {
    const lw = parseInt(layerEl.getAttribute('width')!)
    const lh = parseInt(layerEl.getAttribute('height')!)
    const dataEl = layerEl.querySelector('data')!
    const encoding = dataEl.getAttribute('encoding')

    const tiles: number[][] = []
    if (encoding === 'csv') {
      const flat = dataEl.textContent!.trim().split(',').map(n => parseInt(n.trim()))
      for (let row = 0; row < lh; row++) {
        tiles.push(flat.slice(row * lw, (row + 1) * lw))
      }
    }

    layers.push({
      id: parseInt(layerEl.getAttribute('id')!),
      name: layerEl.getAttribute('name') ?? '',
      width: lw,
      height: lh,
      tiles,
    })
  }

  return {
    width,
    height,
    tileWidth,
    tileHeight,
    pixelWidth: width * tileWidth,
    pixelHeight: height * tileHeight,
    layers,
    tilesets,
  }
}
