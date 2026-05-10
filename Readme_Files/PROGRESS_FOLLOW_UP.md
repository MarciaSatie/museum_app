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
- Level 1 is not fully complete yet: gallery and social scaffolding exist, but the assignment-level POI/review features are still missing. 🟡
- Level 2 social gallery scaffolding exists, but it should be treated as follow-up work after Level 1 is complete. 🟡

## Level 1 Completion Blocks

The app still needs these items before Level 1 can be considered complete:

- Private POIs: POI data model, CRUD routes, POI UI, ownership checks, Joi validation.
- Reviews: review data model, CRUD routes, review UI on museum/exhibition pages, validation.
- TDD: coverage tooling, stronger test coverage, CI test step, e2e tests for the core flows.
- DevOps: tagged release workflow, release documentation, and automated checks/deploys on release tags.

## Level Checklist

### Level 1

- Social 1 — Private POIs: 🔴 Not started
	- Missing tasks:
		- POI data model/schema in MongoDB.
		- API endpoints for POI CRUD operations.
		- Web UI to create, edit, delete, and view private POIs.
		- Ownership/authorization so only the creator can access their POIs.
		- Joi validation for POI payloads.

- Social 2 — Reviews: 🔴 Not started
	- Missing tasks:
		- Review schema/model.
		- API endpoints for creating, reading, updating, and deleting reviews.
		- Rating/text review UI on museum and exhibition pages.
		- Review display on detail pages.
		- Validation and authorization checks for review actions.

- TDD: 🟡 Partially achieved
	- Breakdown:
		- Unit tests for models and some API flows exist (`test/`), but coverage reports and integration/e2e tests are missing.
		- Missing tasks:
			- Add coverage tooling (`nyc`/`c8` or similar).
			- Increase test coverage for auth, validation, and authorization paths.
			- Add CI test step.
			- Add end-to-end tests for critical user flows.

- Authentication: ✅ Complete for Level 1 sanitisation
	- Breakdown:
		- Session and JWT flows implemented for web and API use.
		- Input/output sanitisation is covered by Joi validation and Handlebars escaping.
		- Password hashing is now implemented in the login flow, but password reset/account verification remain future work.

- DevOps: 🔴 Not started for Level 1 release requirements
	- Breakdown:
		- Render deployment config exists, but the Level 1 tagged release workflow is not in place.
		- Missing tasks:
			- Create semantic version tags for releases.
			- Document the release process.
			- Add CI checks for tests/lint before release.
			- Automate deployment on tagged releases.

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

1. 🔴 Build Level 1 Private POIs
	- Tasks: add POI schema, CRUD endpoints, ownership checks, UI pages, Joi validation.
2. 🔴 Build Level 1 Reviews
	- Tasks: add review schema, CRUD endpoints, review UI, museum/exhibition detail display, validation.
3. 🟡 Finish Level 1 test coverage
	- Tasks: add coverage tooling, expand auth/validation tests, add e2e coverage for core flows, wire into CI.
4. 🔴 Add tagged release workflow
	- Tasks: create version tags, document release steps, and automate deploys/checks on release.
5. 🟡 Keep Level 2 social gallery work as follow-up
	- Tasks: privacy controls, share flows, feed aggregation, notifications.

## Notes

- Keep this file updated as features are completed. Use the status icons to give quick visibility during reviews.
- If you want, I can open PRs that implement the prioritized items above starting with password hashing and a small favorites API.