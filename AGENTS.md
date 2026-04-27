# Repository Guidelines

## Project Overview

This project is a Next.js + React application.

Next.js is used as the application framework and routing layer. React is used for UI implementation.

Do not treat this project as a Vite SPA. Do not use React Router. Use Next.js routing conventions.

Before using Next.js-specific APIs, inspect the existing project structure and follow current project patterns.

<!-- BEGIN:nextjs-agent-rules -->

# Next.js Version Notice

This project uses Next.js 16.2.3.

Next.js APIs, conventions, and file structure may differ from older versions. Before writing Next.js-specific routing, server component, middleware, or config code, inspect existing files and prefer current project patterns.

<!-- END:nextjs-agent-rules -->

## Project Structure & Module Organization

This repository uses Feature-Sliced Design (FSD) inside `src/`.

Layers:

- `app/` — application bootstrap, Next.js routing, providers, layouts, and global styles
- `pages/` — optional page-level composition if used by the project
- `widgets/` — composed UI blocks used on pages
- `features/` — user actions and business logic
- `entities/` — domain models and domain-specific logic
- `shared/` — reusable infrastructure, UI components, hooks, constants, utilities, and assets

Use the `@/` alias for imports instead of deep relative paths.

## FSD Layer Rules

Layers from top to bottom:

app  
pages  
widgets  
features  
entities  
shared

A layer may only import from layers below it.

Allowed examples:

pages → widgets, features, entities, shared  
widgets → features, entities, shared  
features → entities, shared  
entities → shared  
shared → shared only

Forbidden examples:

shared → entities/features/widgets/pages/app  
entities → features/widgets/pages/app  
features → widgets/pages/app  
widgets → pages/app

Never break the FSD import direction.

## Feature Structure

A typical feature should follow this structure:

````text
src/features/<feature-name>/

  ui/
    FeatureComponent.tsx

  model/
    slice.ts
    selectors.ts
    types.ts

  api/
    featureApi.ts

## Commit Message Convention

Use Conventional Commits for all commit messages:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
````

Examples:

- `feat(auth): add social login`
- `fix(api): handle empty refresh token`
- `refactor!: remove legacy session format`

Allowed types include `feat`, `fix`, `build`, `chore`, `ci`, `docs`, `perf`, `refactor`, `revert`, `style`, and `test`.

Use `BREAKING CHANGE:` in the footer, or append `!` to the type/scope, when the commit introduces a breaking API change.

## Verification

After each completed task, verify the codebase by running `pnpm build`.
