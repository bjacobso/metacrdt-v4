# Fable

> A link becomes a portal. Friends become characters. Stories unfold async, in your group chat.

Federated interactive fiction. Deploy your own story server. Share a link. Friends join as characters. AI + scripts narrate. Each thread is a branch of the multiverse.

## Primitives Used

- **Channel**: One per story instance
- **Participant**: Players with character roles
- **AuditChain**: Immutable story history (turns)
- **Capability**: AI narrator, script engine, dice rolls
- **Federation**: Cross-server character travel (approval-based)

## Entities

- **Server**: id, name, publicKey, federationLinks[], createdAt
- **Script**: id, title, author, scenes[], triggers[], variables[], version, published
- **StoryInstance**: id, scriptId, channelId, state, narratorMode, status (recruiting|active|paused|complete)
- **Character**: id, playerId, name, traits[], inventory[], stats{}, originServer, createdAt
- **Turn**: id, storyId, characterId?, type (action|dialogue|narration|roll|system), content, prevHash, createdAt
- **Player**: id, email, characters[], activeStories[]
- **FederationRequest**: id, remoteServerUrl, status (pending|approved|rejected), requestedAt

## Events

**Server**
- ServerCreated, FederationRequested, FederationApproved, FederationRejected

**Script**
- ScriptCreated, ScriptPublished, ScriptForked

**Story**
- StoryCreated, StoryStarted, StoryPaused, StoryCompleted
- CharacterJoined, CharacterLeft

**Turn**
- TurnCreated (action, dialogue, roll)
- NarrationGenerated (AI response)
- ScriptTriggered (authored beat)

**Character**
- CharacterCreated, CharacterUpdated
- CharacterTraveled (cross-server with proof)

## Roles

- **Author**: Create/edit scripts, can GM any story
- **GM**: Run a story instance, override narrator
- **Player**: Control their character, submit actions
- **Spectator**: Read-only, can follow story

## Features

**Server Setup**
- [ ] Deploy with `npx wrangler deploy`
- [ ] Configure server identity and public key
- [ ] Set default narrator mode (script-first)

**Scripting**
- [ ] Author scenes with branching choices
- [ ] Define triggers (on player action, on dice roll, on variable)
- [ ] Set variables and conditions
- [ ] Fork scripts from other servers

**Story Creation**
- [ ] Start new story from script (pins to version)
- [ ] Generate invite link
- [ ] Set player limits and character requirements

**Playing**
- [ ] Join via link, create or import character
- [ ] Submit actions in natural language
- [ ] Roll dice with `/roll 2d6+3`
- [ ] View character sheet, inventory
- [ ] Read story history (chat-like thread)

**Narration (Script-First)**
- [ ] Script triggers always take precedence
- [ ] AI fills gaps between authored beats
- [ ] GM can intervene anytime
- [ ] Narrator voice/style per script

**Federation (Approval-Based)**
- [ ] Request to link with another server
- [ ] Admin approves/rejects federation requests
- [ ] Travel character with cryptographic proof
- [ ] Crossover events between federated servers

**Async Flow**
- [ ] Notifications when it's your turn
- [ ] Stories progress when players available
- [ ] Catch-up: summarize missed turns
- [ ] Pause/resume stories

## Constraints

- All turns immutable (audit chain with prevHash)
- Script triggers override AI narration
- Characters owned by players, travel with origin server signature
- Scripts versioned, stories pin to version
- Federation requires admin approval
- Works offline (queue actions, sync later)

## Routes

- `/` - Server home, public stories
- `/story/:id` - Story thread (chat view)
- `/story/:id/join` - Join as character
- `/story/new` - Create story from script
- `/scripts` - Browse/create scripts
- `/script/:id/edit` - Script editor
- `/characters` - Your characters
- `/character/:id` - Character sheet
- `/federation` - Manage linked servers
- `/settings` - Server config

## Deployment (Cloudflare)

```
Workers (API) ──▶ Durable Objects (per story)
     │                  - StoryInstance state
     ▼                  - Turn audit chain
    D1                  - WebSocket connections
 (SQLite)               - Hibernates when idle
 - Scripts
 - Characters     Queues
 - Players        - AI narration
 - Federation     - Federation events
     │
     ▼            R2
    KV            - Character portraits
 - Sessions       - Script assets
 - Cache
```

```bash
npx wrangler deploy
```

## Federation Protocol

```typescript
// Server discovery
GET /.well-known/fable-server
{ id, name, publicKey, acceptingPlayers }

// Request federation
POST /federation/request
{ remoteServerUrl }

// Character travel (with proof)
POST /federation/character/arrive
{ character, proof: SignedByOriginServer, storyId }

// Story event broadcast
POST /federation/event
{ turn, storyId, proof: SignedByStoryServer }
```

## Phases

1. **Foundation** - Schema, Turn audit chain, Cloudflare setup
2. **Stories** - Durable Objects, character join, turn submission
3. **Narrator** - Script engine, AI integration (script-first)
4. **Client** - Chat UI, character sheets, offline support
5. **Federation** - Approval flow, character travel, discovery
6. **Polish** - Notifications, summarization, mobile PWA
