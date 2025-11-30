# VIBES

> Build local-first apps fast. Any domain, same patterns.

---

## The Promise

You have an app idea. You want it to:
- Work instantly, even offline
- Sync across devices when connected
- Feel fast because it IS fast
- Be AI-enhanced where it makes sense

This stack delivers. One architecture, infinite domains.

---

## The Stack

| Layer | Tool | One-liner |
|-------|------|-----------|
| **Data** | LiveStore | SQLite in the browser + event sourcing + sync |
| **Logic** | Effect | Type-safe services, composable errors, DI |
| **State** | Atoms | Reactive queries that just work |
| **UI** | React + TanStack Router | File-based routing, type-safe |
| **Style** | Tailwind + Shadcn | Ship pretty, fast |
| **AI** | Effect AI + OpenAI | Structured extraction, not chatbots |

---

## The Pattern

Every app follows the same flow:

```
1. User does something
2. Component commits an event
3. Materializer updates SQLite
4. Query atoms re-evaluate
5. UI re-renders
6. (Later) Events sync to cloud
```

That's it. No REST. No loading states for local data. No cache invalidation.

---

## The Files

```
VIBES.md           →  You are here (philosophy)
ARCHITECTURE.md    →  How the stack works (patterns)
DOMAIN_*.md        →  What your app knows (entities, events)
*_PLAN.md          →  What to build (acceptance criteria)
```

To start a new app:
1. Write your `DOMAIN_*.md` using the DSL
2. Hand it to an agent with ARCHITECTURE.md
3. Ship

---

## Quick-Start: New Domain in 5 Minutes

### Step 1: Define Your Domain

```typescript
// DOMAIN_TASKS.md
const Task = Entity.make("Task")
  .addField("id", Schema.String, { primaryKey: true })
  .addField("title", Schema.String)
  .addField("done", Schema.Boolean, { default: false })
  .addField("createdAt", Schema.DateTime, { auto: "insert" })

const TaskEvents = Event.group("Task")
  .add(Event.synced("TaskCreated").setPayload(Task))
  .add(Event.synced("TaskToggled").setPayload({ id, done }))
  .add(Event.synced("TaskDeleted").setPayload({ id }))

const allTasks = Query.make("allTasks")
  .from(Task)
  .orderBy("createdAt DESC")
```

### Step 2: Implement the Schema

```typescript
// src/livestore/schema.ts
export const tables = {
  tasks: State.SQLite.table({
    name: "tasks",
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      title: State.SQLite.text({ default: "" }),
      done: State.SQLite.boolean({ default: false }),
      createdAt: State.SQLite.integer({ schema: Schema.DateTimeUtcFromNumber }),
    },
  }),
}

export const events = {
  taskCreated: Events.synced({ name: "v1.TaskCreated", schema: Task }),
  taskToggled: Events.synced({ name: "v1.TaskToggled", schema: { id, done } }),
}

const materializers = State.SQLite.materializers(events, {
  "v1.TaskCreated": (t) => tables.tasks.insert(t),
  "v1.TaskToggled": ({ id, done }) => tables.tasks.update({ done }).where({ id }),
})
```

### Step 3: Query It

```typescript
// src/livestore/queries.ts
export const allTasksAtom = Store.makeQuery(
  queryDb({ query: sql`SELECT * FROM tasks ORDER BY createdAt DESC`, schema: Task.array })
)
```

### Step 4: Use It

```typescript
// Component
const tasks = useAtom(allTasksAtom)
const commit = useCommit()

const addTask = (title: string) => {
  commit(events.taskCreated({ id: crypto.randomUUID(), title, done: false, createdAt: Date.now() }))
}

const toggle = (id: string, done: boolean) => {
  commit(events.taskToggled({ id, done }))
}
```

Done. Works offline. Will sync when you add a backend.

---

## Domain Examples

### Recipe Tracker (Cheffect - Active)
```typescript
Recipe.addField("ingredients", Schema.Array(Ingredient), { storage: "json" })
Capability.make("AI Recipe Extraction").input(URL).output(Recipe).uses("OpenAI")
```

### Couples Prompts (Spice Weekly - Planned)
```typescript
Couple.addField("userA", User).addField("userB", User)
PromptInstance.addField("scheduledFor", DateTime).addField("status", Status)
Capability.make("Prompt Generation").uses("PromptTemplate", "Feedback History")
```

### Notes App (Example)
```typescript
Note.addField("content", Schema.String).addField("tags", Schema.Array(Tag))
Query.make("notesByTag").from(Note).where(sql`tags LIKE ?`)
```

### Habit Tracker (Example)
```typescript
Habit.addField("name", Schema.String).addField("frequency", Frequency)
HabitLog.addField("habitId", Habit).addField("date", Date).addField("completed", Boolean)
Query.make("streakFor").from(HabitLog).groupBy("habitId")
```

---

## The Vibe

### Local-First is a Superpower
Your app works on the subway. On a plane. In a basement. Users don't wait for your server.

### Events Are Truth, Tables Are Views
Never mutate directly. Commit events. Materializers handle the rest. This makes sync, undo, and debugging trivial.

### Let the Agent Figure Out the Files
Define WHAT you want (entities, acceptance criteria). Let the AI figure out WHERE it goes. Your job is product, not plumbing.

### Ship Fast, Polish Later
The architecture handles the hard parts (sync, offline, reactivity). You focus on your domain.

### AI Enhances, Doesn't Replace
Use AI for structured extraction (URL → Recipe), not chat interfaces. Schema-driven, predictable, useful.

---

## Anti-Patterns

- **Don't** fetch data on mount. Use atoms.
- **Don't** mutate state directly. Commit events.
- **Don't** hard delete. Set `deletedAt`.
- **Don't** fight the patterns. They're load-bearing.

---

## Ready?

1. Pick a domain
2. Write a `DOMAIN_*.md`
3. Read `ARCHITECTURE.md`
4. Start building

The patterns are proven. The stack is solid. Your idea is the only variable.

Ship it.
