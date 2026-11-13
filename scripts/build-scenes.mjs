// Bundles the 3D scenes (scripts/scene3d/*) with Three.js into one minified file the site loads on demand.
// Usage (from the scripts/ folder):  npm install   then   npm run build:3d
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
await build({
  entryPoints: [path.join(here, 'scene3d/entry.js')],
  bundle: true, minify: true, format: 'esm', target: 'es2020', legalComments: 'none',
  outfile: path.join(here, '../assets/js/scene3d.js')
});
console.log('assets/js/scene3d.js rebuilt. Regenerate the posters next: npm run posters');
