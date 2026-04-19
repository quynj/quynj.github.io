import { mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const photosDir = path.join(rootDir, 'public', 'photos')
const manifestPath = path.join(photosDir, 'manifest.json')
const imageExtensions = new Set(['.avif', '.gif', '.jpg', '.jpeg', '.png', '.webp'])

function formatPhotoTitle(name, index) {
  const title = name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()

  return title || `Photo ${index + 1}`
}

await mkdir(photosDir, { recursive: true })

const files = await readdir(photosDir, { withFileTypes: true })
const manifest = files
  .filter((file) => file.isFile())
  .map((file) => file.name)
  .filter((name) => imageExtensions.has(path.extname(name).toLowerCase()))
  .sort((left, right) => left.localeCompare(right))
  .map((name, index) => ({
    id: `${name}-${index}`,
    file: name,
    title: formatPhotoTitle(name, index),
  }))

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8')

console.log(`Generated photo manifest with ${manifest.length} item(s)`)
