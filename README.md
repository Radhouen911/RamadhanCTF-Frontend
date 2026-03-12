# Ramadhan CTFd Theme

This repository contains the React + Vite frontend used as the **Ramadhan theme for CTFd**. It is a single-page application mounted inside the CTFd theme system and synced into the theme templates during build.

The project is designed to work with a live CTFd backend and supports real event data for challenges, teams, scoreboard, profiles, notifications, and dynamic container-based challenges.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Motion / animated UI components
- CTFd REST API integration

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

### CTFd integrations

- Real challenge loading from `/api/v1/challenges`
- Detailed challenge fetch from `/api/v1/challenges/:id`
- Flag submission via `/api/v1/challenges/attempt`
- Team management using CTFd-compatible web/API endpoints
- User, team, awards, and solve history support
- Notification system backed by CTFd notifications API

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

## Project Notes

- The app is a CTFd theme, not a standalone backend
- Generated asset references are synced into `templates/base.html`
- Most data is loaded live from CTFd rather than hardcoded
- `oldArcade/` is preserved as a legacy reference implementation

## Contact

The theme includes a public contact page for the creator:

- route: `/angel`
- Discord ID: `angel.911`

## Repository Goal

Provide a polished Ramadhan-themed frontend for CTFd with modern UX while staying compatible with real CTFd behavior, admin visibility settings, and container-based challenge workflows.
