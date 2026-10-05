# Vastu City Rameshwaram

## GoDaddy Node.js app and Gmail leads

The Node.js app serves both the built website and the `/api/leads` endpoint.
Enquiries from the website forms are emailed to `LEADS_TO_EMAIL` over Gmail SMTP
using an App Password. Credentials stay on the server. GitHub Pages cannot run
this backend.

### Local development

1. Copy `.env.example` to `.env.local` and set the Gmail values described below.
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

Do not deploy `.env.local` or put the App Password in frontend build variables.
Keep the GitHub Pages workflow disabled for the production domain if GoDaddy is
serving the live site. Some shared hosting plans block outbound SMTP on port 465;
if enquiries fail only on the live server, ask GoDaddy to allow it.

## Gmail configuration

Copy `.env.example` to `.env.local` for local development, or set these values
in the GoDaddy Node.js app environment for production:

```env
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
LEADS_TO_EMAIL=reethappymove19@gmail.com
FRONTEND_ORIGINS=https://vastucityrameshwaram.com
```

`GMAIL_USER` is the Gmail account that sends the mail. `LEADS_TO_EMAIL` is the
inbox that receives enquiries (it can be the same account). Each email's
Reply-To is the visitor's address, so replying goes straight to the enquirer.

### Create a Gmail App Password

1. Turn on 2-Step Verification for the sending Google account
   (<https://myaccount.google.com/security>).
2. Open <https://myaccount.google.com/apppasswords>, create an app password
   (any name, for example "Vastu City website") and copy the 16 characters.
3. Put them in `GMAIL_APP_PASSWORD` (spaces are ignored) and restart the server.

An App Password does not expire, but anyone who has it can send mail as that
account: keep it out of git and frontend code, and revoke it from the same
Google page if it leaks.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
