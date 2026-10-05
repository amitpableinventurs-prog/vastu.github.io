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
  })
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
