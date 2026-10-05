import nodemailer from 'nodemailer'

function singleLine(value) {
  return value.replace(/[\r\n]+/g, ' ').trim()
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

// Logs in to Gmail without sending anything, so a bad setting shows up in the
// server log at startup. Never includes the password in its result.
export async function verifyMailSettings(env = process.env, transporter) {
  const missing = ['GMAIL_USER', 'GMAIL_APP_PASSWORD', 'LEADS_TO_EMAIL'].filter((name) => !env[name])
  if (missing.length) return { ok: false, reason: `Missing environment variable(s): ${missing.join(', ')}` }

  try {
    await (transporter ?? createGmailTransport(env)).verify()
    return { ok: true }
  } catch (error) {
    return { ok: false, reason: (error instanceof Error ? error.message : 'Unknown error').replace(/\s+/g, ' ').slice(0, 300) }
  }
}

export async function sendLeadEmail(lead, env = process.env, transporter) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD, LEADS_TO_EMAIL } = env
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !LEADS_TO_EMAIL) {
    throw new Error('Gmail delivery is not configured on this server.')
  }

  const text = [
    'New Vastu City Rameshwaram enquiry',
    '',
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Enquiry type: ${lead.enquiryType || 'General enquiry'}`,
    `Message: ${lead.message || 'Not provided'}`,
    `Consent: ${lead.consent}`,
    `Lead source: ${lead.leadSource || 'Website'}`,
  ].join('\n')

  await (transporter ?? createGmailTransport(env)).sendMail({
    from: `"Vastu City Website" <${GMAIL_USER}>`,
    to: LEADS_TO_EMAIL,
    replyTo: lead.email,
    subject: `Vastu City enquiry: ${singleLine(lead.name)}`,
    text,
  })
}
