# Contributing & Collaboration Guide

This project is designed for collaborative development between Leo, AI assistants (Chip, Claude, etc.), and any future contributors. Follow this workflow to keep changes organized and reviewable.

---

## Branch Strategy

```
main                    ← Production-ready code (protected)
  ├── dev               ← Integration branch for testing
  │   ├── feature/xxx   ← New features
  │   ├── fix/xxx       ← Bug fixes
  │   └── qa/xxx        ← QA and testing improvements
  └── hotfix/xxx        ← Urgent production fixes
```

### Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/short-description` | `feature/shopify-live-sync` |
| Bug Fix | `fix/short-description` | `fix/kpi-loading-state` |
| QA/Testing | `qa/short-description` | `qa/visual-regression` |
| Hotfix | `hotfix/short-description` | `hotfix/server-crash` |
| AI Session | `ai/assistant-name/date` | `ai/chip/2025-02-15` |

### Rules
1. **Never push directly to `main`** — always use Pull Requests
2. **`dev` branch** is the integration point — merge features here first
3. **`main`** only gets updates via PR from `dev` after testing
4. **AI assistants** should create branches prefixed with `ai/` for traceability

---

## Workflow for AI Assistants (Chip, Claude, etc.)

### Starting a Session
```bash
git clone https://github.com/YOUR_USERNAME/ecommerce-dashboard.git
cd ecommerce-dashboard
git checkout dev
git pull origin dev
git checkout -b ai/chip/2025-02-15-fix-charts
```

### Making Changes
1. Make changes to code
2. Test: `cd client && npx vite build` (must pass clean)
3. Test server: `cd server && node index.js` (must start without errors)
4. Commit with clear messages describing what changed and why

### Submitting Changes
```bash
git push origin ai/chip/2025-02-15-fix-charts
# Then create a PR to dev branch
gh pr create --base dev --title "Fix chart rendering issues" --body "Description of changes"
```

### Session Handoff Notes
When finishing a session, always leave a comment on the PR or in the commit message with:
- What was done
- What's left to do
- Any known issues
- Which files were modified

---

## Workflow for Leo (Owner)

### Reviewing AI Changes
1. Check PRs on GitHub
2. Review the diff
3. Test locally if needed:
   ```bash
   git fetch origin
   git checkout ai/chip/2025-02-15-fix-charts
   ./start.sh
   ```
4. Merge to `dev` if approved
5. When `dev` is stable, merge to `main`

### Quick Fixes in Cowork
If you're working with Claude in Cowork:
```bash
git checkout -b fix/quick-description
# Claude makes changes
git add -A && git commit -m "Fix: description"
git push origin fix/quick-description
# Create PR or merge directly if simple
```

---

## Commit Message Format

```
<type>: <short description>

<optional body explaining why, not what>

Co-Authored-By: <assistant-name> <noreply@anthropic.com>
```

### Types
- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code restructuring without behavior change
- `style:` — CSS/formatting changes
- `docs:` — Documentation updates
- `test:` — Adding or updating tests
- `chore:` — Build/config changes

### Examples
```
feat: add real-time Shopify order sync

Connects to Shopify Admin API and syncs orders every 15 minutes.
Falls back to mock data if credentials are missing.

Co-Authored-By: Chip <noreply@anthropic.com>
```

```
fix: KPI cards showing loading state permanently

isLoading was checking the wrong property on the store.
Added defensive checks for when isLoading is undefined.

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Project Context for AI Assistants

When starting a new session, read these files first to understand the project:

1. **`README.md`** — Overview, architecture, tech stack
2. **`PRD.md`** — Full product requirements and feature specs
3. **`CONTRIBUTING.md`** — This file (workflow and conventions)
4. **Current status** — Check the "Current Status" table in README.md
5. **Open issues/PRs** — `gh issue list` and `gh pr list`

### Key Architecture Decisions
- State management: Zustand (not Redux) — 7 slices in `client/src/store/`
- Charts: Recharts (not D3 directly) — components in `client/src/components/charts/`
- Forecasting: Pure JS, no ML backend — algorithms in `client/src/utils/forecast.js`
- Database: sql.js WASM (not better-sqlite3) — no native compilation
- AI Chat: Multi-provider via BYOK — service in `server/services/aiChat.js`

### Testing Changes
Before committing, always verify:
```bash
# Client builds clean
cd client && npx vite build

# Server starts without errors
cd server && node index.js
# Should see: [Server] Running on http://localhost:4000

# Full app runs
cd .. && ./start.sh
# Open http://localhost:3000 (or whatever port Vite reports)
```

---

## File Ownership

| Area | Primary Files | Notes |
|------|--------------|-------|
| KPI Dashboard | `components/kpi/`, `pages/DashboardPage.jsx` | 6 KPI cards + 7 charts |
| Forecasting | `components/forecast/`, `utils/forecast.js`, `utils/budgetOptimizer.js` | Pure JS algorithms |
| API Layer | `server/services/`, `server/routes/` | One service file per platform |
| State | `store/useStore.js`, `store/slices/` | 7 Zustand slices |
| Layout | `components/layout/` | TopNav, FilterBar, Sidebar, DashboardLayout |
| AI Chat | `components/ai/`, `server/services/aiChat.js` | Multi-provider |
| Code Editor | `components/editor/` | Sandboxed execution |
| Styling | `index.css` | CSS variables + glass-morphism |
