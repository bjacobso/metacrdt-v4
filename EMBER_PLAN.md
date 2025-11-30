# Ember

> Like tending a fire together. Each entry a small spark. Over time, warmth.

A private gratitude journal shared between two people. Each day, one prompt. Both write. Both read. A record of what you valued, together.

## Primitives Used

- **Channel**: One private channel per pair
- **Participant**: Exactly 2, equal role
- **EncryptedPayload**: All entries E2E encrypted
- **Capability**: AI prompt suggestions

## Entities

- **Pair**: id, channelId, userAId, userBId, createdAt
- **DailyPrompt**: id, pairId, date, promptText, status (pending|active|complete)
- **Entry**: id, promptId, userId, encryptedContent, nonce, keyId, createdAt
- **EncryptionKey**: id, pairId, publicKey, createdAt

## Events

**Pair**
- PairCreated, PairKeyExchanged

**Prompt**
- PromptGenerated, PromptViewed

**Entry**
- EntryWritten, EntryRead

## Roles

- **Partner**: read own entries, read partner entries, write own entry, cannot edit partner's

## Features

**Onboarding**
- [ ] Create pair via invite link
- [ ] Exchange public keys for E2E encryption
- [ ] Set prompt delivery time (morning/evening)

**Daily Flow**
- [ ] Receive daily prompt notification
- [ ] Write gratitude entry (encrypted locally before commit)
- [ ] See partner's entry after both have written
- [ ] "Both wrote" unlock mechanism

**History**
- [ ] Browse past prompts and entries by date
- [ ] Search entries (client-side, after decrypt)
- [ ] View streaks and patterns

**AI Enhancement**
- [ ] Generate prompts from themes (family, work, nature, etc.)
- [ ] Suggest prompts based on past entries (decrypted locally)
- [ ] Seasonal/holiday-aware prompts

## Constraints

- All entry content E2E encrypted
- Neither user can read until both have written
- Soft deletes only (preserve history)
- Works offline (queue encrypted writes)
- No server ever sees plaintext

## Routes

- `/` - Today's prompt + entry status
- `/write` - Write entry for today
- `/history` - Past entries calendar
- `/partner` - Manage pair
- `/settings` - Notification preferences

## Phases

1. **Foundation** - Schema, encryption primitives, key exchange
2. **Core Flow** - Prompt, write, reveal mechanism
3. **History** - Browse, search, streaks
4. **Polish** - Notifications, AI prompts, themes
