// Suma gzip de dist/assets/*.js; falla si > 250 KB.
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
const dir = 'dist/assets';
const total = readdirSync(dir).filter((f) => f.endsWith('.js'))
  .reduce((s, f) => s + gzipSync(readFileSync(`${dir}/${f}`)).length, 0);
console.log(`JS gzip: ${(total / 1024).toFixed(1)} KB`);
if (total > 250 * 1024) { console.error('Excede 250 KB'); process.exit(1); }
