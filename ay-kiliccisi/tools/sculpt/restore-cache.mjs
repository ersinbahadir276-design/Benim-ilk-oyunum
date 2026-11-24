// node tools/sculpt/restore-cache.mjs -> refills cache/*.bin from the shipped data/models.js
// (cache/ is git-ignored; without it build.mjs would drop every model it did not rebuild this time)
import fs from 'fs'; import path from 'path'; import zlib from 'zlib'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), cacheDir = path.join(here, 'cache');
fs.mkdirSync(cacheDir, { recursive: true });
const src = fs.readFileSync(path.join(here, '../../data/models.js'), 'utf8');
for (const m of src.matchAll(/(\w+):"([A-Za-z0-9+/=]+)"/g)) {
  const f = path.join(cacheDir, m[1] + '.bin');
  if (fs.existsSync(f) && !process.argv.includes('--force')) continue;
  fs.writeFileSync(f, zlib.gunzipSync(Buffer.from(m[2], 'base64'))); console.log('restored', m[1]);
}
