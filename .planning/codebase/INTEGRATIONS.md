# External Integrations

**Analysis Date:** 2026-01-16

## APIs & External Services

**Wikipedia/Wikimedia API:**
- Service: Wikimedia "On This Day" feed
- Purpose: Fetch historical events, births, deaths, holidays for a given date
- Endpoint: `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/{MM}/{DD}`
- Auth: None required (public API)
- Implementation: `src/components/HistoryTimeMachine.jsx` lines 123-137

**Google Gemini API (Image Generation):**
- Service: Google Generative AI / Gemini
- Purpose: AI image generation ("Nano Banana" feature)
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- Models attempted (fallback chain):
  - `gemini-2.5-flash-image`
  - `gemini-2.0-flash-image`
  - `imagen-3.0-fast-generate-001`
  - `gemini-3-pro-image-preview` (Pro tier)
  - `gemini-3-pro-image` (Pro tier)
- Auth: API key via `x-goog-api-key` header
- Env var name: Stored as `htm_apikey_gemini` in localStorage (base64 encoded)
- Implementation: `src/components/HistoryTimeMachine.jsx` lines 884-951

**OpenAI API (DALL-E 3):**
- Service: OpenAI DALL-E 3 image generation
- Purpose: Premium image generation option
- Endpoint: `https://api.openai.com/v1/images/generations`
- Model: `dall-e-3`
- Auth: Bearer token in Authorization header
- Env var name: Stored as `htm_apikey_openai` in localStorage (base64 encoded)
- Implementation: `src/components/HistoryTimeMachine.jsx` lines 953-986

**Pollinations.ai (Free Backup):**
- Service: Pollinations.ai image generation
- Purpose: Free fallback image generation (no API key required)
- Endpoint: `https://image.pollinations.ai/prompt/{encoded_prompt}`
- Model: `flux`
- Auth: None required (free unlimited access)
- Implementation: `src/components/HistoryTimeMachine.jsx` lines 871-881

## Data Storage

**Databases:**
- None (client-side only application)
- Note: `context.db` files in root are SQLite but not part of application

**Browser Storage:**
- localStorage for API key persistence
- Storage prefix: `htm_apikey_`
- Keys stored: `openai`, `gemini`
- Implementation: `src/components/HistoryTimeMachine.jsx` lines 91-117 (ApiKeyStorage module)

**File Storage:**
- None (no file uploads or server storage)

**Caching:**
- None (no explicit caching layer)

## Authentication & Identity

**Auth Provider:**
- None (no user authentication)
- API keys are user-provided and stored locally

**API Key Management:**
```javascript
// Storage pattern from src/components/HistoryTimeMachine.jsx
const ApiKeyStorage = {
  saveKey: (keyType, apiKey) => {
    const encoded = btoa(apiKey);
    localStorage.setItem(`${STORAGE_PREFIX}${keyType}`, encoded);
  },
  getKey: (keyType) => {
    const encoded = localStorage.getItem(`${STORAGE_PREFIX}${keyType}`);
    return encoded ? atob(encoded) : null;
  },
  // ...
};
```

## Monitoring & Observability

**Error Tracking:**
- None (console.error only)

**Logs:**
- `console.error` for API failures
- `console.warn` for quota/fallback messaging

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from `.vercel` in `.gitignore`)
- Static SPA deployment

**CI Pipeline:**
- None detected (no CI config files)

## Environment Configuration

**Required env vars:**
- None required (all configuration is client-side)

**User-provided API keys (optional):**
| Key Type | Purpose | Get Key URL |
|----------|---------|-------------|
| `gemini` | Enables Nano Banana + Gemini image gen | https://aistudio.google.com/apikey |
| `openai` | Enables DALL-E 3 image gen | https://platform.openai.com/api-keys |

**Secrets location:**
- Browser localStorage (base64 encoded, not encrypted)
- No server-side secrets

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Browser APIs Used

**Geolocation API:**
- Purpose: Get user's current location for prompt generation
- Implementation: `src/components/HistoryTimeMachine.jsx` lines 1124-1152
- Permissions: Requires user consent

**Clipboard API:**
- Purpose: Copy generated prompts
- Implementation: `src/components/HistoryTimeMachine.jsx` lines 1172-1189
- Fallback: `document.execCommand('copy')` for older browsers

## Provider Hierarchy

Image generation follows this fallback order:
1. **Nano Banana** (Gemini 2.0 Flash Exp) - Free tier with Gemini key
2. **DALL-E 3** - If OpenAI key provided
3. **Pollinations** - Always available, no key needed

```javascript
// From src/components/HistoryTimeMachine.jsx
const PROVIDER_CONFIG = {
  nanobanana: { name: 'Nano Banana (Free Tier)', keyType: 'gemini', model: 'gemini-2.0-flash-exp' },
  gemini3: { name: 'Nano Banana Pro', keyType: 'gemini', model: 'gemini-3-pro-image-preview' },
  pollinations: { name: 'Pollinations (Backup)', keyType: null, model: 'flux' },
  openai: { name: 'DALL-E 3', keyType: 'openai', model: 'dall-e-3' },
};
```

---

*Integration audit: 2026-01-16*
