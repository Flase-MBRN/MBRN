import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();

const PUBLIC_HTML_FILES = [
  'index.html',
  '404.html',
  'datenschutz.html',
  'impressum.html',
  'dashboard/index.html',
  'apps/chronos/index.html',
  'apps/finance/index.html',
  'apps/numerology/index.html',
  'apps/synergy/index.html'
];

describe('public frontend ghost mode', () => {
  test('public html no longer ships Stripe browser hooks', () => {
    PUBLIC_HTML_FILES.forEach((relativePath) => {
      const source = fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf8');
      expect(source).not.toContain('https://js.stripe.com');
    });
  });

  test('public html and visible surface renderers avoid public commerce language', () => {
    const inspectedFiles = [
      ...PUBLIC_HTML_FILES,
      'pillars/frontend_os/ui_states/auth_controller.js',
      'pillars/frontend_os/app_surfaces/chronos_surface.js',
      'pillars/frontend_os/app_surfaces/dashboard_surface.js',
      'pillars/frontend_os/shell/render_landing.js',
      'shared/core/legal/config.js'
    ];

    inspectedFiles.forEach((relativePath) => {
      const source = fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf8');
      expect(source).not.toMatch(/\bKaufen\b/i);
      expect(source).not.toMatch(/\bCheckout\b/i);
      expect(source).not.toMatch(/\bPricing\b/i);
      expect(source).not.toMatch(/\bSubscription\b/i);
    });
  });

  test('visible public surfaces stay free of mojibake markers', () => {
    const inspectedFiles = [
      ...PUBLIC_HTML_FILES,
      'pillars/frontend_os/app_surfaces/dashboard_surface.js',
      'pillars/frontend_os/shell/render_landing.js',
      'pillars/frontend_os/cards/sentiment_widget.js'
    ];

    inspectedFiles.forEach((relativePath) => {
      const source = fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf8');
      expect(source).not.toContain('Ã');
      expect(source).not.toContain('Â');
      expect(source).not.toContain('â');
    });
  });
});
