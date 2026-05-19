/**
 * dashly — a standard-library of filters, transforms, and shortcodes for Eleventy.
 *
 * The default export is the Eleventy plugin. Named exports give a la carte
 * access to filters, transforms, and shortcodes.
 *
 * @example
 *   // Plugin form
 *   import dashly from '@allons-y/dashly';
 *   config.addPlugin(dashly);
 *
 * @example
 *   // A la carte
 *   import { filters, transforms } from '@allons-y/dashly';
 *   config.addFilter('long', filters.longDate);
 *
 * @example
 *   // Narrowest import — only date filters get bundled
 *   import { longDate } from '@allons-y/dashly/filters/dates';
 *
 * @module @allons-y/dashly
 */

import { dashlyPlugin } from './plugin.js';

export { dashlyPlugin };
export default dashlyPlugin;

export * as filters from './filters/index.js';
export * as transforms from './transforms/index.js';
export * as shortcodes from './shortcodes/index.js';
