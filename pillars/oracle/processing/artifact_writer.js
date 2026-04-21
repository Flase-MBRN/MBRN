import fs from 'node:fs/promises';
import path from 'node:path';
import { ORACLE_ARTIFACTS } from '../artifacts.js';

async function writeJson(relativePath, payload) {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return absolutePath;
}

export async function writeOracleArtifacts({ predictionSnapshot, backtestSnapshot, mergedInputs } = {}) {
  const writes = [];

  if (predictionSnapshot) {
    writes.push(writeJson(ORACLE_ARTIFACTS.predictionSnapshot.path, predictionSnapshot));
  }
  if (backtestSnapshot) {
    writes.push(writeJson(ORACLE_ARTIFACTS.backtestSnapshot.path, backtestSnapshot));
  }
  if (mergedInputs) {
    writes.push(writeJson(ORACLE_ARTIFACTS.mergedInputsArtifact.path, mergedInputs));
  }

  const paths = await Promise.all(writes);
  return {
    success: true,
    paths
  };
}
