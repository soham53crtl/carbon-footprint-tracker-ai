# Testing Strategy

EcoSphere maintains a comprehensive Jest test suite covering business logic,
authentication, and API request handling. The suite achieves 100% statement,
branch, function, and line coverage on the core calculation engine.

## Running Tests

```bash
# Run the full suite
npm test

# Run with a coverage report
npm test -- --coverage
```

## Test Suites

| Suite | Focus | Tests |
|---|---|---|
| `calculations.test.ts` | Core carbon footprint calculation correctness | 27 |
| `calculations.branch.test.ts` | Edge cases and full branch coverage of the calculation engine | 34 |
| `auth.test.ts` | Password hashing (scrypt), JWT signing/verification, tamper and expiry detection | 26 |
| `db.test.ts` | Database schema shape validation, streak/XP/badge business rules | 28 |
| `api.test.ts` | Input validation, footprint classification, prediction model logic | 17 |
| `rate-limit.test.ts` | Sliding-window rate limiting and input sanitization | 13 |

**Total: 145 tests across 6 suites, 100% coverage on `lib/calculations.ts`.**

## Testing Philosophy

Business logic is kept framework-agnostic wherever possible (see
`lib/calculations.ts`), which allows it to be tested as pure functions without
mocking Next.js request/response objects, React rendering, or the database.
This keeps the test suite fast (under 6 seconds for the full run) and the
assertions focused on actual behavior rather than implementation details.

Where logic is embedded in API routes or services that depend on external
systems (Redis, JWT secrets), the equivalent pure logic is extracted and
tested in isolation (e.g. `rate-limit.test.ts` re-implements and tests the
sliding-window algorithm independently of the Redis-backed production code).

## Continuous Integration

Every push to `main` triggers the GitHub Actions workflow defined in
`.github/workflows/ci.yml`, which installs dependencies, runs the full test
suite with coverage, and verifies the production build succeeds.
