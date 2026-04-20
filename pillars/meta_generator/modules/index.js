export function buildModuleScaffold({ moduleName, description = '', exports = [] } = {}) {
  const safeModuleName = moduleName || 'new_module';
  const exportBlock = exports.length
    ? exports.map((name) => `export function ${name}() {\n  return null;\n}`).join('\n\n')
    : 'export function run() {\n  return null;\n}';

  return {
    path: `${safeModuleName}/index.js`,
    contents: `/**\n * ${description || safeModuleName}\n */\n\n${exportBlock}\n`
  };
}
