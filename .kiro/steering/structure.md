# Project Structure

## Top-Level Organization

```
src/
  app/              # Next.js App Router (pages)
  components/       # Shared UI components
  features/         # Feature-specific modules
  lib/              # Core utilities
  services/         # External service wrappers
  hooks/            # Custom React hooks
  data/             # Static data files
```

## App Router (`src/app/`)

- **Pages**: `page.tsx` files define routes
- **Layouts**: `layout.tsx` for shared UI structure
- **Loading/Error**: `loading.tsx`, `error.tsx` for states
- **Client Components**: Most pages use client-side rendering

Key routes:
- `/` - Home page
- `/events` - Calendar events
- `/heroes` - Community heroes recognition
- `/projects` - Project catalog
- `/projects/[id]` - Project detail
- `/interview-questions` - Q&A listing with pagination
- `/contributors` - Contributors leaderboard
- `/jobs` - Job board

## Components (`src/components/`)

- `ui/` - Shadcn components (buttons, cards, dialogs, etc.)
- `layout/` - Navbar, Footer, shared layout pieces
- `interview/` - Interview question components
  - `interview-question-card.tsx` - Question card with pipe separator
  - `interview-questions-new-client.tsx` - Main questions page
  - `question-filters.tsx` - Filter controls
- `heroes/` - Hero components
  - `hero-card.tsx` - Hero profile card
  - `hero-tier-section.tsx` - Tier grouping
  - `tier-badge.tsx` - Tier badge component
- Root level: Feature-specific shared components

## Features (`src/features/`)

Feature-based organization:

```
features/projects/
  components/
    pages/          # Page-level components
    ui/             # Feature-specific UI
  lib/
    hooks/          # Feature hooks
    services/       # Business logic
    types/          # TypeScript types/schemas
    utils.ts        # Feature utilities
```

## Libraries (`src/lib/`)

Core infrastructure:
- `data-fetcher.ts` - Fetches data from GitHub JSON
- `utils.ts` - Shared utilities (cn, date helpers)
- `env.ts` - Environment variable validation

## Services (`src/services/`)

External API wrappers:
- `github-json.ts` - Fetches interview questions from GitHub JSON
- `google-sheets.ts` - Google Sheets integration (jobs only)
- `google-calendar.ts` - Calendar events

## Data Flow

### Interview Questions
1. Build time: Fetch from `https://raw.githubusercontent.com/arcadep0156/interview-questions/main/index.json`
2. Parse JSON and extract questions
3. Render with pagination (10 per page)
4. Client-side filtering and search

### Contributors
1. Build time: Fetch from `https://raw.githubusercontent.com/arcadep0156/interview-questions/main/contributors.json`
2. Display top 3 as podium
3. Paginate remaining (10 per page)
4. Client-side search by name or GitHub username

### Auto-Rebuild
1. Interview-questions repo pushes to main
2. Trigger workflow sends repository_dispatch webhook
3. Community-website deploy workflow runs
4. Fresh data fetched at build time
5. Site deployed to GitHub Pages

## Conventions

- **Imports**: Use `@/` alias for src imports
- **Naming**: kebab-case for files, PascalCase for components
- **Types**: TypeScript interfaces for data structures
- **Styling**: Tailwind classes, use `cn()` utility for conditional classes
- **Client Components**: Mark with `'use client'` directive
- **Pagination**: 10 items per page standard
- **LinkedIn Format**: Pipe separator `Name | LinkedIn`
- **Accessibility**: Include ARIA labels, keyboard navigation

## Build Configuration

- **Output**: Static export (`output: 'export'`)
- **basePath**: `/community-website` (for GitHub Pages)
  - Remove when using custom domain
- **Images**: Unoptimized for static export
- **Data Fetching**: At build time (no runtime API calls)

## Deployment

- **Platform**: GitHub Pages
- **Workflow**: `.github/workflows/deploy.yml`
- **Triggers**:
  - Push to main
  - Hourly cron (fresh data)
  - Manual dispatch
  - Repository dispatch from interview-questions
- **CNAME**: community.trainwithshubham.com
- **Build Output**: `out/` directory
