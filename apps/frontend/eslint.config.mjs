import { next } from '@collab-board/eslint-config/next';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...next({ alias: '@', src: 'src' }),
  {
    name: 'frontend/ignores',
    ignores: ['.next/**', 'next-env.d.ts'],
  },
];

export default config;
