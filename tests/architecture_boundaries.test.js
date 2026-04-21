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

function isOracleApplicationReadModel(filePath) {
  const normalized = normalize(filePath);
  return normalized.includes('shared/application/read_models/') && normalized.includes('oracle');
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

  test('frontend_os consumes only application, registry, contract and ui layers', () => {
    const files = walkJsFiles(path.join(REPO_ROOT, 'pillars', 'frontend_os'));

    files.forEach((file) => {
      const imports = getImportMatches(file);
      imports.forEach((specifier) => {
        expect(specifier).not.toMatch(/bridges|commerce|pillars\/oracle|pillars\/monetization/);
        if (specifier.includes('shared/core/')) {
          expect(specifier).toMatch(/shared\/core\/(registries|contracts)\//);
        }
        expect(specifier).not.toContain('shared/core/i18n.js');
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

  test('runtime and tests no longer import deprecated UI or legal facades', () => {
    const files = walkJsFiles(REPO_ROOT);

    files.forEach((file) => {
      const imports = getImportMatches(file);
      imports.forEach((specifier) => {
        expect(specifier).not.toContain('shared/ui/error_boundary.js');
        expect(specifier).not.toContain('shared/core/legal_storage.js');
      });
    });
  });

  test('oracle application read models consume only pillar outputs, not scripts, shared data or python bridges', () => {
    const files = walkJsFiles(path.join(REPO_ROOT, 'shared', 'application', 'read_models'))
      .filter((file) => isOracleApplicationReadModel(file));

    files.forEach((file) => {
      const imports = getImportMatches(file);
      imports.forEach((specifier) => {
        expect(specifier).not.toMatch(/scripts\/oracle|shared\/data|bridges\/python/);
        if (specifier.includes('pillars/oracle/')) {
          expect(specifier).toMatch(/pillars\/oracle\/(browser_read|backtesting|fusion|signals|snapshots)\//);
        }
      });
    });
  });

  test('oracle snapshot literals stay confined to pillars/oracle/artifacts.js', () => {
    const files = walkJsFiles(REPO_ROOT);
    const oracleSnapshotLiterals = ['oracle_prediction.json', 'oracle_backtest.json'];

    files.forEach((file) => {
      const normalized = normalize(file);
      const source = fs.readFileSync(file, 'utf8');

      oracleSnapshotLiterals.forEach((literal) => {
        if (!source.includes(literal)) return;
        if (normalized.endsWith('pillars/oracle/artifacts.js')) return;
        if (normalized.includes('/tests/')) return;

        throw new Error(`Oracle snapshot literal '${literal}' must not appear outside pillars/oracle/artifacts.js: ${normalized}`);
      });
    });
  });

  test('oracle signals and fusion are derived only inside the pillar snapshot flow', () => {
    const files = walkJsFiles(REPO_ROOT)
      .filter((file) => !normalize(file).includes('/tests/'));

    files.forEach((file) => {
      const normalized = normalize(file);
      const imports = getImportMatches(file);
      const importsSignals = imports.some((specifier) => specifier.includes('pillars/oracle/signals'));
      const importsFusion = imports.some((specifier) => specifier.includes('pillars/oracle/fusion'));

      if (importsSignals || importsFusion) {
        expect(normalized).toBe('pillars/oracle/snapshots/index.js');
      }
    });
  });

  test('scripts/oracle stays thin and pillar-owned', () => {
    const thinWrapperFiles = [
      path.join(REPO_ROOT, 'scripts', 'oracle', 'oracle_core.py'),
      path.join(REPO_ROOT, 'scripts', 'oracle', 'backfill_history.py'),
      path.join(REPO_ROOT, 'scripts', 'oracle', 'data_bridge.py'),
      path.join(REPO_ROOT, 'scripts', 'oracle', 'correlation_matrix.py'),
      path.join(REPO_ROOT, 'scripts', 'oracle', 'numerology_engine.py')
    ];

    thinWrapperFiles.forEach((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      expect(source).toContain('pillars.oracle.processing.python');
    });
  });

  test('productive monetization paths no longer carry legacy access and tier labels', () => {
    const productiveFiles = [
      path.join(REPO_ROOT, 'shared', 'core', 'config', 'index.js'),
      path.join(REPO_ROOT, 'supabase', 'functions', 'stripe-webhook', 'index.ts'),
      path.join(REPO_ROOT, 'supabase', 'migrations', '00_full_system_init.sql'),
      path.join(REPO_ROOT, 'supabase', 'migrations', '11_payment_schema.sql')
    ];

    productiveFiles.forEach((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      expect(source).not.toMatch(/\bPAID_PRO\b|\bSpark\b|premium_monthly|oracle_credits_/);
    });
  });
});
