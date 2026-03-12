---
title: "Long-Term Roadmap: Redesign, Rewrite, and Ecosystem Expansion"
---

# Long-Term Roadmap: Redesign, Rewrite, and Ecosystem Expansion

Date: 2026-03-12
Status: Active
Related: [[two-two-migration]], [[ecosystem-expansion-mechanics-web-godot]]

## 1. Immediate Scope: Phase 2 Refactoring
The focus is on "un-tangling" the current `client` repo to make it a modular foundation for other apps.

### Key Actions:
- **Consolidate Deployments:** Merge `app/activity/deploy` and `app/viewports/*/deploy` into `src/features/deploy`.
- **Feature Extraction:** Systematically move components to `src/features/` (Classification, Social, Research).
- **Hardened API Routes:** Ensure all mutations are handled by the server to prevent data drift between frontends.

## 2. Shared Ecosystem Architecture
The goal is "One Identity, Many Frontends."

### Shared Inventory & Economy
- **Canonical API:** The `client` repo's `/api/gameplay/inventory` becomes the source of truth for all apps.
- **Resource Sync:** Minerals extracted in Godot minigames or other Next.js apps must write to the shared ledger via idempotent API calls.
- **Item Compatibility:** Standardize `item_id`s across the ecosystem (e.g., Item 3104 is always the Biodome).

### Multi-Frontend Integration
- **Cross-App Navigation:** Establish a "Hub" (currently `/ecosystem`) that handles routing between the main client and sub-apps (e.g., Saily).
- **Shared Auth:** Use HTTP-only cookies and Supabase SSR to maintain session state across subdomains.

## 3. Long-Term Expansion & Integrations

### Godot Minigame Linkage
- **Expedition Loops:** Web (Sector Selection) -> Deep Link to Godot (Mining Run) -> Web (Reward Debrief).
- **Run Tokens:** Issue signed JWTs for Godot runs to prevent reward spoofing.

### Guilds & Community Events
- **Collaborative Contracts:** Weekly targets (e.g., "Classify 10,000 Clouds") that pull data from all apps.
- **Sector Incidents:** Real-time world state changes (Solar Storms) triggered by server-side events that affect UI/mechanics on all surfaces.

## 4. Technical Debt & Parity
- **The Parity Contract:** Backend migrations must not change the visual or behavioral "feel" of legacy citizen science projects.
- **Automated Verification:** Expand Cypress suites to include cross-app flow testing.
