import assert from 'node:assert/strict'
import { test } from 'node:test'
import nodemailer from 'nodemailer'
import { sendLeadEmail } from './email.js'

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
