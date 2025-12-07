---
description: Coding standards and preferences for this project
---

# Coding Standards

## Code Formatting

### Biome Configuration
- **Always auto-format code with Biome** before showing or committing
- Run `npm run lint:fix` to auto-fix formatting issues
- Configuration:
  - Indentation: Tabs (not spaces)
  - Quote style: Double quotes
  - Auto-organize imports enabled

### Import Organization
- **Auto-organize imports** using Biome's organizeImports feature
- Import order: External packages → Internal (@/) → Relative imports
- Group related imports together

## TypeScript Standards

### Strictness Level
- **Very strict TypeScript** - no compromises
- No `any` types (use `unknown` if type is truly unknown)
- Explicit types everywhere
- Strict null checks enabled
- Use type inference only when type is obvious from context

### Type Patterns
- Prefer `type` over `interface` for object types (unless extending)
- Use branded types for IDs when appropriate
- Use discriminated unions for state management
- Export types alongside their implementations

### Example
```typescript
// Good
type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

// Bad
const data: any = { ... };
```

## Testing Approach

### Test-Driven Development (TDD)
- **Write tests first**, then implement functionality
- Tests should define the expected behavior
- Use Vitest + React Testing Library
- Co-locate test files: `ComponentName.test.tsx` alongside component

### Test Coverage
- Maintain coverage thresholds:
  - Statements: 80%
  - Branches: 70%
  - Functions: 80%
  - Lines: 80%
- Test critical paths, edge cases, and error scenarios
- Use descriptive test names: `should [expected behavior] when [condition]`

### Test Patterns
- Mock external dependencies (API calls, server actions)
- Use `@testing-library/user-event` for user interactions
- Test accessibility with `screen.getByRole`, `getByLabelText`, etc.
- Test loading states, error states, and success states

## Documentation Standards

### Minimal Documentation Philosophy
- **Code should be self-documenting**
- Use descriptive variable and function names
- Avoid comments that restate what code does
- Only document:
  - Complex business logic
  - Non-obvious behavior
  - Public APIs (exported functions/components)
  - Workarounds or temporary solutions

### When Documentation is Needed
- JSDoc for exported functions/components (minimal, focus on usage)
- Inline comments for complex algorithms or business rules
- README updates for new features or breaking changes

### Example
```typescript
// Good - self-documenting
function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Bad - unnecessary comment
// This function calculates the total price
function calc(items: CartItem[]): number { ... }
```

## Error Handling

### Linear Integration
- **Always integrate with Linear error reporting** for production errors
- Use `collectErrorContext()` to gather error information
- Use `getLinearErrorReporter()` for reporting
- Only report in production (`NODE_ENV === "production"`)

### Error Patterns
- Use result objects: `{ success: boolean, error?: string, data?: T }`
- Never throw errors from server actions (return error results instead)
- Provide user-friendly error messages
- Log detailed errors for debugging

### Example
```typescript
export async function submitForm(data: FormData): Promise<ActionResult> {
  try {
    // ... validation and processing
    return { success: true, data: result };
  } catch (error) {
    // Report to Linear in production
    if (process.env.NODE_ENV === "production") {
      const context = collectErrorContext(error, { url, userAgent });
      getLinearErrorReporter().reportError(context).catch(console.error);
    }
    return { success: false, error: "An error occurred" };
  }
}
```

## Component Patterns

### Server vs Client Components
- **Smart hybrid approach**: Server Components by default, Client Components when needed
- Use Server Components for:
  - Data fetching
  - Static content
  - SEO-critical content
- Use Client Components (`"use client"`) for:
  - Interactivity (onClick, onChange, etc.)
  - Browser APIs (localStorage, window, etc.)
  - State management (useState, useEffect, etc.)
  - Animations (Framer Motion)

### Component Structure
- Export as named exports: `export function ComponentName() { ... }`
- Use TypeScript for props: `type ComponentProps = { ... }`
- Keep components focused and single-purpose
- Compose complex UIs from smaller components

### Example
```typescript
// Server Component (default)
export function ProductList() {
  const products = await fetchProducts();
  return <div>{/* render products */}</div>;
}

// Client Component (when needed)
"use client";
export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  // ... interactive logic
}
```

## Validation

### Zod Everywhere
- **Use Zod schemas for all validation**
- User inputs (forms, URL params, query strings)
- API request/response boundaries
- Environment variables
- Data transformations

### Validation Patterns
- Define schemas in `lib/validations/` directory
- Use `zodResolver` with react-hook-form
- Validate server-side even if client-side validation exists
- Provide clear, user-friendly error messages

### Example
```typescript
// lib/validations/contact.ts
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
```

## Async/Await Patterns

### Always Use Await
- **Always use `await`** - never use `.then()` chains
- Use `async/await` for all asynchronous operations
- Handle errors with try/catch blocks
- Use `Promise.all()` for parallel operations

### Example
```typescript
// Good
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    // handle error
  }
}

// Bad
function fetchData() {
  return fetch(url)
    .then(response => response.json())
    .then(data => data)
    .catch(error => { /* handle error */ });
}
```

## Accessibility (a11y)

### Strict Accessibility Requirements
- **Always implement strict accessibility standards**
- Use semantic HTML elements
- Provide ARIA labels for interactive elements
- Ensure keyboard navigation works
- Test with screen readers in mind

### Accessibility Checklist
- All images have `alt` text
- Form inputs have associated labels
- Buttons have descriptive `aria-label` when text is not sufficient
- Interactive elements are keyboard accessible
- Focus indicators are visible
- Color contrast meets WCAG AA standards
- Use `role` attributes when semantic HTML isn't sufficient

### Example
```typescript
<Button
  type="submit"
  disabled={pending}
  aria-label={pending ? "Sending message" : "Send message"}
>
  {pending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      Sending...
    </>
  ) : (
    <>
      <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
      Send Message
    </>
  )}
</Button>
```

## Performance Optimization

### Optimization Approach
- **Suggest optimizations** but don't implement without approval
- Avoid premature optimization
- Optimize when profiling shows actual performance issues
- Use React optimization tools (memo, useMemo, useCallback) judiciously

### When to Optimize
- Large lists or tables (virtualization)
- Expensive computations (useMemo)
- Callback functions passed to memoized children (useCallback)
- Heavy re-renders (React.memo)

### Example
```typescript
// Suggest optimization, don't implement automatically
// Consider: This component re-renders frequently. Should we memoize it?
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // ...
});
```

## Naming Conventions

### Strict Naming Rules
- **Files**: `kebab-case.tsx` (e.g., `contact-form.tsx`, `user-profile.tsx`)
- **Components**: `PascalCase` (e.g., `ContactForm`, `UserProfile`)
- **Functions/Variables**: `camelCase` (e.g., `submitForm`, `userData`)
- **Types/Interfaces**: `PascalCase` (e.g., `ContactFormData`, `UserProfile`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_ATTEMPTS`)
- **Test files**: `ComponentName.test.tsx` or `utility.test.ts`

### Examples
```typescript
// File: lib/actions/contact.ts
export type ContactFormData = { ... };
export async function submitContactForm(data: ContactFormData) { ... }

// File: components/contact-form.tsx
export function ContactForm() { ... }

// File: lib/utils.ts
export const MAX_FORM_LENGTH = 1000;
export function formatEmail(email: string) { ... }
```

## Code Quality

### General Principles
- Keep functions small and focused (single responsibility)
- Avoid deep nesting (max 3-4 levels)
- Use early returns to reduce nesting
- Extract complex logic into separate functions
- Prefer composition over inheritance

### Code Review Checklist
- [ ] TypeScript types are explicit and correct
- [ ] All user inputs are validated with Zod
- [ ] Error handling is comprehensive
- [ ] Accessibility requirements are met
- [ ] Tests cover critical paths
- [ ] Code is self-documenting
- [ ] No console.log statements (use proper logging)
- [ ] No hardcoded secrets or API keys

