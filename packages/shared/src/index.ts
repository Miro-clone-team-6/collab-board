/**
 * Public API of `@collab-board/shared`.
 *
 * Types, zod schemas and constants that both `apps/frontend` and the
 * future `apps/backend` depend on. Keep this file as the only entry
 * point — consumers import from `@collab-board/shared`, never deeper.
 */

export * from './board.js';
export * from './constants.js';
