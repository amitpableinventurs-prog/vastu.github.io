import { google } from 'googleapis'

function encodeHeader(value) {
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`
}

function wrapBase64(value) {
  return value.match(/.{1,76}/g)?.join('\r\n') ?? ''
}

export async function sendLeadEmail(lead, env = process.env) {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_SENDER_EMAIL, LEADS_TO_EMAIL } = env
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !GOOGLE_SENDER_EMAIL || !LEADS_TO_EMAIL) {
    throw new Error('Gmail delivery is not configured on this server.')
  }

  const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
  auth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN })
  const gmail = google.gmail({ version: 'v1', auth })

  const messageText = [
    'New Vastu City Rameshwaram enquiry',
    '',
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Enquiry type: ${lead.enquiryType || 'General enquiry'}`,
    `Message: ${lead.message || 'Not provided'}`,
    `Consent: ${lead.consent}`,
    `Lead source: ${lead.leadSource || 'Website'}`,
  ].join('\r\n')
  const message = [
    `To: ${LEADS_TO_EMAIL}`,
    `From: ${GOOGLE_SENDER_EMAIL}`,
    `Reply-To: ${lead.email}`,
    `Subject: ${encodeHeader(`Vastu City enquiry: ${lead.name}`)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(Buffer.from(messageText, 'utf8').toString('base64')),
  ].join('\r\n')

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: Buffer.from(message, 'utf8').toString('base64url'),
    },
  })
}
