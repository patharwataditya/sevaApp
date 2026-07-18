# SevaApp Admin

A local-only web dashboard (Vite + React + TypeScript) to add / edit / remove the
categories and services that power the SevaApp mobile app. It talks directly to the
serverless backend (API Gateway → Lambda → DynamoDB).

> Not meant to be hosted. Run it on your machine when you need to manage data.

## Run

```bash
cd admin
npm install
npm run dev          # opens http://localhost:5173
```

## Configuration

The app needs the **API URL** and **admin key**. Two ways to provide them:

1. **`.env.local`** (preset for local dev — gitignored):
   ```
   VITE_API_URL=https://xxxx.execute-api.us-east-1.amazonaws.com
   VITE_ADMIN_KEY=your-admin-key
   ```
   Both values come from `backend/.deploy-output.json`.

2. **In-app Settings** (⚙ button) — stored in the browser's localStorage,
   overrides the env values. Useful if you didn't set `.env.local`.

## What you can do

- **Services tab** — searchable/filterable table of all services. Create or edit
  with a full form: category, scope (National or a specific state/UT), description,
  department, one or more phone numbers, official apps (Play/App Store + website),
  website, complaint URL, search keywords, and the *Emergency* / *Women helpline*
  flags. Delete with confirmation.
- **Categories tab** — manage the home-screen categories: title, subtitle, Ionicons
  icon, colour (with live preview), display order, and emergency styling.

Changes are written straight to DynamoDB and appear in the mobile app on its next
refresh (the app also caches data locally for offline use).

## Build (optional)

```bash
npm run build        # type-checks and produces dist/ (not normally needed)
```
