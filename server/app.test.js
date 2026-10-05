import assert from 'node:assert/strict'
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
