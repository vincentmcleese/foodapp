# FoodApp

This is a [Next.js](https://nextjs.org/) project using TypeScript, Tailwind CSS, and Shadcn UI components.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Migrations

### Latest Migration - Add AI Generated Column to Meal Table

An SQL migration has been created to add the `ai_generated` column to the meal table. To apply this migration:

1. Open the Supabase Dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy the contents from `migrations/2024-07-10-add-ai-generated-column.sql`
5. Run the SQL query

The SQL script will add a new boolean column `ai_generated` to the meal table with a default value of `false`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS.
- [Shadcn UI Documentation](https://ui.shadcn.com/docs) - learn about Shadcn UI components.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
