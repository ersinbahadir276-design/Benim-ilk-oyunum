// node tools/sculpt/seed_cache.mjs — rebuilds tools/sculpt/cache/*.bin from data/models.js so that
// rebuilding ONE model does not drop the others (the cache is not in git; king.bin comes from a GLB import).
import fs from 'fs'; import path from 'path'; import zlib from 'zlib'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), cache = path.join(here, 'cache');
fs.mkdirSync(cache, { recursive: true });
const src = fs.readFileSync(path.join(here, '../../data/models.js'), 'utf8');
for (const m of src.matchAll(/^(\w+):"([^"]+)"/gm)) { const f = path.join(cache, m[1] + '.bin');
  if (fs.existsSync(f)) continue; fs.writeFileSync(f, zlib.gunzipSync(Buffer.from(m[2], 'base64'))); console.log('seeded', m[1]); }
