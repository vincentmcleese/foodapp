# FoodApp Design System Documentation

This document outlines the FoodApp design system components, tokens, and usage guidelines.

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
