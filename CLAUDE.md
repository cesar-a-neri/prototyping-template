---
description: 
alwaysApply: true
---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Vite development server with hot module reloading
  - **IMPORTANT**: Before starting a new dev server, always check if one is already running with `lsof -i :5173` or `ps aux | grep "npm run dev"`
  - If a dev server is already running, do not start a new one unless explicitly requested
  - The default port is 5173
- **Build**: `npm run build` - TypeScript compilation followed by Vite build
- **Lint**: `npm run lint` - Run ESLint on the codebase
- **Preview**: `npm run preview` - Preview the built application

## Architecture Overview

This is a React + TypeScript + Vite prototyping application designed for building and testing UI prototypes with a modular architecture.

### Key Architectural Patterns

**Dynamic Prototype System**
- Prototypes are auto-discovered using Vite's `import.meta.glob` pattern in `src/utils/prototypes.ts`
- Each prototype must export a `route` and optionally a `title` to be automatically included in navigation
- Prototypes are lazy-loaded for optimal performance

**Provider Pattern Architecture**
- `ThemeProvider` (`src/lib/theme/`) - Centralized theme management with CSS custom properties
- `ConfigProvider` (`src/lib/config/`) - Runtime configuration system for prototype controls
- Context providers follow consistent patterns for state management

**Configuration System**
- Prototypes can define runtime configuration via `PrototypeConfig` objects
- Configuration controls are dynamically rendered in the left-hand sidebar and persisted to localStorage
- Located in `src/lib/config/` with TypeScript type safety
- Example usage:
  ```typescript
  import { usePrototypeConfig, PrototypeConfig } from '@/lib/config';

  const myConfig: PrototypeConfig = {
      prototypeId: 'my-prototype',
      title: 'My Prototype Configuration',
      controls: [
          {
              id: 'myToggle',
              type: 'boolean',
              label: 'Enable Feature',
              description: 'Toggle this feature on/off',
              defaultValue: false
          },
          {
              id: 'myText',
              type: 'text',
              label: 'Custom Text',
              description: 'Enter custom text',
              defaultValue: '',
              placeholder: 'Type here...'
          },
          {
              id: 'myDropdown',
              type: 'dropdown',
              label: 'Select Option',
              description: 'Choose an option',
              defaultValue: 'option1',
              options: [
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' }
              ]
          },
          {
              id: 'myNumber',
              type: 'number',
              label: 'Count',
              description: 'A numeric value',
              defaultValue: 10,
              min: 1,
              max: 100,
              step: 1
          }
      ]
  };

  // Inside your component:
  const { getValue } = usePrototypeConfig(myConfig);
  const myToggle = getValue<boolean>('myToggle', false);
  const myText = getValue<string>('myText', '');
  const myDropdown = getValue<string>('myDropdown', 'option1');
  ```

### Directory Structure

```
src/
├── lib/              # Core libraries and providers
│   ├── config/       # Runtime configuration system
│   └── theme/        # Theme management and CSS variables
├── components/       # Shared React components
│   └── ui/          # Reusable UI components (Radix-based)
├── pages/           # Route-based pages
│   └── prototypes/  # Individual prototype implementations
└── utils/           # Utility functions and helpers
```

### Prototype Development

**Creating New Prototypes**
1. Create directory in `src/pages/prototypes/[name]/`
2. Export `route` and optionally `title` from index.tsx
3. Use the configuration system for runtime controls if needed
4. Follow existing component patterns for consistency

**Styling Approach**
- Tailwind CSS for utility-first styling
- CSS custom properties for theme variables
- Component-specific styles in separate files when complex
- **Color system**: Uses Radix Colors 12-point scale (1-12) instead of standard Tailwind increments (50, 100, 200, etc.)
  - Example: `bg-gray-3`, `text-blue-11` rather than `bg-gray-300`, `text-blue-500`
  - Scale goes from 1 (lightest) to 12 (darkest) for semantic color progression
  - **No opacity shorthand**: The `/percent` syntax (e.g., `bg-gray-3/50`) is not available; use explicit opacity utilities instead

### Import Path Configuration

- `@/` alias points to `src/` directory (configured in vite.config.ts)
- Use absolute imports for better maintainability

### Tech Stack

- **React 19** with TypeScript for component development
- **Vite** for build tooling and development server
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **Radix UI** for accessible component primitives
- **Lucide React** for icons

### Navigation

- **Command palette**: `⌘K` / `Ctrl+K` opens a prototype switcher overlay (`src/components/CommandPalette.tsx`)
- The app redirects `/` to the first discovered prototype route

### Source Code Viewer

Every prototype automatically gets a source code viewer. The `SourceCodeModal` component (`src/components/SourceCodeModal.tsx`) is wired up via `prototypeSourceModules` in `src/utils/prototypes.ts` — all files in a prototype's directory are bundled as raw strings and made available at runtime.

### Theme System

Semantic CSS custom properties (`--background`, `--primary`, `--border`, etc.) are defined in `src/lib/theme/theme.ts` using Radix Colors and injected by `ThemeProvider`. All Radix color scales are also available as CSS variables (e.g., `var(--blue-9)`, `var(--iris-a3)`). Use `useTheme()` from `@/lib/theme` to read or toggle the current theme mode.

## Deployment Target: Vercel
This project is deployed on Vercel. All code must be Vercel-compatible:

- Use Vercel serverless functions (not long-running servers)
- API routes go in `/api` directory (or `app/api` for Next.js App Router)
- No unsupported Node.js APIs (e.g. no `fs` writes outside `/tmp`)
- Environment variables must be configured in Vercel dashboard
- Edge Runtime constraints apply where relevant
- Build output must be compatible with Vercel's build system
- Avoid dependencies that require native binaries unless Vercel supports them
