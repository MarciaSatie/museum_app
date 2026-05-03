# Museum App - PlacemarkHAPI Assignment Breakdown

## Overview
This document provides a comprehensive breakdown of the PlacemarkHAPI assignment requirements for the Museum App, organized by development levels and feature columns. It details what has been accomplished and what remains to be implemented.

---

## 📊 Summary Table

| Level | Social 1 | Social 2 | TDD | Authentication | DevOps |
|-------|----------|----------|-----|-----------------|--------|
| **1** | ❌ Private POIs | ❌ Reviews | ⚠️ Partial | ✅ Input/Output Sanitisation | ❌ Tagged Releases |
| **2** | ❌ Public POIs | ❌ Share | ⚠️ Partial | ✅ Password Hashing & Salting | ❌ Git Flow |
| **3** | ❌ Rating | ❌ Noticeboard | ❌ e2e Playwright Basic | ✅ OAuth (Firebase) | ✅ Render & AWS |
| **4** | ❌ Favourites | ❌ Discussions | ❌ e2e Playwright Enhanced | ✅ Firebase Auth Service | ✅ TypeScript |

---

## 🏆 LEVEL 1 - Foundation Features

### 1️⃣ **Social 1: Private POIs (Points of Interest)**

**Requirement:** Users can create and manage private Points of Interest within museums and exhibitions.

**Status:** ❌ **NOT IMPLEMENTED**

**What's Missing:**
- POI data model and schema in MongoDB
- API endpoints for CRUD operations on POIs
- Web interface to create/edit/delete private POIs
- Authorization to ensure only the creator can view their POIs
- POI validation using Joi schemas

**Implementation Plan:**
- Add POI collection to MongoDB (tied to museums/exhibitions)
- Create POI API endpoints (`/api/poi`, `/api/poi/:id`)
- Build POI views in Handlebars
- Add POI controller in `src/controllers/`

---

### 2️⃣ **Social 2: Reviews**

**Requirement:** Users can write reviews for museums and exhibitions.

**Status:** ❌ **NOT IMPLEMENTED**

**What's Missing:**
- Review schema and data model
- API endpoints for creating, reading, updating, deleting reviews
- Rating mechanism (star rating, text review)
- Review validation
- Web interface for reviewing
- Display reviews on museum/exhibition pages

**Implementation Plan:**
- Create Review model in MongoDB
- Implement review API endpoints
- Add review form to museum/exhibition detail pages
- Add review display/list functionality

---

### 3️⃣ **TDD: Unit Tests**

**Requirement:** Unit tests for core functionality with proper test structure.

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**What's Accomplished:**
- ✅ Mocha test framework installed (`package.tson`)
- ✅ Chai assertion library configured
- ✅ Test files exist:
  - `test/users-model-test.ts`
  - `test/museum-model-test.ts`
  - `test/exhibition-model-test.ts`
  - `test/minimal-test.ts`
  - `test/api/simple-api-test.ts`
  - `test/api/museum-api-test.ts`
  - `test/api/exhibition-api-test.ts`
  - `test/api/category-api-test.ts`
- ✅ Test script configured: `npm test`
- ✅ Fixtures file for test data (`test/fixtures.ts`)

**What's Missing:**
- Limited test coverage (need > 80% coverage)
- Missing tests for:
  - Authentication flows
  - Error handling scenarios
  - Edge cases
  - API validation
  - Authorization checks
- No coverage reporting tool configured (need to add `nyc` or similar)

**To Complete:**
- Expand test suite coverage
- Add `nyc` for coverage reports
- Run: `npm test` and verify results

---

### 4️⃣ **Authentication: Sanitisation of Input & Output**

**Requirement:** All user inputs and outputs must be sanitized to prevent XSS and injection attacks.

**Status:** ✅ **IMPLEMENTED**

**What's Accomplished:**
- ✅ **Joi validation** configured globally across all API routes
  - Located in: `src/models/joi-schemas.ts`
  - Used in all API controllers for request validation
  - Examples:
    - User schema with email validation
    - Museum schema with required fields
    - Exhibition schema validation
    - Category schema validation
- ✅ **Input Sanitization:**
  - All API requests validated via Joi schemas
  - Joi prevents malicious data from reaching the database
  - Handlebars templates (`.hbs`) automatically escape HTML by default
- ✅ **Output Encoding:**
  - Handlebars (`{{{ }}}` for raw, `{{ }}` for escaped) properly handles output
  - API responses return.tsON (no XSS risk)

**Example from `joi-schemas.ts`:**
```javascript
// Email validation with format checking
export const userSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
  // ... other fields
});
```

---

### 5️⃣ **DevOps: Tagged Releases**

**Requirement:** The application uses semantic versioning with git tags for releases.

**Status:** ❌ **NOT IMPLEMENTED**

**What's Missing:**
- No git tags created (`v1.0.0`, `v1.1.0`, etc.)
- No release process documented
- No CHANGELOG with version history
- No deployment pipeline triggering on tags

**To Complete:**
- Create git tags: `git tag -a v1.0.0 -m "Initial release"`
- Update `package.tson` version field
- Create detailed CHANGELOG.md entries per release
- Configure GitHub Actions to deploy on tag pushes
- Document release procedure

---

## 🥈 LEVEL 2 - Enhanced Features

### 1️⃣ **Social 1: Public POIs**

**Requirement:** POIs can be marked as public and visible to all users.

**Status:** ❌ **NOT IMPLEMENTED** (depends on Level 1 POIs)

**What's Missing:**
- POI visibility/privacy flag in data model
- API filtering for public POIs
- Public POI discovery/browsing interface
- Permission checks on POI endpoints

**Implementation Note:**
- Can only be implemented after Level 1 POIs are complete
- Add `isPublic` boolean field to POI schema
- Filter POIs based on visibility in API queries

---

### 2️⃣ **Social 2: Share**

**Requirement:** Users can share museums, exhibitions, or reviews with others (via links, emails, or social media).

**Status:** ❌ **NOT IMPLEMENTED** (depends on Level 1 Reviews)

**What's Missing:**
- Share functionality/endpoints
- Shareable URLs with parameters
- Social media integration
- Email sharing capability
- Share tracking/analytics

---

### 3️⃣ **TDD: Unit Tests + Coverage Reports**

**Requirement:** Unit tests with code coverage reporting (80%+ coverage target).

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**What's Accomplished:**
- ✅ Mocha and Chai installed
- ✅ Test files structure in place
- ✅ Basic tests written

**What's Missing:**
- ❌ No coverage tool configured (need `nyc`)
- ❌ No coverage reporting
- ❌ Coverage target not established
- ❌ Coverage badge/tracking

**To Complete:**
```bash
npm install --save-dev nyc
# Update package.tson test script to: "nyc ./node_modules/mocha/bin/_mocha --ui tdd test/**/*.ts"
npm test
```

---

### 4️⃣ **Authentication: Hashing & Salting Passwords**

**Requirement:** User passwords are securely hashed and salted before storage.

**Status:** ✅ **IMPLEMENTED**

**What's Accomplished:**
- ✅ **Bcrypt configuration** in place
- ✅ **Password hashing** implemented:
  - Location: `src/api/user-api.ts` and `src/models/mongo/user-mongo-store.ts`
  - Uses bcryp.ts for secure hashing
  - Salt rounds configured (typically 10)
- ✅ **Password verification** during login
- ✅ **MongoDB storage** of hashed passwords only
- ✅ **JWT tokens** for API authentication (in `src/api/jwt-utils.ts`)

**Password Flow:**
1. User registers → Password hashed with bcrypt
2. User logs in → Password compared with stored hash
3. JWT token generated for API access

---

### 5️⃣ **DevOps: Git Flow**

**Requirement:** Development follows Git Flow branching strategy with proper branch naming conventions.

**Status:** ❌ **NOT IMPLEMENTED**

**What's Missing:**
- No documented Git Flow strategy
- Main branch used for everything (should only be for releases)
- No develop branch
- No feature branch naming convention
- No pull request process documented

**To Implement Git Flow:**
- Create `develop` branch: `git checkout -b develop`
- Feature branches: `git checkout -b feature/feature-name`
- Bugfix branches: `git checkout -b bugfix/bugfix-name`
- Document process in CONTRIBUTING.md

---

## 🥉 LEVEL 3 - Advanced Features

### 1️⃣ **Social 1: Rating**

**Requirement:** Users can rate museums and exhibitions on a scale (e.g., 1-5 stars).

**Status:** ❌ **NOT IMPLEMENTED** (depends on Level 1 Reviews)

**What's Missing:**
- Rating data model
- Rating API endpoints
- Star rating UI component
- Rating aggregation (average rating display)
- Rating validation (1-5 range)

---

### 2️⃣ **Social 2: Noticeboard**

**Requirement:** A public noticeboard or discussion forum for museums to post announcements or updates.

**Status:** ❌ **NOT IMPLEMENTED**

**What's Missing:**
- Noticeboard post schema
- API endpoints for posts
- Web interface for posting/viewing
- Comment threading on posts
- Moderation features

---

### 3️⃣ **TDD: e2e Playwright - Basic**

**Requirement:** End-to-end tests using Playwright covering basic user flows.

**Status:** ❌ **NOT IMPLEMENTED**

**What's Missing:**
- Playwright not installed (`npm install --save-dev @playwright/test`)
- No e2e test files
- No test scenarios written
- No CI pipeline for e2e tests

**Basic Scenarios to Test:**
- User registration flow
- User login flow
- Creating a museum
- Creating an exhibition
- Adding a category

**To Implement:**
```bash
npm install --save-dev @playwright/test
# Create: test/e2e/basic.spec.ts
```

---

### 4️⃣ **Authentication: OAuth (GitHub, Google, etc.)**

**Requirement:** Users can authenticate using third-party OAuth providers.

**Status:** ✅ **IMPLEMENTED (Firebase)**

**What's Accomplished:**
- ✅ **Firebase Authentication** configured:
  - Located in: `src/models/firebase/firebase-init.ts`
  - Firebase Admin SDK initialized
  - Service account credentials configured
  - Support for multiple auth methods
- ✅ **Firebase Auth Methods Available:**
  - Email/Password (implemented)
  - Google OAuth (configured)
  - GitHub OAuth (can be configured)
  - Facebook OAuth (can be configured)
- ✅ **Firestore** integration for data storage
- ✅ **JWT tokens** for API access after OAuth login

**Current Setup:**
- Firebase credentials from local.tsON or environment variables
- Production-ready with Render/AWS deployment
- Cookie-based sessions for web, JWT for API

**Potential Improvements:**
- Add explicit OAuth provider UI buttons
- Document OAuth setup for GitHub/Google
- Add logout/account linking features

---

### 5️⃣ **DevOps: Render & AWS Deployment**

**Requirement:** Application is deployed to production on Render and/or AWS.

**Status:** ✅ **IMPLEMENTED**

**What's Accomplished:**
- ✅ **Render Deployment:**
  - Live at: `https://museum-app-2-bo7c.onrender.com`
  - `render.yaml` configured
  - Automatic deployments on git push
  - Environment variables configured
- ✅ **AWS Amplify Deployment:**
  - Deployed at: `https://main.d2v2439p2a2dzc.amplifyapp.com/`
  - `postbuild` script in package.tson
  - `.amplify-hosting/` configuration
- ✅ **MongoDB Atlas** for cloud database
- ✅ **GitHub integration** for auto-deployment
- ✅ **Environment variable management** for production

**Deployment URLs:**
- Render: https://museum-app-2-bo7c.onrender.com
- AWS Amplify: https://main.d2v2439p2a2dzc.amplifyapp.com/
- API Docs: `/documentation` endpoint

---

## 🏅 LEVEL 4 - Expert Features

### 1️⃣ **Social 1: Favourites**

**Requirement:** Users can mark museums, exhibitions, or reviews as favorites for quick access.

**Status:** ❌ **NOT IMPLEMENTED**

**What's Missing:**
- Favorites data model (many-to-many relationship)
- API endpoints for add/remove favorites
- Favorites list view
- Favorite count display
- Favorite button on UI

---

### 2️⃣ **Social 2: Discussions**

**Requirement:** Threaded discussions/comments on museums, exhibitions, or reviews.

**Status:** ❌ **NOT IMPLEMENTED**

**What's Missing:**
- Comment/reply schema
- Nested comment threading
- Comment API endpoints
- Comment display UI
- Moderation/spam prevention

---

### 3️⃣ **TDD: e2e Playwright - Enhanced**

**Requirement:** Comprehensive end-to-end tests with advanced Playwright features.

**Status:** ❌ **NOT IMPLEMENTED** (depends on Level 3 basic e2e)

**What's Missing:**
- Advanced Playwright tests beyond basic flows
- Visual regression testing
- Performance testing
- Accessibility testing (axe-core integration)
- Multi-browser testing (Chrome, Firefox, Safari)
- CI/CD pipeline integration

**Enhanced Scenarios:**
- User authentication workflows
- Complex data operations
- API integration testing
- Error handling scenarios
- Performance benchmarks

---

### 4️⃣ **Authentication: 3rd Party Auth Service (Auth0, Firebase, etc.)**

**Requirement:** Use a dedicated authentication service provider.

**Status:** ✅ **IMPLEMENTED (Firebase)**

**What's Accomplished:**
- ✅ **Firebase Authentication Service:**
  - Full-featured auth service
  - Multiple provider support (Email, Google, GitHub, Facebook, etc.)
  - Session management
  - JWT token generation
  - Secure credential handling
- ✅ **Environment-based Configuration:**
  - Local:.tsON credentials
  - Production: Environment variables
  - Works on Render and AWS
- ✅ **Security Features:**
  - Password hashing
  - Session expiration
  - CORS handling
  - Token validation

**Firebase Setup Location:**
- `src/models/firebase/firebase-init.ts` - Initialization
- `src/models/firebase/firebase-utils.ts` - Utilities
- Environment variables in `.env` (local) or platform settings (production)

---

### 5️⃣ **DevOps: TypeScript**

**Requirement:** Application is written in TypeScript for type safety.

**Status:** ❌ **NOT IMPLEMENTED**

**Current State:**
- Application is pure JavaScript (ES modules)
- No TypeScript compiler configured
- No `.ts` files present
- `tsconfig.tson` not present

**What's Missing:**
- TypeScript setup and configuration
- Migration of all `.ts` files to `.ts`
- Type definitions for all functions and classes
- Type checking in build process
- ESLint TypeScript rules

**To Implement TypeScript:**
```bash
npm install --save-dev typescript @types/node @types/hapi
npx tsc --init
# Configure tsconfig.tson
# Migrate files: rename .ts to .ts and add type annotations
```

**Benefits:**
- Type safety catches errors at compile time
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring

---

## 📈 Overall Progress Summary

### Completed Features (8/20)
- ✅ Level 1: Input/Output Sanitisation (Authentication)
- ✅ Level 2: Password Hashing & Salting (Authentication)
- ✅ Level 2: Unit Tests - Basic (TDD)
- ✅ Level 3: OAuth - Firebase (Authentication)
- ✅ Level 3: Render & AWS Deployment (DevOps)
- ✅ Level 4: 3rd Party Auth Service - Firebase (Authentication)
- ✅ Partial: Unit Tests (test files present, coverage missing)

### In Progress or Partial (1/20)
- ⚠️ Level 1: Unit Tests (basic structure, needs expansion)

### Not Started (11/20)
- ❌ Level 1: Private POIs (Social 1)
- ❌ Level 1: Reviews (Social 2)
- ❌ Level 1: Tagged Releases (DevOps)
- ❌ Level 2: Public POIs (Social 1)
- ❌ Level 2: Share (Social 2)
- ❌ Level 2: Git Flow (DevOps)
- ❌ Level 3: Ratings (Social 1)
- ❌ Level 3: Noticeboard (Social 2)
- ❌ Level 3: e2e Playwright Basic (TDD)
- ❌ Level 4: Favourites (Social 1)
- ❌ Level 4: Discussions (Social 2)
- ❌ Level 4: e2e Playwright Enhanced (TDD)
- ❌ Level 4: TypeScript (DevOps)

### Completion Rate: **7/20 features (35%)**

---

## 🎯 Recommended Implementation Priority

### Phase 1: Foundation (Weeks 1-2)
1. Implement Level 1 Unit Tests + Coverage Reports
2. Add Tagged Releases & versioning
3. Implement Private POIs feature

### Phase 2: Social Features (Weeks 3-4)
1. Implement Reviews
2. Implement Ratings
3. Add Git Flow process

### Phase 3: Testing & Quality (Weeks 5-6)
1. Implement Playwright e2e Basic tests
2. Add more comprehensive unit tests
3. Implement e2e Enhanced tests

### Phase 4: Advanced Features (Weeks 7-8)
1. Implement Public POIs
2. Implement Sharing
3. Add Favourites and Discussions

### Phase 5: Final Polish (Weeks 9-10)
1. Migrate to TypeScript
2. Add Noticeboard
3. Performance optimization

---

## 📚 Technology Stack Reference

| Technology | Purpose | Status |
|-----------|---------|--------|
| Hapi.ts | Web framework | ✅ Active |
| MongoDB | Main database | ✅ Active |
| Mongoose | MongoDB ODM | ✅ Active |
| Firebase | Auth service | ✅ Active |
| JWT | API authentication | ✅ Configured |
| Joi | Input validation | ✅ Configured |
| Mocha | Test framework | ✅ Installed |
| Chai | Assertions | ✅ Installed |
| Playwright | e2e testing | ❌ Not installed |
| TypeScript | Type safety | ❌ Not installed |
| NYC | Coverage reporting | ❌ Not installed |

---

## 🔧 Quick Setup Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run linting
npm lint

# Production build
npm run build

# Start production
npm start
```

---

## 📞 Resources

- **GitHub:** https://github.com/MarciaSatie/museum_app.git
- **Render Deployment:** https://museum-app-2-bo7c.onrender.com
- **AWS Deployment:** https://main.d2v2439p2a2dzc.amplifyapp.com/
- **API Docs:** `/documentation` (Swagger)

---

**Last Updated:** May 3, 2026  
**Assignment Basis:** PlacemarkHAPI Requirements Framework

