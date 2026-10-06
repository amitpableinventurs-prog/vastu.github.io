import { createApp } from './app.js'
import { getSmtpTarget, verifyMailSettings } from './email.js'
import { checkOutbound } from './network-check.js'

const port = Number.parseInt(process.env.PORT || process.env.API_PORT || '', 10) || 3001
const app = createApp()

app.listen(port, () => {
  console.log(`Website and lead API listening on port ${port}`)

  verifyMailSettings().then((result) => {
    if (!result.ok) {
      console.log(`Mail check: NOT working, enquiries will fail. Reason: ${result.reason}`)
    } else if (result.provider === 'resend') {
      console.log('Mail check: using Resend over HTTPS. The first enquiry confirms delivery.')
    } else {
      const target = getSmtpTarget()
      console.log(`Mail check (${target.host}:${target.port}): login OK, enquiries will be emailed.`)
    }
  })

  checkOutbound().then((results) => console.log(`Network check: ${results.join(' | ')}`))
})
