# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone with an idea — a general consumer ideation tool, not scoped to a single professional persona. The tool's audiences (solo builders, small teams, local groups, self-directed learners, caregivers, independent creators) are subjects of the ideas being shaped, not the user of the workbench itself.

## Product Purpose

ideator.dev is an idea discovery workbench. It helps a person go from a vague urge to build something to a decision they can act on: combine a specific person, a recurring tension, and a sharp constraint; compare product shapes; inspect the behavior chain; and leave with a test — not a wall of generated copy. Success means the user leaves each session with a clearer decision (pursue, reshape, or drop) and a saved project they can keep pressure-testing.

## Positioning

The combination of three things a generic AI idea generator or a chat session cannot truthfully copy:

1. **Structured method** — ideas come from person + tension + constraint collisions, and pressure-tests force a decision instead of generating praise.
2. **Private by default** — half-formed ideas stay behind the user's account until the idea earns an audience.
3. **A persistent workbench** — real project state (artifacts, scope, behavior chain) the user keeps working in, not throwaway chat output.

## Operating Context

- **Idea lab:** seed discovery from audience/tension/constraint combinations, or arrive with an initial idea.
- **Brief form:** initial idea, domain (software / SaaS / developer tool / mobile app / game), intended users, ambition (weekend experiment / small product / serious build / studio scale), platform, constraints, non-goals.
- **Workspace:** named plain-language artifacts (north star, technical blueprint, milestones, immediate next step), behavior map, and a scope board; fields are edited without touching JSON. The workspace exposes weak thinking rather than decorating it.
- **Account:** Neon Auth with email verification; private workspaces per account.
- **Deliberately deferred:** sharing, teams, and public discovery "can wait until the idea earns them."

## Capabilities and Constraints

- Next.js 16 / React 19 / Tailwind 4 monorepo; oRPC API layer; Drizzle ORM on Neon Postgres; deployed via OpenNext on Cloudflare.
- Projects persist per authenticated user with status and domain metadata.
- Explicitly undecided product facts: sharing/teams/public discovery timing; monetization; anything beyond the single-user private workbench.

## Brand Commitments

- **Name:** ideator.dev (binding).
- **Voice:** plain, direct, evidence-flavored copy — "Find an idea. Then make it survive reality." / "Built for the first useful version." (binding).
- **Naming rule (from repo AGENTS.md, binding):** plain descriptive sentence-case working titles only; no startup-style wordmarks, arbitrary metaphors, fused words, or two-word Title Case compounds (no "Signal Garden"-style names).

## Evidence on Hand

- Real landing-page copy, idea-lab audience/tension/constraint content, and workspace artifact names in `apps/web/src/components/` (landing-page.tsx, idea-lab.tsx, brief-form.tsx).
- A live authenticated app with dashboard, project list, and empty states.
- **No** testimonials, customers, benchmarks, press, or case studies exist. Future design work must not fabricate any of these.
