import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function readJson(relativePath) {
  const absolutePath = path.resolve(PROJECT_ROOT, relativePath);
  return JSON.parse(await fs.readFile(absolutePath, 'utf8'));
}

export async function writeJson(relativePath, data) {
  const absolutePath = path.resolve(PROJECT_ROOT, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, JSON.stringify(data, null, 2), 'utf8');
}

export function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}
