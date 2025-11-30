# Domain Spec Generator

> Paste this into a coding agent along with your app idea.

---

## Instructions

I want you to help me design a domain spec for a local-first application using the Datarooms architecture. I'll describe my app idea, and you'll output a structured markdown file following this exact format.

## Context

This spec will be used with a local-first architecture featuring:
- **LiveStore**: SQLite in browser + event sourcing + sync
- **Effect**: Type-safe services and error handling
- **Atoms**: Reactive queries
- **React + TanStack Router**: File-based routing

The key pattern: Events are truth, tables are views. All mutations via events. Soft deletes only.

## Available Primitives

**Base** (use for all apps):
- Entity (data with id, timestamps, deletedAt)
- Event (immutable fact, synced or local-only)
- Materializer (event → state)
- Atom (reactive query)
- Capability (AI transformation)

**Composite** (use when needed):
- **Channel** - Multi-party scope (for apps with 2+ users sharing data)
- **Participant** - Role-scoped identity
- **AuditChain** - Hash-linked tamper-evident history (for trust-critical apps)
- **EncryptedPayload** - E2E encryption (for privacy-critical apps)
- **Federation** - Cross-server linking (for decentralized apps)

## Output Format

Generate a markdown file with this exact structure:

```
# [App Name]

> [One-line poetic description]

[Optional: 1-2 sentence expansion of the concept]

## Primitives Used

[Only include this section if using composite primitives]
- **[Primitive]**: [How it's used]

## Entities

- **[Entity]**: [field], [field], [field], ...

[Group related entities. Include id, timestamps (createdAt, updatedAt), deletedAt for main entities]

## Events

**[Entity Group]**
- [EventName], [EventName], [EventName]

[Group by entity. Use past tense: Created, Updated, Deleted]

## Roles

[Only include if multi-party]
- **[Role]**: [permissions description]

## Features

**[Feature Group]**
- [ ] [Feature as user story or action]

[Group logically. Use checkboxes. Be specific.]

## Constraints

- [Hard requirement or invariant]

[Include: event sourcing, soft deletes, offline support, sync behavior, security rules]

## Routes

- `/path` - Description

[Keep minimal. Main user flows only.]

## Phases

1. **[Phase Name]** - [What's built]

[Order by dependency. Foundation first, polish last. 3-5 phases typical.]
```

## Examples

### Simple Solo App (1 user, N devices)
```
# Cheffect

> Local-first recipe tracking with AI-powered extraction.

## Entities

- **Recipe**: id, title, imageUrl, prepTime, cookingTime, rating, ingredients[], steps[], createdAt, updatedAt, deletedAt
- **GroceryItem**: id, name, quantity, aisle, completed, createdAt, updatedAt

## Events

**Recipe**
- RecipeCreated, RecipeUpdated, RecipeDeleted

**Grocery**
- GroceryItemAdded, GroceryItemToggled, GroceryItemCleared

## Features

**Recipe Management**
- [ ] Add recipe from URL (AI extraction)
- [ ] View and edit recipes
- [ ] Search and filter

## Constraints

- All mutations via events
- Soft deletes only
- Works fully offline

## Routes

- `/` - Recipe list
- `/recipe/:id` - Detail
- `/groceries` - Shopping list

## Phases

1. **Foundation** - Schema, events, queries
2. **Core UI** - List, detail, forms
3. **AI Features** - URL extraction
4. **Polish** - PWA, mobile
```

### Multi-Party App (N users, shared scope)
```
# Ember

> Like tending a fire together. Each entry a small spark.

## Primitives Used

- **Channel**: One per pair
- **EncryptedPayload**: All entries E2E encrypted

## Entities

- **Pair**: id, channelId, userAId, userBId, createdAt
- **Entry**: id, pairId, userId, encryptedContent, nonce, createdAt

## Events

**Pair**
- PairCreated, PairKeyExchanged

**Entry**
- EntryWritten, EntryRead

## Roles

- **Partner**: read/write own entries, read partner's after both wrote

## Features

**Daily Flow**
- [ ] Write entry (encrypted before commit)
- [ ] See partner's entry after both wrote

## Constraints

- E2E encrypted
- Neither reads until both wrote
- Works offline

## Routes

- `/` - Today's prompt
- `/write` - Write entry
- `/history` - Past entries

## Phases

1. **Foundation** - Schema, encryption
2. **Core Flow** - Write, reveal
3. **History** - Browse, search
```

---

## Your App Idea

Describe your app idea below. Include:
1. What problem does it solve?
2. Who uses it? (solo, couples, teams, public?)
3. What are the core actions?
4. Any special requirements? (privacy, trust, federation?)

---

[PASTE YOUR IDEA HERE]
