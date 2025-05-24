**FoodApp Test-Driven Development Strategy & Tech Architecture**

This single source of truth merges every requirement—from user stories to tech stack to testing conventions—so all team members stay aligned. All tooling versions are pinned to eliminate environment drift.

---

## 0. Project Setup (Initial)

- **Start by creating a new Next.js app:**
  ```sh
  npx create-next-app@latest foodapp --typescript --tailwind --eslint
  cd foodapp
  ```
- **Immediately install shadcn/ui:**
  ```sh
  npx shadcn@latest init
  ```
- This ensures all shadcn/ui CLI commands and component additions work smoothly from the start. Follow the [manual installation guide](https://ui.shadcn.com/docs/installation/manual) for any additional steps (dependencies, config, etc).

---

## 1. User Stories

1. **As a health-conscious user**, I want to track my daily macro- and micro-nutrient intake so I can meet my dietary goals.
2. **As a meal planner**, I want reusable meal models and a science-based planning engine that avoids ultra-processed foods and respects seasonality.
3. **As a home cook**, I want to manage my fridge inventory offline so I always know what I have.
4. **As a shopper**, I want to generate and export a categorized shopping list in CSV/JSON for easy grocery trips.
5. **As the app owner**, I want to store and retrieve profile preferences (dietary goals, allergy settings, notification intervals) securely in Supabase without requiring end-user authentication.
6. **As a user**, I want notification preferences and scheduled reminders for meal prep or shopping.
7. **As a mobile user**, I want PWA support with offline-first caching and sync-on-reconnect.
8. **As a tech-savvy user**, I want an OpenAI-powered meal planning assistant that returns structured meal suggestions based on my profile.
9. **As a developer**, I want to fetch detailed nutrition data from USDA's FoodData API to enrich meal information.
10. **As an end-user**, I want a consistent, mobile-first UI built with shadcn/ui components and responsive navigation.
11. **As a curious user**, I want science transparency modals explaining the rationale behind my meal plans.
12. **As a feedback-oriented user**, I want to rate meals and see a confetti animation on submit.
13. **As a stakeholder**, I want analytics events and logging, plus environment validation for safe production.
14. **As a QA engineer**, I want a full end-to-end flow test (plan → shop → feedback) with performance smoke tests.

---

## 2. Design & UX Principles

- **Shadcn/UI-first**: Build all UI exclusively with shadcn/ui components for consistency, theming, and accessibility. To install shadcn for nextjs run npx shadcn@latest init
- **Mobile-First & Responsive**: Start at 320px; scale up with Tailwind's responsive utilities.
- **Card-Based UI**: Use elevated `<Card>` components for meals, nutrition summaries, shopping items.
- **Spacing & Typography**: Consistent paddings (`p-4`, `m-4`), typographic scale (`text-base` → `text-xl`).
- **Modern Aesthetic**: 2xl rounded corners, soft shadows, subtle color palette in `tailwind.config.js`.
- **Intuitive Navigation**: Bottom or top nav with lucide-react icons; active-state highlighting.
- **Accessibility**: WCAG AA contrast, semantic HTML, focus outlines, ARIA roles.
- **Dark Mode**: Honor system preference via Tailwind's `dark:` variants.
- **Quick Feedback**: Toasts (`<Toast>` from shadcn/ui) and confetti for positive reinforcement.
- **Design Tokens**: Centralized color, spacing, and shadow tokens for easy theming.

---

## 3. Architecture & Data Flow

- **App Router**: Next.js 13.4+ App Directory (`src/app`). Define `layout.tsx` for global UI and `page.tsx` for each route.
- **Server vs. Client Components**:
  - Default components are Server Components (run on server, can fetch data directly).
  - Add `'use client'` at the top for Client Components (interactive UI, state/hooks).
- **Data Fetching**:
  - **Server Components**: Use native `fetch`, Supabase JS in server mode, or Prisma calls.
  - **Mutations**: Prefer Next.js **Server Actions** for form submits; if not possible, use `/src/app/api/.../route.ts` API route handlers.
- **Database/API**:
  - Single-user context; no end-user auth.
  - Initialize Supabase client with service role key (`SUPABASE_SERVICE_ROLE_KEY`) in Server Components or Server Actions only.
  - Never expose Supabase keys to client-side code.
- **State Management Boundaries**:
  - **Server Components** handle data fetching & business logic.
  - **Client Components** manage local UI state (modals, toggles, form inputs).
  - **Data Caching**: Use SWR (v2.2.5) or React Query (v5.2.0) in Client Components for remote data & mutations.
  - **Global State**: Avoid global stores; if necessary, use Context or Zustand (v4.5.1) only for cross-component UI state.
- **Runtime**:
  - Default Node.js runtime for API routes; consider Edge runtime (Vercel) for low-latency critical endpoints.

---

### 3a. System Architecture Overview

| Layer                | Technology & Notes                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend**         | Next.js App Router (`src/app`), React 18.2.0, shadcn/ui, Tailwind CSS; mobile-first, PWA shell              |
| **Backend**          | Next.js Server Actions & API Routes (`route.ts`), Supabase service role client; server-only secrets         |
| **Nutrition Data**   | USDA FoodData API + local cache, server-side calls with caching/fallback to ensure accuracy                 |
| **AI/Intelligence**  | OpenAI API for meal planning; vector embeddings in Supabase; JSON-based rules engine for dietary principles |
| **Core Data Models** | Supabase/PostgreSQL schemas: UserPreferences, Meal, MealPlan, Ingredient, Feedback, DietaryPrinciple        |
| **Caching & Perf.**  | Next.js ISR (`revalidate`), SWR/React Query cache, Service Worker offline, Vercel Edge caching              |

---

### 3b. Tech Stack & Version Matrix

| Layer                | Tech & Library            | Version |
| -------------------- | ------------------------- | ------- |
| **Runtime**          | Node.js                   | 20.3.1  |
|                      | npm                       | 10.3.1  |
| **Language**         | TypeScript                | 5.3.3   |
| **Framework**        | Next.js                   | 14.2.29 |
| **UI Library**       | React                     | 18.2.0  |
| **Styling**          | Tailwind CSS              | 3.4.1   |
| **Component Kit**    | shadcn/ui                 | 0.2.1   |
| **State Management** | Zustand                   | 4.5.1   |
| **Data Fetching**    | SWR                       | 2.2.5   |
|                      | React Query               | 5.2.0   |
| **Auth & DB Client** | Supabase JS               | 2.39.7  |
| **Testing: Unit**    | Jest                      | 29.7.0  |
|                      | @testing-library/react    | 14.2.1  |
|                      | @testing-library/jest-dom | 6.4.2   |
| **Testing: Mocking** | MSW                       | 2.2.2   |
| **Testing: E2E**     | Playwright                | 1.42.1  |
| **Linting**          | ESLint                    | 8.57.0  |
|                      | Prettier                  | 3.2.5   |

---

### 3c. Security Considerations

| Category                | Measure                | Implementation                                         |
| ----------------------- | ---------------------- | ------------------------------------------------------ |
| **Dependency Security** | Regular audits         | `npm audit` in CI pipeline, automatic security updates |
| **API Security**        | Request validation     | Zod schema validation, MSW mocks for testing           |
| **Auth Security**       | Service role isolation | Supabase service role key only in Server Components    |
| **Data Validation**     | Runtime type checking  | TypeScript strict mode, Zod for runtime validation     |
| **Code Quality**        | Static analysis        | ESLint strict type checking, SonarQube integration     |
| **Testing Coverage**    | Security-focused tests | API mocking, error handling, edge cases                |

---

### 3d. Schema Migration & Mock Data Workflow (Manual via Supabase SQL UI)

**Schema Reference & Workflow Update (2024-06):**

- The master schema will be maintained under `prisma/schema.prisma` as a reference for all tables, relations, and types.
- **However, all actual schema changes and migrations will be performed manually in the Supabase UI** (SQL Editor), following the workflow below.
- The Prisma schema is the canonical reference for structure and documentation, but is not used for automated migrations or client generation.
- Manual SQL files in `migrations/` and mock data in `mockdata/` should match the reference schema.
- **Do not use `prisma db push` or `prisma migrate`—all migrations are manual via SQL.**

This section outlines the process for making, verifying, and documenting schema changes using Supabase's SQL UI, along with optional mock data setup for development and testing.

**1. Write and Version Your Migration**

- Create a new `.sql` file in the `migrations/` folder.
- Use a descriptive filename with a timestamp, e.g.:

  ```
  migrations/2025-05-23-add-meal-tags.sql
  ```

- Include `-- up` and `-- down` comments if reversibility is desired.
- Example:

  ```sql
  -- up
  CREATE TABLE meal_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
  );

  ALTER TABLE meal ADD COLUMN tag_ids UUID[];

  -- down
  ALTER TABLE meal DROP COLUMN tag_ids;
  DROP TABLE IF EXISTS meal_tags;
  ```

**2. (Optional) Add Mock Data for Testing**

- Add a corresponding `.sql` file in a `mockdata/` folder:

  ```
  mockdata/meal_tags.testdata.sql
  ```

- Populate minimal sample rows for local development or E2E test runs.
- Example:

  ```sql
  INSERT INTO meal_tags (name) VALUES ('High Protein'), ('Low Carb'), ('Vegan');
  ```

**3. Manual Application via Supabase SQL UI**

1. Open Supabase Dashboard → SQL Editor.
2. Paste and run the contents of your migration SQL file.
3. Optionally, run your mock data insert file.
4. **Pause development here and verify manually:**
   - Query tables and columns.
   - Use Supabase Table Editor to inspect schema changes.
   - Test your local app build against the updated schema.

**4. Commit and Document the Change**

- Commit both SQL files to version control:

  ```sh
  git add migrations/2025-05-23-add-meal-tags.sql mockdata/meal_tags.testdata.sql
  git commit -m "SPRINT-4:db(meals): add meal_tags table and mock data"
  ```

- Update the Decision Log (§8):
  - Date
  - Title of schema change
  - Rationale and consequences
- Update relevant sections:
  - §3a Core Data Models — reflect any new or modified tables
  - §6 Sprint Plan — note if the migration was part of a sprint deliverable

---

## 4. Project Structure & Route Map

```plaintext
foodapp/
├── public/                       # Static assets & images
├── prisma/                       # ORM schema + migrations
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Global layout (navigation, footer)
│   │   ├── page.tsx              # Landing page
│   │   ├── meals/                # Meals CRUD
│   │   │   ├── page.tsx
│   │   │   ├── new/              # Create meal
│   │   │   └── [id]/             # View/edit meal
│   │   ├── plan/                 # Weekly planning
│   │   │   ├── page.tsx
│   │   │   ├── new/              # Create plan entry
│   │   │   └── [id]/             # Edit plan entry
│   │   ├── fridge/               # Fridge inventory
│   │   │   ├── page.tsx
│   │   │   └── [id]/             # Edit ingredient
│   │   ├── health/               # Science principles
│   │   │   ├── page.tsx
│   │   │   └── new/              # Add principle
│   │   ├── shopping/             # Shopping list views
│   │   │   ├── page.tsx
│   │   │   └── [id]/             # View/export list
│   │   └── api/                  # API Routes
│   ├── components/               # Shared React components
│   ├── lib/                      # Business logic, data access
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   ├── styles/                   # Global & theme styles
│   └── __tests__/                # Jest & Playwright tests
├── package.json
├── tailwind.config.js
└── next.config.js



⸻

4a. Sprint-Route Mapping

Sprint	Routes & Components	Features Delivered
1	/meals, /plan, /fridge, /health, /shopping routes; components/layout/Navigation.tsx; mobile footer nav	Scaffold pages for Meals, Plan, Fridge, Health, Shop; mobile footer nav with main buttons (Meals, Plan, Fridge, Health) and a Shop link from Plan.
2	/fridge/new, /fridge/[id]; lib/fridge business logic	Fridge ingredient CRUD: add, view, update, delete ingredients.
3	/meals/new, /meals/[id]; components/MealCard; lib/meal logic	Meal CRUD: create meals composed of ingredients, view/edit/delete meals with nutrition data.
4	/plan/new, /plan/[id]; components/PlanCalendar; lib/plan logic	Weekly meal planning CRUD: plan meals for each day, modify plans, remove entries.
5	/health; components/HealthPrincipleToggle; lib/health logic	Health tab: toggle science principles on/off and add new principles.
6	/plan enhancements; /fridge integration; components/ShoppingList	Generate required-ingredients list from week's meal plan, flag items already in the fridge vs. missing.
7	/meals; components/MealRating; lib/rating logic	Meal rating feature: like/dislike meals, persist & display ratings.
8	/plan; components/AIAssistant; lib/aiPlanner	AI assistant on Plan page: recommend new meals based on fridge contents, user preferences, and science principles.


⸻

5. TDD Workflow & Conventions
	•	Test-First: Write failing tests before implementing features.
	•	Green→Refactor: Get tests passing, then clean up code.
	•	Scopes: Unit, integration, component, and E2E tests for every feature.
	•	Tools: Jest + Testing Library + MSW for unit/integration; Playwright for E2E.
	•	Conventions:
	•	Naming: describe("Feature X", ...); it("does Y", ...).
	•	Mocks: Jest module mocks; MSW for HTTP in unit/integration tests.
	•	Component Tests: React Testing Library—render, screen, userEvent.
	•	E2E: Playwright against a live app + real Supabase backend; mobile & desktop viewports.
	•	CI: Run full suite on every PR; block merges on failures or <90% coverage.

⸻

6. Sprint Plan (All Backlog & Tech Requirements)

Sprint	Feature / Requirement	Test Focus	Demo Criteria	Status
1	Basic scaffolding with pages for Meals, Plan, Fridge, Health, Shop; mobile footer navigation and page layouts	Unit & integration tests for routing, rendering, navigation	All scaffold pages render; footer nav shows correct icons/buttons; "Shop" link from Plan opens the Shop page	Completed
2	Fridge ingredient management (CRUD)	Unit & integration tests for create/read/update/delete operations	User can add, view, edit, and delete ingredients on the Fridge page	Completed
3	Meal management (CRUD) for meals composed of ingredients	Unit & integration tests for meal CRUD and nutrition calculation	User can create, view, edit, delete meals; nutrition summary updates accordingly	Completed
4	Weekly meal planning (CRUD)	Unit & integration tests for planning CRUD and calendar interactions	User can plan meals for each day, modify entries, and remove plans	Planned
5	Health tab: toggle on/off science principles and add new principles	Unit & integration tests for toggle functionality and principle CRUD	Health tab lists principles with working toggles; users can add and enable/disable principles	Planned
6	Required ingredients list from week's meal plan with fridge integration	Unit & integration tests for aggregation logic and UI status flags	Missing vs. in-stock ingredients list correctly generated based on current fridge inventory	Planned
7	Meal rating feature (like/dislike)	Unit & integration tests for rating persistence and UI updates	Users can rate meals; ratings are stored and displayed on the Meals page	Planned
8	AI assistant on Plan page: recommend new meals based on fridge, preferences, and science principles	Integration tests for AI endpoint and interactive UI suggestions	AI suggestions appear on Plan page and update dynamically when fridge contents or preferences change	Planned


⸻

7. Implementation Progress

- **Sprint 1** (2024-06-10):
  - Scaffolded all main pages: Meals, Plan, Fridge, Health, Shopping
  - Implemented mobile-first, responsive layout with footer navigation
  - Set up Next.js, TypeScript, Tailwind CSS, ESLint, and Prettier
  - All scaffold pages render and navigation works as expected

- **Sprint 2** (2024-06-15):
  - Implemented complete fridge ingredient management with Supabase integration
  - Created API routes for CRUD operations on fridge items and ingredients
  - Added UI for viewing, adding, editing, and deleting fridge items
  - Implemented functionality to add new ingredients on-the-fly
  - Set up unit tests with MSW for API mocking and E2E tests with Playwright
  - Added SQL schema definition for Supabase tables

- **Sprint 3** (2024-06-20):
  - Implemented meal management with full CRUD operations
  - Created business logic for nutrition calculation
  - Built API routes for managing meals and their ingredients
  - Designed UI components for displaying meal information (MealCard)
  - Implemented form for creating and editing meals with ingredient selection
  - Added integration with ingredients from Sprint 2
  - Set up unit tests for meal business logic and API services

---

## 8. Decision Log

- Sprint 1: No major decisions for Sprint 1.

- Sprint 2 (2024-06-15):
  - Decided to use Supabase as the backend database with snake_case naming conventions for tables
  - Established pattern for API routes with proper error handling and status codes
  - Implemented client-side services with TypeScript interfaces for type safety
  - Used MSW for API mocking in tests to allow for unit testing without database dependencies
  - Adopted a component-based architecture for the UI with clear separation between data fetching and presentation

- Sprint 3 (2024-06-20):
  - Implemented a nutrition calculation approach using 100g as the base unit for scaling ingredient nutritional values
  - Developed a pattern for managing complex forms with nested data (meals with ingredients)
  - Adopted a strategy for temporary IDs in client-side forms for better UI state management
  - Created reusable components for displaying nutritional information and meal details
  - Established conventions for ingredient quantity handling and unit selection

---

## 9. Pull Request & Commit & Release Checklist

Use this checklist on every sprint-completion PR to ensure quality, consistency, and alignment with our tech principles.

9.1 Commit Message Conventions

All commits should use Conventional Commits style with our added SPRINT-{n} prefix:

SPRINT-{n}:<type>(<scope>): <short description>

<body — optional detailed explanation, motivation, and any breaking changes>

	•	SPRINT-{n}: sprint number (e.g. SPRINT-3)
	•	<type>:
	•	feat — new feature
	•	fix — bug fix
	•	docs — documentation only
	•	style — formatting, missing semi-colons
	•	refactor — code change that neither fixes a bug nor adds a feature
	•	perf — code change that improves performance
	•	test — adding missing tests or correcting existing tests
	•	chore — build process or auxiliary tool changes
	•	ci — CI configuration
	•	<scope>: the area of the codebase (e.g. meals, fridge, plan-calendar, health-toggle, ai-assistant)

Examples:
	•	SPRINT-1:feat(meals): scaffold Meals page and navigation
	•	SPRINT-2:test(fridge): add CRUD unit & integration tests
	•	SPRINT-6:refactor(plan): optimize ingredient-aggregation logic

⸻

9.2 Pull Request Checklist

Before marking a sprint complete, confirm each item below:
	•	Title & Description
	•	    PR title follows our commit convention (see §9.1).
	•	    PR description clearly states "Completes Sprint {n}" and references relevant issue(s)/ticket(s).
	•	Code & Architecture
	•	    Code adheres to Design & UX Principles (§2).
	•	    Follows Architecture & Data Flow boundaries (§3).
	•	    Respects System Architecture decisions (§3a) and Tech Stack versions (§3b).
	•	No secret keys exposed in client code; server–client separation correct.
	•	    Accessibility checks passed (semantic HTML, ARIA roles, contrast).
	•	Testing
	•	    Unit tests for all new logic/components (≥ 90% coverage).
	•	    Integration tests for data flows (MSW, server actions).
	•	        Component tests (React Testing Library: render, userEvent).
	•	    E2E tests (Playwright) covering the new sprint's happy & edge cases.
	•	    All tests pass in CI; coverage report updated.
	•	Linting & Formatting
	•	    ESLint and Prettier configured rules pass (no warnings/errors).
	•	    TypeScript strict mode satisfied (no any, no unused vars).
	•	    Documentation & Progress Updates
	•	    Update Implementation Progress (§7): add an entry under Sprint {n} with summary of what was delivered and date.
	•	Update Decision Log (§8): record any architecture/testing decisions made during this sprint.
	•	If any architecture or tech-stack change occurred, reflect it in System Architecture (§3a) or Tech Stack (§3b).
	•	Update any relevant sections in this MD (e.g. new routes in §4, new tests in §5).


Once all above are checked, squash-merge with the PR title as the final commit message and tag the release if applicable.

---

```
