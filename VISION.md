# MetaCRDT Vision

> A substrate for structured coordination, local-first computation, and human-to-agent symbiosis.

---

## The Thesis

Modern applications demand properties that traditional architectures cannot provide: offline resilience, cryptographic auditability, agent-native interfaces, and seamless federation across organizational boundaries.

MetaCRDT unifies these requirements into a single coherent substrate—a typed lattice where every mutation is an immutable event, every state converges deterministically, and every agent (human or AI) operates through the same merge semantics.

---

## Core Principles

### State Convergence
Strong eventual consistency across arbitrary network partitions. No coordination required—peers sync when connected, diverge when offline, and converge automatically upon reconnection.

### Auditability
Every mutation carries verifiable provenance. Cryptographic timestamps and hash-linked event chains provide tamper-evident history without centralized trust.

### Composability
Typed schemas compile to multiple targets: SQLite for local persistence, Postgres for server-side state, Cloudflare Durable Objects for edge compute. One schema, many backends.

### Agent-Native Semantics
Deterministic slots where LLM agents can observe state, propose changes, and merge alongside humans. The same merge semantics that resolve human conflicts resolve agent conflicts.

---

## Research Programmes

### datarooms.metacrdt.com
Structured workspaces for compliance, onboarding, and regulated operations. Every document version tracked, every access logged, every signature verifiable.

### groupchat.metacrdt.com
Conversation graphs that treat every message as a first-class CRDT node. Threads, reactions, and edits all converge—no "someone else is typing" race conditions.

### rabbithole.metacrdt.com
Exploratory knowledge mining. LLM agents recursively traverse data-rooms to surface latent structure, connections, and contradictions.

### threadquest.metacrdt.com
Procedural narrative systems where an AI Dungeon Master orchestrates branching story graphs in group chat. Script-first narration with AI filling the gaps.

---

## Architectural Stack

```
Type Generation Pipeline
  └─ @effect/schema → TypeScript types, JSON Schema, SQL DDL, OpenAPI

Transport Adapters
  └─ WebSocket, Durable Objects, Server-Sent Events, p2p WebRTC

Agent Interface Layer
  └─ Canonical event log → embedding cache → reflection prompts → merge-proposal objects

CRDT Kernel
  └─ Op-based, delta-encoded structures (G-Counter, MV-Register, LWW-Set, custom λ-CRDTs)

Effect-Core Runtime
  └─ Pure functional, interruptible fibers scheduling deterministic computations
```

---

## The Primitives

Like LEGO bricks, domains compose from typed primitives:

**Base**
- **Entity** — Data with identity, timestamps, soft-delete
- **Event** — Immutable fact, synced or local-only
- **Materializer** — Event → State projection
- **Atom** — Reactive query with automatic dependency tracking
- **Capability** — AI transformation slot (extraction, generation, validation)

**Composite**
- **Channel** — Multi-party scope with role-based access control
- **AuditChain** — Hash-linked tamper-evident history with optional signatures
- **EncryptedPayload** — E2E encryption with key exchange protocol
- **Federation** — Cross-server linking with signature verification

A solo app uses Entity + Event. A compliance app adds AuditChain. A privacy app adds EncryptedPayload. A decentralized app adds Federation.

Same foundation. Infinite combinations.

---

## The Agent Loop

```
1. Human writes domain spec (markdown)
2. Agent reads ARCHITECTURE.md + domains/meta.md
3. Agent generates schema, events, materializers
4. Agent generates routes, components
5. Human reviews, iterates
6. Ship

The human's job: Define WHAT
The agent's job: Figure out WHERE and HOW
The architecture's job: Make it all converge
```

---

## Current State

**Implemented:**
- [x] Effect-Core runtime with LiveStore integration
- [x] CRDT-backed schema with event sourcing
- [x] Multi-domain architecture (single repo, independent deploys)
- [x] Cheffect reference implementation
- [x] Domain spec format and generator prompt

**In Progress:**
- [ ] Composable primitive factories
- [ ] Agent interface layer
- [ ] Federation protocol
- [ ] Additional domain implementations

---

## The Ethos

**Local-first is non-negotiable.** Your app works on a plane, in a subway, in a basement. Users don't wait for servers.

**Events are truth.** Never mutate directly. Commit events. Get sync, undo, audit, and time-travel for free.

**Agents are peers.** LLMs observe and propose through the same merge semantics as humans. No special APIs—just typed events and convergent state.

**Specs over code.** The best code is the code you didn't write. Define what you want. Let the substrate figure out the rest.

---

## Participate

MetaCRDT is an open, evolving substrate. Each sub-domain is a living laboratory.

- **Read the Docs** — Deep-dive on schema design, agent slots, and formal proofs
- **Join the Alpha** — Access reference implementations and private registries
- **Propose a Lab** — Submit an abstract describing how MetaCRDT primitives unlock your domain

If your work demands structured coordination under real-world network conditions, we invite you to build with us.

---

*What will you converge?*
