# React + Vite

## GoDaddy Node.js app and Gmail leads

The Node.js app serves both the built website and the `/api/leads` endpoint.
The API sends enquiries through the Gmail API; OAuth secrets stay on the
server. GitHub Pages cannot run this backend.

### Local development

1. Copy `.env.example` to `.env.local` and set the Google OAuth values described
   below.
2. Run `npm run server:dev` in one terminal.
3. Run `npm run dev` in another terminal and open the Vite URL. Vite proxies
   `/api` requests to the local Node server.

### Deploy on GoDaddy

1. In GoDaddy's Node.js app setup, use the project root as the application root,
   choose Node.js 22.12 or newer, and set the startup file to `app.js`.
2. In the app's terminal/application environment, install dependencies and
   build the website with `npm ci` and `npm run build`.
3. Add the environment variables listed below in the Node.js app settings.
   Set `FRONTEND_ORIGINS` to the exact public site origin, for example
   `https://vastucityrameshwaram.com` (include `https://www.vastucityrameshwaram.com`
   too only if the site is served from that origin).
4. Restart the Node.js app. Its `/health` endpoint should return `{"status":"ok"}`;
   the website and form API are served from the same domain.

Do not deploy `.env.local` or put OAuth values in frontend build variables.
Keep the GitHub Pages workflow disabled for the production domain if GoDaddy is
serving the live site.

## Google/Gmail configuration

Copy `.env.example` to `.env.local` for local development, or set these values
in the GoDaddy Node.js app environment for production:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_SENDER_EMAIL=your_google_account@gmail.com
LEADS_TO_EMAIL=reethappymove19@gmail.com
FRONTEND_ORIGINS=https://vastucityrameshwaram.com
```

`GOOGLE_SENDER_EMAIL` must be the Gmail account that granted the Gmail send
scope and issued the refresh token. `LEADS_TO_EMAIL` is the inbox that receives
enquiries. Keep all Google credentials server-side.

### Generate a Gmail refresh token locally

For a Google OAuth client of type **Web application**:

1. Enable the Gmail API in the Google Cloud project and configure the OAuth
   consent screen to request the Gmail send scope.
2. Add `http://localhost:3000/oauth2callback` as an authorized redirect URI
   for the OAuth client.
3. Copy `.env.example` to `.env.local` and put the client ID and secret in
   `.env.local` (not in `.env.example`).
4. Run `npm run oauth:refresh-token`, open the printed Google authorization
   URL, sign in, and grant access. The helper prints the refresh token in the
   terminal; add it to `.env.local` as `GOOGLE_REFRESH_TOKEN=...`.

The helper listens only on localhost and requests the Gmail send scope. Do not
put the refresh token or client secret in frontend code or commit `.env.local`.
If the Google OAuth consent screen is in **Testing** mode, refresh tokens for
Gmail scopes can expire after seven days; publish the consent screen or use an
appropriate production OAuth setup before relying on ongoing delivery.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
