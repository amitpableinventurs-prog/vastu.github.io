# React + Vite

## Google/Gmail configuration

Copy `.env.example` to `.env.local` and replace the placeholder values with the
Google OAuth credentials from Google Cloud Console:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

Keep `GOOGLE_CLIENT_SECRET` server-side. This Vite frontend currently sends
enquiries through FormSubmit; Gmail delivery requires a server-side OAuth
endpoint, because a browser app must not contain the client secret.

### Generate a Gmail refresh token locally

For a Google OAuth client of type **Web application**:

1. In Google Cloud Console, add `http://localhost:3000/oauth2callback` as an
   authorized redirect URI for the OAuth client.
2. Copy `.env.example` to `.env.local` and put the client ID and secret in
   `.env.local` (not in `.env.example`).
3. Run `npm run oauth:refresh-token`, open the printed Google authorization
   URL, sign in, and grant access. The helper prints the refresh token in the
   terminal; add it to `.env.local` as `GOOGLE_REFRESH_TOKEN=...`.

The helper listens only on `127.0.0.1` and requests the Gmail send scope. Do not
put the refresh token or client secret in frontend code or commit `.env.local`.
This repository has no Gmail backend; the token must only be used by a
server-side endpoint.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
