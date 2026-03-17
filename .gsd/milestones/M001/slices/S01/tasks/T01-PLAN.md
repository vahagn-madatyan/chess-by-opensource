---
estimated_steps: 6
estimated_files: 7
---

# T01: Initialize project with Vite, React, TypeScript, and Tailwind

**Slice:** S01 — Board UI
**Milestone:** M001

## Description

Set up the foundational project structure using Vite with React and TypeScript template, then configure Tailwind CSS v4 for styling. This establishes the development environment per decisions D003 (React + TypeScript + Vite) and D004 (Tailwind CSS).

## Steps

1. Run `npm create vite@latest . -- --template react-ts` to scaffold the project
2. Install Tailwind CSS v4 and the Vite plugin: `npm install -D tailwindcss @tailwindcss/vite`
3. Configure `vite.config.ts` with the Tailwind plugin and `@/` path alias
4. Create `src/index.css` with `@import "tailwindcss"` directive
5. Clean up default Vite template code (remove unused assets, simplify App.tsx)
6. Install Vitest and Testing Library for unit testing: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

## Must-Haves

- [ ] Vite dev server starts without errors (`npm run dev`)
- [ ] TypeScript compilation succeeds (`npx tsc --noEmit`)
- [ ] Build completes successfully (`npm run build`)
- [ ] Tailwind CSS classes work in components
- [ ] `@/` path alias resolves correctly
- [ ] Vitest test runner is configured and can run tests

## Verification

- `npm run dev` — Dev server starts on port 5173 with no errors
- `npx tsc --noEmit` — Zero TypeScript errors
- `npm run build` — Build completes with no errors
- `npm run test` — Test runner executes (may have zero tests initially)

## Inputs

- None — this is the first task

## Expected Output

- `package.json` — Dependencies for React, TypeScript, Vite, Tailwind, testing
- `vite.config.ts` — Vite configuration with Tailwind plugin and path alias
- `tsconfig.json` — TypeScript configuration with path mapping
- `src/index.css` — Tailwind CSS import
- `src/main.tsx` — React entry point
- `src/App.tsx` — Root component with "Chess Game" heading
- `index.html` — HTML entry point
