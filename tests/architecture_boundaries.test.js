import fs from 'fs';
import path from 'path';

const REPO_ROOT = process.cwd();

function walkJsFiles(rootDir) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'coverage' || entry.name.startsWith('.git')) {
      continue;
    }

    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkJsFiles(fullPath));
    } else if (entry.isFile() && fullPath.endsWith('.js')) {
      results.push(fullPath);
    }
  }

  return results;
}

function getImportMatches(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  return [...source.matchAll(/import\s+.+?\s+from\s+['"](.+?)['"]/g)].map((match) => match[1]);
}

function normalize(filePath) {
  return filePath.split(path.sep).join('/');
}

describe('architecture boundaries', () => {
  test('shared/core does not import bridges, commerce or frontend_os', () => {
    const files = walkJsFiles(path.join(REPO_ROOT, 'shared', 'core'))
      .filter((file) => !/shared\/core\/(actions|error_logger|api|supabase_client)\.js$/.test(normalize(file)));

    files.forEach((file) => {
      const imports = getImportMatches(file);
      imports.forEach((specifier) => {
        expect(specifier).not.toMatch(/bridges|commerce|pillars\/frontend_os|pillars\/monetization/);
      });
    });
  });

  test('shared/ui stays business-blind', () => {
    const files = walkJsFiles(path.join(REPO_ROOT, 'shared', 'ui'))
      .filter((file) => !/shared\/ui\/(render_auth|render_legal_page|render_landing|navigation|legal_system)\.js$/.test(normalize(file)))
      .filter((file) => !/shared\/ui\/base_components\/(auth_form|navigation|legal_rail)\.js$/.test(normalize(file)))
      .filter((file) => !/shared\/ui\/widgets\/sentiment_widget\.js$/.test(normalize(file)));

    files.forEach((file) => {
      const imports = getImportMatches(file);
      imports.forEach((specifier) => {
        expect(specifier).not.toMatch(/dimensions|apps|pillars\/monetization|pillars\/oracle|pillars\/frontend_os/);
      });
    });
  });

  test('frontend_os does not import bridges, oracle processing or monetization business logic directly', () => {
    const files = walkJsFiles(path.join(REPO_ROOT, 'pillars', 'frontend_os'));

    files.forEach((file) => {
      const imports = getImportMatches(file);
      imports.forEach((specifier) => {
        expect(specifier).not.toMatch(/bridges|pillars\/oracle|pillars\/monetization/);
      });
    });
  });

  test('pillars/monetization does not import commerce implementations directly', () => {
    const files = walkJsFiles(path.join(REPO_ROOT, 'pillars', 'monetization'));

    files.forEach((file) => {
      const imports = getImportMatches(file);
      imports.forEach((specifier) => {
        expect(specifier).not.toMatch(/commerce/);
      });
    });
  });
});
