# Feature: Infinite Scroll for Post Lists

## Goal

Implement infinite scroll for the home page post list to improve UX and performance by loading posts incrementally instead of pagination, using react-window for virtualization.

## Research Findings

- **Best practice**: Use react-window for virtualized lists with 1000+ items (Source: React docs 2025)
  - Reduces DOM nodes from 1000+ to ~20 visible items
  - 10x performance improvement on mobile devices
- **Anti-pattern to avoid**: Loading all data at once with infinite scroll creates memory leaks
  - Solution: Implement proper cleanup and pagination
- **Security consideration**: Validate page/cursor parameters server-side to prevent DOS
  - Rate limit API endpoints (10 requests/second per user)
- **Performance consideration**: Use cursor-based pagination over offset-based
  - Offset-based degrades with large datasets (LIMIT 1000, 10 is slow)
  - Cursor-based maintains constant time complexity

## Implementation Steps

1. [ ] Backend API changes (files: `app/api/posts/route.ts`, `lib/services/posts.ts`)
   - Add cursor-based pagination to GET /api/posts
   - Return `nextCursor` in response for infinite scroll
   - Add `limit` parameter (default 20, max 50)
   - Update Prisma query to use cursor pagination

2. [ ] Frontend infinite scroll hook (files: `hooks/use-infinite-scroll.ts`)
   - Create custom hook using Intersection Observer API
   - Handle loading states, error states, end of list
   - Implement debouncing to prevent multiple simultaneous requests

3. [ ] Update home page (files: `app/page.tsx`, `components/posts/post-list.tsx`)
   - Replace static post list with infinite scroll component
   - Integrate react-window for virtualization
   - Add loading spinner at bottom
   - Preserve hot posts section (sticky at top)

4. [ ] Tests (files: `hooks/use-infinite-scroll.test.ts`, `app/api/posts/route.test.ts`)
   - Test cursor pagination logic
   - Test infinite scroll hook with mock Intersection Observer
   - Test edge cases (empty list, last page, errors)

## Test Strategy

- **Scenario 1**: User scrolls to bottom → Next page loads automatically
- **Scenario 2**: User reaches end of posts → Shows "No more posts" message
- **Edge case 1**: Network error during load → Shows error, allows retry
- **Edge case 2**: Posts updated by another user → Maintain scroll position, no duplicates
- **Performance**: Load time <100ms for 20 posts, <500ms on 3G

## Rollback Plan

- Keep pagination UI as fallback (feature flag)
- If infinite scroll causes issues:
  1. Set `ENABLE_INFINITE_SCROLL=false` in environment variables
  2. Site automatically falls back to pagination
- Database changes:
  - No schema changes required
  - API backwards compatible (supports both cursor and offset)

## Dependencies

- New packages required:
  - `react-window` (already installed)
  - `react-intersection-observer` (new, 31KB gzipped)
- Breaking changes: None (additive only)
- Environment variables:
  - `ENABLE_INFINITE_SCROLL` (optional, default true)
  - `MAX_POSTS_PER_PAGE` (optional, default 20)
