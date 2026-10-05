import { createApp } from './app.js'
import { verifyMailSettings } from './email.js'

const port = Number.parseInt(process.env.PORT || process.env.API_PORT || '', 10) || 3001
const app = createApp()

app.listen(port, () => {
  console.log(`Website and lead API listening on port ${port}`)
  verifyMailSettings().then((result) => {
    console.log(result.ok
      ? 'Gmail check: login OK, enquiries will be emailed.'
      : `Gmail check: NOT working, enquiries will fail. Reason: ${result.reason}`)
  })
})
