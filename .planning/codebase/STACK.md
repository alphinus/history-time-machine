# Technology Stack

**Analysis Date:** 2026-01-16

## Languages

**Primary:**
- JavaScript (ES6+) - All source code uses modern JS with JSX syntax

**Secondary:**
- CSS - Tailwind utility classes + custom CSS in `src/index.css`
- HTML - Single entry point in `index.html`

## Runtime

**Environment:**
- Node.js v22.12.0

**Package Manager:**
- npm v10.9.0
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- React ^18.2.0 - UI library, uses functional components with hooks
- Vite ^5.1.0 - Build tool and development server

**Styling:**
- Tailwind CSS ^3.4.1 - Utility-first CSS framework
- PostCSS ^8.4.35 - CSS transformation pipeline
- Autoprefixer ^10.4.18 - Vendor prefix automation

**Build/Dev:**
- @vitejs/plugin-react ^4.2.1 - React integration for Vite

## Key Dependencies

**Critical (Runtime):**
- `react` ^18.2.0 - Core UI framework
- `react-dom` ^18.2.0 - React DOM bindings

**Dev Dependencies:**
- `vite` ^5.1.0 - Fast HMR development server, production bundler
- `tailwindcss` ^3.4.1 - Styling
- `postcss` ^8.4.35 - CSS processing
- `autoprefixer` ^10.4.18 - Browser compatibility

## Configuration

**Vite Configuration:** `vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
})
```

**Tailwind Configuration:** `tailwind.config.js`
```javascript
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: { extend: {} },
    plugins: [],
}
```

**PostCSS Configuration:** `postcss.config.js`
```javascript
export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
}
```

**Environment:**
- No `.env` file detected
- API keys stored in browser localStorage (client-side only)
- No server-side environment configuration

**Build Commands:**
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Platform Requirements

**Development:**
- Node.js v18+ (using v22.12.0)
- Modern browser with ES modules support

**Production:**
- Static file hosting (Vercel-ready per `.gitignore`)
- No server-side runtime required
- Browser with JavaScript enabled

## Module System

**Type:** ES Modules (`"type": "module"` in package.json)
- All config files use ESM syntax
- Source files use ES6 import/export

---

*Stack analysis: 2026-01-16*
