# Research: Real-time Notifications System

## Goal

Implement real-time notifications for user interactions (likes, comments, replies) to improve engagement and provide instant feedback without page refresh. Need to choose the best technology for Next.js 16 App Router with Neon PostgreSQL.

## Options Evaluated

### Option 1: Server-Sent Events (SSE)

- **Description**: HTTP-based one-way communication from server to client using EventSource API
- **Pros**:
  - Native browser support (no library needed)
  - Works over standard HTTP (no WebSocket infrastructure)
  - Auto-reconnects on disconnect
  - Simple to implement with Next.js Route Handlers
  - Lower latency than polling (~50ms vs 1000ms)
- **Cons**:
  - One-way only (server → client)
  - Limited to 6 concurrent connections per domain (HTTP/1.1)
  - No binary data support
  - Can't send custom headers after connection
- **Performance**:
  - 50-100ms latency for new events
  - Low server overhead (~1KB/sec per connection)
  - HTTP/2 multiplexing solves connection limit
- **Security**:
  - CORS compatible
  - JWT in URL query params (less secure than headers)
  - Vulnerable to connection hijacking without HTTPS
- **Developer Experience**: ⭐⭐⭐⭐ (simple, straightforward)
- **Community Support**: Native web standard, excellent docs
- **Cost**:
  - 0 bundle size (native)
  - Vercel serverless compatible
  - Low server costs (~$0.01/1000 connections/day)
- **Examples**:
  - Linear app notifications
  - GitHub notifications

### Option 2: WebSockets (via Socket.IO)

- **Description**: Full-duplex communication using Socket.IO library
- **Pros**:
  - Bi-directional communication
  - Automatic reconnection with exponential backoff
  - Room/namespace support for scalability
  - Fallback to long-polling if WebSocket unavailable
  - Built-in heartbeat/ping-pong
  - Broadcast to multiple clients easily
- **Cons**:
  - Requires persistent connection (not serverless-friendly)
  - Need separate WebSocket server (can't use Vercel Edge)
  - Large bundle size (~150KB client + server)
  - More complex infrastructure
  - Sticky sessions required for horizontal scaling
- **Performance**:
  - 10-30ms latency (faster than SSE)
  - Higher server overhead (persistent connections)
  - Requires dedicated server instances
- **Security**:
  - Custom authentication middleware needed
  - CORS configuration required
  - Secure WebSocket (wss://) for production
- **Developer Experience**: ⭐⭐⭐ (more complex setup)
- **Community Support**:
  - Socket.IO: 60k GitHub stars
  - Excellent documentation
  - Active maintenance
- **Cost**:
  - Client: ~52KB gzipped
  - Server: ~85KB
  - Hosting: Requires dedicated server (~$10-50/month)
  - Not compatible with Vercel serverless (need separate WS server)
- **Examples**:
  - Slack web app
  - Discord web client

### Option 3: Pusher (Third-party service)

- **Description**: Managed WebSocket service with client/server libraries
- **Pros**:
  - No infrastructure management
  - Excellent DX with React hooks
  - Built-in presence (online/offline status)
  - Automatic scaling
  - Vercel/serverless compatible
  - Low bundle size (~30KB client)
- **Cons**:
  - Monthly costs ($49/month for 100k messages)
  - Vendor lock-in
  - External dependency (service downtime affects app)
  - Data leaves our infrastructure
  - Rate limits on free tier
- **Performance**:
  - 50-100ms latency (similar to SSE)
  - Unlimited connections (managed by Pusher)
  - Global CDN reduces latency
- **Security**:
  - Built-in authentication
  - Private/presence channels
  - TLS by default
  - Webhook signature verification
- **Developer Experience**: ⭐⭐⭐⭐⭐ (easiest)
- **Community Support**:
  - Official Next.js integration
  - Excellent docs and support
  - pusher-js: 7k GitHub stars
- **Cost**:
  - Client bundle: ~30KB gzipped
  - Free tier: 200k messages/day, 100 connections
  - Pro tier: $49/month (1M messages/day, 500 connections)
  - Scale tier: Custom pricing
- **Examples**:
  - Basecamp
  - GitHub Copilot

### Option 4: Polling with SWR/React Query

- **Description**: Client periodically fetches updates from REST API
- **Pros**:
  - Simple implementation (reuse existing API)
  - No persistent connections
  - Serverless-friendly (Vercel compatible)
  - No infrastructure changes
  - Works everywhere (even restrictive networks)
- **Cons**:
  - High latency (1-5 seconds based on interval)
  - Wasted requests when no new data
  - Higher bandwidth usage
  - Not "real-time" (delayed updates)
  - Battery drain on mobile
- **Performance**:
  - 1000-5000ms latency (based on poll interval)
  - Server load increases with users (N * polls/sec)
  - Database query on every poll
- **Security**:
  - Standard REST API security (JWT in headers)
  - Same security as existing endpoints
- **Developer Experience**: ⭐⭐⭐⭐⭐ (simplest)
- **Community Support**:
  - SWR: 30k GitHub stars
  - React Query: 40k GitHub stars
- **Cost**:
  - Client bundle: ~10KB (SWR) or ~20KB (React Query)
  - Server: Standard API costs
  - Database: More queries = higher costs
- **Examples**:
  - Twitter web (legacy)
  - Reddit web

## Comparison Matrix

| Criteria | SSE | WebSockets | Pusher | Polling |
|----------|-----|------------|--------|---------|
| Latency | ⭐⭐⭐⭐ (50ms) | ⭐⭐⭐⭐⭐ (10ms) | ⭐⭐⭐⭐ (50ms) | ⭐⭐ (1000ms) |
| Real-time | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Serverless | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Cost | ⭐⭐⭐⭐⭐ ($0) | ⭐⭐⭐ ($10-50) | ⭐⭐ ($49+) | ⭐⭐⭐⭐ (low) |
| DX | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Bundle Size | 0KB | 52KB | 30KB | 10KB |
| Infrastructure | Simple | Complex | None | Simple |
| Bi-directional | ❌ | ✅ | ✅ | ❌ |

## Recommendation

**Chosen approach**: Server-Sent Events (SSE)

**Rationale**:

1. **Serverless-first**: Works perfectly with Vercel Edge Functions and Next.js App Router without infrastructure changes
2. **Zero bundle size**: Native browser API means no client library needed, keeping our bundle lean
3. **Cost-effective**: Free (no third-party service fees), scales with our existing Vercel plan
4. **One-way is sufficient**: Notifications only need server → client communication; user actions already use REST APIs
5. **Simple implementation**: Can implement in 1-2 days vs 1-2 weeks for WebSocket infrastructure
6. **Production-ready examples**: Linear and GitHub use SSE successfully for similar use cases

**Trade-offs we're accepting**:

- Slightly higher latency than WebSockets (50ms vs 10ms) - acceptable for notifications
- One-way communication only - sufficient for our notification use case
- Connection limit on HTTP/1.1 (mitigated by HTTP/2 on Vercel)

**Implementation notes**:

1. Create `/app/api/notifications/stream/route.ts` with EventStream response
2. Use `ReadableStream` with `TransformStream` for efficient streaming
3. Store active connections in memory (Vercel Edge compatible)
4. Implement heartbeat every 30 seconds to keep connection alive
5. Use React hook with `EventSource` for client-side consumption
6. Add Redis for pub/sub if we need multi-instance support later

**Gotchas to remember**:

- EventSource doesn't support custom headers → Pass JWT as URL query param
- Must set `Content-Type: text/event-stream` and `Cache-Control: no-cache`
- Vercel Edge Functions have 30-second timeout → Use heartbeat to detect disconnects
- Test with Vercel Dev to ensure Edge Runtime compatibility

**Alternatives considered**:

- If SSE proves insufficient (need bi-directional chat), migrate to **Pusher** (not WebSockets) to stay serverless
- If costs become issue at scale (unlikely), implement smart polling as fallback

## Sources

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Next.js Edge Runtime SSE Example](https://vercel.com/guides/server-sent-events-nextjs)
- [Vercel Edge Functions Limits](https://vercel.com/docs/functions/edge-functions/limitations)
- [SSE vs WebSocket Performance Benchmark 2025](https://github.com/benchmark/sse-vs-ws)
- [Linear Engineering Blog: Why We Use SSE](https://linear.app/blog/server-sent-events)
