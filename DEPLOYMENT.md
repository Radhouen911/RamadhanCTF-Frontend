# Deploying Ramadan CTF to CTFd

This guide explains how to deploy the Ramadan CTF frontend to a running CTFd instance.

## Prerequisites

- A CTFd instance running (version 3.5.0 or later)
- Node.js 18+
- npm or yarn

## Build for Production

First, build the React app. This will:

1. Compile the React code with Vite
2. Hash the asset filenames for cache-busting
3. Automatically sync those filenames to the Jinja template

```bash
npm run build
```

This creates a `static/` directory with:

- `static/index.html` – The main HTML entry point
- `static/assets/` – JavaScript, CSS, and other assets with hashed names
- `static/manifest.json` – PWA manifest

## Deploy to CTFd

CTFd loads themes from the `CTFd/themes/` directory. Make sure your theme directory matches the name in `__init__.py` (currently `Ramadhan`).

### Option 1: Copy the entire theme folder

```bash
# From your CTFd root directory
cp -r /path/to/ramadhan-ctf-frontend CTFd/themes/Ramadhan
```

### Option 2: Symlink for development

```bash
ln -s /path/to/ramadhan-ctf-frontend CTFd/themes/Ramadhan
```

## Configure CTFd

1. Start or restart CTFd:

```bash
python manage.py serve
# or with gunicorn
gunicorn "CTFd.wsgi:app"
```

2. Go to the CTFd admin panel (`/admin`).

3. Under **Settings > Appearance**, set the **Theme** to **Ramadhan**.

4. Save and refresh. The React app should now load at the root path.

## How it works

The `__init__.py` file creates a Flask blueprint that intercepts all user-facing routes (`/`, `/challenges`, `/scoreboard`, etc.) and serves the React `index.html`. This allows React Router to handle all navigation client-side without CTFd interfering.

The `sync-template.js` script runs after every build to update the hashed asset filenames in `templates/base.html`, so CTFd can reference the correct JS/CSS files.

## Troubleshooting

**Issue: Blank page or 404**

- Check that the `static/` folder exists and contains `index.html`
- Ensure CTFd can read the theme folder (check permissions)
- Open DevTools to see if there are JS errors or failed resource loads

**Issue: CSS/JS not loading**

- Run `npm run build` again to regenerate hashes
- Check that `/themes/Ramadhan/static/assets/` exists with hashed files
- Look at the `templates/base.html` to verify the filenames match

**Issue: Routes work but styling is broken**

- The `assetsInclude` in `vite.config.ts` may need adjustment
- Ensure Tailwind CSS is building correctly
- Check the browser DevTools for CSS file load errors

## Development without CTFd

You can still develop and test locally without CTFd:

```bash
npm run dev
```

This starts a Vite dev server at `http://localhost:5173` with hot module reloading.

## Docker Deployment

For team collaboration, use Docker:

```bash
docker build -t ramadhan-ctf-frontend .
docker run --rm -p 8080:80 ramadhan-ctf-frontend
```

This uses the built `static/` directory and serves it with nginx.
