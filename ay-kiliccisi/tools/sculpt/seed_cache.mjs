// node tools/sculpt/seed_cache.mjs -> unpacks data/models.js into cache/*.bin so that `build.mjs <name>`
// rebuilds only that model and re-assembles the rest unchanged (cache/ is not committed; king has no source).
import fs from 'fs'; import path from 'path'; import zlib from 'zlib'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), cacheDir = path.join(here, 'cache');
fs.mkdirSync(cacheDir, { recursive: true });
const src = fs.readFileSync(path.join(here, '../../data/models.js'), 'utf8');
for (const m of src.matchAll(/(?:^|\{)([A-Za-z0-9_]+):"([^"]+)",$/gm)) {
  const f = path.join(cacheDir, m[1] + '.bin');
  if (fs.existsSync(f) && !process.argv.includes('--force')) continue;
  fs.writeFileSync(f, zlib.gunzipSync(Buffer.from(m[2], 'base64'))); console.log('seeded', m[1]);
}
