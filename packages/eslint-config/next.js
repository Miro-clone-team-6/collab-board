import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

import { base } from './base.js';
import { fsd } from './fsd.js';

/**
 * Flat config for a Next.js app laid out with Feature-Sliced Design.
 *
 * @param {object} [options]
 * @param {string} [options.alias] Path alias pointing at the FSD root. Default `@`.
 * @param {string} [options.src]   Directory holding the layers. Default `src`.
 * @returns {import('eslint').Linter.Config[]}
 */
export function next(options = {}) {
  return [...base, ...nextCoreWebVitals, ...fsd(options)];
}

export default next;
