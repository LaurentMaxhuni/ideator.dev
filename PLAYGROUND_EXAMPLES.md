# Idea Playground examples

These examples are illustrative. Each exploration generates one **Safer**, **Bolder**, and **Stranger** direction; choosing a direction expands it into a linked child project.

## 1. Meeting notes that produce decisions

**Original idea:** A lightweight workspace that turns meeting notes into clear decisions and owners.

**Selected constraints:** `weekend-build`, `value-in-60-seconds`

- **Safer — Decision list from meeting notes:** Paste notes and receive a single-page list of decisions, owners, and unresolved questions. The first test is whether five teams can correct and share the result within one minute.
- **Bolder — A required “what changed?” check:** Replace conventional meeting summaries with a decisive “what changed?” card that attendees must confirm or challenge. The biggest risk is that the opinionated format feels too restrictive.
- **Stranger — A receipt for meeting commitments:** Treat every meeting like a transaction and issue a compact receipt containing commitments, due dates, and the cost of unresolved decisions. The first test is whether the metaphor improves follow-through without feeling punitive.

**Example selection:** Choosing **A receipt for meeting commitments** creates a `stranger` child project linked to the original workspace.

## 2. Field inventory without connectivity

**Original idea:** A mobile inventory tool for volunteer-run community food pantries.

**Selected constraints:** `offline-first`, `no-onboarding`

**Custom constraint:** Must remain usable while wearing work gloves.

- **Safer — Offline pantry count:** Open directly into a large-tap count screen, store changes locally, and synchronize when connectivity returns. The first test uses one pantry aisle and a phone in airplane mode.
- **Bolder — Three-state stock view:** Reduce inventory to three signals—enough, low, and gone—with oversized controls and an immediate visual map of shortages. The biggest risk is losing useful quantity detail.
- **Stranger — Shift handoff between phones:** Let volunteers pass an offline inventory session from phone to phone using a short local transfer code, making the shift—not an account—the unit of work. The first test checks whether two volunteers can hand off a live count without instructions.

**Example selection:** Choosing **Three-state stock view** creates a `bolder` child brief that preserves the mobile platform and original non-goals while appending all three constraints.

## 3. Developer-tool exploration without extra constraints

**Original idea:** A developer tool that explains unfamiliar database schemas before engineers make changes.

**Selected constraints:** None

- **Safer — Schema map and glossary:** Upload or paste a schema and receive a concise entity map, naming glossary, and list of risky relationships.
- **Bolder — Pre-migration consequence check:** Center the experience on challenging a proposed schema change, showing its likely downstream consequences before displaying general documentation.
- **Stranger — A field guide to database risk:** Present the schema as a navigable field guide where tables are habitats, relationships are trails, and dangerous migrations are clearly marked hazards—playful in presentation but precise in analysis.

**Example selection:** Choosing **Pre-migration consequence check** creates a `bolder` child project. Repeating the same save request returns that existing child instead of creating a duplicate.
