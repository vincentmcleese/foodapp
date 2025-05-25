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

## Shadcn/UI Component Gotchas

When using shadcn/ui components, be aware of these common issues:

1. **Command Component**: The Command component has its own internal filtering logic. When implementing custom search functionality with external state management, avoid using CommandEmpty and implement a custom rendering function instead to ensure search results display correctly.

2. **Custom Inputs**: Always maintain consistency with the existing design system when customizing shadcn components. Use the established loading spinner, input styles, and visual patterns.

3. **Form Controls**: Ensure all form elements maintain accessibility and consistent styling across the application.

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
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/ui/input";

<FormField
  id="name"
  label="Name"
  hint="Enter your full name"
  error={errors.name}
>
  <Input id="name" name="name" value={name} onChange={handleChange} />
</FormField>;
```

### PageLayout

```tsx
import { PageLayout } from "@/components/common/PageLayout";
import { Button } from "@/components/ui/button";

<PageLayout
  title="Meals"
  subtitle="Manage your meals"
  actions={<Button>Add Meal</Button>}
>
  <div>Page content goes here</div>
</PageLayout>;
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

## Spinner Component

The Spinner component provides a standardized loading indicator across the application:

```tsx
import { Spinner } from '@/components/ui/spinner'

// Default spinner (medium size)
<Spinner />

// Small spinner
<Spinner size="sm" />

// Large spinner
<Spinner size="lg" />

// Extra large spinner
<Spinner size="xl" />

// With custom classes
<Spinner className="text-primary" />
```

Size reference:

- `sm`: 16px × 16px (h-4 w-4)
- `md`: 24px × 24px (h-6 w-6)
- `lg`: 32px × 32px (h-8 w-8)
- `xl`: 48px × 48px (h-12 w-12)

Always use this shared Spinner component for all loading states rather than creating custom spinners to ensure visual consistency.

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
  .select(
    `
    *,
    related_table!foreign_key (
      *,
      nested_related_table:foreign_key (id, name)
    )
  `
  )
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
  async getAll(): Promise<Resource[]> {
    /* ... */
  },
  async get(id: string): Promise<Resource> {
    /* ... */
  },
  async create(data: CreateResourceDto): Promise<Resource> {
    /* ... */
  },
  async update(id: string, data: UpdateResourceDto): Promise<Resource> {
    /* ... */
  },
  async delete(id: string): Promise<{ success: boolean }> {
    /* ... */
  },
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

````plaintext
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
8	AI assistant on meals page: we would like a feature that recommends new meals based on fridge, preferences, and science principles. The feature should be a button that says "Discover" and it opens a new page to allow discover of new meals - show richcontent beautiful mealcards that contain recommendations from the LLM (smart prompt based on the criteria mentioned above). Include lots of data including ingredients, prep time, etc so we can filter. There should be a way to load more. If you "save" or "add" a recommendation it should be added to your meals in the /meals page.	Integration tests for AI endpoint and interactive UI suggestions

9 Fridge page UI improvement. As a user I would like the fridge page to feel more playful and gamified.

As a user, I want the Fridge page to feel more playful and visual, so that managing ingredients feels fun, intuitive, and engaging.

⸻

🎯 Acceptance Criteria
	•	When a user adds a new ingredient to their fridge, the UI performs a fuzzy search.
	•	If there's a close match in the system, it's selected automatically.
	•	If no match is found, the ingredient is added as a new entry.
	•	A loading indicator appears while a DALL·E-generated image is being created for the new ingredient.
	•	Once generated, the image is displayed at the top of the fridge list.
	•	All ingredient images are cached (stored on Supabase or equivalent) and reused for future renders.
	•	The fridge page displays ingredients using their cached image tiles in a visually appealing way.

For the image generation prompt we will use the follwoing text:
A photorealistic, high-resolution food photograph of a {INSERT INGREDIENT HERE}, elegantly plated on a round, off-white, lightly speckled ceramic plate. The plate sits centered on a warm, medium-tone wooden table with visible wood grain. The image is captured from a top-down (90-degree overhead) angle with soft, natural lighting from the top left. Use shallow depth of field, neutral shadows, and a clean white background outside the plate. The composition should follow consistent proportions: plate fills 80% of the frame, centered precisely. The overall style matches high-end editorial food photography.

⸻

🎨 UX Goals
	•	Make the Fridge page feel like a playful inventory system.
	•	Show ingredients as image tiles, possibly draggable or sortable.
	•	Ensure the image generation and loading experience is smooth, quick, and non-blocking.

⸻

🧠 Technical Notes
	•	Use DALL·E API (model: dall-e-3) to generate the image with a standardized food image prompt.
	•	Save the image to Supabase Storage (we need to set this up)
	•	Reference the image URL via the ingredient's database record (e.g. ingredient.image_url).
	•	Consider rate-limiting or batching image generations to avoid hitting API limits or slow UX.
	•	Follow Next.js best practices for image handling:
	•	Use next/image for optimized rendering.
	•	Set caching headers via CDN or Vercel configuration.
	•	Use low-quality image placeholders (LQIP) if needed.


Sprint 10 Stunning visuals for meals
When we discover or view meal cards we would like to see an image. We would like to see the images populate one by one on the discover page and we need to see the loading state until the image is loaded - 	•	Consider rate-limiting or batching image generations to avoid hitting API limits or slow UX.
. The process will work just as ingredients (see sprint 9)with the same prompt but the variable is the title of the meal. Save the image in supabase and keep it connected to a saved meal so we always see it in the meal card on /meal


sprint 11 we would like to make the fridge more intuitive.
first we will either tag ingredients as "pantry" or "ingredient" a basic is salt, pepper, herbs, oil, etc. these are not things we put on our shopping list but just expect to have in the pantry.
We want the fridge page to show things we actually HAVE so we want to see the ingredients and pantry items that we have. pantry items are either IN STOCK or NOT IN STOCK. ingredients have the current quantity and unit.
the top of the fridge has the search bar as we have now. we can search for an ingredient and then we are asked how much we add. then we add it to the inventory. we only show under the search bar our current ingredient and pantry inventory.

sprint 12 make the search bar the top component of the /fridge page. as a user you just type and search. suggestions show up with the image (small image and name of ingredient). If you finish typing and there's no suggestion the "Add" button adds the new ingredient. If its matched we just add based on the existing match. The add opens a modal with quantity to add if its an ingredient. If we dont know yet (new item) we need to select if its pantry or ingredient. If its a pantry item we just select that its now in stock.


sprint 13 make the cards on the plan page int he grid jsut show a thumbnail of the image of the meal if there is a meal planned in that slot. Give the image an overlay and put the name of the meal but not too big because its a very busy UI.


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

- **Sprint 8** (2024-07-15):
  - Implemented AI-powered meal recommendations using OpenAI's GPT-4o model with structured JSON responses
  - Designed a client-side rendering strategy for the Discover page to provide immediate loading feedback
  - Created a dedicated API endpoint for recommendations to separate concerns and simplify client code
  - Added database support for AI-generated meals with a new ai_generated flag
  - Implemented intelligent ingredient matching for AI recommendations to prevent duplicate ingredients
  - Used case-insensitive matching for ingredients to handle variations in naming
  - Adopted a skeleton UI pattern for loading states to improve perceived performance
  - Implemented paginated loading with "Load More" pattern to optimize initial page load time
  - Created fallback mechanism with mock data when OpenAI API is unavailable
  - Fixed JSON response formatting issues by adding explicit "json" word in prompt when using response_format parameter
  - Standardized database field mapping between JavaScript camelCase and PostgreSQL snake_case

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

- Sprint 8 (2024-07-15):
  - Implemented AI-powered meal recommendations using OpenAI's GPT-4o model with structured JSON responses
  - Designed a client-side rendering strategy for the Discover page to provide immediate loading feedback
  - Created a dedicated API endpoint for recommendations to separate concerns and simplify client code
  - Added database support for AI-generated meals with a new ai_generated flag
  - Implemented intelligent ingredient matching for AI recommendations to prevent duplicate ingredients
  - Used case-insensitive matching for ingredients to handle variations in naming
  - Adopted a skeleton UI pattern for loading states to improve perceived performance
  - Implemented paginated loading with "Load More" pattern to optimize initial page load time
  - Created fallback mechanism with mock data when OpenAI API is unavailable
  - Fixed JSON response formatting issues by adding explicit "json" word in prompt when using response_format parameter
  - Standardized database field mapping between JavaScript camelCase and PostgreSQL snake_case

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

## 5. TDD Workflow & Conventions

- **Test-First**: Write failing tests before implementing features.
- **Green→Refactor**: Get tests passing, then clean up code.
- **Scopes**: Unit, integration, component, and E2E tests for every feature.
- **Tools**: Jest + Testing Library + MSW for unit/integration; Playwright for E2E.
- **Conventions**:
  - Naming: describe("Feature X", ...); it("does Y", ...).
  - Mocks: Jest module mocks; MSW for HTTP in unit/integration tests.
  - Component Tests: React Testing Library—render, screen, userEvent.
  - E2E: Playwright against a live app + real Supabase backend; mobile & desktop viewports.
  - CI: Run full suite on every PR; block merges on failures or <90% coverage.

### 5.1 TDD Examples & Patterns

Below are concrete examples of our Test-Driven Development approach for different types of components and features. Following these patterns will ensure consistent test coverage and help catch regressions early.

#### 5.1.1 API Route Testing Pattern

Here's a complete TDD example for implementing a CRUD API endpoint:

**1. Write the test first (failing):**

```typescript
// src/app/api/ingredients/[id]/route.test.ts
import { NextRequest } from "next/server";
import { DELETE, GET, PUT } from "./route";
import { supabaseAdmin } from "@/lib/supabase";

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  },
}));

describe("Ingredient API Routes", () => {
  const mockParams = Promise.resolve({ id: "test-id" });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/ingredients/[id]", () => {
    it("returns 200 with ingredient data when successful", async () => {
      // Mock successful response
      const mockData = { id: "test-id", name: "Test Ingredient" };
      (supabaseAdmin.from().select().eq().single as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      // Call the handler
      const result = await GET(new NextRequest(new URL("http://localhost/api/ingredients/test-id")), {
        params: mockParams,
      });

      // Check expectations
      expect(result.status).toBe(200);
      expect(await result.json()).toEqual(mockData);
      expect(supabaseAdmin.from).toHaveBeenCalledWith("ingredient");
      expect(supabaseAdmin.select).toHaveBeenCalled();
      expect(supabaseAdmin.eq).toHaveBeenCalledWith("id", "test-id");
    });

    it("returns 404 when ingredient not found", async () => {
      // Mock not found response
      (supabaseAdmin.from().select().eq().single as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      });

      // Call the handler
      const result = await GET(new NextRequest(new URL("http://localhost/api/ingredients/test-id")), {
        params: mockParams,
      });

      // Check expectations
      expect(result.status).toBe(404);
      const body = await result.json();
      expect(body.error).toBeTruthy();
    });
  });

  // Similarly implement tests for PUT and DELETE...
});
````

**2. Implement the code to make tests pass:**

```typescript
// src/app/api/ingredients/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("ingredient")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching ingredient ${id}:`, error);
      return NextResponse.json(
        { error: "Failed to fetch ingredient" },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/ingredients/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**3. Refactor if needed:**

```typescript
// Extract shared error handling
const handleApiError = (
  error: any,
  defaultMessage: string,
  statusCode = 500
) => {
  console.error(`Error: ${defaultMessage}:`, error);
  return NextResponse.json(
    { error: defaultMessage },
    { status: error.code === "PGRST116" ? 404 : statusCode }
  );
};
```

#### 5.1.2 React Component Testing Pattern

**1. Write the test first (failing):**

```typescript
// src/components/features/fridge/IngredientCard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { IngredientCard } from "./IngredientCard";

describe("IngredientCard", () => {
  const mockIngredient = {
    id: "123",
    name: "Eggs",
    image_url: "/images/eggs.jpg",
  };

  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  it("renders ingredient name and image", () => {
    render(<IngredientCard ingredient={mockIngredient} {...mockHandlers} />);

    expect(screen.getByText("Eggs")).toBeInTheDocument();
    expect(screen.getByAltText("Image of Eggs")).toHaveAttribute(
      "src",
      expect.stringContaining("eggs.jpg")
    );
  });

  it("calls onEdit when edit button is clicked", () => {
    render(<IngredientCard ingredient={mockIngredient} {...mockHandlers} />);

    fireEvent.click(screen.getByLabelText("Edit ingredient"));
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockIngredient);
  });

  it("calls onDelete when delete button is clicked and confirmed", () => {
    render(<IngredientCard ingredient={mockIngredient} {...mockHandlers} />);

    fireEvent.click(screen.getByLabelText("Delete ingredient"));
    fireEvent.click(screen.getByText("Confirm"));

    expect(mockHandlers.onDelete).toHaveBeenCalledWith("123");
  });
});
```

**2. Implement the component to make tests pass:**

```tsx
// src/components/features/fridge/IngredientCard.tsx
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ingredient } from "@/lib/api-services";
import { IngredientImage } from "./IngredientImage";

interface IngredientCardProps {
  ingredient: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: string) => void;
}

export function IngredientCard({
  ingredient,
  onEdit,
  onDelete,
}: IngredientCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <Card className="p-4">
      <IngredientImage
        imageUrl={ingredient.image_url}
        name={ingredient.name}
        className="mb-2"
      />
      <h3 className="font-medium text-lg">{ingredient.name}</h3>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-label="Edit ingredient"
          onClick={() => onEdit(ingredient)}
        >
          Edit
        </Button>

        {!showDeleteConfirm ? (
          <Button
            variant="outline"
            size="sm"
            aria-label="Delete ingredient"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(ingredient.id)}
            >
              Confirm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
```

#### 5.1.3 Form Component Testing Pattern

**1. Write the test first (failing):**

```typescript
// src/components/features/fridge/FridgeItemForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FridgeItemForm } from "./FridgeItemForm";
import { fridgeService } from "@/lib/api-services";

// Mock services
jest.mock("@/lib/api-services", () => ({
  fridgeService: {
    addItem: jest.fn(),
    updateItem: jest.fn(),
  },
  ingredientService: {
    getAllIngredients: jest.fn().mockResolvedValue([
      { id: "1", name: "Eggs" },
      { id: "2", name: "Milk" },
    ]),
  },
}));

describe("FridgeItemForm", () => {
  const mockFridgeItem = {
    id: "123",
    ingredient_id: "1",
    quantity: 12,
    unit: "pcs",
    ingredient: { id: "1", name: "Eggs" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads with form fields populated when editing", async () => {
    render(<FridgeItemForm isEditing fridgeItem={mockFridgeItem} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/ingredient/i)).toHaveValue("Eggs");
      expect(screen.getByLabelText(/quantity/i)).toHaveValue("12");
      expect(screen.getByLabelText(/unit/i)).toHaveValue("pcs");
    });
  });

  it("calls addItem when submitting new item", async () => {
    (fridgeService.addItem as jest.Mock).mockResolvedValue({ id: "new-id" });

    render(<FridgeItemForm />);

    // Fill out form
    fireEvent.change(screen.getByLabelText(/ingredient/i), {
      target: { value: "Eggs" },
    });
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: "6" },
    });
    fireEvent.change(screen.getByLabelText(/unit/i), {
      target: { value: "pcs" },
    });

    // Submit form
    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(fridgeService.addItem).toHaveBeenCalledWith({
        ingredient_id: "1",
        quantity: 6,
        unit: "pcs",
      });
    });
  });

  it("calls updateItem when editing existing item", async () => {
    (fridgeService.updateItem as jest.Mock).mockResolvedValue({ id: "123" });

    render(<FridgeItemForm isEditing fridgeItem={mockFridgeItem} />);

    // Change quantity
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: "24" },
    });

    // Submit form
    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(fridgeService.updateItem).toHaveBeenCalledWith("123", {
        quantity: 24,
        unit: "pcs",
      });
    });
  });

  it("shows validation errors for required fields", async () => {
    render(<FridgeItemForm />);

    // Submit without filling form
    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(screen.getByText(/ingredient is required/i)).toBeInTheDocument();
      expect(screen.getByText(/quantity is required/i)).toBeInTheDocument();
    });

    // Check no API call was made
    expect(fridgeService.addItem).not.toHaveBeenCalled();
  });
});
```

### 5.2 Reusable Test Templates

The following templates can be used as starting points for testing various common patterns in our application:

#### 5.2.1 API Route Test Template

```typescript
import { NextRequest } from "next/server";
import { GET, POST, PUT, DELETE } from "./route";
import { supabaseAdmin } from "@/lib/supabase";

// Mock dependencies
jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

describe("Resource API Routes", () => {
  const mockParams = Promise.resolve({ id: "test-id" });
  const mockRequest = new NextRequest(
    new URL("http://localhost/api/resource/test-id")
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET handler", () => {
    it("returns data when successful", async () => {
      // Setup mocks
      const mockData = { id: "test-id", name: "Test Resource" };
      (
        supabaseAdmin.from().select().eq().single as jest.Mock
      ).mockResolvedValue({
        data: mockData,
        error: null,
      });

      // Call the handler
      const response = await GET(mockRequest, { params: mockParams });

      // Assertions
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(mockData);
    });

    it("returns 404 when not found", async () => {
      // Setup mocks
      (
        supabaseAdmin.from().select().eq().single as jest.Mock
      ).mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      });

      // Call the handler
      const response = await GET(mockRequest, { params: mockParams });

      // Assertions
      expect(response.status).toBe(404);
    });

    it("returns 500 on error", async () => {
      // Setup mocks
      (
        supabaseAdmin.from().select().eq().single as jest.Mock
      ).mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      // Call the handler
      const response = await GET(mockRequest, { params: mockParams });

      // Assertions
      expect(response.status).toBe(500);
    });
  });

  // Similar patterns for POST, PUT, DELETE
});
```

#### 5.2.2 React Component Test Template

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentToTest } from "./ComponentToTest";

// Mock any dependencies
jest.mock("@/lib/api-services", () => ({
  resourceService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("ComponentToTest", () => {
  // Define test data
  const mockProps = {
    // Add required props
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    render(<ComponentToTest {...mockProps} />);

    // Check basic rendering
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it("handles user interactions", async () => {
    const user = userEvent.setup();
    render(<ComponentToTest {...mockProps} />);

    // Perform user interactions
    await user.click(screen.getByRole("button", { name: /action/i }));

    // Check expected outcomes
    expect(screen.getByText(/new state/i)).toBeInTheDocument();
  });

  it("handles asynchronous operations", async () => {
    // Setup mock to return expected data
    const mockService = require("@/lib/api-services").resourceService;
    mockService.getAll.mockResolvedValue([{ id: "1", name: "Item 1" }]);

    render(<ComponentToTest {...mockProps} />);

    // Check loading state if applicable
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for async operation to complete
    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    // Verify service was called correctly
    expect(mockService.getAll).toHaveBeenCalled();
  });

  it("handles error states", async () => {
    // Setup mock to simulate error
    const mockService = require("@/lib/api-services").resourceService;
    mockService.getAll.mockRejectedValue(new Error("Network error"));

    render(<ComponentToTest {...mockProps} />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

#### 5.2.3 Form Component Test Template

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormComponent } from "./FormComponent";
import { toast } from "@/components/ui/use-toast";

// Mock dependencies
jest.mock("@/lib/api-services", () => ({
  resourceService: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("@/components/ui/use-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("FormComponent", () => {
  const mockData = {
    id: "123",
    name: "Test Item",
    description: "Test description",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form fields with default values for new item", () => {
    render(<FormComponent />);

    expect(screen.getByLabelText(/name/i)).toHaveValue("");
    expect(screen.getByLabelText(/description/i)).toHaveValue("");
    expect(
      screen.getByRole("button", { name: /save|submit|create/i })
    ).toBeInTheDocument();
  });

  it("loads with existing data when editing", () => {
    render(<FormComponent isEditing data={mockData} />);

    expect(screen.getByLabelText(/name/i)).toHaveValue("Test Item");
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      "Test description"
    );
  });

  it("validates required fields", async () => {
    render(<FormComponent />);

    // Submit without filling required fields
    fireEvent.click(
      screen.getByRole("button", { name: /save|submit|create/i })
    );

    // Check validation errors
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it("submits form with valid data for new item", async () => {
    const mockService = require("@/lib/api-services").resourceService;
    mockService.create.mockResolvedValue({ id: "new-id", ...mockData });

    render(<FormComponent />);

    // Fill form
    await userEvent.type(screen.getByLabelText(/name/i), "Test Item");
    await userEvent.type(
      screen.getByLabelText(/description/i),
      "Test description"
    );

    // Submit form
    fireEvent.click(
      screen.getByRole("button", { name: /save|submit|create/i })
    );

    // Verify API call
    await waitFor(() => {
      expect(mockService.create).toHaveBeenCalledWith({
        name: "Test Item",
        description: "Test description",
      });
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("updates existing item when in edit mode", async () => {
    const mockService = require("@/lib/api-services").resourceService;
    mockService.update.mockResolvedValue({ ...mockData, name: "Updated Item" });

    render(<FormComponent isEditing data={mockData} />);

    // Change name field
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Updated Item" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /save|update/i }));

    // Verify API call
    await waitFor(() => {
      expect(mockService.update).toHaveBeenCalledWith("123", {
        name: "Updated Item",
        description: "Test description",
      });
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("handles API errors", async () => {
    const mockService = require("@/lib/api-services").resourceService;
    mockService.create.mockRejectedValue(new Error("API error"));

    render(<FormComponent />);

    // Fill and submit form
    await userEvent.type(screen.getByLabelText(/name/i), "Test Item");
    fireEvent.click(
      screen.getByRole("button", { name: /save|submit|create/i })
    );

    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
```

These templates ensure consistent test coverage and help catch regressions early.

---

## 10. Test Coverage Improvements (Sprint 9)

As part of Sprint 9, we significantly improved the test coverage and quality for our application, focusing particularly on CRUD operations. Here's what we accomplished:

### 10.1 TDD Documentation

We added detailed Test-Driven Development (TDD) examples and patterns to the documentation, including:

- Step-by-step TDD workflow examples for API routes, React components, and form components
- Reusable test templates for common patterns
- Best practices for testing different types of components

### 10.2 Test Templates

Created reusable test templates for:

- CRUD API endpoints (`src/app/api/test-templates/crud-api.test.ts`)
- React components with user interactions
- Form components with validation and submission
- API services with error handling

### 10.3 Component Tests

Improved and fixed tests for UI components:

- Added comprehensive tests for the Spinner component
- Fixed and enhanced tests for IngredientGrid component
- Added tests for the FridgePage with proper mocking
- Fixed MealRecommendations tests with ResizeObserver mocking

### 10.4 API Tests

Added comprehensive tests for API endpoints:

- `GET`, `PUT`, and `DELETE` methods for `/api/ingredients/[id]`
- `GET` and `POST` methods for `/api/ingredients`
- Error handling for all API endpoints

### 10.5 Service Tests

Created tests for API service methods:

- `ingredientService.getAllIngredients()`
- `ingredientService.addIngredient()`
- `ingredientService.searchIngredients()`
- `ingredientService.deleteIngredient()`

### 10.6 Test Coverage Results

Through these improvements, we increased our overall test coverage from 57.2% to 67.28%:

- Statements: 67.28%
- Branches: 50.61%
- Functions: 57.79%
- Lines: 67.83%

Some components now have 100% coverage, including:

- `src/app/api/ingredients/route.ts`
- `src/components/common/Card.tsx`
- `src/components/common/FormField.tsx`
- `src/components/ui/spinner.tsx`
- `src/lib/fridge.ts`
- `src/lib/meal.ts`

### 10.7 Future Test Improvements

Areas that still need improved test coverage:

1. Complete tests for the remaining API endpoints (`/api/meals`, `/api/shopping`)
2. Improve tests for complex client components
3. Add more integration tests for full user flows
4. Fix the failing tests in `src/components/MealCard.test.tsx`
5. Add tests for the image generation functionality

---
