// node tools/sculpt/seed-cache.mjs -> unpacks data/models.js into tools/sculpt/cache/*.bin so build.mjs <name> rebuilds only that model
import fs from 'fs'; import path from 'path'; import zlib from 'zlib'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), src = fs.readFileSync(path.join(here, '../../data/models.js'), 'utf8');
fs.mkdirSync(path.join(here, 'cache'), { recursive: true });
for (const m of src.matchAll(/(?:^|\{)(\w+):"([A-Za-z0-9+/=]+)",$/gm)) {
  const f = path.join(here, 'cache', m[1] + '.bin');
  if (fs.existsSync(f) && !process.argv.includes('--force')) continue;
  fs.writeFileSync(f, zlib.gunzipSync(Buffer.from(m[2], 'base64'))); console.log('seeded', m[1]);
}
