import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { sendLeadEmail } from './email.js'

const defaultOrigins = ['https://vastucityrameshwaram.com', 'http://localhost:5173']

// The brochure lives outside dist/ so it can only be fetched with a signed,
// short-lived link that /api/leads hands out after the form is submitted.
const brochureFile = fileURLToPath(new URL('./private/vastu-city-rameshwaram-brochure.pdf', import.meta.url))
const brochureLinkLifetimeMs = 15 * 60 * 1000

function signBrochureToken(secret, issuedAt = Date.now()) {
  const issued = String(issuedAt)
  return `${issued}.${createHmac('sha256', secret).update(issued).digest('base64url')}`
}

function isValidBrochureToken(secret, token, now = Date.now()) {
  if (typeof token !== 'string') return false
  const [issued, signature, extra] = token.split('.')
  if (extra !== undefined || !signature || !/^\d{10,16}$/.test(issued)) return false
  const age = now - Number(issued)
  if (age < 0 || age > brochureLinkLifetimeMs) return false
  const expected = Buffer.from(createHmac('sha256', secret).update(issued).digest('base64url'))
  const received = Buffer.from(signature)
  return received.length === expected.length && timingSafeEqual(received, expected)
}

function getAllowedOrigins(env) {
  const configuredOrigins = env.FRONTEND_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  return new Set(configuredOrigins?.length ? configuredOrigins : defaultOrigins)
}

function validateLead(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Please submit valid enquiry details.' }
  }

  const requiredFields = ['name', 'phone', 'email', 'consent']
  const optionalFields = ['lead_source', 'enquiry_type', 'message', 'want_brochure']
  if (requiredFields.some((field) => typeof body[field] !== 'string')
    || optionalFields.some((field) => body[field] !== undefined && typeof body[field] !== 'string')) {
    return { error: 'Please complete the required enquiry fields.' }
  }

  const lead = {
    name: body.name.trim(),
    phone: body.phone.trim(),
    email: body.email.trim(),
    consent: body.consent.trim(),
    leadSource: (body.lead_source ?? '').trim(),
    enquiryType: (body.enquiry_type ?? '').trim(),
    message: (body.message ?? '').trim(),
    wantsBrochure: body.want_brochure === 'yes',
  }

  if (lead.name.length < 2 || lead.name.length > 100) {
    return { error: 'Enter a name between 2 and 100 characters.' }
  }
  if (!/^\+?[0-9()\s-]{10,20}$/.test(lead.phone) || lead.phone.replace(/\D/g, '').length < 10) {
    return { error: 'Enter a valid phone number.' }
  }
  if (lead.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return { error: 'Enter a valid email address.' }
  }
  if (lead.consent !== 'Agreed to be contacted') {
    return { error: 'Please agree to be contacted about this enquiry.' }
  }
  if (lead.leadSource.length > 100 || lead.enquiryType.length > 80 || lead.message.length > 2000) {
    return { error: 'Some enquiry details are too long.' }
  }

  return { lead }
}

export function createApp({ env = process.env, deliverLead = sendLeadEmail } = {}) {
  const app = express()
  const allowedOrigins = getAllowedOrigins(env)
  const brochureSecret = env.BROCHURE_SECRET || randomBytes(32).toString('hex')

  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use('/api', (request, response, next) => {
    const origin = request.get('Origin')
    if (origin && !allowedOrigins.has(origin)) {
      return response.status(403).json({ success: false, error: 'This website is not allowed to submit enquiries.' })
    }

    if (origin) {
      response.set('Access-Control-Allow-Origin', origin)
      response.set('Vary', 'Origin')
    }
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.set('Access-Control-Allow-Headers', 'Content-Type')

    if (request.method === 'OPTIONS') return response.sendStatus(204)
    next()
  })

  app.use('/api', express.json({ limit: '10kb' }))

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' })
  })

  app.post('/api/leads', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }), async (request, response) => {
    const validation = validateLead(request.body)
    if (validation.error) {
      return response.status(400).json({ success: false, error: validation.error })
    }

    const { lead } = validation
    try {
      await deliverLead(lead, env)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown email delivery error'
      console.error(`Lead email delivery failed: ${message.slice(0, 300)}`)
      // Keep the enquiry in the server log so a mail outage never loses it.
      console.error(`Lead NOT emailed, recorded here instead: ${JSON.stringify(lead)}`)
      if (!lead.wantsBrochure) {
        const notConfigured = message.includes('not configured on this server')
        return response.status(notConfigured ? 503 : 502).json({
          success: false,
          error: notConfigured
            ? 'Email delivery is not configured yet. Please try again later.'
            : 'We could not send your enquiry right now. Please try again later.',
        })
      }
      // A mail outage must not lock visitors out of the brochure.
    }

    const result = { success: true }
    if (lead.wantsBrochure) {
      result.downloadUrl = `/api/brochure?t=${encodeURIComponent(signBrochureToken(brochureSecret))}`
    }
    return response.status(200).json(result)
  })

  app.get('/api/brochure', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }), (request, response) => {
    if (!isValidBrochureToken(brochureSecret, request.query.t)) {
      return response.status(403).json({ success: false, error: 'This download link has expired. Please request the brochure again.' })
    }
    response.set('Cache-Control', 'no-store')
    response.download(brochureFile, 'vastu-city-rameshwaram-brochure.pdf', (error) => {
      if (error && !response.headersSent) {
        response.status(404).json({ success: false, error: 'The brochure is not available right now.' })
      }
    })
  })

  app.use('/api', (_request, response) => {
    response.status(404).json({ success: false, error: 'API endpoint not found.' })
  })

  app.use(express.static('dist'))
  app.get(/.*/, (_request, response, next) => {
    response.sendFile('index.html', { root: 'dist' }, (error) => {
      if (error) next(error)
    })
  })

  app.use((error, _request, response, _next) => {
    if (error.type === 'entity.too.large') {
      return response.status(413).json({ success: false, error: 'Enquiry is too large.' })
    }
    if (error.type === 'entity.parse.failed') {
      return response.status(400).json({ success: false, error: 'Please submit valid JSON.' })
    }
    console.error('Request failed:', error instanceof Error ? error.message : 'Unknown server error')
    return response.status(500).json({ success: false, error: 'An unexpected server error occurred.' })
  })

  return app
}
