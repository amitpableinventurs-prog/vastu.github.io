import { createApp } from './app.js'

const port = Number.parseInt(process.env.PORT || process.env.API_PORT || '', 10) || 3001
const app = createApp()

app.listen(port, () => {
  console.log(`Website and lead API listening on port ${port}`)
})
