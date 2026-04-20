import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPostV3RoadmapMarkdown } from '../../pillars/meta_generator/content/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outputPath = path.join(repoRoot, '001_POST_V3_ROADMAP.md');

async function main() {
  await fs.writeFile(outputPath, buildPostV3RoadmapMarkdown(), 'utf8');
  console.log(`Generated ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
