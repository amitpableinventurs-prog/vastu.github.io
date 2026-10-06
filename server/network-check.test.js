import assert from 'node:assert/strict'
import net from 'node:net'
import { test } from 'node:test'
import { checkOutbound } from './network-check.js'

test('reports which outbound connections are open and which are refused', async () => {
  const listener = net.createServer().listen(0, '127.0.0.1')
  await new Promise((resolve) => listener.once('listening', resolve))
  const openPort = listener.address().port
  const closed = net.createServer().listen(0, '127.0.0.1')
  await new Promise((resolve) => closed.once('listening', resolve))
  const closedPort = closed.address().port
  await new Promise((resolve) => closed.close(resolve))

  try {
    const [open, refused] = await checkOutbound([
      { host: '127.0.0.1', port: openPort },
      { host: '127.0.0.1', port: closedPort },
    ], 2000)
    assert.equal(open, `127.0.0.1:${openPort} open`)
    assert.equal(refused, `127.0.0.1:${closedPort} BLOCKED (ECONNREFUSED)`)
  } finally {
    await new Promise((resolve) => listener.close(resolve))
  }
})
