# Spice Weekly

> Weekly intimacy prompts for couples. Non-graphic, boundary-respecting, playful.

## Entities

- **User**: id, email, name, isAdultConfirmed, comfortLevel (gentle|playful|bold), noGoTopics[], physicalLimitations
- **Couple**: id, userAId, userBId, status (active|paused), scheduledDay, scheduledTime, timezone, effectiveComfortLevel
- **Invite**: id, inviterUserId, inviteeEmail, token, status (pending|accepted|expired), expiresAt
- **PromptTemplate**: id, title, body, comfortLevel, intimacyType (conversation|connection|sensual), topics[], active
- **PromptInstance**: id, coupleId, templateId, finalText, scheduledFor, deliveredAt, status (pending|delivered|completed|skipped)
- **PromptFeedback**: id, promptInstanceId, userId, completionStatus, spiceRating (1-5), notes

## Events

**User**
- UserCreated, UserUpdated, PreferencesUpdated

**Couple**
- CoupleCreated, CoupleSettingsUpdated, CouplePaused, CoupleResumed

**Invite**
- InviteSent, InviteAccepted, InviteExpired

**Prompt**
- PromptScheduled, PromptDelivered, PromptCompleted, PromptSkipped
- FeedbackSubmitted

## Features

**Onboarding**
- [ ] Sign up with email (18+ attestation required)
- [ ] Set comfort level and boundaries
- [ ] Invite partner via email
- [ ] Partner accepts invite, couple linked

**Weekly Prompts**
- [ ] Receive weekly prompt on scheduled day/time
- [ ] View current prompt
- [ ] Mark as "We did this" or "We skipped"
- [ ] Rate spiciness (1-5 scale)
- [ ] Add optional notes

**History & Settings**
- [ ] View past prompts with ratings
- [ ] Update comfort level
- [ ] Update no-go topics
- [ ] Change schedule (day/time)
- [ ] Pause/resume prompts

**Prompt Generation**
- [ ] Select from template library based on comfort level
- [ ] Filter out no-go topics
- [ ] Avoid recent repeats
- [ ] Adapt based on feedback history

## Constraints

- All prompts non-graphic, consent-focused
- No minors, violence, or explicit content
- effectiveComfortLevel = min(userA, userB)
- globalBoundaries = union of both users' noGoTopics
- Email notifications for new prompts
- Works offline (local-first)

## Routes

- `/` - Landing page
- `/signup` - Onboarding
- `/dashboard` - Current prompt + status
- `/history` - Past prompts
- `/settings` - Preferences + schedule
- `/invite` - Partner invite flow

## Phases

1. **Foundation** - Schema, entities, events, queries
2. **Auth & Linking** - Signup, invite flow, couple creation
3. **Prompts** - Template library, scheduling, delivery
4. **Feedback** - Rating, notes, history
5. **Polish** - Email notifications, adaptation logic
