import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function copyDirIfPresent(sourceName, targetName = sourceName) {
  const source = path.join(ROOT, sourceName);
  const target = path.join(PUBLIC_DIR, targetName);
  if (!(await exists(source))) return;
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, { recursive: true, force: true });
  console.log(`Copied ${sourceName}/ to public/${targetName}/`);
}

async function copyFileIfPresent(fileName) {
  const source = path.join(ROOT, fileName);
  const target = path.join(PUBLIC_DIR, fileName);
  if (!(await exists(source))) return;
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
  console.log(`Copied ${fileName} to public/${fileName}`);
}

await fs.mkdir(PUBLIC_DIR, { recursive: true });
await copyDirIfPresent('img');
await copyDirIfPresent('images');
await copyFileIfPresent('google591de4da04d840b2.html');
