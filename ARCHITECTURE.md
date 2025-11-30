# Cheffect Architecture

A comprehensive guide to building local-first applications with LiveStore, Effect, and modern React patterns.

## Table of Contents

1. [Philosophy & Spirit](#philosophy--spirit)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [LiveStore Deep Dive](#livestore-deep-dive)
5. [Data Modeling Patterns](#data-modeling-patterns)
6. [Atom-Based Reactive State](#atom-based-reactive-state)
7. [Event Sourcing Pattern](#event-sourcing-pattern)
8. [Effect Services Pattern](#effect-services-pattern)
9. [Data Flow Examples](#data-flow-examples)
10. [Applying to Other Domains](#applying-to-other-domains)

---

## Philosophy & Spirit

### Why Local-First?

Local-first software puts the user's data on their device first, syncing to the cloud second. This creates fundamentally better user experiences:

- **Instant Responsiveness**: No spinners, no waiting for the network. Every action feels immediate because it happens locally first.
- **Offline-First**: The app works seamlessly without internet. Users in poor connectivity situations (subway, airplane, rural areas) have full functionality.
- **Data Ownership**: User data lives on their device. They're not hostage to a server being up or a company staying in business.
- **Conflict-Free Sync**: When devices reconnect, changes merge automatically using CRDTs or event sourcing.

### The Effect Ecosystem Philosophy

[Effect](https://effect.website) is a TypeScript library for building composable, type-safe applications. It provides:

- **Composability**: Small, focused functions that combine into complex workflows
- **Type Safety**: Errors are tracked in the type system, not thrown as exceptions
- **Resource Management**: Scoped effects ensure cleanup happens automatically
- **Dependency Injection**: Services declare dependencies, making testing and swapping implementations trivial

Effect encourages thinking in terms of "what could go wrong" and handling it explicitly, rather than hoping for the best.

### Event Sourcing Benefits

Instead of mutating state directly, this architecture records **events** (facts about what happened) and derives state from them:

- **Audit Trail**: Every change is recorded. You can see exactly what happened and when.
- **Time Travel**: Replay events to any point in time. Debug by seeing the exact sequence of actions.
- **Sync-Friendly**: Events are easy to merge across devices. Two devices creating recipes just means two creation events.
- **Undo/Redo**: Built-in. Just roll back events.

### Design Principles

1. **Schema-First**: Define your data shapes with schemas. Everything else (validation, serialization, types) derives from them.
2. **Reactive by Default**: UI automatically updates when data changes. No manual refresh logic.
3. **Feature Modules**: Group related code by feature, not by type (all recipe code together, not all components together).
4. **Explicit Over Implicit**: Dependencies are declared, errors are typed, nothing is hidden.

---

## Technology Stack

### Core Dependencies

| Package | Purpose |
|---------|---------|
| **React 19** | UI rendering with concurrent features |
| **TypeScript 5.9** | Type safety and developer experience |
| **Vite 7** | Fast builds and hot module replacement |
| **Effect 3.x** | Functional programming, error handling, services |
| **LiveStore 0.3.x** | Local-first database with sync capabilities |
| **TanStack Router** | Type-safe file-based routing |
| **Tailwind CSS 4** | Utility-first styling |

### Data & State

| Package | Purpose |
|---------|---------|
| **@effect-atom/atom-livestore** | Reactive atoms connected to LiveStore |
| **@effect-atom/atom-react** | React hooks for atoms |
| **@livestore/adapter-web** | Web adapter with OPFS storage |
| **@livestore/wa-sqlite** | SQLite compiled to WebAssembly |
| **Zod 4** | Runtime schema validation |

### AI Integration

| Package | Purpose |
|---------|---------|
| **@effect/ai** | AI abstraction layer |
| **@effect/ai-openai** | OpenAI client for recipe extraction |

### UI Components

| Package | Purpose |
|---------|---------|
| **Radix UI** | Accessible, unstyled primitives |
| **Shadcn UI** | Pre-built Radix components |
| **Lucide React** | Icon library |
| **Sonner** | Toast notifications |

### How They Work Together

```
User Action → React Component → commit(event) → LiveStore
                                                    ↓
                                            Materializer applies event
                                                    ↓
                                            SQLite (via wa-sqlite)
                                                    ↓
                                            Query atoms re-evaluate
                                                    ↓
                                            React re-renders
```

---

## Project Structure

```
src/
├── domain/                 # Pure data models (no UI, no side effects)
│   ├── Recipe.ts          # Recipe entity with Effect Schema
│   ├── GroceryItem.ts     # Grocery item entity
│   ├── Rating.ts          # Branded type for 1-5 ratings
│   └── Duration.ts        # Duration helpers
│
├── livestore/             # LiveStore configuration
│   ├── schema.ts          # Tables, events, materializers
│   ├── atoms.ts           # Store initialization
│   ├── queries.ts         # Query atoms
│   └── livestore.worker.ts # Web Worker entry
│
├── services/              # Effect services (business logic)
│   ├── AiHelpers.ts       # AI-powered features
│   └── CorsProxy.ts       # CORS proxy for fetching
│
├── components/            # Shared UI components
│   └── ui/                # Shadcn components
│
├── Recipes/               # Recipe feature module
│   ├── Form.tsx           # Recipe form component
│   ├── AddRecipeButton.tsx
│   ├── atoms.ts           # Recipe-specific atoms
│   └── RecipeExtractionManager.ts
│
├── Groceries/             # Grocery feature module
│   └── atoms.ts
│
├── routes/                # TanStack Router pages
│   ├── __root.tsx         # Root layout
│   ├── index.tsx          # Recipe list (home)
│   ├── add.tsx            # Add recipe
│   ├── edit/$id.tsx       # Edit recipe
│   ├── recipe/$id.tsx     # View recipe
│   ├── groceries.tsx      # Grocery list
│   ├── plan.tsx           # Meal planner
│   └── settings.tsx       # Settings
│
├── lib/                   # Utilities
│   └── utils.ts           # cn() and helpers
│
├── App.tsx                # Root component with providers
├── Router.ts              # Router configuration
└── main.tsx               # Entry point
```

### Key Patterns

- **Feature Modules**: `Recipes/` and `Groceries/` contain all code for their features
- **Domain Layer**: `domain/` contains pure data models, usable anywhere
- **Services**: `services/` contains Effect services for side effects
- **Routes as Pages**: Each route file is a page component

---

## LiveStore Deep Dive

LiveStore is the foundation of the local-first architecture. It provides:

- **Local SQLite**: Data stored in the browser via WebAssembly SQLite
- **Event Sourcing**: All changes are events that can be replayed
- **Sync-Ready**: Built-in support for syncing to Cloudflare Durable Objects

### Schema Definition

The schema defines tables, events, and how events map to state changes.

**Tables** (`src/livestore/schema.ts`):

```typescript
import { Events, makeSchema, State } from "@livestore/livestore"
import * as Schema from "effect/Schema"

export const tables = {
  recipes: State.SQLite.table({
    name: "recipes",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      title: State.SQLite.text({ default: "" }),
      imageUrl: State.SQLite.text({ nullable: true }),
      prepTime: State.SQLite.real({
        nullable: true,
        schema: Schema.DurationFromMillis,  // Auto-converts Duration ↔ milliseconds
      }),
      cookingTime: State.SQLite.real({
        nullable: true,
        schema: Schema.DurationFromMillis,
      }),
      rating: State.SQLite.real({ nullable: true }),
      servings: State.SQLite.real({ nullable: true }),
      ingredients: State.SQLite.json({
        schema: Schema.Array(IngredientsComponent),  // Complex nested data as JSON
      }),
      steps: State.SQLite.json({ schema: Schema.Array(Step) }),
      createdAt: State.SQLite.integer({ schema: Schema.DateTimeUtcFromNumber }),
      updatedAt: State.SQLite.integer({ schema: Schema.DateTimeUtcFromNumber }),
      deletedAt: State.SQLite.integer({  // Soft delete for sync compatibility
        nullable: true,
        schema: Schema.DateTimeUtcFromNumber,
      }),
    },
  }),

  // Client-only document (not synced to server)
  searchState: State.SQLite.clientDocument({
    name: "searchState",
    schema: Schema.Struct({
      query: Schema.String,
      sortBy: SortByValue,
    }),
    default: { id: "~/searchState", value: { query: "", sortBy: "title" } },
  }),
}
```

**Events**:

```typescript
export const events = {
  recipeCreated: Events.synced({
    name: "v1.RecipeCreated",
    schema: Recipe,
  }),
  recipeUpdated: Events.synced({
    name: "v1.RecipeUpdated",
    schema: Recipe.update,  // Partial update schema
  }),
  recipeDeleted: Events.synced({
    name: "v1.RecipeDeleted",
    schema: Schema.Struct({ id: Schema.String, deletedAt: Schema.DateTimeUtc }),
  }),
  // Client-only event for search state
  searchStateSet: tables.searchState.set,
}
```

**Materializers** (mapping events to state changes):

```typescript
const materializers = State.SQLite.materializers(events, {
  "v1.RecipeCreated": (insert) => tables.recipes.insert(insert),
  "v1.RecipeUpdated": (update) =>
    tables.recipes.update(update).where({ id: update.id }),
  "v1.RecipeDeleted": ({ id, deletedAt }) =>
    tables.recipes.update({ deletedAt }).where({ id }),
})
```

### Storage Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Main Thread                            │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                 │
│  │ React   │◄──►│ Atoms   │◄──►│ Store   │                 │
│  │ UI      │    │         │    │ (proxy) │                 │
│  └─────────┘    └─────────┘    └────┬────┘                 │
└────────────────────────────────────┼────────────────────────┘
                                     │ postMessage
┌────────────────────────────────────▼────────────────────────┐
│                      Web Worker                             │
│  ┌─────────────────────────────────────────────┐           │
│  │              LiveStore Core                  │           │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐  │           │
│  │  │ Events  │───►│ Mater-  │───►│ SQLite  │  │           │
│  │  │ Log     │    │ ializers│    │ (OPFS)  │  │           │
│  │  └─────────┘    └─────────┘    └─────────┘  │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

- **Main Thread**: UI and atom reactivity
- **Web Worker**: Database operations (keeps UI responsive)
- **OPFS**: Origin Private File System (persistent browser storage, no quota limits like IndexedDB)

### Store Initialization

```typescript
// src/livestore/atoms.ts
import { makePersistedAdapter } from "@livestore/adapter-web"
import { AtomLivestore } from "@effect-atom/atom-livestore"
import LiveStoreWorker from "./livestore.worker?worker"
import LiveStoreSharedWorker from "@livestore/adapter-web/shared-worker?sharedworker"

const adapter = makePersistedAdapter({
  storage: { type: "opfs" },           // Use OPFS for persistence
  worker: LiveStoreWorker,              // Web Worker for DB operations
  sharedWorker: LiveStoreSharedWorker,  // Shared Worker for multi-tab sync
})

export class Store extends AtomLivestore.Tag<Store>()("Store", {
  schema,
  storeId: "default",
  adapter,
  batchUpdates: unstable_batchedUpdates,  // React batching
}) {}
```

### Cloudflare Durable Objects (Ready for Sync)

The infrastructure is prepared for server sync via Cloudflare:

```typescript
// In package.json
"@livestore/sync-cf": "^0.3.1"
```

When enabled, the sync flow would be:

1. Client commits event locally
2. Event sent to Cloudflare Durable Object
3. Durable Object broadcasts to other connected clients
4. Clients apply remote events

---

## Data Modeling Patterns

### Effect Schema for Type-Safe Models

Domain models use Effect Schema (or the Model helper from `@effect/sql`):

```typescript
// src/domain/Recipe.ts
import { Model } from "@effect/sql"
import * as Schema from "effect/Schema"

export class Recipe extends Model.Class<Recipe>("Recipe")({
  id: Model.GeneratedByApp(Schema.String),
  title: Schema.String,
  imageUrl: Schema.NullOr(Schema.String),
  prepTime: Schema.NullOr(Schema.DurationFromMillis),
  cookingTime: Schema.NullOr(Schema.DurationFromMillis),
  rating: Schema.NullOr(Rating),
  servings: Schema.NullOr(Schema.Number),
  ingredients: Model.JsonFromString(Schema.Array(IngredientsComponent)),
  steps: Model.JsonFromString(Schema.Array(Step)),
  createdAt: Model.DateTimeInsertFromNumber,
  updatedAt: Model.DateTimeUpdateFromNumber,
  deletedAt: Model.GeneratedByApp(Schema.NullOr(Schema.DateTimeUtcFromNumber)),
}) {
  // Helper for array queries
  static array = Schema.Array(Recipe)

  // Computed property using Option for null-safety
  get totalTime(): Option.Option<Duration.Duration> {
    const prep = Option.fromNullable(this.prepTime).pipe(
      Option.getOrElse(() => Duration.zero),
    )
    const cook = Option.fromNullable(this.cookingTime).pipe(
      Option.getOrElse(() => Duration.zero),
    )
    return filterZero(Duration.sum(prep, cook))
  }
}
```

### Branded Types for Domain Constraints

Use branded types to enforce business rules at compile time:

```typescript
// src/domain/Rating.ts
import * as z from "zod"

export const Rating = z.number().min(1).max(5).brand<"Rating">()
export type Rating = z.infer<typeof Rating>

export const Rating = {
  make: (value: number): Rating => Rating.parse(value),
}
```

Now `Rating` is a distinct type from `number`. You can't accidentally pass any number where a `Rating` is expected.

### Nested Data as JSON Columns

Complex nested structures are stored as JSON in SQLite:

```typescript
export class IngredientsComponent extends Schema.Class<IngredientsComponent>(
  "IngredientsComponent",
)({
  name: Schema.String,  // e.g., "Marinade", "Filling"
  ingredients: Schema.Array(Ingredient),
}) {}

export class Ingredient extends Schema.Class<Ingredient>("Ingredient")({
  name: Schema.String,
  quantity: Schema.NullOr(Schema.Number),
  unit: Schema.NullOr(Unit),
}) {
  get quantityWithUnit(): string | null {
    if (this.quantity === null) return null
    if (this.unit === null) return `${this.quantity}`
    return `${this.quantity} ${this.unit}`
  }
}
```

In the table definition:
```typescript
ingredients: State.SQLite.json({
  schema: Schema.Array(IngredientsComponent),
}),
```

### Soft Deletes for Sync Compatibility

Never hard-delete in a synced system. Use `deletedAt` timestamps:

```typescript
deletedAt: State.SQLite.integer({
  nullable: true,
  schema: Schema.DateTimeUtcFromNumber,
}),
```

When deleting:
```typescript
events.recipeDeleted: Events.synced({
  name: "v1.RecipeDeleted",
  schema: Schema.Struct({ id: Schema.String, deletedAt: Schema.DateTimeUtc }),
}),

// Materializer sets deletedAt instead of deleting
"v1.RecipeDeleted": ({ id, deletedAt }) =>
  tables.recipes.update({ deletedAt }).where({ id }),
```

---

## Atom-Based Reactive State

Atoms are reactive data sources that automatically update when their dependencies change.

### Query Atoms from LiveStore

```typescript
// src/livestore/queries.ts
import { queryDb, sql } from "@livestore/livestore"
import { Store } from "./atoms"
import { Atom, Result } from "@effect-atom/atom-react"

// Simple query atom
export const searchStateAtom = Store.makeQuery(
  queryDb(tables.searchState.get())
)

// Query with dynamic parameters
export const allRecipesAtom = Store.makeQuery(
  queryDb(
    (get) => {
      const { query, sortBy } = get(searchState$)  // Depends on search state
      const trimmedQuery = query.trim()
      const sort = sortBy === "createdAt" ? "createdAt DESC" : "title ASC"

      if (trimmedQuery === "") {
        return {
          query: sql`SELECT * FROM recipes ORDER BY ${sort}`,
          schema: Recipe.array,
        }
      }
      return {
        query: sql`SELECT * FROM recipes WHERE title LIKE ? ORDER BY ${sort}`,
        schema: Recipe.array,
        bindValues: [`%${trimmedQuery}%`],
      }
    },
    { label: "allRecipes" },
  ),
)
```

### Computed/Derived Atoms

```typescript
// Derive a value from another atom
export const searchSortByAtom = Atom.map(searchStateAtom, (r) =>
  r.pipe(
    Result.map((s) => s.sortBy),
    Result.getOrElse(() => "title" as const),
  ),
)
```

### Atom Families for Parametric Queries

When you need an atom per entity:

```typescript
export const recipeByIdAtom = Atom.family((id: string) => {
  const result = Store.makeQuery(
    queryDb(
      {
        query: sql`SELECT * FROM recipes WHERE id = ?`,
        bindValues: [id],
        schema: Recipe.array,
      },
      { map: Array.head },
    ),
  )

  return Atom.make((get) => get.result(result).pipe(Effect.flatten))
})

// Usage:
const recipeAtom = recipeByIdAtom("abc-123")
const recipe = useAtom(recipeAtom)
```

### Result Type Handling

Atoms return `Result<T>` which can be:
- `Success(value)`: Data is available
- `Initial`: First load, no data yet
- `Waiting`: Loading/pending
- `Failure(error)`: Something went wrong

```typescript
import { Result } from "@effect-atom/atom-react"

// In component
const result = useAtom(allRecipesAtom)

Result.match(result, {
  onSuccess: (recipes) => <RecipeList recipes={recipes} />,
  onInitial: () => <Loading />,
  onWaiting: () => <Loading />,
  onFailure: (error) => <Error message={error.message} />,
})
```

---

## Event Sourcing Pattern

### Events as the Source of Truth

All data changes are recorded as events:

```typescript
// src/livestore/schema.ts
export const events = {
  recipeCreated: Events.synced({
    name: "v1.RecipeCreated",
    schema: Recipe,
  }),
  recipeUpdated: Events.synced({
    name: "v1.RecipeUpdated",
    schema: Recipe.update,
  }),
  groceryItemToggled: Events.synced({
    name: "v1.GroceryItemToggled",
    schema: Schema.Struct({ id: Schema.String, completed: Schema.Boolean }),
  }),
}
```

### Committing Events from Components

```typescript
// src/livestore/atoms.ts
export const useCommit = () => useAtomSet(Store.commit)

// In a component
function AddRecipeButton() {
  const commit = useCommit()

  const handleSubmit = (data: RecipeFormData) => {
    const recipe = new Recipe({
      id: crypto.randomUUID(),
      ...data,
      createdAt: DateTime.unsafeNow(),
      updatedAt: DateTime.unsafeNow(),
      deletedAt: null,
    })

    commit(events.recipeCreated(recipe))
  }

  return <button onClick={handleSubmit}>Add Recipe</button>
}
```

### Benefits for Debugging

Events create an audit trail. In development, you can:

1. See every event in the LiveStore DevTools
2. Replay events to reproduce bugs
3. Export event log for analysis

---

## Effect Services Pattern

Services encapsulate side effects and business logic with explicit dependencies.

### Defining a Service

```typescript
// src/services/AiHelpers.ts
import { Effect, Layer, Config } from "effect"
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai"
import { LanguageModel } from "@effect/ai"

// Layer for the OpenAI client
const OpenAiClientLayer = OpenAiClient.layerConfig({
  apiKey: Config.redacted("VITE_OPENAI_API_KEY"),
}).pipe(Layer.provide(FetchHttpClient.layer))

// Service definition
export class AiHelpers extends Effect.Service<AiHelpers>()("AiHelpers", {
  dependencies: [OpenAiClientLayer, CorsProxy.Default],  // Explicit dependencies
  scoped: Effect.gen(function* () {
    const model = yield* OpenAiLanguageModel.model("gpt-4-mini")
    const proxy = yield* CorsProxy

    // Method using generator syntax
    const recipeFromUrl = Effect.fn("AiHelpers.recipeFromUrl")(function* (
      url: string,
    ) {
      const llm = yield* LanguageModel.LanguageModel
      yield* Effect.annotateCurrentSpan({ url })  // Tracing
      const html = yield* proxy.htmlStripped(url)
      const response = yield* llm.generateObject({
        prompt: [
          { role: "system", content: "Extract a recipe from the provided HTML." },
          { role: "user", content: [{ type: "text", text: html }] },
        ],
        schema: ExtractedRecipe,
      })
      return response.value
    }, Effect.provide(model))

    return { recipeFromUrl } as const
  }),
}) {}
```

### Using Services in Components

```typescript
// Run an effect with the service
const result = await Effect.runPromise(
  AiHelpers.recipeFromUrl(url).pipe(
    Effect.provide(AiHelpers.Default),
  )
)
```

### Dependency Injection Benefits

- **Testing**: Swap `AiHelpers.Default` for a mock layer
- **Composition**: Services can depend on other services
- **Tracing**: Automatic OpenTelemetry spans with `Effect.annotateCurrentSpan`

---

## Data Flow Examples

### Recipe Creation Flow

```
1. User enters URL in "Add Recipe" form
        │
        ▼
2. RecipeExtractionManager.extract(url)
        │
        ▼
3. AiHelpers.recipeFromUrl(url)
        ├── CorsProxy.htmlStripped(url)    // Fetch HTML
        └── OpenAI generateObject          // Extract recipe
        │
        ▼
4. ExtractedRecipe.asRecipe              // Convert to Recipe
        │
        ▼
5. commit(events.recipeCreated(recipe))  // Commit event
        │
        ▼
6. Materializer: tables.recipes.insert(recipe)
        │
        ▼
7. SQLite: INSERT INTO recipes ...
        │
        ▼
8. allRecipesAtom re-evaluates
        │
        ▼
9. Component re-renders with new recipe
```

### Search & Filter Flow

```
1. User types "pasta" in search box
        │
        ▼
2. commit(events.searchStateSet({ query: "pasta" }))
        │
        ▼
3. searchStateAtom updates
        │
        ▼
4. allRecipesAtom re-evaluates (depends on searchState)
        │
        ▼
5. queryDb executes:
   SELECT * FROM recipes WHERE title LIKE '%pasta%'
        │
        ▼
6. Filtered recipes returned
        │
        ▼
7. Component re-renders with filtered list
```

### Grocery List Flow

```
1. User clicks "Add to groceries" on recipe
        │
        ▼
2. For each ingredient:
   commit(events.groceryItemAdded(GroceryItem.fromIngredient(ingredient)))
        │
        ▼
3. Materializers insert items
        │
        ▼
4. allGroceryItemsAtom re-evaluates
        │  (groups by aisle)
        ▼
5. Groceries page re-renders with new items
```

---

## Applying to Other Domains

This architecture can be adapted to any domain that benefits from local-first data and reactive UI.

### Step 1: Define Your Domain Models

Create schema classes in `src/domain/`:

```typescript
// Example: Task tracker
export class Task extends Model.Class<Task>("Task")({
  id: Model.GeneratedByApp(Schema.String),
  title: Schema.String,
  description: Schema.NullOr(Schema.String),
  status: Schema.Literal("todo", "in_progress", "done"),
  priority: Schema.Literal("low", "medium", "high"),
  dueDate: Schema.NullOr(Schema.DateTimeUtcFromNumber),
  createdAt: Model.DateTimeInsertFromNumber,
  updatedAt: Model.DateTimeUpdateFromNumber,
  deletedAt: Model.GeneratedByApp(Schema.NullOr(Schema.DateTimeUtcFromNumber)),
}) {}
```

### Step 2: Define Your Schema

In `src/livestore/schema.ts`:

```typescript
export const tables = {
  tasks: State.SQLite.table({
    name: "tasks",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      title: State.SQLite.text({ default: "" }),
      description: State.SQLite.text({ nullable: true }),
      status: State.SQLite.text({ default: "todo" }),
      priority: State.SQLite.text({ default: "medium" }),
      dueDate: State.SQLite.integer({ nullable: true }),
      createdAt: State.SQLite.integer({ schema: Schema.DateTimeUtcFromNumber }),
      updatedAt: State.SQLite.integer({ schema: Schema.DateTimeUtcFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true }),
    },
  }),

  // Local-only filter state
  filterState: State.SQLite.clientDocument({
    name: "filterState",
    schema: Schema.Struct({
      status: Schema.NullOr(Schema.Literal("todo", "in_progress", "done")),
      priority: Schema.NullOr(Schema.Literal("low", "medium", "high")),
    }),
    default: { id: "~/filterState", value: { status: null, priority: null } },
  }),
}

export const events = {
  taskCreated: Events.synced({ name: "v1.TaskCreated", schema: Task }),
  taskUpdated: Events.synced({ name: "v1.TaskUpdated", schema: Task.update }),
  taskDeleted: Events.synced({
    name: "v1.TaskDeleted",
    schema: Schema.Struct({ id: Schema.String, deletedAt: Schema.DateTimeUtc }),
  }),
  filterStateSet: tables.filterState.set,
}

const materializers = State.SQLite.materializers(events, {
  "v1.TaskCreated": (insert) => tables.tasks.insert(insert),
  "v1.TaskUpdated": (update) => tables.tasks.update(update).where({ id: update.id }),
  "v1.TaskDeleted": ({ id, deletedAt }) => tables.tasks.update({ deletedAt }).where({ id }),
})
```

### Step 3: Create Query Atoms

In `src/livestore/queries.ts`:

```typescript
export const filterState$ = queryDb(tables.filterState.get())
export const filterStateAtom = Store.makeQuery(filterState$)

export const allTasksAtom = Store.makeQuery(
  queryDb(
    (get) => {
      const { status, priority } = get(filterState$)
      let query = sql`SELECT * FROM tasks WHERE deletedAt IS NULL`

      if (status) {
        query = sql`${query} AND status = ${status}`
      }
      if (priority) {
        query = sql`${query} AND priority = ${priority}`
      }

      return {
        query: sql`${query} ORDER BY dueDate ASC NULLS LAST`,
        schema: Task.array,
      }
    },
    { label: "allTasks" },
  ),
)

export const taskByIdAtom = Atom.family((id: string) =>
  Store.makeQuery(
    queryDb({
      query: sql`SELECT * FROM tasks WHERE id = ?`,
      bindValues: [id],
      schema: Task.array,
    }, { map: Array.head }),
  )
)
```

### Step 4: Build Feature Modules

Create `src/Tasks/`:

```
src/Tasks/
├── TaskList.tsx        # List component
├── TaskForm.tsx        # Create/edit form
├── TaskCard.tsx        # Individual task card
├── atoms.ts            # Task-specific atoms/state
└── index.ts            # Public exports
```

### What to Keep vs. Customize

**Keep (infrastructure)**:
- `src/livestore/atoms.ts` - Store initialization
- `src/App.tsx` - Provider setup
- Web Worker configuration
- Vite/TypeScript config

**Customize (domain)**:
- `src/domain/*.ts` - Your entities
- `src/livestore/schema.ts` - Your tables/events
- `src/livestore/queries.ts` - Your queries
- Feature modules - Your UI

### Template: Minimal Local-First App

```typescript
// 1. Domain model
class Item extends Model.Class<Item>("Item")({
  id: Model.GeneratedByApp(Schema.String),
  name: Schema.String,
  createdAt: Model.DateTimeInsertFromNumber,
}) {}

// 2. Schema
const tables = {
  items: State.SQLite.table({
    name: "items",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      name: State.SQLite.text({ default: "" }),
      createdAt: State.SQLite.integer({ schema: Schema.DateTimeUtcFromNumber }),
    },
  }),
}

const events = {
  itemCreated: Events.synced({ name: "v1.ItemCreated", schema: Item }),
}

const materializers = State.SQLite.materializers(events, {
  "v1.ItemCreated": (insert) => tables.items.insert(insert),
})

// 3. Store
const schema = makeSchema({ events, state: State.SQLite.makeState({ tables, materializers }) })

class Store extends AtomLivestore.Tag<Store>()("Store", {
  schema,
  storeId: "default",
  adapter: makePersistedAdapter({ storage: { type: "opfs" }, worker, sharedWorker }),
  batchUpdates: unstable_batchedUpdates,
}) {}

// 4. Query atom
const allItemsAtom = Store.makeQuery(
  queryDb({ query: sql`SELECT * FROM items`, schema: Item.array })
)

// 5. Component
function ItemList() {
  const items = useAtom(allItemsAtom)
  const commit = useCommit()

  const addItem = (name: string) => {
    commit(events.itemCreated(new Item({
      id: crypto.randomUUID(),
      name,
      createdAt: DateTime.unsafeNow(),
    })))
  }

  return Result.match(items, {
    onSuccess: (items) => (
      <ul>
        {items.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    ),
    onInitial: () => <div>Loading...</div>,
    onWaiting: () => <div>Loading...</div>,
    onFailure: (e) => <div>Error: {e.message}</div>,
  })
}
```

---

## Summary

This architecture provides:

1. **Instant UX**: Local-first means no network latency for user actions
2. **Offline Support**: Full functionality without internet
3. **Type Safety**: Schemas validate data at runtime, TypeScript validates at compile time
4. **Reactive Updates**: UI automatically reflects data changes
5. **Sync-Ready**: Event sourcing enables seamless multi-device sync
6. **Testable**: Effect services have explicit dependencies for easy mocking
7. **Scalable**: Add new features by adding new events and materializers

The key insight is that **events are the source of truth**. Tables are just materialized views derived from events. This makes sync, undo, and debugging much simpler than traditional CRUD approaches.
