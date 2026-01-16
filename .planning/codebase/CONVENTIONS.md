# Coding Conventions

**Analysis Date:** 2026-01-16

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `HistoryTimeMachine.jsx`)
- Entry files: lowercase (e.g., `main.jsx`, `index.css`)
- Config files: lowercase with dots (e.g., `vite.config.js`, `tailwind.config.js`)

**Functions:**
- React components: PascalCase (e.g., `LocationPicker`, `OnThisDayPanel`)
- Utility functions: camelCase (e.g., `formatCoordinate`, `generatePrompt`)
- Event handlers: `handle` prefix with camelCase (e.g., `handleUpdate`, `handleCopy`)

**Variables:**
- State variables: camelCase (e.g., `coordinates`, `isLoading`, `generatedPrompt`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `HISTORICAL_PRESETS`, `PROVIDER_CONFIG`)
- Boolean state: `is` prefix (e.g., `isLoading`, `isGenerating`, `isBCE`)

**Types/Constants:**
- Configuration objects: SCREAMING_SNAKE_CASE
- Object keys: camelCase

## Code Style

**Formatting:**
- No dedicated formatter configured (Prettier, etc.)
- Indentation: 2 spaces in JSX, 4 spaces in config files (inconsistent)
- Semicolons: Used in `.jsx` files
- Quotes: Single quotes for strings in JS, double quotes for JSX attributes

**Linting:**
- No ESLint or linting tool configured
- Relies on Vite's built-in error checking

## Import Organization

**Order:**
1. React and React hooks (`import React, { useState, useEffect, useCallback } from 'react'`)
2. Local components and utilities (same file - no separate imports)

**Path Aliases:**
- None configured
- Relative paths used (`./components/HistoryTimeMachine`)

## Error Handling

**Patterns:**
- Try-catch blocks wrap async operations:
```jsx
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  // ... success handling
} catch (err) {
  console.error('Error:', err);
  setError(err.message || 'Failed to generate image');
}
```
- Error state stored in component state (`setError`)
- Error messages displayed in red-styled UI blocks
- Fallback chains for API calls (try multiple models in sequence)

**API Error Handling:**
- Check `response.ok` before parsing JSON
- Extract error messages from API response bodies
- Log errors to console with `console.error`

## Logging

**Framework:** Browser console (`console.log`, `console.error`, `console.warn`)

**Patterns:**
- `console.error` for caught exceptions
- `console.warn` for non-fatal issues (e.g., quota exceeded, trying next model)
- No structured logging framework

## Comments

**When to Comment:**
- Section dividers using comment blocks:
```jsx
// ============================================
// SECTION NAME
// ============================================
```
- Brief inline comments for non-obvious logic
- Emoji annotations for providers (e.g., `// 🍌 NANO BANANA`)

**JSDoc/TSDoc:**
- Not used (no TypeScript, no JSDoc)

## Function Design

**Size:**
- Utility functions: 5-30 lines
- React components: 50-300 lines (larger components could be split)

**Parameters:**
- Destructured props for React components:
```jsx
function LocationPicker({ coordinates, isLoading, error, onRequestLocation, onManualInput })
```

**Return Values:**
- Components return JSX
- Utility functions return primitive values or objects

## Module Design

**Exports:**
- Default exports for React components (`export default function ComponentName`)
- Named exports not used (single-file architecture)

**Barrel Files:**
- Not used

## Component Architecture

**Pattern:** Single-file components with inline styles via Tailwind CSS

**State Management:**
- React hooks (`useState`, `useEffect`, `useCallback`)
- No external state library (Redux, Zustand, etc.)
- State lifted to parent component when needed

**Props Pattern:**
- Callback props prefixed with `on` (e.g., `onDateChange`, `onSelectEvent`)
- Boolean props without `is` prefix in prop name (e.g., `isLoading` state passed as `isLoading` prop)

## CSS/Styling Conventions

**Framework:** Tailwind CSS

**Patterns:**
- Inline className strings with Tailwind utilities
- Conditional classes using template literals:
```jsx
className={`px-3 py-1.5 ${isActive ? 'bg-amber-600' : 'bg-slate-600'}`}
```
- Long class strings broken across multiple lines with indentation

**Color Palette:**
- Primary: slate (backgrounds), amber/orange (CTAs), purple/pink (gradients)
- Status colors: green (success), red (error), blue (interactive)

## API Integration Patterns

**Fetch Pattern:**
```jsx
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify(payload),
});
```

**Storage Pattern:**
- localStorage for persistent data (API keys)
- Base64 encoding for sensitive values (basic obfuscation, not security)

---

*Convention analysis: 2026-01-16*
