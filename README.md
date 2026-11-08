# collab-board

Monorepo skeleton for **collab-board**, a collaborative whiteboard (a Miro-like app).

This repository currently contains the working scaffolding only — no product
features. It installs, lints, typechecks and builds green. The backend and the
board functionality land as separate tasks.

---

## Requirements

| Tool    | Version                           |
| ------- | --------------------------------- |
| Node.js | 24 LTS (see [`.nvmrc`](./.nvmrc)) |
| pnpm    | 10.x                              |

Install pnpm via Corepack, which reads the `packageManager` field in the root
`package.json` and uses the exact pinned version:

```bash
corepack enable
corepack prepare --activate
```

Alternatively, install it globally:

```bash
npm install -g pnpm@10
```

## Getting started

```bash
nvm use            # or otherwise switch to Node 24
pnpm install
cp .env.example apps/frontend/.env.local
pnpm dev
```

The frontend starts on <http://localhost:3000>.

## Commands

All commands run from the repository root and are proxied to Turborepo, which
runs them across every workspace in dependency order.

| Command             | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `pnpm dev`          | Starts every app in watch mode                   |
| `pnpm build`        | Builds all packages (`shared` before `frontend`) |
| `pnpm lint`         | ESLint across all workspaces                     |
| `pnpm typecheck`    | `tsc --noEmit` across all workspaces             |
| `pnpm format`       | Formats the repository with Prettier             |
| `pnpm format:check` | Verifies formatting without writing              |
| `pnpm clean`        | Removes build output and `node_modules`          |

To run a task in a single workspace, filter it:

```bash
pnpm --filter @collab-board/frontend dev
```

## Structure

```
collab-board/
├── apps/
│   ├── frontend/              # Next.js 16 app (app router, Tailwind 4, FSD)
│   │   └── src/
│   │       ├── app/           # FSD app layer == Next.js route segments
│   │       ├── widgets/       # composite UI blocks
│   │       ├── features/      # user-facing interactions
│   │       ├── entities/      # business entities
│   │       └── shared/        # reusable, domain-agnostic code
│   └── backend/               # placeholder — not implemented yet
├── packages/
│   ├── shared/                # @collab-board/shared — types, zod schemas, constants
│   ├── eslint-config/         # @collab-board/eslint-config — flat configs + FSD rules
│   └── typescript-config/     # @collab-board/typescript-config — base tsconfigs
├── .github/workflows/ci.yml   # lint + typecheck + build on pull requests
├── turbo.json                 # task graph
└── pnpm-workspace.yaml        # workspace definition
```

### Workspaces

| Package                           | Purpose                                                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `@collab-board/frontend`          | Next.js app. Consumes all three packages below.                                                                      |
| `@collab-board/shared`            | Code shared between frontend and the future backend. Built with `tsc` to `dist/`, exported from `src/index.ts` only. |
| `@collab-board/eslint-config`     | Flat configs: `./base`, `./next`, `./fsd`.                                                                           |
| `@collab-board/typescript-config` | `base.json` (strict), `library.json` (emits), `nextjs.json`.                                                         |

Workspace packages are referenced with `workspace:*`, so they always resolve to
the local source.

### Feature-Sliced Design

The frontend follows [Feature-Sliced Design](https://feature-sliced.design/).
Layers, from the highest to the lowest:

```
app → widgets → features → entities → shared
```

Two rules are enforced by ESLint (see `packages/eslint-config/fsd.js`):

1. **Layer hierarchy** — a module may only import from layers strictly below its
   own. `entities` importing from `features` is an error.
2. **Public API** — slices in `widgets`, `features` and `entities` are imported
   through their slice root (`@/entities/board`), never through internals
   (`@/entities/board/ui/Card`). The `shared` layer is exempt: its segments
   (`@/shared/ui`, `@/shared/lib`, …) are its public API.

Cross-layer imports use the `@/` alias; imports inside a single slice stay
relative. Layers that have no code yet hold a `.gitkeep`.

## Toolchain notes

A few versions are deliberately not the absolute latest:

- **TypeScript 6.0.x, not 7.x.** `typescript-eslint@8` declares
  `typescript >=4.8.4 <6.1.0`. Bumping to TypeScript 7 would break linting until
  typescript-eslint supports it.
- **ESLint 10** is used with flat config. Three plugins bundled by
  `eslint-config-next` still declare an ESLint 9 peer range, so `pnpm install`
  prints peer warnings. Linting works; the warnings disappear once those plugins
  widen their ranges.

Linting is intentionally **not** type-aware, so it needs no `tsconfig` wiring and
stays fast. The strictness that type-aware rules would add is largely covered by
`strict` plus `verbatimModuleSyntax` in `packages/typescript-config/base.json`.
To enable type-aware linting later, add `parserOptions.projectService` in
`packages/eslint-config/base.js`.

## CI

[`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs on pull requests
against `main`, on `ubuntu-latest` only, with the pnpm store cached by
`actions/setup-node`:

```
pnpm install --frozen-lockfile → pnpm lint → pnpm typecheck → pnpm build
```

## Environment variables

Copy [`.env.example`](./.env.example) and fill in the values. Frontend variables
must be prefixed with `NEXT_PUBLIC_` to reach the browser. Real values are never
committed — `.env` and `.env*.local` are git-ignored.
