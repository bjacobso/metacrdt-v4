# MetaCRDT / Datarooms

> Research Preview

A substrate for structured coordination, local-first computation, and human-to-agent symbiotic interface.

---

## Why MetaCRDT?

MetaCRDT is a unified lattice of Conflict-Free Replicated Data-Types (CRDTs), a typed task/agent model, and a local-first execution kernel. Together, these primitives let us express arbitrarily rich workflows—from compliance data-rooms to generative group games—while preserving:

| Principle | Description |
|-----------|-------------|
| **State Convergence** | Strong eventual consistency across arbitrary network partitions |
| **Auditability** | Verifiable provenance and cryptographic time-stamping of every mutation |
| **Composability** | Typed schemas that compile to SQLite, Postgres, and Cloudflare Durable Objects |
| **Agent-Native Semantics** | Deterministic slots where LLM agents can observe, propose, and merge changes alongside humans |

---

## Architectural Stack

```
┌─────────────────────────────────────────────────────────────┐
│  Type Generation Pipeline                                   │
│  @effect/schema → TypeScript, JSON Schema, SQL DDL, OpenAPI │
├─────────────────────────────────────────────────────────────┤
│  Transport Adapters                                         │
│  WebSocket · Durable Objects · SSE · p2p WebRTC             │
├─────────────────────────────────────────────────────────────┤
│  Agent Interface Layer                                      │
│  Event Log → Embedding Cache → Reflection → Merge Proposals │
├─────────────────────────────────────────────────────────────┤
│  CRDT Kernel                                                │
│  Op-based, delta-encoded (G-Counter, MV-Register, LWW-Set)  │
├─────────────────────────────────────────────────────────────┤
│  Effect-Core Runtime                                        │
│  Pure functional, interruptible fibers, deterministic compute│
└─────────────────────────────────────────────────────────────┘
```

---

## Research Domains

| Domain | Focus |
|--------|-------|
| **datarooms** | Structured workspaces for compliance, onboarding, and regulated operations |
| **groupchat** | Conversation graphs that treat every message as a first-class CRDT node |
| **rabbithole** | Exploratory knowledge mining—LLM agents recursively traverse data-rooms |
| **threadquest** | Procedural narrative systems where an AI DM orchestrates branching story graphs |

---

## Quick Start

```bash
pnpm install
pnpm dev
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical patterns and LiveStore integration
- [ARCHITECTURE_MULTI.md](./ARCHITECTURE_MULTI.md) — Multi-domain setup from one repo
- [VISION.md](./VISION.md) — Research programme and roadmap
- [PROMPT.md](./PROMPT.md) — Generate new domain specs with AI agents
- [domains/](./domains/) — Domain specifications (cheffect, spice, ember, witness, fable)

---

## Primitives

**Base**: Entity, Event, Materializer, Atom, Capability

**Composite** (from `domains/meta.md`):
- **Channel** — Multi-party scope with role-based access
- **AuditChain** — Hash-linked tamper-evident history
- **EncryptedPayload** — E2E encryption with key exchange
- **Federation** — Cross-server linking with signature verification

---

## Participate

MetaCRDT is an open, evolving substrate; each sub-domain is a living laboratory.

If your work demands structured coordination under real-world network conditions, we invite you to build with us.
