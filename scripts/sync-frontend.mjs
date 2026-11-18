
import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));

const source = path.join(root, 'dist', 'JobLog', 'browser');
const destination = path.join(
  root,
  'backend',
  'src',
  'main',
  'resources',
  'static'
);

// Verify the Angular build exists before changing anything.
try {
  const indexFile = path.join(source, 'index.html');

  if (!(await stat(indexFile)).isFile()) {
    throw new Error('index.html is not a file');
  }
} catch {
  console.error('Angular build not found. Run npm run build first.');
  process.exit(1);
}

// Remove old frontend files and copy the latest build.
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });

for (const entry of await readdir(source)) {
  await cp(
    path.join(source, entry),
    path.join(destination, entry),
    { recursive: true }
  );
}

console.log('Angular frontend synchronized with Spring Boot.');
