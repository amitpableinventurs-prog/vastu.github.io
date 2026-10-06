import assert from 'node:assert/strict'
import { test } from 'node:test'
import nodemailer from 'nodemailer'
import { createGmailTransport, getMailProvider, getSmtpTarget, sendLeadEmail, verifyMailSettings } from './email.js'

const lead = {
  name: 'Test Visitor',
  phone: '+91 98765 43210',
  email: 'visitor@example.com',
  consent: 'Agreed to be contacted',
  leadSource: 'Request a callback',
  enquiryType: 'Book a site visit',
  message: 'Please call after 5pm.',
}

const env = { GMAIL_USER: 'sender@gmail.com', GMAIL_APP_PASSWORD: 'abcd efgh ijkl mnop', LEADS_TO_EMAIL: 'leads@example.com' }

test('emails the lead details to the leads inbox with the visitor as reply-to', async () => {
  const transporter = nodemailer.createTransport({ jsonTransport: true })
  let sent
  const originalSendMail = transporter.sendMail.bind(transporter)
  transporter.sendMail = async (message) => {
    sent = JSON.parse((await originalSendMail(message)).message)
  }

  await sendLeadEmail(lead, env, transporter)

  assert.equal(sent.to[0].address, 'leads@example.com')
  assert.equal(sent.from.address, 'sender@gmail.com')
  assert.equal(sent.replyTo[0].address, 'visitor@example.com')
  assert.equal(sent.subject, 'Vastu City enquiry: Test Visitor')
  assert.match(sent.text, /Phone: \+91 98765 43210/)
  assert.match(sent.text, /Enquiry type: Book a site visit/)
  assert.match(sent.text, /Message: Please call after 5pm\./)
})

test('keeps line breaks in a name out of the subject header', async () => {
  const transporter = nodemailer.createTransport({ jsonTransport: true })
  let subject
  const originalSendMail = transporter.sendMail.bind(transporter)
  transporter.sendMail = async (message) => {
    subject = message.subject
    await originalSendMail(message)
  }

  await sendLeadEmail({ ...lead, name: 'Eve\r\nBcc: attacker@example.com' }, env, transporter)

  assert.equal(subject, 'Vastu City enquiry: Eve Bcc: attacker@example.com')
})

test('reports a clear error when Gmail settings are missing', async () => {
  await assert.rejects(
    sendLeadEmail(lead, { LEADS_TO_EMAIL: 'leads@example.com' }),
    /not configured on this server/,
  )
})

test('startup check reports missing settings by name without contacting Gmail', async () => {
  const result = await verifyMailSettings({ LEADS_TO_EMAIL: 'leads@example.com' })
  assert.equal(result.ok, false)
  assert.match(result.reason, /RESEND_API_KEY, or GMAIL_USER and GMAIL_APP_PASSWORD/)
})

test('startup check reports Gmail login failures without exposing the password', async () => {
  const failing = { verify: async () => { throw new Error('Invalid login: 535-5.7.8 Username and\nPassword not accepted') } }
  const result = await verifyMailSettings(env, failing)
  assert.equal(result.ok, false)
  assert.match(result.reason, /535-5\.7\.8 Username and Password not accepted/)
  assert.doesNotMatch(result.reason, /abcd|efgh|ijkl|mnop/)
})

test('startup check passes when Gmail accepts the login', async () => {
  assert.deepEqual(await verifyMailSettings(env, { verify: async () => true }), { ok: true, provider: 'smtp' })
})

test('uses Gmail over SSL on port 465 unless told otherwise', () => {
  assert.deepEqual(getSmtpTarget({}), { host: 'smtp.gmail.com', port: 465 })
  const { options } = createGmailTransport(env).transporter
  assert.equal(options.port, 465)
  assert.equal(options.secure, true)
})

test('SMTP_PORT=587 switches to STARTTLS and SMTP_HOST changes the server', () => {
  assert.deepEqual(getSmtpTarget({ SMTP_PORT: '587' }), { host: 'smtp.gmail.com', port: 587 })
  const { options } = createGmailTransport({ ...env, SMTP_PORT: '587', SMTP_HOST: 'mail.example.com' }).transporter
  assert.equal(options.host, 'mail.example.com')
  assert.equal(options.port, 587)
  assert.equal(options.secure, false)
  assert.equal(options.requireTLS, true)
})

const resendEnv = { RESEND_API_KEY: 're_test_key', LEADS_TO_EMAIL: 'leads@example.com' }

function fakeResend(status = 200, body = '{"id":"abc"}') {
  const calls = []
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, payload: JSON.parse(init.body) })
    return new Response(body, { status })
  }
  return { calls, fetchImpl }
}

test('Resend is used when an API key is set, even if Gmail settings exist too', () => {
  assert.equal(getMailProvider(resendEnv), 'resend')
  assert.equal(getMailProvider({ ...env, ...resendEnv }), 'resend')
  assert.equal(getMailProvider(env), 'smtp')
  assert.equal(getMailProvider({}), null)
})

test('sends the enquiry through the Resend HTTPS API with the visitor as reply-to', async () => {
  const { calls, fetchImpl } = fakeResend()
  await sendLeadEmail({ ...lead, wantsBrochure: true }, resendEnv, undefined, fetchImpl)

  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://api.resend.com/emails')
  assert.equal(calls[0].init.method, 'POST')
  assert.equal(calls[0].init.headers.Authorization, 'Bearer re_test_key')
  assert.deepEqual(calls[0].payload.to, ['leads@example.com'])
  assert.equal(calls[0].payload.reply_to, 'visitor@example.com')
  assert.match(calls[0].payload.from, /onboarding@resend\.dev/)
  assert.equal(calls[0].payload.subject, 'Vastu City enquiry: Test Visitor')
  assert.match(calls[0].payload.text, /Phone: \+91 98765 43210/)
  assert.match(calls[0].payload.text, /Brochure: downloaded/)
})

test('MAIL_FROM overrides the Resend sender once a domain is verified', async () => {
  const { calls, fetchImpl } = fakeResend()
  await sendLeadEmail(lead, { ...resendEnv, MAIL_FROM: 'Vastu City <leads@vastucityrameshwaram.com>' }, undefined, fetchImpl)
  assert.equal(calls[0].payload.from, 'Vastu City <leads@vastucityrameshwaram.com>')
})

test('a Resend rejection becomes an error that names the status but never the key', async () => {
  const { fetchImpl } = fakeResend(403, '{"name":"validation_error","message":"You can only send testing emails to your own email address"}')
  await assert.rejects(
    sendLeadEmail(lead, resendEnv, undefined, fetchImpl),
    (error) => /HTTP 403/.test(error.message) && /own email address/.test(error.message) && !error.message.includes('re_test_key'),
  )
})

test('Resend needs a recipient and reports a missing one as not configured', async () => {
  await assert.rejects(sendLeadEmail(lead, { RESEND_API_KEY: 're_x' }), /not configured on this server/)
})

test('startup check accepts a Resend key without calling any API', async () => {
  assert.deepEqual(await verifyMailSettings(resendEnv), { ok: true, provider: 'resend' })
})
