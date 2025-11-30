# Product Spec: Weekly Couples Prompt App (“Spice Weekly”)

> **Goal:** A simple, safe app that sends couples a tailored, weekly, non-graphic intimacy prompt to help them connect, communicate, and gently spice up their sex life.

---

## 0. TL;DR for the Coding Agent

Build a small web/mobile-friendly service where:

* Two adults sign up and **link as a couple**.
* They choose:

  * Preferred **day/time** for prompts.
  * **Comfort level** (e.g., mild → bold).
  * **Boundaries** and no-go topics.
* Once a week, they receive a **joint prompt** in-app and via notification (email/Push/SMS optional).
* They can **react** (completed, skipped, too mild, too spicy) and leave optional feedback.
* The system uses that feedback + preferences to **adapt** future prompts.
* Content is **non-graphic**, focused on intimacy, communication, and sensual connection, not explicit erotica.

This document is the single source of truth. The agent should implement the backend, basic frontend, and data model as described. Where choices are underspecified, favor **simple, boring, well-typed** solutions.

---

## 1. Problem & Vision

### Problem

Many couples want to keep their sex life and intimacy feeling alive and playful, but:

* It’s awkward to initiate new ideas.
* They’re busy and forget.
* They don’t know where to start or what’s comfortable for both.

### Vision

A lightweight “relationship coach in your pocket” that:

* Once a week, gives them a **mutually agreed** prompt to try.
* Respects **boundaries** and comfort levels.
* Stays **non-graphic, respectful, and safety-conscious**.
* Feels playful, not clinical.

---

## 2. Personas & Use Cases

### Personas

1. **Busy Couple (Emma & Alex)**

   * Ages 28–40, kids, careers.
   * Don’t have time to plan “date nights.”
   * Want simple, low-friction ideas that are safe and not over-the-top.

2. **Long-Term Partners (Taylor & Jordan)**

   * Together 7+ years.
   * Feel stuck in routines.
   * Want structured nudges toward more communication and intimacy.

3. **New-ish Couple (Sam & Riley)**

   * 6–18 months in.
   * Curious, open-minded but cautious.
   * Want to explore **gradually**, with clear boundaries.

### Key Use Cases

* Set up a **shared account**.
* Configure **comfort level** (“sweet”, “spicy”, “bold”) and boundaries.
* Get a **weekly prompt**.
* **React** to each prompt: done / skipped / too easy / too much.
* View **history** of past prompts and notes.
* Optionally **pause** the program.

---

## 3. Scope

### In-Scope (MVP)

* Basic web app (responsive) with:

  * Email-based auth (magic link or password).
  * Invite flow to link with a partner.
  * One **Couple** entity = two users.
* Weekly scheduler that creates and delivers one **PromptInstance** per couple.
* Prompt content:

  * Derived from a **PromptTemplate** library + simple rules.
  * Optional LLM generation, but must enforce safety constraints.
* Delivery channels:

  * In-app prompt view.
  * Email notification (linking to the prompt).
* Feedback loop:

  * Completion status.
  * Simple rating and optional comments.
* Basic settings:

  * Day/time, comfort level, topics to avoid, pause/resume.

### Out of Scope (for now)

* Native mobile apps (iOS/Android) – treat as later.
* Payment/subscription system.
* Complex AI personalization beyond simple rules (can be added later).
* Rich social features (sharing with friends, group modes).

---

## 4. High-Level UX / User Flows

### 4.1 Onboarding Flow

1. User lands on **Landing Page** → clicks **Get Started**.
2. Signs up with email + name + date of birth confirmation (18+ self-attestation).
3. On first login:

   * Provide:

     * Relationship status (optional).
     * Comfort level (enum).
     * Topics to avoid.
     * Preferred weekly day/time.
   * App creates a **User**.
4. User chooses:

   * **“Invite my partner”** → provide partner email.
5. Partner receives invite email → signs up → automatically linked to same **Couple**.

### 4.2 Weekly Prompt Cycle

1. On scheduled day/time (per couple), system:

   * Generates or selects a **PromptInstance** based on:

     * Couple comfort level.
     * History (avoid repeats).
     * Boundaries.
2. Notification:

   * Email both partners: “Your weekly connection prompt is ready.”
3. In-app:

   * Both see the same prompt text + brief guidance (duration, required context).
4. After they attempt it:

   * They can set status:

     * “We did this”
     * “We skipped it”
   * Optional feedback:

     * Slider: “Too mild ← Just right → Too intense”
     * Free-text note.

### 4.3 Settings & Management

* Each partner:

  * Can update their **individual** preferences (comfort level, boundaries).
* Couple-level settings:

  * Day/time.
  * Prompt frequency (1/week initially, maybe 1–2/week later).
  * Pause/resume.

If partners disagree on comfort level, use the **lower/safer** level.

---

## 5. Functional Requirements

### 5.1 Authentication & Accounts

* Email-based signup with verification.
* Each **User** must self-attest they are 18+ (stored flag).
* Support login from multiple devices.

### 5.2 Couple Linking

* Each User can be in **at most one Couple** at a time (MVP).
* Primary user triggers invite:

  * System sends unique, time-limited invite token to partner email.
  * Accepting creates link and forms Couple record.

### 5.3 Preferences & Boundaries

* Each user defines:

  * `comfortLevel`: enum = `["gentle", "playful", "bold"]` (names can change).
  * `noGoTopics`: e.g., `[“role-play”, “lingerie”, “public places”]` – free text tags from predefined list.
  * `physicalLimitations` (optional short free text).
* Couple-level derived settings:

  * `effectiveComfortLevel` = min of the two.
  * `globalBoundaries` = union of `noGoTopics` lists.

### 5.4 Prompt Generation

* Prompt types:

  * **Conversation prompts** (talk about desires, fantasies, boundaries).
  * **Connection rituals** (e.g., scheduled cuddling, massages, affection).
  * **Light sensual challenges** (non-graphic; e.g., changing environment, trying new forms of touch or compliments).
* Constraints:

  * Must be **non-graphic** and **non-violent**.
  * No mentions of minors, taboo content, or anything non-consensual.
  * Must respect `noGoTopics`.
* Generation logic:

  1. Start from **PromptTemplates** tagged by:

     * `intimacyType`: communication, sensual, playful.
     * `comfortLevel`: required minimal comfort level.
     * `topics`: tags.
  2. Filter by:

     * templates with `comfortLevel <= effectiveComfortLevel`.
     * no overlapping `topics` with `globalBoundaries`.
     * not used recently (e.g., last N weeks).
  3. Randomly pick from remaining, with slight weighting:

     * Toward types the couple rated highly in previous weeks.
  4. Create a **PromptInstance** for the Couple.

> **Note:** If integrating an LLM, use templates as scaffolding and ask the LLM to rephrase or customize, but still classify final output and validate it with a rules-based filter.

### 5.5 Prompt Delivery & Status

* A **scheduler** runs periodically (e.g., every 5 minutes), checks which couples have a due prompt.
* For each due couple:

  * Create PromptInstance.
  * Send email notifications.
* PromptInstance status:

  * `pending` → `delivered` → `completed` or `skipped`.
  * Status transitions can only go forward.

### 5.6 Feedback & Adaptation

* Feedback fields:

  * `completionStatus`: `completed | skipped`.
  * `spiceRating`: integer (1–5) where 1 = too mild, 3 = just right, 5 = too bold.
  * `notes`: optional string.
* Adaptation rules:

  * Store running averages per couple:

    * average `spiceRating` by `intimacyType`.
  * If average `spiceRating` < 2 over last 3 prompts:

    * Consider nudging comfort up *within their declared limit* (still safe).
  * If > 4 over last 3 prompts:

    * Consider focusing templates tagged as “gentle” for next prompt.
  * This adaptation can be implemented as simple heuristic logic (no ML required).

### 5.7 Safety & Content Filtering

* Must **never** send graphic sexual instructions.
* Must **never** mention minors.
* Safety features:

  * Hard-coded library of allowed prompt types and patterns.
  * If using LLM:

    * Prompt engineering to reinforce boundaries.
    * Post-generation validator to reject prompts with disallowed words/topics.
* Log prompt text for moderation and debugging (securely).

---

## 6. System Architecture

### 6.1 High-Level Components

* **Web Frontend**

  * SPA or simple server-rendered pages.
  * Key screens: onboarding, dashboard, current prompt, history, settings.
* **Backend API**

  * REST/JSON (or GraphQL) endpoints.
  * Auth, couple linking, prompts, feedback.
* **Database**

  * Relational (Postgres) recommended.
* **Scheduler/Worker**

  * Runs due prompt generation + notifications.
* **Email Service**

  * SendGrid / SES / Mailgun, etc.

### 6.2 Suggested Tech Stack (Example, not mandatory)

* Backend: Node.js + TypeScript (Express/Fastify/Effect, etc.).
* Frontend: React or simple SSR.
* DB: Postgres + a migration tool (Prisma/Drizzle/Knex).
* Background jobs: BullMQ / Cloud-native cron (Cloudflare workers cron, etc.).

---

## 7. Data Model

### 7.1 Entities

#### `User`

```ts
User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isAdultConfirmed: boolean; // 18+ self-attestation
  // Preference snapshot (individual)
  comfortLevel: "gentle" | "playful" | "bold";
  noGoTopics: string[]; // serialized array/JSON
  physicalLimitations?: string | null;
}
```

#### `Couple`

```ts
Couple {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "paused" | "deleted";
  scheduledDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  scheduledTimeUTC: string; // "HH:MM"
  timezone: string; // e.g. "America/Los_Angeles"
  effectiveComfortLevel: "gentle" | "playful" | "bold"; // derived
}
```

#### `PromptTemplate`

```ts
PromptTemplate {
  id: string;
  title: string; // internal, optional
  body: string;  // e.g. template with placeholders
  comfortLevel: "gentle" | "playful" | "bold";
  intimacyType: "conversation" | "connection" | "sensual";
  topics: string[]; // e.g. ["touch", "fantasy-lite"]
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `PromptInstance`

```ts
PromptInstance {
  id: string;
  coupleId: string;
  scheduledFor: Date;
  deliveredAt?: Date | null;
  completedAt?: Date | null;

  status: "pending" | "delivered" | "completed" | "skipped";

  templateId?: string | null; // can be null if fully generated by AI
  finalText: string;          // final text shown to users

  spiceRatingAverage?: number | null; // average of partner feedback
}
```

#### `PromptFeedback`

```ts
PromptFeedback {
  id: string;
  promptInstanceId: string;
  userId: string;
  completionStatus: "completed" | "skipped";
  spiceRating: number; // 1–5
  notes?: string | null;
  createdAt: Date;
}
```

#### `Invite`

```ts
Invite {
  id: string;
  inviterUserId: string;
  inviteeEmail: string;
  token: string;
  status: "pending" | "accepted" | "expired";
  createdAt: Date;
  expiresAt: Date;
}
```

---

## 8. API Design (REST Example)

### Auth

* `POST /auth/signup`

  * Body: `{ email, name, isAdultConfirmed }`
  * Returns: user, token.
* `POST /auth/login`

  * Body: `{ email, password? }` (or magic link).
  * Returns: user, token.
* `GET /auth/me`

  * Returns current user.

### Couple Management

* `POST /couple/invite`

  * Body: `{ inviteeEmail }`
  * Creates `Invite`, emails token link.

* `POST /couple/accept-invite`

  * Body: `{ token }`
  * Links new user to inviter’s couple OR creates new couple.

* `GET /couple`

  * Returns the couple object and partner profiles.

### Preferences & Settings

* `PUT /user/preferences`

  * Body: `{ comfortLevel, noGoTopics, physicalLimitations }`
* `PUT /couple/settings`

  * Body: `{ scheduledDayOfWeek, scheduledTimeUTC, timezone, status }`

### Prompts

* `GET /prompts/current`

  * Returns current week’s PromptInstance (if any) for the couple.
* `GET /prompts/history?limit=20&offset=0`

  * Returns paginated list of past PromptInstances.

### Feedback

* `POST /prompts/:promptId/feedback`

  * Body: `{ completionStatus, spiceRating, notes }`
  * Creates `PromptFeedback`.

---

## 9. Scheduler Logic

### Pseudocode

```ts
// Runs every 5 minutes
function runWeeklyPromptScheduler(now: Date) {
  const couples = findCouplesDueForPrompt(now);

  for (const couple of couples) {
    const promptInstance = createPromptForCouple(couple, now);
    sendEmailNotification(couple, promptInstance);
  }
}

function findCouplesDueForPrompt(now: Date): Couple[] {
  // 1. Convert `now` to each couple's timezone.
  // 2. Check scheduled day/time; ensure they don't already have a prompt in the last 7 days.
}
```

---

## 10. Frontend Pages

### 10.1 Landing

* Simple explanation: weekly prompts to help couples connect.
* CTA → signup.

### 10.2 Onboarding

* Collect basic info.
* Set comfort level and boundaries.
* Invite partner.

### 10.3 Dashboard

* Shows:

  * Current prompt (if any).
  * Status (pending / completed).
  * Button(s):

    * “We did this”
    * “We skipped this”
  * Feedback UI.

### 10.4 History

* List past prompts:

  * Date.
  * Prompt summary.
  * Status + average spice rating.
  * Optional tooltip with notes.

### 10.5 Settings

* Comfort level.
* Boundaries.
* Schedule.
* Pause/resume.

---

## 11. Content & Safety Guidelines (for Implementation)

* All prompts must:

  * Focus on **emotional connection, communication, and consensual intimacy**.
  * Be **non-graphic**; avoid explicit descriptions of sexual acts or body parts.
  * Prohibit:

    * Any reference to minors.
    * Non-consensual content.
    * Violence or degradation.
    * Illegal or extreme content.
* Provide a **report/feedback mechanism**:

  * Quick “Report prompt” button that flags the PromptInstance for internal review (store `reported = true`).

---

## 12. Non-Functional Requirements

* **Performance**

  * App should load core dashboard in < 2 seconds on average broadband.
* **Uptime**

  * Target 99%+ (MVP; can be “best effort” but design for stability).
* **Security**

  * Use HTTPS everywhere.
  * Salted + hashed passwords if using passwords.
  * Sensitive fields (notes, prompts) should be protected against trivial leaks (database access controls, etc.).
* **Privacy**

  * No sharing between couples.
  * No public profiles.
  * All content is private to the two users in the couple.

---

## 13. Analytics & Metrics

Track (internally, anonymized):

* # of active couples.
* Weekly prompt completion rate.
* Distribution of comfort levels.
* Feedback averages by prompt type.

Do **not** log explicit personal details beyond what’s needed for function and safety.

---

## 14. Open Questions / Implementation Leeway

* Exact wording and tone of prompts is left open; follow non-graphic, supportive, consent-oriented style.
* Whether to include LLM personalization in MVP or rely solely on a curated template set.
* How sophisticated adaptation should be (simple heuristics vs. more data-driven later).

---

If you’d like, next step I can generate:

* A **seed library** of a dozen **very PG-13, non-graphic prompts** as initial `PromptTemplate` rows.
* Concrete **schema migrations** (SQL/Prisma/Drizzle).
* Example **end-to-end flow** in code (e.g., simple Node backend + React page).
