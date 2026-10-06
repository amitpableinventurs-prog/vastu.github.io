import nodemailer from 'nodemailer'

const notConfiguredMessage = 'Email delivery is not configured on this server.'

function singleLine(value) {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

// Resend (HTTPS, port 443) is preferred: GoDaddy blocks outbound SMTP. Gmail SMTP
// with an App Password is the fallback for machines that can reach it.
export function getMailProvider(env = process.env) {
  if (env.RESEND_API_KEY) return 'resend'
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) return 'smtp'
  return null
}

// Gmail over SSL (465) by default. Some hosts block outbound 465, so SMTP_PORT=587
// switches to STARTTLS, and SMTP_HOST points at a different SMTP server.
export function getSmtpTarget({ SMTP_HOST, SMTP_PORT } = process.env) {
  return { host: SMTP_HOST || 'smtp.gmail.com', port: Number.parseInt(SMTP_PORT, 10) || 465 }
}

export function createGmailTransport(env) {
  const { host, port } = getSmtpTarget(env)
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD.replaceAll(' ', '') },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  })
}

// Checks the SMTP login without sending anything, so a bad setting shows up in the
// server log at startup. Never includes the password in its result.
export async function verifyMailSettings(env = process.env, transporter) {
  if (!env.LEADS_TO_EMAIL) return { ok: false, reason: 'Missing environment variable: LEADS_TO_EMAIL' }

  const provider = getMailProvider(env)
  if (!provider) {
    return { ok: false, reason: 'Missing environment variable(s): set RESEND_API_KEY, or GMAIL_USER and GMAIL_APP_PASSWORD' }
  }
  // Resend has no side-effect-free check for a send-only key; the first enquiry confirms it.
  if (provider === 'resend') return { ok: true, provider }

  try {
    await (transporter ?? createGmailTransport(env)).verify()
    return { ok: true, provider }
  } catch (error) {
    return { ok: false, provider, reason: (error instanceof Error ? error.message : 'Unknown error').replace(/\s+/g, ' ').slice(0, 300) }
  }
}

function buildMessage(lead) {
  return {
    subject: `Vastu City enquiry: ${singleLine(lead.name)}`,
    text: [
      'New Vastu City Rameshwaram enquiry',
      '',
      `Name: ${lead.name}`,
      `Phone: ${lead.phone}`,
      `Email: ${lead.email}`,
      ...(lead.enquiryType ? [`Enquiry type: ${lead.enquiryType}`] : []),
      ...(lead.message ? [`Message: ${lead.message}`] : []),
      `Consent: ${lead.consent}`,
      `Lead source: ${lead.leadSource || 'Website'}`,
      ...(lead.wantsBrochure ? ['Brochure: downloaded after submitting this form'] : []),
    ].join('\n'),
  }
}

async function sendWithResend(lead, env, fetchImpl) {
  const response = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // onboarding@resend.dev works without DNS setup but only delivers to the Resend account's own address.
      from: env.MAIL_FROM || 'Vastu City Website <onboarding@resend.dev>',
      to: [env.LEADS_TO_EMAIL],
      reply_to: lead.email,
      ...buildMessage(lead),
    }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200)
    throw new Error(`Resend rejected the email (HTTP ${response.status}): ${detail}`)
  }
}

export async function sendLeadEmail(lead, env = process.env, transporter, fetchImpl = fetch) {
  const provider = getMailProvider(env)
  if (!provider || !env.LEADS_TO_EMAIL) throw new Error(notConfiguredMessage)

  if (provider === 'resend') return sendWithResend(lead, env, fetchImpl)

  await (transporter ?? createGmailTransport(env)).sendMail({
    from: `"Vastu City Website" <${env.GMAIL_USER}>`,
    to: env.LEADS_TO_EMAIL,
    replyTo: lead.email,
    ...buildMessage(lead),
  })
}
