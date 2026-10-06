import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, test } from 'node:test'
import { createApp } from './app.js'

let server
let baseUrl
let deliveredLead

const validSubmission = {
  name: 'Test Visitor',
  phone: '+91 98765 43210',
  email: 'visitor@example.com',
  consent: 'Agreed to be contacted',
  lead_source: 'Hero enquiry form',
  enquiry_type: 'Pricing and availability',
  message: 'Please share details.',
}

beforeEach(async () => {
  deliveredLead = undefined
  server = createApp({
    env: { FRONTEND_ORIGINS: 'https://vastucityrameshwaram.com' },
    deliverLead: async (lead) => {
      deliveredLead = lead
    },
  }).listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

afterEach(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })
})

test('health endpoint reports the app is running', async () => {
  const response = await fetch(`${baseUrl}/health`)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { status: 'ok' })
})

test('serves the production website build', async () => {
  const response = await fetch(baseUrl)
  assert.equal(response.status, 200)
  assert.match(await response.text(), /Vastu City Rameshwaram/)
})

test('accepts valid leads from the configured site origin', async () => {
  const response = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: {
      Origin: 'https://vastucityrameshwaram.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validSubmission),
  })

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { success: true })
  assert.equal(deliveredLead.email, validSubmission.email)
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://vastucityrameshwaram.com')
})

test('rejects submissions from unconfigured origins', async () => {
  const response = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: {
      Origin: 'https://malicious.example',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validSubmission),
  })

  assert.equal(response.status, 403)
  assert.equal(deliveredLead, undefined)
})

test('rejects invalid lead details before email delivery', async () => {
  const response = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...validSubmission, phone: '123' }),
  })

  assert.equal(response.status, 400)
  assert.equal(deliveredLead, undefined)
})

test('reports missing Gmail configuration without claiming the lead was sent', async () => {
  const unconfiguredServer = createApp({ env: {} }).listen(0, '127.0.0.1')
  await new Promise((resolve) => unconfiguredServer.once('listening', resolve))

  try {
    const response = await fetch(`http://127.0.0.1:${unconfiguredServer.address().port}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validSubmission),
    })

    assert.equal(response.status, 503)
    assert.deepEqual(await response.json(), {
      success: false,
      error: 'Email delivery is not configured yet. Please try again later.',
    })
  } finally {
    await new Promise((resolve, reject) => {
      unconfiguredServer.close((error) => error ? reject(error) : resolve())
    })
  }
})

async function withApp(options, run) {
  const brochureServer = createApp(options).listen(0, '127.0.0.1')
  await new Promise((resolve) => brochureServer.once('listening', resolve))
  try {
    await run(`http://127.0.0.1:${brochureServer.address().port}`)
  } finally {
    await new Promise((resolve, reject) => {
      brochureServer.close((error) => error ? reject(error) : resolve())
    })
  }
}

const postLead = (url, body) => fetch(`${url}/api/leads`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

test('does not offer a brochure link for ordinary enquiries', async () => {
  const response = await postLead(baseUrl, validSubmission)
  assert.deepEqual(await response.json(), { success: true })
})

test('a brochure request returns a link that downloads the PDF as an attachment', async () => {
  const response = await postLead(baseUrl, { ...validSubmission, want_brochure: 'yes' })
  const { success, downloadUrl } = await response.json()

  assert.equal(success, true)
  assert.match(downloadUrl, /^\/api\/brochure\?t=\d+\./)
  assert.equal(deliveredLead.wantsBrochure, true)

  const download = await fetch(`${baseUrl}${downloadUrl}`)
  assert.equal(download.status, 200)
  assert.equal(download.headers.get('content-type'), 'application/pdf')
  assert.match(download.headers.get('content-disposition'), /attachment; filename="vastu-city-rameshwaram-brochure\.pdf"/)
  assert.equal(download.headers.get('cache-control'), 'no-store')
  assert.equal(Buffer.from(await download.arrayBuffer()).subarray(0, 5).toString(), '%PDF-')
})

test('the brochure cannot be fetched without a valid link', async () => {
  const secret = 'test-secret'
  await withApp({ env: { BROCHURE_SECRET: secret }, deliverLead: async () => {} }, async (url) => {
    const now = Date.now()
    const sign = (issued) => `${issued}.${createHmac('sha256', secret).update(String(issued)).digest('base64url')}`
    const attempts = {
      'no token': '',
      'garbage': '?t=abc',
      'tampered signature': `?t=${sign(now).slice(0, -2)}xx`,
      'signed with another secret': `?t=${now}.${createHmac('sha256', 'other').update(String(now)).digest('base64url')}`,
      'expired link': `?t=${sign(now - 16 * 60 * 1000)}`,
    }
    for (const [label, query] of Object.entries(attempts)) {
      const response = await fetch(`${url}/api/brochure${query}`)
      assert.equal(response.status, 403, label)
      assert.notEqual(response.headers.get('content-type'), 'application/pdf', label)
    }
    const valid = await fetch(`${url}/api/brochure?t=${sign(now)}`)
    assert.equal(valid.status, 200)
    await valid.arrayBuffer()
  })
})

test('a mail outage still lets a visitor download the brochure but not a plain enquiry', async () => {
  const logged = []
  const originalError = console.error
  console.error = (...args) => logged.push(args.join(' '))
  try {
    await withApp({ env: {}, deliverLead: async () => { throw new Error('connect EACCES') } }, async (url) => {
      const brochure = await postLead(url, { ...validSubmission, want_brochure: 'yes' })
      assert.equal(brochure.status, 200)
      assert.match((await brochure.json()).downloadUrl, /^\/api\/brochure\?t=/)

      const enquiry = await postLead(url, validSubmission)
      assert.equal(enquiry.status, 502)
    })
  } finally {
    console.error = originalError
  }
  // Both leads (the brochure one and the plain enquiry) are kept in the log for recovery.
  assert.equal(logged.filter((line) => line.includes('Lead NOT emailed') && line.includes(validSubmission.email)).length, 2)
})

test('the brochure PDF is not reachable at a public URL', async () => {
  for (const path of ['/vastu-city-rameshwaram-brochure.pdf', '/server/private/vastu-city-rameshwaram-brochure.pdf']) {
    const response = await fetch(`${baseUrl}${path}`)
    assert.notEqual(response.headers.get('content-type'), 'application/pdf', path)
  }
})
