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

## 2a. FoodApp Design System 

This design system outlines the FoodApp design system components, tokens, and usage guidelines - follow this whenever implementing UI or creating new components!!!

## Component Library Structure

The component library is organized in a tiered approach:

1. **UI Components (`/components/ui`)**: Basic, unstyled primitives like buttons, inputs, and form elements from shadcn/ui.

2. **Common Components (`/components/common`)**: Reusable components with application-specific styling like Card, FormField, and PageLayout.

3. **Feature Components (`/components/features/[feature]`)**: Domain-specific components for each feature area (meals, fridge, plan, etc.).

## Design Tokens (`/styles/tokens.ts`)

The design system is built on a set of tokens that define:

- Colors (primary, neutral, semantic)
- Spacing scale
- Typography (font sizes, weights, line heights)
- Border radius
- Shadows
- Animation durations
- Z-index scale

These tokens are imported into the Tailwind config to ensure consistency throughout the application.

## Common Components Usage

### Card

```tsx
import { Card } from '@/components/common/Card'

// Default card
<Card>Content</Card>

// Highlight card
<Card variant="highlight">Highlighted content</Card>

// Outlined card
<Card variant="outlined">Outlined content</Card>

// Compact card
<Card variant="compact">Compact content</Card>

// Clickable card
<Card onClick={() => console.log('clicked')}>Clickable content</Card>
```

### FormField

```tsx
import { FormField } from '@/components/common/FormField'
import { Input } from '@/components/ui/input'

<FormField 
  id="name"
  label="Name"
  hint="Enter your full name"
  error={errors.name}
>
  <Input id="name" name="name" value={name} onChange={handleChange} />
</FormField>
```

### PageLayout

```tsx
import { PageLayout } from '@/components/common/PageLayout'
import { Button } from '@/components/ui/button'

<PageLayout
  title="Meals"
  subtitle="Manage your meals"
  actions={<Button>Add Meal</Button>}
>
  <div>Page content goes here</div>
</PageLayout>
```

## Enhanced Button

The Button component has been enhanced with additional variants and features:

```tsx
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

// Standard button
<Button>Click me</Button>

// Success button
<Button variant="success">Success</Button>

// Warning button
<Button variant="warning">Warning</Button>

// Soft button (lighter background)
<Button variant="soft">Soft</Button>

// With icon
<Button leftIcon={<PlusIcon className="w-4 h-4" />}>Add Item</Button>

// Loading state
<Button loading>Processing</Button>

// Full width
<Button fullWidth>Full width button</Button>
```

## Feature Components

Each feature area has specialized components that follow the design system guidelines:

### Meals
- MealCard: For displaying meal information

### Fridge
- IngredientCard: For displaying ingredient information

### Future Components
As the application grows, additional feature components will be added following the same design patterns.

## Tailwind CSS Usage

When creating new components:

1. Use the token-based classes from our system
2. Use the `cn()` utility for conditional class merging
3. Follow the responsive patterns (mobile-first)
4. Ensure accessibility with proper semantic HTML and ARIA attributes

## Consistency Guidelines

- Use predefined spacing values (`p-4`, `m-6`, etc.)
- Follow the color system (primary, neutral, semantic colors)
- Use consistent border radius values (prefer rounded-2xl for cards)
- Maintain typography hierarchy (headings, body text, captions)

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

### 3e. CRUD Operation Standards

To maintain consistency in our codebase and prevent implementation drift, follow these guidelines for all CRUD operations:

#### 1. Route Parameter Handling (Next.js 15+)

```typescript
// Always use Promise-based params
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Always await params before accessing properties
  const { id } = await params;
  
  // Continue with database operations
}
```

#### 2. Database Table Naming Conventions

- Use singular form for all table names (e.g., `meal_ingredient` not `meal_ingredients`)
- Foreign key columns should end with `_id` (e.g., `meal_id`, `ingredient_id`)
- Join table names should combine the two entities in singular form (e.g., `meal_ingredient`)
- Primary keys should be named `id` and use UUIDs

#### 3. API Route Structure

- Basic resource routes: `/api/[resource]/route.ts`
- Single item routes: `/api/[resource]/[id]/route.ts`
- Nested resources: `/api/[resource]/[id]/[subresource]/[subid]/route.ts`
- Implement HTTP methods according to REST conventions:
  - `GET` (collection): List all resources
  - `GET` (item): Get single resource by ID
  - `POST`: Create new resource
  - `PUT`: Update existing resource (full or partial)
  - `DELETE`: Remove resource

#### 4. API Query Structure (Supabase)

```typescript
// Standard query pattern with relations
const { data, error } = await supabaseAdmin
  .from("table_name")
  .select(`
    *,
    related_table!foreign_key (
      *,
      nested_related_table:foreign_key (id, name)
    )
  `)
  .eq("id", id)
  .single();

// Standard error handling
if (error) {
  console.error(`Error fetching resource ${id}:`, error);
  return NextResponse.json(
    { error: "Failed to fetch resource" },
    { status: error.code === "PGRST116" ? 404 : 500 }
  );
}
```

#### 5. Client-Side Service Pattern

Define service objects in `api-services.ts` with consistent method naming:

```typescript
export const resourceService = {
  async getAll(): Promise<Resource[]> { /* ... */ },
  async get(id: string): Promise<Resource> { /* ... */ },
  async create(data: CreateResourceDto): Promise<Resource> { /* ... */ },
  async update(id: string, data: UpdateResourceDto): Promise<Resource> { /* ... */ },
  async delete(id: string): Promise<{ success: boolean }> { /* ... */ },
};
```

#### 6. Component Structure

- **Server Components (`page.tsx`):**
  - Fetch data directly using Supabase
  - Handle awaiting Promises (including params)
  - Pass data to client components via props
  - Use `notFound()` for 404 handling

```typescript
export default async function ResourcePage({ params }: ResourcePageProps) {
  const { id } = await params;
  // Fetch data and handle errors
  return <ResourceForm resource={data} isEditing={true} />;
}
```

- **Client Components:**
  - Add `"use client";` directive
  - Handle form state with react-hook-form + zod
  - Use service objects for API calls
  - Manage loading/error states

#### 7. Form Components for CRUD

```typescript
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Define zod schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // Additional fields
});

export function ResourceForm({ resource, isEditing }: ResourceFormProps) {
  // Initialize form with react-hook-form + zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: resource || {},
  });

  // Form submission logic
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // API calls via service object
  };

  // Form UI with shadcn/ui components
}
```

These standards ensure our CRUD implementations remain consistent, maintainable, and compatible with Next.js 15+ while following best practices for type safety and error handling.

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
4	Weekly meal planning (CRUD)	Unit & integration tests for planning CRUD and calendar interactions	User can plan meals for each day, modify entries, and remove plans	Completed
5	Health tab: toggle on/off science principles and add new principles	Unit & integration tests for toggle functionality and principle CRUD	Health tab lists principles with working toggles; users can add and enable/disable principles	Completed
6	Required ingredients list from week's meal plan in shop page like a shoppoing list with fridge integration	Unit & integration tests for aggregation logic and status flags	Missing vs. in-stock ingredients list correctly generated based on current fridge inventory	Completed
7	Meal rating feature (like/dislike)	Unit & integration tests for rating persistence and UI updates	Users can rate meals; ratings are stored and displayed on the Meals page	Completed
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

- **Sprint 4** (2024-06-25):
  - Implemented weekly meal planning with full CRUD operations
  - Added single-click delete functionality for plan entries without confirmation dialogs
  - Enhanced meal card UI with improved visual hierarchy and accessibility
  - Fixed date handling issues in PlanEntryForm to prevent "Invalid time value" errors
  - Implemented proper error handling for form submissions
  - Improved UI components to better align with design system guidelines
  - Added unit tests for delete functionality and date handling

- **Sprint 5** (2024-06-30):
  - Implemented health principles management with full CRUD operations
  - Created API routes for health principles
  - Built UI components for displaying and toggling health principles
  - Implemented form for adding new health principles
  - Added client-side state management for immediate UI updates
  - Ensured proper error handling and user feedback with toast notifications
  - Implemented unit tests for components and API endpoints
  - Added a dedicated route for creating new principles

- **Sprint 6** (2024-07-01):
  - Implemented shopping list feature that integrates meal plans with fridge inventory
  - Created API endpoint that fetches meal plans and ingredients, compares with fridge inventory
  - Added ShoppingItem interface and shopping service to the API services file
  - Built UI components for displaying shopping items with status indicators (need-to-buy, partial, in-stock)
  - Implemented filterable shopping list with tabs for different status categories
  - Created SQL migration script to set up the necessary tables and sample data
  - Fixed table naming mismatch between plan_entry and meal_plan
  - Added shadcn/ui Badge, Tabs, and Skeleton components for enhanced UI
  - Wrote unit tests for shopping components and API endpoints

- **Sprint 7** (2024-07-08):
  - Implemented meal rating feature with like/dislike functionality
  - Created SQL migration script to add meal_rating table
  - Added MealRating and MealRatingSummary interfaces to API services
  - Built API endpoints for submitting and retrieving meal ratings
  - Created MealRating component with compact and full variants
  - Implemented confetti animation for positive ratings
  - Updated MealCard to display rating information
  - Created ClientMealPage component for improved meal details view
  - Added unit tests for rating components and API endpoints
  - Implemented E2E tests for the rating workflow

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

- Sprint 4 (2024-06-25):
  - Decided to implement single-click delete functionality without confirmation dialogs for better user experience
  - Enhanced meal card UI with a footer-based action pattern for better visual hierarchy
  - Adopted a more robust date handling approach with validation to prevent runtime errors
  - Standardized error handling for form submissions with appropriate user feedback via toast notifications
  - Implemented a pattern for safely formatting and displaying dates with fallbacks for invalid values

- Sprint 5 (2024-06-30):
  - Adopted a toggle-based UI for enabling/disabling health principles without requiring form submission
  - Implemented a hover-reveal pattern for delete buttons to keep the UI clean while still providing easy access
  - Designed health principles as independent entities that can influence meal planning in future sprints
  - Used a card-based layout with consistent spacing and visual hierarchy
  - Created a dedicated route for adding new principles to provide a focused, distraction-free form experience
  - Implemented a centralized service pattern for all health principle operations to maintain consistency

- Sprint 6 (2024-07-01):
  - Implemented shopping list feature that integrates meal plans with fridge inventory
  - Created API endpoint that fetches meal plans and ingredients, compares with fridge inventory
  - Added ShoppingItem interface and shopping service to the API services file
  - Built UI components for displaying shopping items with status indicators (need-to-buy, partial, in-stock)
  - Implemented filterable shopping list with tabs for different status categories
  - Created SQL migration script to set up the necessary tables and sample data
  - Fixed table naming mismatch between plan_entry and meal_plan
  - Added shadcn/ui Badge, Tabs, and Skeleton components for enhanced UI
  - Wrote unit tests for shopping components and API endpoints

- Sprint 7 (2024-07-08):
  - Implemented meal rating feature with like/dislike functionality
  - Created SQL migration script to add meal_rating table
  - Added MealRating and MealRatingSummary interfaces to API services
  - Built API endpoints for submitting and retrieving meal ratings
  - Created MealRating component with compact and full variants
  - Implemented confetti animation for positive ratings
  - Updated MealCard to display rating information
  - Created ClientMealPage component for improved meal details view
  - Added unit tests for rating components and API endpoints
  - Implemented E2E tests for the rating workflow

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
