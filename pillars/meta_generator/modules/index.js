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

export function buildFrontendSurfaceScaffold(blueprint = {}) {
  const appId = blueprint.appId || 'new_surface';

  return {
    path: `pillars/frontend_os/app_surfaces/${appId}_surface.js`,
    contents: `import { buildSurfaceCopyBundle } from '../../meta_generator/content/index.js';\n\nexport function render${appId.charAt(0).toUpperCase()}${appId.slice(1)}Surface() {\n  return buildSurfaceCopyBundle('${appId}');\n}\n`
  };
}

export function buildSharedLogicScaffold(blueprint = {}) {
  const appId = blueprint.appId || 'new_logic';

  return {
    path: `shared/application/${appId}_runtime.js`,
    contents: `export function load${appId.charAt(0).toUpperCase()}${appId.slice(1)}Runtime() {\n  return { id: '${appId}', ready: true };\n}\n`
  };
}

export function buildAppScaffoldBundle(blueprint = {}) {
  const appId = blueprint.appId || 'new_app';

  return {
    blueprint,
    module: buildModuleScaffold({
      moduleName: appId,
      description: `${appId} scaffold`,
      exports: ['run']
    }),
    frontendSurface: buildFrontendSurfaceScaffold(blueprint),
    sharedLogic: buildSharedLogicScaffold(blueprint)
  };
}
