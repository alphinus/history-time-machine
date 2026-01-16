# Codebase Structure

**Analysis Date:** 2026-01-16

## Directory Layout

```
history-time-machine/
├── .claude/                # Claude AI assistant configuration
├── .git/                   # Git repository data
├── .planning/              # GSD planning documents
│   └── codebase/           # Codebase analysis documents
├── node_modules/           # npm dependencies (gitignored)
├── src/                    # Application source code
│   ├── components/         # React components
│   │   └── HistoryTimeMachine.jsx
│   ├── App.jsx             # Root application component
│   ├── index.css           # Global styles with Tailwind
│   └── main.jsx            # React entry point
├── .gitignore              # Git ignore patterns
├── index.html              # HTML entry point (Vite)
├── package.json            # Project dependencies and scripts
├── package-lock.json       # Dependency lockfile
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.js          # Vite build configuration
```

## Directory Purposes

**`src/`:**
- Purpose: All application source code
- Contains: React components, CSS, entry point
- Key files: `main.jsx`, `App.jsx`, `index.css`

**`src/components/`:**
- Purpose: React component files
- Contains: Feature components (currently only HistoryTimeMachine)
- Key files: `HistoryTimeMachine.jsx` (1309 lines, contains entire app)

**`.planning/`:**
- Purpose: GSD planning and documentation
- Contains: Codebase analysis documents
- Key files: `codebase/ARCHITECTURE.md`, `codebase/STRUCTURE.md`

**Root directory:**
- Purpose: Configuration files and build entry points
- Contains: Package manifests, build configs, HTML entry
- Key files: `package.json`, `vite.config.js`, `index.html`

## Key File Locations

**Entry Points:**
- `index.html`: HTML shell that loads the React app
- `src/main.jsx`: React bootstrap, creates root and renders App
- `src/App.jsx`: Root React component

**Configuration:**
- `package.json`: Dependencies, scripts (dev, build, preview)
- `vite.config.js`: Vite bundler with React plugin
- `tailwind.config.js`: Tailwind content paths
- `postcss.config.js`: PostCSS with Tailwind and Autoprefixer

**Core Logic:**
- `src/components/HistoryTimeMachine.jsx`: ALL application logic including:
  - Lines 1-22: Constants (presets, category config, provider config)
  - Lines 37-85: Utility functions
  - Lines 91-117: ApiKeyStorage service
  - Lines 123-208: Wikipedia API service
  - Lines 215-438: UI subcomponents (LocationPicker, HistoryDatePicker)
  - Lines 441-634: OnThisDayPanel component
  - Lines 637-831: ApiKeySettings modal
  - Lines 834-1100: ImageGenerationPanel with API integrations
  - Lines 1106-1308: Main HistoryTimeMachine component

**Styling:**
- `src/index.css`: Tailwind directives, custom scrollbar, smooth scrolling

## Naming Conventions

**Files:**
- React components: PascalCase.jsx (e.g., `HistoryTimeMachine.jsx`)
- Entry points: lowercase.jsx (e.g., `main.jsx`, `App.jsx`)
- CSS files: lowercase.css (e.g., `index.css`)
- Config files: lowercase.config.js (e.g., `vite.config.js`)

**Directories:**
- Source directories: lowercase (e.g., `src`, `components`)
- Hidden directories: dot-prefixed (e.g., `.planning`, `.claude`)

**Components (in HistoryTimeMachine.jsx):**
- Components: PascalCase functions (e.g., `LocationPicker`, `OnThisDayPanel`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `HISTORICAL_PRESETS`, `PROVIDER_CONFIG`)
- Utility functions: camelCase (e.g., `formatCoordinate`, `generatePrompt`)
- Event handlers: handle-prefixed camelCase (e.g., `handleGeneratePrompt`)

## Where to Add New Code

**New Feature Component:**
- Create file: `src/components/FeatureName.jsx`
- Import in: `src/App.jsx` or parent component
- Follow pattern: Function component with props, useState/useEffect hooks

**New Utility Function:**
- If tightly coupled: Add to relevant component file
- If shared: Create `src/utils/` directory (does not exist yet)

**New Service/API Integration:**
- Add to relevant component file OR
- Create `src/services/` directory for extraction (does not exist yet)

**New Component Within HistoryTimeMachine:**
- Add as function component above the main export
- Follow existing pattern: function Component({ props }) { ... }

**New Styles:**
- Global styles: Add to `src/index.css`
- Component styles: Use Tailwind classes inline

**New Configuration:**
- Add constants to top of component file
- Follow existing CONFIG object pattern

## Special Directories

**`node_modules/`:**
- Purpose: npm package dependencies
- Generated: Yes (npm install)
- Committed: No (gitignored implicitly by default npm behavior)

**`.planning/`:**
- Purpose: GSD workflow documentation
- Generated: Partially (by GSD commands)
- Committed: Yes (contains architecture docs)

**`.claude/`:**
- Purpose: Claude AI assistant configuration
- Generated: Yes (by Claude setup)
- Committed: Likely yes

**`context.db*` files:**
- Purpose: Local SQLite database (appears to be context storage)
- Generated: Yes (runtime)
- Committed: No (in .gitignore would be recommended)

---

*Structure analysis: 2026-01-16*
