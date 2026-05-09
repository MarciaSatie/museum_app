# Progress Follow-Up

Date: 2026-05-09

This document tracks what has already been achieved in the Museum App and what is still missing against the PlacemarkHAPI level framework shown in the reference image.

## Current Progress

- Hapi server is set up and running with web routes and REST API routes.
- MongoDB-backed stores are in place for users, museums, categories, exhibitions, and images.
- Swagger documentation is configured for the API.
- Authentication is implemented with sessions/cookies and JWT support for API access.
- Basic automated tests exist for models and API flows.
- Deployment configuration exists for Render.

## Level Checklist

### Level 1

- Social 1: still missing.
- Social 2: still missing.
- TDD: partially achieved through unit tests.
- Authentication: partially achieved through login/session handling and validation.
- DevOps: partially achieved through deployment setup.

### Level 2

- Social 1: still missing.
- Social 2: still missing.
- TDD: missing coverage reports and broader automated coverage.
- Authentication: missing password hashing and salting.
- DevOps: missing Git Flow-style release workflow.

### Level 3

- Social 1: still missing.
- Social 2: still missing.
- TDD: missing e2e Playwright tests.
- Authentication: missing OAuth login providers such as Google or GitHub.
- DevOps: missing cloud/devops features expected at this level.

### Level 4

- Social 1: still missing.
- Social 2: still missing.
- TDD: missing enhanced e2e test coverage.
- Authentication: missing third-party auth providers such as Auth0 or Firebase.
- DevOps: missing advanced deployment and TypeScript-focused delivery items.

## Priority Follow-Up Tasks

1. Add password hashing and salting for user accounts.
2. Add test coverage reporting and e2e tests.
3. Implement one social feature, such as ratings or favourites.
4. Add OAuth login support.
5. Improve release and deployment workflow.

## Notes

- Keep this file updated as features are completed.
- Use it as a short status report for weekly progress reviews or submission prep.