# Ramadhan CTFd Theme

This repository contains the React + Vite frontend used as the **Ramadhan theme for CTFd**. It is a single-page application mounted inside the CTFd theme system.

## Archive Mode Preview

View the archived Ramadhan CTF 2026 event: **[https://radhouen911.github.io/RamadhanCTF-Frontend/teams](https://radhouen911.github.io/RamadhanCTF-Frontend/)**

The archive includes all challenges, teams, and scoreboard data from the event.

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

The frontend respects CTFd visibility configuration dynamically.

- `challenge_visibility`
- `account_visibility`
- `score_visibility`
- `registration_visibility`

This enables **dark hour** behavior:

- when `score_visibility = hidden`, scoreboard and solve-related data are hidden for non-admin users
- public and personal solve views respect score visibility
- teams ranking/score displays also respect score visibility

### CTFd-Whale container challenges

The frontend supports **Whale / dynamic container challenges**.

- Detects container-capable challenge types from CTFd challenge metadata
- Checks current container status
- Spawns challenge containers
- Renews active containers
- Stops active containers
- Displays returned access info (URL or command)

## Production Build

```bash
npm run build
```

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
- Archive mode displays static event data from JSON files

## Contact

The theme includes a public contact page for the creator:

- route: `/angel`
- Discord ID: `angel.911`

## Repository Goal

Provide a polished Ramadhan-themed frontend for CTFd with modern UX while staying compatible with real CTFd behavior, admin visibility settings, and container-based challenge workflows.
