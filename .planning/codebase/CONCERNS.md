# Codebase Concerns

**Analysis Date:** 2026-01-16

## Tech Debt

**Monolithic Component:**
- Issue: Entire application is in a single 1308-line file
- Files: `/Users/mg1/history-time-machine/src/components/HistoryTimeMachine.jsx`
- Impact: Difficult to maintain, test, and extend. All 8 components, services, and utilities are co-located
- Fix approach: Extract into separate files:
  - `src/components/LocationPicker.jsx`
  - `src/components/HistoryDatePicker.jsx`
  - `src/components/OnThisDayPanel.jsx`
  - `src/components/ApiKeySettings.jsx`
  - `src/components/ImageGenerationPanel.jsx`
  - `src/services/wikipedia.js`
  - `src/services/imageGeneration.js`
  - `src/utils/formatting.js`
  - `src/utils/storage.js`

**No Type Safety:**
- Issue: Using plain JavaScript (JSX) without TypeScript
- Files: All `.jsx` files
- Impact: Runtime errors from type mismatches, harder refactoring, no IDE intellisense for props
- Fix approach: Migrate to TypeScript, add interfaces for props and state

**Hardcoded API Model Lists:**
- Issue: Gemini model names hardcoded in component, will break when models change
- Files: `/Users/mg1/history-time-machine/src/components/HistoryTimeMachine.jsx` (lines 892-894)
- Impact: Requires code changes when Gemini deprecates models
- Fix approach: Move to config file or fetch available models dynamically

## Known Bugs

**API Key Validation is Fake:**
- Symptoms: "Validating" just waits 1 second, does not actually verify key works
- Files: `/Users/mg1/history-time-machine/src/components/HistoryTimeMachine.jsx` (lines 655-656)
- Trigger: Save any API key (valid or invalid)
- Workaround: None - user only discovers invalid key when generation fails

**Pollinations HEAD Request May Fail Silently:**
- Symptoms: HEAD request may succeed but actual image may not load
- Files: `/Users/mg1/history-time-machine/src/components/HistoryTimeMachine.jsx` (lines 878-881)
- Trigger: Use Pollinations provider
- Workaround: Retry generation

**Download Link May Not Work for Base64 Images:**
- Symptoms: Download link uses data URI which may fail on large images
- Files: `/Users/mg1/history-time-machine/src/components/HistoryTimeMachine.jsx` (lines 1081-1087)
- Trigger: Download a Gemini or OpenAI generated image
- Workaround: Right-click and save image instead

## Security Considerations

**API Keys Stored in localStorage with Weak Encoding:**
- Risk: API keys stored with simple base64 encoding (not encryption), accessible via browser devtools
- Files: `/Users/mg1/history-time-machine/src/components/HistoryTimeMachine.jsx` (lines 91-117)
- Current mitigation: Base64 encoding only (trivially reversible)
- Recommendations:
  - Warn users more prominently about local storage risks
  - Consider using a backend proxy to avoid exposing keys in browser
  - Use Web Crypto API for actual encryption if client-side storage required

**No CSP Headers:**
- Risk: No Content Security Policy, vulnerable to XSS if third-party content is loaded
- Files: `/Users/mg1/history-time-machine/index.html`
- Current mitigation: None
- Recommendations: Add CSP meta tag restricting script sources

**External API Calls Without Rate Limiting:**
- Risk: User could trigger many expensive API calls rapidly
- Files: `/Users/mg1/history-time-machine/src/components/HistoryTimeMachine.jsx` (handleGenerate function)
- Current mitigation: Button disabled during generation
- Recommendations: Add client-side debouncing and rate limiting

## Performance Bottlenecks

**Large Wikipedia Response Not Memoized:**
- Problem: Wikipedia API called on every date change, no caching
- Files: `/Users/mg1/history-time-machine/src/components/HistoryTimeMachine.jsx` (lines 449-463)
- Cause: useEffect fetches data on every `date.month`/`date.day` change
- Improvement path: Add simple cache (Map or localStorage) keyed by month/day

**All Components Re-render on Any State Change:**
- Problem: No memoization (React.memo, useMemo, useCallback for handlers)
- Files: `/Users/mg1/history-time-machine/src/components/HistoryTimeMachine.jsx`
- Cause: Components defined inside same file, handlers recreated on every render
- Improvement path: Extract components, wrap with React.memo, memoize handlers

**Base64 Images Stored in State:**
- Problem: Large base64 strings (several MB) kept in React state
- Files: `/Users/mg1/history-time-machine/src/components/HistoryTimeMachine.jsx` (lines 992-996)
- Cause: OpenAI and Gemini return base64, stored directly in state
- Improvement path: Convert to blob URLs, revoke on cleanup

## Fragile Areas

**API Response Parsing:**
- Files: `/Users/mg1/history-time-machine/src/components/HistoryTimeMachine.jsx` (lines 929-938)
- Why fragile: Deep optional chaining assumes specific response structure
- Safe modification: Add schema validation (e.g., Zod)
- Test coverage: None

**Provider Fallback Chain:**
- Files: `/Users/mg1/history-time-machine/src/components/HistoryTimeMachine.jsx` (lines 892-951)
- Why fragile: Tries multiple Gemini models, complex error handling logic
- Safe modification: Extract to separate service with unit tests
- Test coverage: None

**Date Validation:**
- Files: `/Users/mg1/history-time-machine/src/components/HistoryTimeMachine.jsx` (lines 318-327)
- Why fragile: Minimal validation (only checks year > 0), no day-of-month validation
- Safe modification: Add proper date validation library
- Test coverage: None

## Scaling Limits

**Browser Memory:**
- Current capacity: Can hold ~5-10 generated images before slowdown
- Limit: Browser tab may crash with many large base64 images
- Scaling path: Use blob URLs and revoke old images

**localStorage:**
- Current capacity: ~5MB browser limit for localStorage
- Limit: Cannot store many images locally
- Scaling path: Not applicable for current feature set, but consider IndexedDB if needed

## Dependencies at Risk

**None Critical:**
- All dependencies are stable (React 18, Vite 5, Tailwind 3)
- No deprecated packages detected

## Missing Critical Features

**No Error Boundaries:**
- Problem: React errors crash entire app
- Blocks: Graceful degradation, error reporting

**No Offline Support:**
- Problem: App is useless without network
- Blocks: Progressive Web App capabilities

**No Test Coverage:**
- Problem: Zero test files in project
- Blocks: Safe refactoring, regression prevention

## Test Coverage Gaps

**Entire Codebase Untested:**
- What's not tested: Everything - components, API calls, utilities, state management
- Files: All files in `/Users/mg1/history-time-machine/src/`
- Risk: Any change may introduce regressions undetected
- Priority: High

**Specific High-Risk Untested Areas:**
- API key storage/retrieval logic
- Image generation with multiple providers
- Wikipedia event parsing
- Date formatting for BCE dates
- Coordinate formatting

---

*Concerns audit: 2026-01-16*
