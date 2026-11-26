// node tools/sculpt/unpack_cache.mjs  -> restores cache/*.bin from data/models.js
// cache/ is gitignored, so on a fresh checkout run this first; then `build.mjs hero` rebuilds only the hero
// and keeps every other model (including king.bin, which comes from import_elf.mjs and an external GLB).
import fs from 'fs'; import path from 'path'; import zlib from 'zlib'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), cache = path.join(here, 'cache'); fs.mkdirSync(cache, { recursive: true });
const src = fs.readFileSync(path.join(here, '../../data/models.js'), 'utf8'); let n = 0;
for (const m of src.matchAll(/(?:^|\{)([A-Za-z0-9_]+):"([A-Za-z0-9+/=]+)",$/gm)) {
  const f = path.join(cache, m[1] + '.bin'); if (fs.existsSync(f) && !process.argv.includes('--force')) continue;
  fs.writeFileSync(f, zlib.gunzipSync(Buffer.from(m[2], 'base64'))); n++; }
console.log('restored', n, 'models into', cache);
