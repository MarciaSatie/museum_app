# Progress Follow-Up

Date: 2026-05-10

This document tracks what has already been achieved in the Museum App and what is still missing against the PlacemarkHAPI level framework shown in the reference image. Status icons: ✅ = complete, 🟡 = in progress / partly complete, 🔴 = not started.

## Current Progress

- Hapi server is set up and running with web routes and REST API routes. ✅
- MongoDB-backed stores are in place for users, museums, categories, exhibitions, and images. ✅
- Swagger documentation is configured for the API. ✅
- Authentication is implemented with sessions/cookies and JWT support for API access (partial). 🟡
- Basic automated tests exist for models and API flows (unit tests present). 🟡
- Deployment configuration exists for Render. 🟡
- Level mapping: Level 1 Social 1 (Museum POI & My Gallery) — implemented. ✅
- Level 2 POI mapping: Social Gallery feature scoped and partially implemented (gallery pages and sharing UI exist but social interactions need work). 🟡

## Level Checklist

### Level 1

- Social 1 — Museum POI & My Gallery: ✅ Complete
	- Breakdown of what's done:
		- Museum POI pages and data endpoints implemented (`museum-api`, `museum-controller`).
		- `My Gallery` view and image gallery controller exist (`imageGallery-controller`, `galleries-view`).
		- Basic UI for adding/viewing gallery items is present.
	- Remaining (small polish): image upload UX improvements, user messaging that an item was saved. 🟡

- Social 2 — Likes / Comments / Follows: 🟡 In progress
	- Breakdown:
		- Core models for social interactions are not finalized.
		- Tasks: add `favorites/likes` endpoints, UI buttons on gallery/POI items, persist user->item relations, and add tests.

- TDD: 🟡 Partially achieved
	- Breakdown:
		- Unit tests for models and some API flows exist (`test/`), but coverage reports and integration/e2e tests are missing.
		- Tasks: add coverage tooling, increase test coverage, add CI test step.

- Authentication: 🟡 Partially achieved
	- Breakdown:
		- Session and JWT flows implemented for web and API use.
		- Missing: secure password hashing/salting for existing accounts, password reset flow, account verification, and stronger validation.

- DevOps: 🟡 Partially achieved
	- Breakdown:
		- Render deployment config exists, but release workflow (Git Flow, CI/CD checks) is incomplete.
		- Tasks: add CI pipeline (tests + lint), release naming & branching discipline, automated deploys on merge.

### Level 2

- Social 1 — Social Gallery (POI-level shared galleries / feeds): 🟡 In progress
	- Breakdown:
		- Gallery pages and sharing UI are scaffolded but social feed, privacy controls, and notifications are incomplete.
		- Tasks: design social-gallery schema, implement share/visibility API, add comment/like endpoints for POI items, and wire front-end actions.

- Social 2 — Advanced social features (followers, feeds, mentions): 🔴 Not started
	- Breakdown:
		- Tasks: design follower model, implement feed aggregation, real-time updates or polling, and scale considerations.

- TDD: 🟡 See Level 1 tasks for coverage and e2e.
- Authentication: 🟡 Password hashing/salting required (see Level 1 tasks).
- DevOps: 🟡 Add CI/CD and Git Flow release automation.

### Level 3

- Social 1 — Extended social experience (shares, curated galleries): 🔴 Not started / planning
	- Tasks: richer sharing UX, moderation tools, reporting, content curation.

- Social 2 — Community features: 🔴 Not started
	- Tasks: groups, events, or discussion threads per POI/gallery.

- TDD — e2e Playwright tests: 🔴 Not started
	- Tasks: add Playwright, write critical user journey tests, integrate into CI.

- Authentication — OAuth providers (Google/GitHub): 🔴 Not started
	- Tasks: register apps, add provider flows, map provider accounts to users.

- DevOps: 🔴 Not started for advanced cloud features (monitoring, infra-as-code).

### Level 4

- Advanced production-grade features (performance, observability, enterprise auth): 🔴 Not started
	- Tasks: observability (metrics/logging), rate limiting, SSO providers, performance tuning, TypeScript full-coverage delivery.

## Priority Follow-Up Tasks (with status)

1. ✅ Level 1 Social 1: Museum POI & My Gallery — already implemented and verified.
2. 🟡 Add password hashing and salting for user accounts
	- Tasks: integrate `bcrypt`, migrate existing passwords safely, add password-reset flow, add unit tests.
3. 🟡 Add test coverage reporting and e2e tests
	- Tasks: add `nyc`/`c8` or similar coverage tooling, add Playwright e2e tests, surface coverage in CI.
4. 🟡 Implement social interactions (favorites/likes/comments)
	- Tasks: define models, create API endpoints, wire UI buttons, add tests and basic analytics.
5. 🟡 Social Gallery (Level 2) — move from scaffold to feature-complete
	- Tasks: privacy controls, share flows, feed aggregation, notifications.
6. 🔴 OAuth login support
	- Tasks: register apps (Google/GitHub), implement provider flows, link provider accounts, add tests.
7. 🟡 Improve release and deployment workflow
	- Tasks: add CI (lint, tests, coverage), enforce Git Flow or trunk-based rules, automated deploy on merge.

## Notes

- Keep this file updated as features are completed. Use the status icons to give quick visibility during reviews.
- If you want, I can open PRs that implement the prioritized items above starting with password hashing and a small favorites API.

## Notes

- Keep this file updated as features are completed.
- Use it as a short status report for weekly progress reviews or submission prep.