# Datarooms

> Local-first apps. Any domain. Same patterns.

A reference architecture for building offline-capable, sync-ready applications using LiveStore, Effect, and React.

## What's Here

```
ARCHITECTURE.md        # How the stack works
ARCHITECTURE_MULTI.md  # Multi-app from one repo
VIBES.md               # Philosophy and quick-start

domains/
- meta.md            # Primitive vocabulary
- cheffect.md        # Recipe tracker (active)
- spice.md           # Couples prompts
- ember.md           # Gratitude journal
- witness.md         # Handshake protocol
- fable.md           # Fiction engine

src/                   # Cheffect implementation
```

## The Stack

| Layer | Tool |
|-------|------|
| Data | LiveStore (SQLite + event sourcing) |
| Logic | Effect (type-safe services) |
| State | Atoms (reactive queries) |
| UI | React + TanStack Router |
| Style | Tailwind + Shadcn |
| AI | Effect AI + OpenAI |

## The Pattern

```
User action � commit(event) � Materializer � SQLite � Atom � UI
```

Events are truth. Tables are views. Works offline. Syncs when connected.

## Quick Start

```bash
pnpm install
pnpm dev
```

## Domains

Each domain spec defines entities, events, features, and constraints:

- **Cheffect** - Recipe tracking with AI extraction
- **Spice** - Weekly intimacy prompts for couples
- **Ember** - Shared gratitude journal (E2E encrypted)
- **Witness** - Auditable handshake protocol
- **Fable** - Federated fiction engine

## Primitives

Base: Entity, Event, Materializer, Atom, Capability

Composite (from `domains/meta.md`):
- **Channel** - Multi-party scope
- **AuditChain** - Hash-linked integrity
- **EncryptedPayload** - E2E encryption
- **Federation** - Cross-server linking

## Docs

- [VIBES.md](./VIBES.md) - Philosophy
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical patterns
- [ARCHITECTURE_MULTI.md](./ARCHITECTURE_MULTI.md) - Multi-domain setup
- [domains/](./domains/) - Domain specifications
