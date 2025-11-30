# Meta Plan

> A protocol for describing domains using local-first primitives.

## Base Primitives

From ARCHITECTURE.md:

- **Entity**: Schema with id, timestamps, deletedAt
- **Event**: Immutable fact (synced or local-only)
- **Materializer**: Event → State transformation
- **Atom**: Reactive query over state
- **Capability**: AI-powered extraction/transformation

## Composite Primitives

### Channel

Multi-party communication scope.

```typescript
Channel = {
  id, participants[], visibility, encryption?
}

// LiveStore pattern
tables.channels = State.SQLite.table({
  columns: {
    id: text({ primaryKey: true }),
    visibility: text({ default: "private" }),
    encryption: text({ nullable: true }),  // "e2e" | null
  }
})

tables.channelParticipants = State.SQLite.table({
  columns: {
    channelId: text(),
    userId: text(),
    role: text(),
    joinedAt: integer(),
  }
})
```

### Participant

Role-scoped identity.

```typescript
Participant = {
  userId, channelId, role, permissions[]
}

// Roles are domain-specific enums
type CoupleRole = "partner"
type TicketRole = "agent" | "client"
type WitnessRole = "initiator" | "witness"
```

### AuditChain

Hash-linked event sequence for tamper evidence.

```typescript
SignedEvent = Event & {
  prevHash: Hash
  signature?: Signature
}

// LiveStore pattern
events.recordCreated = Events.synced({
  name: "v1.RecordCreated",
  schema: Schema.Struct({
    id: Schema.String,
    content: Schema.String,
    prevHash: Schema.String,
    signature: Schema.NullOr(Schema.String),
    createdAt: Schema.DateTimeUtc,
  })
})

// Materializer computes running hash
"v1.RecordCreated": (record) => {
  const hash = computeHash(record)
  return tables.records.insert({ ...record, hash })
}
```

### EncryptedPayload

E2E encrypted content.

```typescript
EncryptedPayload = {
  ciphertext: Uint8Array
  nonce: Uint8Array
  keyId: string
}

// LiveStore pattern - store encrypted, decrypt in UI
tables.messages = State.SQLite.table({
  columns: {
    id: text({ primaryKey: true }),
    channelId: text(),
    encryptedContent: blob(),  // ciphertext
    nonce: blob(),
    keyId: text(),
  }
})

// Decryption happens in component via Web Crypto API
const decrypted = await crypto.subtle.decrypt(
  { name: "AES-GCM", iv: nonce },
  derivedKey,
  ciphertext
)
```

### AccessRule

Declarative permission check.

```typescript
AccessRule = {
  entity: EntityType
  action: "read" | "write" | "delete"
  allow: (ctx) => boolean
}

// Pattern: filter in queries, not materializers
const myMessagesAtom = Store.makeQuery(
  queryDb((get) => ({
    query: sql`
      SELECT m.* FROM messages m
      JOIN channel_participants cp ON m.channelId = cp.channelId
      WHERE cp.userId = ?
    `,
    bindValues: [currentUserId],
    schema: Message.array,
  }))
)
```

## Patterns

### Solo (1 user, N devices)

- All events sync via LiveStore
- No access control needed
- Examples: Cheffect, Notes, Habits

### Multi-Party (N users, shared scope)

- Channel per shared context
- Participants with roles
- Access via participant queries
- Examples: Couples, Households, Teams

### Auditable (trust-critical)

- AuditChain for integrity
- Optional signatures per event
- Hash verification on read
- Examples: Witness, Expenses, Agreements

### Encrypted (privacy-critical)

- E2E encryption per channel
- Keys derived from participant set
- Decrypt only on authorized devices
- Examples: Health, Private messages

## Template

```markdown
# [App Name]

> [One-line poetic description]

## Primitives Used

- [List which composites: Channel, AuditChain, etc.]

## Entities

- **[Entity]**: [fields...]

## Events

- [EventName]: [description]

## Roles

- [Role]: [permissions]

## Features

- [ ] [Feature description]

## Constraints

- [Constraint]

## Routes

- `/path` - Description

## Phases

1. **Phase** - Description
```
