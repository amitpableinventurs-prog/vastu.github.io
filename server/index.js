import { createApp } from './app.js'
import { getSmtpTarget, verifyMailSettings } from './email.js'

const port = Number.parseInt(process.env.PORT || process.env.API_PORT || '', 10) || 3001
const app = createApp()

app.listen(port, () => {
  console.log(`Website and lead API listening on port ${port}`)
  const target = getSmtpTarget()
  verifyMailSettings().then((result) => {
    console.log(result.ok
      ? `Mail check (${target.host}:${target.port}): login OK, enquiries will be emailed.`
      : `Mail check (${target.host}:${target.port}): NOT working, enquiries will fail. Reason: ${result.reason}`)
  })
})
