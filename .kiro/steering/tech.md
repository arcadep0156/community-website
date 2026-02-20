# Tech Stack

## Framework & Runtime

- **Next.js 15** (App Router) with React 18
- **TypeScript 5** (strict mode enabled)
- **Node.js** (ES2017 target)
- **Static Export** for GitHub Pages deployment

## UI & Styling

- **Tailwind CSS** with custom design tokens (HSL-based color system)
- **Shadcn/ui** components (Radix UI primitives)
- **Lucide React** for icons
- **next-themes** for dark mode
- Monospace font: Source Code Pro

## State & Data

- **Server-side data fetching** at build time
- **React Hook Form** + Zod for forms and validation
- **Client-side state** with React hooks

## External Services

- **GitHub API** (Octokit for project metadata and interview questions JSON)
- **Google Calendar API** (events)
- **Google Sheets API** (jobs data)

## Data Sources

- **Interview Questions**: JSON from https://github.com/arcadep0156/interview-questions
  - Fetched at build time from raw.githubusercontent.com
  - Schema validation with meta/schema.json
  - Auto-rebuild on repo updates via repository_dispatch
- **Contributors**: JSON from interview-questions/contributors.json
- **Projects**: GitHub repositories with metadata
- **Events**: Google Calendar API
- **Jobs**: Google Sheets

## Dev Tools

- **Turbopack** for fast dev builds
- **Husky** + **Commitizen** for commit conventions
- **Commitlint** for enforcing Conventional Commits
- **Super-Linter** for code quality (GitHub Actions)

## Common Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Production static export
npm run lint             # ESLint check

# Commits
npm run commit           # Interactive Commitizen prompt
```

## Build Configuration

- Path alias: `@/*` maps to `./src/*`
- Static export: `output: 'export'`
- basePath: `/community-website` (for GitHub Pages)
  - Remove when using custom domain
- Image optimization: unoptimized for static export
- Bundle splitting: vendors, UI components separated

## Deployment

- **Platform**: GitHub Pages
- **Workflow**: `.github/workflows/deploy.yml`
- **Triggers**: 
  - Push to main
  - Hourly cron (fresh data)
  - Manual dispatch
  - Repository dispatch from interview-questions repo
- **Build**: Static export to `out/` directory
- **CNAME**: community.trainwithshubham.com
