import { randomBytes } from 'node:crypto'
import { createServer } from 'node:http'

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
const redirectUri = 'http://localhost:3000/oauth2callback'
const scope = 'https://www.googleapis.com/auth/gmail.send'

if (!clientId || !clientSecret || clientId === 'your_client_id' || clientSecret === 'your_client_secret') {
  throw new Error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local first.')
}

const state = randomBytes(32).toString('hex')
const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
authorizationUrl.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope,
  access_type: 'offline',
  prompt: 'consent',
  state,
}).toString()

let handlingCallback = false

const server = createServer(async (request, response) => {
  const callbackUrl = new URL(request.url ?? '/', redirectUri)
  if (request.method !== 'GET' || callbackUrl.pathname !== '/oauth2callback') {
    response.writeHead(404).end('Not found')
    return
  }
  if (handlingCallback) {
    response.writeHead(409).end('Authorization is already being processed.')
    return
  }
  if (callbackUrl.searchParams.get('state') !== state) {
    response.writeHead(400).end('Invalid OAuth state. Run the helper again.')
    return
  }

  handlingCallback = true
  const authorizationError = callbackUrl.searchParams.get('error')
  const code = callbackUrl.searchParams.get('code')

  if (authorizationError) {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
      .end(`Google authorization failed: ${authorizationError}. You can close this tab.`)
    server.close()
    console.error(`Google authorization failed: ${authorizationError}`)
    process.exitCode = 1
    return
  }
  if (!code) {
    response.writeHead(400).end('Google did not return an authorization code.')
    server.close()
    console.error('Google did not return an authorization code.')
    process.exitCode = 1
    return
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    const tokenResult = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(`Google token exchange failed (${tokenResponse.status}): ${JSON.stringify(tokenResult)}`)
    }
    if (!tokenResult.refresh_token) {
      throw new Error('Google did not return a refresh token. Revoke this app’s Google Account access, then run the helper again.')
    }

    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
      .end('Authorization complete. Check the terminal for the refresh token, then close this tab.')
    console.log('\nGOOGLE_REFRESH_TOKEN=' + tokenResult.refresh_token)
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      .end('Token exchange failed. Check the terminal output.')
    console.error(error)
    process.exitCode = 1
  } finally {
    server.close()
  }
})

server.on('error', (error) => {
  console.error(`Could not start the local OAuth callback server: ${error.message}`)
  process.exitCode = 1
})

server.listen(3000, 'localhost', () => {
  console.log('Open this URL and grant Gmail send access:\n')
  console.log(authorizationUrl.toString())
  console.log('\nWaiting for Google OAuth callback on 127.0.0.1:3000...')
})
