import nodemailer from 'nodemailer'

function singleLine(value) {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

export function createGmailTransport({ GMAIL_USER, GMAIL_APP_PASSWORD }) {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD.replaceAll(' ', '') },
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
