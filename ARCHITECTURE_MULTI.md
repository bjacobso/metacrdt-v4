# Multi-Domain Architecture

> Run multiple apps from one repo without monorepo tooling.

## The Pattern

**App-per-Entry**: Use Vite's multi-entry capability to build separate apps from the same codebase. Single `package.json`, no workspaces.

## Structure

```
src/
├── _shared/              # Shared infrastructure
│   ├── components/       # UI components (shadcn)
│   ├── lib/              # Utilities
│   └── primitives/       # META primitives (Channel, AuditChain, etc.)
│
├── apps/
│   ├── cheffect/         # Recipe tracker
│   │   ├── domain/
│   │   ├── livestore/
│   │   ├── routes/
│   │   ├── services/
│   │   └── main.tsx
│   │
│   ├── spice/            # Couples prompts
│   │   └── ...
│   │
│   ├── ember/            # Gratitude journal
│   │   └── ...
│   │
│   ├── witness/          # Handshake protocol
│   │   └── ...
│   │
│   └── fable/            # Fiction engine
│       └── ...
│
├── index.html            # Dev: app selector
├── cheffect.html         # Entry for cheffect
├── spice.html            # Entry for spice
└── ...
```

## Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite"
import * as path from "node:path"

const APP = process.env.APP || "cheffect"

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        [APP]: `src/apps/${APP}/main.tsx`,
      },
    },
    outDir: `dist/${APP}`,
  },

  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "src/_shared"),
      "@app": path.resolve(__dirname, `src/apps/${APP}`),
    },
  },

  plugins: [
    TanStackRouterVite({
      routesDirectory: `src/apps/${APP}/routes`,
      generatedRouteTree: `src/apps/${APP}/routeTree.gen.ts`,
    }),
    livestoreDevtoolsPlugin({
      schemaPath: `./src/apps/${APP}/livestore/schema.ts`,
    }),
    VitePWA({
      manifest: {
        id: `${APP}.vibes.dev`,
        name: APP.charAt(0).toUpperCase() + APP.slice(1),
      },
    }),
  ],
})
```

## Scripts

```json
{
  "scripts": {
    "dev": "APP=cheffect vite",
    "dev:cheffect": "APP=cheffect vite",
    "dev:spice": "APP=spice vite",
    "dev:ember": "APP=ember vite",
    "dev:witness": "APP=witness vite",
    "dev:fable": "APP=fable vite",

    "build:cheffect": "APP=cheffect vite build",
    "build:spice": "APP=spice vite build",
    "build:all": "npm run build:cheffect && npm run build:spice && ..."
  }
}
```

## Shared Primitives

META_PLAN.md primitives as reusable schema factories:

```typescript
// src/_shared/primitives/channel.ts
export const makeChannelSchema = (config: { prefix: string }) => ({
  tables: {
    channels: State.SQLite.table({
      name: `${config.prefix}_channels`,
      columns: {
        id: State.SQLite.text({ primaryKey: true }),
        visibility: State.SQLite.text({ default: "private" }),
        encryption: State.SQLite.text({ nullable: true }),
      },
    }),
    participants: State.SQLite.table({
      name: `${config.prefix}_participants`,
      columns: {
        channelId: State.SQLite.text(),
        userId: State.SQLite.text(),
        role: State.SQLite.text(),
        joinedAt: State.SQLite.integer(),
      },
    }),
  },
  events: {
    channelCreated: Events.synced({
      name: `v1.${config.prefix}.ChannelCreated`,
      schema: Schema.Struct({ id: Schema.String, visibility: Schema.String }),
    }),
  },
})

// src/_shared/primitives/auditChain.ts
export const makeAuditChainSchema = (config: { prefix: string }) => ({
  // Hash-linked events with optional signatures
})

// src/_shared/primitives/encrypted.ts
export const makeEncryptedPayloadSchema = (config: { prefix: string }) => ({
  // E2E encryption schema + Web Crypto helpers
})
```

## Per-App Schema Composition

Each app composes primitives + app-specific tables:

```typescript
// src/apps/ember/livestore/schema.ts
import { makeChannelSchema } from "@shared/primitives/channel"
import { makeEncryptedPayloadSchema } from "@shared/primitives/encrypted"

const channel = makeChannelSchema({ prefix: "ember" })
const encrypted = makeEncryptedPayloadSchema({ prefix: "ember" })

const appTables = {
  pairs: State.SQLite.table({ ... }),
  prompts: State.SQLite.table({ ... }),
  entries: State.SQLite.table({ ... }),
}

export const tables = {
  ...channel.tables,
  ...encrypted.tables,
  ...appTables,
}

export const events = {
  ...channel.events,
  ...appEvents,
}

export const schema = makeSchema({ events, state })
```

## Deployment

Each app deploys independently:

```bash
# Single app
APP=cheffect npm run build
wrangler pages deploy dist/cheffect --project-name cheffect

# All apps via CI matrix
```

```yaml
# .github/workflows/deploy.yml
strategy:
  matrix:
    app: [cheffect, spice, ember, witness, fable]
steps:
  - run: APP=${{ matrix.app }} npm run build
  - run: wrangler pages deploy dist/${{ matrix.app }} --project-name ${{ matrix.app }}
```

## Migration Path

From current flat structure:
```
src/domain/Recipe.ts      → src/apps/cheffect/domain/Recipe.ts
src/livestore/schema.ts   → src/apps/cheffect/livestore/schema.ts
src/routes/index.tsx      → src/apps/cheffect/routes/index.tsx
src/components/ui/        → src/_shared/components/ui/
src/lib/utils.ts          → src/_shared/lib/utils.ts
```

## Benefits

- **Single package.json** - No dependency duplication
- **Shared components** - UI library used by all apps
- **Reusable primitives** - Compose schemas from META building blocks
- **Independent deploys** - Each app builds to its own bundle
- **Simple mental model** - Just directories, no package boundaries

## Trade-offs

- **Tree-shaking** - Don't import across apps accidentally
- **TypeScript paths** - Need careful aliasing or per-app tsconfig extends
- **Tests** - Need app-specific test globs

## When to Use

Use this pattern when:
- Multiple apps share infrastructure but have different domains
- You want to avoid monorepo tooling complexity
- Apps deploy to different URLs/environments
- Development usually focuses on one app at a time

Don't use when:
- Apps need to import each other's code at runtime
- You need package-level versioning
- Teams need isolated dependency trees
