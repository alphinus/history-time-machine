# Testing Patterns

**Analysis Date:** 2026-01-16

## Test Framework

**Runner:**
- Not configured

**Assertion Library:**
- Not installed

**Run Commands:**
```bash
# No test commands available - testing not set up
```

## Test File Organization

**Location:**
- No test files exist in the codebase

**Naming:**
- Not applicable (no tests)

**Structure:**
```
# No test directory structure exists
```

## Test Structure

**Suite Organization:**
- Not applicable

**Patterns:**
- Not applicable

## Mocking

**Framework:** Not configured

**Patterns:**
- Not applicable

**What to Mock (recommendations for future tests):**
- External API calls (Wikipedia, Gemini, OpenAI, Pollinations)
- `navigator.geolocation` API
- `localStorage` for API key storage
- `navigator.clipboard` for copy functionality

**What NOT to Mock:**
- React component rendering
- State management hooks

## Fixtures and Factories

**Test Data:**
- Not applicable (no test infrastructure)

**Location:**
- Not applicable

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
# Not configured
```

## Test Types

**Unit Tests:**
- Not implemented

**Integration Tests:**
- Not implemented

**E2E Tests:**
- Not implemented

## Recommended Test Setup

If adding tests, consider:

**Framework Options:**
- Vitest (integrates with Vite, already in dev tooling ecosystem)
- React Testing Library (for component testing)

**Install Command:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Config Addition (`vite.config.js`):**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

**Package.json Scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

## Testable Units

**Utility Functions (high priority):**
- `formatCoordinate()` - coordinate formatting logic
- `formatHistoricalDate()` - date string formatting
- `generatePrompt()` - prompt generation
- `generateEventPrompt()` - event-based prompt generation
- `parseWikipediaEvents()` - Wikipedia API response parsing

**Example Test Pattern:**
```javascript
import { describe, it, expect } from 'vitest'
import { formatCoordinate, formatHistoricalDate } from './HistoryTimeMachine'

describe('formatCoordinate', () => {
  it('formats positive latitude as N', () => {
    expect(formatCoordinate(45.5, true)).toBe('45.5000° N')
  })

  it('formats negative latitude as S', () => {
    expect(formatCoordinate(-33.9, true)).toBe('33.9000° S')
  })
})

describe('formatHistoricalDate', () => {
  it('formats BCE dates correctly', () => {
    const date = { year: 44, month: 3, day: 15, isBCE: true }
    expect(formatHistoricalDate(date)).toBe('March 15, 44 BCE')
  })
})
```

**Components (medium priority):**
- `LocationPicker` - coordinate input validation
- `HistoryDatePicker` - date selection flow
- `ApiKeySettings` - key management

**API Integration (requires mocking):**
- `fetchOnThisDay()` - Wikipedia API calls
- Image generation providers - requires extensive mocking

## Current Testing Gaps

**Critical gaps:**
- No unit tests for utility functions
- No component tests
- No integration tests for API flows
- No validation of error handling paths

**Risk areas without tests:**
- Date formatting edge cases (BCE/CE boundary, leap years)
- Coordinate validation boundaries (-90 to 90, -180 to 180)
- API error handling and fallback chains
- localStorage operations and edge cases

---

*Testing analysis: 2026-01-16*
