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
serving the live site.

On start the server logs one `Mail check (host:port)` line saying whether Gmail
accepted the login, or why not. GoDaddy has been seen blocking outbound port 465
(`connect EACCES ...:465`); if so, set `SMTP_PORT=587` and redeploy. If 587 is also
blocked, SMTP cannot work from that host and an HTTPS email API is needed.

## Brochure download

Every "Download brochure" button opens the enquiry form first. After the form is
submitted the server returns a signed link that is valid for 15 minutes, and the
browser downloads the PDF from `/api/brochure?t=...`. The PDF is kept at
`server/private/vastu-city-rameshwaram-brochure.pdf`, outside `public/` and
`dist/`, so there is no public URL for it. To publish a new brochure, replace that
file (keep the name) and redeploy.

If the lead email fails, a visitor can still download the brochure and the lead
is written to the server log (`Brochure lead NOT emailed, recorded here instead`)
so it is not lost. Plain enquiries still show an error when email fails.

Links are signed with a random key created at startup, so links issued before a
restart stop working. Set `BROCHURE_SECRET` to any long random string to keep
them valid across restarts or when running more than one instance.

## Email delivery with Resend (recommended on GoDaddy)

GoDaddy blocks outbound SMTP (`connect EACCES ...:465`), so Gmail passwords cannot
work there. Resend sends over HTTPS (port 443), which is not blocked.

1. Sign up at <https://resend.com> **with the same address as `LEADS_TO_EMAIL`**
   (for example `happymoveritika898@gmail.com`). Without a verified domain, Resend only
   delivers to the account's own address.
2. Open **API Keys**, create a key with "Sending access" and copy it (`re_...`).
3. In the GoDaddy app settings add `RESEND_API_KEY` with that value, keep
   `LEADS_TO_EMAIL`, and redeploy. Locally, put the same line in `.env.local`.
4. Check **Logs**: you should see `Mail check: using Resend over HTTPS.` and a
   `Network check:` line listing which outbound ports are open.

To send to any address or from your own domain, verify `vastucityrameshwaram.com`
in Resend and set `MAIL_FROM`, for example `Vastu City <leads@vastucityrameshwaram.com>`.

When `RESEND_API_KEY` is set it is used instead of Gmail. If an enquiry still cannot
be emailed, the server log contains `Lead NOT emailed, recorded here instead:` followed
by the lead's details, so nothing is lost.

## Gmail configuration (fallback, needs outbound SMTP)

Copy `.env.example` to `.env.local` for local development, or set these values
in the GoDaddy Node.js app environment for production:

```env
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
LEADS_TO_EMAIL=happymoveritika898@gmail.com
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
