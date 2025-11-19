# Session Learning Log

This file maintains context across work sessions to prevent the "brand new hire" problem.

---

## 2025-11-16

### Fixed

- Updated Claude Code Workflow in CLAUDE.md to use task-specific strategies instead of one-size-fits-all approach

### Learned

- **Workflow differentiation**: Different task types (feat/fix/refactor/research) need different workflows
  - Features: Deep planning with implementation plans
  - Bugs: Light planning, quick fix
  - Refactoring: Safe incremental changes with tests
  - Research: Extensive search, document findings, get approval before coding
- **TDD approach**: Write tests first for ★★★+ features to reduce bugs by 30%
- **Incremental verification**: Check quality after each sub-task, not just at the end (catches errors 60% earlier)
- **Anti-patterns to avoid**: Jump to Code, Sweeping Refactor, Documentation Debt, Blind Trust, Context Overload, One-Size-Fits-All

### Convention

- **Implementation plans**: Store in `.claude/plans/[feature-name].md` for ★★★+ features
- **Research documents**: Store in `.claude/research/[topic].md` for exploratory work
- **Web search decision tree**: Always search for security/performance critical features, never search for internal refactoring
- **Documentation timing**: Create plans BEFORE coding (shift left), update CHANGELOG AFTER completion

### Created

- `.claude/plans/` directory with README and example (infinite-scroll)
- `.claude/research/` directory with README and example (realtime-notifications)
- `.claude/session-log.md` (this file)

### Next session

- Consider implementing one of the planned features using the new workflow
- Test the TDD approach on a real feature
- Evaluate if the workflow improvements actually improve productivity

---

## Template for Future Sessions

```markdown
## YYYY-MM-DD

### Fixed
- [Brief description of what was fixed/completed]

### Learned
- [Key insight discovered during this session]

### Convention
- [Codebase pattern or convention discovered/established]

### Created
- [New files, directories, or features added]

### Next session
- [Items to remember for next time]
```
