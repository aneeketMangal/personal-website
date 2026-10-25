import {cp, mkdir, readFile, rename, rm, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const staging = path.join(root, '.build');
const output = path.join(root, 'dist');
const html = await readFile(path.join(staging, 'index.html'), 'utf8');
if (!html.includes('<div id="root"></div>')) throw new Error('Incomplete build: no application root');
await mkdir(output, {recursive: true});
// Never delete published hashed assets: a tab opened before an update may still need them.
await cp(staging, output, {
  recursive: true,
  force: true,
  filter: source => source !== path.join(staging, 'index.html')
});
// Publish the entry point only after all of its files exist, with one atomic rename.
await writeFile(path.join(output, '.index-next.html'), html);
await rename(path.join(output, '.index-next.html'), path.join(output, 'index.html'));
await rm(staging, {recursive: true, force: true});
console.log('Published dist/ atomically; existing hashed assets retained for open tabs.');
