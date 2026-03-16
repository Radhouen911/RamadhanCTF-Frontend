# Ramadhan CTFd Theme

This repository contains the React + Vite frontend used as the **Ramadhan theme for CTFd**. It is a single-page application mounted inside the CTFd theme system and synced into the theme templates during build.

The project is designed to work with a live CTFd backend and supports real event data for challenges, teams, scoreboard, profiles, notifications, and dynamic container-based challenges.

It also includes **Archive Mode** for displaying static CTF event data from exported JSON files without requiring a live backend.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Motion / animated UI components
- CTFd REST API integration
- Recharts for data visualization

## Implemented Features

### Core pages

- Landing page
- Login / register flow
- Challenges page
- Scoreboard page
- Teams page
- Team management page
- User profile pages
- Public user / team profile pages
- Team detail view (archive mode)

### CTFd integrations

- Real challenge loading from `/api/v1/challenges`
- Detailed challenge fetch from `/api/v1/challenges/:id`
- Flag submission via `/api/v1/challenges/attempt`
- Team management using CTFd-compatible web/API endpoints
- User, team, awards, and solve history support
- Notification system backed by CTFd notifications API

### Archive Mode

Static archive mode allows displaying complete CTF event data from exported JSON files without a live backend.

**Archive Data Source**: `/Ramadan CTF.2026-03-16_16_02_07/db/`

**Supported JSON Files**:

- `teams.json` - Team information
- `users.json` - User profiles and team membership
- `challenges.json` - Challenge metadata and descriptions
- `solves.json` - Team solve history with timestamps
- `files.json` - Challenge file attachments

**Archive Features**:

- **Scoreboard**: Displays ranked teams with calculated scores from solves
- **Teams Page**: Lists all participating teams with member counts
- **Team Detail View**: Shows individual team profile with:
  - Team members and their emails
  - Solve history with challenge names and point values
  - Cumulative score progress chart
  - Team statistics (rank, total score, member count)
- **Challenges**: Displays all challenges with file downloads
- **Data Caching**: All archive data is cached after first load for performance

**Archive Data Loader** (`src/services/archiveDataLoader.ts`):

- `loadArchiveTeams()` - Fetches and ranks teams by calculated score
- `loadArchiveSolves()` - Fetches team solve history
- `loadArchiveChallenges()` - Fetches challenge metadata
- `getTeamDetail(teamId)` - Fetches complete team profile with members and solves
- `getArchiveScoreboard()` - Fetches ranked scoreboard data

**Archive Pages**:

- `src/app/pages/Scoreboard.tsx` - Uses archive data for static scoreboard
- `src/app/pages/Teams.tsx` - Uses archive data for team listings (scores hidden)
- `src/app/pages/PublicTeamProfile.tsx` - Dynamic team detail view from URL params

### Notifications

- Shared notification state via React context
- Bell panel and toast notifications
- API-based notification sync using `/api/v1/notifications?since_id=...`
- SSE listener support for CTFd event streams
- Slim custom hover-only scrollbar in the notification panel

### Visibility / dark hour support

The frontend now respects CTFd visibility configuration dynamically.

- `challenge_visibility`
- `account_visibility`
- `score_visibility`
- `registration_visibility`

This enables **dark hour** behavior without custom frontend scheduling logic:

- when `score_visibility = hidden`, scoreboard and solve-related data are hidden for non-admin users
- public and personal solve views respect score visibility
- teams ranking/score displays also respect score visibility

### CTFd-Whale container challenges

The current frontend supports **Whale / dynamic container challenges**.

- Detects container-capable challenge types from CTFd challenge metadata
- Checks current container status
- Spawns challenge containers
- Renews active containers
- Stops active containers
- Displays returned access info (URL or command)

Supported Whale endpoints:

- `GET /api/v1/plugins/ctfd-whale/container?challenge_id=<id>`
- `POST /api/v1/plugins/ctfd-whale/container?challenge_id=<id>`
- `PATCH /api/v1/plugins/ctfd-whale/container?challenge_id=<id>`
- `DELETE /api/v1/plugins/ctfd-whale/container`

## Local Development

```bash
npm install
npm run dev
```

Default Vite dev URL:

- `http://localhost:5173`

### Archive Mode Testing

To test archive mode locally, ensure the archive data directory exists:

```
/Ramadan CTF.2026-03-16_16_02_07/db/
```

The archive data loader will automatically use static JSON files from this directory when available.

## Production Build

```bash
npm run build
```

Build behavior:

- outputs compiled assets into `static/assets`
- updates `templates/base.html` with the latest generated asset filenames
- keeps the theme ready for direct use by CTFd

## Deployment

This repo includes a GitHub Actions workflow that deploys the theme to the server.

Current deploy flow:

- connects to the server over SSH
- ensures the theme repo exists on the target machine
- force-syncs the repo to `origin/main`
- runs `npm ci`
- runs `npm run build`
- restarts the CTFd container

The workflow intentionally uses:

```bash
git fetch origin main
git reset --hard origin/main
git clean -fd
```

This avoids deployment failures caused by tracked generated files like `templates/base.html` being modified on the server after build.

## Docker

A `Dockerfile` is included for consistent local or CI builds.

```bash
docker build -t ramadhan-ctfd-theme .
docker run --rm -p 8080:80 ramadhan-ctfd-theme
```

## Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   ├── context/             # React context (auth, config, notifications)
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   └── routes.ts            # Route definitions
├── services/
│   ├── archiveDataLoader.ts # Static archive data loading
│   └── ctfdApi.ts           # CTFd API client
├── styles/                  # Global styles and theme
└── utils/                   # Utility functions
```

## Project Notes

- The app is a CTFd theme, not a standalone backend
- Generated asset references are synced into `templates/base.html`
- Most data is loaded live from CTFd rather than hardcoded
- Archive mode provides a fallback for displaying static event data
- `oldArcade/` is preserved as a legacy reference implementation

## Contact

The theme includes a public contact page for the creator:

- route: `/angel`
- Discord ID: `angel.911`

## Repository Goal

Provide a polished Ramadhan-themed frontend for CTFd with modern UX while staying compatible with real CTFd behavior, admin visibility settings, container-based challenge workflows, and static archive event data.
