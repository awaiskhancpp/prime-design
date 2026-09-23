/**
 * Copies MapLibre's worker bundle into `public/vendor/maplibre/`.
 *
 * MapLibre GL v6 ships its worker as a separate ES module and derives the URL
 * from its own `import.meta.url`. Once Next has bundled the library that value
 * is no longer an http(s) URL under `node_modules`, so MapLibre resolves an
 * empty worker URL and the map never paints. mapcn's answer upstream is to
 * point the worker at unpkg; serving it from our own origin instead keeps the
 * map working with a strict CSP and with no third-party CDN in the render path.
 *
 * `maplibre-gl-worker.mjs` imports `./maplibre-gl-shared.mjs` relatively, so
 * both files have to land in the same directory.
 *
 * Runs on `postinstall` so the copy cannot drift from the installed version:
 * `src/components/ui/map.tsx` asserts the two agree at runtime in development.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const from = join(root, 'node_modules', 'maplibre-gl', 'dist')
const to = join(root, 'public', 'vendor', 'maplibre')

const { version } = JSON.parse(readFileSync(join(root, 'node_modules', 'maplibre-gl', 'package.json'), 'utf8'))

mkdirSync(to, { recursive: true })
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  copyFileSync(join(from, file), join(to, file))
}
writeFileSync(join(to, 'version.txt'), `${version}\n`)
console.log(`[maplibre] worker ${version} copied to public/vendor/maplibre`)
