# Architecture

**Analysis Date:** 2026-01-16

## Pattern Overview

**Overall:** Single-Page Application (SPA) with Component-Based Architecture

**Key Characteristics:**
- React-based client-side only application (no backend)
- Single monolithic feature component containing all business logic
- External API integrations for data and image generation
- LocalStorage-based persistence for API keys
- No routing (single view application)

## Layers

**Entry Layer:**
- Purpose: Bootstrap React application into the DOM
- Location: `src/main.jsx`
- Contains: React root creation, StrictMode wrapper, global CSS import
- Depends on: React, ReactDOM, App component, index.css
- Used by: `index.html`

**Application Shell:**
- Purpose: Thin wrapper that renders the main feature
- Location: `src/App.jsx`
- Contains: Single import and render of HistoryTimeMachine
- Depends on: HistoryTimeMachine component
- Used by: main.jsx

**Feature Layer (Monolithic):**
- Purpose: All application logic, UI components, services, and utilities
- Location: `src/components/HistoryTimeMachine.jsx`
- Contains:
  - Constants (HISTORICAL_PRESETS, CATEGORY_CONFIG, PROVIDER_CONFIG)
  - Utility functions (formatCoordinate, formatHistoricalDate, generatePrompt)
  - Service objects (ApiKeyStorage, fetchOnThisDay, parseWikipediaEvents)
  - UI Components (LocationPicker, HistoryDatePicker, OnThisDayPanel, ApiKeySettings, ImageGenerationPanel)
  - Main component (HistoryTimeMachine)
- Depends on: React (useState, useEffect, useCallback)
- Used by: App.jsx

**Styling Layer:**
- Purpose: Global styles and Tailwind CSS configuration
- Location: `src/index.css`, `tailwind.config.js`, `postcss.config.js`
- Contains: Tailwind directives, custom scrollbar styles, smooth scrolling
- Depends on: Tailwind CSS
- Used by: All components via className props

## Data Flow

**Location Acquisition:**

1. User clicks "Use My Current Location" button
2. `requestLocation()` callback invokes `navigator.geolocation.getCurrentPosition()`
3. On success, `setCoordinates()` updates state with lat/lng
4. LocationPicker displays formatted coordinates

**Historical Date Selection:**

1. User selects preset button OR enters manual date
2. `onDateChange()` callback updates `date` state in parent
3. Date change triggers `useEffect` in OnThisDayPanel
4. `fetchOnThisDay()` calls Wikipedia API
5. `parseWikipediaEvents()` transforms response into events array
6. Events render in scrollable list

**Prompt Generation:**

1. User clicks "Create Time Travel Prompt" (requires coordinates + date)
2. `handleGeneratePrompt()` calls `generatePrompt(coordinates, date)`
3. OR user clicks "Use for image generation" on a Wikipedia event
4. `handleSelectEvent()` calls `generateEventPrompt(event, coordinates)`
5. Prompt displays in text area with copy button

**Image Generation:**

1. User clicks "Generate Image" with a prompt
2. `handleGenerate()` determines provider (auto or manual selection)
3. Provider-specific API call:
   - Pollinations: Simple GET request via URL encoding
   - Gemini/Nano Banana: POST to generativelanguage.googleapis.com
   - OpenAI: POST to api.openai.com/v1/images/generations
4. Response parsed for image URL or base64 data
5. Image displays with download button

**State Management:**
- React useState hooks at component level
- No global state management (Redux, Context)
- API keys persisted to localStorage via ApiKeyStorage utility

## Key Abstractions

**Provider Configuration:**
- Purpose: Define image generation providers with metadata
- Examples: `PROVIDER_CONFIG` object in `src/components/HistoryTimeMachine.jsx`
- Pattern: Configuration object with name, icon, color, keyType, model

**Date Representation:**
- Purpose: Represent historical dates including BCE
- Examples: `{ year: 44, month: 3, day: 15, hour: 11, isBCE: true }`
- Pattern: Plain object with year, month, day, hour, isBCE properties

**Wikipedia Event:**
- Purpose: Normalized event from Wikipedia API
- Examples: Events from `parseWikipediaEvents()` function
- Pattern: Object with id, text, year, category, wikipediaUrl, thumbnail

**API Key Storage:**
- Purpose: Secure-ish storage of API keys in browser
- Examples: `ApiKeyStorage` object in `src/components/HistoryTimeMachine.jsx`
- Pattern: Service object with saveKey, getKey, removeKey, hasKey methods

## Entry Points

**Browser Entry:**
- Location: `index.html`
- Triggers: Browser page load
- Responsibilities: Load React app via Vite module script

**React Entry:**
- Location: `src/main.jsx`
- Triggers: Module script execution
- Responsibilities: Create React root, render App with StrictMode

**Build Entry:**
- Location: `vite.config.js`
- Triggers: npm scripts (dev, build, preview)
- Responsibilities: Configure Vite with React plugin

## Error Handling

**Strategy:** Local try-catch with state-based error display

**Patterns:**
- Geolocation errors: Error codes mapped to user messages in `requestLocation()`
- API errors: Caught in async handlers, set to `error` state, displayed in UI
- Quota exhaustion: Fallback chain tries multiple Gemini models before failing
- Clipboard errors: Fallback to deprecated `document.execCommand('copy')`

## Cross-Cutting Concerns

**Logging:** Console.error for API failures, console.warn for quota issues
**Validation:** Manual input validation for coordinates (range checks) and dates
**Authentication:** API key management via localStorage with base64 encoding (not secure encryption)

---

*Architecture analysis: 2026-01-16*
