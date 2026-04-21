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
  const pascalName = `${appId.charAt(0).toUpperCase()}${appId.slice(1)}`;

  return {
    path: `pillars/frontend_os/app_surfaces/${appId}_surface.js`,
    contents: `import { buildSurfaceCopyBundle } from '../../meta_generator/content/index.js';\nimport { getRepoRoot, nav, renderNavigation } from '../navigation/index.js';\nimport { renderAuth } from '../ui_states/auth_controller.js';\nimport { injectLegalBlock } from '../shell/legal_blocks.js';\n\nfunction render${pascalName}SurfaceBody() {\n  const mount = document.getElementById('${appId}-surface-root');\n  if (!mount) return;\n\n  const copy = buildSurfaceCopyBundle('${appId}');\n  const basePath = getRepoRoot();\n\n  mount.innerHTML = \`\n    <div class=\"glass-card text-center\">\n      <div class=\"section-eyebrow-left\">\${copy?.title || '${pascalName}'}</div>\n      <p class=\"text-secondary mb-20\">\${copy?.subtitle || 'Diese Surface wurde generatorgetrieben vorbereitet.'}</p>\n      <div class=\"share-action-group__buttons\">\n        <a href=\"\${basePath}dashboard/index.html\" class=\"btn-primary share-action-group__primary\" data-route=\"dashboard\" style=\"display:inline-flex; text-decoration:none;\">Zum Dashboard</a>\n        <a href=\"\${basePath}apps/numerology/index.html\" class=\"btn-secondary share-action-group__secondary\" data-route=\"numerology\" style=\"display:inline-flex; text-decoration:none;\">Zur Kernflaeche</a>\n      </div>\n      <div id=\"${appId}-surface-legal\" class=\"mt-24\"></div>\n    </div>\n  \`;\n\n  mount.querySelectorAll('[data-route]').forEach((link) => {\n    link.addEventListener('click', (event) => {\n      event.preventDefault();\n      nav.navigateTo(link.getAttribute('data-route'));\n    });\n  });\n\n  injectLegalBlock('${appId}-surface-legal', {\n    variant: 'sync',\n    basePath,\n    includePolicyLinks: true,\n    compactLinks: true\n  });\n}\n\nexport const ${appId}Surface = {\n  init() {\n    renderNavigation('nav-menu');\n    nav.bindNavigation();\n    nav.registerCurrentApp(this);\n    renderAuth.init();\n    render${pascalName}SurfaceBody();\n  },\n\n  destroy() {}\n};\n\n${appId}Surface.init();\n`
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
