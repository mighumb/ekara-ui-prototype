/**
 * Single source of truth — prototype entry URL, module routes, asset cache version.
 * Bump `assetVersion` whenever shared CSS/JS changes; run `npm run check:assets`.
 */
(function (global) {
  const assetVersion = '141';

  /** Default screen when opening the site root (production main). */
  const defaultEntry = 'measures/explore/rum/user-journey-mapping/';

  const moduleRoutes = {
    Measures: 'measures/explore/rum/user-journey-mapping/',
    Management: 'webhooks/',
    Settings: 'settings/alerts/',
  };

  function rootPrefix() {
    const path = global.location.pathname;
    if (path.includes('/settings/rum/trackers')) return '../../../';
    if (path.includes('/settings/alerts')) return '../../';
    if (path.includes('/measures/explore/rum/user-journey-mapping')) return '../../../../';
    if (path.includes('/webhooks/')) return '../';
    const previewMatch = path.match(/\/previews\/pr-\d+\/(.*)/);
    if (previewMatch) {
      const depth = previewMatch[1].split('/').filter(Boolean).length;
      return depth ? '../'.repeat(depth) : '';
    }
    return '';
  }

  function resolve(relativePath) {
    const base = rootPrefix();
    if (!relativePath) return base || './';
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) return relativePath;
    return `${base}${relativePath.replace(/^\//, '')}`;
  }

  function moduleHref(moduleName) {
    const route = moduleRoutes[moduleName];
    return route ? resolve(route) : null;
  }

  global.EkaraPrototypeRoutes = {
    assetVersion,
    defaultEntry,
    moduleRoutes,
    rootPrefix,
    resolve,
    moduleHref,
  };
})(typeof window !== 'undefined' ? window : globalThis);
