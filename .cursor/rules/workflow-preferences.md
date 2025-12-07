---
description: Workflow preferences and AI behavior guidelines
---

# Workflow Preferences

## Git & Version Control

### Commit Behavior
- **Never auto-commit** - only stage files when explicitly asked
- Never commit changes automatically
- Never suggest commits unless explicitly asked
- User maintains full control over git workflow

### When User Requests Commits
- Stage files as requested
- Suggest commit messages but don't commit
- Follow project conventions: `[type]: [description]`
- Include Linear issue references when applicable: `[LIN-XXX]`

## Refactoring Approach

### Refactoring Philosophy
- **Suggest improvements first**, implement only when approved
- Don't refactor code that isn't directly related to the current task
- Preserve working functionality unless explicitly asked to change
- When editing files, suggest refactoring opportunities but don't implement automatically

### When to Suggest Refactoring
- Code duplication detected
- Complex functions that could be simplified
- Performance improvements that don't change behavior
- Code that doesn't follow project patterns
- Opportunities to improve type safety

### Refactoring Guidelines
- Always ask before refactoring unrelated code
- Explain the benefit of the refactoring
- Show what would change
- Let user decide if refactoring should happen now or later

### Example Interaction
```
⚠️ Potential improvement: This function is doing multiple things. 
Would you like me to split it into smaller functions? This would improve 
testability and readability. Y/N
```

## AI Suggestion Behavior

### When to Suggest
- **Only suggest when explicitly asked** or when user makes a mistake
- Don't proactively suggest alternatives unless:
  - User's approach has a critical issue
  - User asks for suggestions
  - User makes a clear mistake that would cause problems

### Suggestion Style
- Be concise and specific
- Explain why the suggestion matters
- Provide actionable alternatives
- Don't overwhelm with too many suggestions at once

### When to Stay Silent
- Code follows project patterns correctly
- Implementation is reasonable even if not "perfect"
- User is exploring different approaches
- No critical issues detected

## File Organization

### Strict Project Structure
- **Follow strict project structure patterns**
- Place files in appropriate directories:
  - Components: `components/`
  - Server actions: `lib/actions/`
  - Utilities: `lib/`
  - Validations: `lib/validations/`
  - Tests: Co-located with source files or `tests/`
  - Pages: `app/[locale]/`

### File Placement Rules
- New components go in `components/` (or `components/ui/` for shadcn components)
- Server actions go in `lib/actions/`
- Validation schemas go in `lib/validations/`
- Utility functions go in `lib/`
- Tests co-locate with source files: `ComponentName.test.tsx`
- Integration tests go in `tests/integration/`

### When to Ask
- If file placement is ambiguous
- If creating a new directory structure
- If file doesn't fit existing patterns

## Import Organization

### Auto-Organize Imports
- **Always auto-organize imports** using Biome
- Run `npm run lint:fix` to organize imports
- Import order:
  1. External packages (React, Next.js, third-party)
  2. Internal imports (`@/...`)
  3. Relative imports (`./`, `../`)

### Import Grouping
- Group related imports together
- Separate groups with blank lines if helpful for readability
- Use absolute imports (`@/`) for internal code
- Use relative imports only for closely related files

## Code Changes

### Making Changes
- Analyze existing patterns before creating new ones
- Match the coding style of surrounding files
- Make minimal changes that solve the specific problem
- Preserve working functionality unless explicitly asked to change

### Before Making Changes
1. What patterns exist in similar files?
2. Will this break existing functionality?
3. Is this the smallest change that works?
4. Does this follow project conventions?

### Change Scope
- Focus on the specific task at hand
- Don't make unrelated improvements
- Don't refactor code outside the scope of the request
- If improvements are needed, suggest them separately

## Performance Optimization

### Optimization Approach
- **Suggest optimizations** but don't implement without approval
- Avoid premature optimization
- Only optimize when there's a clear performance need
- Explain the benefit and potential trade-offs

### When to Suggest Optimizations
- Large lists that could benefit from virtualization
- Expensive computations that could be memoized
- Components re-rendering unnecessarily
- Network requests that could be batched or cached

### Optimization Suggestions Format
```
💡 Performance suggestion: This component re-renders on every parent update. 
Consider wrapping with React.memo() if the props don't change frequently. 
Should I implement this? Y/N
```

## Error Handling in Workflow

### When Errors Occur
- Fix errors immediately when making changes
- Run linting/type-checking after changes
- Verify tests pass before considering task complete
- Report complex errors that need user input

### Quality Gates
- All code must pass `npm run lint`
- All code must pass `npm run type-check`
- All tests must pass
- Build must succeed

## Task Completion

### Completion Criteria
- Code implements requested functionality
- All tests pass
- Code follows project standards
- No linting or type errors
- Code is properly formatted

### Before Marking Complete
- Run quality checks (lint, type-check, test)
- Verify code follows all standards
- Ensure no console.log or debug code remains
- Confirm error handling is appropriate

## Communication Style

### Be Direct and Concise
- Get to the point quickly
- Use code examples when helpful
- Explain complex decisions
- Don't over-explain obvious things

### Flag Issues Appropriately
- Use format: `⚠️ Potential issue: [specific problem] - affects [specific area]. Address now? Y/N`
- Only flag issues that directly impact the current task
- Don't flag every minor improvement opportunity

### Ask Questions When Needed
- Ask exactly 3 targeted questions maximum when requirements are unclear
- Format as: "To proceed, I need to clarify: 1) [question] 2) [question] 3) [question]"
- Never ask open-ended questions like "what do you want to achieve?"

