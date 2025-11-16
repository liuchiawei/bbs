# Implementation Plans

This directory contains implementation plans for ★★★+ features following the Feature Development Workflow.

## When to Create Plans

Create an implementation plan when:

- Feature difficulty is ★★★☆☆ or higher
- Feature involves multiple files or layers
- Feature requires research before implementation
- Feature has security or performance implications

## Template

Use this template for new implementation plans:

```markdown
# Feature: [Feature Name]

## Goal
[1-2 sentence description of what this feature achieves]

## Research Findings
- **Best practice**: [finding 1 with source]
- **Anti-pattern to avoid**: [finding 2]
- **Security consideration**: [finding 3]
- **Performance consideration**: [finding 4]

## Implementation Steps
1. [ ] Step 1 (files: `path/to/file1.ts`, `path/to/file2.tsx`)
   - Sub-task details
2. [ ] Step 2 (files: `path/to/file3.ts`)
   - Sub-task details
3. [ ] Step 3 (tests: `path/to/test.spec.ts`)
   - Test scenarios

## Test Strategy
- **Scenario 1**: Input [X] → Expected [Y]
- **Scenario 2**: Input [A] → Expected [B]
- **Edge case**: Input [Z] → Expected [W]

## Rollback Plan
- How to revert if production breaks
- Database migration rollback steps (if applicable)
- Feature flag strategy (if applicable)

## Dependencies
- New packages required: [list]
- Breaking changes: [list]
- Environment variables: [list]
```

## Example Plans

See example plans in this directory for reference.
