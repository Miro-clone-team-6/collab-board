import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Base flat config shared by every workspace package.
 * Framework-agnostic: plain JS/TS rules + Prettier compatibility.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const base = [
  {
    name: 'collab-board/ignores',
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
    ],
  },
  {
    name: 'collab-board/languages',
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2024,
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    name: 'collab-board/rules',
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
      'object-shorthand': 'error',
      'prefer-const': 'error',
      // Type-only imports are already enforced by `verbatimModuleSyntax`
      // in the shared tsconfig, so no type-aware lint rule is needed here.
      // Keeping lint type-unaware means it needs no tsconfig wiring.
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    name: 'collab-board/config-files',
    files: ['**/*.config.{js,mjs,cjs,ts,mts}', '**/eslint.config.{js,mjs}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  prettier,
];

export default base;
