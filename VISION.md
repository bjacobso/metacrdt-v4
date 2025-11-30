# Vision

> What if building apps felt like writing a spec?

---

## The Dream

You have an idea for an app. You write a simple markdown file:

```markdown
# MyApp

> One-line description

## Entities
- **Thing**: id, name, createdAt

## Events
- ThingCreated, ThingUpdated, ThingDeleted

## Features
- [ ] Create things
- [ ] List things
- [ ] Delete things
```

You hand it to an agent. The agent reads ARCHITECTURE.md, understands the patterns, and builds your app. Schema, events, materializers, atoms, routes, components—all of it.

Works offline. Syncs across devices. Deploys to the edge.

You didn't write a line of code. You described what you wanted.

---

## The Primitives

Like LEGO bricks, domains compose from primitives:

**Base**
- Entity (data with identity)
- Event (immutable fact)
- Materializer (event → state)
- Atom (reactive query)
- Capability (AI transformation)

**Composite**
- Channel (multi-party scope)
- AuditChain (tamper-evident history)
- EncryptedPayload (E2E privacy)
- Federation (cross-server portability)

A solo app uses Entity + Event. A couples app adds Channel. A trust-critical app adds AuditChain. A privacy-critical app adds EncryptedPayload. A federated app adds Federation.

Same foundation. Infinite combinations.

---

## The Multiverse

Each domain is a universe. But they share DNA:

- **Cheffect** - Your recipes, your way, offline
- **Spice** - Intimacy prompts for two, consent-first
- **Ember** - Gratitude journal, encrypted, revealed together
- **Witness** - "I lent you $50" signed by both parties
- **Fable** - Collaborative fiction, AI narration, federated

One repo. One stack. Many apps. Deploy independently.

When you're ready to build the next domain, you don't start from scratch. You compose from what exists.

---

## The Agent Loop

```
1. Human writes domain spec (markdown)
2. Agent reads ARCHITECTURE.md + domains/meta.md
3. Agent generates schema, events, materializers
4. Agent generates routes, components
5. Human reviews, iterates
6. Ship
```

The human's job: Define WHAT.
The agent's job: Figure out WHERE and HOW.
The architecture's job: Make it all work.

---

## What Exists Today

- [x] ARCHITECTURE.md documenting patterns
- [x] domains/meta.md defining primitives
- [x] 5 domain specs (cheffect, spice, ember, witness, fable)
- [x] ARCHITECTURE_MULTI.md for multi-domain setup
- [x] Cheffect implementation (working app)

## What's Next

- [ ] Implement primitives as composable schema factories
- [ ] Build second domain (Ember or Witness)
- [ ] Agent that reads spec → generates code
- [ ] Federation protocol between deployed apps
- [ ] Community-contributed domains

---

## The Ethos

**Local-first is a superpower.** Your app works on a plane, in a subway, in a basement. Users don't wait for your server.

**Events are truth.** Never mutate directly. Commit events. Get sync, undo, and audit for free.

**AI enhances, doesn't replace.** Use AI for structured extraction (URL → Recipe), not chat interfaces. Schema-driven, predictable, useful.

**Ship fast, polish later.** The architecture handles the hard parts. You focus on your domain.

**Specs over code.** The best code is the code you didn't write. Define what you want. Let the machine figure out the rest.

---

## Join Us

This is an experiment in building apps differently:
- Offline-first by default
- Event-sourced by design
- AI-assisted by choice
- Federated by nature

The patterns are proven. The stack is solid. Your idea is the only variable.

What will you build?
