# Ramadan CTF Frontend

This repository contains the **frontend application for the Ramadan CTF** event. It was developed by the Engineers Spark team at ISETcom using React and Vite. The UI showcases landing, challenges, scoreboard, teams, and profile pages styled with Tailwind CSS and animated components.

The app is intended to be a drop‑in CTFd theme; all visual logic lives client‑side. When deployed it communicates with a CTFd backend (or any compatible API) to fetch real data.

## Features

- Responsive SPA built with [Vite](https://vitejs.dev/) and React
- Elegant Ramadan‑themed styling and animated backgrounds
- Pages for challenges, scoreboard, teams, profile, and auth
- No runtime dependencies on custom module aliases – plain relative imports

## Local development

```bash
npm install
npm run dev      # start dev server at http://localhost:5173
```

## Production build

```bash
npm run build     # output generated in `dist/`
```

## Docker support

A `Dockerfile` is included so the project can be built and served in a container. This ensures everyone on the team uses the same Node version and build tooling, avoiding "it works on my machine" issues.

Build the image and run it:

```bash
docker build -t ramadhan-ctf-frontend .
# on Linux/Mac
docker run --rm -p 8080:80 ramadhan-ctf-frontend
# on Windows PowerShell
docker run --rm -p 8080:80 ramadhan-ctf-frontend
```

Open http://localhost:8080 to view the production bundle. The container uses multi‑stage build: first stage compiles with Node, second stage serves the static files with nginx.

## Notes for collaboration

- All assets live in `src/assets`; import them with relative paths.
- Avoid introducing new aliases or nonstandard loaders – keep the build simple.
- The router uses `react-router-dom` to handle navigation.

Feel free to customize the theme, add pages, or integrate with your CTF backend. Happy hacking!"}
