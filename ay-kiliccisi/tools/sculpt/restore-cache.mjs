// node tools/sculpt/restore-cache.mjs  -> unpacks data/models.js back into tools/sculpt/cache/*.bin
// Run this on a fresh clone BEFORE `build.mjs <one model>`: build.mjs reassembles data/models.js from the cache,
// so with an empty cache a single-model build would drop every other model (and `king` cannot be re-sculpted).
import fs from 'fs'; import path from 'path'; import zlib from 'zlib'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), cache = path.join(here, 'cache');
fs.mkdirSync(cache, { recursive: true });
const src = fs.readFileSync(path.join(here, '../../data/models.js'), 'utf8'); let n = 0;
for (const m of src.matchAll(/([A-Za-z0-9_]+):"([^"]+)"/g)) { fs.writeFileSync(path.join(cache, m[1] + '.bin'), zlib.gunzipSync(Buffer.from(m[2], 'base64'))); n++; }
console.log('restored', n, 'models into', cache);
