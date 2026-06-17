# DanyByte Profile

Personal profile site for Daniel (DanyByte), built with TanStack Start, React, Vite,
and Tailwind CSS.

## Requirements

- Node.js 20 LTS or newer
- npm 10 or newer

This project is set up for npm. `package-lock.json` is the lockfile used for
local installs and GitHub Actions.

## Run Locally

```bash
npm install
npm run dev
```

This repo includes a project `.npmrc` that uses the official npm registry, so a
slow or incomplete global npm mirror will not block installs.

On Windows PowerShell, if `npm install` fails with `running scripts is disabled on this
system`, run npm through the command shim:

```powershell
npm.cmd install
npm.cmd run dev
```

Or allow local scripts for your Windows user:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Useful Scripts

```bash
npm run build
npm run build:pages
npm run preview
npm run preview:pages
npm run lint
npm run format
```

## GitHub Pages

GitHub Pages is static-only, so the Pages build uses `feeds.json` instead of
server functions. Run this before publishing:

```bash
npm run build:pages
```

The GitHub Actions workflow in `.github/workflows/pages.yml` refreshes
`public/feeds.json`, builds `dist-pages`, and deploys it to Pages. It also runs
on a schedule so Monitoring can stay fresh without a backend server.
