# Witness

> Some things need a witness. A promise made. A debt acknowledged. A memory preserved.

A minimalist app for creating witnessed records. "I lent you $50." "I agree." Both sign. Immutable. Not a contract—a handshake with memory.

## Primitives Used

- **AuditChain**: Hash-linked records for tamper evidence
- **Participant**: Asymmetric roles (initiator, witness)
- **Channel**: One per record relationship

## Entities

- **Record**: id, channelId, initiatorId, witnessId, content, category, amount?, prevHash, status (pending|witnessed|disputed)
- **Signature**: id, recordId, userId, signature, signedAt
- **Verification**: id, recordId, verifiedHash, verifiedAt, valid

## Events

**Record**
- RecordCreated (initiator drafts)
- RecordWitnessed (witness signs)
- RecordDisputed (either party flags)

**Signature**
- SignatureAdded

**Verification**
- ChainVerified

## Roles

- **Initiator**: Create record, cannot witness own
- **Witness**: Sign to confirm, cannot edit
- **Either**: View, verify chain, dispute

## Features

**Create Record**
- [ ] Draft statement with optional amount
- [ ] Categorize (loan, promise, memory, agreement)
- [ ] Send to witness via link

**Witness Flow**
- [ ] View pending record
- [ ] Sign to witness (cryptographic signature)
- [ ] Record becomes immutable after both sign

**Verification**
- [ ] Verify hash chain integrity anytime
- [ ] Export record with proof
- [ ] Share verified link

**History**
- [ ] View all records by category
- [ ] Filter by person, date, status
- [ ] See chain of related records

**Disputes**
- [ ] Flag record as disputed
- [ ] Both parties notified
- [ ] Dispute visible but record preserved

## Constraints

- Hash chain: each record includes hash of previous
- Cryptographic signatures via Web Crypto API
- No central authority—verification is math
- Works offline, syncs when connected
- Records immutable after witnessed
- Disputes append, never modify

## Routes

- `/` - Recent records + pending
- `/create` - Draft new record
- `/witness/:id` - Sign as witness
- `/record/:id` - View record + verification
- `/history` - All records
- `/verify` - Verify chain integrity

## Phases

1. **Foundation** - Schema, hash chain, signature primitives
2. **Core Flow** - Create, share, witness
3. **Verification** - Hash verification, export with proof
4. **History** - Browse, filter, disputes
5. **Polish** - Categories, amounts, notifications
