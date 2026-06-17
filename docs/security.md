# Security

EcoSphere follows OWASP-aligned practices across authentication, data
handling, and API design.

## Authentication

- **Password storage**: passwords are never stored in plain text. They are
  hashed using Node's native `scrypt` key derivation function with a random
  16-byte salt per user (`lib/auth/auth-service.ts`).
- **Password verification**: comparison uses `crypto.timingSafeEqual` to
  prevent timing attacks.
- **Sessions**: stateless JWTs signed with HMAC-SHA256, carrying a `userId`,
  `email`, `userName`, and expiry (`exp`) claim. Tokens are verified by
  re-computing the HMAC signature and rejecting any mismatch or expired token.
- **Transport**: sessions can be carried via an `Authorization: Bearer` header
  or an `httpOnly`, `secure` (in production), `sameSite=strict` cookie —
  preventing the token from being read by client-side JavaScript or leaked
  cross-site.

## Input Handling

- All API routes validate required fields and reject malformed payloads with
  a `400` response before any business logic runs.
- Email format and password length are validated server-side on signup,
  independent of any client-side validation.
- The chatbot endpoint (`/api/chat`) sanitizes user input by stripping
  `<script>` tags, all other HTML tags, and `javascript:` URIs before the
  message is forwarded to the AI service, and caps message length at 1000
  characters.

## Rate Limiting

- `/api/chat` is rate-limited to 10 requests per minute per authenticated
  user via a sliding-window algorithm (`lib/rate-limit.ts`), returning a
  `429` status with a `Retry-After` header when exceeded. This mitigates
  abuse of the AI service and protects against denial-of-service patterns.

## Data Persistence

- User and activity data is stored in Upstash Redis, accessed only from
  server-side API routes — never exposed directly to the client.
- No raw SQL is used anywhere in the application, eliminating SQL injection
  as an attack surface entirely.

## Secrets Management

- All secrets (`JWT_SECRET` / `SESSION_SECRET`, `GEMINI_API_KEY`, Redis
  credentials) are read from environment variables and are never committed
  to the repository. `.env.local` is gitignored.

## Dependency Security

- The project pins Next.js to `14.2.35`, a version patched against the
  December 2025 React Server Components security advisories
  (CVE-2025-55183, CVE-2025-55184, CVE-2025-67779) and the earlier
  CVE-2025-66478 advisory.
