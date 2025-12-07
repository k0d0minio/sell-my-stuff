---
description: Project-specific patterns and learnings
---

# Project: Website Starter

## Tech Stack
- Framework: Next.js 16 (App Router) with React 19
- Language: TypeScript (strict mode enabled)
- Styling: Tailwind CSS v4
- UI Components: shadcn/ui (Radix UI primitives)
- Internationalization: next-intl
- Form Handling: react-hook-form with Zod validation
- Email: Resend API
- Error Reporting: Linear integration (production only)
- Testing: Vitest + React Testing Library
- Linting/Formatting: Biome
- Animations: Framer Motion
- Analytics: Vercel Analytics & Speed Insights

## Project Structure

```
app/
  [locale]/          # Internationalized routes
    page.tsx         # Homepage
    layout.tsx       # Locale-specific layout
    cookies/         # Cookie policy page
    privacy/         # Privacy policy page
    terms/           # Terms of service page
  api/               # API routes
  globals.css        # Global styles
  layout.tsx         # Root layout
  manifest.ts        # PWA manifest
  robots.ts          # Robots.txt generation
  sitemap.ts         # Sitemap generation

components/
  ui/                # shadcn/ui components
  *.tsx              # Feature components (header, footer, etc.)
  *.test.tsx         # Component tests (co-located)

lib/
  actions/           # Server actions
  errors/            # Error handling and reporting
  linear/            # Linear API integration
  seo/               # SEO utilities (structured data)
  validations/       # Zod schemas
  utils.ts           # Utility functions

i18n/                # Internationalization config
messages/            # Translation files (JSON)

tests/
  integration/       # Integration tests
  setup.tsx          # Test setup and mocks
```

## Project Patterns

### Routing
- Internationalized routes: `app/[locale]/[page]/page.tsx`
- API routes: `app/api/[resource]/route.ts` pattern
- Use `@/i18n/routing` Link component for i18n-aware navigation

### Components
- Server Components by default, use `"use client"` only when needed
- Client components for interactive UI (forms, animations, state)
- Component composition pattern
- Co-located tests: `ComponentName.test.tsx` alongside component
- Export components as named exports

### Server Actions
- Server actions in `lib/actions/` directory
- Use `"use server"` directive
- Always validate with Zod schemas
- Return result objects: `{ success: boolean, error?: string }`
- Integrate with Linear error reporting in production

### Error Handling
- Use Linear error reporter for production errors
- Error deduplication via signature hashing
- Collect comprehensive error context (URL, user agent, stack trace)
- User-friendly error messages, detailed logging for debugging

### Validation
- Zod schemas in `lib/validations/` directory
- Validate all user inputs and API boundaries
- Use `zodResolver` with react-hook-form

### SEO
- Metadata via `lib/metadata.ts` helper
- Structured data (JSON-LD) in `lib/seo/structured-data.ts`
- Dynamic sitemap generation
- Environment-based configuration

### Testing
- Vitest for unit and integration tests
- React Testing Library for component tests
- Tests co-located with source files
- Coverage thresholds: 80% statements, 70% branches, 80% functions, 80% lines
- Integration tests in `tests/integration/` directory

### Styling
- Tailwind CSS utility classes
- Use `cn()` utility for conditional classes
- shadcn/ui components for UI primitives
- Framer Motion for animations

## Known Issues & Solutions

<!-- Document solutions to project-specific problems as they arise -->

## Project-Specific Conventions

### Git Workflow
- Feature branches: `feature/[linear-id]-[description]`
- Commit format: `[type]: [description]` (e.g., `feat: add contact form validation`)

### Environment Variables
- Client-side: Must use `NEXT_PUBLIC_` prefix
- Server-side: No prefix required
- See README.md for complete list of required variables

### File Naming
- Components: `kebab-case.tsx` (e.g., `contact-form.tsx`)
- Utilities: `kebab-case.ts` (e.g., `structured-data.ts`)
- Tests: `ComponentName.test.tsx` or `utility.test.ts`

