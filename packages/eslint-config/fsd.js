/**
 * Feature-Sliced Design lint rules.
 *
 * Two invariants are enforced:
 *
 *  1. Layer hierarchy — a module may only import from layers strictly
 *     below its own:  app > widgets > features > entities > shared
 *  2. Public API — slices of the upper layers are imported through their
 *     slice root (`@/entities/board`), never through internal segments
 *     (`@/entities/board/ui/Card`). `shared` is exempt: its segments
 *     (`@/shared/ui`, `@/shared/lib`, ...) are its public API.
 *
 * Cross-layer imports must go through the path alias (default `@`);
 * imports inside a single slice stay relative.
 */

/** Ordered from the highest layer to the lowest. */
export const LAYERS = ['app', 'widgets', 'features', 'entities', 'shared'];

/** Layers whose slices expose a single public entry point. */
const SLICED_LAYERS = ['widgets', 'features', 'entities'];

/**
 * @param {object} [options]
 * @param {string} [options.alias] Path alias that points at the FSD root. Default `@`.
 * @param {string} [options.src]   Directory holding the layers. Default `src`.
 * @returns {import('eslint').Linter.Config[]}
 */
export function fsd({ alias = '@', src = 'src' } = {}) {
  const configs = LAYERS.map((layer, index) => {
    const upperLayers = LAYERS.slice(0, index);
    /** @type {{ group: string[]; message: string }[]} */
    const patterns = [];

    if (upperLayers.length > 0) {
      patterns.push({
        group: upperLayers.flatMap((upper) => [`${alias}/${upper}`, `${alias}/${upper}/*`]),
        message:
          `FSD: "${layer}" must not import from a higher layer ` +
          `(${upperLayers.join(', ')}). Allowed below it: ` +
          `${LAYERS.slice(index + 1).join(', ') || 'nothing'}.`,
      });
    }

    const slicedTargets = SLICED_LAYERS.filter((target) => target !== layer);
    if (slicedTargets.length > 0) {
      patterns.push({
        group: slicedTargets.flatMap((target) => [
          `${alias}/${target}/*/*`,
          `${alias}/${target}/*/*/*`,
        ]),
        message:
          'FSD: import a slice through its public API ' +
          `(e.g. "${alias}/entities/board"), not through its internals.`,
      });
    }

    return {
      name: `collab-board/fsd/${layer}`,
      files: [`${src}/${layer}/**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}`],
      rules: {
        'no-restricted-imports': ['error', { patterns }],
      },
    };
  });

  return configs;
}

export default fsd;
